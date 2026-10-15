import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {escapeText,fold,iso} from './generate.mjs';
const root='https://raw.githubusercontent.com/hasan-ahani/shamsi-holidays/main/holidays/';
const fmt=new Intl.DateTimeFormat('en-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'});
const key=d=>{const p=Object.fromEntries(fmt.formatToParts(d).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;};
const today=new Date(); const year=Number(key(today).slice(0,4));
mkdirSync('data/occasions',{recursive:true});
const revisions=existsSync('data/occasions/revisions.json')?JSON.parse(readFileSync('data/occasions/revisions.json','utf8')):{};
const sources=[]; const all=new Map();
for(let y=year-10;y<=year+10;y++) {
 const path=`data/occasions/${y}.json`; const url=root+y+'.json'; let rows;
 try {
  const res=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!res.ok) throw Error(`HTTP ${res.status}`);
  rows=await res.json();
  if(!Array.isArray(rows)||rows.length<50) throw Error('Incomplete year');
  const seen=new Set();
  for(const r of rows) {
   if(!new RegExp(`^${y}-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$`).test(r.date)||seen.has(r.date)||!Array.isArray(r.events)) throw Error('Invalid date');
   seen.add(r.date);
   for(const e of r.events) if(typeof e.description!=='string'||e.description.length>2000||typeof e.is_holiday!=='boolean') throw Error('Invalid event');
  }
  writeFileSync(path,JSON.stringify(rows,null,2)+'\n');
 } catch(e) {
  if(existsSync(path)) {rows=JSON.parse(readFileSync(path,'utf8')); console.warn(`Using cached ${y}: ${e.message}`);}
  else {console.warn(`Unavailable ${y}: ${e.message}`); if(y===year) throw e; continue;}
 }
 sources.push({year:y,url}); for(const row of rows) all.set(row.date,row.events);
}
const fa=s=>s.replace(/[0-9٠-٩]/g,c=>'۰۱۲۳۴۵۶۷۸۹'['٠١٢٣٤٥٦٧٨٩'.includes(c)?'٠١٢٣٤٥٦٧٨٩'.indexOf(c):Number(c)]);
const clean=s=>fa(s.replace(/\s*\[[^\]]*\]/g,'').replace(/[\r\n]+/g,' ').trim());
const header=name=>['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//hossbit//Persian Occasions//FA','CALSCALE:GREGORIAN','METHOD:PUBLISH',`X-WR-CALNAME:${name}`,'REFRESH-INTERVAL;VALUE=DURATION:P1D','X-PUBLISHED-TTL:P1D'];
const nonholidays=header('مناسبت‌های غیرتعطیل');
const combined=header('تعطیلات و مناسبت‌های ایران'); const holidays=header('تعطیلات ایران'); let count=0;let holidayCount=0;
const start=new Date(Date.UTC(today.getUTCFullYear()-10,today.getUTCMonth(),today.getUTCDate()));
const end=new Date(Date.UTC(today.getUTCFullYear()+10,today.getUTCMonth(),today.getUTCDate()+1));
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
writeFileSync('feeds/occasions-status.json',JSON.stringify({updated:new Date().toISOString(),events:count,holidays:holidayCount,sources,futureDates:'برآورد و قابل تغییر'},null,2)+'\n');
console.log({events:count,holidays:holidayCount});
