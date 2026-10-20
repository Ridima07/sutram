/**
 * Reconstructs a chronological forensic timeline.
 *
 * Every source observation is retained.
 * Correlations are preserved as relationships between
 * observations rather than discarded when an event is
 * involved in more than one correlation.
 */

export function reconstructCase(events, correlations = []) {
  if (!Array.isArray(events)) {
    throw new Error("Events must be provided as an array.");
  }

  if (!Array.isArray(correlations)) {
    throw new Error("Correlations must be provided as an array.");
  }

  const eventMap = new Map(
    events.map((event) => [event.recordId, event])
  );

  const correlationsByRecord = new Map();

  for (const event of events) {
    correlationsByRecord.set(event.recordId, []);
  }

  // Preserve every valid correlation for both observations.
  for (const correlation of correlations) {
    const first = eventMap.get(correlation.from);
    const second = eventMap.get(correlation.to);

    if (!first || !second) {
      continue;
    }

    correlationsByRecord.get(first.recordId).push(correlation);
    correlationsByRecord.get(second.recordId).push(correlation);
  }

  // Produce one timeline entry per source observation.
  // This avoids losing events or implying that distinct
  // activities are necessarily the same activity.
  const timeline = events.map((event) => {
    const relatedCorrelations =
      correlationsByRecord.get(event.recordId) || [];

    const relatedRecordIds = new Set();

    const sharedEntities = new Set();

    for (const correlation of relatedCorrelations) {
      const otherId =
        correlation.from === event.recordId
          ? correlation.to
          : correlation.from;

      relatedRecordIds.add(otherId);

      for (const entity of correlation.sharedEntities || []) {
        sharedEntities.add(entity);
      }
    }

    const sources = new Set([event.source]);

    for (const relatedId of relatedRecordIds) {
      const relatedEvent = eventMap.get(relatedId);

      if (relatedEvent?.source) {
        sources.add(relatedEvent.source);
      }
    }

    const supportLevel =
      relatedRecordIds.size > 0
        ? "corroborated-observation"
        : "single-source";

    return {
      activityId: `ACT-${event.recordId}`,
      timestamp: event.timestamp,
      time: event.timestamp.slice(11, 19),
      type: event.action,
      description: describeEvent(event),
      user: event.user || null,
      device: event.device || null,
      file: event.file || null,
      usb:
        event.usb ||
        (event.destination?.startsWith("USB-")
          ? event.destination
          : null),
      ip:
        event.ip ||
        (event.destination &&
        /^\d{1,3}(?:\.\d{1,3}){3}$/.test(event.destination)
          ? event.destination
          : null),
      sources: [...sources],
      supportingRecords: [
        event.recordId,
        ...relatedRecordIds,
      ],
      observationCount: 1,
      correlation:
        relatedCorrelations.length > 0 ? "strong" : "single-source",
      supportLevel,
      sharedEntities: [...sharedEntities],
      relatedCorrelations: relatedCorrelations.map((correlation) => ({
        from: correlation.from,
        to: correlation.to,
        relation: correlation.relation,
        strength: correlation.strength,
        sharedEntities: correlation.sharedEntities || [],
      })),
    };
  });

  timeline.sort((a, b) => {
    const timeDifference =
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime();

    return timeDifference ||
      a.activityId.localeCompare(b.activityId);
  });

  return timeline.map((activity, index) => ({
    ...activity,
    sequence: index + 1,
  }));
}

function describeEvent(event) {
  switch (event.action) {
    case "LOGIN":
      return "User login observed";

    case "FAILED_LOGIN":
    case "LOGIN_FAILED":
      return "Failed login attempt observed";

    case "FILE_ACCESS":
    case "READ":
      return "File access observed";

    case "COPY":
    case "FILE_WRITE":
      return "File copied to USB device";

    case "NETWORK_CONNECTION":
    case "CONNECTION":
      return "Network connection observed";

    case "TRANSFER":
    case "OUTBOUND_TRANSFER":
      return "File transfer observed";

    case "CONNECT":
      return "USB device connected";

    default:
      return `${event.action} observed`;
  }
}