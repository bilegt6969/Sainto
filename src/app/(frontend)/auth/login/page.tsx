'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential
} from '../../../../firebaseConfig' // IMPORTANT: Adjust this path to your firebaseConfig.js file

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<'email' | 'google' | 'facebook' | null>(null);
  const [focusedField, setFocusedField] = useState('')
  const [showLinkingModal, setShowLinkingModal] = useState(false)
  const [linkingData, setLinkingData] = useState<{
    pendingCred: any,
    email: string,
    existingMethods: string[]
  } | null>(null)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('И-мэйл болон нууц үгээ оруулна уу.')
      return
    }
    
    setIsLoading(true)
    setLoadingProvider('email');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Email/Password login successful:', user);
      toast.success('Амжилттай нэвтэрлээ!');
      router.push('/'); // Or your desired page after login
    } catch (error: any) {
      console.error('Email/Password login error:', error);
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential' || // More general error for invalid email/password
          error.code === 'auth/invalid-email') {
        toast.error('И-мэйл эсвэл нууц үг буруу байна.');
      } else {
        toast.error('Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  }

  const handleAccountLinking = async (existingMethod: string) => {
    if (!linkingData) return;

    setIsLoading(true);
    try {
      if (existingMethod === 'google.com') {
        // Sign in with Google first
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        
        // Then link the Facebook credential
        await linkWithCredential(result.user, linkingData.pendingCred);
        
        toast.success('Амжилттай! Та одоо Google болон Facebook хоёуланг ашиглан нэвтэрч болно.');
        router.push('/');
        
      } else if (existingMethod === 'password') {
        // User needs to sign in with email/password first, then we can link
        toast.info('Та эхлээд и-мэйл/нууц үгээрээ нэвтэрч, дараа нь тохиргоогоос бусад аргуудыг холбоно уу.');
        setShowLinkingModal(false);
        setLinkingData(null);
        return;
      }
      
    } catch (error: any) {
      console.error('Account linking error:', error);
      
      // Better user-friendly error messages
      let errorMessage = '';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Нэвтрэх цонхыг хаасан байна. Дахин оролдоно уу.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Хөтөч цонхыг хаасан байна. Pop-up-г зөвшөөрч дахин оролдоно уу.';
          break;
        case 'auth/credential-already-in-use':
          errorMessage = 'Энэ бүртгэл аль хэдийн холбогдсон байна.';
          break;
        case 'auth/provider-already-linked':
          errorMessage = 'Энэ нэвтрэх арга аль хэдийн холбогдсон байна.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Интернэт холболтоо шалгаад дахин оролдоно уу.';
          break;
        default:
          errorMessage = 'Бүртгэл холбоход алдаа гарлаа. Дахин оролдоно уу.';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setShowLinkingModal(false);
      setLinkingData(null);
    }
  };

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setIsLoading(true);
    setLoadingProvider(providerName);
    let provider;

    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'facebook') {
      provider = new FacebookAuthProvider();
    } else {
      toast.error("Unsupported social provider");
      setIsLoading(false);
      setLoadingProvider(null);
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`${providerName} login successful:`, user);
      toast.success(`${providerName === 'google' ? 'Google' : 'Facebook'}-ээр амжилттай нэвтэрлээ!`);
      router.push('/'); // Or your desired page after login
    } catch (error: any) {
      console.error(`${providerName} login error:`, error);
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        // Handle account linking
        const email = error.customData?.email;
        const credential = FacebookAuthProvider.credentialFromError(error) || 
                          GoogleAuthProvider.credentialFromError(error);
        
        if (email && credential) {
          try {
            // Fetch existing sign-in methods for this email
            const existingMethods = await fetchSignInMethodsForEmail(auth, email);
            
            setLinkingData({
              pendingCred: credential,
              email: email,
              existingMethods: existingMethods
            });
            setShowLinkingModal(true);
            
          } catch (fetchError: any) {
            console.error('Error fetching sign-in methods:', fetchError);
            
            // Better error handling for fetching sign-in methods
            let errorMessage = '';
            switch (fetchError.code) {
              case 'auth/invalid-email':
                errorMessage = 'И-мэйл хаяг буруу байна.';
                break;
              case 'auth/network-request-failed':
                errorMessage = 'Интернэт холболтоо шалгаад дахин оролдоно уу.';
                break;
              default:
                errorMessage = 'Энэ и-мэйл хаяг өөр нэвтрэх аргаар бүртгэлтэй байна. Тухайн аргаар нэвтэрнэ үү.';
            }
            toast.error(errorMessage);
          }
        } else {
          toast.error('Энэ и-мэйл хаяг өөр нэвтрэх аргаар бүртгэлтэй байна. Тухайн аргаар нэвтэрч орно уу.');
        }
        
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Нэвтрэх цонхыг хаасан байна.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.info('Нэвтрэх хүсэлтийг цуцалсан байна.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Хөтөч нэвтрэх цонхыг хаасан байна. Pop-up цонхыг зөвшөөрч дахин оролдоно уу.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Интернэт холболтоо шалгаад дахин оролдоно уу.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Хэт олон удаа оролдсон байна. Хэсэг хүлээгээд дахин оролдоно уу.');
      } else if (error.code === 'auth/user-disabled') {
        toast.error('Энэ хэрэглэгчийн эрх хязгаарлагдсан байна.');
      } else {
        const friendlyProviderName = providerName === 'google' ? 'Google' : 'Facebook';
        toast.error(`${friendlyProviderName}-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.`);
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const getProviderDisplayName = (method: string) => {
    switch (method) {
      case 'google.com': return 'Google';
      case 'facebook.com': return 'Facebook';
      case 'password': return 'И-мэйл/Нууц үг';
      default: return method;
    }
  };

  return (
    <div className="relative my-10 inset-0 flex overflow-hidden bg-gradient-to-br from-neutral-900 via-black to-neutral-800 rounded-[2rem] border border-neutral-700">
      
      {/* Account Linking Modal */}
      {showLinkingModal && linkingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-semibold text-neutral-900">Бүртгэл холбох</h3>
            </div>
            
            <p className="text-neutral-600 mb-6">
              <strong>{linkingData.email}</strong> хаяг өөр нэвтрэх аргаар бүртгэлтэй байна. 
              Та бүртгэлүүдээ холбож нэг данс болгохыг хүсэж байна уу?
            </p>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-neutral-700">Одоо байгаа нэвтрэх аргууд:</p>
              {linkingData.existingMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {getProviderDisplayName(method)}
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLinkingModal(false);
                  setLinkingData(null);
                }}
                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-2xl hover:bg-neutral-200 transition-all font-semibold"
              >
                Цуцлах
              </button>
              
              {linkingData.existingMethods.includes('google.com') && (
                <button
                  onClick={() => handleAccountLinking('google.com')}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
                >
                  {isLoading ? 'Холбож байна...' : 'Google-тэй холбох'}
                </button>
              )}
              
              {linkingData.existingMethods.includes('password') && (
                <button
                  onClick={() => handleAccountLinking('password')}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-neutral-900 text-white rounded-2xl hover:bg-black transition-all font-semibold disabled:opacity-50"
                >
                  Нууц үгээр нэвтрэх
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-neutral-800/30 to-neutral-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-neutral-800/20 to-neutral-700/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-neutral-700/10 to-neutral-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/90 to-black/95"></div>
        
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        <div className="relative z-10 max-w-lg flex flex-col items-center text-center">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl scale-110"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl border border-neutral-700/50 shadow-2xl">
              <Image alt='logo' width={60} height={60} src="/images/logo.svg" onError={(e) => (e.currentTarget.src = 'https://placehold.co/60x60/FFFFFF/000000?text=LOGO')} className="p-1"/>
            </div>
          </div>
          
          <h1 className="text-6xl font-extralight text-white tracking-tight mb-6 leading-none">
            Simple.<br />
            <span className="text-neutral-300">Secure.</span><br />
            <span className="text-neutral-400">Seamless.</span>
          </h1>
          
          <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
            Аюулгүй нэвтрэх системээр дамжуулан хэрэглэгчийн дансандаа нэвтрэн орно уу.
          </p>
          
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-neutral-700/50 to-transparent"></div>
      </div>

      {/* Right Side - Enhanced Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 lg:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700/50 shadow-xl">
             <Image alt='logo icon' width={32} height={32} src="/images/logo.svg" onError={(e) => (e.currentTarget.src = 'https://placehold.co/32x32/FFFFFF/000000?text=S')} className="p-1"/>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="mb-8 pt-4 lg:pt-0">
                <h2 className="text-3xl font-semibold text-neutral-900 mb-2 tracking-tight">Нэвтрэх</h2>
                <p className="text-neutral-600 font-medium">Дансандаа нэвтрэн орно уу</p>
              </div>

              <form onSubmit={(e) => {e.preventDefault(); handleLogin();}} className="space-y-6">
                <div className="relative group">
                  <label htmlFor="email" className="text-sm font-semibold text-neutral-700 mb-2 block">И-мэйл</label>
                  <div className={`
                    relative bg-neutral-50/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden group-hover:bg-neutral-50
                    ${focusedField === 'email' ? 'border-neutral-900 bg-white shadow-lg shadow-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'}
                  `}>
                    <div className="flex items-center px-5 py-4">
                      <Mail className={`w-5 h-5 mr-4 transition-all duration-300 ${focusedField === 'email' ? 'text-neutral-900 scale-110' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                      <input
                        id="email"
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className="flex-1 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 font-medium text-base"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className="text-sm font-semibold text-neutral-700">Нууц үг</label>
                    <a href="/auth/forgot-password" className="text-sm text-neutral-900 hover:text-black font-semibold hover:underline transition-all">
                      Нууц үг мартсан?
                    </a>
                  </div>
                  <div className={`
                    relative bg-neutral-50/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden group-hover:bg-neutral-50
                    ${focusedField === 'password' ? 'border-neutral-900 bg-white shadow-lg shadow-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'}
                  `}>
                    <div className="flex items-center px-5 py-4">
                      <Lock className={`w-5 h-5 mr-4 transition-all duration-300 ${focusedField === 'password' ? 'text-neutral-900 scale-110' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        className="flex-1 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 font-medium text-base"
                        required
                        aria-required="true"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-4 text-neutral-400 hover:text-neutral-900 transition-all transform hover:scale-110"
                        aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-gradient-to-r from-neutral-900 to-black text-white font-semibold py-4 rounded-2xl hover:from-black hover:to-neutral-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-neutral-900/25 group transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading && loadingProvider === 'email' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Нэвтэрч байна...</span>
                    </div>
                  ) : (
                    <>
                      <span>Нэвтрэх</span>
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-6 bg-white/90 text-neutral-500 font-semibold backdrop-blur-sm rounded-full">эсвэл</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full bg-white/90 backdrop-blur-sm border-2 border-neutral-200 text-neutral-800 font-semibold py-4 rounded-2xl hover:border-neutral-300 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group transform hover:scale-[1.01]"
                  aria-label="Google-ээр нэвтрэх"
                >
                  {isLoading && loadingProvider === 'google' ? (
                     <div className="w-5 h-5 border-2 border-neutral-400/30 border-t-neutral-600 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span>Google-ээр нэвтрэх</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-600/25 group transform hover:scale-[1.01]"
                  aria-label="Facebook-ээр нэвтрэх"
                >
                  {isLoading && loadingProvider === 'facebook' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  <span>Facebook-ээр нэвтрэх</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-neutral-300 font-medium">
              Шинэ хэрэглэгч?{' '}
              <a href="/auth/signup" className="text-white hover:text-neutral-200 font-semibold hover:underline transition-all">
                Энд бүртгүүлнэ үү
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage