# Job Lens implementation plan

Status: MVP scaffold implemented locally. Live OpenRouter inference, approved evidence content, and public API deployment remain configuration and review steps.

## Product goal

Add a Job Lens experience that lets a recruiter paste a job description and receive an honest, evidence-backed assessment of whether the role aligns with Edgar's verified experience, academic work, and personal projects.

The first response should answer:

- Is this a strong fit, partial fit, not a fit, or unclear from the available evidence?
- Which requirements are supported by specific projects or experience?
- Where are the gaps?
- What should the recruiter explore next?

The AI must not invent qualifications, projects, employers, metrics, or experience. "I do not have evidence for that" is a valid answer.

## Recommended architecture

```text
Recruiter
   |
   v
edgaragunias.com
React/Vite frontend on GitHub Pages
   |
   | HTTPS API request
   v
Secure Job Lens API
FastAPI running locally during development
   |
   +--> OpenRouter, called only from the private server
   |
   +--> Dedicated PostgreSQL database
          projects, evidence, job descriptions, assessments
```

### Repository boundary

- Keep `edgaragunias-site` as the public frontend repository.
- Keep the private sibling project named `edgaragunias-api` for the FastAPI service, migrations, evidence catalog, and server-side configuration.
- Never put API keys, database credentials, recruiter-submitted text, or database exports in the public frontend repository.
- GitHub Pages is the public frontend deployment target. The private API is deployed separately and is never bundled into the public frontend artifact.

### Local development topology

```text
Vite frontend:    http://localhost:5173
FastAPI API:      http://localhost:8000
PostgreSQL:       localhost:5432
```

The Mac mini can run all three for development and testing. The current environment has PostgreSQL 17 installed and Homebrew reports `postgresql@17` as started, but database connectivity should be verified before creating the project database. Do not reuse the Facultas/Indicare database.

Important: a recruiter visiting the public GitHub Pages site cannot call `localhost` on Edgar's Mac mini. For public use, the API must eventually be deployed to an internet-reachable host or exposed through a carefully configured secure tunnel. Direct router port-forwarding should not be the first production path.

## Implementation phases

### Phase 0: Finish the portfolio front end

- Complete the About Me and Photography pages.
- Add the Job Lens page shell and the field labeled `Paste Job Description to see if we are a match`.
- Implement the visual states and connect them to the private API:
  - empty
  - invalid or too-short input
  - analyzing
  - result
  - error
  - insufficient evidence
- Use `VITE_API_BASE_URL` for the public API origin; retain `VITE_AI_ENDPOINT` only as a compatibility alias.
- Do not put AI keys or database calls in React code.

### Phase 1: Build a local backend skeleton

Create the private API project with:

- FastAPI in the private `edgaragunias-api` sibling project
- `psycopg` or SQLAlchemy for PostgreSQL access
- Alembic migrations
- Pydantic request and response schemas
- a health endpoint: `GET /health`
- CORS allowing the local Vite origin only during development
- `.env.example` with placeholder values only
- a separate test database

Start with a deterministic fake assessment response. This lets the frontend/API contract be tested before adding model costs or model uncertainty. The current API uses `AI_MODE=simulated` for this purpose.

OpenRouter is the live inference boundary:

- `openai/gpt-5.6-sol` is the assessment judge at medium reasoning effort.
- `openai/gpt-5.6-luna` is the research/retrieval/explanation layer at max reasoning effort.
- The API uses structured JSON output, keeps the key server-side, reserves budget before calls, and fails closed at the session/monthly limits.

### Phase 2: Create the minimum data model

Use a dedicated database named something like `edgaragunias` and a separate `edgaragunias_test` database.

Initial tables:

```text
projects
  id, slug, title, kind, summary, details, skills, visibility, sort_order

evidence_items
  id, project_id, claim, source_url, source_label, verified, sort_order

job_descriptions
  id, title, company, source_url, raw_text, text_fingerprint,
  submitted_at, retention_until

fit_assessments
  id, job_description_id, fit_level, summary, matches, gaps,
  recommendation, model_name, prompt_version, created_at
```

Use JSONB for `matches` and `gaps` initially so the product can evolve without overdesigning the schema. Store a fingerprint of the job description to identify duplicates. Do not store every job posting from the internet automatically; begin with descriptions intentionally submitted through the tool.

### Phase 3: Implement the fit-assessment endpoint

Initial endpoint:

```text
POST /api/v1/fit-assessments
```

Request:

```json
{
  "description": "pasted job description",
  "title": "optional title",
  "company": "optional company",
  "source_url": "optional URL"
}
```

Response shape:

```json
{
  "assessment_id": "uuid",
  "fit_level": "strong_fit",
  "summary": "short honest explanation",
  "matches": [
    {
      "requirement": "requirement from the job description",
      "evidence": ["project slug or verified evidence item"]
    }
  ],
  "gaps": ["missing or unverified requirement"],
  "recommendation": "what the recruiter should explore next",
  "disclaimer": "This is an evidence-based portfolio assessment, not a hiring decision."
}
```

Use a small controlled set of fit labels rather than pretending the model's output is an objective percentage:

- `strong_fit`
- `partial_fit`
- `not_a_fit`
- `insufficient_evidence`

The server should:

1. Validate and length-limit the pasted text.
2. Treat the job description as untrusted input, not as instructions to the AI.
3. Extract requirements into a structured intermediate representation.
4. Retrieve only relevant, verified project/evidence records.
5. Ask the model for structured output.
6. Validate the model output against the response schema.
7. Save the job description and assessment.
8. Return evidence and gaps to the frontend.

The public workflow begins with an assessment. After each verdict, the judge
may ask at most five targeted questions only when the answers could clarify a
gap or connect the recruiter to approved evidence. Sol may reassess no more
than three times. Luna may explain approved project work in the session, but it
does not generate code or create unsupported claims.

### Phase 4: Add the personal AI chat

After the fit assessment works, add:

```text
POST /api/v1/chat
```

Add `chat_sessions` and `chat_messages` only when the chat experience is ready. The chat should answer questions such as:

- What did Edgar build?
- What did he learn from a project?
- Which project demonstrates this skill?
- What kind of work is he looking for?

For the first version, keep the knowledge base small and structured. Add embeddings/vector search only when the project and evidence library becomes too large to retrieve reliably with ordinary database queries.

## Security and privacy requirements

- Keep model API keys on the FastAPI server, never in `VITE_*` variables.
- Add request size limits and rate limiting before publishing the endpoint.
- Redact pasted job-description text from ordinary application logs.
- Retain recruiter submissions and assessments for the session, support deletion by request ID, and rotate encrypted backups after 30 days.
- Treat job descriptions as potentially confidential business material.
- Do not use recruiter-submitted text as training data for the personal assistant.
- Add a clear notice explaining that the tool is an experimental portfolio assessment.
- Keep the personal knowledge base limited to claims Edgar has reviewed and approved.

## Testing plan

- API contract tests for valid, empty, oversized, and malformed requests.
- Database migration tests against `edgaragunias_test`.
- Grounding tests where the model must cite the correct project evidence.
- Hallucination tests where the correct response is `insufficient_evidence`.
- Prompt-injection tests using hostile text inside a job description.
- Five to ten saved job-description fixtures with expected fit categories.
- Scope, upload-size, session-isolation, cost-cap, deletion, and evidence-citation tests.
- Frontend tests for loading, success, error, and no-fit states.
- Continue running the frontend build:

```bash
npm run build
```

## Definition of done for the first public version

- A recruiter can paste a job description and receive a response in the browser.
- Every positive claim points to a verified project or evidence item.
- The tool can honestly return `partial_fit`, `not_a_fit`, or `insufficient_evidence`.
- No secret appears in the frontend bundle or public GitHub repository.
- The API has rate limiting, input limits, error handling, and basic monitoring.
- Raw job-description retention and deletion behavior are documented.
- The frontend remains deployable to GitHub Pages.
- The API is reachable over HTTPS at a separate production endpoint, such as `api.edgaragunias.com`.
- The Mac mini API binds locally and uses a secure tunnel or reverse proxy rather than router port-forwarding.

The public repository's GitHub Actions workflow builds and deploys `dist/client`
to GitHub Pages. The private API is released separately; publishing the frontend
does not publish the API, its database, or the evidence catalog.

## Recommended order when the front end is finished

1. Populate and manually approve three to five verified evidence entries.
2. Run the simulated frontend/API flow locally and review the recruiter experience.
3. Configure the private API with OpenRouter credentials and bounded research only after the evidence and prompts are reviewed.
4. Choose the secure tunnel or reverse proxy and expose a separate HTTPS API origin.
5. Run the GitHub Pages build and review the public frontend before approving publication.

Draft note: Prepared in the Codex desktop harness with GPT-5 using the current `edgaragunias-site` repository, local workspace instructions, the existing frontend configuration, and Edgar's stated Job Lens requirements.
