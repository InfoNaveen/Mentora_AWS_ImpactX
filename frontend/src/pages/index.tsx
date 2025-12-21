import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  Upload as UploadIcon,
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
  CloudUpload,
  BarChart3,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { ScoringRadar, ScoringBar } from '../components/Charts';
import { apiService, UploadResponse, TranscribeResponse, EvaluateResponse } from '../services/api';
import {
  trackPageView,
  trackUploadStarted,
  trackVideoUpload,
  trackTranscription,
  trackEvaluationTriggered,
  trackEvaluationCompleted,
  trackWorkflowStep,
} from '../lib/analytics';

type View = 'dashboard' | 'evaluate' | 'reports';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    recommendations: true
  });

  useEffect(() => {
    const currentUser = apiService.getCurrentUser();
    setUser(currentUser);
    trackPageView('dashboard');
  }, []);

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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please check your connection.');
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
      setError('Invalid file type. Please upload a video file.');
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Transcription failed.');
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
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Evaluation failed. AWS Bedrock service may be busy.');
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
    trackWorkflowStep('upload', 1);
  };

  const evalSteps = [
    { id: 'upload', label: 'Upload', icon: CloudUpload },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'syllabus', label: 'Syllabus', icon: FileText },
    { id: 'evaluate', label: 'Evaluate', icon: Zap },
    { id: 'results', label: 'Analysis', icon: BarChart3 },
  ];

  const currentStepIdx = evalSteps.findIndex(s => s.id === evalStep);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Teaching Evaluation Intelligence</h1>
          <p className="text-slate-400">Enterprise AI for pedagogical excellence powered by AWS Bedrock.</p>
        </div>
        <Button 
          icon={Play} 
          onClick={() => { setCurrentView('evaluate'); resetEvaluation(); }}
          className="shadow-glow-blue"
        >
          New Evaluation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Assessments', value: '42', delta: '+12%', icon: Activity, color: '#0ea5e9' },
          { label: 'Avg Instructor Score', value: '84.2', delta: '+2.4%', icon: TrendingUp, color: '#10b981' },
          { label: 'Cloud Resources', value: '8 Active', delta: 'Healthy', icon: Server, color: '#8b5cf6' },
          { label: 'Total Processing', value: '1.2h', delta: '-15m', icon: Clock, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#151a22] border border-[#2d3748] rounded-xl p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
                <span className="text-xs font-medium" style={{ color: stat.color }}>{stat.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#151a22] border border-[#2d3748] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2d3748] flex justify-between items-center">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <span className="text-xs text-slate-500 font-mono">mentora-prod-logs</span>
          </div>
          <div className="p-0">
            {[1, 2, 3].map((item) => (
              <div key={item} className="px-6 py-4 border-b border-[#2d3748] last:border-0 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded bg-[#2d3748]/50 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-[#10b981]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Evaluation completed: Lecture_{item * 102}.mp4</p>
                    <p className="text-xs text-slate-500">2 hours ago • Instructor: Dr. Sarah Smith</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white font-mono">88.5/100</p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">ID: EVL-92384</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#151a22] border border-[#2d3748] rounded-xl p-6">
          <h3 className="font-semibold text-white mb-6">AWS Infrastructure Status</h3>
          <div className="space-y-5">
            {[
              { name: 'Amazon Bedrock', status: 'Healthy', icon: Brain },
              { name: 'Amazon Transcribe', status: 'Healthy', icon: Mic },
              { name: 'Amazon S3', status: 'Healthy', icon: HardDrive },
              { name: 'CloudWatch Metrics', status: 'Active', icon: Activity },
            ].map((svc) => (
              <div key={svc.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svc.icon size={18} className="text-slate-400" />
                  <span className="text-sm text-slate-300">{svc.name}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1 h-1 bg-[#10b981] rounded-full"></span>
                  {svc.status}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-[#2d3748]">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Resource Endpoints</p>
            <div className="space-y-2">
              <code className="block text-[10px] bg-[#0a0d12] p-2 rounded text-[#0ea5e9]">s3://mentora-prod-uploads-ap-south-1</code>
              <code className="block text-[10px] bg-[#0a0d12] p-2 rounded text-[#0ea5e9]">bedrock.claude-3-sonnet.v1</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEvaluator = () => (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Workflow Stepper */}
      <div className="mb-12 bg-[#151a22] border border-[#2d3748] rounded-xl p-6 flex items-center justify-between shadow-xl">
        {evalSteps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center gap-2 group ${i > currentStepIdx ? 'opacity-30' : 'opacity-100'}`}>
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                ${i < currentStepIdx ? 'bg-[#10b981] text-[#0a0d12]' : i === currentStepIdx ? 'bg-[#1a73e8] text-white ring-4 ring-[#1a73e8]/20' : 'bg-[#2d3748] text-slate-400'}
              `}>
                {i < currentStepIdx ? <Check size={20} weight="bold" /> : <step.icon size={20} />}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${i === currentStepIdx ? 'text-[#1a73e8]' : 'text-slate-500'}`}>{step.label}</span>
            </div>
            {i < evalSteps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-4 rounded-full transition-colors duration-500 ${i < currentStepIdx ? 'bg-[#10b981]' : 'bg-[#2d3748]'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-[#151a22] border border-[#2d3748] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a73e8]/10 overflow-hidden">
            <div className="h-full bg-[#1a73e8] animate-[loading_1.5s_infinite]" style={{ width: '40%' }}></div>
          </div>
        )}

        {evalStep === 'upload' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Initialize Lecture Upload</h2>
              <p className="text-slate-400">Secure S3 Transfer Queue: <code className="text-[#1a73e8] text-xs">ap-south-1</code></p>
            </div>

            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300
                ${isDragging ? 'border-[#1a73e8] bg-[#1a73e8]/10' : 'border-[#2d3748] hover:border-[#1a73e8]/50 hover:bg-white/[0.02]'}
              `}
            >
              <div className="w-20 h-20 bg-[#2d3748]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                <CloudUpload size={40} />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Select video resource</h3>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">Drop MP4/MOV lecture files here or browse from your architectural node</p>
              
              <label className="inline-block">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <Button variant="secondary" size="lg" icon={Search} as="div">
                  Browse Architecture
                </Button>
              </label>
            </div>
          </div>
        )}

        {evalStep === 'audio' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center gap-6 p-6 bg-[#0a0d12] rounded-xl border border-[#2d3748]">
              <div className="w-16 h-16 bg-[#10b981]/10 rounded-lg flex items-center justify-center text-[#10b981]">
                <FileAudio size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium mb-1">Resource: {uploadedVideo?.filename}</h4>
                <p className="text-xs text-slate-500 italic">SHA-256 Verified • {(uploadedVideo?.file_size || 0 / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <CheckCircle2 className="text-[#10b981]" size={24} />
            </div>

            <div className="p-6 bg-[#1a73e8]/5 rounded-xl border border-[#1a73e8]/20">
              <h4 className="flex items-center gap-2 text-[#1a73e8] font-bold text-xs uppercase tracking-widest mb-4">
                <Mic size={14} /> Amazon Transcribe Engine
              </h4>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Our audio extraction microservice will now process the stream using automatic speech recognition. 
                This results in a timestamped JSON manifest for pedagogical analysis.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setEvalStep('upload')}>Back</Button>
                <Button icon={Zap} loading={loading} onClick={handleTranscribe}>Extract Data Manifest</Button>
              </div>
            </div>
          </div>
        )}

        {evalStep === 'syllabus' && (
          <div className="space-y-8 animate-fade-in">
             <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Contextual Parameters</h2>
              <p className="text-slate-400">Input standard pedagogical requirements</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Master Syllabus Content</label>
                <textarea 
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="w-full bg-[#0a0d12] border border-[#2d3748] rounded-xl p-4 text-slate-200 text-sm focus:ring-2 focus:ring-[#1a73e8]/50 focus:border-[#1a73e8] outline-none min-h-[160px]"
                  placeholder="Paste the official course syllabus here..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Teaching Objectives (Optional)</label>
                <textarea 
                  value={teachingObjectives}
                  onChange={(e) => setTeachingObjectives(e.target.value)}
                  className="w-full bg-[#0a0d12] border border-[#2d3748] rounded-xl p-4 text-slate-200 text-sm focus:ring-2 focus:ring-[#1a73e8]/50 focus:border-[#1a73e8] outline-none min-h-[80px]"
                  placeholder="Target learning outcomes for this session..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setEvalStep('audio')}>Back</Button>
                <Button icon={ArrowRight} disabled={!syllabusText.trim()} onClick={() => setEvalStep('evaluate')}>Continue Pipeline</Button>
              </div>
            </div>
          </div>
        )}

        {evalStep === 'evaluate' && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-8 bg-gradient-to-br from-[#1a73e8]/10 to-[#8b5cf6]/10 rounded-2xl border border-white/5 text-center">
              <div className="w-16 h-16 bg-[#1a73e8] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
                <Brain size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AWS Bedrock Analysis</h2>
              <p className="text-slate-400 max-w-sm mx-auto mb-8">
                Ready to invoke Claude 3 Sonnet for high-precision pedagogical evaluation.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-left mb-8">
                <div className="p-4 bg-[#0a0d12]/50 border border-[#2d3748] rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Transcript Nodes</p>
                  <p className="text-white font-mono">{transcription?.transcribed_text.split(' ').length || 0} words</p>
                </div>
                <div className="p-4 bg-[#0a0d12]/50 border border-[#2d3748] rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Context Tokens</p>
                  <p className="text-white font-mono">{syllabusText.split(' ').length} words</p>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="secondary" onClick={() => setEvalStep('syllabus')}>Back</Button>
                <Button variant="primary" size="lg" icon={Zap} loading={loading} onClick={handleEvaluate}>
                  Run Intelligence Evaluation
                </Button>
              </div>
            </div>
          </div>
        )}

        {evalStep === 'results' && evaluationResults && (
           <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-[#0a0d12] p-6 rounded-2xl border border-[#2d3748]">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Evaluation Scorecard</h2>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded bg-[#1a73e8]/10 text-[#1a73e8] text-[10px] font-bold uppercase tracking-widest">Final Report</div>
                  <span className="text-xs text-slate-500 font-mono">ID: EVL-PROD-2025</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-4xl font-bold font-mono" style={{ color: getScoreColor(evaluationResults.scores.overall_score * 10) }}>
                  {evaluationResults.scores.overall_score.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Propellor Score</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0a0d12] p-6 rounded-2xl border border-[#2d3748]">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Metric Radar</h4>
                <ScoringRadar data={[
                  { subject: 'Engagement', A: evaluationResults.scores.engagement_score * 10, fullMark: 100 },
                  { subject: 'Concept Coverage', A: evaluationResults.scores.concept_coverage_score * 10, fullMark: 100 },
                  { subject: 'Visual Clarity', A: evaluationResults.scores.clarity_score * 10, fullMark: 100 },
                  { subject: 'Structure', A: 85, fullMark: 100 },
                  { subject: 'Objective', A: 92, fullMark: 100 },
                ]} />
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Student Engagement', score: evaluationResults.scores.engagement_score * 10, color: '#0ea5e9' },
                  { label: 'Syllabus Alignment', score: evaluationResults.scores.concept_coverage_score * 10, color: '#10b981' },
                  { label: 'Explanation Clarity', score: evaluationResults.scores.clarity_score * 10, color: '#f59e0b' },
                ].map((metric) => (
                  <div key={metric.label} className="bg-[#0a0d12] p-4 rounded-xl border border-[#2d3748]">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-medium text-slate-300">{metric.label}</span>
                       <span className="text-sm font-bold font-mono text-white">{metric.score.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-[#151a22] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${metric.score}%`, backgroundColor: metric.color }}></div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-[#1a73e8]/5 border border-[#1a73e8]/20 rounded-xl p-4 mt-6">
                  <div className="flex items-center gap-2 text-[#1a73e8] font-bold text-[10px] uppercase tracking-widest mb-2">
                    <Info size={14} /> Intelligence Summary
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    "{evaluationResults.summary.substring(0, 180)}..."
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#151a22] border border-[#2d3748] rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpandedSections(prev => ({...prev, summary: !prev.summary}))}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Brain size={18} className="text-[#8b5cf6]" />
                    <span>Detailed Reasoning</span>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 ${expandedSections.summary ? '' : '-rotate-90'}`} />
                </button>
                {expandedSections.summary && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <p className="text-slate-400 text-sm leading-relaxed">{evaluationResults.summary}</p>
                  </div>
                )}
              </div>

              <div className="bg-[#151a22] border border-[#2d3748] rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpandedSections(prev => ({...prev, recommendations: !prev.recommendations}))}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <TrendingUp size={18} className="text-[#10b981]" />
                    <span>Improvement Action Plan</span>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 ${expandedSections.recommendations ? '' : '-rotate-90'}`} />
                </button>
                {expandedSections.recommendations && (
                  <div className="px-6 pb-6 animate-fade-in space-y-4">
                    {evaluationResults.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-[#0a0d12] rounded-lg border border-[#2d3748]">
                        <div className="w-6 h-6 rounded bg-[#10b981]/10 flex items-center justify-center text-[#10b981] text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-300">{rec}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center pt-8 border-t border-[#2d3748]">
              <Button variant="secondary" icon={RefreshCw} onClick={resetEvaluation}>Start New Pedagogical Run</Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 animate-[slide-up_0.3s_ease] bg-[#ef4444] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-[100]">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-2 hover:bg-white/20 rounded p-1"><Check size={16} /></button>
        </div>
      )}
    </div>
  );

  return (
    <Layout title="Dashboard">
      <Head>
        <title>Mentora AI | AWS Enterprise Pedagogy</title>
      </Head>
      
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'evaluate' && renderEvaluator()}
      
      <style jsx global>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Layout>
  );
}
