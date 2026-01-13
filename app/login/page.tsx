"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, Phone, QrCode, ShieldCheck } from "lucide-react";

import { config } from "@/config";
import { useAuth } from "@/hooks/use-auth";

const demoPassword = "demo-pass";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "employee") {
      router.replace("/employee");
    } else if (user?.role === "admin") {
      router.replace("/admin");
    }
  }, [router, user]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginValue.trim()) {
      setError("Введите email или телефон.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(loginValue.trim(), demoPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-black rounded-[1.4rem] flex items-center justify-center mx-auto shadow-2xl shadow-black/10">
              <QrCode size={40} className="text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F]">
                {config.appName}
              </h1>
              <p className="text-[#86868B] font-medium text-[15px]">
                Войдите, чтобы начать работу
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#86868B] flex gap-2 border-r pr-3 border-black/5">
                <Mail size={18} className={loginValue.includes("@") ? "text-black" : ""} />
                <span className="text-xs self-center font-bold opacity-20">/</span>
                <Phone
                  size={18}
                  className={!loginValue.includes("@") && loginValue.length > 0 ? "text-black" : ""}
                />
              </div>
              <input
                type="text"
                required
                placeholder="Email или телефон"
                value={loginValue}
                onChange={(event) => setLoginValue(event.target.value)}
                className="w-full bg-[#F5F5F7] border-none h-16 pl-24 pr-6 rounded-2xl text-[16px] font-medium focus:ring-2 focus:ring-black/5 transition-all placeholder:text-[#86868B]/50"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-black text-white h-16 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Входим..." : "Продолжить"}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2 border border-black/5">
            <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest text-center">
              Для теста:
            </p>
            <div className="flex justify-between px-2">
              <button
                type="button"
                onClick={() => setLoginValue("admin@demo.local")}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                admin@demo.local
              </button>
              <button
                type="button"
                onClick={() => setLoginValue("employee@demo.local")}
                className="text-[11px] text-blue-600 font-bold hover:underline"
              >
                employee@demo.local
              </button>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-[13px] text-[#86868B] font-medium">
              Нет учетной записи? <span className="text-blue-600 font-bold cursor-pointer">Связаться с HR</span>
            </p>
          </div>
        </div>
      </div>

      <footer className="p-8 text-center border-t border-black/5">
        <div className="flex items-center justify-center gap-2 opacity-30 grayscale mb-1">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Enterprise Secure Access
          </span>
        </div>
      </footer>
    </div>
  );
}
