import json
import logging
from typing import Type, TypeVar, Optional
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


class LLMClient:
    """
    Centralized Anthropic API client wrapper.
    All LLM calls in LedgerPilot must go through this class.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.client = None
        if HAS_ANTHROPIC and self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)

    def generate_structured_output(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        model: str = "claude-3-5-sonnet-20241022",
    ) -> T:
        """
        Generates schema-constrained output using Anthropic tool calling,
        validating against the supplied Pydantic response_model.
        """
        if not self.client:
            raise RuntimeError(
                "Anthropic API client is not configured. Please set ANTHROPIC_API_KEY."
            )

        tool_name = response_model.__name__
        schema = response_model.model_json_schema()

        # Build Anthropic tool definition for structured JSON output
        tool = {
            "name": tool_name,
            "description": f"Output schema for {tool_name}",
            "input_schema": schema,
        }

        system = system_prompt or "You are a specialized AI financial assistant. Output data strictly according to the required tool schema."

        response = self.client.messages.create(
            model=model,
            max_tokens=2048,
            temperature=0.0,
            system=system,
            messages=[{"role": "user", "content": prompt}],
            tools=[tool],
            tool_choice={"type": "tool", "name": tool_name},
        )

        for content_block in response.content:
            if content_block.type == "tool_use" and content_block.name == tool_name:
                return response_model.model_validate(content_block.input)

        raise ValueError("LLM response did not return expected tool call structure.")


# Global singleton instance
llm_client = LLMClient()
