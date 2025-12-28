import { create } from 'zustand'
import { persist } from 'zustand/middleware'

//  "id",
//   "name",
//   "code",
//   "address",
//   "phone",
//   "email",
//   "opening_time",
//   "closing_time",
//   "is_active",

type library = {
  id: number
  name: string
  code: string
  address: string
  phone: string
  email: string
  opening_time: string
  closing_time: string
  is_active: boolean
}

type UserAccount = {
  id: number
  email: string
  username?: string | null
  first_name: string
  last_name: string
  phone_no: string

  photo?: string | null
  city?: string | null
  address?: string | null
  country?: string | null
  timezone: string
  about?: string | null

  is_email_verified: boolean

  cnic?: string | null
  cnic_front?: string | null
  cnic_back?: string | null

  face_embedding?: number[] | null
  fingerprint_template?: string | null

  libraries: library[]
  role: 'super_admin' | 'admin' | 'member'

  is_active: boolean
  is_staff: boolean
  created_at: string
  access: string
}

type UserState = {
  profile: UserAccount | null
  isAuthenticated: boolean
  isLoading: boolean

  setUserProfile: (profile: UserAccount) => void
  updateProfile: (data: Partial<UserAccount>) => void
  clearProfile: () => void
  setLoading: (value: boolean) => void
}

export const useProfile = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      isAuthenticated: false,
      isLoading: false,

      setUserProfile: (profile) =>
        set({
          profile,
          isAuthenticated: true,
        }),

      updateProfile: (data) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...data } : null,
        })),

      clearProfile: () =>
        set({
          profile: null,
          isAuthenticated: false,
        }),

      setLoading: (value) =>
        set({
          isLoading: value,
        }),
    }),
    {
      name: 'user-store',
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
