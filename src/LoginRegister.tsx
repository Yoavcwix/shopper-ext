import { useState } from "react";
import { base44 } from "./lib/base44";

type User = { id: string; email: string };

type Props = { onLoggedIn: (u: User) => void };

export function LoginRegister({ onLoggedIn }: Props) {
  const [mode, setMode] = useState<"login" | "register" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await base44.auth.loginViaEmailPassword(email, password);
      onLoggedIn({ id: res.user.id, email: res.user.email });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setRegisterSuccess(true);
      setMode("verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode });
      const res = await base44.auth.loginViaEmailPassword(email, password);
      onLoggedIn({ id: res.user.id, email: res.user.email });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "verify") {
    return (
      <form onSubmit={handleVerifyOtp}>
        <p style={{ marginBottom: 8 }}>
          {registerSuccess ? "Check your email for the verification code." : "Enter the code from your email."}
        </p>
        <input
          type="text"
          placeholder="Verification code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        {error && <p style={{ color: "#b91c1c", fontSize: 12, marginBottom: 8 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: "8px 14px", marginRight: 8 }}>
          {loading ? "Verifying…" : "Verify"}
        </button>
        <button type="button" onClick={() => setMode("login")} style={{ padding: "8px 14px" }}>
          Back to login
        </button>
      </form>
    );
  }

  if (mode === "register") {
    return (
      <form onSubmit={handleRegister}>
        <h3 style={{ margin: "0 0 12px" }}>Create account</h3>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 8 }}
        />
        {error && <p style={{ color: "#b91c1c", fontSize: 12, marginBottom: 8 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: "8px 14px", marginRight: 8 }}>
          {loading ? "Signing up…" : "Sign up"}
        </button>
        <button type="button" onClick={() => { setMode("login"); setError(null); }} style={{ padding: "8px 14px" }}>
          Back to login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <h3 style={{ margin: "0 0 12px" }}>Log in</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      {error && <p style={{ color: "#b91c1c", fontSize: 12, marginBottom: 8 }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ padding: "8px 14px", marginRight: 8 }}>
        {loading ? "Logging in…" : "Log in"}
      </button>
      <button type="button" onClick={() => { setMode("register"); setError(null); }} style={{ padding: "8px 14px" }}>
        Sign up
      </button>
    </form>
  );
}
