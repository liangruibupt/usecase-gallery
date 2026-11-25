# R-240X Electric Linear Actuator — Operating and Installation Manual (excerpt)

> Excerpt of a 60-page manual. Original page numbers are kept; each page starts with "[Page N]". Pages not included in the excerpt are omitted. Product, company and all figures are fictional demo data.

[Page 1]

**R-240X Electric Linear Actuator**
Operating and Installation Manual
Document No. HA-OM-240X-EN, Revision 3.1, September 2026

Halvorsen Antriebstechnik GmbH
Industriestraße 18, 70565 Stuttgart, Germany
www.halvorsen-antriebe.example

[Page 2]

**About this manual**

This manual applies to all R-240X actuators with serial numbers from 24X-26-0001 onwards. Read this manual completely before installing, commissioning or servicing the actuator. Keep this manual in the vicinity of the actuator so that it is available to operating personnel at all times.

The original language of this manual is German. This English version is a translation of the original instructions.

[Table 1-1: Document revision history — position marker]

[Page 3]

**1 Safety instructions**

1.1 Intended use

The R-240X is an electromechanical linear actuator designed for pushing and pulling loads in industrial machinery, such as dampers, hatches, adjustable conveyors and positioning tables. The actuator is intended for installation in a machine by qualified personnel only. Any other use, or any use beyond this, is considered improper use. The manufacturer accepts no liability for damage resulting from improper use.

1.2 Qualified personnel

Installation, electrical connection, commissioning and maintenance must only be carried out by qualified personnel who are familiar with the installation, assembly, commissioning and operation of the product and who have the qualifications required for their activities.

> **WARNING** — Risk of crushing. The push rod moves with high force. Never reach into the travel range of the push rod while the actuator is connected to the power supply.

[Page 8]

**2 Technical data**

[Table 2-1: Technical data R-240X — position marker]

| Parameter | Value |
|---|---|
| Model | R-240X |
| Nominal voltage | 400 V AC, 3-phase, 50 Hz |
| Rated motor power | 0.37 kW |
| Motor speed | 2,850 min⁻¹ |
| Maximum stroke | 240 mm |
| Rated thrust (push/pull) | 6,000 N |
| Travel speed at rated load | 12 mm/s |
| Duty cycle | S3 40 % (10 min reference cycle) |
| Degree of protection | IP54 |
| Ambient temperature | −20 °C to +60 °C |
| Weight | 14.8 kg |

[Page 9]

2.1 Duty cycle

The duty cycle indicates the ratio of operating time to the total cycle time. With a duty cycle of S3 40 %, the actuator may run for a maximum of 4 minutes within any 10-minute period. Exceeding the permitted duty cycle causes the motor to overheat and will trigger the thermal protection switch.

2.2 Degree of protection

The degree of protection IP54 means that the actuator is protected against dust in harmful quantities and against splashing water from any direction. IP54 does not protect against water jets or immersion. For outdoor installation, a protective cover is required.

[Figure 2-1: Dimension drawing — position marker]

[Page 12]

**3 Transport and storage**

3.1 Transport

Transport the actuator in its original packaging. Do not lift the actuator by the push rod or by the motor cable. The push rod must be fully retracted during transport.

3.2 Storage

Store the actuator in a dry, dust-free room at a temperature between −10 °C and +40 °C. If the actuator is stored for longer than 12 months, the push rod must be extended and retracted over the full stroke at least once before commissioning, in order to redistribute the grease in the spindle.

[Page 14]

**4 Electrical connection**

4.1 Supply voltage

Connect the actuator to a 380 V AC 3-phase supply only. Check that the supply voltage matches the nominal voltage on the rating plate before connecting. Operation with an incorrect supply voltage may damage the motor and voids the warranty.

4.2 Motor protection

Protect the motor with a motor protection switch set to the rated current of 1.0 A. The thermal protection switch in the motor winding (normally closed contact, terminals T1/T2) must be integrated into the control circuit so that the motor is switched off when the switch opens.

[Figure 4-1: Wiring diagram — position marker]

[Page 17]

4.4 Limit switches

The actuator is equipped with two integrated limit switches that switch off the motor at the end positions of the stroke. The limit switches are factory-set to the maximum stroke of 240 mm. If a shorter stroke is required, the limit switches can be readjusted as described in section 6.3. Never use the mechanical end stop as a working position; this will overload the spindle nut.

[Page 22]

**5 Installation**

5.1 Mounting position

The actuator can be installed in any mounting position. If the actuator is installed vertically with the push rod pointing upwards, make sure that no liquid can enter along the push rod. Side loads on the push rod must be avoided. Use the supplied clevis mountings at both ends so that the actuator can follow the movement of the load without lateral forces.

[Page 25]

5.3 Tightening torques

[Table 5-1: Tightening torques — position marker]

| Connection | Thread | Tightening torque |
|---|---|---|
| Rear clevis bolt | M12 | 45 Nm |
| Push rod end fitting | M16 × 1.5 | 80 Nm |
| Terminal box cover | M4 | 1.5 Nm |

Secure the push rod end fitting with a thread-locking compound of medium strength. After tightening, check that the push rod can still rotate freely by hand before the load is attached.

[Page 28]

5.6 Cable entry

Use cable glands with a degree of protection of at least IP54 for the cable entry. Unused cable entries must be closed with blind plugs. Lay the motor cable so that it cannot be damaged by moving parts of the machine and so that water cannot run into the terminal box along the cable.

[Page 31]

**6 Commissioning**

6.1 Checks before first switch-on

Before switching on for the first time, check that the actuator is securely mounted, that the electrical connection has been made in accordance with the wiring diagram and that the travel range of the push rod is free of obstacles and persons. Check the direction of rotation in jog mode: when the "extend" command is given, the push rod must extend. If the push rod retracts, swap two phases of the supply.

[Page 34]

6.4 Operation at high ambient temperatures

The rated thrust and duty cycle values apply to an ambient temperature of up to 40 °C. The actuator must be derated above 40 °C: for every 5 K above 40 °C, reduce the permissible thrust by 10 % or reduce the duty cycle accordingly. Above 60 °C, the actuator must not be operated.

The values given in this section are guide values; they may need to be adjusted where the actuator is installed close to heat sources.

[Page 37]

6.6 Manual override

In the event of a power failure, the push rod can be moved by hand using the manual override. Remove the cover on the motor end and turn the hex shaft (SW 8) with a suitable wrench. One revolution corresponds to 4 mm of stroke. The manual override must only be used when the supply voltage is disconnected and secured against reconnection.

[Page 42]

**7 Maintenance**

7.1 Maintenance intervals

[Table 7-1: Maintenance intervals — position marker]

| Interval | Task |
|---|---|
| Every 3 months | Visual inspection of push rod, seals and cable |
| Every 12 months or 50,000 double strokes | Check limit switch function, check tightening torques |
| Every 3 years | Replace the push rod seal |

7.2 Lubrication

The spindle is lubricated for life at the factory. Relubrication is not required under normal operating conditions. Do not use compressed air to clean the push rod, as this can force dirt past the push rod seal.

[Page 45]

7.4 Replacing the push rod seal

Fully retract the push rod and disconnect the actuator from the power supply. Remove the four screws of the front flange and pull off the flange together with the old seal. Clean the push rod and the seal seat. Fit the new seal with the sealing lip facing outwards, coat the push rod lightly with the specified grease and refit the flange. The seal kit has the order number HA-240-SK.

[Page 48]

**8 Troubleshooting**

[Table 8-1: Fault table — position marker]

| Fault | Possible cause | Remedy |
|---|---|---|
| Actuator does not move | No supply voltage; thermal protection switch has tripped | Check the supply; allow the motor to cool down and check the duty cycle |
| Push rod moves in the wrong direction | Phase sequence incorrect | Swap two phases |
| Actuator stops before end position | Limit switch incorrectly set; load too high | Readjust the limit switch; check the load against the rated thrust |
| Unusual noise | Side load on the push rod; spindle damaged | Check the mounting; contact the service department |

[Page 53]

**9 Spare parts and service**

9.1 Spare parts

Use only original spare parts from Halvorsen Antriebstechnik GmbH. The use of non-original parts can impair the safety of the actuator and voids the warranty. When ordering spare parts, always state the model, the serial number and the order number of the part.

9.2 Service contact

For technical questions, please contact our service department. Your contact person is Mr. Jonas Weber, Head of Technical Service, telephone +49 711 555 0240, e-mail service@halvorsen-antriebe.example.

[Page 56]

**10 Ordering information and delivery**

10.1 Delivery time

The standard delivery time for the R-240X in the standard configuration is 4 weeks from receipt of the written order. For special strokes or special voltages, the delivery time is 8 weeks. The delivery time for spare parts from stock is 5 working days. Express delivery is available on request and at extra charge.

10.2 Distributor in China

Orders from China are handled by our authorized distributor, Shanghai Hengtong Industrial Automation Co., Ltd., which also provides local stock and after-sales service.

[Page 60]

**11 Declaration of incorporation**

The R-240X is partly completed machinery within the meaning of the Machinery Directive 2006/42/EC. It must not be put into service until the machine into which it is to be incorporated has been declared in conformity with the provisions of the Machinery Directive.

Stuttgart, 15 September 2026
Dr. Katrin Halvorsen, Managing Director
