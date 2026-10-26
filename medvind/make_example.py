"""Writes medvind/exempel-grundschema.xlsx: an INVENTED base schedule in the layout of a Medvind export, for trying
the import without real data. Like a real export it has a 6-week rotation with week 4 as the start week, schedule
lines tied to units plus extra lines, one time range per weekday, and times typed in mixed formats
("06.00-13.00", "8-16.30", "0630-1030", "9-19"), with one typo ("6.3014.0") and one cell that cannot be read.

    python3 medvind/make_example.py
"""

import os
import random

import openpyxl
from openpyxl.styles import Alignment, Font

HERE = os.path.dirname(os.path.abspath(__file__))
DAYS = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"]
rng = random.Random(7)

# Invented day patterns per line: (start, end) in minutes, Monday always to 19:00 as a meeting day.
STARTS = [360, 390, 420, 450, 480, 510, 540]


def messy(a, b):
    """A time range typed the way people type it."""
    def one(m, style):
        h, mm = divmod(m, 60)
        if style == 0:
            return f"{h:02d}.{mm:02d}"
        if style == 1:
            return f"{h}" if mm == 0 else f"{h}.{mm:02d}"
        return f"{h:02d}{mm:02d}"
    style = rng.choice([0, 0, 1, 1, 2])
    return f"{one(a, style)}-{one(b, style)}"


def main():
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Medvind"
    for col, name in ((3, "Signaler"), (4, "Schemarad"), (5, "Attesterad/godkänd t.o.m")):
        ws.cell(1, col, name).font = Font(bold=True)
        ws.merge_cells(start_row=1, start_column=col, end_row=2, end_column=col)
    for c in (1, 2):
        ws.merge_cells(start_row=1, start_column=c, end_row=2, end_column=c)
    for n in range(1, 7):
        col = 6 + (n - 1) * 7
        ws.cell(1, col, f"Vecka {n}" + (": Startvecka" if n == 4 else "")).alignment = Alignment(horizontal="center")
        ws.merge_cells(start_row=1, start_column=col, end_row=1, end_column=col + 6)
        for d, name in enumerate(DAYS):
            ws.cell(2, col + d, name)
    labels = [f"{i}, Avd {(i - 1) // 3 + 1} " for i in range(1, 10)] + ["10 Extra"]
    for r, label in enumerate(labels, start=3):
        ws.cell(r, 4, label)
        for n in range(6):
            for d in range(5):
                if label.endswith("Extra ") or "Extra" in label:
                    a = rng.choice([390, 450, 720]); b = a + 240
                elif d == 0:
                    a, b = rng.choice([360, 390, 420, 450, 540]), 19 * 60
                else:
                    a = rng.choice(STARTS); b = a + rng.choice([390, 450, 480, 510])
                ws.cell(r, 6 + n * 7 + d, messy(a, min(b, 1050) if d else b))
    ws.cell(4, 7, "6.3014.0")     # a typo, as in real exports: no dash, minutes cut short
    ws.cell(7, 9, "7.30-")         # cannot be read
    out = os.path.join(HERE, "exempel-grundschema.xlsx")
    wb.save(out)
    print("Invented example written to", out)


if __name__ == "__main__":
    main()
