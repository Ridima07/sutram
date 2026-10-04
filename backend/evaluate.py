import pandas as pd
from model import score

df = pd.read_csv("data/logs.csv")
out = score(df)

print("threshold | flagged | precision | recall")
for t in [0.4, 0.5, 0.6, 0.7, 0.8]:
    pred = (out["score"] >= t).astype(int)
    tp = int(((pred == 1) & (out["label"] == 1)).sum())
    fp = int(((pred == 1) & (out["label"] == 0)).sum())
    fn = int(((pred == 0) & (out["label"] == 1)).sum())
    precision = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    print(f"{t:>9} | {tp+fp:>7} | {precision:>9.2f} | {recall:>6.2f}")

t = 0.6
night = out[(out.user == "Vikram") & (out.login_hour >= 22)]
print(f"\nVikram night-shift rows flagged at {t}: "
      f"{(night.score >= t).sum()} of {len(night)}")

missed = out[(out.label == 1) & (out.score < t)]
print(f"Planted anomalies missed at {t}: {len(missed)}")
print(missed[["timestamp", "user", "ip", "file_accesses", "score"]].head(10))