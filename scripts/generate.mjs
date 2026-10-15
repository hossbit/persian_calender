import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {calendarWindow} from './window.mjs';

const day = 86400000;
const persian = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext', {timeZone:'UTC', year:'numeric', month:'long', day:'numeric', weekday:'long'});
const gregorian = new Intl.DateTimeFormat('fa-IR-u-ca-gregory-nu-arabext', {timeZone:'UTC', year:'numeric', month:'long', day:'numeric'});
export const iso = d => d.toISOString().slice(0,10).replaceAll('-','');
export const escapeText = s => s.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(';','\\;').replaceAll(',','\\,');
export function fold(line) {
  const chunks=[]; let chunk=''; let bytes=0;
  for (const char of line) {
    const size=Buffer.byteLength(char);
    if(bytes+size>75) { chunks.push(chunk); chunk=' '; bytes=1; }
    chunk+=char; bytes+=size;
  }
  chunks.push(chunk); return chunks.join('\r\n');
}
export function event(date) {
  const parts=Object.fromEntries(persian.formatToParts(date).map(p=>[p.type,p.value]));
  const summary=`${parts.day} ${parts.month}`;
  const fullDate=`${parts.weekday}، ${parts.day} ${parts.month} ${parts.year}`;
  return ['BEGIN:VEVENT', `UID:persian-${iso(date)}@hossbit.github.io`,
    'DTSTAMP:20261014T165537Z', 'LAST-MODIFIED:20261014T165537Z', 'SEQUENCE:1', `DTSTART;VALUE=DATE:${iso(date)}`,
    `DTEND;VALUE=DATE:${iso(new Date(+date+day))}`,
    `SUMMARY;LANGUAGE=fa:${escapeText(summary)}`,
    `DESCRIPTION;LANGUAGE=fa:${escapeText('تاریخ شمسی: '+fullDate+'\nتاریخ میلادی: '+gregorian.format(date))}`,
    'TRANSP:TRANSPARENT', 'CLASS:PUBLIC', 'END:VEVENT'];
}
export function generate(today=new Date()) {
  const {anchor,start,end}=calendarWindow(today);
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//hossbit//Persian Calendar//FA','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'X-WR-CALNAME:تقویم شمسی روزانه','NAME;LANGUAGE=fa:تقویم شمسی روزانه',
    'X-WR-CALDESC:تاریخ فارسی هر روز با تمدید خودکار و پوشش ده سال گذشته و ده سال آینده',
    'REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:P1D'];
  let count=0;
  for(let date=start;date<end;date=new Date(+date+day)) {lines.push(...event(date));count++;}
  lines.push('END:VCALENDAR');
  return {ics:lines.map(fold).join('\r\n')+'\r\n', status:{updated:anchor.toISOString().slice(0,10),start:start.toISOString().slice(0,10),end:new Date(+end-day).toISOString().slice(0,10),days:count}};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const result=generate(); mkdirSync('feeds',{recursive:true});
  writeFileSync('feeds/persian.ics',result.ics);
  writeFileSync('feeds/status.json',JSON.stringify(result.status,null,2)+'\n');
  console.log(JSON.stringify(result.status));
}
