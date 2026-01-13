"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  LogOut,
  QrCode,
  X
} from "lucide-react";

import { config } from "@/config";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/date";

type HistoryEntry = {
  id: string;
  name: string;
  time: string;
  status: string;
  department: string;
};

const fallbackHistory: HistoryEntry[] = [
  { id: "1", name: "Елена Панова", time: "10:12", status: "Вход", department: "Design" },
  { id: "2", name: "Марк Воронов", time: "09:45", status: "Вход", department: "Engineering" }
];

export default function EmployeeHomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(fallbackHistory);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const weekEntries = await api.getWeek(user.id);
      const mapped = weekEntries
        .filter((entry) => entry.inTime || entry.outTime)
        .slice(0, 5)
        .map((entry, index) => ({
          id: `${entry.date}-${index}`,
          name: user.fullName,
          time: formatTime(entry.inTime ?? entry.outTime),
          status: "Вход",
          department: "Main Office"
        }));
      if (mapped.length > 0) {
        setHistory(mapped);
      }
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);
  };

  const handleSimulateScan = () => {
    if (!user) return;
    const newEntry = {
      id: String(Date.now()),
      name: user.fullName,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Вход",
      department: "Main Office"
    };

    setScanResult(newEntry);

    setTimeout(() => {
      setHistory((prev) => [newEntry, ...prev.slice(0, 4)]);
      setIsScanning(false);
      setScanResult(null);
    }, 2000);
  };

  const displayName = user?.fullName?.split(" ")[0] ?? "Пользователь";

  const orderedHistory = useMemo(() => history.slice(0, 5), [history]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/80 backdrop-blur-2xl border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <QrCode size={14} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg leading-none">CheckIn</span>
          </div>
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-tighter mt-1">
            {config.appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-xl mx-auto w-full pb-32">
        <section className="space-y-1">
          <p className="text-[#86868B] font-bold text-[12px] uppercase tracking-widest mb-2">
            {currentTime.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
          </p>
          <h2 className="text-4xl font-bold tracking-tight leading-tight">Привет, {displayName}</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-600 text-white">
              Сотрудник
            </span>
          </div>
        </section>

        <section>
          <button
            onClick={startScanner}
            className="w-full bg-white p-6 rounded-[2.5rem] border border-black/5 flex flex-col items-center gap-6 hover:bg-black hover:text-white active:scale-[0.98] transition-all duration-500 shadow-xl shadow-black/5 group"
          >
            <div className="w-20 h-20 bg-black text-white rounded-[1.7rem] flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <Camera size={36} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tracking-tight">Отметиться</p>
              <p className="text-[#86868B] group-hover:text-white/60 text-sm font-medium mt-1 italic">
                Сканируйте QR
              </p>
            </div>
          </button>
        </section>

        <section className="space-y-5 pb-10">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-xl tracking-tight">История</h3>
            <button className="text-blue-500 text-[13px] font-bold uppercase tracking-wider">
              Все
            </button>
          </div>

          <div className="space-y-4">
            {orderedHistory.map((item) => (
              <div
                key={item.id}
                className="group bg-white border border-black/5 p-5 rounded-[1.7rem] flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center font-bold text-base group-hover:bg-black group-hover:text-white transition-colors">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[16px] tracking-tight">{item.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-[#86868B] font-bold uppercase tracking-widest">
                      <span>{item.status}</span>
                      <span className="w-1 h-1 bg-[#86868B]/30 rounded-full"></span>
                      <span>{item.department}</span>
                    </div>
                  </div>
                </div>
                <p className="font-bold text-[14px]">{item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-black text-white p-5 rounded-[2.2rem] flex items-center justify-between shadow-2xl z-30">
        <div className="flex items-center gap-4 pl-2">
          <div className="w-2 h-2 bg-[#34C759] rounded-full animate-pulse shadow-[0_0_10px_#34C759]"></div>
          <div>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">
              Рабочий день
            </p>
            <p className="text-sm font-bold tracking-tight">07ч 42мин</p>
          </div>
        </div>
        <button className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all">
          Завершить
        </button>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-white/40 backdrop-blur-3xl"
            onClick={() => setIsScanning(false)}
          ></div>

          <div className="relative w-full max-w-sm bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] overflow-hidden border border-black/5 flex flex-col items-center">
            <div className="w-full p-8 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Камера</h3>
                <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
                  Vision Active
                </p>
              </div>
              <button
                onClick={() => setIsScanning(false)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-black hover:text-white transition-all shadow-sm"
              >
                <X size={22} />
              </button>
            </div>

            <div className="w-[88%] aspect-square mb-10 bg-black rounded-[3rem] relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-56 h-56 relative">
                  <div className="absolute top-0 left-0 w-14 h-14 border-t-[5px] border-l-[5px] border-white rounded-tl-[2rem]"></div>
                  <div className="absolute top-0 right-0 w-14 h-14 border-t-[5px] border-r-[5px] border-white rounded-tr-[2rem]"></div>
                  <div className="absolute bottom-0 left-0 w-14 h-14 border-b-[5px] border-l-[5px] border-white rounded-bl-[2rem]"></div>
                  <div className="absolute bottom-0 right-0 w-14 h-14 border-b-[5px] border-r-[5px] border-white rounded-br-[2rem]"></div>
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[scan_2s_linear_infinite]"></div>
                </div>
              </div>

              <div className="absolute bottom-8 flex justify-center w-full">
                <button
                  onClick={handleSimulateScan}
                  className="bg-white/10 hover:bg-white text-white hover:text-black text-[10px] font-bold py-3 px-8 rounded-full transition-all border border-white/20 backdrop-blur-md uppercase tracking-widest"
                >
                  Тест скана
                </button>
              </div>
            </div>

            {scanResult && (
              <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-[#34C759] rounded-full flex items-center justify-center text-white mb-8 shadow-2xl shadow-green-500/30">
                  <CheckCircle2 size={48} />
                </div>
                <h4 className="text-4xl font-bold tracking-tight mb-2">
                  {scanResult.name}
                </h4>
                <p className="text-[#86868B] font-bold tracking-[0.2em] uppercase text-[11px]">
                  Доступ разрешен • {scanResult.time}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
