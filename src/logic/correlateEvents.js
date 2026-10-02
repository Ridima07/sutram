/**
 * Finds meaningful relationships between independently
 * observed forensic events.
 *
 * Correlation requires:
 * - different evidence sources
 * - close timestamps
 * - compatible actions
 * - meaningful shared entities
 *
 * Device alone is NOT enough to establish a correlation.
 */

const TIME_WINDOW_MS = 5 * 1000; // 5 seconds

function getSharedEntities(a, b) {
  const shared = [];

  if (a.user && b.user && a.user === b.user) {
    shared.push(`user:${a.user}`);
  }

  if (a.device && b.device && a.device === b.device) {
    shared.push(`device:${a.device}`);
  }

  if (a.file && b.file && a.file === b.file) {
    shared.push(`file:${a.file}`);
  }

  if (a.usb && b.usb && a.usb === b.usb) {
    shared.push(`usb:${a.usb}`);
  }

  if (a.ip && b.ip && a.ip === b.ip) {
    shared.push(`ip:${a.ip}`);
  }

  // FILE-002 uses destination: USB-003
  // while USB-002 uses usb: USB-003.
  if (
    a.destination &&
    b.usb &&
    a.destination === b.usb
  ) {
    shared.push(`target:${a.destination}`);
  }

  if (
    b.destination &&
    a.usb &&
    b.destination === a.usb
  ) {
    shared.push(`target:${b.destination}`);
  }

  if (
    a.destination &&
    b.ip &&
    a.destination === b.ip
  ) {
    shared.push(`target:${a.destination}`);
  }

  if (
    b.destination &&
    a.ip &&
    b.destination === a.ip
  ) {
    shared.push(`target:${b.destination}`);
  }

  return shared;
}


// Actions that describe the same underlying activity
// from different evidence sources.
function areCompatibleActions(actionA, actionB) {
  const pair = new Set([actionA, actionB]);

  return (
    pair.has("FILE_ACCESS") && pair.has("READ") ||
    pair.has("COPY") && pair.has("FILE_WRITE") ||
    pair.has("NETWORK_CONNECTION") && pair.has("CONNECTION") ||
    pair.has("TRANSFER") && pair.has("OUTBOUND_TRANSFER")
  );
}


export function correlateEvents(events) {
  if (!Array.isArray(events)) {
    throw new Error("Events must be provided as an array.");
  }

  const correlations = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const first = events[i];
      const second = events[j];

      // Same source does not count as independent corroboration.
      if (first.source === second.source) {
        continue;
      }

      const timeDifference = Math.abs(
        new Date(second.timestamp).getTime() -
          new Date(first.timestamp).getTime()
      );

      if (timeDifference > TIME_WINDOW_MS) {
        continue;
      }

      const sharedEntities = getSharedEntities(first, second);

      if (sharedEntities.length === 0) {
        continue;
      }

      const compatibleActions = areCompatibleActions(
        first.action,
        second.action
      );

      /*
       * Strong correlation:
       * Same underlying activity observed independently
       * by two different sources.
       */
      const sameFile =
        first.file &&
        second.file &&
        first.file === second.file;

      const sameDevice =
        first.device &&
        second.device &&
        first.device === second.device;

      const sameUser =
        first.user &&
        second.user &&
        first.user === second.user;

      const sameUsb =
        first.usb &&
        second.usb &&
        first.usb === second.usb;

      const sameIp =
        first.ip &&
        second.ip &&
        first.ip === second.ip;

      const targetMatch = sharedEntities.some(
        (entity) => entity.startsWith("target:")
      );

      const strongEntityMatch =
        sameFile ||
        sameUsb ||
        sameIp ||
        targetMatch ||
        (sameUser && sameDevice);

      if (!compatibleActions || !strongEntityMatch) {
        continue;
      }

      correlations.push({
        from: first.recordId,
        to: second.recordId,

        relation: "CROSS_SOURCE_CORROBORATION",

        timeDifferenceSeconds: Math.round(
          timeDifference / 1000
        ),

        sharedEntities,

        strength: "strong"
      });
    }
  }

  return correlations;
}