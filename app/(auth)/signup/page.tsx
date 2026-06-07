"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setDone(true);
    // The DB trigger handle_new_user() creates the profile row with role 'user'.
  }

  if (done) {
    return (
      <Card>
        <CardBody className="space-y-2 text-center">
          <h2 className="text-lg">Check your inbox</h2>
          <p className="text-sm text-canteen-muted">
            We sent a confirmation link to <span className="font-medium text-canteen-ink">{email}</span>.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="text-lg">Create account</h2>
        <Field label="Work email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button className="w-full" onClick={onSubmit} disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-canteen-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-canteen-accent hover:underline">Sign in</Link>
        </p>
      </CardBody>
    </Card>
  );
}
