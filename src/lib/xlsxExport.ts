// Zero-dependency OOXML (.xlsx) spreadsheet generator with embedded PNG logo support

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntryInput {
  name: string;
  data: Uint8Array;
}

function buildZipArchive(entries: ZipEntryInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);

    // Local File Header (30 bytes + name)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 filename flag
    lv.setUint16(8, 0, true); // STORE (no compression)
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, data);

    // Central Directory Header (46 bytes + name)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralSize = centralParts.reduce((acc, part) => acc + part.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const totalSize = offset + centralSize + eocd.length;
  const archive = new Uint8Array(totalSize);
  let cursor = 0;
  for (const part of localParts) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    archive.set(part, cursor);
    cursor += part.length;
  }
  archive.set(eocd, cursor);
  return archive;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colLetter(colIndexZeroBased: number): string {
  let n = colIndexZeroBased + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export interface ReportTripRow {
  date: string;
  origin: string;
  destination: string;
  distance_km: number;
  vehicle_name: string;
  purpose: string;
  fuel_cost: number;
  fare: number;
  net_amount: number;
}

export interface ExcelReportPayload {
  periodLabel: string;
  accountName: string;
  roleLabel: string;
  municipality: string;
  generatedAt: string;
  tripCount: number;
  distanceKm: number;
  fuelCost: number;
  fares: number;
  netEarnings: number;
  trips: ReportTripRow[];
  logoBytes?: Uint8Array | null;
}

function inlineStrCell(ref: string, text: string, style = 0): string {
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t>${escapeXml(text)}</t></is></c>`;
}

function numCell(ref: string, num: number, style = 4): string {
  const safe = Number.isFinite(num) ? num : 0;
  return `<c r="${ref}" s="${style}"><v>${safe}</v></c>`;
}

export function buildBrandedReportXlsx(payload: ExcelReportPayload): Uint8Array {
  const encoder = new TextEncoder();
  const hasLogo = Boolean(payload.logoBytes && payload.logoBytes.length > 0);

  const rowsXml: string[] = [];

  // Rows 1-3: Branded Header Banner (Col A reserved for square logo)
  rowsXml.push(
    `<row r="1" ht="26" customHeight="1">${inlineStrCell('B1', 'BYAHE NI BAI — BOHOL TRANSPORT REPORT', 1)}</row>`
  );
  rowsXml.push(
    `<row r="2" ht="18" customHeight="1">${inlineStrCell(
      'B2',
      `${payload.periodLabel} • Driver: ${payload.accountName} (${payload.roleLabel}) • ${payload.municipality}, Bohol`,
      2
    )}</row>`
  );
  rowsXml.push(
    `<row r="3" ht="18" customHeight="1">${inlineStrCell('B3', `Generated: ${payload.generatedAt}`, 2)}</row>`
  );

  // Row 5: Summary Strip
  rowsXml.push(
    `<row r="5" ht="20" customHeight="1">` +
      inlineStrCell('A5', 'Summary', 6) +
      inlineStrCell('B5', `Trips: ${payload.tripCount}`, 6) +
      inlineStrCell('C5', `Distance: ${payload.distanceKm} km`, 6) +
      inlineStrCell('D5', `Fuel: PHP ${payload.fuelCost.toFixed(2)}`, 6) +
      inlineStrCell('E5', `Fares: PHP ${payload.fares.toFixed(2)}`, 6) +
      inlineStrCell('F5', `Net: PHP ${payload.netEarnings.toFixed(2)}`, 6) +
    `</row>`
  );

  // Row 7: Table Headers
  const headers = [
    'Date',
    'Origin',
    'Destination',
    'Distance (km)',
    'Vehicle',
    'Purpose',
    'Fuel (PHP)',
    'Fare (PHP)',
    'Net (PHP)',
  ];
  rowsXml.push(
    `<row r="7" ht="22" customHeight="1">${headers
      .map((h, idx) => inlineStrCell(`${colLetter(idx)}7`, h, 3))
      .join('')}</row>`
  );

  // Row 8+: Trip Rows
  payload.trips.forEach((trip, i) => {
    const r = 8 + i;
    rowsXml.push(
      `<row r="${r}">` +
        inlineStrCell(`A${r}`, trip.date, 4) +
        inlineStrCell(`B${r}`, trip.origin, 4) +
        inlineStrCell(`C${r}`, trip.destination, 4) +
        numCell(`D${r}`, trip.distance_km, 5) +
        inlineStrCell(`E${r}`, trip.vehicle_name, 4) +
        inlineStrCell(`F${r}`, trip.purpose, 4) +
        numCell(`G${r}`, trip.fuel_cost, 5) +
        numCell(`H${r}`, trip.fare, 5) +
        numCell(`I${r}`, trip.net_amount, 5) +
      `</row>`
    );
  });

  // Totals Row
  const totalRowNum = 8 + payload.trips.length;
  rowsXml.push(
    `<row r="${totalRowNum}" ht="20" customHeight="1">` +
      inlineStrCell(`A${totalRowNum}`, 'TOTAL', 6) +
      inlineStrCell(`B${totalRowNum}`, `${payload.trips.length} trip(s)`, 6) +
      inlineStrCell(`C${totalRowNum}`, '', 6) +
      numCell(`D${totalRowNum}`, payload.distanceKm, 6) +
      inlineStrCell(`E${totalRowNum}`, '', 6) +
      inlineStrCell(`F${totalRowNum}`, '', 6) +
      numCell(`G${totalRowNum}`, payload.trips.reduce((a, t) => a + t.fuel_cost, 0), 6) +
      numCell(`H${totalRowNum}`, payload.trips.reduce((a, t) => a + t.fare, 0), 6) +
      numCell(`I${totalRowNum}`, payload.trips.reduce((a, t) => a + t.net_amount, 0), 6) +
    `</row>`
  );

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="14" customWidth="1"/>
    <col min="2" max="2" width="24" customWidth="1"/>
    <col min="3" max="3" width="24" customWidth="1"/>
    <col min="4" max="4" width="14" customWidth="1"/>
    <col min="5" max="5" width="22" customWidth="1"/>
    <col min="6" max="6" width="18" customWidth="1"/>
    <col min="7" max="9" width="14" customWidth="1"/>
  </cols>
  <sheetData>${rowsXml.join('')}</sheetData>
  ${hasLogo ? '<drawing r:id="rId1"/>' : ''}
</worksheet>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="1">
    <numFmt numFmtId="164" formatCode="#,##0.00"/>
  </numFmts>
  <fonts count="4">
    <font><sz val="10"/><name val="Calibri"/></font>
    <font><b/><sz val="14"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><sz val="10"/><color rgb="FF475569"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="4">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0284C7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border/>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="7">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
    <xf numFmtId="164" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasLogo ? '<Default Extension="png" ContentType="image/png"/>' : ''}
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${hasLogo ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' : ''}
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Byahe ni Bai Report" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const entries: ZipEntryInput[] = [
    { name: '[Content_Types].xml', data: encoder.encode(contentTypesXml) },
    { name: '_rels/.rels', data: encoder.encode(rootRelsXml) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(workbookRelsXml) },
    { name: 'xl/styles.xml', data: encoder.encode(stylesXml) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) },
  ];

  if (hasLogo && payload.logoBytes) {
    const sheetRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`;

    // 72x72px logo anchored at A1 (685800 EMU = 72 * 9525)
    const drawingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:oneCellAnchor>
    <xdr:from>
      <xdr:col>0</xdr:col>
      <xdr:colOff>38100</xdr:colOff>
      <xdr:row>0</xdr:row>
      <xdr:rowOff>19050</xdr:rowOff>
    </xdr:from>
    <xdr:ext cx="685800" cy="685800"/>
    <xdr:pic>
      <xdr:nvPicPr>
        <xdr:cNvPr id="1" name="Byahe ni Bai Logo"/>
        <xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr>
      </xdr:nvPicPr>
      <xdr:blipFill>
        <a:blip r:embed="rId1"/>
        <a:stretch><a:fillRect/></a:stretch>
      </xdr:blipFill>
      <xdr:spPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="685800" cy="685800"/></a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>
</xdr:wsDr>`;

    const drawingRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.png"/>
</Relationships>`;

    entries.push(
      { name: 'xl/worksheets/_rels/sheet1.xml.rels', data: encoder.encode(sheetRelsXml) },
      { name: 'xl/drawings/drawing1.xml', data: encoder.encode(drawingXml) },
      { name: 'xl/drawings/_rels/drawing1.xml.rels', data: encoder.encode(drawingRelsXml) },
      { name: 'xl/media/logo.png', data: payload.logoBytes }
    );
  }

  return buildZipArchive(entries);
}
