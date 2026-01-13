"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileDown,
  History,
  LogOut,
  Mic,
  QrCode,
  Search,
  UserPlus,
  Users
} from "lucide-react";

import { config } from "@/config";
import { useAuth } from "@/hooks/use-auth";
import { api, type AdminRow } from "@/lib/api";
import { formatTime, toDateKey } from "@/lib/date";

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

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getAdminRows(toDateKey(new Date()));
      setRows(data);
      setLoading(false);
    };
    load();
  }, []);

  const inOfficeCount = useMemo(
    () => rows.filter((row) => row.inTime && !row.outTime).length,
    [rows]
  );

  const lateCount = useMemo(
    () => rows.filter((row) => row.status === "LATE").length,
    [rows]
  );

  const historyEntries = useMemo(() => {
    if (rows.length === 0) return fallbackHistory;
    return rows
      .filter((row) => row.inTime || row.outTime)
      .slice(0, 5)
      .map((row) => ({
        id: row.userId,
        name: row.fullName,
        time: formatTime(row.inTime ?? row.outTime),
        status: "Вход",
        department: "Main Office"
      }));
  }, [rows]);

  const filteredHistory = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return historyEntries;
    return historyEntries.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [historyEntries, searchQuery]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const displayName = user?.fullName?.split(" ")[0] ?? "Админ";

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
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black text-white">
              Администратор
            </span>
          </div>
        </section>

        <section>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={18} />
            <input
              type="text"
              placeholder="Поиск по сотрудникам или логам..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-white border border-black/5 h-14 pl-12 pr-12 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-[15px] font-medium"
            />
            <Mic
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-black cursor-pointer"
              size={18}
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
              <Users size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight mb-1">
                {loading ? "…" : inOfficeCount}
              </p>
              <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest">
                В офисе
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
              <History size={20} />
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight mb-1">
                {loading ? "…" : lateCount}
              </p>
              <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest">
                Опоздания
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <button className="flex-1 bg-white border border-black/5 h-14 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
            <FileDown size={18} /> Отчет
          </button>
          <button className="flex-1 bg-white border border-black/5 h-14 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
            <UserPlus size={18} /> Люди
          </button>
        </div>

        <section className="space-y-5 pb-10">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-xl tracking-tight">История</h3>
            <button className="text-blue-500 text-[13px] font-bold uppercase tracking-wider">
              Все
            </button>
          </div>

          <div className="space-y-4">
            {filteredHistory.map((item) => (
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
    </div>
  );
}
