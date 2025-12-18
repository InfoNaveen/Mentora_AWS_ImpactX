'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  Upload,
  FileAudio,
  FileText,
  Zap,
  BarChart2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ArrowRight,
  Info,
  Box,
  Server,
  Database,
  Cpu,
  Eye,
  Mic,
  Brain,
  HardDrive,
  Play,
  Check,
  Loader2,
  Settings,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Layout } from '../components/Layout';
import { apiService, UploadResponse, TranscribeResponse, EvaluateResponse } from '../services/api';
import {
  trackPageView,
  trackUploadStarted,
  trackVideoUpload,
  trackTranscription,
  trackEvaluationTriggered,
  trackEvaluationCompleted,
  trackReportExpanded,
  trackAuth,
  trackWorkflowStep,
} from '../lib/analytics';

type View = 'dashboard' | 'evaluate' | 'reports' | 'resources' | 'settings';
type EvalStep = 'upload' | 'audio' | 'syllabus' | 'evaluate' | 'results';

interface EvaluationScore {
  engagement_score: number;
  concept_coverage_score: number;
  clarity_score: number;
  overall_score: number;
}

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [evalStep, setEvalStep] = useState<EvalStep>('upload');
  const [uploadedVideo, setUploadedVideo] = useState<UploadResponse | null>(null);
  const [transcription, setTranscription] = useState<TranscribeResponse | null>(null);
  const [syllabusText, setSyllabusText] = useState('');
  const [teachingObjectives, setTeachingObjectives] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const currentUser = apiService.getCurrentUser();
    setUser(currentUser);
    trackPageView('dashboard');
  }, []);

  const handleNavChange = (id: string) => {
    setCurrentView(id as View);
    if (id === 'evaluate') {
      resetEvaluation();
    }
  };

  const handleDemoAccess = async () => {
    try {
      setLoading(true);
      await apiService.getDemoToken();
      setUser(apiService.getCurrentUser());
      trackAuth('demo_access');
    } catch {
      setError('Failed to get demo access');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    trackUploadStarted(file.name);

    try {
      const response = await apiService.uploadVideo(file);
      setUploadedVideo(response);
      trackVideoUpload(response.file_size, response.filename);
      setEvalStep('audio');
      trackWorkflowStep('audio', 2);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleFileUpload(file);
    } else {
      setError('Please upload a video file');
    }
  }, []);

  const handleTranscribe = async () => {
    if (!uploadedVideo) return;
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.transcribeVideo(uploadedVideo.file_path);
      setTranscription(response);
      trackTranscription(response.transcribed_text.split(' ').length, response.confidence || 0.9);
      setEvalStep('syllabus');
      trackWorkflowStep('syllabus', 3);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Transcription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!transcription || !syllabusText) return;
    setLoading(true);
    setError(null);
    trackEvaluationTriggered();

    try {
      const response = await apiService.evaluateTeaching(
        transcription.transcribed_text,
        syllabusText,
        teachingObjectives
      );
      setEvaluationResults(response);
      trackEvaluationCompleted({
        engagement: response.scores.engagement_score,
        coverage: response.scores.concept_coverage_score,
        clarity: response.scores.clarity_score,
        overall: response.scores.overall_score,
      });
      setEvalStep('results');
      trackWorkflowStep('results', 5);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetEvaluation = () => {
    setEvalStep('upload');
    setUploadedVideo(null);
    setTranscription(null);
    setEvaluationResults(null);
    setSyllabusText('');
    setTeachingObjectives('');
    setError(null);
    setExpandedSections({});
    trackWorkflowStep('upload', 1);
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      if (newState[key]) {
        trackReportExpanded(key);
      }
      return newState;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 9) return 'A+';
    if (score >= 8.5) return 'A';
    if (score >= 8) return 'A-';
    if (score >= 7.5) return 'B+';
    if (score >= 7) return 'B';
    if (score >= 6.5) return 'B-';
    if (score >= 6) return 'C+';
    return 'C';
  };

  const getBreadcrumbs = () => {
    switch (currentView) {
      case 'dashboard':
        return ['Dashboard'];
      case 'evaluate':
        return ['Evaluation', evalStep.charAt(0).toUpperCase() + evalStep.slice(1)];
      case 'reports':
        return ['Reports'];
      case 'resources':
        return ['Resources'];
      case 'settings':
        return ['Settings'];
      default:
        return ['Dashboard'];
    }
  };

  const evalSteps = [
    { id: 'upload', label: 'Upload Video', icon: Upload },
    { id: 'audio', label: 'Extract Audio', icon: FileAudio },
    { id: 'syllabus', label: 'Syllabus Input', icon: FileText },
    { id: 'evaluate', label: 'Run Evaluation', icon: Zap },
    { id: 'results', label: 'Results', icon: BarChart2 },
  ];

  const stepIndex = evalSteps.findIndex((s) => s.id === evalStep);

  const radarData = evaluationResults
    ? [
        { metric: 'Engagement', value: evaluationResults.scores.engagement_score, fullMark: 10 },
        { metric: 'Coverage', value: evaluationResults.scores.concept_coverage_score, fullMark: 10 },
        { metric: 'Clarity', value: evaluationResults.scores.clarity_score, fullMark: 10 },
      ]
    : [];

  const barData = evaluationResults
    ? [
        { name: 'Engagement', score: evaluationResults.scores.engagement_score },
        { name: 'Coverage', score: evaluationResults.scores.concept_coverage_score },
        { name: 'Clarity', score: evaluationResults.scores.clarity_score },
      ]
    : [];

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Teaching Evaluation Intelligence</h1>
          <p>Powered by AWS-Ready Multimodal AI</p>
        </div>
        {!user && (
          <button className="access-btn" onClick={handleDemoAccess} disabled={loading}>
            {loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            Quick Demo Access
          </button>
        )}
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Evaluations', value: '24', delta: '+12%', icon: Activity, color: '#0ea5e9' },
          { label: 'Average Score', value: '8.4', delta: '+0.3', icon: TrendingUp, color: '#10b981' },
          { label: 'Time Saved', value: '48h', delta: '+8h', icon: Clock, color: '#8b5cf6' },
          { label: 'Upload Activity', value: '12', delta: '+5', icon: Upload, color: '#f59e0b' },
        ].map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ '--accent': stat.color } as React.CSSProperties}>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-row">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-delta">{stat.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="panel quick-actions">
          <div className="panel-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="action-list">
            <button className="action-item" onClick={() => { setCurrentView('evaluate'); resetEvaluation(); }}>
              <div className="action-icon"><Play size={18} /></div>
              <div className="action-content">
                <span className="action-title">New Evaluation</span>
                <span className="action-desc">Start a teaching quality assessment</span>
              </div>
              <ArrowRight size={16} className="action-arrow" />
            </button>
            <button className="action-item" onClick={() => setCurrentView('reports')}>
              <div className="action-icon"><BarChart2 size={18} /></div>
              <div className="action-content">
                <span className="action-title">View Reports</span>
                <span className="action-desc">Browse evaluation history</span>
              </div>
              <ArrowRight size={16} className="action-arrow" />
            </button>
          </div>
        </div>

        <div className="panel service-status">
          <div className="panel-header">
            <h3>Service Status</h3>
            <span className="panel-badge">AWS Infrastructure</span>
          </div>
          <div className="service-list">
            {[
              { name: 'Bedrock', desc: 'GenAI Evaluation', icon: Brain, status: 'operational' },
              { name: 'Transcribe', desc: 'Speech-to-Text', icon: Mic, status: 'operational' },
              { name: 'Rekognition', desc: 'Visual Analysis', icon: Eye, status: 'standby' },
              { name: 'S3 Storage', desc: 'Video Storage', icon: HardDrive, status: 'operational' },
            ].map((svc, idx) => (
              <div key={idx} className="service-row">
                <div className="service-icon"><svc.icon size={16} /></div>
                <div className="service-info">
                  <span className="service-name">{svc.name}</span>
                  <span className="service-desc">{svc.desc}</span>
                </div>
                <span className={`service-status ${svc.status}`}>
                  {svc.status === 'operational' ? 'Operational' : 'Standby'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel resources-panel">
          <div className="panel-header">
            <h3>Resource Naming</h3>
            <span className="panel-badge mono">mentora-prod</span>
          </div>
          <div className="resource-list">
            <div className="resource-item">
              <Box size={14} />
              <span className="resource-name">S3 Upload Queue</span>
              <code>mentora-uploads-ap-south-1</code>
            </div>
            <div className="resource-item">
              <Server size={14} />
              <span className="resource-name">Transcribe Job Log</span>
              <code>transcribe-jobs-prod</code>
            </div>
            <div className="resource-item">
              <Database size={14} />
              <span className="resource-name">Evaluation Store</span>
              <code>eval-results-encrypted</code>
            </div>
            <div className="resource-item">
              <Cpu size={14} />
              <span className="resource-name">Bedrock Endpoint</span>
              <code>claude-3-sonnet-v1</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvaluationWorkflow = () => (
    <div className="evaluation-workflow">
      <div className="workflow-stepper">
        {evalSteps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = step.id === evalStep;
          const isCompleted = idx < stepIndex;
          const isClickable = idx <= stepIndex;

          return (
            <React.Fragment key={step.id}>
              <button
                className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isClickable && setEvalStep(step.id as EvalStep)}
                disabled={!isClickable}
              >
                <div className="step-icon">
                  {isCompleted ? <Check size={16} /> : <StepIcon size={16} />}
                </div>
                <span className="step-label">{step.label}</span>
              </button>
              {idx < evalSteps.length - 1 && (
                <div className={`step-connector ${idx < stepIndex ? 'completed' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">x</button>
        </div>
      )}

      <div className="workflow-content">
        {evalStep === 'upload' && (
          <div className="workflow-panel animate-in">
            <div className="panel-header-lg">
              <div>
                <h2>Upload Lecture Video</h2>
                <p>S3 Upload Queue - mentora-uploads-ap-south-1</p>
              </div>
            </div>
            <div
              className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="dropzone-icon">
                <Upload size={32} />
              </div>
              <p className="dropzone-title">Drag and drop your video file</p>
              <p className="dropzone-subtitle">Supported: MP4, MOV, AVI, WebM (max 100MB)</p>
              <div className="dropzone-divider">
                <span>or</span>
              </div>
              <label className="upload-button">
                Browse Files
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  hidden
                />
              </label>
            </div>
            {loading && (
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
            )}
          </div>
        )}

        {evalStep === 'audio' && (
          <div className="workflow-panel animate-in">
            <div className="panel-header-lg">
              <div>
                <h2>Extract Audio</h2>
                <p>Amazon Transcribe - Speech-to-Text Processing</p>
              </div>
            </div>
            {uploadedVideo && (
              <div className="info-banner success">
                <CheckCircle2 size={16} />
                <div className="info-content">
                  <span className="info-title">Upload Complete</span>
                  <span className="info-detail">{uploadedVideo.filename} ({(uploadedVideo.file_size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              </div>
            )}
            <div className="service-card">
              <div className="service-card-header">
                <div className="service-card-icon"><Mic size={20} /></div>
                <div>
                  <h4>Amazon Transcribe</h4>
                  <p>Automatic speech recognition with speaker diarization</p>
                </div>
              </div>
              <ul className="service-features">
                <li><Check size={14} /> High accuracy speech-to-text</li>
                <li><Check size={14} /> Multi-speaker detection</li>
                <li><Check size={14} /> Punctuation and formatting</li>
              </ul>
            </div>
            <div className="panel-actions">
              <button className="btn-secondary" onClick={() => setEvalStep('upload')}>
                Back
              </button>
              <button className="btn-primary" onClick={handleTranscribe} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start Transcription
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {evalStep === 'syllabus' && (
          <div className="workflow-panel animate-in">
            <div className="panel-header-lg">
              <div>
                <h2>Course Information</h2>
                <p>Provide syllabus content for evaluation context</p>
              </div>
            </div>
            {transcription && (
              <div className="info-banner success">
                <CheckCircle2 size={16} />
                <div className="info-content">
                  <span className="info-title">Transcription Complete</span>
                  <span className="info-detail">
                    {transcription.transcribed_text.split(' ').length} words extracted
                    {transcription.confidence && ` (${(transcription.confidence * 100).toFixed(0)}% confidence)`}
                  </span>
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Course Syllabus <span className="required">*</span></label>
              <textarea
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                placeholder="Paste your course syllabus, topics to be covered, or key concepts..."
                rows={6}
              />
            </div>
            <div className="form-group">
              <label>Learning Objectives <span className="optional">(Optional)</span></label>
              <textarea
                value={teachingObjectives}
                onChange={(e) => setTeachingObjectives(e.target.value)}
                placeholder="What should students learn from this lecture?"
                rows={3}
              />
            </div>
            <div className="panel-actions">
              <button className="btn-secondary" onClick={() => setEvalStep('audio')}>
                Back
              </button>
              <button
                className="btn-primary"
                onClick={() => { setEvalStep('evaluate'); trackWorkflowStep('evaluate', 4); }}
                disabled={!syllabusText.trim()}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {evalStep === 'evaluate' && (
          <div className="workflow-panel animate-in">
            <div className="panel-header-lg">
              <div>
                <h2>Run AI Evaluation</h2>
                <p>Amazon Bedrock - Claude 3 Sonnet Analysis</p>
              </div>
            </div>
            <div className="service-card highlight">
              <div className="service-card-header">
                <div className="service-card-icon"><Brain size={20} /></div>
                <div>
                  <h4>Amazon Bedrock</h4>
                  <p>Explainable teaching quality evaluation powered by Claude 3</p>
                </div>
              </div>
              <ul className="service-features">
                <li><Check size={14} /> Rubric-based scoring methodology</li>
                <li><Check size={14} /> Detailed reasoning for each metric</li>
                <li><Check size={14} /> Actionable recommendations</li>
                <li><Check size={14} /> Deterministic, reproducible results</li>
              </ul>
            </div>
            <div className="evaluation-summary">
              <h4>Evaluation Input Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Transcript Length</span>
                  <span className="summary-value">{transcription?.transcribed_text.split(' ').length || 0} words</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Syllabus Length</span>
                  <span className="summary-value">{syllabusText.split(' ').length} words</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Model</span>
                  <span className="summary-value mono">claude-3-sonnet</span>
                </div>
              </div>
            </div>
            <div className="panel-actions">
              <button className="btn-secondary" onClick={() => setEvalStep('syllabus')}>
                Back
              </button>
              <button className="btn-primary accent" onClick={handleEvaluate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Run Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {evalStep === 'results' && evaluationResults && (
          <div className="results-view animate-in">
            <div className="results-header">
              <div>
                <h2>Evaluation Report</h2>
                <p>Teaching Quality Analysis Results</p>
              </div>
              <div className="overall-score-display">
                <div
                  className="score-circle"
                  style={{ '--score-color': getScoreColor(evaluationResults.scores.overall_score) } as React.CSSProperties}
                >
                  <span className="score-number">{evaluationResults.scores.overall_score.toFixed(1)}</span>
                  <span className="score-max">/10</span>
                </div>
                <div className="score-grade" style={{ color: getScoreColor(evaluationResults.scores.overall_score) }}>
                  {getScoreGrade(evaluationResults.scores.overall_score)}
                </div>
              </div>
            </div>

            <div className="results-grid">
              <div className="chart-panel">
                <div className="panel-header">
                  <h3>Score Breakdown</h3>
                  <span className="panel-badge">Radar View</span>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 10]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-panel">
                <div className="panel-header">
                  <h3>Metric Comparison</h3>
                  <span className="panel-badge">Bar Chart</span>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                      <Tooltip
                        contentStyle={{
                          background: '#1a1f28',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#f1f5f9' }}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="score-cards">
              {[
                { key: 'engagement_score', label: 'Engagement', desc: 'Student interaction and interest level' },
                { key: 'concept_coverage_score', label: 'Coverage', desc: 'Syllabus topic alignment' },
                { key: 'clarity_score', label: 'Clarity', desc: 'Explanation quality and coherence' },
              ].map((metric) => {
                const score = evaluationResults.scores[metric.key as keyof EvaluationScore];
                return (
                  <div key={metric.key} className="score-card">
                    <div className="score-card-header">
                      <span className="score-card-label">{metric.label}</span>
                      <span
                        className="score-card-value"
                        style={{ color: getScoreColor(score) }}
                      >
                        {score.toFixed(1)}
                      </span>
                    </div>
                    <div className="score-bar-track">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${score * 10}%`,
                          background: getScoreColor(score),
                        }}
                      />
                    </div>
                    <p className="score-card-desc">{metric.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="collapsible-section">
              <button
                className={`section-header ${expandedSections.summary ? 'expanded' : ''}`}
                onClick={() => toggleSection('summary')}
              >
                <Info size={16} />
                <span>Summary</span>
                {expandedSections.summary ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedSections.summary && (
                <div className="section-content">
                  <p>{evaluationResults.summary}</p>
                </div>
              )}
            </div>

            <div className="collapsible-section">
              <button
                className={`section-header ${expandedSections.recommendations ? 'expanded' : ''}`}
                onClick={() => toggleSection('recommendations')}
              >
                <CheckCircle2 size={16} />
                <span>Recommendations ({evaluationResults.recommendations.length})</span>
                {expandedSections.recommendations ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedSections.recommendations && (
                <div className="section-content">
                  <ul className="recommendations-list">
                    {evaluationResults.recommendations.map((rec, idx) => (
                      <li key={idx}>
                        <span className="rec-number">{idx + 1}</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="audit-banner">
              <div className="audit-content">
                <span className="audit-badge">Audit Trail</span>
                <span className="audit-text">
                  This evaluation is deterministic, explainable, and reproducible. Full audit logging enabled.
                </span>
              </div>
            </div>

            <div className="results-actions">
              <button className="btn-secondary" onClick={resetEvaluation}>
                <RefreshCw size={16} />
                New Evaluation
              </button>
              <button className="btn-outline" onClick={() => window.print()}>
                Export Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-view">
      <div className="page-header">
        <h1>Evaluation Reports</h1>
        <p>Historical teaching quality assessments</p>
      </div>
      <div className="empty-state">
        <BarChart2 size={48} />
        <h3>No reports yet</h3>
        <p>Complete an evaluation to see reports here</p>
        <button className="btn-primary" onClick={() => { setCurrentView('evaluate'); resetEvaluation(); }}>
          <Play size={16} />
          Start Evaluation
        </button>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="resources-view">
      <div className="page-header">
        <h1>AWS Resources</h1>
        <p>Infrastructure and service configuration</p>
      </div>
      <div className="resource-cards">
        {[
          { name: 'S3 Upload Queue', id: 'mentora-uploads-ap-south-1', type: 'S3 Bucket', status: 'active' },
          { name: 'Transcribe Job Log', id: 'transcribe-jobs-prod', type: 'CloudWatch', status: 'active' },
          { name: 'Rekognition Visual Flags', id: 'rekognition-flags-v1', type: 'DynamoDB', status: 'standby' },
          { name: 'Evaluation Store', id: 'eval-results-encrypted', type: 'S3 + KMS', status: 'active' },
        ].map((res, idx) => (
          <div key={idx} className="resource-card">
            <div className="resource-card-header">
              <span className="resource-type">{res.type}</span>
              <span className={`resource-status ${res.status}`}>{res.status}</span>
            </div>
            <h4>{res.name}</h4>
            <code>{res.id}</code>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Mentora - Teaching Evaluation Intelligence</title>
        <meta name="description" content="AWS-powered multimodal AI system for teaching quality evaluation" />
      </Head>

      <Layout
        activeNav={currentView}
        onNavChange={handleNavChange}
        breadcrumbs={getBreadcrumbs()}
        user={user}
      >
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'evaluate' && renderEvaluationWorkflow()}
        {currentView === 'reports' && renderReports()}
        {currentView === 'resources' && renderResources()}
        {currentView === 'settings' && (
          <div className="settings-view">
            <div className="page-header">
              <h1>Settings</h1>
              <p>Application configuration</p>
            </div>
            <div className="coming-soon">
              <Settings size={48} />
              <p>Settings panel coming soon</p>
            </div>
          </div>
        )}
      </Layout>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding: 32px;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%);
          border: 1px solid rgba(14, 165, 233, 0.15);
          border-radius: 12px;
        }

        .header-content h1 {
          font-size: 28px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .header-content p {
          color: #64748b;
          font-size: 14px;
        }

        .access-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .access-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);
        }

        .access-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          gap: 16px;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #f1f5f9;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-delta {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }

        .panel {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .panel-header h3 {
          font-size: 14px;
          font-weight: 500;
          color: #f1f5f9;
        }

        .panel-badge {
          padding: 4px 10px;
          background: rgba(255,255,255,0.04);
          border-radius: 4px;
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .panel-badge.mono {
          font-family: 'JetBrains Mono', monospace;
        }

        .action-list {
          padding: 8px;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px;
          background: transparent;
          border: none;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s;
        }

        .action-item:hover {
          background: rgba(255,255,255,0.04);
        }

        .action-icon {
          width: 36px;
          height: 36px;
          background: rgba(14, 165, 233, 0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0ea5e9;
        }

        .action-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .action-title {
          font-size: 14px;
          font-weight: 500;
          color: #f1f5f9;
        }

        .action-desc {
          font-size: 12px;
          color: #64748b;
        }

        .action-arrow {
          color: #475569;
          transition: transform 0.15s;
        }

        .action-item:hover .action-arrow {
          transform: translateX(4px);
          color: #0ea5e9;
        }

        .service-list {
          padding: 8px 12px;
        }

        .service-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .service-row:last-child {
          border-bottom: none;
        }

        .service-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.04);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .service-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .service-name {
          font-size: 13px;
          font-weight: 500;
          color: #f1f5f9;
        }

        .service-desc {
          font-size: 11px;
          color: #64748b;
        }

        .service-status {
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .service-status.operational {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .service-status.standby {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .resource-list {
          padding: 12px 16px;
        }

        .resource-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: #64748b;
        }

        .resource-item:last-child {
          border-bottom: none;
        }

        .resource-name {
          font-size: 12px;
          color: #94a3b8;
          flex: 1;
        }

        .resource-item code {
          font-size: 11px;
          color: #0ea5e9;
          font-family: 'JetBrains Mono', monospace;
        }

        .evaluation-workflow {
          max-width: 900px;
          margin: 0 auto;
        }

        .workflow-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
          padding: 24px;
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.4;
          transition: all 0.2s;
        }

        .step:disabled {
          cursor: default;
        }

        .step.active {
          opacity: 1;
        }

        .step.completed {
          opacity: 0.8;
        }

        .step-icon {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .step.active .step-icon {
          background: rgba(14, 165, 233, 0.15);
          color: #0ea5e9;
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.2);
        }

        .step.completed .step-icon {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .step-label {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
        }

        .step.active .step-label {
          color: #f1f5f9;
          font-weight: 500;
        }

        .step-connector {
          width: 48px;
          height: 2px;
          background: rgba(255,255,255,0.08);
          margin: 0 12px;
          margin-bottom: 20px;
        }

        .step-connector.completed {
          background: #10b981;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .alert-close {
          margin-left: auto;
          padding: 4px 8px;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 16px;
        }

        .workflow-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .workflow-panel {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 32px;
        }

        .animate-in {
          animation: fadeIn 0.3s ease;
        }

        .panel-header-lg {
          margin-bottom: 28px;
        }

        .panel-header-lg h2 {
          font-size: 22px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 6px;
        }

        .panel-header-lg p {
          font-size: 13px;
          color: #64748b;
          font-family: 'JetBrains Mono', monospace;
        }

        .upload-dropzone {
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 48px;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }

        .upload-dropzone:hover,
        .upload-dropzone.dragging {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.05);
        }

        .dropzone-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .upload-dropzone.dragging .dropzone-icon {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }

        .dropzone-title {
          font-size: 16px;
          color: #f1f5f9;
          margin-bottom: 8px;
        }

        .dropzone-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 20px;
        }

        .dropzone-divider {
          position: relative;
          margin: 24px 0;
        }

        .dropzone-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .dropzone-divider span {
          position: relative;
          padding: 0 16px;
          background: #0f1318;
          color: #64748b;
          font-size: 12px;
        }

        .upload-button {
          display: inline-flex;
          padding: 12px 24px;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);
        }

        .progress-bar {
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          margin-top: 24px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 30%;
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          border-radius: 2px;
          animation: progress 1.5s ease-in-out infinite;
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        .info-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .info-banner.success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-title {
          font-size: 14px;
          font-weight: 500;
          color: #f1f5f9;
        }

        .info-detail {
          font-size: 13px;
          color: #64748b;
        }

        .service-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .service-card.highlight {
          background: rgba(14, 165, 233, 0.05);
          border-color: rgba(14, 165, 233, 0.15);
        }

        .service-card-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .service-card-icon {
          width: 44px;
          height: 44px;
          background: rgba(14, 165, 233, 0.15);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0ea5e9;
        }

        .service-card-header h4 {
          font-size: 16px;
          font-weight: 500;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .service-card-header p {
          font-size: 13px;
          color: #64748b;
        }

        .service-features {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .service-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #94a3b8;
        }

        .service-features li :global(svg) {
          color: #10b981;
        }

        .panel-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary.accent {
          background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.08);
          color: #f1f5f9;
        }

        .btn-outline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          color: #0ea5e9;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: rgba(14, 165, 233, 0.1);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 8px;
        }

        .form-group .required {
          color: #ef4444;
        }

        .form-group .optional {
          color: #64748b;
          font-weight: 400;
        }

        .form-group textarea {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: #0ea5e9;
        }

        .form-group textarea::placeholder {
          color: #475569;
        }

        .evaluation-summary {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 20px;
        }

        .evaluation-summary h4 {
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-label {
          font-size: 12px;
          color: #64748b;
        }

        .summary-value {
          font-size: 15px;
          font-weight: 500;
          color: #f1f5f9;
        }

        .summary-value.mono {
          font-family: 'JetBrains Mono', monospace;
          color: #0ea5e9;
        }

        .results-view {
          max-width: 1000px;
          margin: 0 auto;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          padding: 28px;
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }

        .results-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 6px;
        }

        .results-header p {
          color: #64748b;
          font-size: 14px;
        }

        .overall-score-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255,255,255,0.02);
          border: 4px solid var(--score-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px color-mix(in srgb, var(--score-color) 25%, transparent);
        }

        .score-number {
          font-size: 32px;
          font-weight: 700;
          color: #f1f5f9;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }

        .score-max {
          font-size: 13px;
          color: #64748b;
        }

        .score-grade {
          font-size: 18px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-panel {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }

        .chart-container {
          padding: 20px;
        }

        .score-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .score-card {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 20px;
        }

        .score-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .score-card-label {
          font-size: 14px;
          font-weight: 500;
          color: #f1f5f9;
        }

        .score-card-value {
          font-size: 24px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .score-bar-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .score-card-desc {
          font-size: 12px;
          color: #64748b;
        }

        .collapsible-section {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 18px 20px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }

        .section-header:hover {
          background: rgba(255,255,255,0.02);
          color: #f1f5f9;
        }

        .section-header.expanded {
          color: #f1f5f9;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .section-header span {
          flex: 1;
        }

        .section-content {
          padding: 20px;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-content p {
          color: #94a3b8;
          line-height: 1.7;
        }

        .recommendations-list {
          list-style: none;
        }

        .recommendations-list li {
          display: flex;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: #94a3b8;
          line-height: 1.6;
        }

        .recommendations-list li:last-child {
          border-bottom: none;
        }

        .rec-number {
          width: 24px;
          height: 24px;
          background: rgba(14, 165, 233, 0.15);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #0ea5e9;
          flex-shrink: 0;
        }

        .audit-banner {
          background: rgba(139, 92, 246, 0.08);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .audit-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .audit-badge {
          padding: 4px 10px;
          background: #8b5cf6;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .audit-text {
          font-size: 13px;
          color: #94a3b8;
        }

        .results-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 24px;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 8px;
        }

        .page-header p {
          color: #64748b;
          font-size: 14px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          text-align: center;
          color: #475569;
        }

        .empty-state h3 {
          color: #94a3b8;
          margin: 20px 0 8px;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .resource-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .resource-card {
          background: #0f1318;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 20px;
        }

        .resource-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .resource-type {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .resource-status {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .resource-status.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .resource-status.standby {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .resource-card h4 {
          font-size: 15px;
          color: #f1f5f9;
          margin-bottom: 8px;
        }

        .resource-card code {
          font-size: 12px;
          color: #0ea5e9;
          font-family: 'JetBrains Mono', monospace;
        }

        .coming-soon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px;
          color: #475569;
          text-align: center;
        }

        .coming-soon p {
          margin-top: 16px;
          color: #64748b;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .score-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .workflow-stepper {
            flex-wrap: wrap;
            gap: 16px;
          }

          .step-connector {
            display: none;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .resource-cards {
            grid-template-columns: 1fr;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 20px;
          }
        }

        @media print {
          .workflow-stepper,
          .panel-actions,
          .results-actions,
          .audit-banner {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
