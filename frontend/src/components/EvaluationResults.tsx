import React from 'react';
import { EvaluateResponse } from '../services/api';

interface EvaluationResultsProps {
  results: EvaluateResponse;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ results }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#28a745'; // Green
    if (score >= 6) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="results-container">
      <h2>Teaching Quality Evaluation</h2>
      
      {/* Overall Score */}
      <div className="overall-score">
        <h3>Overall Score</h3>
        <div className="score-circle">
          <span className="score-value">{results.scores.overall_score.toFixed(1)}</span>
          <span className="score-max">/10</span>
        </div>
        <p className="score-label">{getScoreLabel(results.scores.overall_score)}</p>
      </div>

      {/* Individual Scores */}
      <div className="scores-grid">
        <div className="score-card">
          <h4>Engagement</h4>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ 
                width: `${(results.scores.engagement_score / 10) * 100}%`,
                backgroundColor: getScoreColor(results.scores.engagement_score)
              }}
            ></div>
          </div>
          <span className="score-text">{results.scores.engagement_score.toFixed(1)}/10</span>
        </div>

        <div className="score-card">
          <h4>Concept Coverage</h4>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ 
                width: `${(results.scores.concept_coverage_score / 10) * 100}%`,
                backgroundColor: getScoreColor(results.scores.concept_coverage_score)
              }}
            ></div>
          </div>
          <span className="score-text">{results.scores.concept_coverage_score.toFixed(1)}/10</span>
        </div>

        <div className="score-card">
          <h4>Clarity</h4>
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ 
                width: `${(results.scores.clarity_score / 10) * 100}%`,
                backgroundColor: getScoreColor(results.scores.clarity_score)
              }}
            ></div>
          </div>
          <span className="score-text">{results.scores.clarity_score.toFixed(1)}/10</span>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-section">
        <h3>Summary</h3>
        <p>{results.summary}</p>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>Recommendations</h3>
        <ul>
          {results.recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .results-container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }

        .overall-score {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .score-circle {
          display: inline-block;
          margin: 10px 0;
        }

        .score-value {
          font-size: 48px;
          font-weight: bold;
          color: ${getScoreColor(results.scores.overall_score)};
        }

        .score-max {
          font-size: 24px;
          color: #666;
        }

        .score-label {
          font-size: 18px;
          font-weight: 600;
          margin: 10px 0;
          color: ${getScoreColor(results.scores.overall_score)};
        }

        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .score-card {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 6px;
          background: #fafafa;
        }

        .score-card h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .score-bar {
          width: 100%;
          height: 20px;
          background: #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .score-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .score-text {
          font-weight: 600;
          color: #333;
        }

        .summary-section,
        .recommendations-section {
          margin-bottom: 20px;
        }

        .summary-section h3,
        .recommendations-section h3 {
          color: #333;
          margin-bottom: 10px;
        }

        .summary-section p {
          line-height: 1.6;
          color: #555;
        }

        .recommendations-section ul {
          padding-left: 20px;
        }

        .recommendations-section li {
          margin-bottom: 8px;
          line-height: 1.5;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default EvaluationResults;