'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertTriangle } from 'lucide-react'
import Image from 'next/image' // Or use <img> if not using Next.js Image optimization
import { useRouter } from 'next/navigation' // For Next.js App Router
import { toast } from 'sonner' // Assuming 'sonner' is installed and configured
import type { AuthCredential } from 'firebase/auth';

// Firebase imports - Adjust path if your firebaseConfig.js is elsewhere
import {
  auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword, // Ensure this is correctly imported
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from '../../../../firebaseConfig' // IMPORTANT: Ensure this path is correct

// Type definitions
type SocialProvider = 'google' | 'facebook'
type SignInMethod = 'password' | 'google.com' | 'facebook.com' // Add other providers if you use them

const SignUpPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | 'email' | null>(null)
  const [focusedField, setFocusedField] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()

  // State for account linking flow
  const [showAccountLinkPrompt, setShowAccountLinkPrompt] = useState(false)
  const [pendingCredential, setPendingCredential] = useState<AuthCredential | null>(null)
  const [linkingEmail, setLinkingEmail] = useState('')
  const [existingSignInMethods, setExistingSignInMethods] = useState<string[]>([])
  const [passwordForLinking, setPasswordForLinking] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // --- Standard Email/Password SignUp ---
  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Бүх талбарыг бөглөнө үү')
      return
    }
    if (!acceptedTerms) {
      toast.error('Үйлчилгээний нөхцөлийг зөвшөөрнө үү')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Нууц үг таарахгүй байна')
      return
    }
    if (password.length < 8) {
      toast.error('Нууц үг хамгийн багадаа 8 тэмдэгтээс бүрдсэн байх ёстой')
      return
    }

    setIsLoading(true)
    setLoadingProvider('email')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      console.log('User created with email/password:', userCredential.user)
      setIsLoading(false)
      setLoadingProvider(null)
      toast.success('Амжилттай бүртгүүллээ!')
      router.push('/') // Or your desired page after signup
    } catch (error: any) {
      setIsLoading(false)
      setLoadingProvider(null)
      console.error("Email/Password SignUp Error:", error)
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Энэ и-мэйл хаяг бүртгэлтэй байна.')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Нууц үг сул байна. Илүү хүчтэй нууц үг сонгоно уу.')
      } else {
        toast.error('Бүртгүүлэхэд алдаа гарлаа. Дахин оролдоно уу.')
      }
    }
  }

  // --- Social SignUp (Google, Facebook) ---
// --- Social SignUp (Google, Facebook) ---
const handleSocialSignUp = async (providerName: SocialProvider) => {
  setIsLoading(true)
  setLoadingProvider(providerName)
  let provider
  if (providerName === 'google') {
    provider = new GoogleAuthProvider()
  } else if (providerName === 'facebook') {
    provider = new FacebookAuthProvider()
  } else {
    setIsLoading(false)
    setLoadingProvider(null)
    toast.error("Unsupported social provider")
    return
  }

  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log(`${providerName} User:`, user)
    setIsLoading(false)
    setLoadingProvider(null)
    toast.success(`${providerName}-ээр амжилттай нэвтэрлээ!`)
    router.push('/')
  } catch (error: any) {
    setIsLoading(false)
    setLoadingProvider(null)
    console.error(`${providerName} SignUp Error:`, error)
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email;
      
      toast.error('Энэ имэйл хаяг өөр нэвтрэх аргаар бүртгэгдсэн байна', {
        description: 'Та өмнө нь ашигласан нэвтрэх аргаар нэвтэрнэ үү',
        action: {
          label: 'Нэвтрэх хуудас руу шилжих',
          onClick: () => router.push('/auth/login')
        },
        duration: 10000
      });
      
      // Automatically redirect to login page after showing the notification
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }  else if (error.code === 'auth/popup-closed-by-user') {
      toast.info('Нэвтрэх цонхыг хаалаа.')
    } else if (error.code === 'auth/auth-domain-config-required') {
      toast.error('Facebook нэвтрэлтийн тохиргоо дутуу байна (authDomain).')
    } else if (error.code === 'auth/cancelled-popup-request') {
      toast.info('Нэвтрэх хүсэлтийг цуцалсан.')
    } else if (error.code === 'auth/operation-not-allowed') {
      toast.error(`${providerName} нэвтрэлтийг Firebase дээр идэвхжүүлээгүй байна.`)
    } else if (error.code === 'auth/popup-blocked') {
      toast.error('Нэвтрэх цонхыг хөтөч хаасан байна. Pop-up-г зөвшөөрнө үү.')
    } else {
      toast.error(`${providerName}-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.`)
    }
  }
}

  // --- Account Linking Logic ---
  const handleSignInToLink = async (method: SignInMethod) => {
    if (!linkingEmail) {
      toast.error("Холбох и-мэйл олдсонгүй.");
      return;
    }
    setIsLinking(true);
    try {
      let userToLink = auth.currentUser;

      if (!userToLink) {
        // If not already signed in, sign in with the chosen existing method
        if (method === 'password') {
          // User needs to sign in with password first to link.
          // We will redirect them to the login page.
          toast.info("Бүртгэлээ холбохын тулд эхлээд нэвтэрнэ үү. Таныг нэвтрэх хуудас руу шилжүүлж байна.");
          setIsLinking(false); // Reset linking state
          setShowAccountLinkPrompt(false); // Hide the prompt
          setPendingCredential(null); // Clear pending credential
          setLinkingEmail(''); // Clear linking email
          router.push('/auth/login'); // Redirect to login page
          return; // Stop further execution in this function
        } else if (method === 'google.com' || method === 'facebook.com') {
          const provider = method === 'google.com' ? new GoogleAuthProvider() : new FacebookAuthProvider();
          provider.setCustomParameters({ login_hint: linkingEmail }); // Pre-fill email
          const result = await signInWithPopup(auth, provider);
          userToLink = result.user;
        }
      }

      if (userToLink && pendingCredential) {
        await linkWithCredential(userToLink, pendingCredential);
        toast.success("Бүртгэлийг амжилттай холболоо!");
        setShowAccountLinkPrompt(false);
        setPendingCredential(null);
        setLinkingEmail('');
        setExistingSignInMethods([]);
        router.push('/');
      } else if (!userToLink) {
        // This case should ideally be handled by the logic above if method was 'password'
        // or if signInWithPopup failed for social providers.
        toast.error("Холбохын тулд эхлээд нэвтэрнэ үү.");
      }
    } catch (error: any) {
      console.error("Account Linking Error:", error);
      if (error.code === 'auth/credential-already-in-use') {
        toast.error("Энэ нэвтрэх арга таны өөр бүртгэлд холбогдсон байна.");
      } else if (error.code === 'auth/provider-already-linked') {
        toast.info("Энэ нэвтрэх арга аль хэдийн холбогдсон байна.");
        setShowAccountLinkPrompt(false); // Already linked, proceed
        router.push('/');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error("Аюулгүй байдлын үүднээс дахин нэвтэрнэ үү.");
        // Handle re-authentication if needed
      } else {
        toast.error("Бүртгэлийг холбоход алдаа гарлаа.");
      }
    } finally {
      setIsLinking(false);
    }
  };

  const getProviderName = (methodId: string): string => {
    if (methodId === 'password') return 'Нууц үг';
    if (methodId === 'google.com') return 'Google';
    if (methodId === 'facebook.com') return 'Facebook';
    return methodId;
  }

  // --- Account Linking Prompt Modal ---
  const AccountLinkPromptModal = () => {
    if (!showAccountLinkPrompt) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full relative">
          <div className="absolute -top-3 -right-3">
            <button
              onClick={() => {
                setShowAccountLinkPrompt(false);
                setPendingCredential(null);
                setLinkingEmail('');
              }}
              className="bg-neutral-700 hover:bg-neutral-800 text-white rounded-full p-2 shadow-md transition-colors"
              aria-label="Хаах"
            >
              <EyeOff className="w-5 h-5" /> {/* Using EyeOff as a close icon example */}
            </button>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-neutral-800 mb-3">Бүртгэл Холбох</h3>
            <p className="text-neutral-600 mb-1">
              <strong className="text-neutral-700">{linkingEmail}</strong> хаягаар бүртгэл аль хэдийн үүссэн байна.
            </p>
            <p className="text-neutral-600 mb-6">
              Шинэ нэвтрэх аргаа холбохын тулд одоо байгаа бүртгэлээрээ нэвтэрнэ үү:
            </p>
          </div>
          <div className="space-y-3">
            {existingSignInMethods.map((method) => (
              <button
                key={method}
                onClick={() => handleSignInToLink(method as SignInMethod)}
                disabled={isLinking}
                className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60
                  ${method === 'google.com' ? 'bg-white border-2 border-neutral-200 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50' : ''}
                  ${method === 'facebook.com' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  ${method === 'password' ? 'bg-neutral-800 text-white hover:bg-neutral-900' : ''}
                `}
              >
                {isLinking ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {method === 'google.com' && <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.72 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.72 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                    {method === 'facebook.com' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                    {method === 'password' && <Lock className="w-5 h-5" />}
                    <span>{getProviderName(method)}-ээр нэвтэрч холбох</span>
                  </>
                )}
              </button>
            ))}
            {/* Simple password input for linking - ideally this would be more robust or a separate modal */}
            {existingSignInMethods.includes('password') && (
              <div className="mt-4 p-3 border border-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-600 mb-2">Эсвэл нууц үгээр нэвтэрч холбоно уу:</p>
                <input
                  type="password"
                  value={passwordForLinking}
                  onChange={(e) => setPasswordForLinking(e.target.value)}
                  placeholder="Одоогийн нууц үгээ оруулна уу"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-neutral-900 focus:border-neutral-900"
                />
                <button
                  onClick={async () => {
                    // This is a simplified direct sign-in and link.
                    // In a real app, you might want to separate sign-in from linking calls.
                    setIsLinking(true);
                    try {
                      // IMPORTANT: User must be signed in to link.
                      // If auth.currentUser is null, this signInWithEmailAndPassword call
                      // will sign them in. Then linkWithCredential can be called.
                      const userCredential = await signInWithEmailAndPassword(auth, linkingEmail, passwordForLinking); // CORRECTED LINE
                      const signedInUser = userCredential.user; // Get user from userCredential

                      if (signedInUser && pendingCredential) {
                        await linkWithCredential(signedInUser, pendingCredential);
                        toast.success("Бүртгэлийг амжилттай холболоо!");
                        setShowAccountLinkPrompt(false);
                        setPendingCredential(null);
                        router.push('/');
                      } else {
                        toast.error("Нэвтрэлт амжилтгүй эсвэл холбох мэдээлэл дутуу.");
                      }
                    } catch (linkPassError: any) {
                      console.error("Password link error:", linkPassError);
                      if (linkPassError.code === 'auth/wrong-password' || linkPassError.code === 'auth/user-not-found' || linkPassError.code === 'auth/invalid-credential' || linkPassError.code === 'auth/invalid-email') {
                        toast.error("И-мэйл эсвэл нууц үг буруу байна.");
                      } else {
                        toast.error("Нууц үгээр холбоход алдаа гарлаа.");
                      }
                    } finally {
                      setIsLinking(false);
                      setPasswordForLinking('');
                    }
                  }}
                  disabled={isLinking || !passwordForLinking}
                  className="mt-2 w-full bg-neutral-800 text-white font-semibold py-2.5 rounded-lg hover:bg-neutral-900 transition-colors disabled:opacity-60"
                >
                  {isLinking && loadingProvider !== 'email' ? 'Холбож байна...' : 'Нууц үгээр холбох'}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setShowAccountLinkPrompt(false);
              setPendingCredential(null);
            }}
            className="w-full mt-6 text-center text-neutral-600 hover:text-neutral-800 font-medium py-2 rounded-lg transition-colors"
          >
            Цуцлах
          </button>
        </div>
      </div>
    )
  }


  return (
    <>
      <AccountLinkPromptModal />
      <div className="relative my-10 inset-0 flex overflow-hidden bg-gradient-to-br from-neutral-900 via-black to-neutral-800 rounded-[2rem] border border-neutral-700">
        {/* Background animations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-neutral-800/30 to-neutral-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-neutral-800/20 to-neutral-700/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-neutral-700/10 to-neutral-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Branding Section */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/90 to-black/95"></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`, backgroundSize: '50px 50px' }}></div>
          <div className="relative z-10 max-w-lg flex flex-col items-center text-center">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl scale-110"></div>
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl border border-neutral-700/50 shadow-2xl">
              <Image alt='logo' width="400" height="400" src="/images/logo.svg"             
/>
              </div>
            </div>
            <h1 className="text-6xl font-extralight text-white tracking-tight mb-6 leading-none">
              Welcome.<br />
              <span className="text-neutral-300">Create.</span><br />
              <span className="text-neutral-400">Connect.</span>
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
              Манай системд бүртгүүлж, өөрийн дансыг үүсгэнэ үү.
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-neutral-700/50 to-transparent"></div>
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700/50 shadow-xl">
            <Image alt='logo' width="400" height="400" src="/images/logo.svg"             
/>
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl pointer-events-none"></div>
              <div className="relative z-10">
                <div className="mb-8 pt-4 lg:pt-0">
                  <h2 className="text-3xl font-semibold text-neutral-900 mb-2 tracking-tight">Бүртгүүлэх</h2>
                  <p className="text-neutral-600 font-medium">Шинэ данс үүсгэнэ үү</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-6">
                  {/* Name Field */}
                  <div className="relative group">
                    <label htmlFor="name" className="text-sm font-semibold text-neutral-700 mb-2 block">Бүтэн нэр</label>
                    <div className={`relative bg-neutral-50/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden group-hover:bg-neutral-50 ${focusedField === 'name' ? 'border-neutral-900 bg-white shadow-lg shadow-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <div className="flex items-center px-5 py-4">
                        <User className={`w-5 h-5 mr-4 transition-all duration-300 ${focusedField === 'name' ? 'text-neutral-900 scale-110' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                        <input
                          id="name"
                          type="text"
                          placeholder="Жон Доу"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField('')}
                          className="flex-1 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 font-medium text-base"
                          aria-required="true"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="relative group">
                    <label htmlFor="email" className="text-sm font-semibold text-neutral-700 mb-2 block">И-мэйл</label>
                    <div className={`relative bg-neutral-50/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden group-hover:bg-neutral-50 ${focusedField === 'email' ? 'border-neutral-900 bg-white shadow-lg shadow-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'}`}>
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
                          aria-required="true"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <label htmlFor="password" className="text-sm font-semibold text-neutral-700 mb-2 block">Нууц үг</label>
                    <div className={`relative bg-neutral-50/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden group-hover:bg-neutral-50 ${focusedField === 'password' ? 'border-neutral-900 bg-white shadow-lg shadow-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'}`}>
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
                          aria-required="true"
                          minLength={8}
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-4 text-neutral-400 hover:text-neutral-900 transition-all transform hover:scale-110" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">Хамгийн багадаа 8 тэмдэгт агуулсан байх</p>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative group">
                    <label htmlFor="confirmPassword" className="text-sm font-semibold text-neutral-700 mb-2 block">Нууц үг давтах</label>
                    <div className={`relative bg-neutral-50/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 overflow-hidden group-hover:bg-neutral-50 ${focusedField === 'confirmPassword' ? 'border-neutral-900 bg-white shadow-lg shadow-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'}`}>
                      <div className="flex items-center px-5 py-4">
                        <Lock className={`w-5 h-5 mr-4 transition-all duration-300 ${focusedField === 'confirmPassword' ? 'text-neutral-900 scale-110' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField('')}
                          className="flex-1 bg-transparent outline-none text-neutral-900 placeholder-neutral-400 font-medium text-base"
                          aria-required="true"
                          minLength={8}
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-4 text-neutral-400 hover:text-neutral-900 transition-all transform hover:scale-110" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="focus:ring-neutral-900 h-4 w-4 text-neutral-900 border-neutral-300 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-neutral-700">
                        Би <a href="/terms" className="text-neutral-900 font-semibold hover:underline">Үйлчилгээний нөхцөл</a> болон{''}
                        <a href="/privacy" className="text-neutral-900 font-semibold hover:underline">Нууцлалын бодлого</a>-ыг зөвшөөрч байна
                      </label>
                    </div>
                  </div>

                  {/* SignUp Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !name || !email || !password || !confirmPassword || !acceptedTerms}
                    className="w-full bg-gradient-to-r from-neutral-900 to-black text-white font-semibold py-4 rounded-2xl hover:from-black hover:to-neutral-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-neutral-900/25 group transform hover:scale-[1.02] active:scale-[0.98]"
                    aria-label="Бүртгүүлэх"
                  >
                    {isLoading && loadingProvider === 'email' ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Бүртгүүлж байна...</span>
                      </div>
                    ) : (
                      <>
                        <span>Бүртгүүлэх</span>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-6 bg-white/90 text-neutral-500 font-semibold backdrop-blur-sm rounded-full">эсвэл</span>
                  </div>
                </div>

                {/* Social SignUp Buttons */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleSocialSignUp('google')}
                    disabled={isLoading}
                    className="w-full bg-white/90 backdrop-blur-sm border-2 border-neutral-200 text-neutral-800 font-semibold py-4 rounded-2xl hover:border-neutral-300 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group transform hover:scale-[1.01]"
                    aria-label="Google-ээр бүртгүүлэх"
                  >
                    {isLoading && loadingProvider === 'google' ? (
                      <div className="w-5 h-5 border-2 border-neutral-400/30 border-t-neutral-600 rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.72 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.72 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    )}
                    <span>Google-ээр бүртгүүлэх</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialSignUp('facebook')}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-600/25 group transform hover:scale-[1.01]"
                    aria-label="Facebook-ээр бүртгүүлэх"
                  >
                    {isLoading && loadingProvider === 'facebook' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    )}
                    <span>Facebook-ээр бүртгүүлэх</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-neutral-300 font-medium">
                Аль хэдийн бүртгүүлсэн үү? {''}
                <a href="/auth/login" className="text-white hover:text-neutral-200 font-semibold hover:underline transition-all">
                  Энд нэвтрэнэ үү
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignUpPage
