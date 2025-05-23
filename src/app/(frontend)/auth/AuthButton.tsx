'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/firebaseConfig'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { Avatar } from '@heroui/react'
import { ArrowRightIcon, User as UserIcon, LogOut, Copy, Edit } from 'lucide-react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { Button } from '../../../components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success('Signed out successfully')
    } catch (err) {
      // Handle error properly, logging or displaying it
      toast.error('Error signing out. Please try again.')
      console.error("Sign out error:", err) // Log the actual error
    }
  }

  const handleSignIn = () => {
    router.push('/auth/login')
  }

  const handleAccountClick = () => {
    router.push('/account')
  }

  return (
    <div className="flex items-center">
      {user ? (
        <Dropdown>
          <DropdownTrigger>
            <button className="focus:outline-none">
              <div className="relative group">
                <Avatar
                  showFallback
                  className="h-9 w-9 bg-white border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
                  src={user.photoURL || undefined}
                  fallback={
                    <div className="flex items-center justify-center h-full w-full text-neutral-700">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  }
                />
                <div className="absolute inset-0 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300" />
              </div>
            </button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="User Actions"
            className="min-w-[200px] bg-neutral-900/95 backdrop-blur-lg border border-neutral-800 rounded-xl shadow-xl overflow-hidden py-1"
          >
            <DropdownItem
              key="account"
              onPress={handleAccountClick}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
              startContent={<UserIcon className="h-4 w-4 text-purple-400" />}
            >
              My Account
            </DropdownItem>
            <DropdownItem
              key="copy-link"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
              startContent={<Copy className="h-4 w-4 text-blue-400" />}
            >
              Copy Profile Link
            </DropdownItem>
            <DropdownItem
              key="edit"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-200 hover:bg-neutral-800 transition-colors"
              startContent={<Edit className="h-4 w-4 text-green-400" />}
            >
              Edit Profile
            </DropdownItem>
            <DropdownItem
              key="sign-out"
              onPress={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-neutral-800 transition-colors"
              startContent={<LogOut className="h-4 w-4 text-red-400" />}
            >
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button
          size="sm"
          onClick={handleSignIn}
          className="rounded-full bg-white text-black shadow-lg hover:shadow-md hover:scale-[1.02] transition-all duration-300"
        >
          Sign In
          <ArrowRightIcon className="w-4 h-4 ml-1 hidden lg:block" />
        </Button>
      )}
    </div>
  )
}

export default AuthButton
