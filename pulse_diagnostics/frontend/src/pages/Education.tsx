import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  ExternalLink,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { AuthUser } from '../services/auth';
import { NavBar } from '../components/NavBar';

interface EducationProps {
  user: AuthUser;
  onLogout: () => void;
  currentScreen: string;
  onNavigate: (screen: any) => void;
}

type Condition = 'all' | 'acne' | 'eczema' | 'normal';

interface Video {
  id: string;
  title: string;
  channel: string;
  duration: string;
  condition: Exclude<Condition, 'all'>;
  youtubeId: string;
  description: string;
}

interface Article {
  title: string;
  source: string;
  url: string;
  condition: Exclude<Condition, 'all'>;
  readTime: string;
  description: string;
}

const VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'How to Get Rid of Acne — Dermatologist Tips',
    channel: 'Dr. Dray',
    duration: '14:32',
    condition: 'acne',
    youtubeId: 'BrVkbPBm_70',
    description: 'Board-certified dermatologist explains the science behind acne and evidence-based treatments.',
  },
  {
    id: 'v2',
    title: 'Acne Skincare Routine for Beginners',
    channel: 'James Welsh',
    duration: '12:18',
    condition: 'acne',
    youtubeId: 'E8bGFdHgBqo',
    description: 'Step-by-step morning and evening routine for acne-prone skin with product recommendations.',
  },
  {
    id: 'v3',
    title: 'Eczema — Causes, Symptoms & Treatment',
    channel: 'Osmosis from Elsevier',
    duration: '9:45',
    condition: 'eczema',
    youtubeId: 'aMSiCJBoVrA',
    description: 'Medical-grade explanation of eczema pathophysiology, triggers, and current treatment options.',
  },
  {
    id: 'v4',
    title: 'How I Cured My Eczema Naturally',
    channel: 'Heal Your Gut',
    duration: '16:04',
    condition: 'eczema',
    youtubeId: 'oHg5SJYRHA0',
    description: 'Lifestyle and dietary changes that helped manage chronic eczema — practical tips.',
  },
  {
    id: 'v5',
    title: 'Daily Skincare Routine for Healthy Skin',
    channel: 'Hyram',
    duration: '11:22',
    condition: 'normal',
    youtubeId: '3VAD_BQPJSI',
    description: 'Minimalist skincare routine to maintain healthy, normal skin with accessible products.',
  },
  {
    id: 'v6',
    title: 'The Science of Skin — How Skin Works',
    channel: 'TED-Ed',
    duration: '5:10',
    condition: 'normal',
    youtubeId: 'E8bGFdHgBqo',
    description: 'Animated explanation of how the skin barrier works and why it matters for overall health.',
  },
];

const ARTICLES: Article[] = [
  {
    title: 'Acne: Overview, Causes & Treatment Options',
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/diseases-conditions/acne/symptoms-causes/syc-20368047',
    condition: 'acne',
    readTime: '8 min',
    description: 'Comprehensive overview of acne types, causes, risk factors, and current medical treatments.',
  },
  {
    title: 'Adult Acne: Why You Get It & How to Fight It',
    source: 'WebMD',
    url: 'https://www.webmd.com/skin-problems-and-treatments/acne/acne-adult-women',
    condition: 'acne',
    readTime: '5 min',
    description: 'Covers hormonal acne, diet triggers, and the most effective OTC and prescription options.',
  },
  {
    title: 'Eczema (Atopic Dermatitis) — Symptoms & Causes',
    source: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/diseases-conditions/atopic-dermatitis-eczema/symptoms-causes/syc-20353273',
    condition: 'eczema',
    readTime: '7 min',
    description: 'In-depth guide on eczema symptoms, immune system triggers, and when to see a doctor.',
  },
  {
    title: 'How to Control Eczema Flares',
    source: 'National Eczema Association',
    url: 'https://nationaleczema.org/eczema/treatment/',
    condition: 'eczema',
    readTime: '6 min',
    description: 'Evidence-based strategies to manage flare-ups, moisturizing routines, and treatment hierarchy.',
  },
  {
    title: 'How to Build a Basic Skincare Routine',
    source: 'Healthline',
    url: 'https://www.healthline.com/health/beauty-skin-care/skin-care-routine',
    condition: 'normal',
    readTime: '6 min',
    description: 'Step-by-step guide to cleanser, moisturizer, and SPF for maintaining healthy skin long-term.',
  },
  {
    title: 'Skin Care Tips from Dermatologists',
    source: 'American Academy of Dermatology',
    url: 'https://www.aad.org/public/everyday-care/skin-care-basics/care/skin-care-tips-dermatologists',
    condition: 'normal',
    readTime: '4 min',
    description: 'AAD-recommended daily habits to keep skin healthy regardless of type or age.',
  },
];

const CONDITION_COLORS: Record<Exclude<Condition, 'all'>, { pill: string; text: string; dot: string }> = {
  acne: {
    pill: 'bg-amber/10 border-amber/25',
    text: 'text-amber',
    dot: 'bg-amber',
  },
  eczema: {
    pill: 'bg-magenta/10 border-magenta/25',
    text: 'text-magenta',
    dot: 'bg-magenta',
  },
  normal: {
    pill: 'bg-lime/10 border-lime/25',
    text: 'text-lime',
    dot: 'bg-lime',
  },
};

const TABS: { key: Condition; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'acne', label: 'Acne' },
  { key: 'eczema', label: 'Eczema' },
  { key: 'normal', label: 'Healthy Skin' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <ChevronRight size={12} className="text-slate-600" />
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600">
        {children}
      </span>
      <div className="flex-1 h-[1px] bg-white/[0.04]" />
    </div>
  );
}

function ConditionPill({ condition }: { condition: Exclude<Condition, 'all'> }) {
  const c = CONDITION_COLORS[condition];
  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-0.5 font-mono text-[9px] tracking-[0.12em] uppercase ${c.pill} ${c.text}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {condition}
    </span>
  );
}

export const Education: React.FC<EducationProps> = ({ user, onLogout, currentScreen, onNavigate }) => {  const [activeTab, setActiveTab] = useState<Condition>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredVideos = activeTab === 'all'
    ? VIDEOS
    : VIDEOS.filter((v) => v.condition === activeTab);

  const filteredArticles = activeTab === 'all'
    ? ARTICLES
    : ARTICLES.filter((a) => a.condition === activeTab);

  return (
    <div className="min-h-screen bg-void">
      <NavBar user={user} onLogout={onLogout} currentScreen={currentScreen} onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan to-magenta" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-600">
              Learn
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">
            Education Hub
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Curated videos and articles for acne, eczema, and general skin health.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs tracking-[0.1em] uppercase border transition-all ${
                activeTab === tab.key
                  ? 'bg-cyan/10 border-cyan/30 text-cyan'
                  : 'bg-transparent border-white/[0.07] text-slate-500 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              <Tag size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Videos section */}
        <div className="mb-12">
          <SectionLabel>Video Resources</SectionLabel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-panel/60 border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.14] transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black/40 overflow-hidden">
                  {playingId === video.id ? (
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => setPlayingId(video.id)}
                          className="w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center hover:bg-cyan/80 hover:border-cyan transition-all group-hover:scale-110 active:scale-95"
                        >
                          <Play size={18} className="text-white ml-0.5" fill="white" />
                        </button>
                      </div>
                      {/* Duration badge */}
                      <span className="absolute bottom-2 right-2 font-mono text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-md">
                        {video.duration}
                      </span>
                    </>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <ConditionPill condition={video.condition} />
                    <span className="font-mono text-[10px] text-slate-600">{video.channel}</span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-sm leading-snug mb-2">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{video.description}</p>

                  {playingId !== video.id && (
                    <button
                      onClick={() => setPlayingId(video.id)}
                      className="mt-3 w-full flex items-center justify-center gap-2 border border-white/[0.08] rounded-xl py-2 font-mono text-[10px] tracking-widest uppercase text-slate-400 hover:border-cyan/30 hover:text-cyan transition"
                    >
                      <Play size={11} /> Watch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Articles section */}
        <div className="mb-10">
          <SectionLabel>Articles & Guides</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredArticles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-panel/60 border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.16] transition-colors flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ConditionPill condition={article.condition} />
                    <span className="font-mono text-[9px] text-slate-600 uppercase tracking-wider">
                      {article.readTime} read
                    </span>
                  </div>
                  <ExternalLink
                    size={13}
                    className="text-slate-700 group-hover:text-cyan transition flex-shrink-0 mt-0.5"
                  />
                </div>

                <div>
                  <h3 className="font-display font-semibold text-white text-sm leading-snug mb-1.5 group-hover:text-cyan transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{article.description}</p>
                </div>

                <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/[0.05]">
                  <BookOpen size={11} className="text-slate-600" />
                  <span className="font-mono text-[10px] text-slate-600">{article.source}</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <p className="text-center font-mono text-[10px] tracking-wider uppercase text-slate-700 mt-8">
          ⚠ Educational content only · always consult a licensed dermatologist for diagnosis
        </p>
      </main>
    </div>
  );
};
