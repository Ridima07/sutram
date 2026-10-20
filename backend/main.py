from pathlib import Path
from typing import List, Optional

import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from model import score
from integrity import (
    register_evidence,
    list_evidence,
    verify_evidence,
)


app = FastAPI(title="Forensics Anomaly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# REQUEST MODELS
# ==================================================

class Record(BaseModel):
    event_id: Optional[str] = None
    timestamp: str
    user: str
    ip: str

    failed_logins: int = 0
    file_accesses: int = 0
    events_per_hour: int = 0


class Req(BaseModel):
    records: Optional[List[Record]] = None
    threshold: float = 0.8


class EvidenceRegistrationRequest(BaseModel):
    file_path: str


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/")
def health():
    return {
        "status": "ok"
    }


# ==================================================
# ANOMALY DETECTION
# ==================================================

@app.post("/detect-anomalies")
def detect(req: Req):
    if not 0 <= req.threshold <= 1:
        raise HTTPException(
            status_code=400,
            detail="Threshold must be between 0 and 1.",
        )

    # Use supplied records if provided.
    if req.records is not None:
        records = [
            record.model_dump()
            for record in req.records
        ]

        if not records:
            return {
                "anomalies": [],
                "summary": {
                    "total_records": 0,
                    "flagged": 0,
                    "threshold": req.threshold,
                },
            }

        df = pd.DataFrame(records)

    else:
        # Resolve the sample dataset relative to this file,
        # rather than relying on the terminal's working directory.
        data_path = (
            Path(__file__).resolve().parent
            / "data"
            / "logs.csv"
        )

        if not data_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Bundled anomaly-detection dataset not found.",
            )

        df = pd.read_csv(data_path)

    # Preserve source event IDs separately before scoring.
    if "event_id" not in df.columns:
        df["event_id"] = None

    try:
        out = score(df)
    except (ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to process records: {exc}",
        )

    flagged = (
        out[out["score"] >= req.threshold]
        .sort_values("score", ascending=False)
    )

    items = []

    for i, row in enumerate(
        flagged.itertuples(),
        start=1,
    ):
        timestamp = pd.Timestamp(row.timestamp)

        event_id = getattr(
            row,
            "event_id",
            None,
        )

        # CSV rows may not have source event IDs.
        # Do not fabricate source evidence identifiers.
        if pd.isna(event_id):
            event_id = None

        items.append(
            {
                "id": f"ANM-{i:03d}",
                "event_id": event_id,
                "timestamp": timestamp.isoformat(),
                "user": row.user,
                "ip": row.ip,
                "score": float(row.score),
                "severity": (
                    "high"
                    if row.score >= 0.8
                    else "medium"
                ),
                "indicators": {
                    "login_hour": int(row.login_hour),
                    "failed_logins": int(row.failed_logins),
                    "file_accesses": int(row.file_accesses),
                    "new_ip": bool(row.new_ip),
                    "external_ip": bool(row.external_ip),
                },
                "reason": row.reason,
                "label": (
                    "Potentially anomalous activity "
                    "— requires investigator review"
                ),
            }
        )

    return {
        "anomalies": items,
        "summary": {
            "total_records": len(out),
            "flagged": len(items),
            "threshold": req.threshold,
        },
    }


# ==================================================
# EVIDENCE INTEGRITY
# ==================================================

@app.post("/api/evidence/register")
def api_register_evidence(
    req: EvidenceRegistrationRequest,
):
    try:
        return register_evidence(req.file_path)

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )


@app.get("/api/evidence")
def api_list_evidence():
    return {
        "evidence": list_evidence()
    }


@app.post("/api/evidence/{evidence_id}/verify")
def api_verify_evidence(evidence_id: str):
    result = verify_evidence(evidence_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Evidence record not found.",
        )

    return result