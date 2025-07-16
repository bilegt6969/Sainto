'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  AuthError,
  UserCredential,
  AuthProvider,
  OAuthCredential,
} from '../../../../firebaseConfig';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'email' | 'google' | 'facebook' | null>(null);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [linkingData, setLinkingData] = useState<{ pendingCred: OAuthCredential; email: string; existingMethods: string[] } | null>(null);

  const router = useRouter();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error('И-мэйл, нууц үг болон нууц үгээ баталгаажуулна уу.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Нууц үгнүүд таарахгүй байна. Дахин шалгана уу.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');

    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Email/Password signup successful:', user);
      toast.success('Амжилттай бүртгүүллээ!');
      router.push('/');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Email/Password signup error:', authError);
      let errorMessage = 'Бүртгүүлэхэд алдаа гарлаа. Дахиад оролдоно уу.';

      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Энэ и-мэйл хаяг аль хэдийн бүртгэлтэй байна. Нэвтэрнэ үү.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'И-мэйл хаяг буруу байна.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Нууц үг хэтэрхий сул байна. Хамгийн багадаа 6 тэмдэгт оруулна уу.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'И-мэйл/Нууц үгээр бүртгүүлэх боломжгүй байна. Системийн админтай холбогдоно уу.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Интернэт холболтоо шалгаад дахиад оролдоно уу.';
          break;
        default:
          errorMessage = 'Бүртгүүлэхэд алдаа гарлаа. Дахиад оролдоно уу.';
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

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
          errorMessage = 'Нэвтрэх цонхыг хаасан байна. Дахиад оролдоно уу.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Хөтөч цонхыг хаасан байна. Pop-up-г зөвшөөрч дахиад оролдоно уу.';
          break;
        case 'auth/credential-already-in-use':
          errorMessage = 'Энэ бүртгэл аль хэдийн холбогдсон байна.';
          break;
        case 'auth/provider-already-linked':
          errorMessage = 'Энэ нэвтрэх арга аль хэдийн холбогдсон байна.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Интернэт холболтоо шалгаад дахиад оролдоно уу.';
          break;
        default:
          errorMessage = 'Бүртгэл холбоход алдаа гарлаа. Дахиад оролдоно уу.';
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
      console.log(`${providerName} signup/login successful:`, user);
      toast.success(`${providerName === 'google' ? 'Google' : 'Facebook'}-ээр амжилттай бүртгүүллээ/нэвтэрлээ!`);
      router.push('/');
    } catch (error) {
      const authError = error as AuthError & { customData?: { email?: string } };
      console.error(`${providerName} signup/login error:`, authError);

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
                errorMessage = 'Интернэт холболтоо шалгаад дахиад оролдоно уу.';
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
        toast.error('Хөтөч нэвтрэх цонхыг хаасан байна. Pop-up цонхыг зөвшөөрч дахиад оролдоно уу.');
      } else if (authError.code === 'auth/network-request-failed') {
        toast.error('Интернэт холболтоо шалгаад дахиад оролдоно уу.');
      } else if (authError.code === 'auth/too-many-requests') {
        toast.error('Хэт олон удаа оролдсон байна. Хэсэг хүлээгээд дахиад оролдоно уу.');
      } else if (authError.code === 'auth/user-disabled') {
        toast.error('Энэ хэрэглэгчийн эрх хязгаарлагдсан байна.');
      } else {
        const friendlyProviderName = providerName.charAt(0).toUpperCase() + providerName.slice(1);
        toast.error(`${friendlyProviderName}-ээр бүртгүүлэхэд/нэвтрэхэд алдаа гарлаа. Дахиад оролдоно уу.`);
      }
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

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
    <div className="flex min-h-screen items-start justify-center pt-20 font-sans">
      {showLinkingModal && linkingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-xl font-semibold text-neutral-900">Бүртгэл холбох</h3>
            </div>
            <p className="text-neutral-600 mb-6">
              <strong>{linkingData.email}</strong> хаяг өөр нэвтрэх аргаар бүртгэлтэй байна. Та бүртгэлүүдээ холбож нэг данс болгохыг хүсэж байна уу?
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

      <div className="w-full max-w-sm mx-auto p-4 text-center">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900">Бүртгэл үүсгэх</h1>
        <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">И-мэйл хаяг</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Нууц үг</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                required
                aria-required="true"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Нууц үгийг нуух' : 'Нууц үгийг харуулах'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">Нууц үгээ баталгаажуулах</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
                required
                aria-required="true"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Нууц үгийг нуух' : 'Нууц үгийг харуулах'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !email || !password || !confirmPassword}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && loadingProvider === 'email' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Бүртгүүлэх'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Аль хэдийн бүртгэлтэй юу?{' '}
          <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">Нэвтрэх</a>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 font-medium">Эсвэл</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading && loadingProvider === 'google' ? (
              <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="20"
                height="20"
                viewBox="0 0 48 48"
              >
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            )}
            Google-ээр үргэлжлүүлэх
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading && loadingProvider === 'facebook' ? (
              <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="20"
                height="20"
                viewBox="0 0 48 48"
              >
                <linearGradient id="Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1" x1="9.993" x2="40.615" y1="9.993" y2="40.615" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#2aa4f4"></stop>
                  <stop offset="1" stopColor="#007ad9"></stop>
                </linearGradient>
                <path
                  fill="url(#Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1)"
                  d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"
                ></path>
                <path
                  fill="#fff"
                  d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"
                ></path>
              </svg>
            )}
            Facebook-ээр үргэлжлүүлэх
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500 flex justify-center space-x-4">
          <a href="/terms" className="hover:underline">Үйлчилгээний нөхцөл</a>
          <span className="text-gray-300">|</span>
          <a href="/privacy" className="hover:underline">Нууцлалын бодлого</a>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: white;
        }
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  );
};

export default SignupPage;