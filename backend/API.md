# Anomaly Detection API

Base URL (local): `http://localhost:8000` · Interactive docs: `/docs`

## Rules for consumers
- Fields are only ever **added**, never renamed or removed.
- Show `label` verbatim in the UI. Scores flag unusual activity for investigator review. They do not prove wrongdoing.
- Scores come from an Isolation Forest trained on **synthetic** data.
- `id` (ANM-001, ...) is only the rank within one response and changes between requests. **Link results to source events with `event_id`.**

## GET /
Health check. Returns `{"status": "ok"}`.

## POST /detect-anomalies

### Request
```json
{
  "records": [
    {
      "event_id": "EVT-0041",
      "timestamp": "2026-09-14T10:15:00",
      "user": "Rahul",
      "ip": "192.168.1.21",
      "failed_logins": 0,
      "file_accesses": 11,
      "events_per_hour": 6
    },
    {
      "event_id": "EVT-0042",
      "timestamp": "2026-09-14T02:43:00",
      "user": "Rahul",
      "ip": "85.21.44.9",
      "failed_logins": 12,
      "file_accesses": 37,
      "events_per_hour": 25
    },
    {
      "event_id": "EVT-0043",
      "timestamp": "2026-09-14T11:02:00",
      "user": "Stranger",
      "ip": "10.0.0.5"
    }
  ],
  "threshold": 0.8,
  "include_all": false
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `records` | list | no | Omit it to score the bundled sample logs. `[]` returns empty results. Max 10,000 |
| `records[].event_id` | string | no | Echoed back on each result |
| `records[].timestamp` | string | yes | ISO format, **no timezone**, e.g. `2026-09-14T02:43:00` |
| `records[].user` | string | yes | Non-empty |
| `records[].ip` | string | yes | Valid IP address |
| `records[].failed_logins` | int ≥ 0 | no | If missing, see "Missing data" below |
| `records[].file_accesses` | int ≥ 0 | no | Same |
| `records[].events_per_hour` | int ≥ 0 | no | Same |
| `threshold` | float 0–1 | no | Default 0.8 |
| `include_all` | bool | no | `true` returns every record with its score, flagged or not. Default `false` returns flagged records only |

### Response
This is the real response to the request above:
```json
{
  "anomalies": [
    {
      "id": "ANM-001",
      "event_id": "EVT-0042",
      "timestamp": "2026-09-14T02:43:00",
      "user": "Rahul",
      "ip": "85.21.44.9",
      "score": 0.96,
      "is_anomaly": true,
      "severity": "high",
      "indicators": {
        "login_hour": 2,
        "failed_logins": 12,
        "file_accesses": 37,
        "new_ip": true,
        "external_ip": true
      },
      "reason": "Unusual file accesses: 37 vs typical ~12; failed logins: 12 vs typical ~0; activity per hour: 25 vs typical ~6; off-hours access; external IP address; IP not usual for this user",
      "missing_fields": [],
      "label": "Potentially anomalous activity — requires investigator review"
    }
  ],
  "summary": {
    "total_records": 3,
    "flagged": 1,
    "threshold": 0.8,
    "source": "request",
    "warnings": [
      "Missing count fields were filled with typical training values, so they do not drive the score.",
      "No baseline for users ['Stranger']: new-IP check skipped for them."
    ],
    "missing_values_filled": {
      "failed_logins": 1,
      "file_accesses": 1,
      "events_per_hour": 1
    }
  }
}
```
`example_request.json` and `example_response.json` in this folder use `include_all: true`, so they also show non-flagged records.

| Field | Meaning |
|---|---|
| `score` | 0 to 1. Higher means more unusual compared with the training data. **Not a probability** |
| `is_anomaly` | `score >= threshold` |
| `severity` | `high`: score ≥ 0.8. `medium`: flagged but below 0.8. `low`: not flagged |
| `label` | "Potentially anomalous activity — requires investigator review" **only when `is_anomaly` is true**. Otherwise "Not flagged at the current threshold". Show it verbatim |
| `indicators` | The values that fed the score. `failed_logins` and `file_accesses` are `null` when not supplied, so **display "no data", not 0** |
| `reason` | Plain-English explanation of the main deviations. Supplied values only. May read "No single indicator is far from typical" or "Insufficient data: no activity counts supplied" |
| `missing_fields` | Count fields the record did not supply |
| `summary.source` | `request` or `sample_data` |
| `summary.warnings` | Data-quality notes. Show them to the investigator |

### Missing data
Missing count fields are filled with typical training values, so the gap does not create a fake anomaly or count towards the score. The record lists them in `missing_fields`, and a missing count means less evidence, so a low score on such a record is weaker than a low score on a complete one.

### Errors
| Status | Cause |
|---|---|
| 422 | Invalid input (bad IP, bad timestamp, negative count, threshold outside 0–1). The body names the field |
| 503 | Model not trained. Run `python model.py` |

## Known limits
- Trained on synthetic logs, so real-data accuracy is untested. On the synthetic set at threshold 0.8: precision 1.00, recall 0.67 (subtle single-signal anomalies are missed).
- Expects one record per user per time window with activity counts already aggregated. Raw event streams need aggregating first.
- The model only knows the users in its training data. For others, the "new IP" check is skipped (see `summary.warnings`).
- Legitimate unusual patterns, such as a night-shift user, can be flagged at lower thresholds. That is why every result needs investigator review.
- An IP counts as internal if it starts with 192.168., 10. or 172.