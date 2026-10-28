"""Retrieve published Lee Canyon mountain operations; never invent snow measurements."""
import datetime
import json
import pathlib
import re
import requests
from bs4 import BeautifulSoup

URL = "https://www.leecanyonlv.com/weather/"
path = pathlib.Path("data/lee-canyon-snow.json")
today = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
report = {
    "source": URL, "checked_at": today, "season": "Unverified",
    "lifts_open": None, "lifts_total": None,
    "trails_open": None, "trails_total": None,
    "ski_base_inches": None, "snowfall_24h_inches": None,
    "note": "Resort information could not be verified automatically. See official report."
}
try:
    response = requests.get(URL, timeout=25, headers={"User-Agent": "Mozilla/5.0 (compatible; VegasSkiShuttleReport/1.0)"})
    response.raise_for_status()
    text = BeautifulSoup(response.text, "html.parser").get_text(" ", strip=True)
    # Resort currently uses bike lifts and trails; do not label as ski lifts.
    fall = bool(re.search(r"bike park|mountain bike|fall operations|MTB Lift", text, re.I))
    report["season"] = "Fall mountain-bike operations" if fall else "Resort operations (type unverified)"
    matches = re.findall(r"(\d+)\s*/\s*(\d+)\s*(Lifts Open|Trails Open)", text, re.I)
    if matches and fall:
        for opened, total, kind in matches:
            if kind.lower().startswith("lifts") and report["lifts_total"] is None:
                report["lifts_open"], report["lifts_total"] = int(opened), int(total)
            elif kind.lower().startswith("trails") and report["trails_total"] is None:
                report["trails_open"], report["trails_total"] = int(opened), int(total)
    report["note"] = ("Mountain-bike lift/trail operations, not winter skiing. " if fall else "Operational category unverified. ") + "Snow depth and 24-hour snowfall unavailable from a verified feed."
except Exception as exc:
    print("Report retrieval failed:", type(exc).__name__)
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(report, indent=2) + "\n")
