'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, GoogleAuthProvider, FacebookAuthProvider } from '../../../../firebaseConfig'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import Logo from '../../../../../public/images/Saint.svg'
import Image from 'next/image'
import { FirebaseError } from 'firebase/app'
import Icons from '../../../../components/global/icons'
import { toast, Toaster } from 'sonner'

const SignUpPage = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      toast.error('Бүх талбарыг бөглөнө үү')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Нууц үг таарахгүй байна')
      return
    }

    setIsLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      toast.success('Амжилттай бүртгүүллээ!')
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Signup failed:', error)
        toast.error(`Бүртгэл амжилтгүй: ${error.message}`)
      } else {
        console.error('An unknown error occurred:', error)
        toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success('Google-ээр амжилттай бүртгүүллээ!')
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error('Google-ээр бүртгүүлэх амжилтгүй. Дахин оролдоно уу.')
      } else {
        toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    setIsLoading(true)
    try {
      const provider = new FacebookAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success('Facebook-ээр амжилттай бүртгүүллээ!')
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error('Facebook-ээр бүртгүүлэх амжилтгүй. Дахин оролдоно уу.')
      } else {
        toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gradient-to-b from-neutral-900 to-black">
      <Toaster position="bottom-right" richColors className="z-50" />

      {/* Left Side (Branding) */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black opacity-80"></div>
        <div className="relative z-10 max-w-md flex flex-col items-center">
          <Image 
            src={Logo} 
            alt="Saint Logo" 
            width={120} 
            height={120} 
            className="mb-8" 
          />
          <h1 className="text-5xl font-light text-white tracking-tight mb-4 text-center">
            Join us<br />today.
          </h1>
          <p className="text-neutral-400 text-lg text-center leading-relaxed">
            Create your account and discover our exclusive products and services.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Right Side (Signup Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10">
          <div className="flex justify-center mb-6 lg:hidden">
            <Image src={Logo} alt="Saint Logo" width={80} height={80} />
          </div>
          
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Бүртгүүлэх</h2>
          <p className="text-neutral-500 mb-8">Шинэ данс үүсгэх</p>
          
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">И-мэйл</label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl py-3 px-4 text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
            
            {/* Username Input */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Хэрэглэгчийн нэр</label>
              <Input
                id="username"
                type="text"
                placeholder="Хэрэглэгчийн нэр"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl py-3 px-4 text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
            
            {/* Password Input */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Нууц үг</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl py-3 px-4 text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
            
            {/* Confirm Password Input */}
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Нууц үг баталгаажуулах</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl py-3 px-4 text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
            
            {/* SignUp Button */}
            <Button
              onClick={handleSignUp}
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all duration-300 disabled:opacity-70 mt-4"
            >
              {isLoading ? 'Бүртгэж байна...' : 'Бүртгүүлэх'}
            </Button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="mx-4 text-neutral-400 text-sm">эсвэл</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* Social SignUp Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full bg-white text-neutral-800 font-medium py-3 rounded-xl transition-all border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center gap-2"
              >
                <Icons.gmail className="h-5 w-5" />
                <span>Google-ээр бүртгүүлэх</span>
              </Button>
              
              <Button
                onClick={handleFacebookSignUp}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Icons.Facebook className="h-5 w-5" />
                <span>Facebook-ээр бүртгүүлэх</span>
              </Button>
            </div>
          </div>
          
          {/* Login Link */}
          <p className="text-center mt-8 text-neutral-500">
            Аль хэдийн бүртгүүлсэн үү?{' '}
            <a href="/auth/login" className="text-neutral-900 hover:underline transition-colors font-medium">
              Нэвтрэх
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage