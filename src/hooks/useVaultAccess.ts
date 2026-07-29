import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VaultAccessState {
  unlocked: boolean;
  unlock: () => void;
}

export const useVaultAccess = create<VaultAccessState>()(
  persist(
    (set) => ({
      unlocked: false,
      unlock: () => set({ unlocked: true }),
    }),
    { name: 'dm-vault-access' },
  ),
);
