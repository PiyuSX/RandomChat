import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  username: string;
  setUsername: (name: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: '',
      setUsername: (name) => set({ username: name }),
    }),
    {
      name: 'user-storage',
    }
  )
);