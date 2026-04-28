"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { verifyTotp } from "@/lib/totp";
import { createSession, destroySession, isAuthenticated } from "@/lib/session";
import { createWorkTodo, setTodoDone } from "@/lib/api";

export async function loginAction(_state: unknown, formData: FormData): Promise<{ error?: string }> {
  const code = String(formData.get("code") ?? "");
  if (!verifyTotp(code)) {
    return { error: "Falscher Code" };
  }
  await createSession();
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function createTodoAction(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const subcategory = String(formData.get("subcategory") ?? "").trim() || null;
  const peopleRaw = formData.get("people");
  let people: string[] = [];
  if (typeof peopleRaw === "string" && peopleRaw) {
    try {
      const parsed = JSON.parse(peopleRaw);
      if (Array.isArray(parsed)) {
        people = parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
      }
    } catch {
      // ignore malformed people payload — submit with title+subcategory
    }
  }
  await createWorkTodo({ title, subcategory, people });
  revalidatePath("/");
}

export async function toggleDoneAction(formData: FormData): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
  const id = String(formData.get("id") ?? "");
  const done = formData.get("done") === "true";
  if (!id) return;
  await setTodoDone(id, !done);
  revalidatePath("/");
}
