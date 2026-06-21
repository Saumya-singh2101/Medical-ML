import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface SkinResult {
  prediction: string;
  confidence: number;
  all_probabilities: Record<string, number>;
  explanation?: string | null;
}

export async function predictSkin(file: File): Promise<SkinResult> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/api/predict/skin`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Skin analysis failed.');
  return data;
}

export interface SymptomTop3 {
  disease: string;
  confidence: number;
}

export interface SymptomResult {
  input: string;
  prediction: string;
  top_3: SymptomTop3[];
  explanation?: string | null;
}

export async function predictSymptoms(symptoms: string): Promise<SymptomResult> {
  const res = await fetch(`${API_BASE}/api/predict/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ symptoms }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Symptom analysis failed.');
  return data;
}
