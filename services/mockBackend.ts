
import { User, ActivationKey } from "../types";

// Initial seed data
const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', role: 'admin', status: 'active', registeredAt: new Date().toISOString() },
  { id: '2', username: 'user', role: 'user', status: 'active', registeredAt: new Date().toISOString() }
];

const INITIAL_KEYS: ActivationKey[] = [
  { id: 'k1', key: 'KV-2024-TEST-KEY', status: 'unused', generatedBy: 'admin', generatedAt: new Date().toISOString() }
];

// Helper to load/save
const loadData = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultData;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultData;
  }
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- User Service ---

export const getUsers = (): User[] => {
  return loadData('mock_users', INITIAL_USERS);
};

export const updateUserStatus = (userId: string, status: 'active' | 'disabled'): User[] => {
  const users = getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, status } : u);
  saveData('mock_users', updated);
  return updated;
};

// --- Key Service ---

export const getKeys = (): ActivationKey[] => {
  return loadData('mock_keys', INITIAL_KEYS);
};

export const generateKey = (adminUsername: string): ActivationKey[] => {
  const keys = getKeys();
  const newKey: ActivationKey = {
    id: Math.random().toString(36).substr(2, 9),
    key: `KV-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${new Date().getFullYear()}`,
    status: 'unused',
    generatedBy: adminUsername,
    generatedAt: new Date().toISOString()
  };
  const updated = [newKey, ...keys];
  saveData('mock_keys', updated);
  return updated;
};

export const deleteKey = (keyId: string): ActivationKey[] => {
  const keys = getKeys();
  const updated = keys.filter(k => k.id !== keyId);
  saveData('mock_keys', updated);
  return updated;
};

// --- Auth Check ---
export const verifyCredentials = (username: string, password: string): User | null => {
  // Mock Logic: Password is always '123456' for simplicity in this demo
  if (password !== '123456') return null;

  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (user && user.status === 'active') {
    return user;
  }
  return null;
};
