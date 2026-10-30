const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Formats an ISO-style date (yyyy-mm-dd) into "Aug 10, 2026". */
export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const [y, m, d] = value.slice(0, 10).split("-");
  if (!y || !m || !d) return value;
  return `${MONTHS[Number(m) - 1]} ${d}, ${y}`;
}

/** Formats "yyyy-mm-dd hh:mm" into "10 Aug 2026, 09:05". */
export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const [date, time = ""] = value.split(" ");
  if (!date) return value;
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return value;
  return `${d} ${MONTHS[Number(m) - 1]} ${y}${time ? `, ${time}` : ""}`;
}
