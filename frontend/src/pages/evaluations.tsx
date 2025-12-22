/**
 * Evaluations History Page
 * Shows stored evaluation records with reopen functionality
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { storageService, EvaluationRecord } from '../lib/storage';
import { analytics } from '../lib/analytics';
import { generatePDF } from '../lib/pdf';
import { BarChart2, FileText, Download, Eye, Calendar } from 'lucide-react';

export default function Evaluations() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);

  useEffect(() => {
    analytics.historyOpened();
    const history = storageService.getEvaluationHistory();
    setEvaluations(history);
  }, []);

  const handleReopen = (evaluation: EvaluationRecord) => {
    // Store in session and redirect to dashboard
    sessionStorage.setItem('reopen_evaluation', JSON.stringify(evaluation));
    router.push('/dashboard?reopen=true');
  };

  const handleExport = async (evaluation: EvaluationRecord) => {
    try {
      const institution = storageService.getInstitutionalMetadata();
      await generatePDF(evaluation, institution ? {
        name: institution.institutionName,
        instructor: institution.instructorName,
        subjectCode: institution.subjectCode,
      } : undefined);
      analytics.reportExported(evaluation.id);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#c53030';
  };

  if (evaluations.length === 0) {
    return (
      <Layout title="Evaluations">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Evaluation History</h1>
            <p className="text-slate-400">View and manage past teaching quality evaluations</p>
          </div>

          <div className="bg-[#151a22] border border-[#2d3748] rounded-xl p-8 text-center">
            <BarChart2 className="mx-auto mb-4 text-slate-500" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">No evaluations yet</h3>
            <p className="text-slate-500 mb-6">Start your first evaluation from the dashboard</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Start Evaluation
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Evaluations">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Evaluation History</h1>
            <p className="text-slate-400">View and manage past teaching quality evaluations</p>
          </div>
          <div className="text-sm text-slate-500">
            {evaluations.length} {evaluations.length === 1 ? 'evaluation' : 'evaluations'}
          </div>
        </div>

        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              className="bg-[#151a22] border border-[#2d3748] rounded-xl p-6 hover:border-[#1a73e8]/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="text-[#1a73e8]" size={20} />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{evaluation.filename}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(evaluation.timestamp).toLocaleString()}
                        </div>
                        {evaluation.institution && (
                          <span>{evaluation.institution} • {evaluation.instructor}</span>
                        )}
                        {evaluation.subjectCode && (
                          <span className="font-mono">{evaluation.subjectCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {[
                      { label: 'Engagement', score: evaluation.scores.engagement_score },
                      { label: 'Coverage', score: evaluation.scores.concept_coverage_score },
                      { label: 'Clarity', score: evaluation.scores.clarity_score },
                      { label: 'Pedagogy', score: evaluation.scores.pedagogy_score },
                    ].map((metric) => (
                      <div key={metric.label} className="bg-[#0a0d12] p-2 rounded border border-[#2d3748]">
                        <p className="text-[10px] text-slate-500 mb-1">{metric.label}</p>
                        <p className="text-lg font-bold font-mono" style={{ color: getScoreColor(metric.score) }}>
                          {metric.score.toFixed(1)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold font-mono" style={{ color: getScoreColor(evaluation.scores.overall_score) }}>
                      {evaluation.scores.overall_score.toFixed(1)}
                    </div>
                    <div className="text-sm text-slate-500">Overall Score</div>
                  </div>

                  {evaluation.reasoning.length > 0 && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                      {evaluation.reasoning[0]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Eye}
                    onClick={() => handleReopen(evaluation)}
                  >
                    Reopen
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    onClick={() => handleExport(evaluation)}
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
