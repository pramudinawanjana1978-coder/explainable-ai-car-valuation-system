import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatUsd, formatLkr } from './currency'

// Maps the payload keys already sent to /predict to the labels shown
// in the report. Add/remove a line here if a field is ever added to
// the form — nothing else needs to change.
const VEHICLE_FIELD_LABELS = [
  ['brand', 'Brand'],
  ['model', 'Model'],
  ['year', 'Year'],
  ['mileage_km', 'Mileage (km)'],
  ['engine_size_cc', 'Engine Size (cc)'],
  ['fuel_type', 'Fuel Type'],
  ['transmission', 'Transmission'],
  ['owner_count', 'Previous Owners'],
  ['condition', 'Vehicle Condition'],
  ['city', 'City'],
  ['service_history', 'Service History'],
  ['accident_history', 'Accident History'],
  ['features_count', 'Features Count'],
]

const INK = [30, 33, 38] // near-black text
const MUTED = [120, 126, 134] // grey text
const LINE = [222, 225, 229] // hairline rules
const ACCENT = [200, 140, 45] // amber, used sparingly (price highlight only)
const PANEL = [246, 244, 240] // very light neutral panel background

function formatMileage(value) {
  const num = Number(value)
  return Number.isFinite(num) ? `${new Intl.NumberFormat('en-US').format(num)} km` : String(value)
}

/**
 * Builds and downloads a PDF report for the CURRENT prediction result.
 * Does not call the backend or the ML model — everything it renders was
 * already returned by /predict (and the currency conversion layer) and
 * is simply laid out on the page.
 *
 * @param {Object} params
 * @param {Object} params.vehicleDetails - the exact payload submitted to /predict
 *   (brand, model, year, mileage_km, engine_size_cc, fuel_type, transmission,
 *   owner_count, condition, city, service_history, accident_history, features_count)
 * @param {number} params.predictedPriceUsd - result.predicted_price from /predict
 * @param {Array}  params.explanations - result.explanations from /predict (SHAP-derived)
 * @param {number|null} params.lkrValue - the already-converted LKR amount, or null if not ready
 * @param {boolean} params.isLiveRate - whether lkrValue used a live exchange rate or the fallback
 */
export function generatePredictionReport({
  vehicleDetails,
  predictedPriceUsd,
  explanations = [],
  lkrValue = null,
  isLiveRate = false,
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = 56

  // ---------- Header ----------
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('AI CAR PRICE PREDICTOR', margin, y)

  const generatedOn = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  doc.text(generatedOn, pageWidth - margin, y, { align: 'right' })

  y += 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(...INK)
  doc.text('Vehicle Valuation Report', margin, y)

  y += 14
  doc.setDrawColor(...LINE)
  doc.setLineWidth(1)
  doc.line(margin, y, pageWidth - margin, y)
  y += 28

  // ---------- Vehicle details table ----------
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...INK)
  doc.text('Vehicle Details', margin, y)
  y += 10

  const vehicleRows = VEHICLE_FIELD_LABELS.map(([key, label]) => {
    const raw = vehicleDetails ? vehicleDetails[key] : undefined
    const display = key === 'mileage_km' ? formatMileage(raw) : raw ?? '—'
    return [label, String(display)]
  })

  autoTable(doc, {
    startY: y + 6,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: INK,
      cellPadding: { top: 6, bottom: 6, left: 0, right: 8 },
      lineColor: LINE,
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: MUTED, cellWidth: 170 },
      1: { textColor: INK },
    },
    didParseCell: (data) => {
      // Hairline under every row for a clean table feel without heavy borders
      data.cell.styles.lineWidth = { bottom: 0.5, top: 0, left: 0, right: 0 }
    },
    body: vehicleRows,
  })

  y = doc.lastAutoTable.finalY + 30

  // ---------- Price prediction (highlighted) ----------
  const panelHeight = lkrValue != null ? 92 : 70
  doc.setFillColor(...PANEL)
  doc.roundedRect(margin, y, pageWidth - margin * 2, panelHeight, 8, 8, 'F')

  let priceY = y + 26
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('ESTIMATED PRICE (USD)', margin + 20, priceY)

  priceY += 22
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...ACCENT)
  doc.text(formatUsd(predictedPriceUsd), margin + 20, priceY)

  if (lkrValue != null) {
    priceY += 20
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(`Approx. in Sri Lankan Rupees (LKR): ${formatLkr(lkrValue)}`, margin + 20, priceY)

    priceY += 14
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text(
      isLiveRate
        ? 'Converted using the exchange rate at the time of prediction.'
        : 'Approximate conversion — a live exchange rate was unavailable, so a fallback rate was used.',
      margin + 20,
      priceY,
    )
  }

  y += panelHeight + 30

  // ---------- Why this price? ----------
  const ensureSpace = (needed) => {
    const pageHeight = doc.internal.pageSize.getHeight()
    if (y + needed > pageHeight - 70) {
      doc.addPage()
      y = 56
    }
  }

  if (explanations.length > 0) {
    ensureSpace(40)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...INK)
    doc.text('Why This Price?', margin, y)
    y += 10

    const explanationRows = explanations.map((item) => [
      item.feature ?? '',
      String(item.value ?? ''),
      item.direction === 'increased' ? 'Increased' : 'Reduced',
      item.message ?? '',
    ])

    autoTable(doc, {
      startY: y + 6,
      margin: { left: margin, right: margin },
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        textColor: INK,
        cellPadding: { top: 6, bottom: 6, left: 0, right: 8 },
        lineColor: LINE,
        lineWidth: { bottom: 0.5, top: 0, left: 0, right: 0 },
      },
      head: [['Feature', 'Value', 'Effect', 'Note']],
      headStyles: {
        textColor: MUTED,
        fontStyle: 'bold',
        fontSize: 8.5,
        lineWidth: { bottom: 0.75, top: 0, left: 0, right: 0 },
        lineColor: INK,
      },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 90 },
        2: { cellWidth: 60 },
        3: { cellWidth: 'auto', textColor: MUTED },
      },
      body: explanationRows,
    })

    y = doc.lastAutoTable.finalY + 28

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...MUTED)
    doc.text(
      'These factors show how each detail shifted the estimate relative to a baseline vehicle,',
      margin,
      y,
    )
    y += 12
    doc.text('not an exact dollar amount added or removed.', margin, y)
    y += 26
  }

  // ---------- Disclaimer ----------
  ensureSpace(60)
  doc.setDrawColor(...LINE)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...MUTED)
  const disclaimerLines = doc.splitTextToSize(
    'This is an AI-generated price estimate based on patterns in the training data. The actual ' +
      'market price may differ. The LKR amount shown is an approximate currency conversion of the ' +
      'USD prediction and may change with exchange rates.',
    pageWidth - margin * 2,
  )
  doc.text(disclaimerLines, margin, y)

  // ---------- Footer on every page ----------
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()
    doc.setDrawColor(...LINE)
    doc.line(margin, pageHeight - 46, pageWidth - margin, pageHeight - 46)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('AI Car Price Predictor', margin, pageHeight - 30)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 30, { align: 'right' })
  }

  // ---------- Filename & download ----------
  const brandPart = (vehicleDetails?.brand || 'Vehicle').toString().replace(/\s+/g, '_')
  const modelPart = (vehicleDetails?.model || '').toString().replace(/\s+/g, '_')
  const datePart = new Date().toISOString().slice(0, 10)
  const filename = `Car_Price_Report_${brandPart}${modelPart ? '_' + modelPart : ''}_${datePart}.pdf`

  doc.save(filename)
}
