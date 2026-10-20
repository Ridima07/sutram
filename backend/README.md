# Anomaly Detection Backend

## Setup
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python generate_data.py
python model.py
uvicorn main:app --reload --port 8000
```
Swagger docs: http://localhost:8000/docs

## Endpoint
POST /detect-anomalies with body `{}` to score the bundled sample logs.
Default threshold is 0.8. See `sample_response.json` for the response format.
pytest -q runs the tests, and python call_api.py refreshes sample_response.json.

## Note
Data is synthetic. Scores are for investigator review, not proof of wrongdoing.