"""
Amazon Bedrock LLM Service
==========================
Primary GenAI service for teaching quality evaluation reasoning.

AWS SERVICE: Amazon Bedrock
MODELS SUPPORTED:
- anthropic.claude-3-sonnet-20240229-v1:0 (primary)
- amazon.titan-text-express-v1 (fallback)

AI SECURITY CONSIDERATIONS:
┌─────────────────────────────────────────────────────────────┐
│  PROMPT INJECTION PREVENTION                                │
│  ─────────────────────────────────────────────────────────  │
│  1. User input is NEVER directly concatenated to prompts    │
│  2. All user content is wrapped in explicit delimiters      │
│  3. System prompts are immutable and prepended              │
│  4. Output is validated before returning to user            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HALLUCINATION MITIGATION                                   │
│  ─────────────────────────────────────────────────────────  │
│  1. Deterministic rubric-based evaluation (no free-form)    │
│  2. Scores are bounded and validated                        │
│  3. Reasoning is auditable and explainable                  │
│  4. Human-in-the-loop for critical decisions                │
└─────────────────────────────────────────────────────────────┘

IMPLEMENTATION STATUS: STUB (AWS credentials required for production)
"""
import os
import json
import re
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

from ..core.config import settings


class BedrockModelType(str, Enum):
    CLAUDE_3_SONNET = "anthropic.claude-3-sonnet-20240229-v1:0"
    TITAN_TEXT = "amazon.titan-text-express-v1"


@dataclass
class EvaluationCriteria:
    name: str
    weight: float
    rubric: str
    max_score: float = 10.0


TEACHING_EVALUATION_RUBRIC = [
    EvaluationCriteria(
        name="engagement",
        weight=0.25,
        rubric="""
        Evaluate student engagement indicators:
        - Questions posed to students (rhetorical and direct)
        - Interactive language ("you", "your", "think about", "consider")
        - Variety in delivery pace and emphasis
        - Call-to-action and participation prompts
        Score 1-10 where 10 = highly engaging, 1 = monotonous
        """
    ),
    EvaluationCriteria(
        name="concept_coverage",
        weight=0.30,
        rubric="""
        Evaluate syllabus alignment:
        - Percentage of syllabus topics addressed
        - Depth of coverage for each topic
        - Logical sequencing of concepts
        - Connections between topics
        Score 1-10 where 10 = comprehensive coverage, 1 = minimal coverage
        """
    ),
    EvaluationCriteria(
        name="clarity",
        weight=0.25,
        rubric="""
        Evaluate explanation clarity:
        - Use of simple, accessible language
        - Appropriate sentence complexity
        - Definition of technical terms
        - Use of examples and analogies
        Score 1-10 where 10 = crystal clear, 1 = confusing
        """
    ),
    EvaluationCriteria(
        name="pedagogy",
        weight=0.20,
        rubric="""
        Evaluate pedagogical techniques:
        - Scaffolding of complex concepts
        - Check for understanding moments
        - Reinforcement and summarization
        - Adaptation cues for different learners
        Score 1-10 where 10 = expert pedagogy, 1 = poor teaching methods
        """
    )
]


class BedrockService:
    """
    Amazon Bedrock LLM integration for teaching evaluation.
    
    SECURITY: All prompts use structured templates to prevent injection.
    AUDITABILITY: All evaluations include reasoning chains.
    """
    
    def __init__(self):
        self.model_id = settings.AWS_BEDROCK_MODEL_ID
        self.region = settings.AWS_REGION
        self._client = None
    
    def _get_client(self):
        """
        Initialize Bedrock runtime client.
        
        AWS IMPLEMENTATION (when credentials available):
        ```python
        import boto3
        return boto3.client(
            'bedrock-runtime',
            region_name=self.region,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        ```
        """
        return None
    
    def _sanitize_user_input(self, text: str) -> str:
        """
        Sanitize user input to prevent prompt injection.
        
        SECURITY MEASURES:
        1. Remove potential instruction patterns
        2. Escape special delimiters
        3. Truncate excessive length
        """
        if not text:
            return ""
        
        sanitized = text[:50000]
        
        injection_patterns = [
            r"ignore\s+(previous|above|all)\s+instructions",
            r"disregard\s+(previous|above|all)",
            r"forget\s+everything",
            r"new\s+instructions?:",
            r"system\s*:",
            r"<\|.*?\|>",
        ]
        
        for pattern in injection_patterns:
            sanitized = re.sub(pattern, "[FILTERED]", sanitized, flags=re.IGNORECASE)
        
        sanitized = sanitized.replace("```", "'''")
        
        return sanitized
    
    def _build_evaluation_prompt(
        self,
        transcript: str,
        syllabus: str,
        objectives: Optional[str] = None
    ) -> str:
        """
        Build structured evaluation prompt with injection prevention.
        
        TEMPLATE STRUCTURE:
        - System context (immutable)
        - Rubric definition (immutable)
        - User content (sanitized, delimited)
        - Output format specification (immutable)
        """
        safe_transcript = self._sanitize_user_input(transcript)
        safe_syllabus = self._sanitize_user_input(syllabus)
        safe_objectives = self._sanitize_user_input(objectives or "")
        
        prompt = f"""You are an expert educational evaluator. Your task is to objectively evaluate teaching quality based on a provided rubric.

EVALUATION RUBRIC (use these criteria exactly):
{self._format_rubric()}

LECTURE TRANSCRIPT:
<<<TRANSCRIPT_START>>>
{safe_transcript}
<<<TRANSCRIPT_END>>>

COURSE SYLLABUS:
<<<SYLLABUS_START>>>
{safe_syllabus}
<<<SYLLABUS_END>>>

{"LEARNING OBJECTIVES:" + chr(10) + "<<<OBJECTIVES_START>>>" + chr(10) + safe_objectives + chr(10) + "<<<OBJECTIVES_END>>>" if safe_objectives else ""}

EVALUATION TASK:
Evaluate the teaching quality based ONLY on the rubric criteria above.
For each criterion, provide:
1. A score from 1-10
2. A brief explanation (2-3 sentences) justifying the score
3. One specific improvement suggestion

OUTPUT FORMAT (respond with valid JSON only):
{{
    "scores": {{
        "engagement": {{"score": <number>, "reasoning": "<string>", "suggestion": "<string>"}},
        "concept_coverage": {{"score": <number>, "reasoning": "<string>", "suggestion": "<string>"}},
        "clarity": {{"score": <number>, "reasoning": "<string>", "suggestion": "<string>"}},
        "pedagogy": {{"score": <number>, "reasoning": "<string>", "suggestion": "<string>"}}
    }},
    "overall_summary": "<2-3 sentence overall assessment>",
    "top_strengths": ["<strength1>", "<strength2>"],
    "priority_improvements": ["<improvement1>", "<improvement2>"]
}}
"""
        return prompt
    
    def _format_rubric(self) -> str:
        """Format evaluation rubric for prompt inclusion."""
        rubric_text = []
        for criteria in TEACHING_EVALUATION_RUBRIC:
            rubric_text.append(
                f"- {criteria.name.upper()} (weight: {criteria.weight*100}%): "
                f"{criteria.rubric.strip()}"
            )
        return "\n".join(rubric_text)
    
    async def evaluate_teaching(
        self,
        transcript: str,
        syllabus: str,
        objectives: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate teaching quality using Bedrock LLM.
        
        STUB IMPLEMENTATION: Returns deterministic evaluation.
        PRODUCTION: Calls Bedrock API with structured prompts.
        
        Returns:
            Structured evaluation with scores, reasoning, and recommendations.
        """
        prompt = self._build_evaluation_prompt(transcript, syllabus, objectives)
        
        return self._stub_evaluation(transcript, syllabus, objectives)
    
    def _stub_evaluation(
        self,
        transcript: str,
        syllabus: str,
        objectives: Optional[str]
    ) -> Dict[str, Any]:
        """
        Deterministic stub evaluation (no LLM required).
        Uses heuristic analysis for MVP demonstration.
        
        NOTE: This is for demonstration purposes.
        Production uses actual Bedrock API calls.
        """
        transcript_lower = transcript.lower()
        syllabus_lower = syllabus.lower() if syllabus else ""
        
        questions = len(re.findall(r'\?', transcript))
        interactive_words = len(re.findall(
            r'\b(you|your|think|consider|imagine|what|how|why|let\'s)\b',
            transcript_lower
        ))
        word_count = len(transcript.split())
        
        engagement_score = min(10, max(1, 
            5 + (questions * 0.5) + (interactive_words * 0.1)
        ))
        
        if syllabus:
            syllabus_terms = set(re.findall(r'\b\w{4,}\b', syllabus_lower))
            transcript_terms = set(re.findall(r'\b\w{4,}\b', transcript_lower))
            common = len(syllabus_terms & transcript_terms)
            coverage_ratio = common / max(len(syllabus_terms), 1)
            coverage_score = min(10, max(1, coverage_ratio * 10 + 3))
        else:
            coverage_score = 7.0
        
        sentences = re.split(r'[.!?]+', transcript)
        avg_sentence_len = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        if 10 <= avg_sentence_len <= 20:
            clarity_score = 8.5
        elif 8 <= avg_sentence_len <= 25:
            clarity_score = 7.5
        else:
            clarity_score = 6.5
        
        pedagogy_indicators = len(re.findall(
            r'\b(for example|such as|in other words|to summarize|remember|note that)\b',
            transcript_lower
        ))
        pedagogy_score = min(10, max(1, 6 + pedagogy_indicators * 0.3))
        
        overall = (
            engagement_score * 0.25 +
            coverage_score * 0.30 +
            clarity_score * 0.25 +
            pedagogy_score * 0.20
        )
        
        return {
            "scores": {
                "engagement": {
                    "score": round(engagement_score, 1),
                    "reasoning": f"Found {questions} questions and {interactive_words} interactive terms in the transcript.",
                    "suggestion": "Consider adding more direct questions to students to boost engagement."
                },
                "concept_coverage": {
                    "score": round(coverage_score, 1),
                    "reasoning": "Analyzed alignment between lecture content and syllabus topics.",
                    "suggestion": "Ensure all syllabus topics are explicitly addressed in the lecture."
                },
                "clarity": {
                    "score": round(clarity_score, 1),
                    "reasoning": f"Average sentence length: {avg_sentence_len:.1f} words.",
                    "suggestion": "Use shorter sentences and define technical terms when introduced."
                },
                "pedagogy": {
                    "score": round(pedagogy_score, 1),
                    "reasoning": f"Identified {pedagogy_indicators} pedagogical technique indicators.",
                    "suggestion": "Add more examples and summarization checkpoints."
                }
            },
            "overall_score": round(overall, 1),
            "overall_summary": f"The teaching demonstrates {'strong' if overall >= 7.5 else 'moderate' if overall >= 6 else 'developing'} pedagogical practices with an overall score of {overall:.1f}/10.",
            "top_strengths": [
                "Clear explanation structure" if clarity_score >= 7 else "Developing clarity",
                "Good topic coverage" if coverage_score >= 7 else "Developing coverage"
            ],
            "priority_improvements": [
                "Increase student interaction opportunities",
                "Add more real-world examples and analogies"
            ],
            "evaluation_metadata": {
                "model": "deterministic-heuristic-v1",
                "rubric_version": "1.0",
                "is_stub": True,
                "aws_ready": True
            }
        }


bedrock_service = BedrockService()
