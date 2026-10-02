import { systemLog } from "./data/systemLog.js";
import { fileAccessLog } from "./data/fileAccessLog.js";
import { usbLog } from "./data/usbLog.js";
import { networkLog } from "./data/networkLog.js";

import { normalizeEvents } from "./logic/normalizeEvents.js";
import { correlateEvents } from "./logic/correlateEvents.js";
import { reconstructCase } from "./logic/caseReconstruction.js";


// ==================================================
// 1. COLLECT RAW OBSERVATIONS
// ==================================================

const rawRecords = [
  ...systemLog,
  ...fileAccessLog,
  ...usbLog,
  ...networkLog
];

console.log("\n========================================");
console.log("       RAW EVIDENCE OBSERVATIONS");
console.log("========================================\n");

console.log(
  `Total observations: ${rawRecords.length}`
);


// ==================================================
// 2. NORMALIZE
// ==================================================

const normalizedEvents =
  normalizeEvents(rawRecords);

console.log("\n========================================");
console.log("        NORMALIZED EVENTS");
console.log("========================================\n");

normalizedEvents.forEach(
  (event) => {

    console.log(
      `${event.recordId} | ` +
      `${event.source} | ` +
      `${event.action} | ` +
      `${event.timestamp}`
    );
  }
);


// ==================================================
// 3. CORRELATE
// ==================================================

const correlations =
  correlateEvents(
    normalizedEvents
  );

console.log("\n========================================");
console.log("        CROSS-SOURCE CORRELATIONS");
console.log("========================================\n");

console.log(
  `Total meaningful correlations: ${correlations.length}\n`
);

correlations.forEach(
  (correlation) => {

    console.log(
      `${correlation.from} ↔ ${correlation.to}`
    );

    console.log(
      `Relation: ${correlation.relation}`
    );

    console.log(
      `Shared: ${
        correlation.sharedEntities.join(", ")
      }`
    );

    console.log(
      `Time difference: ${
        correlation.timeDifferenceSeconds
      }s`
    );

    console.log(
      `Strength: ${correlation.strength}\n`
    );
  }
);


// ==================================================
// 4. RECONSTRUCT
// ==================================================

const timeline =
  reconstructCase(
    normalizedEvents,
    correlations
  );

console.log("\n========================================");
console.log("      RECONSTRUCTED CASE TIMELINE");
console.log("========================================\n");

timeline.forEach(
  (activity) => {

    console.log(
      `${activity.sequence}. ` +
      `${activity.time} — ` +
      `${activity.description}`
    );

    console.log(
      `   Activity: ${activity.activityId}`
    );

    console.log(
      `   Type: ${activity.type}`
    );

    if (activity.user) {
      console.log(
        `   User: ${activity.user}`
      );
    }

    if (activity.device) {
      console.log(
        `   Device: ${activity.device}`
      );
    }

    if (activity.file) {
      console.log(
        `   File: ${activity.file}`
      );
    }

    if (activity.usb) {
      console.log(
        `   USB: ${activity.usb}`
      );
    }

    if (activity.ip) {
      console.log(
        `   IP: ${activity.ip}`
      );
    }

    console.log(
      `   Sources: ${
        activity.sources.join(", ")
      }`
    );

    console.log(
      `   Supporting records: ${
        activity.supportingRecords.join(", ")
      }`
    );

    console.log(
      `   Observations merged: ${
        activity.observationCount
      }`
    );

    console.log(
      `   Correlation: ${
        activity.correlation
      }`
    );

    console.log(
      `   Evidence support: ${
        activity.supportLevel
      }`
    );

    console.log();
  }
);


// ==================================================
// 5. EVIDENCE SUPPORT SUMMARY
// ==================================================

const stronglyCorroborated =
  timeline.filter(
    (activity) =>
      activity.supportLevel ===
      "strong-corroboration"
  ).length;

const singleSource =
  timeline.filter(
    (activity) =>
      activity.supportLevel ===
      "single-source"
  ).length;

console.log("\n========================================");
console.log("       EVIDENCE SUPPORT SUMMARY");
console.log("========================================\n");

console.log(
  `Strongly corroborated: ${stronglyCorroborated}`
);

console.log(
  `Single-source observations: ${singleSource}`
);


// ==================================================
// 6. FINAL STRUCTURED RESULT
// ==================================================

const result = {

  observationCount:
    normalizedEvents.length,

  correlationCount:
    correlations.length,

  reconstructedActivityCount:
    timeline.length,

  supportSummary: {

    stronglyCorroborated,

    singleSource
  },

  correlations,

  timeline
};


console.log("\n========================================");
console.log("       FINAL RECONSTRUCTION OBJECT");
console.log("========================================\n");

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);