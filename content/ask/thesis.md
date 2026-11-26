---
name: thesis
description: Bachelor thesis / HSBC bank compliance project (LLM-TxInsight) in depth: problem, architecture, staged prompt orchestration, scenario skills, review agent and human arbitration, database, testing, the 500-case model comparison with all numbers, lessons and limitations.
---

# Bachelor thesis: LLM-TxInsight

Full title: "Design and Implementation of a Customized LLM-based Bank Customer Transaction Rationality Analysis System" (Xidian University, Software Engineering, 2026). Built in collaboration with HSBC Technology, 12/2025 – 04/2026. I designed and implemented the system myself (backend, frontend, prompts, tests, evaluation).

## The problem
In bank compliance / anti-money-laundering review, analysts check a customer's profile (job, income, nationality, risk rating, account age…) against their transaction history and write an opinion on whether the transactions are plausible. Done by hand this is slow, judgement standards vary between reviewers, and a large share of transactions sit in a grey zone: neither clearly fine nor clearly suspicious. Traditional automation either flags all of those for manual review or forces a confident answer and loses accuracy. The task specification required at least 80% analysis accuracy.

## What the system does
1. Analyst enters customer information and uploads a transaction file (Excel or CSV; tested with 500 rows in one import).
2. The system creates an analysis task and runs it asynchronously, so the UI never blocks.
3. LLM analysis produces a three-part report: customer overview, transaction summary, rationality statement; exportable as a Word file. Conclusion labels: REASONABLE (green) / UNREASONABLE (red) / NEED_HUMAN.
4. Task states: PROCESSING → COMPLETED / FAILED / NEED_HUMAN / TIMEOUT (a model response over 120 s marks TIMEOUT; invalid JSON from the model marks FAILED).

## Architecture
- Browser/server, front end and back end separated; three layers: frontend interaction, backend services, LLM analysis.
- Backend: Java 21, Spring Boot 3.5, MyBatis-Plus, PostgreSQL 16, LangChain4j to call commercial LLM APIs, manage context and get structured output.
- Frontend: Vue 3.4, TypeScript 5.3, Vite 5, Tailwind CSS 4, single-page app with animated UI components.
- Main tables: analysis_task, customer_info, transaction_record, human_intervention (each follow-up question + answer + linked transaction IDs), chat_memory (the model's message history per task, so a task can resume after a human answers without rebuilding the whole conversation), feedback, arbitration_record, risk_country.

## Key design decisions
### 1. Staged orchestration instead of one big prompt
The first version sent everything in one prompt. Two problems showed up: with many transactions the model paid less attention to records in the middle of the input and missed key details, and it tended to jump to a category for familiar patterns before the evidence supported it.
So the analysis is split into stages, each with a single goal:
- Stage 1, UNREASONABLE detection: only look for clear red flags (large anomalies, money in and straight back out, funds pooled from many people). If found, conclude UNREASONABLE.
- Stage 2, core reasonableness judgement: with obvious red flags excluded, judge against the customer's background. If clear, conclude REASONABLE.
- Stage 3, human fallback: if neither stage is confident, generate targeted follow-up questions, put the task in NEED_HUMAN, wait for the analyst to get answers from the customer, merge the answers into the context and continue. Up to 3 rounds. If stage 1's model call fails, the system degrades gracefully and tries stage 2 directly.
### 2. Scenario skills, loaded on demand
Inspired by Anthropic's Agent Skills (progressive disclosure: metadata always visible, the full instructions loaded only when relevant). Rules for specific scenarios (transfers between relatives and friends, structured deposits, high-risk countries) were moved out of the generic prompt into separate skill files. A selector decides which skills a case needs and only those rules are loaded. The high-risk country list lives in the database (with alias matching, e.g. different spellings of a country name) instead of being hard-coded in the prompt.
### 3. Review agent + human arbitration
After the analysis agent forms a candidate conclusion, a review agent checks the evidence used, whether the rules were applied correctly and the label. If there's no significant problem the result is saved. If the reviewer finds a disagreement that could change the conclusion, the task goes to a human analyst for arbitration and the ruling is recorded.
### 4. Learning from feedback
Analysts can flag a wrong result with an error type, reason and the corrected judgement. Feedback and arbitration outcomes are distilled into experience rules that are injected into later prompts, so the system accumulates case experience over time.
### 5. Prompt engineering
Explored zero-/one-/few-shot prompting, chain-of-thought, Auto-CoT and agent skills; prompts are versioned resources loaded with fallbacks if a file is missing.

## Testing
- Backend: JUnit 5 + Mockito, 14 test classes with about 171 test methods, including a full controller-to-database integration test (TaskFlowIntegrationTest) and tests for the skill selector, skill loading, rule resource integrity, risk-country alias matching, arbitration state transitions and prompt loading.
- Frontend: Vitest + Vue Test Utils for the follow-up form, feedback modal and report cards.
- Functional tests for every module (customer management, import, orchestration, human-in-the-loop, report export, pagination, filtering, 3 concurrent tasks staying independent).
- Evaluation: a Python program submits labelled cases through the backend API, polls until done, extracts the label, latency and token stats.

## Evaluation: 500 labelled cases
Dataset: about 200 REASONABLE, 200 UNREASONABLE, 100 NEED_HUMAN; generated with human and LLM assistance to match real compliance scenarios, then reviewed by hand. A case counts as correct only if the label matches; answering NEED_HUMAN when the expected label is REASONABLE/UNREASONABLE counts as wrong. Also measured: average latency, average tokens, token rate (relative to Qwen-plus staged without skills = 100%) and estimated cost per case in CNY.

Prompt and orchestration strategy, all on Qwen-plus:
| Strategy | Accuracy | Latency | Avg tokens | Token rate | Cost/case |
|---|---|---|---|---|---|
| Single prompt, plain | 50.0% | 18.7 s | 16,520 | 44.3% | ¥0.222 |
| Single prompt, few-shot + CoT | 60.4% | 28.6 s | 39,709 | 106.5% | ¥0.534 |
| Staged, no skills | 68.0% | 23.3 s | 37,283 | 100% | ¥0.501 |
| Staged, with skills | 66.8% | 24.9 s | 28,335 | 76.0% | ¥0.381 |

Model comparison, staged orchestration (without → with skills):
| Model | Accuracy | Latency | Cost/case |
|---|---|---|---|
| Qwen3.6-max-preview | 86.0% → 86.7% | 30.8 → 31.6 s | ¥1.119 → ¥0.786 |
| Qwen3-max | 82.5% → 83.1% | 27.4 → 28.9 s | ¥0.789 → ¥0.584 |
| GLM-5.1 | 75.8% → 76.4% | 26.5 → 26.0 s | ¥0.302 → ¥0.227 |
| DeepSeek V4 Pro | 73.1% → 74.0% | 29.9 → 29.2 s | ¥0.437 → ¥0.319 |
| Qwen-plus | 68.0% → 66.8% | 23.3 → 24.9 s | ¥0.501 → ¥0.381 |
| DeepSeek V4 Flash | 56.9% → 57.6% | 26.6 → 27.8 s | ¥0.039 → ¥0.031 |
Best: Qwen3.6-max-preview with skills, 86.7%. Qwen3-max with skills, 83.1%, also beats the 80% target. (The conclusion chapter also cites 82.0% for an earlier Qwen-max run.)
Skills cut average tokens by about 20–30% for every model (e.g. Qwen3.6-max-preview −29.8%, GLM-5.1 −25%, Qwen-plus −24%), but did not always reduce latency: skill selection, file reading and the risk-country lookup add steps; GLM-5.1 and DeepSeek V4 Pro got slightly faster, the others slightly slower.

## What I learned / takeaways
- Splitting a task into focused stages improved accuracy more than prompt tricks did. Few-shot + CoT gave +10 points but more than doubled the tokens; staging gave +18 points at a similar token budget.
- Context size is a cost lever you can engineer: modular, on-demand rules made every model cheaper.
- Model capability still dominates accuracy; cheap models need stricter rules and a review step around them. Choosing a model is an explicit accuracy-versus-cost-versus-latency trade-off.
- A system that knows when to ask a human is easier to trust than one that always answers.

## Limitations and next steps (from the thesis)
- Weak transaction notes such as "transfer", "remittance" or "payment" can push the model into over-asking or wavering between scenarios. Next: a banking knowledge graph, a historical case library and finer scenario labels to add context about the relationship, purpose and account background; tighter trigger conditions for high-frequency scenarios.
- Skills add latency: cache rule loading based on hit frequency and trim low-value context. In the UI, group many follow-up questions more clearly and make disagreement summaries easier to read during arbitration.
