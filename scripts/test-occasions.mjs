import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const file of ['occasions','holidays']) {
 const text=readFileSync(`feeds/${file}.ics`,'utf8');
 for(const line of text.split('\r\n'))assert(Buffer.byteLength(line)<=75);
 assert(!/(?<!\r)\n/.test(text));
 const unfolded=text.replaceAll('\r\n ','');const ids=new Set();
 const blocks=unfolded.split('BEGIN:VEVENT\r\n').slice(1);assert(blocks.length>10);
 for(const block of blocks) {
  const uid=block.match(/^UID:(.+)$/m)[1];assert(!ids.has(uid));ids.add(uid);
  const summary=block.match(/^SUMMARY;LANGUAGE=fa:(.+)$/m)[1];assert(/[\u0600-\u06ff]/.test(summary));
  assert(!block.includes('BEGIN:VALARM'));assert(block.includes('TRANSP:TRANSPARENT'));
  if(file==='holidays')assert(summary.includes('تعطیل:'));
 }
 assert(unfolded.includes('جشن نوروز'));
}
console.log('Occasion feeds validated.');
