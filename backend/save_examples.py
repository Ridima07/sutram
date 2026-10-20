import json
import requests

URL = "http://localhost:8000/detect-anomalies"
batch = {
    "records": [
        {"event_id": "EVT-0041", "timestamp": "2026-09-14T10:15:00", "user": "Rahul",
         "ip": "192.168.1.21", "failed_logins": 0, "file_accesses": 11, "events_per_hour": 6},
        {"event_id": "EVT-0042", "timestamp": "2026-09-14T02:43:00", "user": "Rahul",
         "ip": "85.21.44.9", "failed_logins": 12, "file_accesses": 37, "events_per_hour": 25},
        {"event_id": "EVT-0043", "timestamp": "2026-09-14T11:02:00", "user": "Stranger",
         "ip": "10.0.0.5"},
    ],
    "threshold": 0.8,
    "include_all": True,
}

r = requests.post(URL, json=batch)
r.raise_for_status()

with open("example_request.json", "w", encoding="utf-8") as f:
    json.dump(batch, f, indent=2, ensure_ascii=False)
with open("example_response.json", "w", encoding="utf-8") as f:
    json.dump(r.json(), f, indent=2, ensure_ascii=False)
print(json.dumps(r.json(), indent=2, ensure_ascii=False))