# Children's times from Edlevo → number of adults needed

The planner works out how many adults are needed from how many children are in each unit every 15 minutes.
In the demo that can come from an invented example curve, or from children's booked times in Edlevo.

```
Edlevo ──(Calendar API v2, one call per child)──▶ aggregate.py ──(counts only)──▶ planner
         inside the municipality                   inside the municipality         web/edlevo-counts.json
```

- **`make_mock.py`** writes `mock/svar-001.xml` … : invented responses to `GetPreschoolCalendarEvents`, one per child,
  in the exact shape of Tieto's schema `tieto-edu-calendar-v2.xsd` (namespace `http://open.tieto.com/edu/calendarevent/v2`).
  All GUIDs are made up from a fixed seed; there are no names or personal numbers. About 18 children per department,
  drop-off from 06:20 and pick-up by 17:30, some days "Ledig", the autumn break and Christmas.
- **`aggregate.py`** reads the responses, counts children per department per quarter of an hour, and **discards every
  child id**. Its output (`format: barnantal-v1`) holds only dates, department names and counts. Standard library only.

  ```
  python3 edlevo/make_mock.py
  python3 edlevo/aggregate.py edlevo/mock -o web/edlevo-counts.json
  ```

- In the planner: **Inställningar › Barn och avdelningar › Antal barn under dagen › Från Edlevo (sammanräknat)**.
  The page only accepts a counts file; a file with child ids (raw XML) is refused.

## For real use
- The counting must run **inside the municipality's own systems**, so the children's data never leaves them. Only the
  counts go to the scheduling tool.
- The Calendar API needs a **licence key from Tieto**. It has no call for a whole group: one call per child, with
  `Id` (GUID or personal number), `StartDate` and `EndDate`, at most one year per call. The list of children to ask
  for has to come from the municipality's own register.
- A child counts in a quarter if any part of their booking falls in it (the most children who can be there then).
- In production, parse the XML with `defusedxml` and keep the responses only as long as the counting takes.
