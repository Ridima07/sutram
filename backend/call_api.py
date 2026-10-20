import json
import requests

r = requests.post("http://localhost:8000/detect-anomalies", json={})
data = r.json()
print(data["summary"])
print(json.dumps(data["anomalies"][0], indent=2))
with open("sample_response.json", "w") as f:
    json.dump(data, f, indent=2)
print("Saved sample_response.json")