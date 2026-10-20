import ipaddress

import pandas as pd


FEATURES = [
    "login_hour",
    "off_hours",
    "failed_logins",
    "file_accesses",
    "events_per_hour",
    "external_ip",
    "new_ip",
]


def is_internal(ip):
    """
    Return True when an IP belongs to a private/internal network.

    Supports standard private IPv4 and IPv6 ranges.
    Missing or invalid addresses are treated as external
    so they are not silently classified as trusted.
    """
    if pd.isna(ip):
        return True

    try:
        address = ipaddress.ip_address(str(ip).strip())
        return address.is_private
    except ValueError:
        return False


def build_features(df):
    """
    Convert raw log records into the numerical features
    required by the Isolation Forest model.

    Expected columns:
        timestamp
        user
        ip
        failed_logins
        file_accesses
        events_per_hour

    Additional columns, such as event_id and label,
    are preserved.
    """
    required_columns = [
        "timestamp",
        "user",
        "ip",
        "failed_logins",
        "file_accesses",
        "events_per_hour",
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing required columns: "
            + ", ".join(missing_columns)
        )

    df = df.copy()

    # Parse timestamps.
    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce",
    )

    if df["timestamp"].isna().any():
        raise ValueError(
            "One or more timestamps are invalid."
        )

    # Ensure numerical features are valid numbers.
    numeric_columns = [
        "failed_logins",
        "file_accesses",
        "events_per_hour",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

        if df[column].isna().any():
            raise ValueError(
                f"Column '{column}' contains missing "
                "or invalid numerical values."
            )

        if (df[column] < 0).any():
            raise ValueError(
                f"Column '{column}' cannot contain "
                "negative values."
            )

    # Feature 1: Hour of the event.
    df["login_hour"] = df["timestamp"].dt.hour

    # Feature 2: Activity outside usual working hours.
    df["off_hours"] = (
        (df["login_hour"] < 6)
        | (df["login_hour"] >= 22)
    ).astype(int)

    # Feature 3–5: Activity counts.
    for column in numeric_columns:
        df[column] = df[column].astype(float)

    # Feature 6: Whether the IP is external.
    df["external_ip"] = (
        ~df["ip"].apply(is_internal)
    ).astype(int)

    # Feature 7: Whether the IP differs from the user's
    # usual internal IP address in the supplied dataset.
    #
    # Prefer the most frequent internal IP for each user.
    # If no internal IP exists for a user, use the most
    # frequent IP observed for that user.
    df["new_ip"] = 0

    valid_users = df["user"].notna()

    for user, group in df.loc[valid_users].groupby("user"):
        internal_group = group[
            group["ip"].apply(is_internal)
        ]

        reference_group = (
            internal_group
            if not internal_group.empty
            else group
        )

        modes = reference_group["ip"].mode(
            dropna=True
        )

        if modes.empty:
            continue

        usual_ip = modes.iloc[0]

        user_rows = df["user"] == user

        df.loc[user_rows, "new_ip"] = (
            df.loc[user_rows, "ip"] != usual_ip
        ).astype(int)

    return df