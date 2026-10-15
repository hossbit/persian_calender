import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {calendarWindow} from './window.mjs';
import {escapeText,fold,iso} from './generate.mjs';
import {fetchYear,validateYear,persianKey as key} from './source-data.mjs';
const root='https://raw.githubusercontent.com/hasan-ahani/shamsi-holidays/main/holidays/';
const today=new Date(); const year=Number(key(today).slice(0,4));
mkdirSync('data/occasions',{recursive:true});
const revisions=existsSync('data/occasions/revisions.json')?JSON.parse(readFileSync('data/occasions/revisions.json','utf8')):{};
const sources=[]; const unavailable=[]; const all=new Map();
const previousSources=existsSync('feeds/occasions-status.json')?JSON.parse(readFileSync('feeds/occasions-status.json','utf8')).sources:[];
for(let y=year-10;y<=year+10;y++) {
 const path=`data/occasions/${y}.json`; const url=root+y+'.json'; let rows; let mode='fresh'; let errorMessage;
 let lastSuccess=previousSources.find(source=>source.year===y)?.lastSuccess??null;
 try {
  rows=await fetchYear(url,y);
  lastSuccess=new Date().toISOString();
  writeFileSync(path,JSON.stringify(rows,null,2)+'\n');
 } catch(e) {
  if(existsSync(path)) {rows=validateYear(JSON.parse(readFileSync(path,'utf8')),y); mode='cached'; errorMessage=e.message; console.warn(`Using cached ${y}: ${e.message}`);}
  else {unavailable.push({year:y,error:e.message}); console.warn(`Unavailable ${y}: ${e.message}`); if(y===year) throw e; continue;}
 }
 sources.push({year:y,url,mode,lastSuccess,...(errorMessage?{error:errorMessage}:{})}); for(const row of rows) all.set(row.date,row.events);
}
const fa=s=>s.replace(/[0-9٠-٩]/g,c=>'۰۱۲۳۴۵۶۷۸۹'['٠١٢٣٤٥٦٧٨٩'.includes(c)?'٠١٢٣٤٥٦٧٨٩'.indexOf(c):Number(c)]);
const clean=s=>fa(s.replace(/\s*\[[^\]]*\]/g,'').replace(/[\r\n]+/g,' ').trim());
const header=name=>['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//hossbit//Persian Occasions//FA','CALSCALE:GREGORIAN','METHOD:PUBLISH',`X-WR-CALNAME:${name}`,'REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:P1D'];
const nonholidays=header('مناسبت‌های غیرتعطیل');
const combined=header('تعطیلات و مناسبت‌های ایران'); const holidays=header('تعطیلات ایران'); let count=0;let holidayCount=0;
const {start,end}=calendarWindow(today);
for(let d=start;d<end;d=new Date(+d+86400000)) {
 const date=key(d); const rows=all.get(date); if(!rows?.length)continue;
 for(const [kind,list,target] of [['occasions',rows,combined],['holidays',rows.filter(e=>e.is_holiday),holidays],['non-holidays',rows.filter(e=>!e.is_holiday),nonholidays]]) {
  if(!list.length)continue;
  const estimate=Number(date.slice(0,4))>year;
  const titles=[...new Set(list.map(e=>clean(e.description)))];
  const summary=(estimate?'پیش‌بینی: ':'')+(list.some(e=>e.is_holiday)?'تعطیل: ':'')+titles.join('؛ ');
  const description='تاریخ شمسی: '+fa(date)+'\n'+titles.join('\n')+'\nمنبع: داده‌های تایم، از مخزن عمومی حسن آهنی'+(estimate?'\nتاریخ‌های آینده برآورد منبع هستند و ممکن است تغییر کنند.':'')+'\nتعطیلی‌های اضطراری و استانی تضمین نشده‌اند.';
  const hash=createHash('sha256').update(summary+description).digest('hex');
  // Content revisions are persisted below, so unchanged events keep their revision.
  const id=kind+'-'+iso(d); const previous=revisions[id];
  const revision=previous?.hash===hash?previous:{hash,sequence:(previous?.sequence??-1)+1,stamp:new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z')};
  revisions[id]=revision;
  target.push('BEGIN:VEVENT',`UID:${id}@hossbit.github.io`,`DTSTAMP:${revision.stamp}`,`LAST-MODIFIED:${revision.stamp}`,`SEQUENCE:${revision.sequence}`,`DTSTART;VALUE=DATE:${iso(d)}`,`DTEND;VALUE=DATE:${iso(new Date(+d+86400000))}`,`SUMMARY;LANGUAGE=fa:${escapeText(summary)}`,`DESCRIPTION;LANGUAGE=fa:${escapeText(description)}`,'TRANSP:TRANSPARENT','CLASS:PUBLIC','END:VEVENT');
  if(kind==='occasions')count++;else if(kind==='holidays')holidayCount++;
 }
}
if(count<100||holidayCount<10)throw Error('Too few events; refusing publication');
for(const [name,lines] of [['occasions',combined],['holidays',holidays],['non-holidays',nonholidays]]) {lines.push('END:VCALENDAR');writeFileSync(`feeds/${name}.ics`,lines.map(fold).join('\r\n')+'\r\n');}
writeFileSync('data/occasions/revisions.json',JSON.stringify(revisions,null,2)+'\n');
writeFileSync('feeds/occasions-status.json',JSON.stringify({updated:new Date().toISOString(),events:count,holidays:holidayCount,sources,unavailable,coverage:{start:iso(start),end:iso(new Date(+end-86400000)),availableYears:sources.map(s=>s.year)},futureDates:'برآورد و قابل تغییر'},null,2)+'\n');
console.log({events:count,holidays:holidayCount});
