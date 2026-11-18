import { BOHOL_MUNICIPALITIES } from './boholData';
import type { FuelType } from '../types';

export interface ParsedReceiptData {
  stationName: string;
  municipality: string;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  date: string; // YYYY-MM-DD
  rawText: string;
  confidence: number;
  isPriceEstimated?: boolean;
  isLitersEstimated?: boolean;
}

/**
 * Pre-processes an image via canvas for better thermal receipt OCR:
 * - Grayscale conversion
 * - High-contrast boost & threshold adjustment to enhance faint dot-matrix/thermal receipts
 */
export async function preprocessReceiptImage(imageFile: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Maintain good resolution, limit max dimension to 2000px for speed
        const maxDim = 2000;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw original
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const d = imgData.data;

          // Min-max normalization and high-contrast boost
          let minVal = 255;
          let maxVal = 0;
          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            if (gray < minVal) minVal = gray;
            if (gray > maxVal) maxVal = gray;
          }

          const range = Math.max(30, maxVal - minVal);

          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            // Normalize across range
            const normalized = ((gray - minVal) / range) * 255;
            // Contrast curve
            const contrast = 1.45;
            const adjusted = ((normalized / 255 - 0.5) * contrast + 0.5) * 255;
            const clamped = Math.max(0, Math.min(255, adjusted));

            d[i] = clamped;
            d[i + 1] = clamped;
            d[i + 2] = clamped;
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        } catch {
          // Fallback if canvas security throws
          resolve(reader.result as string);
        }
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Intelligent regex parser tailored for Philippine Fuel Receipts
 * (Petron, Shell, Caltex, Phoenix, Seaoil, Cleanfuel, etc.)
 */
export function parseReceiptText(text: string): ParsedReceiptData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let detectedBrand = 'Petron';
  let stationName = 'Petron Service Station';
  let municipality = 'Tagbilaran City';
  let fuelType: FuelType = 'Gasoline';
  let liters = 0;
  let pricePerLiter = 0;
  let totalCost = 0;
  let date = new Date().toISOString().slice(0, 10);

  const upperText = text.toUpperCase();

  // 1. Detect Brand
  if (upperText.includes('PETRON')) {
    detectedBrand = 'Petron';
  } else if (upperText.includes('SHELL')) {
    detectedBrand = 'Shell';
  } else if (upperText.includes('CALTEX')) {
    detectedBrand = 'Caltex';
  } else if (upperText.includes('PHOENIX')) {
    detectedBrand = 'Phoenix';
  } else if (upperText.includes('SEAOIL')) {
    detectedBrand = 'Seaoil';
  } else if (upperText.includes('CLEANFUEL')) {
    detectedBrand = 'Cleanfuel';
  }

  // 2. Detect Station Name
  // Check the first 8 lines for station branding or location
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i];
    const uLine = line.toUpperCase();
    if (
      uLine.includes('PETRON') ||
      uLine.includes('SHELL') ||
      uLine.includes('CALTEX') ||
      uLine.includes('PHOENIX') ||
      uLine.includes('SEAOIL') ||
      uLine.includes('CLEANFUEL')
    ) {
      // Clean up common header junk like "CORPORATION" or "STATION"
      if (!uLine.endsWith('CORPORATION') && !uLine.endsWith('INC.') && line.length > 5 && line.length < 50) {
        stationName = line.replace(/[^a-zA-Z0-9\s.-]/g, '').trim();
        break;
      } else {
        stationName = line;
      }
    }
  }

  // 3. Detect Municipality in Bohol
  for (const muni of BOHOL_MUNICIPALITIES) {
    const reg = new RegExp(`\\b${muni}\\b`, 'i');
    if (reg.test(text)) {
      municipality = muni;
      // If station name doesn't have the city, append it nicely
      if (!stationName.toLowerCase().includes(muni.toLowerCase()) && stationName.split(' ').length <= 3) {
        stationName = `${stationName} ${muni}`;
      }
      break;
    }
  }

  // 4. Detect Fuel Type
  if (
    upperText.includes('DIESEL') ||
    upperText.includes('DIESEL MAX') ||
    upperText.includes('TURBO DIESEL') ||
    upperText.includes('V-POWER DIESEL') ||
    upperText.includes('FUELSAVE DIESEL')
  ) {
    fuelType = 'Diesel';
  } else if (
    upperText.includes('XCS') ||
    upperText.includes('BLAZE') ||
    upperText.includes('RON 95') ||
    upperText.includes('RON 97') ||
    upperText.includes('RON 100') ||
    upperText.includes('PREMIUM') ||
    upperText.includes('V-POWER RACING') ||
    upperText.includes('V-POWER GASOLINE') ||
    upperText.includes('PLATINUM')
  ) {
    fuelType = 'Premium 95';
  } else if (
    upperText.includes('REGULAR') ||
    upperText.includes('RON 91') ||
    upperText.includes('SILVER')
  ) {
    fuelType = 'Regular';
  } else {
    fuelType = 'Gasoline';
  }

  // 5. Detect Liters / Volume
  let isLitersEstimated = false;
  let isPriceEstimated = false;
  let isTotalEstimated = false;

  const volumeRegexes = [
    // Standard volume labels (Volume, Vol, Vol(L), Liters, Qty, LTS)
    /(?:VOLUME|VOL|VOL\s*\(L\)|LITERS|LITRES|QTY|QUANTITY|LTS|LTRS)[\s:()L]*[:=]?\s*([0-9]+[.,][0-9]{1,3})/i,
    /([0-9]+[.,][0-9]{2,3})\s*(?:L|LTR|LITERS|Li|Lt)\b/i,
    /\bPUMP[\s0-9]+[\s\S]{1,40}?\b([0-9]+[.,][0-9]{2,3})\s*(?:L|LTR|Li)?\b/i,
  ];

  for (const rx of volumeRegexes) {
    const match = text.match(rx);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (val > 0.1 && val < 500) {
        liters = val;
        break;
      }
    }
  }

  // 6. Detect Unit Price / Price per Liter
  const priceRegexes = [
    /(?:PRICE\s*[/\\]\s*L|UNIT\s*PRICE|P\s*[/\\]\s*L|PRICE\s*PER\s*LITER)[\s:]*(?:PHP|P|₱)?\s*([0-9]+[.,][0-9]{2})/i,
    /@\s*(?:PHP|P|₱)?\s*([0-9]+[.,][0-9]{2})/i,
    /(?:PRICE|U\/P)[\s:]*(?:PHP|P|₱)?\s*([0-9]+[.,][0-9]{2})\s*(?:[/\\]\s*L)?/i,
  ];

  for (const rx of priceRegexes) {
    const match = text.match(rx);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (val >= 40 && val <= 130) {
        pricePerLiter = val;
        break;
      }
    }
  }

  // 7. Detect Total Amount
  const totalRegexes = [
    /(?:TOTAL\s*AMOUNT|TOTAL\s*AMT|AMOUNT\s*DUE|TOTAL\s*DUE|NET\s*AMOUNT|TOTAL\s*PHP|TOTAL\s*P|TOTAL)[\s:]*(?:PHP|P|₱)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /(?:CASH|PAID|SALES)[\s:]*(?:PHP|P|₱)?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /PHP\s*([0-9,]+\.[0-9]{2})/i,
    /₱\s*([0-9,]+(?:\.[0-9]{2})?)/i,
  ];

  for (const rx of totalRegexes) {
    const match = text.match(rx);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '');
      const val = parseFloat(cleaned);
      if (val >= 20 && val <= 20000) {
        totalCost = val;
        break;
      }
    }
  }

  // 8. Cross-Consistency Math Check: Total = Price/L * Liters
  if (liters > 0 && pricePerLiter > 0 && totalCost === 0) {
    totalCost = Math.round(liters * pricePerLiter * 100) / 100;
  } else if (totalCost > 0 && liters > 0 && pricePerLiter === 0) {
    pricePerLiter = Math.round((totalCost / liters) * 100) / 100;
    isPriceEstimated = true;
  } else if (totalCost > 0 && pricePerLiter > 0 && liters === 0) {
    liters = Math.round((totalCost / pricePerLiter) * 100) / 100;
    isLitersEstimated = true;
  }

  // 9. Detect Date (DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD)
  let dateDetected = false;
  const dateRegex = /(?:DATE|PETSA)?[\s:]*([0-9]{1,4}[/.-][0-9]{1,2}[/.-][0-9]{1,4})/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch && dateMatch[1]) {
    const rawDate = dateMatch[1].replace(/\./g, '/').replace(/-/g, '/');
    const parts = rawDate.split('/');
    if (parts.length === 3) {
      let y = parseInt(parts[0], 10);
      let m = parseInt(parts[1], 10);
      let d = parseInt(parts[2], 10);

      // Handle DD/MM/YYYY or MM/DD/YYYY
      if (parts[2].length === 4) {
        y = parseInt(parts[2], 10);
        if (parseInt(parts[0], 10) > 12) {
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
        } else {
          m = parseInt(parts[0], 10);
          d = parseInt(parts[1], 10);
        }
      }

      if (y >= 2020 && y <= 2030 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        const mm = String(m).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        date = `${y}-${mm}-${dd}`;
        dateDetected = true;
      }
    }
  }

  // Fallbacks if optical recognition missed specific numbers
  if (stationName === 'Petron Service Station' && detectedBrand) {
    stationName = `${detectedBrand} ${municipality}`;
  }

  if (pricePerLiter === 0) {
    pricePerLiter = 63.85; // Baseline Bohol gasoline benchmark
    isPriceEstimated = true;
  }

  if (liters === 0 && totalCost > 0) {
    liters = Math.round((totalCost / pricePerLiter) * 100) / 100;
    isLitersEstimated = true;
  } else if (liters === 0) {
    liters = 3.0;
    isLitersEstimated = true;
  }

  if (totalCost === 0) {
    totalCost = Math.round(liters * pricePerLiter * 100) / 100;
    isTotalEstimated = true;
  }

  // Realistic confidence calculation: only score fields actually detected in raw text
  let confidenceScore = 0;
  const brandDetected = upperText.includes('PETRON') || upperText.includes('SHELL') || upperText.includes('CALTEX') || upperText.includes('PHOENIX');
  if (brandDetected) confidenceScore += 20;
  if (dateDetected) confidenceScore += 20;
  if (!isPriceEstimated) confidenceScore += 25;
  if (!isLitersEstimated) confidenceScore += 25;
  if (!isTotalEstimated) confidenceScore += 10;

  const confidence = Math.max(30, Math.min(100, confidenceScore));

  return {
    stationName,
    municipality,
    fuelType,
    liters,
    pricePerLiter,
    totalCost,
    date,
    rawText: text,
    confidence,
    isPriceEstimated,
    isLitersEstimated,
  };
}
