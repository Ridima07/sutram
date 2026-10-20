/**
 * Associates Python anomaly-detector results with JavaScript
 * forensic observations.
 *
 * Important:
 * - Original anomaly and evidence record IDs are preserved.
 * - Associations are candidates, not proof of wrongdoing.
 * - An association requires matching IP or user plus temporal proximity.
 * - Aggregated activity records are not treated as individual events.
 */

const DEFAULT_TIME_WINDOW_SECONDS = 120;

function getTimeDifferenceSeconds(first, second) {
  const firstTime = new Date(first).getTime();
  const secondTime = new Date(second).getTime();

  if (
    !Number.isFinite(firstTime) ||
    !Number.isFinite(secondTime)
  ) {
    return null;
  }

  return Math.abs(firstTime - secondTime) / 1000;
}

export function associateAnomalies(
  anomalies,
  observations,
  options = {}
) {
  if (!Array.isArray(anomalies)) {
    throw new Error("Anomalies must be an array.");
  }

  if (!Array.isArray(observations)) {
    throw new Error("Observations must be an array.");
  }

  const timeWindowSeconds =
    options.timeWindowSeconds ??
    DEFAULT_TIME_WINDOW_SECONDS;

  if (
    !Number.isFinite(timeWindowSeconds) ||
    timeWindowSeconds < 0
  ) {
    throw new Error(
      "Time window must be a non-negative number."
    );
  }

  const results = [];

  for (const anomaly of anomalies) {
    const candidates = [];

    for (const observation of observations) {
      const timeDifferenceSeconds =
        getTimeDifferenceSeconds(
          anomaly.timestamp,
          observation.timestamp
        );

      if (timeDifferenceSeconds === null) {
        continue;
      }

      if (timeDifferenceSeconds > timeWindowSeconds) {
        continue;
      }

      const matchingIP =
        Boolean(anomaly.ip) &&
        Boolean(observation.ip) &&
        anomaly.ip === observation.ip;

      const matchingUser =
        Boolean(anomaly.user) &&
        Boolean(observation.user) &&
        anomaly.user.toLowerCase() ===
          observation.user.toLowerCase();

      /*
       * IP matching is a useful lead.
       * User-only matches are weaker because a user's
       * aggregate activity does not identify one specific event.
       */
      if (!matchingIP && !matchingUser) {
        continue;
      }

      candidates.push({
        recordId: observation.recordId,
        source: observation.source,
        action: observation.action,
        timestamp: observation.timestamp,
        timeDifferenceSeconds:
          Number(timeDifferenceSeconds.toFixed(2)),
        matchBasis: [
          ...(matchingIP ? ["ip"] : []),
          ...(matchingUser ? ["user"] : [])
        ],
        associationType: matchingIP
          ? "matching-ip-candidate"
          : "matching-user-candidate",
        requiresReview: true
      });
    }

    candidates.sort(
      (a, b) =>
        a.timeDifferenceSeconds -
        b.timeDifferenceSeconds
    );

    results.push({
      anomalyId: anomaly.id ?? null,
      anomalyEventId: anomaly.event_id ?? null,
      anomalyTimestamp: anomaly.timestamp,
      anomalyUser: anomaly.user ?? null,
      anomalyIP: anomaly.ip ?? null,
      anomalyScore: anomaly.score,
      candidates
    });
  }

  return results;
}