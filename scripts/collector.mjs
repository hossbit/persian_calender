import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {fetchYear} from './source-data.mjs';
export const SOURCE_URL = 'https://www.time.ir/event-year';
const parser = fileURLToPath(new URL('./parser.py', import.meta.url));
export function parseYearResponse(text, year, action = false) {
  const result = spawnSync('python3', [parser, ...(action ? ['--rsc'] : []), String(year)], {
    input: text, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 15000,
  });
  if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr.trim() || 'Calendar source parser failed');
  return JSON.parse(result.stdout);
}
export function actionIdFromScript(script) {
  const name = script.indexOf('"fetchEventYearlyCalendarAction"');
  if (name < 0) return null;
  return [...script.slice(Math.max(0, name - 400), name).matchAll(/createServerReference\)\("([0-9a-f]{40,64})"/g)].at(-1)?.[1] ?? null;
}
export function createSourceClient({fetcher = fetch} = {}) {
  let pagePromise;
  let actionPromise;
  const page = () => pagePromise ??= (async () => {
    const response = await fetcher(SOURCE_URL, {signal: AbortSignal.timeout(20000)});
    if (!response.ok) throw Error(`Calendar source page HTTP ${response.status}`);
    return response.text();
  })();
  const discover = () => actionPromise ??= (async () => {
    const html = await page();
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
    const deadline = Date.now() + 25000;
    for (const path of [...new Set(scripts)].reverse()) {
      if (Date.now() > deadline) break;
      const url = new URL(path, SOURCE_URL);
      if (url.origin !== new URL(SOURCE_URL).origin || !url.pathname.startsWith('/_next/static/')) continue;
      try {
        const response = await fetcher(url, {signal: AbortSignal.timeout(5000)});
        if (response.ok) {
          const action = actionIdFromScript(await response.text());
          if (action) return action;
        }
      } catch { /* A missing optional chunk must not prevent checking the next one. */ }
    }
    throw Error('Source year selector changed; keeping validated cached data');
  })();
  return async year => {
    const html = await page();
    const selected = html.match(/<input\b[^>]*\bid="year"[^>]*\bvalue="(\d+)"/);
    if (selected && Number(selected[1]) === year) {
      return fetchYear(SOURCE_URL, year, {
        fetcher: async () => ({ok: true, status: 200, text: async () => html}),
        decode: async response => parseYearResponse(await response.text(), year),
      });
    }
    const action = await discover();
    return fetchYear(SOURCE_URL, year, {
      fetcher, request: {method: 'POST', headers: {
        'Next-Action': action, 'Content-Type': 'text/plain;charset=UTF-8',
        Accept: 'text/x-component', Origin: new URL(SOURCE_URL).origin,
      }, body: JSON.stringify([year])},
      decode: async response => parseYearResponse(await response.text(), year, true),
    });
  };
}
