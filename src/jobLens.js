const configuredApi = (
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_AI_ENDPOINT || ""
).trim();
const developmentApi = import.meta.env.DEV ? "http://localhost:8000" : "";

export const JOB_LENS_API = (configuredApi || developmentApi).replace(/\/$/, "");

function apiUrl(path) {
  if (!JOB_LENS_API) {
    throw new Error("Job Match is temporarily unavailable while its API is being configured.");
  }
  return `${JOB_LENS_API}${path}`;
}

async function readResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.detail || "The Job Lens service could not complete that request.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function createAssessment({ description, file, title = "", company = "", sourceUrl = "" }) {
  const form = new FormData();
  form.append("description", description || "");
  form.append("title", title);
  form.append("company", company);
  form.append("source_url", sourceUrl);
  if (file) form.append("file", file, file.name);

  const response = await fetch(apiUrl("/api/v1/fit-assessments"), {
    method: "POST",
    body: form,
    credentials: "include",
  });
  return readResponse(response);
}

export async function sendSessionMessage(sessionId, message, kind = "chat") {
  const response = await fetch(apiUrl(`/api/v1/sessions/${sessionId}/messages`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, kind }),
  });
  return readResponse(response);
}

export async function submitSurvey(sessionId, rating) {
  const response = await fetch(apiUrl(`/api/v1/sessions/${sessionId}/survey`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rating }),
  });
  return readResponse(response);
}
