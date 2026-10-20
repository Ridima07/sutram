
import { systemLog } from "./data/systemLog.js";
import { fileAccessLog } from "./data/fileAccessLog.js";
import { usbLog } from "./data/usbLog.js";
import { networkLog } from "./data/networkLog.js";

import { normalizeEvents } from "./logic/normalizeEvents.js";
import { correlateEvents } from "./logic/correlateEvents.js";
import { correlationsToGraphEdges } from "./logic/graphAdapter.js";

const rawRecords = [
  ...systemLog,
  ...fileAccessLog,
  ...usbLog,
  ...networkLog,
];

const events = normalizeEvents(rawRecords);
const correlations = correlateEvents(events);
const graphEdges = correlationsToGraphEdges(correlations);

console.log("Computed correlations:", correlations.length);
console.log("Graph-ready edges:", graphEdges.length);
console.log(JSON.stringify(graphEdges, null, 2));
