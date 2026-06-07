// Mirrors number-input.tsx formatRaw/cleanInput.
function groupInt(i){return i.replace(/\B(?=(\d{3})+(?!\d))/g," ");}
function formatRaw(raw){if(!raw)return "";const [i,d]=raw.split(".");const g=groupInt(i||"0");return d!==undefined?`${g}.${d}`:g;}
function cleanInput(text,decimals){let t=text.replace(/\s/g,"").replace(/,/g,".");t=t.replace(decimals?/[^0-9.]/g:/[^0-9]/g,"");if(decimals){const p=t.split(".");if(p.length>2)t=`${p[0]}.${p.slice(1).join("")}`;}return t;}

const cases = [
  ["format 12050", formatRaw("12050"), "12 050"],
  ["format 1000000", formatRaw("1000000"), "1 000 000"],
  ["format 100", formatRaw("100"), "100"],
  ["format 1380.5", formatRaw("1380.5"), "1 380.5"],
  ["format trailing dot 1380.", formatRaw("1380."), "1 380."],
  ["clean '12 050'", cleanInput("12 050", true), "12050"],
  ["clean '1 380,50'", cleanInput("1 380,50", true), "1380.50"],
  ["clean junk 'abc12.3.4'", cleanInput("abc12.3.4", true), "12.34"],
  ["clean no-decimals '1 2a3'", cleanInput("1 2a3", false), "123"],
  ["round-trip", formatRaw(cleanInput("12 050,00", true)), "12 050.00"],
];
let fail=0;
for (const [name,got,want] of cases){const ok=got===want;if(!ok)fail++;console.log(`${ok?"PASS":"FAIL"}  ${name} -> "${got}"`+(ok?"":`  EXPECTED "${want}"`));}
console.log(fail?`\n${fail} failed`:"\nAll number-format cases passed");
process.exit(fail?1:0);
