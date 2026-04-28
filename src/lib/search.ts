import type { Todo } from "./api";

export function matchesQuery(todo: Todo, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const haystack = [todo.title, todo.subcategory ?? "", ...todo.people]
    .join(" ")
    .toLowerCase();
  const words = q.split(/\s+/);
  return words.every((w) => haystack.includes(w));
}

export function searchTodos(todos: Todo[], query: string): Todo[] {
  return todos.filter((t) => matchesQuery(t, query));
}
