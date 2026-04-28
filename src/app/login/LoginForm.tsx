"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="form" style={{ flexDirection: "column" }}>
      <input
        name="code"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        autoFocus
        required
        maxLength={6}
        placeholder="123456"
        className="input input-code"
      />
      <button type="submit" disabled={pending} className="btn">
        {pending ? "…" : "Login"}
      </button>
      {state?.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}
