function Timeline({ edges, onEventClick, selectedEdge }) {
  const events = [...edges].sort(
    (a, b) =>
      new Date(a.data.timestamp) -
      new Date(b.data.timestamp)
  );

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="timeline">
      <div className="timeline-header">
        <div>
          <span className="eyebrow">
            CASE RECONSTRUCTION
          </span>

          <h3>Incident Timeline</h3>
        </div>

        <span className="timeline-count">
          {events.length} EVENTS
        </span>
      </div>

      <div className="timeline-list">
        {events.map((event) => {
          const isSelected =
            selectedEdge?.id === event.id;

          return (
            <button
              className={`timeline-item ${
                isSelected ? "selected" : ""
              }`}
              key={event.id}
              onClick={() => onEventClick(event)}
            >
              <div className="timeline-time">
                {formatTime(event.data.timestamp)}
              </div>

              <div className="timeline-dot" />

              <div className="timeline-event">
                <div className="timeline-event-top">
                  <strong>
                    {event.data.relation}
                  </strong>

                  <span>
                    {event.data.recordId}
                  </span>
                </div>

                <p>
                  {event.data.reason}
                </p>

                <small>
                  {event.data.evidence}
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