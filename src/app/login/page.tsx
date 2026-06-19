"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, registerAction } from "@/lib/actions";
import {
  Lock,
  Mail,
  FileSpreadsheet,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  User
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register" && !nombre.trim()) {
      setError("Por favor, ingrese su nombre completo.");
      setLoading(false);
      return;
    }

    if (!email || !email.includes("@")) {
      setError("Por favor, ingrese un correo electrónico válido.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        await loginAction({ email, password });
      } else {
        await registerAction({ nombre, email, password });
      }
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10 space-y-8">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Facturas App</h1>
            <p className="text-slate-400 text-sm mt-1">
              {mode === "login"
                ? "Inicia sesión en tu panel administrativo"
                : "Crea una nueva cuenta administrativa"}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-900 text-red-400 rounded-xl flex items-start gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="pl-10 pr-4 py-2.5 w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                placeholder="nombre@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 pr-4 py-2.5 w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 py-2.5 w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-white rounded-xl text-sm focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white py-3 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Ingresar"
              : "Registrarse"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400">
          {mode === "login" ? (
            <>
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer hover:underline focus:outline-none"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer hover:underline focus:outline-none"
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>

        {mode === "login" && (
          <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
            <Key className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">
                Credenciales Demo:
              </span>
              <p>
                Usuario: <code className="text-indigo-300">admin@facturas.com</code>
              </p>
              <p>
                Contraseña: <code className="text-indigo-300">admin123</code>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
