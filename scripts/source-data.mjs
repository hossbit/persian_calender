// Validate source data independently of its date strings and bound network waits.
const formatter = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
  timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
});
const validYears = new Map();
export function persianKey(date) {
  const parts = Object.fromEntries(formatter.formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
function validDates(year) {
  if (!validYears.has(year)) {
    const dates = new Set();
    const start = Date.UTC(year + 621, 2, 18);
    for (let i = 0; i < 370; i++) {
      const key = persianKey(new Date(start + i * 86400000));
      if (Number(key.slice(0, 4)) === year) dates.add(key);
    }
    validYears.set(year, dates);
  }
  return validYears.get(year);
}
export function validateYear(rows, year) {
  if (!Array.isArray(rows) || rows.length < 50 || rows.length > 366) throw Error('Incomplete or oversized year');
  const dates = validDates(year);
  const seen = new Set();
  for (const row of rows) {
    if (!row || !dates.has(row.date) || seen.has(row.date)) throw Error(`Invalid or duplicate Persian date: ${row?.date}`);
    seen.add(row.date);
    if (!Array.isArray(row.events) || !row.events.length || row.events.length > 100) throw Error('Invalid event list');
    for (const event of row.events) {
      if (!event || typeof event.description !== 'string' || !event.description.trim() ||
          event.description.length > 2000 || typeof event.is_holiday !== 'boolean' ||
          /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(event.description)) throw Error('Invalid event');
    }
  }
  return rows;
}
export async function fetchYear(url, year, { fetcher = fetch, timeoutMs = 8000, decode = response => response.json(), request = {} } = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetcher(url, { ...request, signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      // Keep parsing inside the timeout/retry boundary.
      return validateYear(await decode(response), year);
    } catch (error) {
      const transient = error.retryable || error.name === 'TimeoutError' || error.name === 'AbortError' || error instanceof TypeError;
      if (!transient || attempt === 1) throw error;
    }
  }
}
