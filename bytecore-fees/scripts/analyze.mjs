// node scripts/analyze.mjs nariyawal.csv thiriya.csv
import { readFileSync } from 'node:fs';
import { parseSheet } from '../lib/sheet.js';
const inr = n => '₹' + n.toLocaleString('en-IN');
let all = [], warn = [];
for (const f of process.argv.slice(2)) {
  const { students, warnings } = parseSheet(readFileSync(f, 'utf8'), f.toLowerCase().includes('thiriya') ? 'Thiriya' : 'Nariyawal');
  all.push(...students); warn.push(...warnings);
  const t = students.reduce((a, s) => a + s.total, 0), p = students.reduce((a, s) => a + s.paid, 0);
  console.log(`\n${f}\n  students ${students.length} | total ${inr(t)} | collected ${inr(p)} | due ${inr(students.reduce((a, s) => a + s.due, 0))}`);
  console.log(`  no mobile ${students.filter(s => !s.mobile).length} | fully paid ${students.filter(s => s.total && !s.due).length} | zero payments ${students.filter(s => !s.paid).length} | overpaid ${students.filter(s => s.paid > s.total).length} | total=0 ${students.filter(s => !s.total).length}`);
}
const byMobile = {}; all.filter(s => s.mobile).forEach(s => (byMobile[s.mobile] ||= []).push(s));
const dupRoll = {}; all.forEach(s => s.rolls.forEach(r => (dupRoll[r] ||= []).push(s.id)));
console.log(`\nshared mobiles ${Object.values(byMobile).filter(a => a.length > 1).length} | duplicate rolls ${Object.entries(dupRoll).filter(([, a]) => a.length > 1).map(([r, a]) => r + '→' + a.join('&')).join(', ') || 'none'}`);
console.log('multi-roll students:', all.filter(s => s.rolls.length > 1).map(s => s.rolls.join('+')).join(', ') || 'none');
console.log(`unreadable payment cells: ${warn.length}`); warn.slice(0, 12).forEach(w => console.log('  ' + w));
console.log('\nbiggest dues:'); all.sort((a, b) => b.due - a.due).slice(0, 5).forEach(s => console.log(`  ${s.centre} ${s.rolls[0]} ${s.name} ${s.course} due ${inr(s.due)} of ${inr(s.total)}`));
console.log('\nsample:', JSON.stringify(all.find(s => s.centre === 'Thiriya' && s.payments.length > 1), null, 0));
