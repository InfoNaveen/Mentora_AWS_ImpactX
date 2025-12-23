import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EvaluationRecord } from '../lib/storage';
import { CheckCircle2, AlertTriangle, Lightbulb, ChevronRight, ChevronDown, Download, Share2 } from 'lucide-react';
import { generatePDF } from '../lib/pdf';

// Dynamic import for Recharts to avoid SSR issues
const ScoringRadar = dynamic(() => import('./Charts').then(mod => mod.ScoringRadar), { ssr: false });
const ScoringBar = dynamic(() => import('./Charts').then(mod => mod.ScoringBar), { ssr: false });

interface Props {
  evaluation: EvaluationRecord;
}

export const EvaluationResults: React.FC<Props> = ({ evaluation }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const radarData = [
    { subject: 'Engagement', score: evaluation.scores.engagement_score, fullMark: 10 },
    { subject: 'Coverage', score: evaluation.scores.concept_coverage_score, fullMark: 10 },
    { subject: 'Clarity', score: evaluation.scores.clarity_score, fullMark: 10 },
    { subject: 'Pedagogy', score: evaluation.scores.pedagogy_score, fullMark: 10 },
  ];

  const barData = [
    { name: 'Engagement', score: evaluation.scores.engagement_score },
    { name: 'Coverage', score: evaluation.scores.concept_coverage_score },
    { name: 'Clarity', score: evaluation.scores.clarity_score },
    { name: 'Pedagogy', score: evaluation.scores.pedagogy_score },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-500';
    if (score >= 6) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 6) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Evaluation Results</h2>
          <p className="text-slate-400 text-sm">Session: {evaluation.filename}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => generatePDF(evaluation)} className="aws-button-secondary flex items-center gap-2 py-1.5 px-3">
            <Download size={16} /> Export PDF
          </button>
          <button className="aws-button-secondary flex items-center gap-2 py-1.5 px-3">
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <div className="aws-card lg:col-span-1 flex flex-col items-center justify-center text-center py-10">
          <div className="relative mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364}
                strokeDashoffset={364 - (evaluation.scores.overall_score / 10) * 364}
                className={`${getScoreColor(evaluation.scores.overall_score)} transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{evaluation.scores.overall_score.toFixed(1)}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Overall</span>
            </div>
          </div>
          <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getScoreBg(evaluation.scores.overall_score)} ${getScoreColor(evaluation.scores.overall_score)} border`}>
            {evaluation.scores.overall_score >= 8 ? 'Exceptional' : evaluation.scores.overall_score >= 6 ? 'Competent' : 'Action Required'}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="aws-card lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Metric Distribution</h3>
          <div className="h-[280px]">
            <ScoringRadar data={radarData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detailed Reasoning */}
        <div className="aws-card">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" /> Key Observations
          </h3>
          <div className="space-y-3">
            {evaluation.reasoning.map((reason, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
                <div className="mt-1"><ChevronRight size={14} className="text-emerald-500" /></div>
                <p className="text-sm text-slate-300">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Suggestions */}
        <div className="aws-card">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" /> Actionable Insights
          </h3>
          <div className="space-y-3">
            {evaluation.suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
                <div className="mt-1"><AlertTriangle size={14} className="text-amber-500" /></div>
                <p className="text-sm text-slate-300">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript Preview */}
      <div className="aws-card">
        <button 
          onClick={() => setExpandedSection(expandedSection === 'transcript' ? null : 'transcript')}
          className="w-full flex items-center justify-between group"
        >
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            Session Transcript
          </h3>
          <div className="text-slate-500 group-hover:text-white transition-colors">
            {expandedSection === 'transcript' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </button>
        {expandedSection === 'transcript' && (
          <div className="mt-4 p-4 bg-black/40 rounded border border-white/5 font-mono text-sm text-slate-400 leading-relaxed max-h-[400px] overflow-y-auto">
            {evaluation.transcript}
          </div>
        )}
      </div>
    </div>
  );
};
