from app.utils.logging import logger

class TranscriptionService:
    @staticmethod
    def transcribe_video(video_uri: str):
        logger.info(f"Transcribing video: {video_uri}")
        # In a real app, this would call Amazon Transcribe
        return "This is a mock transcript of the lecture. The teacher explains the core concepts of AWS Cloud Computing and S3 storage. Good use of metaphors."

transcribe_service = TranscriptionService()
