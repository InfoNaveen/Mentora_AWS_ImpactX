import React from 'react';
import { EvaluateResponse } from '../services/api';

interface EvaluationResultsProps {
  results: EvaluateResponse;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ results }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-500';
    if (score >= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">🎯</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">AI Evaluation Results</h3>
        {(results as any).ai_powered && (
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            🤖 AI-Powered Analysis
          </div>
        )}
      </div>
      
      {/* Overall Score */}
      <div className="text-center mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Overall Teaching Score</h4>
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">{results.scores.overall_score.toFixed(1)}</span>
              <div className="text-white text-sm opacity-90">/10</div>
            </div>
          </div>
        </div>
        <p className="text-lg font-semibold mt-4 text-gray-700">{getScoreLabel(results.scores.overall_score)}</p>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{results.scores.engagement_score.toFixed(1)}</span>
          </div>
          <h5 className="font-semibold text-gray-800">Student Engagement</h5>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(results.scores.engagement_score / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{results.scores.concept_coverage_score.toFixed(1)}</span>
          </div>
          <h5 className="font-semibold text-gray-800">Concept Coverage</h5>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(results.scores.concept_coverage_score / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{results.scores.clarity_score.toFixed(1)}</span>
          </div>
          <h5 className="font-semibold text-gray-800">Explanation Clarity</h5>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(results.scores.clarity_score / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
          <span className="mr-2">📋</span>
          Analysis Summary
        </h4>
        <p className="text-blue-700 leading-relaxed">{results.summary}</p>
      </div>

      {/* Recommendations */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          AI Recommendations
        </h4>
        <ul className="space-y-2">
          {results.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start space-x-2 text-green-700">
              <span className="text-green-500 mt-1">•</span>
              <span className="leading-relaxed">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Analysis (if available) */}
      {(results as any).detailed_analysis && (
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="mr-2">🧠</span>
            Detailed AI Analysis
          </h4>
          <p className="text-purple-700 text-sm leading-relaxed">{(results as any).detailed_analysis}</p>
        </div>
      )}
    </div>
  );
};

export default EvaluationResults;