"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

const errorMessages: Record<string, string> = {
  banned: "This staff account is currently blocked.",
  forbidden: "This account does not have staff access."
};

export function AdminLoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(() => {
    const error = initialError;
    return error ? (errorMessages[error] ?? "Please sign in again.") : "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      setMessage(result.error.issues[0]?.message ?? "Please check your sign-in details.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const { error } = await authClient.signIn.email({
      email: result.data.email,
      password: result.data.password,
      callbackURL: "/admin"
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message ?? "Unable to sign in.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm" onSubmit={onSubmit}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Staff sign in</h1>
        <p className="text-sm text-muted-foreground">Access the Sportsfair editorial console.</p>
      </div>
      <Input
        autoComplete="email"
        inputMode="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        type="email"
        value={email}
      />
      <Input
        autoComplete="current-password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        type="password"
        value={password}
      />
      <Button type="submit" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" />
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
      {message ? <p className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
