"""Small HTTP server for the schedule solver, which also serves the web demo.

    GET  /...     the files in web/ (open http://localhost:8000/ in a browser)
    POST /solve   body: problem JSON from solverProblem() in web/schedule-core-demo.js
                  returns: {"weeks": [{"week", "shifts", "roles", "status", "objective"}]}
    GET  /health  returns: {"ok": true}

Run:  python solver/server.py [port] [--lan]   (default port 8000; set SOLVER_TIME_LIMIT to change the
seconds spent per week, default 20). It listens on this computer only; --lan also lets other devices
on the same network reach it (e.g. to try the phone app on a phone). Any origin may call /solve, so the
web demo can also be served from elsewhere.
"""

import json
import os
import sys
import traceback
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from schedule_solver import solve

TIME_LIMIT = float(os.environ.get("SOLVER_TIME_LIMIT", "20"))
MAX_WEEKS = 12
MAX_BODY = 2_000_000  # bytes; a week's problem is under 10 kB
WEB = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Always serve the latest files while working on the demo.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        if self.command == "POST" or (args and str(args[1])[:1] in "45"):
            super().log_message(fmt, *args)

    def _send(self, code, body):
        data = json.dumps(body, separators=(",", ":")).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._send(200, {"ok": True})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != "/solve":
            return self._send(404, {"error": "not found"})
        try:
            size = int(self.headers.get("Content-Length", 0))
            if size > MAX_BODY:
                return self._send(413, {"error": "problem too large"})
            problem = json.loads(self.rfile.read(size))
            if not 1 <= len(problem.get("weeks", [])) <= MAX_WEEKS:
                return self._send(400, {"error": f"send between 1 and {MAX_WEEKS} weeks"})
            self._send(200, solve(problem, time_limit=TIME_LIMIT))
        except (ValueError, KeyError, TypeError) as e:
            self._send(400, {"error": f"bad problem: {e}"})
        except RuntimeError as e:
            self._send(422, {"error": str(e)})
        except Exception as e:  # anything unexpected: tell the page, and show the details in the window
            traceback.print_exc()
            self._send(500, {"error": f"{type(e).__name__}: {e}"})


def serve(port=8000, lan=False):
    server = ThreadingHTTPServer(("" if lan else "127.0.0.1", port), partial(Handler, directory=WEB))
    print(f"Schedule demo on http://localhost:{port}/  (solver: POST /solve)", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    serve(int(args[0]) if args else 8000, "--lan" in sys.argv)
