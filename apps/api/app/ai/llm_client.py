import json
import logging
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

try:
    from google import genai
    from google.genai import types
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False


class LLMClient:
    """
    Centralized Google Gemini API client wrapper.
    All LLM calls in LedgerPilot must go through this class.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.client = None
        if HAS_GEMINI and self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def generate_structured_output(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
    ) -> T:
        """
        Generates schema-constrained output using Google Gemini SDK,
        validating against the supplied Pydantic response_model.
        """
        if not self.client:
            raise RuntimeError(
                "Gemini API client is not configured. Please set GEMINI_API_KEY."
            )

        target_model = model or settings.GEMINI_MODEL
        system = system_prompt or "You are a specialized AI financial assistant. Output data strictly according to the required schema."

        config = types.GenerateContentConfig(
            system_instruction=system,
            response_mime_type="application/json",
            response_schema=response_model,
            temperature=0.0,
        )

        response = self.client.models.generate_content(
            model=target_model,
            contents=prompt,
            config=config,
        )

        if hasattr(response, "parsed") and response.parsed is not None:
            if isinstance(response.parsed, response_model):
                return response.parsed
            return response_model.model_validate(response.parsed)

        if hasattr(response, "text") and response.text:
            return response_model.model_validate_json(response.text)

        raise ValueError("Gemini response did not return valid structured output.")


# Global singleton instance
llm_client = LLMClient()
