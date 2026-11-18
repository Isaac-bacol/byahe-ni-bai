import { jsPDF } from 'jspdf';
import type { Trip, UserProfile } from '../types';

export interface ReportPdfData {
  periodLabel: string;
  period: 'daily' | 'weekly' | 'monthly';
  user: UserProfile;
  tripCount: number;
  distanceKm: number;
  fuelCost: number;
  allowanceBudget: number;
  allowanceRemaining: number;
  fares: number;
  totalExpenses: number;
  netEarnings: number;
  avgFuelPerTrip: number;
  avgDistance: number;
  fuelEfficiency: number;
  trips: Trip[];
}

const formatCurrency = (val: number): string => {
  return `PHP ${Math.round(val).toLocaleString('en-US')}`;
};

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/logo.png?v=3');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportReportToPdf(data: ReportPdfData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // 1. Optional Logo
  const logoDataUrl = await loadLogoDataUrl();
  let textStartX = marginX;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', marginX, 12, 14, 14);
      textStartX = marginX + 17;
    } catch {
      textStartX = marginX;
    }
  }

  // 2. Official Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199); // Sky 600
  doc.text('BYAHE NI BAI • BOHOL TRANSPORT TRACKER (v2.5.0)', textStartX, 16);

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(data.periodLabel.toUpperCase(), textStartX, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  const roleName = data.user.user_type.replace('_', ' ').toUpperCase();
  doc.text(
    `Account: ${data.user.name} (${roleName}) • ${data.user.municipality}, Bohol`,
    textStartX,
    26.5
  );

  // Date Right Aligned
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  const todayStr = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Generated: ${todayStr}`, pageWidth - marginX, 16, { align: 'right' });

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.4);
  doc.line(marginX, 30, pageWidth - marginX, 30);

  // 3. 4 Key Metric Cards
  const cardY = 34;
  const cardHeight = 20;
  const cardGap = 3.5;
  const cardWidth = (contentWidth - cardGap * 3) / 4; // ~42.8mm

  const metrics = [
    {
      label: 'TRIPS COMPLETED',
      value: `${data.tripCount}`,
      color: [2, 132, 199] as [number, number, number], // Sky
    },
    {
      label: 'TOTAL DISTANCE',
      value: `${data.distanceKm} km`,
      color: [13, 148, 136] as [number, number, number], // Teal
    },
    {
      label: 'FUEL SPENDING',
      value: formatCurrency(data.fuelCost),
      color: [217, 119, 6] as [number, number, number], // Amber
    },
    {
      label: data.user.user_type === 'motorist' ? 'REMAINING ALLOWANCE' : 'NET TAKE-HOME',
      value:
        data.user.user_type === 'motorist'
          ? formatCurrency(data.allowanceRemaining)
          : formatCurrency(data.netEarnings),
      color: [5, 150, 105] as [number, number, number], // Emerald
    },
  ];

  metrics.forEach((m, idx) => {
    const x = marginX + idx * (cardWidth + cardGap);

    // Card background
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.label, x + cardWidth / 2, cardY + 6, { align: 'center' });

    // Value
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, x + cardWidth / 2, cardY + 14.5, { align: 'center' });
  });

  // 4. Role Financial Breakdown Panel
  let currentY = 58;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(marginX, currentY, contentWidth, 30, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const panelTitle =
    data.user.user_type === 'motorist'
      ? 'MOTORIST ALLOWANCE SUMMARY'
      : 'DRIVER REVENUE & OPERATING TALLY';
  doc.text(panelTitle, marginX + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  if (data.user.user_type === 'motorist') {
    // Row 1
    doc.text('Total Allowance Budget', marginX + 4, currentY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(data.allowanceBudget), pageWidth - marginX - 4, currentY + 13, {
      align: 'right',
    });

    // Row 2
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Total Fuel & Commute Spent', marginX + 4, currentY + 19);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72); // Rose
    doc.text(formatCurrency(data.fuelCost), pageWidth - marginX - 4, currentY + 19, {
      align: 'right',
    });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX + 4, currentY + 22, pageWidth - marginX - 4, currentY + 22);

    // Row 3
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // Emerald
    doc.text('Remaining Budget Balance', marginX + 4, currentY + 27);
    doc.text(formatCurrency(data.allowanceRemaining), pageWidth - marginX - 4, currentY + 27, {
      align: 'right',
    });
  } else {
    // Driver rows
    doc.text('Gross Passenger Fares Collected', marginX + 4, currentY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatCurrency(data.fares), pageWidth - marginX - 4, currentY + 13, {
      align: 'right',
    });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Fuel & Operating Deductions', marginX + 4, currentY + 19);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72);
    doc.text(`- ${formatCurrency(data.totalExpenses)}`, pageWidth - marginX - 4, currentY + 19, {
      align: 'right',
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(marginX + 4, currentY + 22, pageWidth - marginX - 4, currentY + 22);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('Net Driver Earnings', marginX + 4, currentY + 27);
    doc.text(formatCurrency(data.netEarnings), pageWidth - marginX - 4, currentY + 27, {
      align: 'right',
    });
  }

  // 5. Operational Analytics Cards
  currentY = 92;
  const statCardWidth = (contentWidth - 6) / 3;

  const statCards = [
    {
      label: 'Average Fuel Cost / Trip',
      val: `PHP ${data.avgFuelPerTrip} / trip`,
    },
    {
      label: 'Average Trip Distance',
      val: `${data.avgDistance.toFixed(1)} km`,
    },
    {
      label: 'Fuel Efficiency Average',
      val: `~${data.fuelEfficiency.toFixed(1)} km/L`,
    },
  ];

  statCards.forEach((sc, i) => {
    const x = marginX + i * (statCardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, statCardWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(sc.label, x + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sc.val, x + 3.5, currentY + 12);
  });

  // 6. Detailed Trip Log Table
  currentY = 113;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('TRIP LOG & ROUTE DETAILS', marginX, currentY);

  currentY += 3;
  // Table Header
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(marginX, currentY, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('DATE', marginX + 3, currentY + 4.8);
  doc.text('ROUTE (ORIGIN -> DESTINATION)', marginX + 28, currentY + 4.8);
  doc.text('DISTANCE', marginX + 115, currentY + 4.8, { align: 'right' });
  doc.text('FUEL COST', marginX + 145, currentY + 4.8, { align: 'right' });
  doc.text(
    data.user.user_type === 'motorist' ? 'PURPOSE' : 'FARE / BOUNDARY',
    pageWidth - marginX - 3,
    currentY + 4.8,
    { align: 'right' }
  );

  currentY += 7;

  // Table rows (up to 18 trips fit on page 1)
  const tripsToPrint = data.trips.slice(0, 18);

  if (tripsToPrint.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('No recorded trips found for this report period.', marginX + 3, currentY + 7);
    currentY += 14;
  } else {
    doc.setFontSize(7.5);
    tripsToPrint.forEach((t, index) => {
      // Alternate row shading
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, contentWidth, 6.2, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      const dateStr = t.date ? t.date.slice(0, 10) : '-';
      doc.text(dateStr, marginX + 3, currentY + 4.4);

      const routeStr = `${t.origin || 'Bohol'} -> ${t.destination || 'Destination'}`;
      const truncatedRoute = routeStr.length > 42 ? `${routeStr.slice(0, 39)}...` : routeStr;
      doc.text(truncatedRoute, marginX + 28, currentY + 4.4);

      doc.text(`${(t.distance_km || 0).toFixed(1)} km`, marginX + 115, currentY + 4.4, {
        align: 'right',
      });

      doc.text(`PHP ${(t.fuel_cost || 0).toFixed(0)}`, marginX + 145, currentY + 4.4, {
        align: 'right',
      });

      const lastCol =
        data.user.user_type === 'motorist'
          ? (t.purpose || 'Commute')
          : `PHP ${(t.fare || 0).toFixed(0)}`;
      doc.setFont('helvetica', 'bold');
      doc.text(lastCol, pageWidth - marginX - 3, currentY + 4.4, { align: 'right' });

      currentY += 6.2;
    });
  }

  // 7. Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(marginX, 282, pageWidth - marginX, 282);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Byahe ni Bai • Provincial Transport & Fuel Tracking System • Bohol, Philippines',
    marginX,
    287
  );
  doc.text('Page 1 of 1', pageWidth - marginX, 287, { align: 'right' });

  // Save PDF
  const filename = `Byahe_ni_Bai_${data.period}_Report_${data.user.name.replace(/\s+/g, '_')}_${todayStr.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
