// src/store/libraryStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type Library = {
  id?: number
  is_synced: boolean
  name: string
  code: string
  address: string
  phone: string
  email: string
  opening_time: string | null
  closing_time: string | null
  is_active: boolean
  created_at?: string
  has_admin: boolean
}

type LibraryStore = {
  libraries: Library[]
  currentLibrary: Library | null

  // Actions
  setLibraries: (libraries: Library[]) => void
  addLibrary: (library: Library) => void
  updateLibrary: (id: number, updates: Partial<Library>) => void
  deleteLibrary: (id: number) => void
  setCurrentLibrary: (library: Library | null) => void
  clearCurrentLibrary: () => void
}

export const useLibraryStore = create<LibraryStore>()(
  persist<LibraryStore>(
    (set, get) => ({
      libraries: [],
      currentLibrary: null,

      setLibraries: (libraries) => set({ libraries }),

      addLibrary: (library) =>
        set((state) => ({
          libraries: [...state.libraries, library],
        })),

      updateLibrary: (id, updates) =>
        set((state) => ({
          libraries: state.libraries.map((lib) =>
            lib.id === id ? { ...lib, ...updates } : lib
          ),
          currentLibrary:
            state.currentLibrary?.id === id
              ? { ...state.currentLibrary, ...updates }
              : state.currentLibrary,
        })),

      deleteLibrary: (id) =>
        set((state) => ({
          libraries: state.libraries.filter((lib) => lib.id !== id),
          currentLibrary:
            state.currentLibrary?.id === id ? null : state.currentLibrary,
        })),

      setCurrentLibrary: (library) => set({ currentLibrary: library }),

      clearCurrentLibrary: () => set({ currentLibrary: null }),
    }),
    {
      name: 'library-storage',
    }
  )
)
