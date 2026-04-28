import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/");
  return (
    <main className="shell">
      <div className="card">
        <h1 className="title">tudu · work</h1>
        <p className="sub">Code aus deiner Authenticator-App</p>
        <LoginForm />
      </div>
    </main>
  );
}
