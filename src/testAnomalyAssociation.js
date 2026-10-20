import assert from "node:assert/strict";

import {
  associateAnomalies
} from "./logic/associateAnomalies.js";

const anomalies = [
  {
    id: "ANM-001",
    event_id: "CSV-EXAMPLE-01",
    timestamp: "2026-09-21T02:45:31",
    user: "Rahul",
    ip: "85.21.44.9",
    score: 0.94
  }
];

const observations = [
  {
    recordId: "NET-001",
    source: "network_log",
    timestamp: "2026-09-21T02:45:32",
    user: null,
    ip: "85.21.44.9",
    action: "CONNECTION"
  },
  {
    recordId: "NET-006",
    source: "network_log",
    timestamp: "2026-09-21T02:46:15",
    user: null,
    ip: "172.16.4.22",
    action: "OUTBOUND_TRANSFER"
  }
];

// Test 1: Matching IP and nearby timestamp.
const result = associateAnomalies(
  anomalies,
  observations
);

assert.equal(result.length, 1);
assert.equal(result[0].anomalyEventId, "CSV-EXAMPLE-01");
assert.equal(result[0].candidates.length, 1);
assert.equal(result[0].candidates[0].recordId, "NET-001");
assert.deepEqual(
  result[0].candidates[0].matchBasis,
  ["ip"]
);
assert.equal(result[0].candidates[0].requiresReview, true);

// Test 2: No candidate outside the time window.
const distantAnomaly = [{
  ...anomalies[0],
  timestamp: "2026-09-21T04:00:00"
}];

const distantResult = associateAnomalies(
  distantAnomaly,
  observations
);

assert.equal(distantResult[0].candidates.length, 0);

// Test 3: A matching user can produce a weaker candidate.
const userAnomaly = [{
  ...anomalies[0],
  ip: "203.0.113.99"
}];

const userObservation = [{
  ...observations[0],
  user: "Rahul"
}];

const userResult = associateAnomalies(
  userAnomaly,
  userObservation
);

assert.equal(userResult[0].candidates.length, 1);
assert.equal(
  userResult[0].candidates[0].associationType,
  "matching-user-candidate"
);

// Test 4: Invalid inputs must be rejected.
assert.throws(
  () => associateAnomalies(null, observations),
  /Anomalies must be an array/
);

console.log("Anomaly association tests passed: 4 checks.");