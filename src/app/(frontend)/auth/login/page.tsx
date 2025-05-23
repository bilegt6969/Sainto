'use client'

import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth'
import { auth } from '../../../../firebaseConfig'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import Logo from '../../../../../public/images/Saint.svg'
import Image from 'next/image'
import { FirebaseError } from 'firebase/app'
import Icons from '../../../../components/global/icons'
import { toast, Toaster } from 'sonner'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('И-мэйл болон нууц үгээ оруулна уу.')
      return
    }
    
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Амжилттай нэвтэрлээ!')
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error('Login failed:', error)
        toast.error('Нэвтрэх амжилтгүй. Нууц үг, и-мэйлээ шалгана уу.')
      } else {
        console.error('An unknown error occurred:', error)
        toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success('Google-ээр амжилттай нэвтэрлээ!')
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error('Google-ээр нэвтрэх амжилтгүй. Дахин оролдоно уу.')
      } else {
        toast.error('Алдаа гарлаа. Дахин оролдоно уу.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookLogin = async () => {
    setIsLoading(true)
    try {
      const provider = new FacebookAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success('Facebook-ээр амжилттай нэвтэрлээ!')
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast.error('Facebook-ээр нэвтрэх амжилтгүй. Дахин оролдоно уу.')
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
            Simple.<br />Secure.<br />Seamless.
          </h1>
          <p className="text-neutral-400 text-lg text-center leading-relaxed">
            Аюулгүй нэвтрэх системээр дамжуулан хэрэглэгчийн дансандаа нэвтрэн орно уу.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Right Side (Login Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 md:p-10">
          <div className="flex justify-center mb-6 lg:hidden">
            <Image src={Logo} alt="Saint Logo" width={80} height={80} />
          </div>
          
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Нэвтрэх</h2>
          <p className="text-neutral-500 mb-8">Дансандаа нэвтрэн орно уу</p>
          
          <div className="space-y-5">
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
            
            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-neutral-700">Нууц үг</label>
                <a href="/auth/forgot-password" className="text-xs text-neutral-900 hover:underline transition-colors">
                  Нууц үг мартсан?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-xl py-3 px-4 text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
            </div>
            
            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white font-medium py-3 rounded-xl hover:bg-black transition-all duration-300 disabled:opacity-70"
            >
              {isLoading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </Button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="mx-4 text-neutral-400 text-sm">эсвэл</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white text-neutral-800 font-medium py-3 rounded-xl transition-all border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center gap-2"
              >
                <Icons.gmail className="h-5 w-5" />
                <span>Google-ээр нэвтрэх</span>
              </Button>
              
              <Button
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Icons.Facebook className="h-5 w-5" />
                <span>Facebook-ээр нэвтрэх</span>
              </Button>
            </div>
          </div>
          
          {/* Sign-Up Link */}
          <p className="text-center mt-8 text-neutral-500">
            Шинэ хэрэглэгч?{' '}
            <a href="/auth/signup" className="text-neutral-900 hover:underline transition-colors font-medium">
              Энд бүртгүүлнэ үү
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage