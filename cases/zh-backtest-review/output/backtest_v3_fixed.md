# backtest_v3_fixed.py：小盘价值动量 V3 修正版回测脚本

> - 复核人**没有运行**这份脚本，脚本里也没有任何回测结果。所有结果需要研究员在本地运行后得到。
> - 数据文件路径和字段名是假设的，需要按本地数据库调整，见下方"数据需求"。
> - 本脚本只用于复核，不构成投资建议。

## 一、相对原脚本的修改（对应问题清单编号）

| 问题编号 | 原脚本行号 | 修改 |
|---|---|---|
| 1 | 10–12 | 使用中证1000历史成分进出表，按信号日判断是否为成分股；行情包含已退市股票 |
| 2、3 | 14–19 | 财务数据从公告日后第 1 个交易日起才可用，只用首次披露值；PB 改为调仓日总市值 ÷ 最新已披露归母净资产（用 BP） |
| 4 | 31 | 剔除净资产 ≤ 0 的股票 |
| 5 | 20 | ROE 在报告期层面计算同期同比 |
| 6、7 | 12、21–22 | 删除所有回填；从 2017-06 开始加载数据作为回看期；因子缺失即剔除，并记录覆盖率 |
| 8 | 27–28、48–49 | 调仓日取每月最后一个交易日；按日计算净值，年化按自然日折算 |
| 9 | 41–42 | d 日收盘后出信号，d+1 日开盘成交 |
| 10 | 42 | 按持股份额记账；停牌按最后价格估值；退市时清算并记录 |
| 11 | 39–42 | 剔除 ST、停牌、上市不满 365 天、已退市的股票；成交日开盘涨停不加仓（按排名顺延），开盘跌停或停牌不减仓 |
| 12、13 | 6、43–44 | 佣金、分段印花税、多档冲击/滑点情景；按实际成交额计算换手；设参与率上限 |
| 14 | 47–50 | 日频夏普、最大回撤、回撤起止和修复日期、年度超额、分段统计 |

## 二、数据需求（字段名为假设）

所有宽表的索引为交易日，列为股票代码，覆盖**全部 A 股，包括已退市股票**，起始日期不晚于 2017-06-01。

- `daily_close_hfq` / `daily_open_hfq`：后复权收盘价和开盘价
- `daily_open_raw`、`daily_up_limit`、`daily_down_limit`：不复权开盘价、涨停价、跌停价
- `daily_amount`：成交额（元）；`daily_total_mv`：总市值（元）
- `daily_suspended`：停牌标记（布尔）；`daily_is_st`：ST 或 *ST 标记（布尔）
- `stock_info.csv`：`code, list_date, delist_date`
- `csi1000_membership_history.csv`：`code, in_date, out_date`。`out_date` 是调出的生效日，仍在指数内的填空
- `fin_pit.parquet`：长表，字段为 `code, report_period, ann_date, equity_parent, roe`
  - `ann_date` 为首次公告日
  - `roe` 的口径要统一（单季、累计或 TTM 选一种）
  - 如果同一报告期有多个版本，保留最早公告的那一版
- `csi1000_index_daily.csv`：`date, close`，建议使用全收益指数

## 三、脚本

```python
# -*- coding: utf-8 -*-
"""
backtest_v3_fixed.py —— 小盘价值动量 V3 修正版回测（复核用）
信号：每月最后一个交易日 d 收盘后计算；成交：d 的下一交易日开盘
数据路径与字段名为假设，需按本地数据库调整
"""
import os
import numpy as np
import pandas as pd

# ================= 0. 参数 =================
START, END = pd.Timestamp("2019-01-01"), pd.Timestamp("2025-12-31")
LOOKBACK_START = pd.Timestamp("2017-06-01")   # 预留动量 / ROE 同比所需历史，避免期初 NaN
TOP_N = 50
W_BP, W_MOM, W_ROE = 0.4, 0.4, 0.2            # 第27组参数（全样本调出，需样本外验证）
MOM_LONG, MOM_SKIP = 252, 21                  # 12-1 月动量（交易日）
CAPITAL = 5e8

COMMISSION = 0.00025                          # 单边佣金+规费，待按实际费率确认
STAMP_SWITCH = pd.Timestamp("2023-08-28")     # 卖出印花税减半生效日
STAMP_BEFORE, STAMP_AFTER = 0.001, 0.0005
SLIPPAGE_GRID = [0.0, 0.0005, 0.0010, 0.0020, 0.0030]   # 单边冲击+滑点情景
BASE_SLIPPAGE = 0.0010                        # 输出明细所用的基准情景（假设值，需校准）

MAX_PARTICIPATION = 0.10    # 单只单次成交额 <= 信号日前20日均成交额 × 该比例
MIN_LIST_DAYS = 365         # 上市满365个自然日
MAX_FIN_AGE_MONTHS = 15     # 最新可得报告期距信号日超过15个月视为缺失
DELIST_HAIRCUT = 0.0        # 退市清算折价（待按实际处理口径设定；清单会输出供人工核对）
RF_ANNUAL = 0.0             # 无风险利率，待团队统一
SPLIT_DATE = pd.Timestamp("2023-12-31")   # 仅分段展示；参数已在全样本调过，后段不是真正样本外
OUT_DIR = "output"

# ================= 1. 数据 =================
def load_wide(path):
    df = pd.read_parquet(path)
    df.index = pd.to_datetime(df.index)
    df.columns = df.columns.astype(str)
    return df.sort_index().loc[LOOKBACK_START:END]

close_adj = load_wide("data/daily_close_hfq.parquet")      # 全A（含已退市）后复权收盘
tdays, codes = close_adj.index, close_adj.columns

def aligned(path):
    return load_wide(path).reindex(index=tdays, columns=codes)

open_adj   = aligned("data/daily_open_hfq.parquet")
open_raw   = aligned("data/daily_open_raw.parquet")
up_limit   = aligned("data/daily_up_limit.parquet")
down_limit = aligned("data/daily_down_limit.parquet")
amount     = aligned("data/daily_amount.parquet")           # 元
total_mv   = aligned("data/daily_total_mv.parquet")         # 元
suspended  = aligned("data/daily_suspended.parquet").fillna(True).astype(bool)   # 缺失按不可交易处理
is_st      = aligned("data/daily_is_st.parquet").fillna(False).astype(bool)

info = (pd.read_csv("data/stock_info.csv", dtype={"code": str},
                    parse_dates=["list_date", "delist_date"])
          .set_index("code").reindex(codes))

cons = pd.read_csv("data/csi1000_membership_history.csv", dtype={"code": str},
                   parse_dates=["in_date", "out_date"])

fin = pd.read_parquet("data/fin_pit.parquet")
fin["code"] = fin["code"].astype(str)
fin["report_period"] = pd.to_datetime(fin["report_period"])
fin["ann_date"] = pd.to_datetime(fin["ann_date"])
fin = (fin.dropna(subset=["ann_date"])
          .sort_values("ann_date")
          .drop_duplicates(["code", "report_period"], keep="first"))   # 只用首次披露值

bench = (pd.read_csv("data/csi1000_index_daily.csv", parse_dates=["date"])
           .set_index("date")["close"].sort_index())

# ================= 2. 财务数据时点化（公告日后第1个交易日起可用） =================
pos = np.searchsorted(tdays.values, fin["ann_date"].values, side="right")
keep = pos < len(tdays)
fin = fin.loc[keep].copy()
fin["avail_date"] = tdays[pos[keep]].values

# ROE 同期同比：本期 - 上年同一报告期（上年值也用首次披露值）
prev = fin[["code", "report_period", "roe"]].copy()
prev["report_period"] = prev["report_period"] + pd.DateOffset(years=1)
prev = prev.rename(columns={"roe": "roe_prev"})
fin = fin.merge(prev, on=["code", "report_period"], how="left")
fin["roe_yoy"] = fin["roe"] - fin["roe_prev"]
fin = fin.sort_values(["report_period", "avail_date"])

def fin_asof(d):
    """信号日 d 收盘时可得的最新报告期数据（每只股票一行）"""
    sub = fin[fin["avail_date"] <= d]
    last = sub.groupby("code").tail(1).set_index("code")
    last = last[last["report_period"] >= d - pd.DateOffset(months=MAX_FIN_AGE_MONTHS)]
    return last.reindex(codes)

# ================= 3. 价格类变量（只用 d 及以前的数据） =================
px_ff = close_adj.ffill()                        # 估值用：停牌按最后价格
px_prev = px_ff.shift(1)
mom = px_ff.shift(MOM_SKIP) / px_ff.shift(MOM_LONG) - 1
adv20 = amount.rolling(20, min_periods=10).mean()

# ================= 4. 调仓日历 =================
month_last = pd.Series(tdays, index=tdays).groupby(tdays.to_period("M")).max()
first_sig = tdays[tdays < START].max()           # 2018 年最后一个交易日，次日（2019首个交易日）建仓
sig_dates = [d for d in month_last if first_sig <= d <= END]
schedule = {}                                     # 成交日 -> 信号日
for d in sig_dates:
    j = tdays.get_loc(d) + 1
    if j < len(tdays) and tdays[j] <= END:
        schedule[tdays[j]] = d
print(f"信号期数 {len(schedule)}（应约为 84）")

# ================= 5. 股票池与打分 =================
dl_date = info["delist_date"]

def eligible(d):
    mem = cons[(cons["in_date"] <= d) &
               (cons["out_date"].isna() | (cons["out_date"] > d))]["code"]
    ok = pd.Series(codes.isin(mem), index=codes)
    ok &= ((d - info["list_date"]).dt.days >= MIN_LIST_DAYS).fillna(False)
    ok &= (dl_date.isna() | (dl_date > d))
    ok &= ~is_st.loc[d] & ~suspended.loc[d] & close_adj.loc[d].notna()
    return ok

def score(d):
    ok = eligible(d)
    f = fin_asof(d)
    eq = f["equity_parent"]
    bp = (eq / total_mv.loc[d]).where(eq > 0)     # 剔除净资产<=0
    df = pd.DataFrame({"bp": bp, "mom": mom.loc[d], "roe_yoy": f["roe_yoy"]})
    df = df.loc[ok[ok].index].dropna()            # 不回填，缺失即剔除
    r = df.rank(pct=True)
    s = (W_BP * r["bp"] + W_MOM * r["mom"] + W_ROE * r["roe_yoy"]).sort_values(ascending=False)
    return s, int(ok.sum()), len(df)

signals = {d: score(d) for d in schedule.values()}

# ================= 6. 交易模拟（份额记账） =================
def stamp_rate(t):
    return STAMP_BEFORE if t < STAMP_SWITCH else STAMP_AFTER

def run(slippage, top_n=TOP_N):
    shares = pd.Series(0.0, index=codes)
    cash = CAPITAL
    nav_rec, logs, delist_log = {}, [], []
    days = tdays[(tdays >= min(schedule)) & (tdays <= END)]

    for t in days:
        if t in schedule:
            d = schedule[t]
            ranked, n_elig, n_valid = signals[d]
            p = open_adj.loc[t].fillna(px_prev.loc[t])          # 成交/估值价（后复权）
            o = open_raw.loc[t]
            susp = suspended.loc[t]
            buyable = ~susp & o.notna() & (o < up_limit.loc[t] - 1e-6)
            sellable = ~susp & o.notna() & (o > down_limit.loc[t] + 1e-6)

            held = set(shares.index[shares > 0])
            target = []
            for c in ranked.index:                               # 买不进的新股票按排名顺延
                if c in held or buyable[c]:
                    target.append(c)
                if len(target) == top_n:
                    break

            pre_nav = cash + (shares * p).fillna(0.0).sum()
            tgt = pd.Series(0.0, index=codes)
            tgt[target] = pre_nav / top_n / p[target]
            delta = (tgt - shares).fillna(0.0)
            delta[(delta > 0) & ~buyable] = 0.0                 # 涨停/停牌不加仓
            delta[(delta < 0) & ~sellable] = 0.0                # 跌停/停牌不减仓

            # 参与率上限（用信号日及以前的20日均成交额）
            trade_val = (delta.abs() * p).fillna(0.0)
            cap = MAX_PARTICIPATION * adv20.loc[d]
            ratio = (cap / trade_val).clip(upper=1.0).where(trade_val > 0, 1.0).fillna(0.0)
            n_capped = int(((ratio < 1) & (trade_val > 0)).sum())
            delta = delta * ratio

            sell_d = delta.clip(upper=0.0)
            sell_val = float((-sell_d * p).fillna(0.0).sum())
            sell_cost = sell_val * (COMMISSION + slippage + stamp_rate(t))
            cash += sell_val - sell_cost

            buy_d = delta.clip(lower=0.0)
            buy_val = float((buy_d * p).fillna(0.0).sum())
            unit = 1.0 + COMMISSION + slippage
            if buy_val > 0 and buy_val * unit > cash:
                scale = max(cash, 0.0) / (buy_val * unit)
                buy_d = buy_d * scale
                buy_val *= scale
            buy_cost = buy_val * (COMMISSION + slippage)
            cash -= buy_val + buy_cost
            shares = shares + sell_d + buy_d

            traded = trade_val * ratio
            part = (traded / adv20.loc[d]).where(traded > 0).dropna()
            post_mv = (shares * p).fillna(0.0).sum()
            logs.append({
                "信号日": d, "成交日": t,
                "成分且可选股票数": n_elig, "因子齐全股票数": n_valid,
                "目标持仓数": len(target),
                "实际持仓数": int((shares > 0).sum()),
                "调仓前净值": pre_nav,
                "买入额": buy_val, "卖出额": sell_val,
                "成本": buy_cost + sell_cost,
                "双边换手": (buy_val + sell_val) / pre_nav,
                "被参与率限量股票数": n_capped,
                "参与率中位数": float(part.median()) if len(part) else np.nan,
                "参与率最大值": float(part.max()) if len(part) else np.nan,
                "现金占比": cash / (cash + post_mv),
            })

        # 退市清算（按最后价格 × (1 - 折价)）
        gone = shares.index[(shares > 0) & dl_date.notna() & (dl_date <= t)]
        if len(gone):
            val = float((shares[gone] * px_ff.loc[t, gone]).fillna(0.0).sum()) * (1 - DELIST_HAIRCUT)
            cash += val
            delist_log.append({"日期": t, "代码": ";".join(gone), "清算金额": val})
            shares[gone] = 0.0

        nav_rec[t] = cash + (shares * px_ff.loc[t]).fillna(0.0).sum()

    nav = pd.concat([pd.Series({first_sig: 1.0}), pd.Series(nav_rec) / CAPITAL])
    return nav, pd.DataFrame(logs), pd.DataFrame(delist_log)

# ================= 7. 指标 =================
def bench_nav(index):
    b = bench.reindex(bench.index.union(index)).ffill().reindex(index)
    return b / b.iloc[0]

def perf(nav):
    nav = nav / nav.iloc[0]
    r = nav.pct_change().dropna()
    years = (nav.index[-1] - nav.index[0]).days / 365.25
    ann = nav.iloc[-1] ** (1 / years) - 1
    sharpe = (r.mean() - RF_ANNUAL / 252) / r.std() * np.sqrt(252)
    dd = nav / nav.cummax() - 1
    trough = dd.idxmin()
    peak = nav.loc[:trough].idxmax()
    after = nav.loc[trough:]
    rec = after[after >= nav.loc[peak]]
    return {"年化收益": ann, "年化波动": r.std() * np.sqrt(252), "夏普": sharpe,
            "最大回撤": dd.min(), "回撤开始": peak, "回撤谷底": trough,
            "修复日期": rec.index[0] if len(rec) else pd.NaT}

def annual_table(nav, bnav, logs):
    ys = nav.groupby(nav.index.year).last()
    yb = bnav.groupby(bnav.index.year).last()
    out = pd.DataFrame({"策略年收益(%)": ys.pct_change() * 100,
                        "基准年收益(%)": yb.pct_change() * 100}).dropna()
    out["超额(百分点)"] = out["策略年收益(%)"] - out["基准年收益(%)"]
    lg = logs.copy()
    lg["年"] = pd.to_datetime(lg["成交日"]).dt.year
    g = lg.groupby("年")
    out["年双边换手(倍)"] = g["双边换手"].sum()
    out["成本占调仓前净值(百分点)"] = g.apply(lambda x: (x["成本"] / x["调仓前净值"]).sum() * 100)
    out["参与率中位数(%)"] = g["参与率中位数"].median() * 100
    out["被限量股票数合计"] = g["被参与率限量股票数"].sum()
    mdd = {}
    for y in out.index:
        sub = nav[(nav.index.year == y) | (nav.index == nav[nav.index.year < y].index.max())]
        mdd[y] = (sub / sub.cummax() - 1).min() * 100
    out["当年最大回撤(%)"] = pd.Series(mdd)
    out.index.name = "年份"
    return out

# ================= 8. 主程序 =================
if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    rows = []
    for slip in SLIPPAGE_GRID:
        nav, logs, delist_log = run(slip)
        bnav = bench_nav(nav.index)
        ps, pb = perf(nav), perf(bnav)
        rows.append({"单边滑点": slip,
                     "单边综合成本_买入": COMMISSION + slip,
                     "年化收益": ps["年化收益"], "基准年化": pb["年化收益"],
                     "年化超额": ps["年化收益"] - pb["年化收益"],
                     "夏普": ps["夏普"], "最大回撤": ps["最大回撤"],
                     "平均年双边换手": logs["双边换手"].sum() /
                                      ((nav.index[-1] - nav.index[0]).days / 365.25)})
        if slip == BASE_SLIPPAGE:
            nav.to_frame("策略净值").assign(基准净值=bnav).to_csv(
                f"{OUT_DIR}/nav_daily.csv", encoding="utf-8-sig")
            logs.to_csv(f"{OUT_DIR}/rebalance_log.csv", index=False, encoding="utf-8-sig")
            delist_log.to_csv(f"{OUT_DIR}/delist_log.csv", index=False, encoding="utf-8-sig")
            annual_table(nav, bnav, logs).to_csv(f"{OUT_DIR}/annual_summary.csv", encoding="utf-8-sig")
            seg = []
            for name, part in [("前段", nav.loc[:SPLIT_DATE]), ("后段", nav.loc[SPLIT_DATE:])]:
                bp_ = bench_nav(part.index)
                s_, b_ = perf(part), perf(bp_)
                seg.append({"区间": name, **s_, "基准年化": b_["年化收益"]})
            pd.DataFrame(seg).to_csv(f"{OUT_DIR}/segment_perf.csv", index=False, encoding="utf-8-sig")
            print("基准情景：", {k: v for k, v in ps.items()})
            print("目标持仓数不足的期数：", int((logs["目标持仓数"] < TOP_N).sum()),
                  " 退市清算次数：", len(delist_log))

    cs = pd.DataFrame(rows)
    # 年化超额降到零时的临界单边滑点（在情景网格上线性插值；不跨零则为空）
    x, y = cs["单边滑点"].values, cs["年化超额"].values
    be = np.nan
    for i in range(len(x) - 1):
        if y[i] > 0 >= y[i + 1]:
            be = x[i] + (x[i + 1] - x[i]) * y[i] / (y[i] - y[i + 1])
    cs["临界单边滑点_插值"] = be
    cs.to_csv(f"{OUT_DIR}/cost_sensitivity.csv", index=False, encoding="utf-8-sig")
    print(cs)
```

## 四、运行后要看的输出

1. **信号期数**：应该约为 84。如果明显偏少，说明交易日历有问题。
2. `rebalance_log.csv`：
   - "因子齐全股票数"是否稳定，用来检查财务数据覆盖。
   - "目标持仓数 < 50"的期数。
   - "被参与率限量股票数"和"参与率最大值"，用来判断 5 亿规模的容量。
   - 双边换手每期最多是 2，如果超过说明有错。
3. `cost_sensitivity.csv`：各成本情景下的年化超额，以及临界滑点。
4. `annual_summary.csv`、`segment_perf.csv`：年度超额和前后两段的对比。注意后段也参与过调参，不是真正的样本外。
5. `delist_log.csv`：逐条人工核对退市清算价格是否合理，必要时设置 `DELIST_HAIRCUT`。

## 五、已知局限

- **成交价格**：默认按开盘价成交。开盘集合竞价能成交的量有限，更贴近实际的做法是全天 VWAP 或分多日成交，需要分钟数据。
- **冲击成本**：用的是固定比例的情景假设，不是冲击模型，需要用实盘或模拟成交数据校准。
- **成分生效时间**：历史成分表的进出生效日要和中证指数公司的口径一致，即生效日当天是否已经是成分股，需要研究员确认。
- **ROE 口径**：单季、累计还是 TTM 要在数据层面统一，否则同期同比没有意义。
- **参数**：仍是全样本调出的第 27 组，请按复核报告第 8 节做稳健性检验和样本外检验。
