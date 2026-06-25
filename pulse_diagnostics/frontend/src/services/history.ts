// services/history.ts
//
// Stores every diagnosis (skin scan or symptom check) so the user can revisit it later.
//
// NOTE on backend: you asked for this to be "saved in the backend". I don't have your
// backend/API code in this conversation, so this is implemented against localStorage
// behind the exact same function signatures a real API call would have
// (saveHistoryEntry / getHistoryEntries / deleteHistoryEntry are all `async`).
// To wire it to a real backend later, just replace the body of each function with a
// fetch() to your endpoint — nothing else in the app needs to change.

export interface SkinHistoryEntry {
  id: string;
  type: 'skin';
  timestamp: number;
  prediction: string;
  all_probabilities: Record<string, number>;
  explanation: string | null;
  imagePreview?: string; // small base64 thumbnail
}

export interface SymptomHistoryEntry {
  id: string;
  type: 'symptom';
  timestamp: number;
  symptomsText: string;
  prediction: string;
  top_3: { disease: string; confidence: number }[];
  explanation: string | null;
}

export type HistoryEntry = SkinHistoryEntry | SymptomHistoryEntry;

const STORAGE_KEY = 'pulse_history_v1';

function readAll(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  const all = readAll();
  all.unshift(entry); // newest first
  writeAll(all);
}

export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  return readAll().sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Downscale an image file to a small base64 thumbnail so history doesn't bloat localStorage.
export function fileToThumbnail(file: File, maxSize = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas unavailable'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
