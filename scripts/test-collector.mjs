import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseYearResponse,actionIdFromScript,createSourceClient,SOURCE_URL} from './collector.mjs';
const data=year=>JSON.parse(readFileSync(`data/occasions/${year}.json`,'utf8')).slice(0,55);
const rows=data(1405);
const months=Array.from({length:12},(_,i)=>`<div id="Month_${i}"></div>`).join('');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const names=['فروردین','اردیبهشت','خرداد','تیر','اَمرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const items=rows.flatMap(r=>r.events.map(e=>{
 const [,month,day]=r.date.split('-').map(Number);const flag=e.is_holiday?' __holiday':'';
 return `<div class="EventListItem-module__abc__root"><span class="EventListItem-module__abc__root__date${flag}">${day}<!-- --> ${names[month-1]}</span><span class="EventListItem-module__abc__root__event${flag}">${esc(e.description)}</span></div>`;
})).join('');
const html=`<input id="year" value="1405">${months}${items}<script src="/_next/static/chunks/year.js"></script>`;
const parsed=parseYearResponse(html,1405);
assert.equal(parsed.length,rows.length);
assert.equal(parsed[0].events[0].description,rows[0].events[0].description);
assert.equal(parsed[0].events[0].is_holiday,rows[0].events[0].is_holiday);
assert.throws(()=>parseYearResponse(html,1404),/Wrong year/);
assert.throws(()=>parseYearResponse(html.replace('<div id="Month_11"></div>',''),1405),/twelve months/);
assert.throws(()=>parseYearResponse(`<input id="year" value="1405">${months}`,1405),/No events/);
function actionPayload(year) {
 const months=Array.from({length:12},(_,i)=>({year,month:i+1,event_list:[]}));
 for(const row of data(year))for(const event of row.events){const [,month,day]=row.date.split('-').map(Number);months[month-1].event_list.push({jalali_year:year,jalali_month:month,jalali_day:day,title:event.description,is_holiday:event.is_holiday});}
 return '0:{"a":"$@1"}\n2:T4,test1:'+JSON.stringify({status_code:200,error:null,data:months});
}
assert.equal(parseYearResponse(actionPayload(1404),1404,true).length,data(1404).length);
assert.throws(()=>parseYearResponse(actionPayload(1404),1405,true),/Wrong year/);
assert.throws(()=>parseYearResponse('0:{"error":"broken"}',1404,true),/Missing/);
const hash='a'.repeat(40);
const script=`let w=(0,N.createServerReference)("${hash}",N.callServer,void 0,N.findSourceMapURL,"fetchEventYearlyCalendarAction");`;
assert.equal(actionIdFromScript(script),hash);
assert.equal(actionIdFromScript('no action'),null);
assert.equal(actionIdFromScript(`(0,N.createServerReference)("${'b'.repeat(40)}",N.callServer,void 0,N.findSourceMapURL,"otherAction");`),null);
const calls=[];
const client=createSourceClient({fetcher:async(url,options)=>{
 calls.push([String(url),options]);
 if(options?.method==='POST'){
  assert.equal(options.headers.Origin,new URL(SOURCE_URL).origin);assert.equal(options.headers['Next-Action'],hash);
  assert.equal(options.body,'[1404]');return {ok:true,status:200,text:async()=>actionPayload(1404)};
 }
 return {ok:true,status:200,text:async()=>String(url)===SOURCE_URL?html:script};
}});
assert.equal((await client(1405)).length,55);
assert.equal((await client(1404)).length,55);
assert(calls.some(([url])=>url.endsWith('/_next/static/chunks/year.js')));
assert(calls.every(([url])=>new URL(url).hostname===new URL(SOURCE_URL).hostname));
console.log('Direct Calendar source parser and client checks passed: year proof, holidays, comments/entities, dynamic action and single-source requests.');
