import { rawEvents } from "./data/events.js";
import { evidence } from "./data/evidence.js";

import {
  reconstructCase,
  getEventById,
  getSupportingEvidence
} from "./logic/caseReconstruction.js";


// --------------------------------------------------
// 1. RECONSTRUCT CASE TIMELINE
// --------------------------------------------------

const timeline = reconstructCase(rawEvents);

console.log("\n========================================");
console.log("      RECONSTRUCTED CASE TIMELINE");
console.log("========================================\n");

timeline.forEach((event) => {
  console.log(
    `${event.sequence}. ${event.time} — ${event.title}`
  );
});


// --------------------------------------------------
// 2. SHOW EVENT DETAILS
// --------------------------------------------------

console.log("\n========================================");
console.log("           EVENT DETAILS");
console.log("========================================\n");

const selectedEvent = getEventById(timeline, "E-004");

console.log(selectedEvent);


// --------------------------------------------------
// 3. SHOW SUPPORTING EVIDENCE
// --------------------------------------------------

console.log("\n========================================");
console.log("        SUPPORTING EVIDENCE");
console.log("========================================\n");

const supportingEvidenceIds =
  getSupportingEvidence(selectedEvent);

console.log(supportingEvidenceIds);


// --------------------------------------------------
// 4. SHOW COMPLETE EVIDENCE DATASET
// --------------------------------------------------

console.log("\n========================================");
console.log("          EVIDENCE DATASET");
console.log("========================================\n");

console.log(evidence);