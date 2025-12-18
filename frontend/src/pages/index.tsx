import React, { useState } from 'react';
import Head from 'next/head';
import VideoUpload from '../components/VideoUpload';
import SyllabusInput from '../components/SyllabusInput';
import EvaluationResults from '../components/EvaluationResults';
import { apiService, UploadResponse, TranscribeResponse, EvaluateResponse } from '../services/api';

export default function Home() {
  const [uploadedVideo, setUploadedVideo] = useState<UploadResponse | null>(null);
  const [transcription, setTranscription] = useState<TranscribeResponse | null>(null);
  const [syllabusText, setSyllabusText] = useState('');
  const [teachingObjectives, setTeachingObjectives] = useState('');
  const [evaluationResults, setEvaluationResults] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (response: UploadResponse) => {
    setUploadedVideo(response);
    setTranscription(null);
    setEvaluationResults(null);
    setError(null);
  };

  const handleSyllabusChange = (syllabus: string, objectives?: string) => {
    setSyllabusText(syllabus);
    setTeachingObjectives(objectives || '');
  };

  const handleTranscribe = async () => {
    if (!uploadedVideo) {
      setError('Please upload a video first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.transcribeVideo(uploadedVideo.file_path);
      setTranscription(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Transcription failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!transcription || !syllabusText) {
      setError('Please complete transcription and provide syllabus text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.evaluateTeaching(
        transcription.transcribed_text,
        syllabusText,
        teachingObjectives
      );
      setEvaluationResults(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setUploadedVideo(null);
    setTranscription(null);
    setEvaluationResults(null);
    setSyllabusText('');
    setTeachingObjectives('');
    setError(null);
  };

  return (
    <>
      <Head>
        <title>Mentora - Teaching Quality Evaluation</title>
        <meta name="description" content="AI-powered teaching quality evaluation system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <h1>Mentora</h1>
          <p>Multimodal AI System for Teaching Quality Evaluation</p>
        </header>

        <main className="main">
          {/* Step 1: Video Upload */}
          <section className="step">
            <VideoUpload onUploadSuccess={handleUploadSuccess} />
            {uploadedVideo && (
              <div className="success-message">
                ✅ Video uploaded: {uploadedVideo.filename} ({(uploadedVideo.file_size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </section>

          {/* Step 2: Syllabus Input */}
          <section className="step">
            <SyllabusInput onSyllabusChange={handleSyllabusChange} />
          </section>

          {/* Step 3: Transcription */}
          <section className="step">
            <div className="action-section">
              <h2>Transcribe Audio</h2>
              <p>Extract speech from the uploaded video for analysis.</p>
              <button
                onClick={handleTranscribe}
                disabled={!uploadedVideo || loading}
                className="action-button"
              >
                {loading ? 'Transcribing...' : 'Transcribe Video'}
              </button>
              
              {transcription && (
                <div className="transcription-result">
                  <h3>Transcription Result</h3>
                  <div className="transcription-text">
                    {transcription.transcribed_text}
                  </div>
                  {transcription.confidence && (
                    <p className="confidence">
                      Confidence: {(transcription.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Step 4: Evaluation */}
          <section className="step">
            <div className="action-section">
              <h2>Evaluate Teaching Quality</h2>
              <p>Analyze the lecture against syllabus objectives and teaching best practices.</p>
              <button
                onClick={handleEvaluate}
                disabled={!transcription || !syllabusText || loading}
                className="action-button evaluate-button"
              >
                {loading ? 'Evaluating...' : 'Evaluate Teaching'}
              </button>
            </div>
          </section>

          {/* Results */}
          {evaluationResults && (
            <section className="step">
              <EvaluationResults results={evaluationResults} />
            </section>
          )}

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Reset Button */}
          {(uploadedVideo || transcription || evaluationResults) && (
            <section className="step">
              <button onClick={resetProcess} className="reset-button">
                Start New Evaluation
              </button>
            </section>
          )}
        </main>
      </div>

      <style jsx>{`
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header h1 {
          color: #007bff;
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .header p {
          color: #666;
          font-size: 1.1rem;
        }

        .main {
          max-width: 800px;
          margin: 0 auto;
        }

        .step {
          margin-bottom: 30px;
        }

        .action-section {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .action-section h2 {
          color: #333;
          margin-bottom: 10px;
        }

        .action-section p {
          color: #666;
          margin-bottom: 20px;
        }

        .action-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
        }

        .action-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .action-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .evaluate-button {
          background: #28a745;
        }

        .evaluate-button:hover:not(:disabled) {
          background: #1e7e34;
        }

        .transcription-result {
          margin-top: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .transcription-text {
          background: white;
          padding: 15px;
          border-radius: 4px;
          border-left: 4px solid #007bff;
          margin: 10px 0;
          line-height: 1.6;
        }

        .confidence {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          text-align: center;
        }

        .reset-button {
          background: #6c757d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          display: block;
          margin: 0 auto;
        }

        .reset-button:hover {
          background: #545b62;
        }
      `}</style>
    </>
  );
}