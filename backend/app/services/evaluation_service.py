"""
Teaching Quality Evaluation Service
====================================
Core evaluation logic with explainable, auditable scoring.

DESIGN PRINCIPLES:
1. DETERMINISTIC: Same input produces same output
2. EXPLAINABLE: Every score has reasoning
3. AUDITABLE: Full evaluation trail
4. REPRODUCIBLE: Rubric-based, not arbitrary

AWS INTEGRATION:
- Future: Amazon Bedrock for AI-enhanced evaluation
- Current: Deterministic heuristic analysis

EVALUATION PIPELINE:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Transcription  │ ──▶ │    Analysis     │ ──▶ │   Evaluation    │
│   (Transcribe)  │     │   (Bedrock)     │     │    Report       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   Trust Boundary 1       Trust Boundary 2       Trust Boundary 3
   (Input Sanitized)      (Prompt Protected)    (Output Validated)
"""
import re
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict

from ..models.requests import EvaluateRequest
from ..models.responses import EvaluateResponse, EvaluationScore
from .bedrock_service import bedrock_service


@dataclass
class EvaluationAuditLog:
    evaluation_id: str
    timestamp: str
    user_id: str
    transcript_hash: str
    syllabus_hash: str
    scores: Dict[str, float]
    model_version: str
    is_human_reviewed: bool = False


@dataclass
class DetailedScore:
    score: float
    reasoning: str
    suggestion: str
    evidence: List[str]


@dataclass
class EvaluationResult:
    evaluation_id: str
    scores: Dict[str, DetailedScore]
    overall_score: float
    summary: str
    strengths: List[str]
    improvements: List[str]
    audit_log: EvaluationAuditLog
    metadata: Dict[str, Any]


class EvaluationService:
    """
    Comprehensive teaching quality evaluation service.
    
    Combines:
    - Heuristic analysis (deterministic)
    - AI-enhanced evaluation (Bedrock - stub)
    - Explainable scoring with evidence
    """
    
    @staticmethod
    def _generate_content_hash(text: str) -> str:
        """Generate deterministic hash for audit trail."""
        import hashlib
        return hashlib.sha256(text.encode()).hexdigest()[:16]
    
    @staticmethod
    async def evaluate_teaching_async(
        request: EvaluateRequest,
        user_id: str = "demo"
    ) -> EvaluationResult:
        """
        Full evaluation pipeline with Bedrock integration.
        
        Returns comprehensive evaluation with audit trail.
        """
        evaluation_id = str(uuid.uuid4())
        
        bedrock_result = await bedrock_service.evaluate_teaching(
            transcript=request.transcribed_text,
            syllabus=request.syllabus_text,
            objectives=request.teaching_objectives
        )
        
        detailed_scores = {}
        for criterion, data in bedrock_result["scores"].items():
            detailed_scores[criterion] = DetailedScore(
                score=data["score"],
                reasoning=data["reasoning"],
                suggestion=data["suggestion"],
                evidence=[]
            )
        
        audit_log = EvaluationAuditLog(
            evaluation_id=evaluation_id,
            timestamp=datetime.utcnow().isoformat(),
            user_id=user_id,
            transcript_hash=EvaluationService._generate_content_hash(request.transcribed_text),
            syllabus_hash=EvaluationService._generate_content_hash(request.syllabus_text),
            scores={k: v.score for k, v in detailed_scores.items()},
            model_version=bedrock_result.get("evaluation_metadata", {}).get("model", "unknown"),
            is_human_reviewed=False
        )
        
        return EvaluationResult(
            evaluation_id=evaluation_id,
            scores=detailed_scores,
            overall_score=bedrock_result["overall_score"],
            summary=bedrock_result["overall_summary"],
            strengths=bedrock_result["top_strengths"],
            improvements=bedrock_result["priority_improvements"],
            audit_log=audit_log,
            metadata=bedrock_result.get("evaluation_metadata", {})
        )
    
    @staticmethod
    def evaluate_teaching(request: EvaluateRequest) -> EvaluateResponse:
        """
        Synchronous evaluation for backward compatibility.
        Uses deterministic heuristic analysis.
        """
        engagement_score = EvaluationService._calculate_engagement_score(
            request.transcribed_text
        )
        concept_coverage_score = EvaluationService._calculate_concept_coverage(
            request.transcribed_text, 
            request.syllabus_text
        )
        clarity_score = EvaluationService._calculate_clarity_score(
            request.transcribed_text
        )
        pedagogy_score = EvaluationService._calculate_pedagogy_score(
            request.transcribed_text
        )
        
        overall_score = (
            engagement_score * 0.25 +
            concept_coverage_score * 0.30 +
            clarity_score * 0.25 +
            pedagogy_score * 0.20
        )
        
        scores = EvaluationScore(
            engagement_score=round(engagement_score, 1),
            concept_coverage_score=round(concept_coverage_score, 1),
            clarity_score=round(clarity_score, 1),
            overall_score=round(overall_score, 1)
        )
        
        summary = EvaluationService._generate_summary(scores, pedagogy_score)
        recommendations = EvaluationService._generate_recommendations(
            scores, pedagogy_score
        )
        
        return EvaluateResponse(
            scores=scores,
            summary=summary,
            recommendations=recommendations
        )
    
    @staticmethod
    def _calculate_engagement_score(text: str) -> float:
        """
        Calculate engagement based on interactive elements.
        
        RUBRIC:
        - Questions to students (+0.5 each)
        - Interactive words like "you", "think" (+0.1 each)
        - Rhetorical devices (+0.3 each)
        
        Base score: 5.0, Range: 1.0 - 10.0
        """
        if not text:
            return 5.0
        
        text_lower = text.lower()
        
        questions = len(re.findall(r'\?', text))
        interactive_words = len(re.findall(
            r'\b(you|your|think|consider|imagine|what|how|why|let\'s|we)\b',
            text_lower
        ))
        rhetorical = len(re.findall(
            r'\b(right\?|isn\'t it|don\'t you think|wouldn\'t you agree)\b',
            text_lower
        ))
        
        score = 5.0 + (questions * 0.5) + (interactive_words * 0.1) + (rhetorical * 0.3)
        
        return min(10.0, max(1.0, score))
    
    @staticmethod
    def _calculate_concept_coverage(
        transcribed_text: str, 
        syllabus_text: str
    ) -> float:
        """
        Calculate syllabus topic coverage.
        
        RUBRIC:
        - Extract key terms from syllabus (4+ characters)
        - Calculate overlap with transcript
        - Bonus for comprehensive coverage
        
        Base score: 5.0, Range: 1.0 - 10.0
        """
        if not syllabus_text:
            return 7.0
        
        syllabus_terms = set(re.findall(r'\b\w{4,}\b', syllabus_text.lower()))
        transcript_terms = set(re.findall(r'\b\w{4,}\b', transcribed_text.lower()))
        
        stopwords = {
            'that', 'this', 'with', 'from', 'have', 'will', 'been', 
            'their', 'would', 'about', 'could', 'should', 'which'
        }
        syllabus_terms -= stopwords
        transcript_terms -= stopwords
        
        if not syllabus_terms:
            return 7.0
        
        common = len(syllabus_terms & transcript_terms)
        coverage_ratio = common / len(syllabus_terms)
        
        score = 3.0 + (coverage_ratio * 7.0)
        
        return min(10.0, max(1.0, score))
    
    @staticmethod
    def _calculate_clarity_score(text: str) -> float:
        """
        Calculate explanation clarity.
        
        RUBRIC:
        - Optimal sentence length: 10-20 words (max score)
        - Use of transition words (+0.2 each)
        - Definition patterns (+0.3 each)
        
        Base score: 6.0, Range: 1.0 - 10.0
        """
        if not text:
            return 6.0
        
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if not sentences:
            return 6.0
        
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
        
        if 10 <= avg_length <= 20:
            length_score = 8.5
        elif 8 <= avg_length <= 25:
            length_score = 7.5
        elif 5 <= avg_length <= 30:
            length_score = 6.5
        else:
            length_score = 5.5
        
        text_lower = text.lower()
        transitions = len(re.findall(
            r'\b(however|therefore|furthermore|moreover|consequently|thus|hence)\b',
            text_lower
        ))
        definitions = len(re.findall(
            r'\b(means|defined as|refers to|is called|is when|is a|is the)\b',
            text_lower
        ))
        
        score = length_score + (transitions * 0.2) + (definitions * 0.3)
        
        return min(10.0, max(1.0, score))
    
    @staticmethod
    def _calculate_pedagogy_score(text: str) -> float:
        """
        Calculate pedagogical technique usage.
        
        RUBRIC:
        - Examples and analogies (+0.4 each)
        - Summarization phrases (+0.3 each)
        - Scaffolding phrases (+0.3 each)
        - Check for understanding (+0.5 each)
        
        Base score: 5.5, Range: 1.0 - 10.0
        """
        if not text:
            return 5.5
        
        text_lower = text.lower()
        
        examples = len(re.findall(
            r'\b(for example|for instance|such as|like|consider|imagine)\b',
            text_lower
        ))
        summaries = len(re.findall(
            r'\b(to summarize|in summary|to recap|remember|the key point|in conclusion)\b',
            text_lower
        ))
        scaffolding = len(re.findall(
            r'\b(first|second|third|next|finally|step|let\'s start|begin with)\b',
            text_lower
        ))
        understanding = len(re.findall(
            r'\b(any questions|does that make sense|are you following|understand\?|clear\?)\b',
            text_lower
        ))
        
        score = 5.5 + (examples * 0.4) + (summaries * 0.3) + (scaffolding * 0.3) + (understanding * 0.5)
        
        return min(10.0, max(1.0, score))
    
    @staticmethod
    def _generate_summary(scores: EvaluationScore, pedagogy_score: float) -> str:
        """Generate human-readable evaluation summary."""
        overall = scores.overall_score
        
        if overall >= 8.5:
            performance = "excellent"
            descriptor = "demonstrates exceptional teaching quality"
        elif overall >= 7.5:
            performance = "good"
            descriptor = "shows strong pedagogical practices"
        elif overall >= 6.5:
            performance = "satisfactory"
            descriptor = "meets basic teaching standards with room for improvement"
        else:
            performance = "developing"
            descriptor = "requires focused improvement in key areas"
        
        return (
            f"Teaching quality assessment: {performance.upper()}. "
            f"This lecture {descriptor}. "
            f"Overall score: {overall:.1f}/10 "
            f"(Engagement: {scores.engagement_score:.1f}, "
            f"Coverage: {scores.concept_coverage_score:.1f}, "
            f"Clarity: {scores.clarity_score:.1f}, "
            f"Pedagogy: {pedagogy_score:.1f})."
        )
    
    @staticmethod
    def _generate_recommendations(
        scores: EvaluationScore, 
        pedagogy_score: float
    ) -> List[str]:
        """Generate actionable improvement recommendations."""
        recommendations = []
        
        if scores.engagement_score < 7.0:
            recommendations.append(
                "Increase student engagement by adding more questions and interactive prompts. "
                "Try using phrases like 'What do you think?' or 'Consider this scenario...'"
            )
        
        if scores.concept_coverage_score < 7.0:
            recommendations.append(
                "Improve syllabus alignment by explicitly addressing each listed topic. "
                "Consider creating a checklist of concepts to cover."
            )
        
        if scores.clarity_score < 7.0:
            recommendations.append(
                "Enhance clarity by using shorter sentences and defining technical terms. "
                "Add transition phrases to improve flow between concepts."
            )
        
        if pedagogy_score < 7.0:
            recommendations.append(
                "Strengthen pedagogical approach by adding more examples and analogies. "
                "Include periodic summaries and checks for understanding."
            )
        
        if scores.overall_score >= 8.0:
            recommendations.append(
                "Excellent teaching! Consider documenting your successful techniques "
                "to share with colleagues or for professional development records."
            )
        
        if not recommendations:
            recommendations.append(
                "Continue maintaining high teaching standards. Focus on minor refinements "
                "based on student feedback for continuous improvement."
            )
        
        return recommendations


evaluation_service = EvaluationService()
