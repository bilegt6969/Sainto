import type { CollectionConfig } from 'payload' // Ensure this import exists


export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  // Define access control for the entire collection if needed
  // access: {
  //   read: () => true, // Example: Allow reading users? Be careful!
  //   create: isAdmin, // Only admins can create users?
  //   update: isAdminOrSelf, // Admins or user themselves can update
  //   delete: isAdmin, // Only admins can delete
  // },
  fields: [
    // Email and Password added by auth: true

    // --- ADD THIS FIELD ---
// Inside the fields array of src/collections/Users.ts
{
  name: 'roles',
  label: 'Roles',
  type: 'select',
  hasMany: true,   // Keep troubleshooting Error 1 if it persists
  required: true,
  defaultValue: ['user'],
  options: [
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ],
  // FIX: Use inline functions for Field Access
  access: {
      create: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
      update: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
  },
  admin: {
    description: 'Assign roles to determine user permissions.'
  }
},
    // --- END OF FIELD TO ADD ---

    // Add other custom fields for your users here if needed
    // e.g., { name: 'name', type: 'text' }
  ],
}