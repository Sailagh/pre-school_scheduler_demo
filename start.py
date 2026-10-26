"""Starts the preschool schedule demo on this computer and opens it in the browser.

The first time, it makes a private Python environment in .venv and installs OR-Tools into it
(needs internet, takes a minute or two). After that it starts straight away.

    python3 start.py          (or double-click Start-Windows.bat / Start-Mac.command / start.sh)
    python3 start.py --lan    also reachable from a phone on the same Wi-Fi
"""

import os
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import venv
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))
VENV = os.path.join(ROOT, ".venv")
PY = os.path.join(VENV, "Scripts", "python.exe") if os.name == "nt" else os.path.join(VENV, "bin", "python")


def say(sv, en):
    print(f"{sv}\n  ({en})", flush=True)


def fail(sv, en):
    say(sv, en)
    if sys.stdin and sys.stdin.isatty():
        input("\nTryck Enter för att stänga. (Press Enter to close.)")
    sys.exit(1)


def has_ortools():
    return os.path.exists(PY) and subprocess.run([PY, "-c", "import ortools, openpyxl"], capture_output=True).returncode == 0


def install():
    say("Första gången: installerar OR-Tools och openpyxl (för Medvind-filer). Det tar en minut eller två och kräver internet.",
        "First time: installing OR-Tools and openpyxl (for Medvind files). This takes a minute or two and needs internet.")
    if not os.path.exists(PY):
        venv.create(VENV, with_pip=True)
    r = subprocess.run([PY, "-m", "pip", "install", "--disable-pip-version-check", "-q", "-r",
                        os.path.join(ROOT, "solver", "requirements.txt")])
    if r.returncode != 0 or not has_ortools():
        fail("Det gick inte att installera OR-Tools. Kontrollera internetanslutningen och försök igen.",
             "Could not install OR-Tools. Check the internet connection and try again.")


def free_port(start=8000):
    for port in range(start, start + 50):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    fail("Hittade ingen ledig port.", "No free port found.")


def lan_address():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
    except OSError:
        return None


def open_when_ready(url):
    for _ in range(100):
        try:
            urllib.request.urlopen(url + "health", timeout=1)
            webbrowser.open(url + "Schedule%20Demo.dc.html")
            return
        except OSError:
            time.sleep(0.2)


if __name__ == "__main__":
    if sys.version_info < (3, 9):
        fail("Python 3.9 eller nyare behövs. Hämta det från https://www.python.org/downloads/",
             "Python 3.9 or newer is needed. Get it from https://www.python.org/downloads/")
    if not has_ortools():
        install()
    lan = "--lan" in sys.argv
    port = free_port()
    url = f"http://localhost:{port}/"
    say(f"Schemademon körs på {url}  – låt det här fönstret vara öppet. Stäng det för att avsluta.",
        f"The schedule demo runs at {url}  – keep this window open. Close it to stop.")
    if lan and lan_address():
        say(f"Från en telefon på samma wifi: http://{lan_address()}:{port}/Phone.dc.html",
            f"From a phone on the same Wi-Fi: http://{lan_address()}:{port}/Phone.dc.html")
    threading.Thread(target=open_when_ready, args=(url,), daemon=True).start()
    try:
        subprocess.run([PY, os.path.join(ROOT, "solver", "server.py"), str(port)] + (["--lan"] if lan else []))
    except KeyboardInterrupt:
        pass
