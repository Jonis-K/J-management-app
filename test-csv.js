const fs = require('fs');

function parseCsv(csvText) {
  const cleanCsvText = csvText.replace(/^\uFEFF/, "");
  const firstLineEnd = cleanCsvText.indexOf('\n');
  const firstLine = cleanCsvText.slice(0, firstLineEnd > -1 ? firstLineEnd : cleanCsvText.length);
  const delimiter = (!firstLine.includes(',') && firstLine.includes('\t')) ? '\t' : ',';

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < cleanCsvText.length; i++) {
    const char = cleanCsvText[i];
    const nextChar = cleanCsvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some((val) => val !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((val) => val !== "")) rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const parsedData = [];

  rows.slice(1).forEach((cols) => {
    const row = {};
    headers.forEach((h, i) => {
      const rawVal = cols[i] ?? "";
      row[h] = rawVal.replace(/^"|"$/g, "").trim();
    });
    
    if (row.id && !row.member_id) row.member_id = row.id;

    if (headers.includes("name") && !row.name) return;
    if (headers.includes("title") && !row.title) return;
    if (headers.includes("member_id") && !row.member_id) return;

    parsedData.push(row);
  });

  return parsedData;
}

const csvData = `member_id,parent_id,name,age,gender,photo_url,job,dream,role,updated_at
M00001,,石井智大,32,男性,https://example.com/photo1.jpg,アーティスト,組織を拡大する,GM,2026-02-27
M00002,M00001,芦田たくま,32,男性,https://example.com/photo2.jpg,美容師,全国展開する,メンバー,2026-02-27
M00003,M00001,馬場敦大,27,男性,https://example.com/photo3.jpg,ビデオグラファー,教育事業を作る,メンバー,2026-02-27
M00004,M00003,二宮海斗,30,男性,,,,,
M00005,,,,男性,,,,,
`;

console.log(parseCsv(csvData));
