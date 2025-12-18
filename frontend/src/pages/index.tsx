import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { apiService, UploadResponse, TranscribeResponse, EvaluateResponse } from '../services/api';
import { trackVideoUpload, trackTranscription, trackEvaluation, trackAuth } from '../lib/analytics';

type Step = 'upload' | 'syllabus' | 'transcribe' | 'evaluate' | 'results';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedVideo, setUploadedVideo] = useState<UploadResponse | null>(null);
  const [transcription, setTranscription] = useState<TranscribeResponse | null>(null);
  const [syllabusText, setSyllabusText] = useState('');
  const [teachingObjectives, setTeachingObjectives] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = apiService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleDemoAccess = async () => {
    try {
      setLoading(true);
      await apiService.getDemoToken();
      setUser(apiService.getCurrentUser());
      trackAuth('demo_access');
    } catch (err) {
      setError('Failed to get demo access');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.uploadVideo(file);
      setUploadedVideo(response);
      trackVideoUpload(response.file_size, response.filename);
      setCurrentStep('syllabus');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleFileUpload(file);
    } else {
      setError('Please upload a video file');
    }
  };

  const handleTranscribe = async () => {
    if (!uploadedVideo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.transcribeVideo(uploadedVideo.file_path);
      setTranscription(response);
      trackTranscription(
        response.transcribed_text.split(' ').length,
        response.confidence || 0.9
      );
      setCurrentStep('evaluate');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Transcription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!transcription || !syllabusText) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.evaluateTeaching(
        transcription.transcribed_text,
        syllabusText,
        teachingObjectives
      );
      setEvaluationResults(response);
      trackEvaluation({
        engagement: response.scores.engagement_score,
        coverage: response.scores.concept_coverage_score,
        clarity: response.scores.clarity_score,
        overall: response.scores.overall_score
      });
      setCurrentStep('results');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setCurrentStep('upload');
    setUploadedVideo(null);
    setTranscription(null);
    setEvaluationResults(null);
    setSyllabusText('');
    setTeachingObjectives('');
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'var(--accent-success)';
    if (score >= 6) return 'var(--accent-warning)';
    return 'var(--accent-error)';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7.5) return 'Good';
    if (score >= 6.5) return 'Satisfactory';
    return 'Needs Improvement';
  };

  return (
    <>
      <Head>
        <title>Mentora - AI Teaching Quality Evaluation</title>
        <meta name="description" content="AWS-powered multimodal AI system for teaching quality evaluation" />
      </Head>

      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">M</div>
              <div className="logo-text">
                <h1>Mentora</h1>
                <span className="tagline">AWS-Powered Teaching Evaluation</span>
              </div>
            </div>
            <div className="header-actions">
              <a href="/docs" target="_blank" className="docs-link">
                API Docs
              </a>
              {user ? (
                <div className="user-badge">
                  <span className="user-role">{user.role}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              ) : (
                <button className="demo-btn" onClick={handleDemoAccess} disabled={loading}>
                  Quick Demo Access
                </button>
              )}
            </div>
          </div>
        </header>

          <main className="main">
            <div className="hero">
              <div className="aws-badge">
                <span className="aws-icon">AWS</span>
                Multimodal Analysis
              </div>
              <h2>Teaching Quality Intelligence</h2>
              <p>Upload lecture videos, get AI-powered evaluation with explainable scores</p>
            </div>


          <div className="progress-bar">
            {['upload', 'syllabus', 'transcribe', 'evaluate', 'results'].map((step, idx) => (
              <div 
                key={step} 
                className={`progress-step ${currentStep === step ? 'active' : ''} ${
                  ['upload', 'syllabus', 'transcribe', 'evaluate', 'results'].indexOf(currentStep) > idx ? 'completed' : ''
                }`}
              >
                <div className="step-number">{idx + 1}</div>
                <span className="step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">!</span>
              {error}
              <button onClick={() => setError(null)} className="error-close">x</button>
            </div>
          )}

          <div className="workflow-container">
            {currentStep === 'upload' && (
              <div className="card animate-fade-in">
                <div className="card-header">
                  <h3>Upload Lecture Video</h3>
                  <p>Supported formats: MP4, MOV, AVI, WebM (max 100MB)</p>
                </div>
                <div 
                  className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p>Drag & drop your video here</p>
                  <span className="upload-or">or</span>
                  <label className="upload-btn">
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
                  <div className="loading-bar">
                    <div className="loading-progress"></div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'syllabus' && (
              <div className="card animate-fade-in">
                <div className="card-header">
                  <h3>Course Information</h3>
                  <p>Provide syllabus and objectives for accurate evaluation</p>
                </div>
                {uploadedVideo && (
                  <div className="upload-success">
                    <span className="check-icon">✓</span>
                    <span>Uploaded: {uploadedVideo.filename}</span>
                    <span className="file-size">
                      ({(uploadedVideo.file_size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
                <div className="form-group">
                  <label>Course Syllabus *</label>
                  <textarea
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                    placeholder="Paste your course syllabus, topics to be covered, or key concepts..."
                    rows={6}
                  />
                </div>
                <div className="form-group">
                  <label>Learning Objectives (Optional)</label>
                  <textarea
                    value={teachingObjectives}
                    onChange={(e) => setTeachingObjectives(e.target.value)}
                    placeholder="What should students learn from this lecture?"
                    rows={3}
                  />
                </div>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep('upload')}>
                    Back
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => setCurrentStep('transcribe')}
                    disabled={!syllabusText.trim()}
                  >
                    Continue to Transcription
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'transcribe' && (
              <div className="card animate-fade-in">
                <div className="card-header">
                  <h3>Transcribe Audio</h3>
                  <p>Extract speech from your lecture video using AWS Transcribe</p>
                </div>
                <div className="aws-service-info">
                  <div className="service-badge">
                    <span className="aws-label">AWS</span>
                    Amazon Transcribe
                  </div>
                  <p>Speech-to-text with high accuracy and speaker diarization</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep('syllabus')}>
                    Back
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={handleTranscribe}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Transcribing...
                      </>
                    ) : (
                      'Start Transcription'
                    )}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'evaluate' && (
              <div className="card animate-fade-in">
                <div className="card-header">
                  <h3>Evaluate Teaching Quality</h3>
                  <p>AI-powered analysis using AWS Bedrock</p>
                </div>
                {transcription && (
                  <div className="transcription-preview">
                    <div className="preview-header">
                      <h4>Transcription Complete</h4>
                      <span className="confidence-badge">
                        {((transcription.confidence || 0.9) * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                    <div className="preview-text">
                      {transcription.transcribed_text.slice(0, 300)}...
                    </div>
                  </div>
                )}
                <div className="aws-service-info">
                  <div className="service-badge">
                    <span className="aws-label">AWS</span>
                    Amazon Bedrock
                  </div>
                  <p>Claude 3 Sonnet for explainable teaching evaluation</p>
                </div>
                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep('transcribe')}>
                    Back
                  </button>
                  <button 
                    className="btn-primary btn-evaluate" 
                    onClick={handleEvaluate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Analyzing...
                      </>
                    ) : (
                      'Run AI Evaluation'
                    )}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'results' && evaluationResults && (
              <div className="results-container animate-fade-in">
                <div className="results-header">
                  <h3>Teaching Quality Report</h3>
                  <div className="overall-score" style={{ '--score-color': getScoreColor(evaluationResults.scores.overall_score) } as React.CSSProperties}>
                    <div className="score-ring">
                      <span className="score-value">{evaluationResults.scores.overall_score.toFixed(1)}</span>
                      <span className="score-max">/10</span>
                    </div>
                    <span className="score-label">{getScoreLabel(evaluationResults.scores.overall_score)}</span>
                  </div>
                </div>

                <div className="scores-grid">
                  {[
                    { key: 'engagement_score', label: 'Engagement', icon: '💬', description: 'Student interaction and interest' },
                    { key: 'concept_coverage_score', label: 'Coverage', icon: '📚', description: 'Syllabus topic alignment' },
                    { key: 'clarity_score', label: 'Clarity', icon: '✨', description: 'Explanation quality' },
                  ].map((metric) => {
                    const score = evaluationResults.scores[metric.key as keyof EvaluationScore];
                    return (
                      <div key={metric.key} className="score-card">
                        <div className="score-card-header">
                          <span className="score-icon">{metric.icon}</span>
                          <span className="score-name">{metric.label}</span>
                        </div>
                        <div className="score-display">
                          <span className="score-number" style={{ color: getScoreColor(score) }}>
                            {score.toFixed(1)}
                          </span>
                          <div className="score-bar-container">
                            <div 
                              className="score-bar" 
                              style={{ 
                                width: `${score * 10}%`,
                                background: getScoreColor(score)
                              }}
                            ></div>
                          </div>
                        </div>
                        <p className="score-description">{metric.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="summary-card">
                  <h4>Summary</h4>
                  <p>{evaluationResults.summary}</p>
                </div>

                <div className="recommendations-card">
                  <h4>Recommendations</h4>
                  <ul>
                    {evaluationResults.recommendations.map((rec, idx) => (
                      <li key={idx}>
                        <span className="rec-number">{idx + 1}</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="results-actions">
                  <button className="btn-secondary" onClick={resetProcess}>
                    Start New Evaluation
                  </button>
                  <button className="btn-outline" onClick={() => window.print()}>
                    Export Report
                  </button>
                </div>

                <div className="audit-info">
                  <span className="audit-label">Audit Trail</span>
                  <span className="audit-text">
                    This evaluation is deterministic, explainable, and reproducible. 
                    Full audit logging enabled for compliance.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="aws-services-showcase">
            <h3>Powered by AWS</h3>
            <div className="services-list">
              {[
                { name: 'Bedrock', desc: 'GenAI Evaluation', status: 'ready' },
                { name: 'Transcribe', desc: 'Speech-to-Text', status: 'ready' },
                { name: 'Rekognition', desc: 'Visual Analysis', status: 'stub' },
                { name: 'S3', desc: 'Video Storage', status: 'ready' },
                { name: 'Cognito', desc: 'Authentication', status: 'planned' },
              ].map((svc) => (
                <div key={svc.name} className="service-item">
                  <span className="service-name">{svc.name}</span>
                  <span className="service-desc">{svc.desc}</span>
                  <span className={`service-status ${svc.status}`}>{svc.status}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p>Mentora - AI Teaching Quality Evaluation</p>
            <p className="footer-sub">Secure-by-design GenAI orchestration for education</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--gradient-primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }

        .logo-text h1 {
          font-size: 24px;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .tagline {
          font-size: 12px;
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .docs-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          padding: 8px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .docs-link:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .demo-btn {
          background: var(--gradient-primary);
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          font-size: 14px;
        }

        .demo-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          padding: 8px 14px;
          border-radius: 8px;
        }

        .user-role {
          background: var(--accent-primary);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .user-email {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .main {
          flex: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px;
          width: 100%;
        }

        .hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .aws-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .aws-icon {
          background: #ff9900;
          color: #232f3e;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
        }

        .hero h2 {
          font-size: 36px;
          margin-bottom: 12px;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero p {
          color: var(--text-secondary);
          font-size: 18px;
        }

        .progress-bar {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 40px;
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--bg-card);
          border-radius: 8px;
          opacity: 0.5;
          transition: all 0.3s;
        }

        .progress-step.active {
          opacity: 1;
          background: var(--bg-card-hover);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
        }

        .progress-step.completed {
          opacity: 0.8;
        }

        .progress-step.completed .step-number {
          background: var(--accent-success);
        }

        .step-number {
          width: 24px;
          height: 24px;
          background: var(--accent-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .step-label {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--accent-error);
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          color: var(--accent-error);
        }

        .error-icon {
          width: 24px;
          height: 24px;
          background: var(--accent-error);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .error-close {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--accent-error);
          font-size: 18px;
          cursor: pointer;
        }

        .workflow-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 32px;
          border: 1px solid var(--border-color);
        }

        .card-header {
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 22px;
          margin-bottom: 8px;
        }

        .card-header p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .upload-zone {
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          padding: 48px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }

        .upload-zone:hover, .upload-zone.dragging {
          border-color: var(--accent-primary);
          background: rgba(59, 130, 246, 0.05);
        }

        .upload-icon {
          color: var(--accent-primary);
          margin-bottom: 16px;
        }

        .upload-zone p {
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .upload-or {
          display: block;
          color: var(--text-muted);
          margin: 12px 0;
          font-size: 13px;
        }

        .upload-btn {
          display: inline-block;
          background: var(--gradient-primary);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-btn:hover {
          opacity: 0.9;
        }

        .loading-bar {
          height: 4px;
          background: var(--bg-secondary);
          border-radius: 2px;
          margin-top: 24px;
          overflow: hidden;
        }

        .loading-progress {
          height: 100%;
          width: 30%;
          background: var(--gradient-primary);
          border-radius: 2px;
          animation: loading 1.5s ease-in-out infinite;
        }

        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }

        .upload-success {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent-success);
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .check-icon {
          color: var(--accent-success);
          font-size: 18px;
        }

        .file-size {
          color: var(--text-muted);
          font-size: 13px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: var(--text-secondary);
        }

        .form-group textarea {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 14px;
          color: var(--text-primary);
          font-size: 14px;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .card-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .btn-primary {
          background: var(--gradient-primary);
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          padding: 12px 24px;
          border-radius: 8px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .btn-secondary:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--accent-primary);
          padding: 12px 24px;
          border-radius: 8px;
          color: var(--accent-primary);
          font-weight: 500;
        }

        .btn-evaluate {
          background: var(--gradient-success);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .aws-service-info {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
        }

        .service-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .aws-label {
          background: #ff9900;
          color: #232f3e;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
        }

        .aws-service-info p {
          color: var(--text-muted);
          font-size: 13px;
        }

        .transcription-preview {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .preview-header h4 {
          font-size: 14px;
          color: var(--accent-success);
        }

        .confidence-badge {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-success);
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .preview-text {
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.7;
        }

        .results-container {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 32px;
          border: 1px solid var(--border-color);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .results-header h3 {
          font-size: 24px;
        }

        .overall-score {
          text-align: center;
        }

        .score-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 4px solid var(--score-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px color-mix(in srgb, var(--score-color) 30%, transparent);
        }

        .score-value {
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
        }

        .score-max {
          font-size: 14px;
          color: var(--text-muted);
        }

        .overall-score .score-label {
          display: block;
          margin-top: 8px;
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .scores-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .score-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
        }

        .score-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .score-icon {
          font-size: 20px;
        }

        .score-name {
          font-weight: 500;
          font-size: 14px;
        }

        .score-display {
          margin-bottom: 8px;
        }

        .score-number {
          font-size: 28px;
          font-weight: 700;
        }

        .score-bar-container {
          height: 6px;
          background: var(--bg-card);
          border-radius: 3px;
          margin-top: 8px;
        }

        .score-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .score-description {
          font-size: 12px;
          color: var(--text-muted);
        }

        .summary-card, .recommendations-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .summary-card h4, .recommendations-card h4 {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-card p {
          line-height: 1.7;
        }

        .recommendations-card ul {
          list-style: none;
        }

        .recommendations-card li {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-color);
        }

        .recommendations-card li:last-child {
          border-bottom: none;
        }

        .rec-number {
          width: 24px;
          height: 24px;
          background: var(--accent-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .results-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 24px 0;
        }

        .audit-info {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid var(--accent-secondary);
          padding: 16px;
          border-radius: 8px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .audit-label {
          background: var(--accent-secondary);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .audit-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .aws-services-showcase {
          margin-top: 64px;
          text-align: center;
        }

        .aws-services-showcase h3 {
          font-size: 14px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 24px;
        }

        .services-list {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .service-item {
          background: var(--bg-card);
          padding: 16px 24px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 140px;
        }

        .service-name {
          font-weight: 600;
          font-size: 15px;
        }

        .service-desc {
          font-size: 12px;
          color: var(--text-muted);
        }

        .service-status {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 10px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .service-status.ready {
          background: rgba(16, 185, 129, 0.2);
          color: var(--accent-success);
        }

        .service-status.stub {
          background: rgba(245, 158, 11, 0.2);
          color: var(--accent-warning);
        }

        .service-status.planned {
          background: rgba(100, 116, 139, 0.2);
          color: var(--text-muted);
        }

        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 24px;
          text-align: center;
        }

        .footer-content p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .footer-sub {
          color: var(--text-muted);
          font-size: 12px;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .scores-grid {
            grid-template-columns: 1fr;
          }

          .progress-bar {
            flex-wrap: wrap;
          }

          .results-header {
            flex-direction: column;
            gap: 24px;
          }
        }

        @media print {
          .header, .footer, .card-actions, .results-actions, .aws-services-showcase, .progress-bar {
            display: none;
          }

          .app {
            background: white;
          }

          .results-container {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </>
  );
}
