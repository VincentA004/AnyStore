"use client";

import { fetchAuthSession } from "aws-amplify/auth";

const rawBaseUrl = process.env.NEXT_PUBLIC_ANYSTORE_API_URL;

export const isAnystoreBackendConfigured = Boolean(rawBaseUrl);

const getBaseUrl = () => rawBaseUrl?.replace(/\/+$/, "") ?? "";

type JsonRecord = Record<string, any>;

export interface AnystoreWorkspace {
  id: string;
  name: string;
  owner_id?: string;
  azure_vector_store_id?: string;
  created_at?: string;
}

export interface AnystoreDocument {
  id: string;
  workspace_id?: string;
  azure_file_id?: string;
  filename?: string;
  name?: string;
  content_type?: string;
  size_bytes?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[] | JsonRecord;
  summary?: string;
}

export interface AnystoreQueryResponse {
  answer: string;
  sources?: Array<{
    document_id?: string;
    filename?: string;
    quote?: string;
  }>;
}

const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString() || null;
  } catch {
    return null;
  }
};

const parseResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const anystoreFetch = async <T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  if (!isAnystoreBackendConfigured) {
    throw new Error("AnyStore backend is not configured. Set NEXT_PUBLIC_ANYSTORE_API_URL.");
  }

  const token = await getAuthToken();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const parsed = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed
        ? parsed.error || parsed.message || response.statusText
        : parsed || response.statusText;
    throw new Error(String(message));
  }

  return parsed as T;
};

const collectionFrom = <T>(payload: any, key: string): T[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const anystoreBackend = {
  async getMe() {
    return anystoreFetch("/me");
  },

  async getWorkspaces(): Promise<AnystoreWorkspace[]> {
    const payload = await anystoreFetch("/workspaces");
    return collectionFrom<AnystoreWorkspace>(payload, "workspaces");
  },

  async createWorkspace(name: string): Promise<AnystoreWorkspace> {
    return anystoreFetch("/workspaces", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  async getDocuments(workspaceId: string): Promise<AnystoreDocument[]> {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    const payload = await anystoreFetch(`/documents?${params.toString()}`);
    return collectionFrom<AnystoreDocument>(payload, "documents");
  },

  async uploadDocument(file: File, workspaceId: string, folderId?: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspace_id", workspaceId);
    if (folderId) formData.append("folder_id", folderId);

    return anystoreFetch<JsonRecord>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  },

  async deleteDocument(documentId: string) {
    return anystoreFetch(`/documents/${documentId}`, {
      method: "DELETE",
    });
  },

  async query(question: string, workspaceId: string): Promise<AnystoreQueryResponse> {
    return anystoreFetch("/query", {
      method: "POST",
      body: JSON.stringify({ question, workspace_id: workspaceId }),
    });
  },

  async getQueries(workspaceId: string) {
    const params = new URLSearchParams({ workspace_id: workspaceId });
    const payload = await anystoreFetch(`/queries?${params.toString()}`);
    return collectionFrom(payload, "queries");
  },
};
