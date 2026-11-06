"""Builds the web demo for a portfolio page: python portfolio/build.py [out-dir]

Writes, by default to dist/portfolio/:
  screens/01-forskolans-schema.html    a 1180 x 820 screen that shows the planner in web-demo mode
  screens/01-forskolans-schema/        the planner's files (static, no server)

In web-demo mode (?embed) making a schedule only pretends to run and loads one OR-Tools made earlier
(web/solved-schedule.json), and Medvind's Excel files are not read or written; an invented example import
is shown instead. Everything else works as in the full demo, in the visitor's own browser.
"""

import os
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, "web")
FILES = ["Schedule Demo.dc.html", "Demo Settings.dc.html", "Demo Settings Staff.dc.html", "Demo Settings Rules.dc.html",
         "Schedule Lines.dc.html", "Staff App.dc.html", "schedule-core-demo.js", "support.js", "ios-frame.jsx",
         "solved-schedule.json", "edlevo-counts.json", "medvind-example.json"]
SCREEN = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Förskolans schema</title>
<style>html, body { margin: 0; height: 100%; overflow: hidden; background: #fff } iframe { display: block; width: 100%; height: 100%; border: 0 }</style>
</head>
<body>
<iframe src="01-forskolans-schema/Schedule%20Demo.dc.html?embed" title="Förskolans schema, web demo"></iframe>
</body>
</html>
"""


def main():
    out = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "portfolio"))
    app = os.path.join(out, "screens", "01-forskolans-schema")
    if os.path.isdir(app):
        shutil.rmtree(app)
    os.makedirs(app)
    for f in FILES:
        shutil.copy2(os.path.join(WEB, f), os.path.join(app, f))
    shutil.copytree(os.path.join(WEB, "vendor"), os.path.join(app, "vendor"))
    with open(os.path.join(out, "screens", "01-forskolans-schema.html"), "w", encoding="utf-8") as f:
        f.write(SCREEN)
    print("Wrote", out)


if __name__ == "__main__":
    main()
