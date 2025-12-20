'use client'
import React from 'react'
import UpdateProfileForm from '../users/profile/updateProfileForm'
import LibraryForm from '../library/libraryDetailsForm'
import { useProfile } from '@/zustand/profile'

const Settings = () => {
  return (
    <div className="grid w-full gap-4 space-y-4 p-4 pt-0! md:gap-6 lg:grid-cols-2 lg:p-6">
      <div>
        <UpdateProfileForm />
      </div>
      <div>
        <LibraryForm />
      </div>
    </div>
  )
}

export default Settings
