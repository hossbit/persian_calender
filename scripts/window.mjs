const day = 86400000;
// Clamp February 29 to February 28 instead of silently rolling into March.
export function shiftYears(date, offset) {
  const year = date.getUTCFullYear() + offset;
  const month = date.getUTCMonth();
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(date.getUTCDate(), last)));
}
export function calendarWindow(today = new Date()) {
  if (Number.isNaN(+today)) throw new Error('Invalid calendar date');
  const anchor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return { anchor, start: shiftYears(anchor, -10), end: new Date(+shiftYears(anchor, 10) + day) };
}
