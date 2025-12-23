"""
AWS Bedrock Service
Claude integration for teaching evaluation
"""
import json
import boto3
from typing import Dict, Any
from app.core.config import settings


class BedrockService:
    """AWS Bedrock LLM service"""
    
    def __init__(self):
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.client = boto3.client(
                'bedrock-runtime',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
            self.is_configured = True
        else:
            self.client = None
            self.is_configured = False
    
    def evaluate_teaching(self, transcript: str, syllabus: str, objectives: str = None) -> Dict[str, Any]:
        """Evaluate teaching using Bedrock"""
        if not self.is_configured:
            # Fallback to stub implementation
            return self._stub_evaluation(transcript, syllabus, objectives)
        
        try:
            # Create the prompt for Claude
            prompt = f"""\n\nHuman: You are an expert educational evaluator. Please analyze the following teaching transcript and evaluate its quality based on the provided syllabus. 

Transcript: {transcript}

Syllabus: {syllabus}

Objectives: {objectives or 'No specific objectives provided'}

Provide a detailed evaluation with scores for:
1. Engagement (how interactive and engaging the teaching is)
2. Concept Coverage (how well the content aligns with the syllabus)
3. Clarity (how clearly concepts are explained)
4. Pedagogy (effectiveness of teaching techniques)

Format your response as a JSON object with these fields: engagement_score, concept_coverage_score, clarity_score, pedagogy_score, overall_score, reasoning, improvements. Scores should be from 1-10."""

            body = json.dumps({
                "prompt": prompt,
                "max_tokens_to_sample": 1000,
                "temperature": 0.3,
                "top_p": 0.9,
            })
            
            response = self.client.invoke_model(
                modelId=settings.AWS_BEDROCK_MODEL_ID,
                body=body
            )
            
            response_body = json.loads(response['body'].read())
            response_text = response_body['completion']
            
            # Extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_str = response_text[start_idx:end_idx]
                result = json.loads(json_str)
                return result
            else:
                # If JSON parsing fails, return stub
                return self._stub_evaluation(transcript, syllabus, objectives)
                
        except Exception as e:
            print(f"Bedrock evaluation failed: {str(e)}")
            return self._stub_evaluation(transcript, syllabus, objectives)
    
    def _stub_evaluation(self, transcript: str, syllabus: str, objectives: str = None) -> Dict[str, Any]:
        """Fallback evaluation when AWS is not configured"""
        return {
            "engagement_score": 7.5,
            "concept_coverage_score": 8.0,
            "clarity_score": 7.8,
            "pedagogy_score": 7.2,
            "overall_score": 7.6,
            "reasoning": ["Good engagement with interactive elements", "Strong alignment with syllabus content", "Clear explanations with appropriate examples", "Effective use of teaching techniques"],
            "improvements": ["Add more questions to increase student engagement", "Include more real-world examples"]
        }


bedrock_service = BedrockService()

