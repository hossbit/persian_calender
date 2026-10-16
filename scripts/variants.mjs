import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {fold,fullDateLabel} from './generate.mjs';
const parse=name=>{const lines=readFileSync(`feeds/${name}.ics`,'utf8').replaceAll('\r\n ','').split('\r\n');const events=[];let current;
 for(const line of lines){if(line==='BEGIN:VEVENT')current=[];if(current)current.push(line);if(line==='END:VEVENT'){events.push(current);current=undefined;}}
 return events;};
const write=(file,title,events)=>{const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//hossbit//Persian Variants//FA','CALSCALE:GREGORIAN','METHOD:PUBLISH',`X-WR-CALNAME:${title}`,'REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:P1D',...events.flat(),'END:VCALENDAR'];writeFileSync(`feeds/${file}.ics`,lines.map(fold).join('\r\n')+'\r\n');};
const dates=parse('persian');
const dateOf=event=>{const d=event.find(x=>x.startsWith('DTSTART;')).split(':')[1];return new Date(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}T00:00:00Z`);};
const numeric=new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'});
for(const [style,title] of [['full','تاریخ شمسی کامل'],['numeric','تاریخ شمسی عددی'],['weekday','روز هفته و تاریخ کوتاه'],['numeric-short','تاریخ عددی بدون سال']]) {
 const events=dates.map(e=>e.map(line=>{
  if(line.startsWith('UID:'))return line.replace('UID:persian-',`UID:persian-${style}-`);
  if(!line.startsWith('SUMMARY;'))return line;
  const full=fullDateLabel(dateOf(e));
  const parts=Object.fromEntries(numeric.formatToParts(dateOf(e)).map(p=>[p.type,p.value]));
  const text=style==='weekday'?full.replace(/ [۰-۹]{4}$/,''):style==='numeric-short'?`${parts.month}/${parts.day}`:style==='full'?fullDateLabel(dateOf(e)):numeric.format(dateOf(e));
  return 'SUMMARY;LANGUAGE=fa:'+text;
 }));
 write(`persian-${style}`,title,events);
}
for(const [file,title] of [['occasions','تعطیلات و مناسبت‌ها'],['holidays','تعطیلات'],['non-holidays','مناسبت‌های غیرتعطیل']]) {
 write(`${file}-current`,title+'؛ بدون پیش‌بینی سال‌های آینده',parse(file).filter(e=>!e.find(x=>x.startsWith('SUMMARY;')).includes('پیش‌بینی:')));
}
write('combined','تاریخ شمسی، تعطیلات و مناسبت‌ها',[...dates,...parse('occasions')]);
const fridays=dates.filter(e=>dateOf(e).getUTCDay()===5).map(e=>e.map(line=>line.startsWith('UID:')?line.replace('UID:persian-','UID:friday-'):line.startsWith('SUMMARY;')?'SUMMARY;LANGUAGE=fa:جمعه':line));
write('fridays','جمعه‌های تقویم',fridays);
const holidayEvents=parse('holidays'); const holidayDays=new Set(holidayEvents.map(e=>+dateOf(e)));
write('holidays-with-fridays','تعطیلات و جمعه‌ها',[...holidayEvents,...fridays.filter(e=>!holidayDays.has(+dateOf(e)))]);
write('dates-holidays','تاریخ شمسی و فقط تعطیلات',[...dates,...holidayEvents]);
write('combined-current','تاریخ شمسی و مناسبت‌ها بدون پیش‌بینی سال‌های آینده',[...dates,...parse('occasions-current')]);
console.log('Calendar variants generated.');

// A client-neutral catalogue: the same HTTPS URLs are used on every platform.
const calendars = readdirSync('feeds').filter(file => file.endsWith('.ics')).sort().map(file => {
 const text=readFileSync(`feeds/${file}`,'utf8').replaceAll('\r\n ','');
 return {id:file.slice(0,-4),name:text.match(/^X-WR-CALNAME:(.+)$/m)[1].trim(),url:`https://raw.githubusercontent.com/hossbit/persian_calender/main/feeds/${file}`};
});
writeFileSync('feeds/subscriptions.json',JSON.stringify({schemaVersion:1,format:'iCalendar',encoding:'UTF-8',readOnly:true,publisherRefreshInterval:'P1D',calendars},null,2)+'\n');
