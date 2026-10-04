from typing import List, Optional

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import score

app = FastAPI(title="Forensics Anomaly API")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


class Record(BaseModel):
    timestamp: str
    user: str
    ip: str
    failed_logins: int = 0
    file_accesses: int = 0
    events_per_hour: int = 0


class Req(BaseModel):
    records: Optional[List[Record]] = None  # None = use bundled sample data
    threshold: float = 0.8


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/detect-anomalies")
def detect(req: Req):
    if req.records:
        df = pd.DataFrame([r.model_dump() for r in req.records])
    else:
        df = pd.read_csv("data/logs.csv")

    out = score(df)
    flagged = out[out["score"] >= req.threshold].sort_values("score", ascending=False)

    items = []
    for i, r in enumerate(flagged.itertuples(), start=1):
        items.append({
            "id": f"ANM-{i:03d}",
            "timestamp": r.timestamp.isoformat(),
            "user": r.user,
            "ip": r.ip,
            "score": float(r.score),
            "severity": "high" if r.score >= 0.8 else "medium",
            "indicators": {
                "login_hour": int(r.login_hour),
                "failed_logins": int(r.failed_logins),
                "file_accesses": int(r.file_accesses),
                "new_ip": bool(r.new_ip),
                "external_ip": bool(r.external_ip),
            },
            "reason": r.reason,
            "label": "Potentially anomalous activity — requires investigator review",
        })

    return {"anomalies": items,
            "summary": {"total_records": len(out), "flagged": len(items),
                        "threshold": req.threshold}}