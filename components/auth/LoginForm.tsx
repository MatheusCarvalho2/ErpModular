"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const ready = useIsClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setPending(true);
    try {
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        const code = "code" in result ? String(result.code) : "";
        if (
          code === "ORGANIZATIONAL_ACCESS" ||
          result.error === "ORGANIZATIONAL_ACCESS"
        ) {
          setError(
            "Sua conta não possui vínculo com uma empresa. Contate o administrador.",
          );
        } else {
          setError("E-mail ou senha inválidos.");
        }
        setPending(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/modsystem_logo_primary.svg"
          alt="ModSystem"
          className="h-12 w-auto"
        />
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Entrar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acesse o sistema com seu e-mail e senha.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4"
        noValidate
        method="post"
        data-ready={ready ? "true" : "false"}
      >
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2"
            placeholder="voce@empresa.com"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-400 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
