/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Selection Workflows Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { Workflow } from "../types";
import { INITIAL_WORKFLOWS } from "../data/initialWorkflows";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_dynamic_workflows_v1";

function getLocalWorkflowsCache(): Workflow[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_WORKFLOWS;
  } catch {
    return INITIAL_WORKFLOWS;
  }
}

function saveLocalWorkflowsCache(workflows: Workflow[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workflows));
    window.dispatchEvent(new CustomEvent("cooltech_workflows_updated", { detail: workflows }));
  } catch {}
}

/**
 * Fetch all active workflows from Cloudflare D1
 */
export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const res = await apiClient.getWorkflows();
    if (res?.workflows && Array.isArray(res.workflows) && res.workflows.length > 0) {
      saveLocalWorkflowsCache(res.workflows);
      return res.workflows as Workflow[];
    }
  } catch (err) {
    console.warn("[Workflow Service] Error fetching workflows from D1:", err);
  }

  return getLocalWorkflowsCache();
}

/**
 * Real-time / dynamic listener for workflows
 */
export function subscribeToWorkflows(
  onUpdate: (workflows: Workflow[]) => void
): () => void {
  const initial = getLocalWorkflowsCache();
  onUpdate(initial);

  getWorkflows().then((fresh) => {
    if (Array.isArray(fresh) && fresh.length > 0) {
      onUpdate(fresh);
    }
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_workflows_updated", handleUpdate);
  return () => {
    window.removeEventListener("cooltech_workflows_updated", handleUpdate);
  };
}

/**
 * Save / create / update a workflow in Cloudflare D1 (Admin)
 */
export async function saveWorkflow(workflow: Workflow): Promise<Workflow> {
  const cached = getLocalWorkflowsCache();
  const exists = cached.some((w) => w.id === workflow.id);
  const updated = exists ? cached.map((w) => (w.id === workflow.id ? workflow : w)) : [...cached, workflow];
  saveLocalWorkflowsCache(updated);

  try {
    const res = await apiClient.saveWorkflow(workflow);
    if (res?.workflow) {
      return res.workflow as Workflow;
    }
  } catch (err) {
    console.warn("[Workflow Service] Error saving workflow to D1:", err);
  }

  return workflow;
}

/**
 * Deactivate / delete a workflow in Cloudflare D1 (Admin)
 */
export async function deleteWorkflow(workflowId: string): Promise<boolean> {
  const cached = getLocalWorkflowsCache();
  const updated = cached.filter((w) => w.id !== workflowId);
  saveLocalWorkflowsCache(updated);

  try {
    await apiClient.deleteWorkflow(workflowId);
    return true;
  } catch (err) {
    console.warn("[Workflow Service] Error deleting workflow in D1:", err);
    return false;
  }
}
