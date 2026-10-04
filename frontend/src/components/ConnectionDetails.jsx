import { useState } from "react";

function ConnectionDetails({ edge }) {
  const { data } = edge;

  const [showTrace, setShowTrace] = useState(false);

  const isRisky =
    data.recordId === "SYS-002" ||
    data.recordId === "USB-002" ||
    data.recordId === "NET-002";

  const formattedTime = new Date(
    data.timestamp
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const getEvidenceRecord = () => {
    const records = {
      "SYS-001": {
        source: "system_log",
        fields: [
          ["USER", "Rahul"],
          ["DEVICE", "Laptop-07"],
          ["ACTION", "LOGIN"],
        ],
      },

      "SYS-002": {
        source: "system_log",
        fields: [
          ["USER", "Rahul"],
          ["DEVICE", "Laptop-07"],
          ["ACTION", "FILE_ACCESS"],
          ["FILE", "confidential_report.pdf"],
        ],
      },

      "USB-001": {
        source: "usb_log",
        fields: [
          ["DEVICE", "Laptop-07"],
          ["USB DEVICE", "USB-003"],
          ["ACTION", "CONNECT"],
        ],
      },

      "USB-002": {
        source: "usb_log",
        fields: [
          ["DEVICE", "Laptop-07"],
          ["USB DEVICE", "USB-003"],
          ["ACTION", "FILE_WRITE"],
          ["FILE", "confidential_report.pdf"],
        ],
      },

      "NET-001": {
        source: "network_log",
        fields: [
          ["DEVICE", "Laptop-07"],
          ["IP ADDRESS", "85.21.44.9"],
          ["ACTION", "CONNECTION"],
        ],
      },

      "NET-002": {
        source: "network_log",
        fields: [
          ["DEVICE", "Laptop-07"],
          ["IP ADDRESS", "85.21.44.9"],
          ["ACTION", "OUTBOUND_TRANSFER"],
          ["FILE", "confidential_report.pdf"],
        ],
      },
    };

    return (
      records[data.recordId] || {
        source: data.evidence,
        fields: [],
      }
    );
  };

  const getTrace = () => {
    const traces = {
      e1: [
        ["Rahul", "PERSON"],
        ["Laptop-07", "DEVICE"],
      ],

      e2: [
        ["Rahul", "PERSON"],
        ["Laptop-07", "DEVICE"],
        ["confidential_report.pdf", "FILE"],
      ],

      e3: [
        ["Laptop-07", "DEVICE"],
        ["USB-003", "USB DEVICE"],
      ],

      e4: [
        ["Laptop-07", "DEVICE"],
        ["confidential_report.pdf", "FILE"],
        ["USB-003", "USB DEVICE"],
      ],

      e5: [
        ["Laptop-07", "DEVICE"],
        ["85.21.44.9", "IP ADDRESS"],
      ],

      e6: [
        ["Laptop-07", "DEVICE"],
        ["confidential_report.pdf", "FILE"],
        ["85.21.44.9", "IP ADDRESS"],
      ],
    };

    return (
      traces[edge.id] || [
        [edge.source, "ENTITY"],
        [edge.target, "ENTITY"],
      ]
    );
  };

  const evidenceRecord = getEvidenceRecord();
  const trace = getTrace();

  return (
    <div className="details-content">

      <div className="details-header">
        <span className="eyebrow">
          EVIDENCE CONNECTION
        </span>

        <h2>{data.relation}</h2>
      </div>

      {isRisky && (
        <div className="risk-alert">
          <div className="risk-alert-icon">
            !
          </div>

          <div>
            <strong>
              INVESTIGATION SIGNAL
            </strong>

            <p>
              This event is associated with
              the confidential document
              transfer chain.
            </p>
          </div>
        </div>
      )}

      <div className="connection-path">

        <div>
          <span className="path-label">
            SOURCE
          </span>

          <strong>
            {edge.source}
          </strong>
        </div>

        <span className="large-arrow">
          →
        </span>

        <div>
          <span className="path-label">
            TARGET
          </span>

          <strong>
            {edge.target}
          </strong>
        </div>

      </div>

      <div className="explanation-box">

        <span className="eyebrow">
          WHY ARE THESE CONNECTED?
        </span>

        <p>
          {data.reason}
        </p>

      </div>

      <button
        className="trace-button"
        onClick={() =>
          setShowTrace(!showTrace)
        }
      >
        <span>
          {showTrace ? "▾" : "→"}
        </span>

        {showTrace
          ? "Hide Evidence Trace"
          : "Trace Evidence Chain"}
      </button>

      {showTrace && (
        <div className="trace-panel">

          <span className="eyebrow">
            EVIDENCE TRACE
          </span>

          <div className="trace-chain">

            {trace.map(
              ([name, type], index) => (
                <div key={`${name}-${index}`}>

                  <div className="trace-node">

                    <span>
                      {index + 1}
                    </span>

                    <strong>
                      {name}
                    </strong>

                    <small>
                      {type}
                    </small>

                  </div>

                  {index <
                    trace.length - 1 && (
                    <div className="trace-line" />
                  )}

                </div>
              )
            )}

          </div>

          <p className="trace-note">
            This path is reconstructed from
            correlated forensic events.
          </p>

        </div>
      )}

      <div className="evidence-section">

        <div className="section-title">

          <h3>
            Supporting Evidence
          </h3>

          <span className="verified-badge">
            VERIFIED
          </span>

        </div>

        <div className="detail-card">

          <span>
            EVIDENCE SOURCE
          </span>

          <strong>
            {evidenceRecord.source}
          </strong>

        </div>

        <div className="detail-card">

          <span>
            RECORD ID
          </span>

          <strong>
            {data.recordId}
          </strong>

        </div>

        <div className="detail-card">

          <span>
            EVENT TIMESTAMP
          </span>

          <strong>
            {formattedTime}
          </strong>

        </div>

      </div>

      <div className="raw-evidence">

        <div className="raw-evidence-header">

          <div>
            <span className="eyebrow">
              SOURCE RECORD
            </span>

            <h3>
              {data.recordId}
            </h3>
          </div>

          <span className="record-type">
            {evidenceRecord.source}
          </span>

        </div>

        <div className="evidence-fields">

          {evidenceRecord.fields.map(
            ([label, value]) => (
              <div
                className="evidence-field"
                key={label}
              >
                <span>{label}</span>

                <strong>
                  {value}
                </strong>
              </div>
            )
          )}

          <div className="evidence-field">

            <span>
              TIMESTAMP
            </span>

            <strong>
              {formattedTime}
            </strong>

          </div>

        </div>

      </div>

      <div className="audit-note">

        <span>✓</span>

        <div>

          <strong>
            Evidence-backed relationship
          </strong>

          <p>
            This connection is derived from a
            recorded forensic event and can be
            traced back to its original source
            record.
          </p>

        </div>

      </div>

    </div>
  );
}

export default ConnectionDetails;