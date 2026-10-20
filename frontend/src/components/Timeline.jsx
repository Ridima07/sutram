
function getEventTime(event) {
  const timestamp = event.data?.timestamp;

  if (timestamp) {
    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Computed correlations currently provide a time difference,
  // not the original timestamps of both source records.
  return null;
}

function formatTime(date) {
  if (!date) return "Time unavailable";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function Timeline({ edges, onEventClick, selectedEdge }) {
  const events = [...edges].sort((a, b) => {
    const timeA = getEventTime(a);
    const timeB = getEventTime(b);

    if (!timeA && !timeB) return a.id.localeCompare(b.id);
    if (!timeA) return 1;
    if (!timeB) return -1;

    return timeA - timeB;
  });

  return (
    <div className="timeline">
      <div className="timeline-header">
        <div>
          <span className="eyebrow">CASE RECONSTRUCTION</span>
          <h3>Incident Timeline</h3>
        </div>

        <span className="timeline-count">
          {events.length} EVENTS
        </span>
      </div>

      <div className="timeline-list">
        {events.map((event) => {
          const isSelected = selectedEdge?.id === event.id;
          const isComputed = event.data?.isComputed === true;
          const timestamp = getEventTime(event);
          const recordIds = event.data?.recordIds ?? [];

          return (
            <button
              className={`timeline-item ${
                isSelected ? "selected" : ""
              }`}
              key={event.id}
              onClick={() => onEventClick(event)}
            >
              <div className="timeline-time">
                {isComputed
                  ? `${event.data.timeDifferenceSeconds ?? "?"}s apart`
                  : formatTime(timestamp)}
              </div>

              <div className="timeline-dot" />

              <div className="timeline-event">
                <div className="timeline-event-top">
                  <strong>
                    {event.data?.relation || event.label || "Evidence event"}
                  </strong>

                  <span>
                    {isComputed
                      ? recordIds.join(" ↔ ")
                      : event.data?.recordId || "Mock record"}
                  </span>
                </div>

                <p>
                  {event.data?.reason || "No explanation available."}
                </p>

                <small>
                  {isComputed
                    ? `COMPUTED CORRELATION · ${event.data?.strength || "unknown"} strength`
                    : `MOCK EVENT · ${event.data?.evidence || "evidence source unavailable"}`}
                </small>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
