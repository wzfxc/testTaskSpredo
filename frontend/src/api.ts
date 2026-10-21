/**
 * API client — fetches pre-filtered projects from the Python backend.
 */

import type { Project } from "./types";

const API_BASE = "http://localhost:8000";

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
