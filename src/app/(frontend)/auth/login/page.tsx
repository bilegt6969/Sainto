'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  AuthError,
  UserCredential,
  AuthProvider,
  OAuthCredential,
  sendPasswordResetEmail,
} from '../../../../firebaseConfig';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'email' | 'google' | 'facebook' | null>(null);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [linkingData, setLinkingData] = useState<{ pendingCred: OAuthCredential; email: string; existingMethods: string[] } | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const router = useRouter();

  /**
   * Handles email/password login.
   */
  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('И-мэйл болон нууц үгээ оруулна уу.');
      return;
    }
    setIsLoading(true);
    setLoadingProvider('email');
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Email/Password login successful:', user);
      toast.success('Амжилттай нэвтэрлээ!');
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Email/Password login error:', authError);
      if (
        authError.code === 'auth/user-not-found' ||
        authError.code === 'auth/wrong-password' ||
        authError.code === 'auth/invalid-credential' ||
        authError.code === 'auth/invalid-email'
      ) {
        toast.error('И-мэйл эсвэл нууц үг буруу байна.');
      } else {
        toast.error('Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.');
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  /**
   * Handles account linking when a user tries to sign in with a social provider
   * but their email is already registered with a different method.
   * @param existingMethod The method already linked to the email (e.g., 'google.com', 'password').
   */
  const handleAccountLinking = async (existingMethod: string) => {
    if (!linkingData) return;
    setIsLoading(true);
    try {
      if (existingMethod === 'google.com') {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        await linkWithCredential(result.user, linkingData.pendingCred);
        toast.success('Амжилттай! Та одоо Google болон Facebook хоёулангаас нь ашиглан нэвтэрч болно.');
        router.push('/');
      } else if (existingMethod === 'password') {
        toast.info('Та эхлээд и-мэйл/нууц үгээрээ нэвтэрч, дараань тохиргооноос бусад аргуудыг холбоно уу.');
        setShowLinkingModal(false);
        setLinkingData(null);
        return;
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('Account linking error:', authError);
      let errorMessage = '';
      switch (authError.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Нэвтрэх цонхыг хаасан байна. Дахин оролдоно уу.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Хөтөч цонхыг хаасан байна. Pop-up-г зөвшөөрч дахин оролдону уу.';
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

  /**
   * Handles social media logins (Google, Facebook).
   * @param providerName The name of the social provider ('google' or 'facebook').
   */
  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setIsLoading(true);
    setLoadingProvider(providerName);
    let provider: AuthProvider | null = null;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'facebook') {
      provider = new FacebookAuthProvider();
    } else {
      toast.error('Unsupported social provider');
      setIsLoading(false);
      setLoadingProvider(null);
      return;
    }

    try {
      const result: UserCredential = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`${providerName} login successful:`, user);
      toast.success(`${providerName === 'google' ? 'Google' : 'Facebook'}-ээр амжилттай нэвтэрлээ!`);
      router.push('/');
    } catch (error) {
      const authError = error as AuthError & { customData?: { email?: string } };
      console.error(`${providerName} login error:`, authError);
      if (authError.code === 'auth/account-exists-with-different-credential') {
        const email = authError.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(authError) || FacebookAuthProvider.credentialFromError(authError);
        if (email && credential) {
          try {
            const existingMethods = await fetchSignInMethodsForEmail(auth, email);
            setLinkingData({ pendingCred: credential, email: email, existingMethods: existingMethods });
            setShowLinkingModal(true);
          } catch (fetchError) {
            const fetchAuthError = fetchError as AuthError;
            console.error('Error fetching sign-in methods:', fetchAuthError);
            let errorMessage = '';
            switch (fetchAuthError.code) {
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
      } else if (authError.code === 'auth/popup-closed-by-user') {
        toast.info('Нэвтрэх цонхыг хаасан байна.');
      } else if (authError.code === 'auth/cancelled-popup-request') {
        toast.info('Нэвтрэх хүсэлтийг цуцалсан байна.');
      } else if (authError.code === 'auth/popup-blocked') {
        toast.error('Хөтөч нэвтрэх цонхыг хаасан байна. Pop-up цонхыг зөвшөөрч дахин оролдоно уу.');
      } else if (authError.code === 'auth/network-request-failed') {
        toast.error('Интернэт холболтоо шалгаад дахин оролдоно уу.');
      } else if (authError.code === 'auth/too-many-requests') {
        toast.error('Хэт олон удаа оролдсон байна. Хэсэг хүлээгээд дахин оролдоно уу.');
      } else if (authError.code === 'auth/user-disabled') {
        toast.error('Энэ хэрэглэгчийн эрх хязгаарлагдсан байна.');
      } else {
        const friendlyProviderName = providerName.charAt(0).toUpperCase() + providerName.slice(1);
        toast.error(`${friendlyProviderName}-ээр нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.`);
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  /**
   * Handles sending a password reset email.
   */
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast.error('И-мэйл хаягаа оруулна уу.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      toast.success('Нууц үг сэргээх холбоосыг таны и-мэйл рүү илгээлээ. Спам хавтсыг шалгахаа мартуузай!');
      setShowForgotPasswordModal(false);
      setForgotPasswordEmail('');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Password reset error:', authError);
      let errorMessage = '';
      switch (authError.code) {
        case 'auth/invalid-email':
          errorMessage = 'Буруу и-мэйл хаяг байна.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Энэ и-мэйл хаягаар бүртгэл олдсонгүй.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Интернэт холболтоо шалгаад дахин оролдоно уу.';
          break;
        default:
          errorMessage = 'Нууц үг сэргээхэд алдаа гарлаа. Дахин оролдоно уу.';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Returns a user-friendly display name for a Firebase authentication method.
   * @param method The Firebase authentication method string (e.g., 'google.com', 'password').
   * @returns A user-friendly string.
   */
  const getProviderDisplayName = (method: string) => {
    switch (method) {
      case 'google.com':
        return 'Google';
      case 'facebook.com':
        return 'Facebook';
      case 'password':
        return 'И-мэйл/Нууц үг';
      default:
        return method;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-[#111111] text-white">
      {/* Account Linking Modal */}
      {showLinkingModal && linkingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-neutral-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-neutral-700/20">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-semibold text-white">Бүртгэл холбох</h3>
            </div>
            <p className="text-neutral-300 mb-6">
              <strong>{linkingData.email}</strong> хаяг өөр нэвтрэх аргаар бүртгэлтэй байна. Та бүртгэлүүдээ холбож нэг данс болгохыг хүсэж байна уу?
            </p>
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-neutral-200">Одоо байгаа нэвтрэх аргууд:</p>
              {linkingData.existingMethods.map((method, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-300">
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
                className="flex-1 px-4 py-3 bg-neutral-700 text-neutral-100 rounded-2xl hover:bg-neutral-600 transition-all font-semibold"
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

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-neutral-800/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-neutral-700/20">
            <h3 className="text-xl font-semibold text-white mb-6">Нууц үг сэргээх</h3>
            <p className="text-neutral-300 mb-6">
              Бүртгэлтэй и-мэйл хаягаа оруулна уу. Таны и-мэйл хаяг руу нууц үг сэргээх холбоос илгээнэ.
            </p>
            <div className="mb-6">
              <label htmlFor="forgot-password-email" className="block text-sm font-medium text-neutral-300 mb-1">
                И-мэйл хаяг
              </label>
              <input
                type="email"
                id="forgot-password-email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-600 rounded-full bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordEmail('');
                }}
                className="flex-1 px-4 py-3 bg-neutral-700 text-neutral-100 rounded-2xl hover:bg-neutral-600 transition-all font-semibold"
              >
                Буцах
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isLoading || !forgotPasswordEmail}
                className="flex-1 px-4 py-3 bg-black text-white rounded-full hover:bg-neutral-800 transition-all font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Илгээж байна...' : 'Илгээх'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Content - Divided into two halves */}
      <div className="flex w-full min-h-screen  bg-white">
        {/* Left Half: Background Image */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://cdn.cosmos.so/80454657-d214-4739-9bfc-5a74e0b1855c?format=jpeg")' }} // <--- IMPORTANT: Replace with your image path
        >
          
        </div>

        {/* Right Half: Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-[#111111]">
          <div className="w-full max-w-sm mx-auto text-center">
            <h1 className="text-3xl font-semibold mb-8 text-white">нэвтрэх</h1>

            <div className="mb-6 text-left">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
                И-мэйл хаяг
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-600 rounded-full bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4 text-left">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                  Нууц үг
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-600 rounded-full bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                    aria-required="true"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-200 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="text-right text-neutral-400 mt-2 text-sm">
                  <a
                    href="#"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="font-medium underline hover:text-neutral-300"
                  >
                    Нууц үгээ мартсан уу?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base cursor-pointer font-medium text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && loadingProvider === 'email' ? (
                  <div className="w-4 h-4 border-2 border-gray-500/30 border-t-gray-700 rounded-full animate-spin"></div>
                ) : (
                  'үргэлжлүүлэх'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-400 mt-6">
              Эсвэл бүртгэл байхгүй юу?{' '}
              <a href="/auth/signup" className="font-medium underline hover:text-neutral-300">
                Бүртгүүлэх
              </a>
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#111111] text-neutral-400 font-medium">эсвэл</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                // Updated Tailwind CSS classes for Google button
                className="relative rounded-full h-11 text-base font-bold px-4 bg-transparent text-white
                           shadow-inset-1 border border-neutral-600 hover:bg-neutral-700 active:bg-neutral-700
                           hover:border-neutral-500 active:border-neutral-500
                           focus-visible:ring-4 focus-visible:ring-[hsl(var(--blue-60)/50%)] cursor-pointer transition-colors ease-out
                           w-full flex items-center justify-center gap-x-2"
              >
                {isLoading && loadingProvider === 'google' ? (
                  <div className="w-4 h-4 border-2 border-neutral-400/30 border-t-neutral-100 rounded-full animate-spin"></div>
                ) : (
                  // Google SVG as provided by the user
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <g clipPath="url(#clip0_9_516)">
                      <path d="M19.8052 10.2304C19.8052 9.55059 19.7501 8.86714 19.6325 8.19839H10.2002V12.0492H15.6016C15.3775 13.2912 14.6573 14.3898 13.6027 15.088V17.5866H16.8252C18.7176 15.8449 19.8052 13.2728 19.8052 10.2304Z" fill="#4285F4"></path>
                      <path d="M10.1999 20.0007C12.897 20.0007 15.1714 19.1151 16.8286 17.5866L13.6061 15.0879C12.7096 15.6979 11.5521 16.0433 10.2036 16.0433C7.59474 16.0433 5.38272 14.2832 4.58904 11.9169H1.26367V14.4927C2.96127 17.8695 6.41892 20.0007 10.1999 20.0007V20.0007Z" fill="#34A853"></path>
                      <path d="M4.58565 11.9169C4.16676 10.675 4.16676 9.33011 4.58565 8.08814V5.51236H1.26395C-0.154389 8.33801 -0.154389 11.6671 1.26395 14.4927L4.58565 11.9169V11.9169Z" fill="#FBBC04"></path>
                      <path d="M10.1999 3.95805C11.6256 3.936 13.0035 4.47247 14.036 5.45722L16.8911 2.60218C15.0833 0.904587 12.6838 -0.0287217 10.1999 0.000673888C6.41892 0.000673888 2.96127 2.13185 1.26367 5.51234L4.58537 8.08813C5.37538 5.71811 7.59107 3.95805 10.1999 3.95805V3.95805Z" fill="#EA4335"></path>
                    </g>
                    <defs>
                      <clipPath id="clip0_9_516">
                        <rect width="20" height="20" fill="white"></rect>
                      </clipPath>
                    </defs>
                  </svg>
                )}
                <span className="truncate">Google-ээр үргэлжлүүлэх</span>
              </button>

              {/* Facebook Button (styled similarly) */}
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                // Updated Tailwind CSS classes for Facebook button
                className="relative rounded-full h-11 text-base font-bold px-4 bg-transparent text-white
                           shadow-inset-1 border border-neutral-600 hover:bg-neutral-700 active:bg-neutral-700
                           hover:border-neutral-500 active:border-neutral-500
                           focus-visible:ring-4 focus-visible:ring-[hsl(var(--blue-60)/50%)] cursor-pointer transition-colors ease-out
                           w-full flex items-center justify-center gap-x-2"
              >
                {isLoading && loadingProvider === 'facebook' ? (
                  <div className="w-4 h-4 border-2 border-neutral-400/30 border-t-neutral-100 rounded-full animate-spin"></div>
                ) : (
                  // Facebook SVG
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                    <linearGradient id="Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2aa4f4"></stop><stop offset="1" stopColor="#007ad9"></stop></linearGradient><path fill="url(#Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1)" d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"></path><path fill="#fff" d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"></path>
                  </svg>
                )}
                <span className="truncate">Facebook-ээр үргэлжлүүлэх</span>
              </button>
            </div>

            <div className="mt-12 text-sm text-neutral-400 flex justify-center">
  <p className="text-center">
    Үргэлжлүүлснээр та SAINTO-ийн&nbsp;
    <a href="/terms" className="underline hover:text-neutral-300">
      Үйлчилгээний Нөхцөл
    </a>
    &nbsp;-ийг зөвшөөрч буй болно.
  </p>
</div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #111111; /* Ensuring the body background is black */
        }
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Custom inset shadow for dark mode, mimic the provided button's shadow */
        .shadow-inset-1 {
            box-shadow: inset 0 0 0 1px var(--tw-shadow-color);
            --tw-shadow-color: rgba(64, 64, 64, 0.5); /* neutral-600 with some transparency */
        }
      `}</style>
    </div>
  );
};

export default LoginPage;