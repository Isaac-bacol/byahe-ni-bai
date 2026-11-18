export type FuelAdjustmentDirection = 'up' | 'down' | 'mixed' | 'flat';

export interface FuelPriceItemSnapshot {
  price: number;
  change: number;
  changeText: string;
  direction: 'up' | 'down' | 'flat';
  rangeText?: string;
}

export interface FuelPriceNextWeekForecast {
  badge: string;
  targetTuesday: string;
  headline: string;
  details: string;
  direction: FuelAdjustmentDirection;
}

export interface FuelBrandPriceRow {
  brand: string;
  ron91: number | null;
  ron95: number | null;
  ron97: number | null;
  ron100: number | null;
  diesel: number | null;
  dieselPlus: number | null;
  kerosene: number | null;
}

export interface FuelPriceFeedData {
  source: 'https://www.fuelprice.ph';
  sourceName: 'fuelprice.ph';
  effectiveDateIso: string;
  effectiveDateDisplay: string;
  summaryText: string;
  gasoline: FuelPriceItemSnapshot;
  diesel: FuelPriceItemSnapshot;
  premium95: FuelPriceItemSnapshot;
  kerosene: FuelPriceItemSnapshot;
  brands: FuelBrandPriceRow[];
  nextWeek: FuelPriceNextWeekForecast;
  fetchedAt: string;
  isLiveSynced: boolean;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatShortDate(date: Date): string {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getLatestTuesdayDate(now: Date = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay(); // 0=Sun, 1=Mon, 2=Tue
  const diff = (day - 2 + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function getNextTuesdayDate(now: Date = new Date()): Date {
  const latestTue = getLatestTuesdayDate(now);
  const next = new Date(latestTue);
  next.setDate(next.getDate() + 7);
  return next;
}

export function createFallbackFuelPriceFeed(now: Date = new Date()): FuelPriceFeedData {
  const latestTue = getLatestTuesdayDate(now);
  const nextTue = getNextTuesdayDate(now);
  const nextTueShort = `${MONTH_SHORT[nextTue.getMonth()]} ${nextTue.getDate()}`;

  return {
    source: 'https://www.fuelprice.ph',
    sourceName: 'fuelprice.ph',
    effectiveDateIso: latestTue.toISOString().split('T')[0],
    effectiveDateDisplay: formatShortDate(latestTue),
    summaryText:
      'Philippine pump prices updated every Tuesday 6:00 AM via fuelprice.ph. Check live brand and station comparisons before filling up.',
    gasoline: {
      price: 72.29,
      change: -16.8,
      changeText: '-₱16.80 vs last wk',
      direction: 'down',
      rangeText: 'Range ₱59.80 – ₱100.08',
    },
    diesel: {
      price: 90.54,
      change: -4.1,
      changeText: '-₱4.10 vs last wk',
      direction: 'down',
      rangeText: 'Range ₱82.10 – ₱112.36',
    },
    premium95: {
      price: 73.91,
      change: -16.8,
      changeText: '-₱16.80 vs last wk',
      direction: 'down',
    },
    kerosene: {
      price: 116.13,
      change: -3.7,
      changeText: '-₱3.70 vs last wk',
      direction: 'down',
    },
    brands: [
      { brand: 'Petron', ron91: 71.62, ron95: 72.70, ron97: 103.00, ron100: 82.27, diesel: 90.17, dieselPlus: 92.83, kerosene: 114.16 },
      { brand: 'Shell', ron91: 74.82, ron95: 78.53, ron97: 82.13, ron100: null, diesel: 91.94, dieselPlus: 96.33, kerosene: 126.30 },
      { brand: 'Caltex', ron91: 75.13, ron95: 77.93, ron97: null, ron100: 76.30, diesel: 92.04, dieselPlus: 94.37, kerosene: 121.36 },
      { brand: 'Phoenix', ron91: 72.58, ron95: 74.13, ron97: 75.10, ron100: null, diesel: 90.93, dieselPlus: 81.90, kerosene: null },
      { brand: 'Seaoil', ron91: 71.33, ron95: 72.30, ron97: 70.08, ron100: null, diesel: 90.03, dieselPlus: null, kerosene: 125.11 },
    ],
    nextWeek: {
      badge: `Next adjustment · Tue, ${nextTueShort}`,
      targetTuesday: formatShortDate(nextTue),
      headline: 'Awaiting weekly MOPS & DOE estimate',
      details:
        'Early MOPS-based estimates release on Thursday afternoon, followed by industry estimates on Friday and official oil company notices on Monday.',
      direction: 'flat',
    },
    fetchedAt: now.toISOString(),
    isLiveSynced: false,
  };
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8369;|&peso;/gi, '₱')
    .replace(/&minus;/gi, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseChangeAmount(text: string): { change: number; direction: 'up' | 'down' | 'flat' } {
  const normalized = text.replace(/−/g, '-').replace(/,/g, '');
  const match = normalized.match(/([+-]?\s*₱?\s*\d+(?:\.\d+)?)/);
  if (!match) return { change: 0, direction: 'flat' };
  const rawNum = parseFloat(match[1].replace(/[₱\s]/g, ''));
  if (Number.isNaN(rawNum) || rawNum === 0) return { change: 0, direction: 'flat' };
  const isNegative = normalized.includes('-') || /down|rollback/i.test(normalized);
  const signed = isNegative ? -Math.abs(rawNum) : Math.abs(rawNum);
  return {
    change: signed,
    direction: signed > 0 ? 'up' : signed < 0 ? 'down' : 'flat',
  };
}

function extractHfRow(html: string, labelPattern: RegExp): FuelPriceItemSnapshot | null {
  const rowRegex = /<a\b[^>]*class="[^"]*hf-row([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(html)) !== null) {
    const classSuffix = match[1] || '';
    const inner = match[2] || '';
    const nameMatch = inner.match(/<span\b[^>]*class="[^"]*hf-name[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const label = nameMatch ? stripTags(nameMatch[1]) : stripTags(inner);
    if (!labelPattern.test(label)) continue;

    const valMatch = inner.match(/<span\b[^>]*class="[^"]*hf-val[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const valText = valMatch ? stripTags(valMatch[1]) : '';
    const priceMatch = valText.match(/(\d+(?:\.\d+)?)/);
    if (!priceMatch) continue;
    const price = parseFloat(priceMatch[1]);

    const chgMatch = inner.match(/<span\b[^>]*class="[^"]*hf-chg[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const chgText = chgMatch ? stripTags(chgMatch[1]) : '';
    const parsedChg = parseChangeAmount(chgText);

    const rangeMatch = inner.match(/<span\b[^>]*class="[^"]*hf-range[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const rangeText = rangeMatch ? stripTags(rangeMatch[1]) : undefined;

    let direction = parsedChg.direction;
    if (direction === 'flat') {
      if (/\bup\b/i.test(classSuffix)) direction = 'up';
      else if (/\bdown\b/i.test(classSuffix)) direction = 'down';
    }

    return {
      price,
      change: parsedChg.change,
      changeText: chgText || (parsedChg.change === 0 ? 'No change' : `${parsedChg.change > 0 ? '+' : '-'}₱${Math.abs(parsedChg.change).toFixed(2)} vs last wk`),
      direction,
      rangeText,
    };
  }
  return null;
}

function parseCellPrice(cellHtml: string): number | null {
  const priceMatch = cellHtml.match(/<span\b[^>]*class="[^"]*price-val[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  if (!priceMatch) return null;
  const num = parseFloat(stripTags(priceMatch[1]).replace(/[₱,]/g, ''));
  return Number.isNaN(num) ? null : num;
}

function extractBrandGrid(html: string): FuelBrandPriceRow[] {
  const tableMatch = html.match(/<table\b[^>]*class="[^"]*fp-table\s+fp-grid[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return [];
  const tbodyMatch = tableMatch[1].match(/<tbody>([\s\S]*?)<\/tbody>/i);
  const bodyHtml = tbodyMatch ? tbodyMatch[1] : tableMatch[1];

  const rows: FuelBrandPriceRow[] = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch: RegExpExecArray | null;
  while ((trMatch = rowRegex.exec(bodyHtml)) !== null) {
    const cells: string[] = [];
    const tdRegex = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
      cells.push(tdMatch[1]);
    }
    if (cells.length < 7) continue;

    const brandMatch = cells[0].match(/<span\b[^>]*class="[^"]*brand-nm[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
    const brand = brandMatch ? stripTags(brandMatch[1]) : stripTags(cells[0]);
    if (!brand) continue;

    rows.push({
      brand,
      ron91: parseCellPrice(cells[1]),
      ron95: parseCellPrice(cells[2]),
      ron97: parseCellPrice(cells[3]),
      ron100: parseCellPrice(cells[4]),
      diesel: parseCellPrice(cells[5]),
      dieselPlus: parseCellPrice(cells[6]),
      kerosene: cells[7] ? parseCellPrice(cells[7]) : null,
    });
  }

  return rows;
}

export function parseFuelPriceHtml(homeHtml: string, nextWeekHtml?: string): FuelPriceFeedData {
  const now = new Date();
  const base = createFallbackFuelPriceFeed(now);

  // 1. Effective date from JSON-LD dateModified or meta title
  const dateModifiedMatch = homeHtml.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/i);
  if (dateModifiedMatch) {
    const iso = dateModifiedMatch[1];
    const parsed = new Date(`${iso}T06:00:00+08:00`);
    if (!Number.isNaN(parsed.getTime())) {
      base.effectiveDateIso = iso;
      base.effectiveDateDisplay = formatShortDate(parsed);
    }
  }

  // 2. Meta description summary
  const metaDescMatch =
    homeHtml.match(/<meta\s+name="description"\s+content="([^"]+)"/i) ||
    homeHtml.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
  if (metaDescMatch) {
    base.summaryText = stripTags(metaDescMatch[1]);
  }

  // 3. Extract hero fuel rows
  const gasRow = extractHfRow(homeHtml, /gasoline/i);
  if (gasRow) base.gasoline = gasRow;

  const dieselRow = extractHfRow(homeHtml, /diesel/i);
  if (dieselRow) base.diesel = dieselRow;

  const keroseneRow = extractHfRow(homeHtml, /kerosene/i);
  if (keroseneRow) base.kerosene = keroseneRow;

  // 4. Extract Premium 95 from FAQ / JSON-LD text if present
  const prem95Match = homeHtml.match(/Premium\s*95\s*₱(\d+(?:\.\d+)?)/i);
  if (prem95Match) {
    const premPrice = parseFloat(prem95Match[1]);
    if (!Number.isNaN(premPrice)) {
      base.premium95 = {
        ...base.premium95,
        price: premPrice,
        change: base.gasoline.change,
        changeText: base.gasoline.changeText,
        direction: base.gasoline.direction,
      };
    }
  } else if (gasRow) {
    base.premium95 = {
      ...base.premium95,
      price: Math.round((gasRow.price + 1.6) * 100) / 100,
      change: gasRow.change,
      changeText: gasRow.changeText,
      direction: gasRow.direction,
    };
  }

  // 5. Fallback parse from meta description if hf-row wasn't matched
  if (!gasRow && metaDescMatch) {
    const desc = metaDescMatch[1];
    const gasM = desc.match(/gasoline\s*₱(\d+(?:\.\d+)?)\/L\s*(?:\(([^)]+)\))?/i);
    if (gasM) {
      const chg = gasM[2] ? parseChangeAmount(gasM[2]) : { change: 0, direction: 'flat' as const };
      base.gasoline = {
        price: parseFloat(gasM[1]),
        change: chg.change,
        changeText: gasM[2] ? `${gasM[2]} vs last wk` : 'Weekly rate',
        direction: chg.direction,
      };
    }
    const dieM = desc.match(/diesel\s*₱(\d+(?:\.\d+)?)\/L\s*(?:\(([^)]+)\))?/i);
    if (dieM) {
      const chg = dieM[2] ? parseChangeAmount(dieM[2]) : { change: 0, direction: 'flat' as const };
      base.diesel = {
        price: parseFloat(dieM[1]),
        change: chg.change,
        changeText: dieM[2] ? `${dieM[2]} vs last wk` : 'Weekly rate',
        direction: chg.direction,
      };
    }
    const kerM = desc.match(/kerosene\s*₱(\d+(?:\.\d+)?)\/L\s*(?:\(([^)]+)\))?/i);
    if (kerM) {
      const chg = kerM[2] ? parseChangeAmount(kerM[2]) : { change: 0, direction: 'flat' as const };
      base.kerosene = {
        price: parseFloat(kerM[1]),
        change: chg.change,
        changeText: kerM[2] ? `${kerM[2]} vs last wk` : 'Weekly rate',
        direction: chg.direction,
      };
    }
  }

  // 6. Parse next-week forecast (prefer /fuel-price-next-week card, fallback to homepage mini-forecast)
  const forecastSourceHtml = nextWeekHtml && /nw-fc/.test(nextWeekHtml) ? nextWeekHtml : homeHtml;
  const fcMatch = forecastSourceHtml.match(/<div\b[^>]*class="[^"]*(?:nw-fc|mini-forecast)\s*([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
  const fcBlock = fcMatch ? fcMatch[2] : forecastSourceHtml;
  const fcClass = fcMatch ? fcMatch[1] : '';

  let fcDir: FuelAdjustmentDirection = 'flat';
  if (/\bup\b/i.test(fcClass)) fcDir = 'up';
  else if (/\bdown\b/i.test(fcClass)) fcDir = 'down';
  else if (/\bmixed\b/i.test(fcClass)) fcDir = 'mixed';

  const badgeMatch = fcBlock.match(/<span\b[^>]*class="[^"]*(?:nw-fc-badge|mf-badge)[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  const headlineMatch = fcBlock.match(/<div\b[^>]*class="[^"]*(?:nw-fc-headline|mf-headline)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const textMatch = fcBlock.match(/<p\b[^>]*class="[^"]*(?:nw-fc-text|mf-text)[^"]*"[^>]*>([\s\S]*?)<\/p>/i);

  if (badgeMatch || headlineMatch || textMatch) {
    const rawBadge = badgeMatch ? stripTags(badgeMatch[1]) : base.nextWeek.badge;
    const targetTuesday = rawBadge.replace(/^Next adjustment\s*·\s*/i, '').trim() || base.nextWeek.targetTuesday;
    const badgeText = /^next adjustment/i.test(rawBadge) ? rawBadge : `Next adjustment · ${targetTuesday}`;
    const headlineText = headlineMatch ? stripTags(headlineMatch[1]) : base.nextWeek.headline;
    const detailsText = textMatch ? stripTags(textMatch[1]) : base.nextWeek.details;

    base.nextWeek = {
      badge: badgeText,
      targetTuesday,
      headline: headlineText,
      details: detailsText,
      direction: fcDir,
    };
  }

  const brandRows = extractBrandGrid(homeHtml);
  if (brandRows.length > 0) {
    base.brands = brandRows;
  }

  base.fetchedAt = now.toISOString();
  base.isLiveSynced = Boolean(gasRow || dieselRow || metaDescMatch);
  return base;
}

export async function fetchAndParseFuelPricePh(): Promise<FuelPriceFeedData> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; ByaheNiBai/1.0; +https://www.fuelprice.ph)',
      Accept: 'text/html,application/xhtml+xml',
    };

    const [homeRes, nextWeekRes] = await Promise.all([
      fetch('https://www.fuelprice.ph/', { headers, signal: controller.signal }),
      fetch('https://www.fuelprice.ph/fuel-price-next-week', { headers, signal: controller.signal }).catch(() => null),
    ]);

    if (!homeRes.ok) {
      throw new Error(`fuelprice.ph returned HTTP ${homeRes.status}`);
    }

    const homeHtml = await homeRes.text();
    const nextWeekHtml = nextWeekRes && nextWeekRes.ok ? await nextWeekRes.text() : undefined;

    return parseFuelPriceHtml(homeHtml, nextWeekHtml);
  } finally {
    clearTimeout(timeout);
  }
}
