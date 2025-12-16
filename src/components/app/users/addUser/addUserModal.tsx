import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import AddUserForm from './addUserForm'

const AddUserModal = ({ cta }: { cta: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{cta}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill the form below to add a new member to the library system.
          </DialogDescription>
        </DialogHeader>

        <AddUserForm />
      </DialogContent>
    </Dialog>
  )
}

export default AddUserModal
