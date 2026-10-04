import pandas as pd
from model import score

out = score(pd.read_csv("data/logs.csv"))
pd.set_option("display.width", 250)
pd.set_option("display.max_colwidth", 90)
top = out.sort_values("score", ascending=False)
print(top[["timestamp", "user", "ip", "score", "label", "reason"]].head(15))
print("\nRows with score >= 0.6:", (out.score >= 0.6).sum())