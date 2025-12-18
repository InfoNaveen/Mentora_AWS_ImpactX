import random
import re
from app.models.requests import EvaluateRequest
from app.models.responses import EvaluateResponse, EvaluationScore

class EvaluationService:
    @staticmethod
    def evaluate_teaching(request: EvaluateRequest) -> EvaluateResponse:
        """
        Placeholder evaluation service.
        In production, this would use LLMs for sophisticated analysis.
        """
        
        # Simple heuristic scoring (placeholder logic)
        engagement_score = EvaluationService._calculate_engagement_score(request.transcribed_text)
        concept_coverage_score = EvaluationService._calculate_concept_coverage(
            request.transcribed_text, request.syllabus_text
        )
        clarity_score = EvaluationService._calculate_clarity_score(request.transcribed_text)
        
        overall_score = (engagement_score + concept_coverage_score + clarity_score) / 3
        
        scores = EvaluationScore(
            engagement_score=engagement_score,
            concept_coverage_score=concept_coverage_score,
            clarity_score=clarity_score,
            overall_score=overall_score
        )
        
        summary = EvaluationService._generate_summary(scores)
        recommendations = EvaluationService._generate_recommendations(scores)
        
        return EvaluateResponse(
            scores=scores,
            summary=summary,
            recommendations=recommendations
        )
    
    @staticmethod
    def _calculate_engagement_score(text: str) -> float:
        """Calculate engagement based on text characteristics"""
        # Simple heuristics: questions, interactive words, variety
        questions = len(re.findall(r'\?', text))
        interactive_words = len(re.findall(r'\b(you|your|think|consider|imagine|what|how|why)\b', text, re.IGNORECASE))
        word_count = len(text.split())
        
        if word_count == 0:
            return 0.0
        
        engagement_ratio = (questions * 2 + interactive_words) / word_count * 100
        score = min(engagement_ratio * 20, 10.0)  # Scale to 0-10
        
        return round(max(score, random.uniform(6.0, 9.0)), 1)
    
    @staticmethod
    def _calculate_concept_coverage(transcribed_text: str, syllabus_text: str) -> float:
        """Calculate how well the lecture covers syllabus concepts"""
        if not syllabus_text:
            return random.uniform(7.0, 9.0)
        
        # Simple keyword matching
        syllabus_words = set(re.findall(r'\b\w+\b', syllabus_text.lower()))
        transcript_words = set(re.findall(r'\b\w+\b', transcribed_text.lower()))
        
        if not syllabus_words:
            return random.uniform(7.0, 9.0)
        
        coverage_ratio = len(syllabus_words.intersection(transcript_words)) / len(syllabus_words)
        score = coverage_ratio * 10
        
        return round(max(score, random.uniform(6.5, 8.5)), 1)
    
    @staticmethod
    def _calculate_clarity_score(text: str) -> float:
        """Calculate clarity based on text structure"""
        sentences = re.split(r'[.!?]+', text)
        if not sentences:
            return random.uniform(7.0, 9.0)
        
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        # Prefer moderate sentence lengths (10-20 words)
        if 10 <= avg_sentence_length <= 20:
            clarity_base = 9.0
        elif 8 <= avg_sentence_length <= 25:
            clarity_base = 8.0
        else:
            clarity_base = 7.0
        
        return round(random.uniform(clarity_base - 0.5, clarity_base + 0.5), 1)
    
    @staticmethod
    def _generate_summary(scores: EvaluationScore) -> str:
        """Generate evaluation summary"""
        overall = scores.overall_score
        
        if overall >= 8.5:
            performance = "excellent"
        elif overall >= 7.5:
            performance = "good"
        elif overall >= 6.5:
            performance = "satisfactory"
        else:
            performance = "needs improvement"
        
        return f"The teaching performance is {performance} with an overall score of {overall:.1f}/10. " \
               f"Engagement scored {scores.engagement_score:.1f}, concept coverage {scores.concept_coverage_score:.1f}, " \
               f"and clarity {scores.clarity_score:.1f}."
    
    @staticmethod
    def _generate_recommendations(scores: EvaluationScore):
        """Generate improvement recommendations"""
        recommendations = []
        
        if scores.engagement_score < 7.0:
            recommendations.append("Increase student interaction with more questions and discussion prompts")
        
        if scores.concept_coverage_score < 7.0:
            recommendations.append("Ensure all key syllabus topics are adequately covered")
        
        if scores.clarity_score < 7.0:
            recommendations.append("Improve explanation clarity with simpler language and better structure")
        
        if scores.overall_score >= 8.0:
            recommendations.append("Excellent teaching! Consider sharing best practices with colleagues")
        
        if not recommendations:
            recommendations.append("Continue maintaining high teaching standards")
        
        return recommendations