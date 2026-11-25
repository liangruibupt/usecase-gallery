# Use-Case Hub

[English](README.md) | 中文

这是一个复现已发布 AI 智能体用例的画廊。每个用例都按原文的提示词，用通用大模型重新跑一遍：默认是 Amazon Bedrock 上的 Claude，也可以通过 OpenAI API 用 GPT。

> **红线：** 本仓库绝不下载或安装 AutoClaw，也不安装任何其他厂商的智能体产品。只阅读公开的博客文章，所有输出都由模型通过 `python -m hub.run` 生成。

每个用例都保留真实输出和完整对话，可以和原文逐项对照。

在线浏览：https://liangruibupt.github.io/usecase-gallery/

## 用例列表

| # | 用例 | 标签 | 原文 | 轮次 · 输出 |
|---|---|---|---|---|
| 01 | [Design a Printable Café Menu](https://liangruibupt.github.io/usecase-gallery/#/cafe-menu) | Design, Marketing | [AutoClaw Blog](https://autoclaw.z.ai/en/blog/tutorial/autoclaw-ai-cafe-menu-design/) | 4 · 2 |
| 02 | [Draft a B2B Contract Package](https://liangruibupt.github.io/usecase-gallery/#/contract-package) | Legal, Documents | [AutoClaw Blog](https://autoclaw.z.ai/en/blog/tutorial/Draft%20a%20Contract%20with%20AutoClaw/) | 8 · 9 |
| 03 | [汇总培训考试成绩，判定谁能结业](https://liangruibupt.github.io/usecase-gallery/#/zh-training-scores) | HR, Excel, Education | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W4D/) | 2 · 9 |
| 04 | [三家报价统一口径做供应商比价](https://liangruibupt.github.io/usecase-gallery/#/zh-supplier-price-compare) | Operations, Excel, Finance | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W4C/) | 2 · 9 |
| 05 | [AI 风控辅助模式试点：12 件历史贷款案件逐件出审核建议并与人工对照](https://liangruibupt.github.io/usecase-gallery/#/zh-risk-review-pilot) | Finance, Research, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/risk-control-implementation/) | 3 · 5 |
| 06 | [复核一条量化策略回测：查口径、算成本、拆收益、出复核报告](https://liangruibupt.github.io/usecase-gallery/#/zh-backtest-review) | Finance, Research, Data | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-quant-strategy-backtest/) | 4 · 19 |
| 07 | [结合业务背景审查算力采购合同](https://liangruibupt.github.io/usecase-gallery/#/zh-contract-review) | Legal, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/how-to-review-contracts-with-autoclaw/) | 3 · 1 |
| 08 | [46 份在执行合同整理成合同台账](https://liangruibupt.github.io/usecase-gallery/#/zh-contract-ledger) | Legal, Excel, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W4B/) | 2 · 5 |
| 09 | [统计月度考勤异常，逐条对上审批](https://liangruibupt.github.io/usecase-gallery/#/zh-attendance-anomalies) | HR, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W4A/) | 2 · 9 |
| 10 | [助眠眼罩 Meta 广告测试矩阵：六种创意钩子](https://liangruibupt.github.io/usecase-gallery/#/zh-sleep-mask-ad-matrix) | Design, Marketing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-sleep-mask-ad-hooks/) | 8 · 13 |
| 11 | [小众香水 Shopify 详情页和九张商品图](https://liangruibupt.github.io/usecase-gallery/#/zh-perfume-product-page) | Design, E-commerce, Web | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-perfume-product-page/) | 11 · 12 |
| 12 | [核对仓库月末盘点差异，出调账建议](https://liangruibupt.github.io/usecase-gallery/#/zh-inventory-variance) | Operations, Excel, Finance | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3L/) | 2 · 6 |
| 13 | [冻干水果脆抖音小店主图和详情页](https://liangruibupt.github.io/usecase-gallery/#/zh-fruit-crisp-listing) | Design, E-commerce, Marketing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-product-images-detail-page/) | 6 · 11 |
| 14 | [排客服组整月值班表](https://liangruibupt.github.io/usecase-gallery/#/zh-duty-roster) | Operations, Excel, HR | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3K/) | 3 · 7 |
| 15 | [把品牌规范落到七类接触点：Low Tide 自然酒吧](https://liangruibupt.github.io/usecase-gallery/#/zh-brand-rollout) | Design, Web, Marketing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-brand-identity-rollout/) | 8 · 7 |
| 16 | [按名单批量生成答谢会邀请函](https://liangruibupt.github.io/usecase-gallery/#/zh-batch-invitations) | Operations, Documents, Data | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3N/) | 5 · 91 |
| 17 | [核对银行流水与应收台账，出核销建议](https://liangruibupt.github.io/usecase-gallery/#/zh-bank-receivables) | Finance, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3M/) | 5 · 7 |
| 18 | [统计群接龙报名：合并去重、分班候补、打码导出](https://liangruibupt.github.io/usecase-gallery/#/zh-signup-tally) | Operations, Excel, Data, Education | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3J/) | 4 · 16 |
| 19 | [自动贴标机三档配置报价单](https://liangruibupt.github.io/usecase-gallery/#/zh-equipment-quotation) | Sales, Documents, Finance | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3I/) | 3 · 5 |
| 20 | [跑鞋户外广告提案：三个创意方向 × 三种版位](https://liangruibupt.github.io/usecase-gallery/#/zh-running-shoe-ooh) | Design, Marketing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-running-shoe-outdoor-ads/) | 12 · 10 |
| 21 | [冻干咖啡投放素材：五个创意方向 × 三个渠道尺寸](https://liangruibupt.github.io/usecase-gallery/#/zh-coffee-ad-creatives) | Design, Marketing, E-commerce | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-ad-creatives/) | 12 · 16 |
| 22 | [速读上市公司年报：两页要点报告，数字带页码](https://liangruibupt.github.io/usecase-gallery/#/zh-annual-report-speed-read) | Finance, Research, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3F/) | 3 · 1 |
| 23 | [采集网页表格到 Excel：预览核对、来源随行、更新重跑](https://liangruibupt.github.io/usecase-gallery/#/zh-web-table-excel) | Data, Excel, Research | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3C/) | 3 · 3 |
| 24 | [翻译英文产品手册：术语锁定、分批交付、数字核对](https://liangruibupt.github.io/usecase-gallery/#/zh-manual-translation) | Translation, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3D/) | 8 · 9 |
| 25 | [安排跨部门评审会：比对空闲、写邀请、处理改期](https://liangruibupt.github.io/usecase-gallery/#/zh-meeting-scheduling) | Project Management, Operations, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3A/) | 3 · 8 |
| 26 | [出差回来清收件箱：87 封邮件分拣、起草回复、定收件规则](https://liangruibupt.github.io/usecase-gallery/#/zh-email-triage) | Operations, Writing, Sales | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W3B/) | 3 · 3 |
| 27 | [把 120 条客服答疑记录整理成 FAQ 初稿](https://liangruibupt.github.io/usecase-gallery/#/zh-qa-to-faq) | Operations, Writing, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2R/) | 3 · 4 |
| 28 | [把销售群聊天记录整理成 28 家客户跟进台账](https://liangruibupt.github.io/usecase-gallery/#/zh-customer-ledger) | Sales, Excel, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2Q/) | 3 · 5 |
| 29 | [核对月度报销：46 笔逐笔对照发票和预算](https://liangruibupt.github.io/usecase-gallery/#/zh-expense-check) | Finance, Excel, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/%E5%A6%82%E4%BD%95%E7%94%A8%20AutoClaw%20%E6%A0%B8%E5%AF%B9%E6%9C%88%E5%BA%A6%E6%8A%A5%E9%94%80%EF%BC%9A%E8%B4%A2%E5%8A%A1%E4%B8%93%E5%91%98%E5%AE%9E%E6%88%98/) | 3 · 7 |
| 30 | [排出下个月三个渠道的内容排期表](https://liangruibupt.github.io/usecase-gallery/#/zh-content-calendar) | Marketing, Project Management, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2P/) | 3 · 2 |
| 31 | [多步任务按标准交付与验收：一周工作周报](https://liangruibupt.github.io/usecase-gallery/#/zh-task-acceptance) | Writing, Project Management, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2I/) | 4 · 3 |
| 32 | [问卷数据分析：清洗对账、频数与交叉、开放题编码、分级结论报告](https://liangruibupt.github.io/usecase-gallery/#/zh-survey-analysis) | Data, Research, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W1E/) | 7 · 16 |
| 33 | [季度总结：从 13 篇周报到目标对账和三层提炼](https://liangruibupt.github.io/usecase-gallery/#/zh-quarterly-summary) | Documents, Project Management, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W1F/) | 3 · 4 |
| 34 | [活动报名落地页：周末咖啡漫游](https://liangruibupt.github.io/usecase-gallery/#/zh-event-landing-page) | Web, Design, Marketing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-event-landing-page/) | 4 · 3 |
| 35 | [不写代码做一个报销合计网页小工具](https://liangruibupt.github.io/usecase-gallery/#/zh-web-mini-tool) | Web, Finance, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2F/) | 4 · 2 |
| 36 | [散落资料整理成报告：清单、登记卡、口径核对](https://liangruibupt.github.io/usecase-gallery/#/zh-scattered-material-report) | Research, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2G/) | 4 · 4 |
| 37 | [公众号 Markdown 排版工具：左贴稿、右看手机效果](https://liangruibupt.github.io/usecase-gallery/#/zh-wechat-markdown-tool) | Web, Design, Marketing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-wechat-markdown-tool/) | 2 · 1 |
| 38 | [一稿多发：借爆款结构改写成三个平台版本](https://liangruibupt.github.io/usecase-gallery/#/zh-multi-platform-rewrite) | Marketing, Writing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2E/) | 3 · 7 |
| 39 | [分段写长报告：总纲、术语表、章节约束、跨章校对四个锚点](https://liangruibupt.github.io/usecase-gallery/#/zh-long-report-anchors) | Writing, Research, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2D/) | 7 · 7 |
| 40 | [团队任务管理工具的可交互原型](https://liangruibupt.github.io/usecase-gallery/#/zh-interactive-prototype) | Web, Design, Project Management | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/autoclaw-interactive-prototype/) | 4 · 3 |
| 41 | [按岗位要求改简历：一句话改写 vs 三条边界规则](https://liangruibupt.github.io/usecase-gallery/#/zh-resume-tailoring) | HR, Writing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2B/) | 3 · 4 |
| 42 | [AI 改 PPT 不整份重做：分层下达修改清单](https://liangruibupt.github.io/usecase-gallery/#/zh-ppt-layered-revision) | Presentation, Writing, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W2/) | 3 · 2 |
| 43 | [项目复盘：目标基线、结果对账、原因分析、下一步行动](https://liangruibupt.github.io/usecase-gallery/#/zh-project-retrospective) | Project Management, Documents, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W1D/) | 2 · 2 |
| 44 | [会议记录整理：从转写稿到行动项清单](https://liangruibupt.github.io/usecase-gallery/#/zh-meeting-minutes) | Documents, Project Management, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W1C/) | 2 · 2 |
| 45 | [根据 PPT 页面内容写逐页讲稿](https://liangruibupt.github.io/usecase-gallery/#/zh-ppt-speaker-notes) | Presentation, Writing | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/M11W1B/) | 1 · 1 |
| 46 | [AI 调研结果怎么核验：会议工具选型的“生成 + 复核”两轮](https://liangruibupt.github.io/usecase-gallery/#/zh-research-verification) | Research, Documents, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/how-to-verify-ai-research-results/) | 2 · 4 |
| 47 | [可拆解的 3D 相机镜头交互网页](https://liangruibupt.github.io/usecase-gallery/#/zh-3d-lens-webpage) | 3D, Web, Education | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-generate-interactive-3d-model-webpage/) | 2 · 1 |
| 48 | [两个 Word 版本逐条对比：差异表、变化摘要和复核记录](https://liangruibupt.github.io/usecase-gallery/#/zh-word-version-compare) | Documents, Excel, HR | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/compare-word-documents-with-autoclaw/) | 2 · 3 |
| 49 | [把 2D 网络海报变成可操作的 3D 可视化网页](https://liangruibupt.github.io/usecase-gallery/#/zh-network-poster-3d) | 3D, Web, Data, Design | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-generate-interactive-3d-webpage/) | 2 · 1 |
| 50 | [室内设计工作室作品集式介绍稿](https://liangruibupt.github.io/usecase-gallery/#/zh-interior-studio-deck) | Presentation, Design | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/c5f316b8-962b-45df-b09f-cc774e697646/) | 8 · 11 |
| 51 | [护肤品牌营销单页](https://liangruibupt.github.io/usecase-gallery/#/zh-brand-website) | Web, Design, Marketing, E-commerce | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-generate-brand-website/) | 2 · 1 |
| 52 | [六周官网改版：项目计划书、排期表和风险清单](https://liangruibupt.github.io/usecase-gallery/#/zh-project-plan) | Project Management, Documents, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/how-to-write-project-plan-with-autoclaw/) | 2 · 5 |
| 53 | [单文件 HTML 跑酷小游戏 Puffy Cat](https://liangruibupt.github.io/usecase-gallery/#/zh-html-web-game) | Game, Web, Design | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-generate-html-web-game/) | 2 · 1 |
| 54 | [活动策划方案：预算、四周排期和执行清单](https://liangruibupt.github.io/usecase-gallery/#/zh-event-plan) | Marketing, Operations, Project Management, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-event-planning-with-autoclaw/) | 4 · 10 |
| 55 | [10 份用户访谈整理成证据表、需求清单和研究报告](https://liangruibupt.github.io/usecase-gallery/#/zh-user-interview-analysis) | Research, Documents, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/analyze-user-interviews-with-autoclaw/) | 9 · 4 |
| 56 | [PDF 表格转 Excel：跨页、多级表头、水印噪声与合计复核](https://liangruibupt.github.io/usecase-gallery/#/zh-pdf-table-excel) | Data, Excel, Finance, Documents | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/pdf-table-to-excel/) | 4 · 12 |
| 57 | [混杂的网页、PDF 和 Word 资料整理成可复用资料库](https://liangruibupt.github.io/usecase-gallery/#/zh-research-library) | Research, Documents, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-batch-organize-research-materials/) | 2 · 5 |
| 58 | [从会议纪要和工作日志生成项目周报与行动清单](https://liangruibupt.github.io/usecase-gallery/#/zh-project-weekly-report) | Project Management, Documents, Excel | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/ai-generate-project-weekly-report/) | 1 · 2 |
| 59 | [合并多个 Excel：字段映射、清洗去重、核对表和分析报告](https://liangruibupt.github.io/usecase-gallery/#/zh-merge-excel) | Data, Excel, Operations | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/merge-multiple-excel-files/) | 6 · 14 |
| 60 | [把统计公报整理成 12 页可编辑 PPT，附讲稿和证据表](https://liangruibupt.github.io/usecase-gallery/#/zh-official-report-ppt) | Presentation, Research, Documents, Data | [AutoClaw 博客](https://autoclaw.z.ai/cn/blog/tutorial/official-report-to-editable-ppt/) | 3 · 5 |

共 60 个用例：2 个来自 [英文博客](https://autoclaw.z.ai/en/blog/)，58 个来自 [中文博客](https://autoclaw.z.ai/cn/blog/tutorial/)。只收录 AutoClaw 博客 **Tutorial（教程）** 分类的文章，News、Product、Model 分类不在范围内。

## 怎么看一个用例：轮次和版本

### 轮次（turns）

一个轮次就是对话里的一来一回：用户发一条消息，模型回一次。每个用例是一整段连续对话，轮次按原文的操作顺序排列。用例的轮次数由四类轮次组成：

1. **原文的提示词**，逐字照搬。常见的写法是先交代规则和数据，再提修改要求。
2. **原文里的界面操作**，写成一条明确的消息。原文用户在表单里选了选项、点了“继续”或确认了拿不准的记录，这里就把它作为一轮发出，例如 `zh-signup-tally` 的“确认拿不准的记录”。
3. **自检（Self-check）**，由本仓库的运行器添加，原文里没有。模型交付图片或网页后，运行器把它们渲染成图发回给模型，让它修正文字重叠、裁切、排版错乱等问题。在时间线上显示为 `Self-check`。
4. **拆分轮次**。单次回复的输出上限是 64k token，交付量大时拆成几轮。`contract-package` 的 9 份文件分 8 轮交付。

轮次的业务意义：

- **保留真实的工作过程。** 原文作者也不是一句话就拿到结果，而是先写清规则拿初稿，人工核对，再补规则、局部重算。保留每一步，才能和原文逐步对照。
- **体现迭代成本。** 轮次越多，人要介入的次数越多。每一轮都记录了耗时和 token 用量，可以看出一个任务要来回几次。
- **区分人和模型的分工。** 很多中文用例从“第一步”直接跳到“第三步”，因为原文的第二步是人工抽查，没有模型参与，所以不算一轮。

### 版本（v1、v2……）

版本号来自原文自己的流程：模型先交付一版，用户发现问题或业务条件变了，模型在同一段对话里出修订版。v1 是第一次交付，v2 及以后是修订结果。旧版本都保留，方便对比。

大多数修订只改受影响的部分，其余保持不变。这正是这些文章想展示的能力：补一条规则后，模型能找出受影响的记录，只重算这部分。例如：

- `zh-attendance-anomalies` V2 只给设计组 6 人改用弹性工作制。
- `zh-training-scores` V2 只重算线上直播参训的成都 8 人。
- `zh-equipment-quotation` V2 到 V4 每版只把客户的一处改动落到一档配置上。

用例页有一个 **Versions** 区块，列出每个版本、产生它的轮次、改了什么以及对应的文件。每个输出文件也标注了最后写入它的轮次，方便把版本和要求修改的提示词对上。版本信息写在 `case.json` 的可选字段 `versions` 里，构建时会检查其中列出的每个文件都存在。

文件名里的数字不一定是修订版本：

- `zh-meeting-scheduling` 的 “V2.4” 是被评审的产品版本号。
- `zh-customer-ledger`、`zh-expense-check` 和 `zh-qa-to-faq` 的文件只有 `_v1`。这是沿用原文的命名，后面“补一条规则”的那一轮直接覆盖了同名文件。
- `zh-backtest-review` 的 `_v3` 是模型给自己的报告标的版本号，不是用户要求的修订。

## 工作原理

每个用例是一个声明式文件 `cases/<slug>/case.json`：

- `source`：复现的原文（URL、分类、发布日期、原文使用的智能体配置）
- `system`：原产品工作区提供的角色设定（例如“设计”或“法务，国家为英国”）
- `turns`：按顺序排列的用户提示词，原文给出的就逐字照搬。带 `"review": true` 的轮次之后会跟一轮自检：运行器渲染文件、附上图片，让模型修正看到的问题。
- `convert`：每种交付文件要转换成什么（`.svg` → 指定像素尺寸的 `.png`，`.md` → `.docx`）
- `versions`（可选）：每个版本一条，写明版本名、组成该版本的交付文件和改动内容，显示在用例页的 Versions 区块。

运行器在一段对话里依次发送各轮提示词。模型把文件放在 `<file name="…">…</file>` 块里返回；运行器把文件存到 `cases/<slug>/output/`，做格式转换，并写出 `output/transcript.json`，记录每条提示词、回复、文件和 token 数。构建步骤把所有用例汇总成 `gallery.json`，供静态页面读取。

```
cases/<slug>/case.json ──hub.run──▶ cases/<slug>/output/{files, transcript.json} ──hub.build──▶ gallery.json ──▶ index.html
```

## 运行

依赖：Python 3.11+、`pandoc` 和 `rsvg-convert`（`brew install pandoc librsvg`），以及 macOS 自带的 `sips`（生成预览图）。

```bash
pip install -r requirements.txt

# 浏览已提交的画廊
python -m hub.build
python -m http.server 8000      # 打开 http://localhost:8000

# 重新生成一个用例（会替换 cases/<slug>/output/）
python -m hub.run cafe-menu                          # Bedrock 上的 Claude，使用你的 AWS 凭证
HUB_PROVIDER=openai python -m hub.run cafe-menu      # GPT，需要 OPENAI_API_KEY
python -m hub.build
```

| 变量 | 默认值 | 含义 |
|---|---|---|
| `HUB_PROVIDER` | `bedrock` | `bedrock` 或 `openai` |
| `HUB_MODEL` | `us.anthropic.claude-opus-5-5`（Bedrock），`gpt-5`（OpenAI） | 模型 ID |
| `HUB_MAX_TOKENS` | `64000` | 每轮输出上限。回复触到上限时运行直接失败，不会保存被截断的文件 |
| `AWS_REGION` | `us-east-1` | Bedrock 区域 |

## 添加用例

1. 按上面的字段新建 `cases/<new-slug>/case.json`。提示词从原文逐字复制；原产品界面提供的设定（工作区、国家、模式）写进 `system`；界面上的交互（例如回答澄清表单）写成明确的一轮。
2. 运行 `python -m hub.run <new-slug>`，再运行 `python -m hub.build`。
3. 提交前先在画廊里检查输出。

前几批积累的编写经验：

- 幻灯片（`.slides.md` → `.pptx`）用 pandoc 自己的 Markdown 转换：`#` 开始一个章节，`##` 开始一页，`::: notes` 块变成演讲者备注。pandoc 会把表格之后的内容挪到新的一页，所以表格要放在该页最后。
- HTML 截图用无头 Chrome 加软件 WebGL（SwiftShader），WebGL 页面也能正常渲染。截图失败会重试 3 次。
- 数据类任务在没有代码工具的情况下运行。用你自己的脚本对输入文件算一遍，核对模型的数字，并把实测准确率写进 `source.notes`。

## 说明

- 输出按模型生成的原样提交。重新运行的结果会不同。
- 合同文件是模型起草的工作草稿，当事方均为虚构，场景沿用原教程，不构成法律意见。
- 原文版权归各发布方所有。本仓库只链接原文，并复用其提示词来对比结果。
