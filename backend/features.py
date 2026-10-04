import pandas as pd

FEATURES = ["login_hour", "off_hours", "failed_logins", "file_accesses",
            "events_per_hour", "external_ip", "new_ip"]


def is_internal(ip):
    return ip.startswith(("192.168.", "10.", "172."))


def build_features(df):
    df = df.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df["login_hour"] = df["timestamp"].dt.hour
    df["off_hours"] = ((df["login_hour"] < 6) | (df["login_hour"] >= 22)).astype(int)
    df["external_ip"] = (~df["ip"].apply(is_internal)).astype(int)
    # each user's most common IP in this batch = their "usual" IP
    usual = df.groupby("user")["ip"].agg(lambda s: s.mode().iloc[0])
    df["new_ip"] = (df["ip"] != df["user"].map(usual)).astype(int)
    return df