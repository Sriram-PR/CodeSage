import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from codesage_pipeline import CodeAnalysisPipeline
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeAnalysisRequest(BaseModel):
    code: str
    language: str

# Configure logging
logging.basicConfig(level=logging.ERROR) # Or INFO, DEBUG as needed
logger = logging.getLogger(__name__)


@app.post("/analyze")
async def analyze_code(request: CodeAnalysisRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is missing from environment variables.")

    try:
        pipeline = CodeAnalysisPipeline(api_key, cache_enabled=False)
        result = pipeline.analyze_code(request.code, request.language)

        return {
            "summary": result.summary,
            "bugs": result.bugs,
            "improvements": result.improvements,
            "optimized_code": result.optimized_code,
            "metrics": result.metrics,
            "timestamp": result.timestamp.isoformat(),
            "language": result.language
        }
    except Exception as e:
        logger.error(f"Code analysis error: {e}", exc_info=True) # Log full exception with traceback
        environment = os.environ.get('ENVIRONMENT', 'development').lower() # Default to development if not set
        if environment == 'production':
            raise HTTPException(status_code=400, detail="An unexpected error occurred during code analysis.") # Generic message for production
        else:
            raise HTTPException(status_code=400, detail=str(e)) # Detailed message for non-production