"""Small HTTP server for the schedule solver.

    POST /solve   body: problem JSON from solverProblem() in web/schedule-core-demo.js
                  returns: {"weeks": [{"week", "shifts", "roles", "status", "objective"}]}
    GET  /health  returns: {"ok": true}

Run:  python solver/server.py [port]   (default port 8000; set SOLVER_TIME_LIMIT to change the
seconds spent per week, default 20). Any origin may call it, so the static web demo can be
served from anywhere.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from schedule_solver import solve

TIME_LIMIT = float(os.environ.get("SOLVER_TIME_LIMIT", "20"))
MAX_WEEKS = 12


class Handler(BaseHTTPRequestHandler):
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
            self._send(404, {"error": "not found"})

    def do_POST(self):
        if self.path != "/solve":
            return self._send(404, {"error": "not found"})
        try:
            problem = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))))
            if not 1 <= len(problem.get("weeks", [])) <= MAX_WEEKS:
                return self._send(400, {"error": f"send between 1 and {MAX_WEEKS} weeks"})
            self._send(200, solve(problem, time_limit=TIME_LIMIT))
        except (ValueError, KeyError, TypeError) as e:
            self._send(400, {"error": f"bad problem: {e}"})
        except RuntimeError as e:
            self._send(422, {"error": str(e)})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Schedule solver on http://localhost:{port}  (POST /solve, GET /health)")
    ThreadingHTTPServer(("", port), Handler).serve_forever()
