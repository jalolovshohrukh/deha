import writeXlsxFile from "write-excel-file/node";
const columns = [
  { header: "Сана", key: "date" },
  { header: "Саховатманд", key: "donor" },
  { header: "Маблағ (смн)", key: "amount", type: "number" },
];
const schema = columns.map((c) => ({
  column: c.header,
  type: c.type === "number" ? Number : String,
  value: (r) => {
    const v = r[c.key];
    if (v === "" || v == null) return null;
    return c.type === "number" ? Number(v) : String(v);
  },
  width: 20,
}));
const rows = [
  { date: "07.06.2026", donor: "Аҳмад Раҳимов", amount: 100 },
  { date: "06.06.2026", donor: "Беном", amount: 2000 },
  { date: "Ҷамъ", donor: "", amount: 2100 },
];
const buf = await writeXlsxFile(rows, { schema, buffer: true });
const sig = Buffer.from(buf).slice(0, 2).toString("latin1");
console.log(`xlsx size=${buf.length} bytes, signature="${sig}" -> ${sig === "PK" ? "PASS valid .xlsx" : "FAIL"}`);
process.exit(sig === "PK" ? 0 : 1);
