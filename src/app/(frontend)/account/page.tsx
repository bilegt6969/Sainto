'use client'

import { auth } from '@/firebaseConfig'
import { 
  User, 
  onAuthStateChanged, 
  updatePassword, 
  updateEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  sendEmailVerification,
} from 'firebase/auth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Mail,
  User as UserIcon,
  Settings,
  ShoppingBag,
  LogOut,
  CreditCard,
  HelpCircle,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  X
} from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { Skeleton } from '@heroui/skeleton'

const AccountPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [avatarError, setAvatarError] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (!currentUser) {
        router.push('/auth/login')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    const loadingToast = toast.loading('Системээс гарч байна...')
    try {
      await auth.signOut()
      toast.dismiss(loadingToast)
      toast.success('Амжилттай гарлаа 👋')
      router.push('/')
    } catch (error: unknown) {
      toast.dismiss(loadingToast)
      console.error('Sign out error:', error)
      const errorMessage = error instanceof FirebaseError 
        ? error.message 
        : 'Гарахад алдаа гарлаа. Дахин оролдоно уу ⚠️'
      toast.error(errorMessage)
    }
  }

  const reauthenticateUser = async (password: string) => {
    if (!user?.email) {
      toast.error('Хэрэглэгчийн имэйл олдсонгүй')
      throw new Error('User email not found')
    }
    
    try {
      const credential = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, credential)
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/wrong-password') {
          toast.error('Нууц үг буруу байна')
        } else if (error.code === 'auth/too-many-requests') {
          toast.error('Хэтэрхий олон оролдлого хийсэн байна')
        }
      }
      throw error
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!passwordForm.currentPassword.trim()) {
      toast.error('Одоогийн нууц үгээ оруулна уу')
      return
    }

    if (!passwordForm.newPassword.trim()) {
      toast.error('Шинэ нууц үгээ оруулна уу')
      return
    }

    if (!passwordForm.confirmPassword.trim()) {
      toast.error('Нууц үгээ баталгаажуулна уу')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Шинэ нууц үг таарахгүй байна')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Нууц үг дор хаяж 6 тэмдэгт байх ёстой')
      return
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('Шинэ нууц үг одоогийнхоос өөр байх ёстой')
      return
    }

    setUpdating(true)
    const loadingToast = toast.loading('Нууц үг солиж байна...')
    
    try {
      await reauthenticateUser(passwordForm.currentPassword)
      await updatePassword(user, passwordForm.newPassword)
      
      toast.dismiss(loadingToast)
      toast.success('Нууц үг амжилттай солигдлоо! 🎉')
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: unknown) {
      toast.dismiss(loadingToast)
      console.error('Password update error:', error)
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/wrong-password':
            toast.error('Одоогийн нууц үг буруу байна ❌')
            break
          case 'auth/weak-password':
            toast.error('Нууц үг хэтэрхий сул байна. Илүү хүчтэй нууц үг ашиглана уу 🔒')
            break
          case 'auth/requires-recent-login':
            toast.error('Аюулгүй байдлын шалтгаанаар дахин нэвтэрнэ үү')
            break
          case 'auth/too-many-requests':
            toast.error('Хэтэрхий олон оролдлого хийсэн байна. Хүлээгээд дахин оролдоно уу ⏰')
            break
          case 'auth/network-request-failed':
            toast.error('Сүлжээний алдаа гарлаа. Интернет холболтоо шалгана уу 🌐')
            break
          case 'auth/internal-error':
            toast.error('Дотоод алдаа гарлаа. Дахин оролдоно уу')
            break
          default:
            toast.error(`Нууц үг солихад алдаа гарлаа: ${error.message || 'Тодорхойгүй алдаа'} ⚠️`)
        }
      } else {
        toast.error('Нууц үг солиход алдаа гарлаа ⚠️')
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!emailForm.newEmail.trim()) {
      toast.error('Шинэ имэйл хаягаа оруулна уу')
      return
    }

    if (!emailForm.currentPassword.trim()) {
      toast.error('Одоогийн нууц үгээ оруулна уу')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.newEmail)) {
      toast.error('Зөв имэйл хэлбэр оруулна уу (example@email.com)')
      return
    }

    if (emailForm.newEmail.toLowerCase() === user.email?.toLowerCase()) {
      toast.error('Шинэ имэйл одоогийнхоос өөр байх ёстой')
      return
    }

    setUpdating(true)
    const loadingToast = toast.loading('Имэйл хаяг солиж байна...')
    
    try {
      await reauthenticateUser(emailForm.currentPassword)
      await updateEmail(user, emailForm.newEmail)
      await sendEmailVerification(user)
      
      toast.dismiss(loadingToast)
      toast.success('Имэйл хаяг амжилттай солигдлоо! Шинэ хаягаа баталгаажуулна уу 📧', {
        duration: 6000
      })
      setShowEmailModal(false)
      setEmailForm({ newEmail: '', currentPassword: '' })
    } catch (error: unknown) {
      toast.dismiss(loadingToast)
      console.error('Email update error:', error)
      
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/wrong-password':
            toast.error('Нууц үг буруу байна ❌')
            break
          case 'auth/email-already-in-use':
            toast.error('Энэ имэйл хаяг аль хэдийн ашиглагдаж байна 📧')
            break
          case 'auth/invalid-email':
            toast.error('Буруу имэйл хэлбэр байна. Зөв хэлбэрээр оруулна уу')
            break
          case 'auth/requires-recent-login':
            toast.error('Аюулгүй байдлын шалтгаанаар дахин нэвтэрнэ үү')
            break
          case 'auth/too-many-requests':
            toast.error('Хэтэрхий олон оролдлого хийсэн байна. Хүлээгээд дахин оролдоно уу ⏰')
            break
          case 'auth/network-request-failed':
            toast.error('Сүлжээний алдаа гарлаа. Интернет холболтоо шалгана уу 🌐')
            break
          case 'auth/operation-not-allowed':
            toast.error('Имэйл солих боломжгүй байна. Админтай холбогдоно уу')
            break
          case 'auth/user-disabled':
            toast.error('Таны данс түр хаагдсан байна')
            break
          default:
            toast.error(`Имэйл солихад алдаа гарлаа: ${error.message || 'Тодорхойгүй алдаа'} ⚠️`)
        }
      } else {
        toast.error('Имэйл солиход алдаа гарлаа ⚠️')
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 overflow-y-auto bg-black min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-24">
          <div className="bg-neutral-900/40 backdrop-blur-lg rounded-2xl p-8 border border-neutral-800/50">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/3">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-28 w-28 rounded-full mb-6" />
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64 mb-6" />
                  <Skeleton className="h-12 w-full rounded-full mb-6" />
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <Skeleton className="h-10 w-64 mb-8" />
                <div className="grid grid-cols-2 gap-4 mb-12">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const renderFallbackAvatar = () => (
    <div className="flex items-center justify-center h-28 w-28 rounded-full border-2 border-neutral-800 bg-gradient-to-br from-purple-900 to-purple-600 text-white">
      {user.displayName ? (
        <span className="text-2xl font-medium">
          {user.displayName.split(' ').map(n => n[0]).join('')}
        </span>
      ) : (
        <UserIcon className="h-12 w-12" />
      )}
    </div>
  )

  return (
    <div className="relative inset-0 overflow-y-auto bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white tracking-tight">Хувийн хэсэг</h1>
          <p className="text-neutral-400 text-lg mt-1">Дансны удирдлагын төв</p>
        </div>
        
        <div className="bg-neutral-900/40 backdrop-blur-lg rounded-2xl p-8 border border-neutral-800/50 shadow-xl">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/3">
              <div className="flex flex-col items-center">
                <div className="relative group mb-6">
                  {!avatarError && user.photoURL ? (
                    <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-neutral-800 shadow-xl group-hover:border-purple-500 transition-all">
                      <Image
                        src={user.photoURL}
                        alt="User profile"
                        fill
                        className="object-cover"
                        onError={() => setAvatarError(true)}
                        unoptimized={true}
                      />
                    </div>
                  ) : (
                    renderFallbackAvatar()
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/50 backdrop-blur rounded-full p-3 text-white">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <h1 className="text-2xl font-medium text-white text-center">
                  {user.displayName || 'Нэргүй хэрэглэгч'}
                </h1>
                <p className="text-neutral-400 text-center mb-8">{user.email}</p>

                <Button
                  variant="outline"
                  className="w-full mb-8 bg-neutral-900 border-neutral-800 hover:bg-neutral-800 hover:text-white rounded-full py-6 text-sm font-medium transition-all"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Системээс гарах
                </Button>

                <div className="w-full space-y-4 bg-neutral-800/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Төлөв</span>
                    <span className={`${user.emailVerified ? 'text-green-400' : 'text-amber-400'} font-medium`}>
                      {user.emailVerified ? 'Баталгаажсан' : 'Баталгаажаагүй'}
                    </span>
                  </div>
                  <div className="h-px bg-neutral-800 w-full"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Гишүүнчлэл эхэлсэн</span>
                    <span className="text-white font-medium">
                      {user.metadata.creationTime &&
                        new Date(user.metadata.creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-medium text-white mb-8">Хяналтын самбар</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                <Link href="/account/profile" className="block">
                  <div className="bg-gradient-to-br from-purple-900/40 to-purple-600/10 border border-purple-800/30 p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-purple-500/20 p-3 rounded-xl">
                        <UserIcon className="h-6 w-6 text-purple-400" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mt-4">Хувийн мэдээлэл</h3>
                    <p className="text-neutral-400 text-sm mt-1">Профайлаа засах</p>
                  </div>
                </Link>
                
                <Link href="/account/orders" className="block">
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-600/10 border border-blue-800/30 p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-blue-500/20 p-3 rounded-xl">
                        <ShoppingBag className="h-6 w-6 text-blue-400" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mt-4">Захиалгууд</h3>
                    <p className="text-neutral-400 text-sm mt-1">Захиалгын түүх</p>
                  </div>
                </Link>
                
                <Link href="/account/payment" className="block">
                  <div className="bg-gradient-to-br from-green-900/40 to-green-600/10 border border-green-800/30 p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-green-500/20 p-3 rounded-xl">
                        <CreditCard className="h-6 w-6 text-green-400" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mt-4">Төлбөр</h3>
                    <p className="text-neutral-400 text-sm mt-1">Төлбөрийн аргууд</p>
                  </div>
                </Link>
                
                <Link href="/account/settings" className="block">
                  <div className="bg-gradient-to-br from-orange-900/40 to-orange-600/10 border border-orange-800/30 p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-orange-500/20 p-3 rounded-xl">
                        <Settings className="h-6 w-6 text-orange-400" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-neutral-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mt-4">Тохиргоо</h3>
                    <p className="text-neutral-400 text-sm mt-1">Дансны тохиргоо</p>
                  </div>
                </Link>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white">Дансны мэдээлэл</h3>
                  <p className="text-neutral-400">
                    Дансны хувийн мэдээллийг удирдана уу
                  </p>
                </div>

                <div className="bg-neutral-800/30 rounded-2xl overflow-hidden border border-neutral-800/50">
                  <div className="flex items-center justify-between p-5 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800/50">
                    <div className="flex items-center">
                      <div className="bg-neutral-700/50 p-2 rounded-full mr-4">
                        <Mail className="h-5 w-5 text-neutral-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Имэйл хаяг</p>
                        <p className="text-sm text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-neutral-700/50 rounded-full"
                      onClick={() => setShowEmailModal(true)}
                    >
                      Солих <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-5 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800/50">
                    <div className="flex items-center">
                      <div className="bg-neutral-700/50 p-2 rounded-full mr-4">
                        <Lock className="h-5 w-5 text-neutral-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Нууц үг</p>
                        <p className="text-sm text-neutral-400">Сүүлд өөрчилсөн: 2 сарын өмнө</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-neutral-700/50 rounded-full"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Солих <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-5 hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center">
                      <div className="bg-neutral-700/50 p-2 rounded-full mr-4">
                        <HelpCircle className="h-5 w-5 text-neutral-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Тусламж</p>
                        <p className="text-sm text-neutral-400">Дансны тусламж авах</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-400 hover:text-purple-300 hover:bg-neutral-700/50 rounded-full"
                    >
                      Холбоо барих <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-neutral-400">
                  Тусламж хэрэгтэй юу?{' '}
                  <Link href="/support" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Дэмжлэгийн багтай холбогдох
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">Нууц үг солих</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Одоогийн нууц үг
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Шинэ нууц үг
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Шинэ нууц үг баталгаажуулах
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="bg-neutral-800 border-neutral-700 text-white pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={updating}
                >
                  Цуцлах
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={updating}
                >
                  {updating ? 'Солиж байна...' : 'Солих'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-white">Имэйл хаяг солих</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmailModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Шинэ имэйл хаяг
                </label>
                <Input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Одоогийн нууц үг
                </label>
                <Input
                  type="password"
                  value={emailForm.currentPassword}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Одоогийн нууц үгээ оруулна уу"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
                  onClick={() => setShowEmailModal(false)}
                  disabled={updating}
                >
                  Цуцлах
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={updating}
                >
                  {updating ? 'Солиж байна...' : 'Солих'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        body {
          background-color: black;
        }
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
          animation-fill-mode: both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          animation-fill-mode: both;
        }
        /* Improve font rendering */
        body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  )
}

export default AccountPage