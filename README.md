# Axe Products

| Category           | Product         | Code |
| ------------------ | --------------- | ---- |
| **Wall Frame**     | Eternal Wall    |      |
|                    | Internal Wall   |      |
|                    | Joists          |      |
| **Roof Structure** | Ceiling Panel   | CP   |
|                    | Roof Panel      | RP   |
|                    | Purlin          | RP   |
|                    | Battens         | CB   |
| **Trusses**        | Joists          |      |
| **Roof Sheet**     | Sheets          |      |
|                    | Roof Top Ridges |      |
|                    | Valley          |      |
| **Joists**         | Joists          |      |
| **Foundations**    | Floor Joists    |      |
| **Plane Sheets**   | Plane Sheet     |      |

> **Note**: Joists can be categorized independently, as well as under Trusses and Wall Frames.

# Theme Forked:

https://github.com/withinpixels/fuse-angular

Convert weight in kgs to meters:

Meters = weight in kgs / conversionRate

# Conversion Rates Table

## If Width = 925 mm

| Gauge (mm) | Conversion Rate |
| ---------- | --------------- |
| 0.25       | 1.836           |
| 0.27       | 1.983           |
| 0.30       | 2.204           |
| 0.40       | 2.974           |
| 0.47       | 3.494           |
| 0.50       | 3.718           |
| 0.55       | 4.000           |
| 0.58       | 4.312           |
| 0.80       | 5.949           |

## If Width ≠ 925 mm

    gauge * 1 * 8.039

# Input Specifications

## **Roof Purlin**

- **Finishes**: `Galvanized`
- **Width**: `150 mm`
- **Gauge Options**: `0.55 mm (Preferred)` | `0.80 mm`
- **Zinc Coating**: `Z150`, `Z275`
- **Grade**: `ISQ550`

---

## **Ceiling Batten**

- **Finishes**: `Galvanized`
- **Width**: `103 mm`
- **Gauge Options**: `0.55 mm (Preferred)` | `0.80 mm`
- **Zinc Coating**: `Z150`, `Z275`
- **Grade**: `ISQ550`

---

## **Framecad Machine**

- **Finishes**: `Galvanized`
- **Width**: `182 mm`
- **Gauge Options**: `0.80 mm` | `1.00 mm (Preferred)`
- **Zinc Coating**: `Z150`, `Z275`

---

## **Double Roll Forming Machine**

- **Finishes**: `Chromadek`, `Galvanized`
- **Width**: `925 mm`
- **Profiles**:
  - **Corrugated Gauges**: `0.40 mm`, `0.50 mm`, `0.58 mm`, `0.80 mm`
  - **IBR Gauges**: `0.40 mm`, `0.50 mm`, `0.58 mm`, `0.80 mm`

To handle the batting order for which cutting lists to do first the following component was created:

# Product Type Widths

| ID  | Name            | Code | Category ID | Width |
| --- | --------------- | ---- | ----------- | ----- |
| 1   | Roof Sheet      | RS   | 1           | 925   |
| 2   | Wall Frames     | B    | 1           | 182   |
| 3   | Purlins         | P    | 1           | 150   |
| 4   | Ridges          | R    | 1           | 182   |
| 5   | Floor Joists    | FJ   | 3           | 182   |
| 6   | Trusses         | T    | 1           | 182   |
| 7   | Battens         | B    | 1           | 103   |
| 8   | Braces          | BR   | 1           | 182   |
| 9   | Roll Top Ridges | RTR  | 1           | 925   |
| 10  | Valley Gutters  | VG   | 1           | 925   |
| 11  | Roof Panels     | RP   | 1           | 182   |
| 12  | Flashing        | FH   | 1           | 925   |
| 13  | Cranked Ridges  | CR   | 1           | 182   |
| 14  | Ceiling Panels  | CP   | 1           | 182   |
| 15  | Celing Battens  | CB   | 1           | 182   |
| 16  | Roof Purlins    | RP   | 1           | 182   |
| 17  | Wall Frames     | WF   | 1           | 182   |

# STATUS

## CUTTING LISTS

    - Scheduled (default)
    - In progress
    - Not scheduled (reservedStock = false)
    - Completed

## Steel coil statuses:

    - in stock
    - opened
    - finished

## Outsourced Products

    - pending
    - dispatched
    - withSupplier
    - collectable
    - completed

# Machine Board and Manufacturing

User selects the machine from the user selection board to navigate to machines/coil-board/:machineId

### Machines Board Component

Fetches the machine and pass ProductInformation to ManufacturingBoardComponent

### ManufacturingBoardComponent

Displays the current coil load in the machine:

    - Current coil loaded in the machine (use the machinesLastestEvent)
    - The Cutting List in progress CuttingListInProgressComponent
    - A table of all scheduled cutting lists cuttingListTableComponent

## Quote Prices

| ID  | Type      | Mark Up    | Date Edited |
| --- | --------- | ---------- | ----------- |
| 1   | Std       | 1.3        |             |
| 2   | Tradesmen | 1.25       |             |
| 3   | Custom    | -100 - 200 |             |
