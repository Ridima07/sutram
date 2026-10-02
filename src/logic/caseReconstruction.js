/**
 * Reconstructs a chronological forensic timeline
 * from events collected from multiple evidence sources.
 *
 * @param {Array} events - Raw forensic events
 * @returns {Array} Chronologically reconstructed timeline
 */
export function reconstructCase(events) {
  if (!Array.isArray(events)) {
    throw new Error("Events must be provided as an array.");
  }

  return [...events]
    .filter((event) => event.timestamp && event.title)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    )
    .map((event, index) => ({
      sequence: index + 1,
      id: event.id,
      timestamp: event.timestamp,

      // Extract time directly from the timestamp.
      // This keeps the displayed time consistent regardless
      // of the computer's timezone.
      time: event.timestamp.slice(11, 19),

      type: event.type,
      title: event.title,
      description: event.description || "",

      subject: event.subject || null,
      device: event.device || null,
      file: event.file || null,
      ip: event.ip || null,
      usb: event.usb || null,

      // Evidence supporting this event
      evidenceIds: event.evidenceIds || []
    }));
}

/**
 * Finds a reconstructed event by its ID.
 *
 * @param {Array} timeline - Reconstructed timeline
 * @param {string} eventId - Event ID
 * @returns {Object|null}
 */
export function getEventById(timeline, eventId) {
  return timeline.find((event) => event.id === eventId) || null;
}

/**
 * Returns the evidence IDs supporting a particular event.
 *
 * @param {Object} event - Reconstructed event
 * @returns {Array}
 */
export function getSupportingEvidence(event) {
  if (!event || !Array.isArray(event.evidenceIds)) {
    return [];
  }

  return event.evidenceIds;
}