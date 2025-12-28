/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'

export type UserRole = 'super_admin' | 'admin' | 'member'

export interface Member {
  id: string
  email: string
  username: string | null
  first_name: string
  last_name: string
  phone_no: string
  gender: 'male' | 'female' | null
  category:
    | 'student'
    | 'teacher'
    | 'researcher'
    | 'senior_citizen'
    | 'house_wife'
    | 'business_person'
    | 'govt_employee'
    | 'private_employee'
    | 'farmer'
    | 'shopkeeper'
    | 'industrialist'
    | 'craftsmen'
    | 'sportsmen'
    | 'men_of_letters'
    | 'artist'
    | 'social_worker'
    | 'public_representative'
    | 'professional'
    | 'special_person'
    | null
  age_group:
    | '<10'
    | '10-15'
    | '16-25'
    | '26-35'
    | '36-45'
    | '46-60'
    | '61+'
    | null
  city: string | null
  address: string | null
  country: string | null
  cnic: string | null
  photo: string | undefined
  cnic_front: string | File | null
  cnic_back: string | File | null
  about: string | null
  library: any // could define Library interface if needed
  role: 'super_admin' | 'admin' | 'member'
  is_email_verified: boolean
  is_active: boolean
  is_staff: boolean
  otp: string | null
  created_at: string
  fingerprint_template: string | null
  membership: any
  attendances: any
}

interface MemberStore {
  members: Member[]
  currentMember: Member | null
  loading: boolean
  error: string | null

  // Actions
  setMembers: (members: Member[]) => void
  addMember: (member: Member) => void
  updateMember: (id: string, updates: Partial<Member>) => void
  deleteMember: (id: string) => void
  setCurrentMember: (member: Member | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  // Selectors / Helpers
  getAllMembers: () => Member[]
  getMemberById: (id: string) => Member | undefined
  getMemberByEmail: (email: string) => Member | undefined
  getMembersByRole: (role: UserRole) => Member[]
  searchMembers: (query: string) => Member[]
}

export const useMemberStore = create<MemberStore>()(
  persist(
    (set, get) => ({
      members: [],
      currentMember: null,
      loading: false,
      error: null,

      setMembers: (members) => set({ members, error: null }),

      addMember: (member) =>
        set(
          produce((state) => {
            state.members.push(member)
          })
        ),

      updateMember: (id, updates) =>
        set(
          produce((state) => {
            const member = state.members.find((m: Member) => m.id === id)
            if (member) {
              Object.assign(member, updates)
              // Also update currentMember if it's the same person
              if (state.currentMember?.id === id) {
                state.currentMember = { ...state.currentMember, ...updates }
              }
            }
          })
        ),

      deleteMember: (id) =>
        set(
          produce((state) => {
            state.members = state.members.filter((m: Member) => m.id !== id)
            if (state.currentMember?.id === id) {
              state.currentMember = null
            }
          })
        ),

      setCurrentMember: (member) => set({ currentMember: member }),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Helper Selectors
      getAllMembers: () => get().members,

      getMemberById: (id) => get().members.find((m) => m.id === id),
      getMemberByEmail: (email) => get().members.find((m) => m.email === email),
      getMembersByRole: (role) => get().members.filter((m) => m.role === role),

      searchMembers: (query) => {
        const lowerQuery = query.toLowerCase()
        return get().members.filter((member) => {
          const fullName =
            `${member.first_name} ${member.last_name}`.toLowerCase()
          return (
            member.email.toLowerCase().includes(lowerQuery) ||
            fullName.includes(lowerQuery) ||
            member.phone_no.includes(query) ||
            (member.username?.toLowerCase().includes(lowerQuery) ?? false)
          )
        })
      },
    }),
    {
      name: 'member-storage',
      partialize: (state) => ({
        members: state.members,
        currentMember: state.currentMember,
      }),
    }
  )
)
