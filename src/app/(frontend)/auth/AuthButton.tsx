'use client';
import { useEffect, useState, useRef } from 'react';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ArrowRight, User as UserIcon, LogOut, Copy, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false); // New state for sign out loading
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true); // Start loading
    try {
      await signOut(auth);
      // Introduce a slight artificial delay for better UX
      setTimeout(() => {
        toast.success('Амжилттай гарлаа');
        setIsOpen(false);
        setIsSigningOut(false); // End loading after delay
      }, 700); // Adjust delay as needed (e.g., 500ms to 1000ms)
    } catch (err) {
      toast.error('Гарахад алдаа гарлаа. Дахин оролдоно уу.');
      console.error('Sign out error:', err);
      setIsSigningOut(false); // End loading on error
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleAccountClick = () => {
    router.push('/account');
    setIsOpen(false);
  };

  const handleCopyProfileLink = () => {
    // Add your copy profile link logic here
    document.execCommand('copy', false, window.location.origin + '/profile/' + user?.uid); // Using document.execCommand for iFrame compatibility
    toast.success('Профайлын холбоос хуулагдлаа');
    setIsOpen(false);
  };

  const handleEditProfile = () => {
    // Add your edit profile logic here
    router.push('/profile/edit');
    setIsOpen(false);
  };

  const menuItems = [
    { id: 'account', label: 'Миний данс', icon: UserIcon, onClick: handleAccountClick },
    { id: 'copy-link', label: 'Профайл холбоос хуулах', icon: Copy, onClick: handleCopyProfileLink },
    { id: 'edit', label: 'Профайл засах', icon: Edit, onClick: handleEditProfile },
    { id: 'sign-out', label: 'Гарах', icon: LogOut, onClick: handleSignOut, danger: true },
  ];

  return (
    <div className="flex items-center">
      {user ? (
        <div className="relative" ref={dropdownRef}>
          {/* Avatar Trigger */}
          <button onClick={() => setIsOpen(!isOpen)} className="relative group focus:outline-none flex items-center justify-center">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-white border-2 border-white/20 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-neutral-700">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-300" />
            </div>
          </button>
          {/* Dropdown Menu */}
          <div
            className={`absolute top-full right-0 mt-2 w-56 transition-all duration-300 ease-out transform-gpu z-50 ${
              isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
            }`}
          >
            <div className="relative">
              {/* Enhanced backdrop blur with Apple-style glass effect */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(80px) saturate(180%) brightness(0.8)',
                  WebkitBackdropFilter: 'blur(80px) saturate(180%) brightness(0.8)',
                }}
              />
              {/* Enhanced border with subtle glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/20 to-white/5 p-[1px]">
                <div
                  className="w-full h-full rounded-3xl"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(80px) saturate(180%) brightness(0.8)',
                    WebkitBackdropFilter: 'blur(80px) saturate(180%) brightness(0.8)',
                  }}
                />
              </div>
              {/* Menu content */}
              <div className="relative z-10 py-4 px-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group ${
                        hoveredItem === item.id ? 'bg-white/20 transform scale-[1.02] shadow-lg' : 'hover:bg-white/10'
                      } ${item.danger ? 'text-red-400' : 'text-white'}`}
                      disabled={isSigningOut && item.id === 'sign-out'} // Disable logout button while signing out
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 transition-all duration-200 ${
                          hoveredItem === item.id ? 'scale-110' : ''
                        }`}
                      >
                        {isSigningOut && item.id === 'sign-out' ? (
                          <svg className="animate-spin h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Icon className={`w-4 h-4 ${item.danger ? 'text-red-400' : 'text-white'}`} />
                        )}
                      </div>
                      <span className="flex-1 text-left text-sm font-medium tracking-wide">
                        {isSigningOut && item.id === 'sign-out' ? 'Гарах...' : item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Enhanced inner shadow for depth */}
              <div
                className="absolute inset-0 rounded-3xl shadow-inner pointer-events-none"
                style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), inset 0 -2px 8px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <button className="rounded-full bg-white text-black shadow-lg hover:shadow-md hover:scale-[1.02] transition-all duration-300 px-4 py-2 text-sm font-medium flex items-center gap-2" onClick={handleSignIn}>
          Нэвтрэх
          <ArrowRight className="w-4 h-4 hidden lg:block" />
        </button>
      )}
    </div>
  );
};

export default AuthButton;
