import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrgId = string;

interface PreferencesState {
  activeOrgId: OrgId;
  compactTables: boolean;
  setActiveOrg: (id: OrgId) => void;
  toggleCompactTables: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      activeOrgId: 'org_nova',
      compactTables: false,
      setActiveOrg: (id) => set({ activeOrgId: id }),
      toggleCompactTables: () => set((s) => ({ compactTables: !s.compactTables })),
    }),
    { name: 'astroid-preferences' },
  ),
);
