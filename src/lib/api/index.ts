import { config } from "@/config";
import { addDays, isWorkingDay, parseDateKey, toDateKey } from "@/lib/date";

export type UserRole = "employee" | "admin";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
};

export type AttendanceStatus = "OK" | "LATE" | "ABSENT" | "INCOMPLETE";

export type AttendanceDay = {
  date: string;
  inTime: string | null;
  outTime: string | null;
  status: AttendanceStatus;
};

export type AdminRow = {
  userId: string;
  fullName: string;
  inTime: string | null;
  outTime: string | null;
  status: AttendanceStatus;
};

type AuthSession = {
  token: string;
  user: User;
};

const STORAGE_KEYS = {
  users: "checkin_users",
  attendance: "checkin_attendance",
  auth: "checkin_auth"
};

const demoUsers: User[] = [
  {
    id: "user-employee",
    fullName: "Demo Employee",
    email: "employee@demo.local",
    role: "employee",
    active: true
  },
  {
    id: "user-admin",
    fullName: "Demo Admin",
    email: "admin@demo.local",
    role: "admin",
    active: true
  }
];

const inMemoryStore: Record<string, string> = {};

const storage = {
  getItem(key: string) {
    if (typeof window === "undefined") return inMemoryStore[key] ?? null;
    return window.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") {
      inMemoryStore[key] = value;
      return;
    }
    window.localStorage.setItem(key, value);
  },
  removeItem(key: string) {
    if (typeof window === "undefined") {
      delete inMemoryStore[key];
      return;
    }
    window.localStorage.removeItem(key);
  }
};

const readJson = <T>(key: string, fallback: T): T => {
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  storage.setItem(key, JSON.stringify(value));
};

const ensureMockData = () => {
  const users = readJson<User[]>(STORAGE_KEYS.users, []);
  if (users.length === 0) {
    writeJson(STORAGE_KEYS.users, demoUsers);
  }
  const attendance = readJson<Record<string, Record<string, AttendanceDay>>>(
    STORAGE_KEYS.attendance,
    {}
  );
  if (Object.keys(attendance).length === 0) {
    writeJson(STORAGE_KEYS.attendance, {});
  }
};

const getUsers = () => {
  ensureMockData();
  return readJson<User[]>(STORAGE_KEYS.users, demoUsers);
};

const saveUsers = (users: User[]) => {
  writeJson(STORAGE_KEYS.users, users);
};

const getAttendanceStore = () => {
  ensureMockData();
  return readJson<Record<string, Record<string, AttendanceDay>>>(
    STORAGE_KEYS.attendance,
    {}
  );
};

const saveAttendanceStore = (
  store: Record<string, Record<string, AttendanceDay>>
) => {
  writeJson(STORAGE_KEYS.attendance, store);
};

const computeStatus = (dateKey: string, day?: AttendanceDay) => {
  const todayKey = toDateKey(new Date());
  const date = parseDateKey(dateKey);
  if (!day || (!day.inTime && !day.outTime)) {
    if (dateKey === todayKey) return "INCOMPLETE" as const;
    if (date < parseDateKey(todayKey) && isWorkingDay(date)) {
      return "ABSENT" as const;
    }
    return "INCOMPLETE" as const;
  }
  if (day.inTime && !day.outTime) return "INCOMPLETE" as const;
  if (!day.inTime) return "INCOMPLETE" as const;
  const inDate = new Date(day.inTime);
  const lateCutoff = new Date(inDate);
  lateCutoff.setHours(9, 10, 0, 0);
  return inDate > lateCutoff ? "LATE" : "OK";
};

const normalizeDay = (dateKey: string, day?: AttendanceDay): AttendanceDay => {
  const status = computeStatus(dateKey, day);
  return {
    date: dateKey,
    inTime: day?.inTime ?? null,
    outTime: day?.outTime ?? null,
    status
  };
};

const getUserDay = (userId: string, dateKey: string): AttendanceDay => {
  const store = getAttendanceStore();
  const day = store[userId]?.[dateKey];
  return normalizeDay(dateKey, day);
};

const setUserDay = (userId: string, day: AttendanceDay) => {
  const store = getAttendanceStore();
  const userDays = store[userId] ?? {};
  userDays[day.date] = day;
  store[userId] = userDays;
  saveAttendanceStore(store);
};

const getSession = (): AuthSession | null => {
  return readJson<AuthSession | null>(STORAGE_KEYS.auth, null);
};

const saveSession = (session: AuthSession | null) => {
  if (!session) {
    storage.removeItem(STORAGE_KEYS.auth);
    return;
  }
  writeJson(STORAGE_KEYS.auth, session);
};

const createToken = () => `mock-${Math.random().toString(36).slice(2, 10)}`;

const mockLogin = async (email: string, password: string) => {
  ensureMockData();
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  const user = getUsers().find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.active
  );
  if (!user) {
    throw new Error("Invalid credentials.");
  }
  const session = { token: createToken(), user };
  saveSession(session);
  return session;
};

const mockDemoLogin = async (role: UserRole) => {
  ensureMockData();
  const user = getUsers().find((item) => item.role === role && item.active);
  if (!user) {
    throw new Error("Demo user unavailable.");
  }
  const session = { token: createToken(), user };
  saveSession(session);
  return session;
};

const mockLogout = async () => {
  saveSession(null);
};

const mockScanQr = async (userId: string, code: string) => {
  if (!code) throw new Error("QR code is required.");
  if (code !== config.officeQrCode) {
    throw new Error("Invalid QR code.");
  }
  const dateKey = toDateKey(new Date());
  const current = getUserDay(userId, dateKey);
  if (!current.inTime) {
    const updated = { ...current, inTime: new Date().toISOString() };
    setUserDay(userId, updated);
    return normalizeDay(dateKey, updated);
  }
  if (!current.outTime) {
    const updated = { ...current, outTime: new Date().toISOString() };
    setUserDay(userId, updated);
    return normalizeDay(dateKey, updated);
  }
  throw new Error("Already completed for today.");
};

const mockGetWeek = async (userId: string) => {
  const today = new Date();
  const dayIndex = today.getDay();
  const mondayOffset = (dayIndex + 6) % 7;
  const monday = addDays(today, -mondayOffset);
  return Array.from({ length: 7 }).map((_, index) => {
    const dateKey = toDateKey(addDays(monday, index));
    return getUserDay(userId, dateKey);
  });
};

const mockGetHistory = async (userId: string, monthValue: string) => {
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const days: AttendanceDay[] = [];
  for (let day = 1; day <= end.getDate(); day += 1) {
    const date = new Date(year, month - 1, day);
    const dateKey = toDateKey(date);
    days.push(getUserDay(userId, dateKey));
  }
  return days;
};

const mockGetAdminRows = async (dateKey: string) => {
  const users = getUsers().filter((user) => user.active);
  return users.map((user) => {
    const day = getUserDay(user.id, dateKey);
    return {
      userId: user.id,
      fullName: user.fullName,
      inTime: day.inTime,
      outTime: day.outTime,
      status: day.status
    };
  });
};

const mockUpsertUser = async (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex((item) => item.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  saveUsers(users);
  return user;
};

const mockToggleUser = async (userId: string) => {
  const users = getUsers();
  const updated = users.map((user) =>
    user.id === userId ? { ...user, active: !user.active } : user
  );
  saveUsers(updated);
  return updated.find((user) => user.id === userId) ?? null;
};

const mockListUsers = async () => getUsers();

const realFetch = async <T>(path: string, options?: RequestInit) => {
  if (!config.apiBaseUrl) {
    throw new Error("API base URL is not configured.");
  }
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    throw new Error("Request failed.");
  }
  return (await response.json()) as T;
};

export const api = {
  getSession: async () => {
    if (config.useMockApi) return getSession();
    return realFetch<AuthSession | null>("/auth/session");
  },
  login: async (email: string, password: string) => {
    if (config.useMockApi) return mockLogin(email, password);
    return realFetch<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },
  demoLogin: async (role: UserRole) => {
    if (config.useMockApi) return mockDemoLogin(role);
    return realFetch<AuthSession>("/auth/demo", {
      method: "POST",
      body: JSON.stringify({ role })
    });
  },
  logout: async () => {
    if (config.useMockApi) return mockLogout();
    await realFetch<void>("/auth/logout", { method: "POST" });
  },
  scanQr: async (userId: string, code: string) => {
    if (config.useMockApi) return mockScanQr(userId, code);
    return realFetch<AttendanceDay>("/attendance/scan", {
      method: "POST",
      body: JSON.stringify({ userId, code })
    });
  },
  getWeek: async (userId: string) => {
    if (config.useMockApi) return mockGetWeek(userId);
    return realFetch<AttendanceDay[]>(`/attendance/week?userId=${userId}`);
  },
  getHistory: async (userId: string, monthValue: string) => {
    if (config.useMockApi) return mockGetHistory(userId, monthValue);
    return realFetch<AttendanceDay[]>(
      `/attendance/history?userId=${userId}&month=${monthValue}`
    );
  },
  getAdminRows: async (dateKey: string) => {
    if (config.useMockApi) return mockGetAdminRows(dateKey);
    return realFetch<AdminRow[]>(`/admin/attendance?date=${dateKey}`);
  },
  listUsers: async () => {
    if (config.useMockApi) return mockListUsers();
    return realFetch<User[]>("/admin/users");
  },
  upsertUser: async (user: User) => {
    if (config.useMockApi) return mockUpsertUser(user);
    return realFetch<User>("/admin/users", {
      method: "POST",
      body: JSON.stringify(user)
    });
  },
  toggleUser: async (userId: string) => {
    if (config.useMockApi) return mockToggleUser(userId);
    return realFetch<User | null>(`/admin/users/${userId}/toggle`, {
      method: "POST"
    });
  }
};
