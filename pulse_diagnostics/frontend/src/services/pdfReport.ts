// services/pdfReport.ts
//
// Generates a detailed, multi-page PDF report for either a skin scan or a symptom check.
// Requires the `jspdf` package:   npm install jspdf
//
// The report includes: patient details (name/age/sex/location), the AI prediction +
// confidence breakdown, the Groq plain-English explanation, recommended next steps,
// the nearest dermatologist found (name + phone, when available), and a disclaimer.

import { jsPDF } from 'jspdf';
import { SkinResult, SymptomResult } from './api';
import { DermatologistResult } from './dermatologist';

export interface PatientInfo {
  name: string;
  age: string;
  sex: string;
  location: string; // human-readable, e.g. "19.0760, 72.8777" or a typed address
}

interface BaseReportArgs {
  patient: PatientInfo;
  explanation: string | null;
  dermatologist: DermatologistResult | null;
}

interface SkinReportArgs extends BaseReportArgs {
  type: 'skin';
  result: SkinResult;
}

interface SymptomReportArgs extends BaseReportArgs {
  type: 'symptom';
  result: SymptomResult;
  symptomsText: string;
}

type ReportArgs = SkinReportArgs | SymptomReportArgs;

const NEON_CYAN = [0, 229, 255];
const NEON_MAGENTA = [255, 45, 120];
const INK = [30, 30, 35];
const MUTED = [110, 110, 120];

function header(doc: jsPDF, title: string) {
  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(...NEON_CYAN);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PULSE.', 14, 17);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 23);
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleString(), 196, 17, { align: 'right' });
  doc.text('AI-Assisted Diagnostic Report', 196, 23, { align: 'right' });
}

function footer(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 285, 196, 285);
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(
    'AI predictions are NOT a medical diagnosis. Always consult a licensed physician.',
    14,
    290
  );
  doc.text(`Page ${pageNum} / ${totalPages}`, 196, 290, { align: 'right' });
}

function sectionTitle(doc: jsPDF, text: string, y: number, accent: number[]) {
  doc.setFillColor(...accent);
  doc.rect(14, y - 4, 2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(text.toUpperCase(), 19, y);
  doc.setDrawColor(230, 230, 230);
  doc.line(19, y + 2, 196, y + 2);
}

function kv(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(label.toUpperCase(), x, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(sanitizeForPdf(value) || '-', x, y + 5);
}

function confidenceBar(doc: jsPDF, label: string, pct: number, y: number, accent: number[]) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(label, 14, y);
  doc.setTextColor(...accent);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pct}%`, 196, y, { align: 'right' });
  doc.setFillColor(235, 235, 240);
  doc.roundedRect(14, y + 1.5, 182, 3, 1.5, 1.5, 'F');
  doc.setFillColor(...accent);
  doc.roundedRect(14, y + 1.5, Math.max(2, (182 * pct) / 100), 3, 1.5, 1.5, 'F');
}

function sanitizeForPdf(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    // strip emoji / pictographs / dingbats / variation selectors that jsPDF's base font can't render
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu,
      ''
    )
    // drop any remaining non-ASCII character (keeps the report readable instead of showing boxes/glyphs)
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5) {
  const lines = doc.splitTextToSize(sanitizeForPdf(text), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function generatePDFReport(args: ReportArgs): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const accent = args.type === 'skin' ? NEON_CYAN : NEON_MAGENTA;
  const totalPages = 2;

  // ───────────── PAGE 1 ─────────────
  header(doc, args.type === 'skin' ? 'Skin Scan Report' : 'Symptom Check Report');

  let y = 42;
  sectionTitle(doc, 'Patient Information', y, accent);
  y += 10;
  kv(doc, 'Name', args.patient.name, 14, y);
  kv(doc, 'Age', args.patient.age, 80, y);
  kv(doc, 'Sex', args.patient.sex, 120, y);
  kv(doc, 'Location', args.patient.location, 150, y);
  y += 16;

  sectionTitle(doc, 'Diagnostic Result', y, accent);
  y += 10;

  if (args.type === 'skin') {
    kv(doc, 'Model', 'CNN Skin Classifier', 14, y);
    kv(doc, 'Prediction', args.result.prediction.toUpperCase(), 80, y);
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('CONFIDENCE BREAKDOWN', 14, y);
    y += 6;
    Object.entries(args.result.all_probabilities).forEach(([cls, val]) => {
      confidenceBar(doc, cls, Math.round(val * 100), y, accent);
      y += 9;
    });
  } else {
    kv(doc, 'Model', 'Bio_ClinicalBERT + Classifier', 14, y);
    kv(doc, 'Top Prediction', args.result.prediction, 80, y);
    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('REPORTED SYMPTOMS', 14, y);
    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    y = wrapText(doc, `"${args.symptomsText}"`, 14, y, 182) + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('TOP 3 LIKELY CONDITIONS', 14, y);
    y += 6;
    args.result.top_3.forEach((item) => {
      confidenceBar(doc, item.disease, Math.round(item.confidence * 100), y, accent);
      y += 9;
    });
  }

  y += 6;
  sectionTitle(doc, 'Groq AI Explanation', y, accent);
  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  wrapText(doc, args.explanation || 'No explanation was generated for this result.', 14, y, 182);

  footer(doc, 1, totalPages);

  // ───────────── PAGE 2 ─────────────
  doc.addPage();
  header(doc, args.type === 'skin' ? 'Skin Scan Report' : 'Symptom Check Report');

  y = 42;
  sectionTitle(doc, 'Recommended Next Steps', y, accent);
  y += 9;
  const steps =
    args.type === 'skin'
      ? [
          'Avoid self-medicating based solely on this AI result.',
          'Photograph the affected area in good lighting over the next few days to track changes.',
          'Book an in-person consultation with a dermatologist for confirmation.',
          'Seek urgent care if you notice rapid spreading, bleeding, severe pain, or fever.',
        ]
      : [
          'This result is a screening aid, not a diagnosis — confirm with a physician.',
          'Keep a log of symptom onset, severity, and any triggers.',
          'Stay hydrated and rested while awaiting a clinical consultation.',
          'Seek urgent/emergency care if symptoms worsen sharply or breathing is affected.',
        ];
  steps.forEach((s) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.circle(16, y - 1.2, 0.8, 'F');
    y = wrapText(doc, s, 20, y, 176) + 3;
  });

  y += 6;
  sectionTitle(doc, 'Nearby Dermatologist', y, accent);
  y += 10;
  if (args.dermatologist && args.dermatologist.source === 'osm') {
    kv(doc, 'Clinic / Doctor', args.dermatologist.name, 14, y);
    kv(
      doc,
      'Phone',
      args.dermatologist.phone || 'Not listed - please call the clinic to confirm',
      120,
      y
    );
    y += 14;
    kv(doc, 'Address', args.dermatologist.address || 'Not available', 14, y);
    kv(
      doc,
      'Approx. Distance',
      args.dermatologist.distanceKm != null ? `${args.dermatologist.distanceKm.toFixed(1)} km` : '-',
      120,
      y
    );
    y += 14;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    y = wrapText(
      doc,
      'No exact clinic match was found in our database for this location.',
      14,
      y,
      182
    ) + 2;
    if (args.dermatologist?.mapsUrl) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...accent);
      doc.textWithLink('-> Search dermatologists near you on Google Maps', 14, y, {
        url: args.dermatologist.mapsUrl,
      });
      y += 7;
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    y = wrapText(
      doc,
      'Alternatively, ask your primary care physician for a referral to a registered dermatologist.',
      14,
      y,
      182
    );
    y += 4;
  }

  y += 8;
  sectionTitle(doc, 'Disclaimer', y, accent);
  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  wrapText(
    doc,
    'This report is generated by an AI-assisted screening tool for educational purposes only. It does not constitute a medical diagnosis, and no clinical decisions should be made based on it without confirmation from a licensed healthcare professional. Pulse and its operators accept no liability for outcomes resulting from reliance on this report.',
    14,
    y,
    182
  );

  footer(doc, 2, totalPages);

  const fileSlug = (args.patient.name || 'patient').replace(/\s+/g, '_').toLowerCase();
  doc.save(`pulse_${args.type}_report_${fileSlug}.pdf`);
}
