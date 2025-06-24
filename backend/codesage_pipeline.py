
import os
import hashlib
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

from crewai import Agent, Task, Crew, LLM  # Removed unused 'Process'
from dataclasses import dataclass

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class CodeAnalysisResult:
    summary: str
    bugs: List[Dict[str, str]]
    improvements: List[str]
    optimized_code: str
    metrics: Dict[str, Any]
    timestamp: datetime
    language: str  # Language of the analyzed code

    def to_json(self) -> str:
        return json.dumps({
            'summary': self.summary,
            'bugs': self.bugs,
            'improvements': self.improvements,
            'optimized_code': self.optimized_code,
            'metrics': self.metrics,
            'timestamp': self.timestamp.isoformat(),
            'language': self.language
        }, indent=2)

class ResultCache:
    def __init__(self, cache_dir: str = ".code_analysis_cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)

    def get(self, code_hash: str, language: str) -> CodeAnalysisResult:
        cache_file = self.cache_dir / f"{code_hash}_{language}.json"  # Include language
        if cache_file.exists():
            with cache_file.open('r') as f:
                data = json.load(f)
                data['timestamp'] = datetime.fromisoformat(data['timestamp'])
                return CodeAnalysisResult(**data)
        return None

    def store(self, code_hash: str, result: CodeAnalysisResult):
        cache_file = self.cache_dir / f"{code_hash}_{result.language}.json"  # Include language
        with cache_file.open('w') as f:
            f.write(result.to_json())


class LanguageSupport:
    """Handles language-specific configurations and operations."""

    def __init__(self, config_path: str = "languages.yaml"):
        self.config_path = Path(config_path)
        self.configs = self._load_configs()

    def _load_configs(self) -> Dict[str, Dict[str, str]]:
        """Loads language configurations from a YAML file."""
        if not self.config_path.exists():
            logger.warning(f"Language configuration file not found: {self.config_path}")
            return {}  # Empty dict if file doesn't exist

        import yaml  # Import yaml only here

        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Error loading language configurations: {e}")
            return {}

    def get_config(self, language: str) -> Dict[str, str]:
        """Retrieves the configuration for a specific language."""
        return self.configs.get(language, {})

    def get_code_block_delimiters(self, language: str) -> tuple[str, str]:
        """Returns the start and end delimiters for code blocks."""
        config = self.get_config(language)
        start_delimiter = config.get("code_block_start", "```")
        end_delimiter = config.get("code_block_end", "```")
        return start_delimiter, end_delimiter

    def get_comment_marker(self, language: str) -> str:
        """Returns the comment marker for the language."""
        config = self.get_config(language)
        return config.get("comment_marker", "#")  # Default to '#'


class CodeAnalysisPipeline:
    def __init__(self, api_key: str, cache_enabled: bool = True, language_config_path: str = "languages.yaml"):
        self.api_key = api_key
        self.cache = ResultCache() if cache_enabled else None
        self.language_support = LanguageSupport(language_config_path)
        self.metrics = {
            'total_executions': 0,
            'cache_hits': 0,
            'average_execution_time': 0.0
        }
        self._setup_llms()
        self._setup_agents()
        self._setup_tasks()

    def _setup_llms(self):
        """Initialize LLM models."""
        base_url = "https://openrouter.ai/api/v1"

        self.review_llm = LLM(
            model="openrouter/google/gemini-2.0-pro-exp-02-05:free",
            base_url=base_url,
            api_key=self.api_key
        )

        self.bug_detection_llm = LLM(
            model="openrouter/google/gemini-2.0-flash-exp:free",
            base_url=base_url,
            api_key=self.api_key
        )

        self.optimization_llm = LLM(
            model="openrouter/google/gemini-exp-1206:free",
            base_url=base_url,
            api_key=self.api_key
        )
        # Could add language-specific model selection here

    def _setup_agents(self):
        """Create specialized agents."""
        self.reviewer = Agent(
            role="Senior Code Reviewer",
            goal="Provide a concise code review.",
            backstory="Experienced technical lead.",
            verbose=True,
            llm=self.review_llm
        )

        self.bug_analyst = Agent(
            role="Security and Bug Analyst",
            goal="Identify bugs and security issues.",
            backstory="Security-focused developer.",
            verbose=True,
            llm=self.bug_detection_llm
        )

        self.optimizer = Agent(
            role="Code Optimization Specialist",
            goal="Provide optimized code and document changes.",
            backstory="Performance optimization expert.",
            verbose=True,
            llm=self.optimization_llm
        )

    def _setup_tasks(self):
        """Configure tasks."""
        self.review_task = Task(
            description="",
            expected_output="Code review summary.",
            agent=self.reviewer
        )

        self.bug_analysis_task = Task(
            description="",
            expected_output="Numbered list of bugs.",
            agent=self.bug_analyst
        )

        self.optimization_task = Task(
            description="",
            expected_output="List of changes and optimized code.",
            agent=self.optimizer
        )

    def analyze_code(self, code: str, language: str) -> CodeAnalysisResult:
        """Execute the code analysis pipeline."""
        code_hash = self._compute_code_hash(code)
        language_config = self.language_support.get_config(language)
        if not language_config:
            raise ValueError(f"Unsupported language: {language}")

        if self.cache:
            cached_result = self.cache.get(code_hash, language)
            if cached_result:
                self.metrics['cache_hits'] += 1
                return cached_result

        code_block_start, code_block_end = self.language_support.get_code_block_delimiters(language)

        # Generalized Prompts
        self.review_task.description = (
            f"Analyze the following {language} code and provide a structured review, "
            f"including an 'Overall Assessment'. Provide ONLY the 'Overall Assessment' section, "
            f"without including the original code or any introductory phrases. Start directly with 'Overall Assessment:', and end without a period.\n"
            f"{code_block_start}{language}\n{code}\n{code_block_end}"
        )
        self.bug_analysis_task.description = (
            f"Identify bugs and issues in the following {language} code, formatting output as a numbered list "
            f"with clear titles and descriptions. Provide ONLY the numbered list of bugs, without any additional text "
            f"or introductory phrases. Ensure the list starts with '1.' and each bug includes a description.\n"
            f"{code_block_start}{language}\n{code}\n{code_block_end}"
        )
        self.optimization_task.description = (
            f"Optimize the following {language} code. Provide a clear, bulleted 'List of Changes' "
            f"BEFORE the optimized code. Then, provide the complete 'Optimized Code' "
            f"inside a {language} code block. Provide ONLY the 'List of Changes' and the 'Optimized Code' sections, "
            f"without any introductory phrases. The 'List of Changes' should use '*' for bullets, and the Optimized Code section MUST be included. Return each section with proper heading like 'List of Changes:' and 'Optimized Code:'\n"
            f"{code_block_start}{language}\n{code}\n{code_block_end}"
        )

        # Manually execute tasks
        try:
            review_result = self.reviewer.execute_task(self.review_task)
            bug_analysis_result = self.bug_analyst.execute_task(
                self.bug_analysis_task, context=review_result
            )
            optimization_result = self.optimizer.execute_task(self.optimization_task, context=bug_analysis_result)

            combined_results = f"{review_result}\n\n{bug_analysis_result}\n\n{optimization_result}"
            parsed_results = self._parse_results(combined_results, language)
            result = CodeAnalysisResult(
                summary=parsed_results['summary'],
                bugs=parsed_results['bugs'],
                improvements=parsed_results['improvements'],
                optimized_code=parsed_results['optimized_code'],
                metrics=self.metrics.copy(),
                timestamp=datetime.now(),
                language=language
            )

            if self.cache:
                self.cache.store(code_hash, result)

            return result

        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise RuntimeError(f"Analysis failed: {str(e)}")

    def _compute_code_hash(self, code: str) -> str:
        return hashlib.sha256(code.encode()).hexdigest()

    def _parse_results(self, combined_results: str, language: str) -> Dict[str, Any]:
        """Parses the combined results, handling different languages."""
        parsed_results = {
            'summary': '',
            'bugs': [],
            'improvements': [],
            'optimized_code': ''
        }
        code_block_start, code_block_end = self.language_support.get_code_block_delimiters(language)
        review_start = combined_results.lower().find("overall assessment:")
        bug_start = combined_results.find("1.")
        changes_start_label = "list of changes:"
        changes_start = combined_results.lower().find(changes_start_label)
        code_start = combined_results.lower().find(code_block_start, changes_start)

        if review_start != -1:
            end_of_review = bug_start if bug_start != -1 else changes_start
            if end_of_review == -1:
                end_of_review = len(combined_results)
            parsed_results['summary'] = combined_results[review_start:end_of_review].strip()
            parsed_results['summary'] = parsed_results['summary'].replace("overall assessment:", "").replace("```", "").strip().rstrip('.')

        if bug_start != -1:
            end_of_bugs = changes_start if changes_start != -1 else len(combined_results)
            bug_section = combined_results[bug_start:end_of_bugs].strip()
            parsed_results['bugs'] = self._parse_bugs(bug_section)

        if changes_start != -1:
            if code_start != -1:
                changes_section = combined_results[changes_start:code_start].strip()
                changes_section = changes_section.replace(changes_start_label.title(), "").replace(changes_start_label.lower(), "").strip()
                parsed_results['improvements'] = self._parse_improvements(changes_section)
                code_type_len = len(language) + 1
                code_end = combined_results.find(code_block_end, code_start + 1)
                if code_end != -1:
                    start_offset = code_type_len if language in combined_results[code_start:code_start + code_type_len].lower() else len(code_block_start)
                    parsed_results['optimized_code'] = combined_results[code_start + start_offset:code_end].strip()
            else:
                changes_section = combined_results[changes_start:].strip()
                changes_section = changes_section.replace(changes_start_label.title(), "").replace(changes_start_label.lower(), "").strip()
                parsed_results['improvements'] = self._parse_improvements(changes_section)

        return parsed_results

    @staticmethod
    def _parse_improvements(changes_section: str) -> List[str]:
        """Parses improvements (same as before)."""
        lines = changes_section.split('\n')
        improvements = []
        for line in lines:
            line = line.strip()
            if line.startswith(("*", "-")):
                improvements.append(line[1:].strip())
        return improvements

    @staticmethod
    def _parse_bugs(bug_section: str) -> List[Dict[str, str]]:
        """Parses bugs (same as before)."""
        bugs = []
        lines = bug_section.split('\n')
        current_bug = None

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if line[0].isdigit():
                if current_bug:
                    bugs.append(current_bug)
                parts = line.split('.', 1)
                if len(parts) > 1:
                    title = parts[1].strip()
                else:
                    title = "Unnamed Bug"
                current_bug = {"title": title, "description": ""}
            elif current_bug:
                current_bug["description"] += line + "\n"

        if current_bug:
            bugs.append(current_bug)
        return bugs

def main():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY is required")

    pipeline = CodeAnalysisPipeline(api_key, cache_enabled=False)

    language = input("Enter the programming language: ").strip().lower()
    supported_languages = pipeline.language_support.configs.keys()
    if language not in supported_languages:
        print(f"Error: Language '{language}' is not supported.")
        print(f"Supported languages: {', '.join(supported_languages)}")
        return

    print(f"Enter your {language} code. Type '$end' on a new line to finish.")
    code_lines = []
    while True:
        line = input()
        if line == "$end":
            break
        code_lines.append(line)
    user_code = "\n".join(code_lines)

    try:
        results = pipeline.analyze_code(user_code, language)
        print("\n=== Code Review ===")
        print(results.summary)

        print("\n=== Bug Report ===")
        for i, bug in enumerate(results.bugs, 1):
            print(f"{i}) {bug['title']}")
            if bug['description']:
                print(bug['description'])

        print("\n=== Optimization Report ===")
        print("Changes Made:")
        for i, improvement in enumerate(results.improvements, 1):
            print(f"{i}. {improvement}")

        print(f"\nOptimized {language.title()} Code:")
        print(results.optimized_code)

    except Exception as e:
        print(f"Error during analysis: {e}")
        
    if __name__ == "__main__":
        main()