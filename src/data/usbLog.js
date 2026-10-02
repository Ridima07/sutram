// Synthetic USB observations from a separate evidence source.

export const usbLog = [
  {
    source: "usb_log",
    recordId: "USB-001",
    timestamp: "2026-09-21T02:43:02",
    device: "Laptop-07",
    usb: "USB-003",
    action: "CONNECT"
  },

  {
    source: "usb_log",
    recordId: "USB-002",
    timestamp: "2026-09-21T02:44:02",
    device: "Laptop-07",
    usb: "USB-003",
    action: "FILE_WRITE",
    file: "confidential_report.pdf"
  }
];