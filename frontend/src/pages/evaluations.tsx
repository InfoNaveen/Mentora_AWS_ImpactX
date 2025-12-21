/**
 * Evaluations History Page
 * Display stored evaluation records with reopen functionality
 */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { storageService, EvaluationRecord } from '../lib/storage';
import { analytics } from '../lib/analytics';
import { BarChart2, FileText, Calendar, Trash2, Eye } from 'lucide-react';

export default function Evaluations() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    analytics.historyOpened();
    const history = storageService.getHistory();
    setEvaluations(history);
  }, []);

  const handleReopen = (record: EvaluationRecord) => {
    // Store in session for dashboard to load
    sessionStorage.setItem('mentora_reopen_evaluation', JSON.stringify(record));
    router.push('/dashboard');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      storageService.deleteEvaluation(id);
      setEvaluations(storageService.getHistory());
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.0) return '#10b981';
    if (score >= 6.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Layout title="Evaluations">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Evaluation History</h1>
            <p className="text-slate-400">View and manage past teaching quality evaluations</p>
          </div>
          {evaluations.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                if (confirm('Clear all evaluation history?')) {
                  storageService.clearHistory();
                  setEvaluations([]);
                }
              }}
            >
              Clear All
            </Button>
          )}
        </div>

        {evaluations.length === 0 ? (
          <div className="bg-[#151a22] border border-[#2d3748] rounded-xl p-8 text-center">
            <BarChart2 className="mx-auto mb-4 text-slate-500" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">No evaluations yet</h3>
            <p className="text-slate-500 mb-6">Start your first evaluation from the dashboard</p>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((record) => (
              <div
                key={record.id}
                className="bg-[#151a22] border border-[#2d3748] rounded-xl p-6 hover:border-[#1a73e8]/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="text-[#1a73e8]" size={20} />
                      <h3 className="text-lg font-semibold text-white">{record.filename}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Overall</p>
                        <p 
                          className="text-xl font-bold font-mono"
                          style={{ color: getScoreColor(record.scores.overall_score) }}
                        >
                          {record.scores.overall_score.toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Engagement</p>
                        <p className="text-sm font-mono text-white">{record.scores.engagement_score.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Coverage</p>
                        <p className="text-sm font-mono text-white">{record.scores.concept_coverage_score.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Clarity</p>
                        <p className="text-sm font-mono text-white">{record.scores.clarity_score.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Pedagogy</p>
                        <p className="text-sm font-mono text-white">{record.scores.pedagogy_score.toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(record.timestamp)}
                      </div>
                      {record.institution && (
                        <span>• {record.institution}</span>
                      )}
                      {record.instructor && (
                        <span>• {record.instructor}</span>
                      )}
                    </div>

                    {record.reasoning.length > 0 && (
                      <p className="text-sm text-slate-400 line-clamp-2">
                        {record.reasoning[0]}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleReopen(record)}
                    >
                      Reopen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(record.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
