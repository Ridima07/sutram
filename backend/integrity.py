import hashlib
import sqlite3
import uuid

from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# Keep the database inside the backend directory.
BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "evidence_integrity.db"


def get_connection():
    """Create a SQLite connection and ensure the table exists."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS evidence (
            evidence_id TEXT PRIMARY KEY,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            sha256 TEXT NOT NULL,
            registered_at TEXT NOT NULL,
            last_verified_at TEXT,
            last_verification_status TEXT
        )
        """
    )

    connection.commit()
    return connection


def calculate_sha256(file_path: str) -> str:
    """Calculate SHA-256 from the actual file bytes."""
    digest = hashlib.sha256()

    with open(file_path, "rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)

    return digest.hexdigest()


def register_evidence(file_path: str) -> dict:
    """
    Register an existing file and preserve its initial SHA-256
    as the reference hash.
    """
    path = Path(file_path).expanduser().resolve()

    if not path.exists():
        raise FileNotFoundError("The specified evidence file does not exist.")

    if not path.is_file():
        raise ValueError("The specified evidence path is not a file.")

    file_hash = calculate_sha256(str(path))
    evidence_id = f"EV-{uuid.uuid4().hex[:12].upper()}"
    registered_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO evidence (
                evidence_id,
                file_name,
                file_path,
                sha256,
                registered_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                evidence_id,
                path.name,
                str(path),
                file_hash,
                registered_at,
            ),
        )

    return {
        "evidence_id": evidence_id,
        "file_name": path.name,
        "sha256": file_hash,
        "registered_at": registered_at,
        "integrity_status": "registered",
    }


def list_evidence() -> list[dict]:
    """List registered evidence without exposing file paths."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                evidence_id,
                file_name,
                sha256,
                registered_at,
                last_verified_at,
                last_verification_status
            FROM evidence
            ORDER BY registered_at DESC
            """
        ).fetchall()

    return [dict(row) for row in rows]


def verify_evidence(evidence_id: str) -> Optional[dict]:
    """
    Recalculate a registered file's hash and compare it with
    the original reference hash.

    Verification never overwrites the reference hash.
    """
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT *
            FROM evidence
            WHERE evidence_id = ?
            """,
            (evidence_id,),
        ).fetchone()

        if row is None:
            return None

        record = dict(row)

        try:
            current_path = Path(record["file_path"])

            if not current_path.is_file():
                status = "unavailable"
                observed_hash = None
                message = "The registered file is unavailable."
            else:
                observed_hash = calculate_sha256(str(current_path))

                if observed_hash == record["sha256"]:
                    status = "verified"
                    message = "The file matches its registered reference hash."
                else:
                    status = "mismatch"
                    message = "The file differs from its registered reference hash."

        except OSError:
            status = "error"
            observed_hash = None
            message = "The file could not be read for verification."

        verified_at = datetime.now(timezone.utc).isoformat()

        connection.execute(
            """
            UPDATE evidence
            SET last_verified_at = ?,
                last_verification_status = ?
            WHERE evidence_id = ?
            """,
            (verified_at, status, evidence_id),
        )

    return {
        "evidence_id": evidence_id,
        "file_name": record["file_name"],
        "expected_sha256": record["sha256"],
        "observed_sha256": observed_hash,
        "integrity_status": status,
        "verified_at": verified_at,
        "message": message,
    }