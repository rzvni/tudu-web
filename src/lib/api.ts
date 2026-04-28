export const WORK_CATEGORY = "Work";

export type Todo = {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  dueDate: string | null;
  notes: string | null;
  people: string[];
  done: boolean;
  someday: boolean;
  doneAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function apiBase(): string {
  const v = process.env.TUDU_API_BASE;
  if (!v) throw new Error("TUDU_API_BASE is not set");
  return v.replace(/\/$/, "");
}

function bearer(): string {
  const v = process.env.TUDU_BEARER_TOKEN;
  if (!v) throw new Error("TUDU_BEARER_TOKEN is not set");
  return v;
}

async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer()}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  return res;
}

export async function listWorkTodos(): Promise<Todo[]> {
  const res = await api("/api/todos");
  if (!res.ok) throw new Error(`GET /api/todos failed: ${res.status}`);
  const data = (await res.json()) as { todos: Todo[] };
  return data.todos
    .filter((t) => t.category === WORK_CATEGORY)
    .map((t) => ({ ...t, people: t.people ?? [] }));
}

export type CreateTodoInput = {
  title: string;
  subcategory?: string | null;
  people?: string[];
};

export async function createWorkTodo(input: CreateTodoInput): Promise<void> {
  const res = await api("/api/todos", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      category: WORK_CATEGORY,
      subcategory: input.subcategory ?? null,
      people: input.people ?? [],
    }),
  });
  if (!res.ok) throw new Error(`POST /api/todos failed: ${res.status}`);
}

export async function setTodoDone(id: string, done: boolean): Promise<void> {
  const res = await api(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ done }),
  });
  if (!res.ok) throw new Error(`PATCH /api/todos/${id} failed: ${res.status}`);
}
