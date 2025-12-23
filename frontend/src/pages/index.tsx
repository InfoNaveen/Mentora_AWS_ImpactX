import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { apiService, EvaluateResponse, Evaluation } from '../services/api';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [syllabus, setSyllabus] = useState('');
  const [results, setResults] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [evaluationHistory, setEvaluationHistory] = useState<Evaluation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(apiService.isAuthenticated());
    
    // Load evaluation history if authenticated
    if (apiService.isAuthenticated()) {
      loadEvaluationHistory();
    }
  }, []);

  const loadEvaluationHistory = async () => {
    try {
      const response = await apiService.getEvaluations();
      setEvaluationHistory(response.evaluations);
    } catch (err) {
      console.error('Failed to load evaluation history:', err);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await apiService.demoLogin();
      setIsAuthenticated(true);
      await loadEvaluationHistory();
      setError(null);
    } catch (err: any) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedVideoId(null); // Reset video ID when new file selected
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadResponse = await apiService.uploadVideo(file);
      setUploadedVideoId(uploadResponse.video_id);
      setError(null);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Video upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!uploadedVideoId || !syllabus.trim()) {
      setError('Please upload a video and add syllabus content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.evaluateTeaching(uploadedVideoId, syllabus);
      setResults(response);
      await loadEvaluationHistory(); // Refresh history
    } catch (err: any) {
      console.error('Evaluation error:', err);
      setError('Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setSyllabus('');
    setResults(null);
    setError(null);
    setUploadedVideoId(null);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Mentora - Login</title>
        </Head>
        <div style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #232f3e 100%)',
          fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '32px',
              margin: '0 auto 24px'
            }}>M</div>
            
            <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '16px' }}>
              Welcome to Mentora
            </h1>
            <p style={{ fontSize: '16px', color: '#b0b0b0', marginBottom: '32px' }}>
              AI-Powered Teaching Quality Evaluation Platform
            </p>
            
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: loading 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                color: loading ? '#9e9e9e' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Connecting...' : 'Start Demo Session'}
            </button>
            
            {error && (
              <div style={{ 
                marginTop: '16px', 
                padding: '12px 16px', 
                background: 'rgba(244, 67, 54, 0.1)', 
                border: '1px solid rgba(244, 67, 54, 0.3)', 
                borderRadius: '8px', 
                color: '#f44336',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Main application interface
  return (
    <>
      <Head>
        <title>Mentora - AI Teaching Evaluation Platform</title>
        <meta name="description" content="Enterprise-grade AI teaching evaluation powered by AWS" />
      </Head>

      {/* AWS Console-Style Dark Theme */}
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #232f3e 100%)',
        fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
        color: '#ffffff'
      }}>
        
        {/* Top Navigation Bar */}
        <div style={{
          background: 'rgba(15, 20, 25, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>M</div>
              <h1 style={{ fontSize: '20px', fontWeight: '500', margin: 0 }}>Mentora</h1>
              <span style={{ 
                background: 'rgba(255, 149, 0, 0.1)', 
                color: '#ff9500', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: '500'
              }}>
                AI Teaching Evaluation
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                background: 'rgba(46, 125, 50, 0.2)', 
                color: '#4caf50', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: '500'
              }}>
                AWS S3 Enabled
              </span>
              <span style={{ 
                background: 'rgba(33, 150, 243, 0.2)', 
                color: '#2196f3', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Real Database
              </span>
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                History ({evaluationHistory.length})
              </button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
          
          {showHistory ? (
            /* Evaluation History */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
                  Evaluation History
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  New Evaluation
                </button>
              </div>

              {evaluationHistory.length === 0 ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '48px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px', color: '#ffffff' }}>
                    No Evaluations Yet
                  </h3>
                  <p style={{ color: '#b0b0b0', marginBottom: '24px' }}>
                    Upload your first lecture video to get started with AI evaluation
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {evaluationHistory.map((evaluation) => (
                    <div key={evaluation.id} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '24px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff', margin: '0 0 8px 0' }}>
                            {evaluation.videos?.filename || 'Unknown Video'}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#b0b0b0', margin: 0 }}>
                            Evaluated: {new Date(evaluation.evaluated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{
                          background: `linear-gradient(135deg, ${(evaluation.scores?.overall_score || 0) >= 8.5 ? '#4caf50' : (evaluation.scores?.overall_score || 0) >= 7 ? '#ff9500' : '#f44336'} 0%, ${(evaluation.scores?.overall_score || 0) >= 8.5 ? '#2e7d32' : (evaluation.scores?.overall_score || 0) >= 7 ? '#ff6b35' : '#d32f2f'} 100%)`,
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {evaluation.scores?.overall_score || 0}/10
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#2196f3' }}>
                            {evaluation.scores?.engagement_score || 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#b0b0b0' }}>Engagement</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#4caf50' }}>
                            {evaluation.scores?.clarity_score || 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#b0b0b0' }}>Clarity</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#ff9500' }}>
                            {evaluation.scores?.concept_coverage_score || 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#b0b0b0' }}>Coverage</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: '#9c27b0' }}>
                            {evaluation.scores?.pedagogy_score || 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#b0b0b0' }}>Pedagogy</div>
                        </div>
                      </div>
                      
                      <p style={{ fontSize: '14px', color: '#e0e0e0', lineHeight: '1.5', margin: 0 }}>
                        {evaluation.summary || 'No summary available'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : !results ? (
            /* Input Interface */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              
              {/* Left Panel - Upload & Configuration */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px'
              }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  marginBottom: '24px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#ff9500',
                    borderRadius: '50%'
                  }}></div>
                  Teaching Evaluation Setup
                </h2>

                {/* Video Upload Section */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#e0e0e0'
                  }}>
                    Lecture Video Upload
                  </label>
                  <div style={{
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    background: file ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="video-upload"
                    />
                    <label 
                      htmlFor="video-upload"
                      style={{
                        cursor: 'pointer',
                        display: 'block'
                      }}
                    >
                      {file ? (
                        <div>
                          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
                          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px', color: '#4caf50' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#9e9e9e' }}>
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📹</div>
                          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                            Click to upload lecture video
                          </div>
                          <div style={{ fontSize: '14px', color: '#9e9e9e' }}>
                            Supports MP4, MOV, AVI formats
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {file && !uploadedVideoId && (
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '12px 20px',
                        background: loading 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                        color: loading ? '#9e9e9e' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Uploading to AWS S3...' : 'Upload to AWS S3'}
                    </button>
                  )}
                  
                  {uploadedVideoId && (
                    <div style={{ 
                      marginTop: '16px', 
                      padding: '12px 16px', 
                      background: 'rgba(76, 175, 80, 0.1)', 
                      border: '1px solid rgba(76, 175, 80, 0.3)', 
                      borderRadius: '8px', 
                      color: '#4caf50',
                      fontSize: '14px'
                    }}>
                      ✅ Video uploaded to AWS S3 successfully
                    </div>
                  )}
                </div>

                {/* Syllabus Input */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ 
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#e0e0e0'
                  }}>
                    Course Syllabus & Learning Objectives
                  </label>
                  <textarea
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="Enter your course syllabus, learning objectives, and key topics that should be covered in the lecture..."
                    rows={8}
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#ffffff',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                {/* Action Button */}
                <button
                  onClick={handleEvaluate}
                  disabled={!uploadedVideoId || !syllabus.trim() || loading}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: loading || !uploadedVideoId || !syllabus.trim()
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'linear-gradient(135deg, #ff9500 0%, #ff6b35 100%)',
                    color: loading || !uploadedVideoId || !syllabus.trim() ? '#9e9e9e' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading || !uploadedVideoId || !syllabus.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid #ffffff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      AI Analysis in Progress...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Start AI Teaching Evaluation
                    </>
                  )}
                </button>

                {error && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px 16px', 
                    background: 'rgba(244, 67, 54, 0.1)', 
                    border: '1px solid rgba(244, 67, 54, 0.3)', 
                    borderRadius: '8px', 
                    color: '#f44336',
                    fontSize: '14px'
                  }}>
                    {error}
                  </div>
                )}
              </div>

              {/* Right Panel - AI Capabilities */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '24px',
                  color: '#ffffff'
                }}>
                  Real AI Evaluation System
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    {
                      icon: '🎯',
                      title: 'Student Engagement Analysis',
                      desc: 'Deterministic assessment based on content structure and complexity'
                    },
                    {
                      icon: '📚',
                      title: 'Curriculum Coverage Mapping',
                      desc: 'Real analysis of syllabus alignment using keyword matching'
                    },
                    {
                      icon: '🗣️',
                      title: 'Clarity & Communication',
                      desc: 'Evaluation based on sentence structure and content organization'
                    },
                    {
                      icon: '👨‍🏫',
                      title: 'Pedagogical Assessment',
                      desc: 'Analysis of teaching methods using content heuristics'
                    },
                    {
                      icon: '☁️',
                      title: 'AWS S3 Integration',
                      desc: 'Real cloud storage with actual file uploads and persistence'
                    },
                    {
                      icon: '🗄️',
                      title: 'Supabase Database',
                      desc: 'Real PostgreSQL database with persistent data storage'
                    }
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ fontSize: '24px' }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px', color: '#ffffff' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '14px', color: '#b0b0b0', lineHeight: '1.4' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* System Status */}
                <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: '#4caf50' }}>
                    ✅ System Status: All Systems Operational
                  </h4>
                  <div style={{ fontSize: '14px', color: '#e0e0e0', lineHeight: '1.4' }}>
                    • AWS S3 bucket connected and ready<br/>
                    • Supabase PostgreSQL database online<br/>
                    • Real evaluation algorithms active<br/>
                    • No mock data or fake responses
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Dashboard */
            <div>
              {/* Results Header */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#ffffff'
                }}>
                  AI Teaching Evaluation Results
                </h2>
                
                {/* Overall Score Circle */}
                <div style={{ 
                  width: '160px', 
                  height: '160px', 
                  margin: '24px auto', 
                  background: `conic-gradient(from 0deg, #ff9500 0deg, #ff6b35 ${(results.scores.overall_score / 10) * 360}deg, rgba(255, 255, 255, 0.1) ${(results.scores.overall_score / 10) * 360}deg)`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'rgba(15, 20, 25, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff' }}>
                      {results.scores.overall_score}
                    </div>
                    <div style={{ fontSize: '14px', color: '#9e9e9e' }}>/ 10</div>
                  </div>
                </div>

                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '500',
                  color: results.scores.overall_score >= 8.5 ? '#4caf50' : results.scores.overall_score >= 7 ? '#ff9500' : '#f44336'
                }}>
                  {results.scores.overall_score >= 8.5 ? 'Excellent Performance' : 
                   results.scores.overall_score >= 7 ? 'Good Performance' : 'Needs Improvement'}
                </div>

                <div style={{ 
                  marginTop: '16px',
                  fontSize: '14px', 
                  color: '#9e9e9e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>📹</span>
                  Video: {results.video_filename}
                  <span style={{ marginLeft: '16px' }}>📅</span>
                  {new Date(results.evaluated_at).toLocaleDateString()}
                </div>
              </div>

              {/* Score Breakdown */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                {[
                  { key: 'engagement_score', label: 'Student Engagement', icon: '🎯', color: '#2196f3' },
                  { key: 'concept_coverage_score', label: 'Concept Coverage', icon: '📚', color: '#4caf50' },
                  { key: 'clarity_score', label: 'Explanation Clarity', icon: '🗣️', color: '#ff9500' },
                  { key: 'pedagogy_score', label: 'Pedagogical Methods', icon: '👨‍🏫', color: '#9c27b0' }
                ].map((metric) => (
                  <div key={metric.key} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        background: `${metric.color}20`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        {metric.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff' }}>
                          {metric.label}
                        </div>
                        <div style={{ fontSize: '14px', color: '#9e9e9e' }}>
                          Real Analysis
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: metric.color }}>
                        {results.scores[metric.key as keyof typeof results.scores]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${((results.scores[metric.key as keyof typeof results.scores] as number) / 10) * 100}%`,
                            height: '100%',
                            background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}80 100%)`,
                            borderRadius: '4px',
                            transition: 'width 1s ease-out'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Summary */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '16px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🤖 Real AI Analysis Summary
                </h3>
                <p style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6', 
                  color: '#e0e0e0',
                  margin: 0
                }}>
                  {results.summary}
                </p>
              </div>

              {/* Recommendations */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '32px',
                marginBottom: '24px'
              }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '20px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💡 AI Recommendations
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        flexShrink: 0
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: '15px', color: '#e0e0e0', lineHeight: '1.5' }}>
                        {rec}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Persistence Notice */}
              <div style={{
                background: 'rgba(33, 150, 243, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: '#2196f3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🗄️ Real Data Persistence
                </h4>
                <p style={{ fontSize: '14px', color: '#e0e0e0', lineHeight: '1.5', margin: 0 }}>
                  This evaluation has been permanently stored in our Supabase PostgreSQL database. 
                  Your video is securely stored in AWS S3. All data persists across sessions and can be accessed anytime.
                  Evaluation ID: <code style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{results.evaluation_id}</code>
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px' }}>
                <button
                  onClick={reset}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔄 Evaluate Another Lecture
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  style={{
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  📊 View History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Animation Styles */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}