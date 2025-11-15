'use client';
import { useEffect, useState, useRef } from 'react';
import { auth } from '@/firebaseConfig'; // Assuming this path is correct for your Firebase setup
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ArrowRight, User as UserIcon, LogOut, Copy, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createPortal } from 'react-dom'; // Import createPortal for the dropdown

const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null); 
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: 60,
        right: window.innerWidth - rect.right
      });
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(false);
        });
      });
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      setTimeout(() => {
        toast.success('Амжилттай гарлаа');
        setIsOpen(false);
        setIsSigningOut(false);
      }, 700);
    } catch (err) {
      toast.error('Гарахад алдаа гарлаа. Дахин оролдоно уу.');
      console.error('Sign out error:', err);
      setIsSigningOut(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  const handleProfileClick = () => {
    router.push('/account');
    setIsOpen(false);
  };

  const handleEditProfile = () => {
    router.push('/account/edit');
    setIsOpen(false);
  };

  const handleCopyProfileLink = () => {
    if (user?.uid) {
      const profileLink = `${window.location.origin}/profile/${user.uid}`;
      const tempInput = document.createElement('input');
      tempInput.value = profileLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      toast.success('Профайлын холбоос хуулагдлаа');
      setIsOpen(false);
    } else {
      toast.error('Профайлын холбоос олдсонгүй.');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Профайл', icon: UserIcon, onClick: handleProfileClick },
    { id: 'edit', label: 'Профайл засах', icon: Edit, onClick: handleEditProfile },
    { id: 'copy-link', label: 'Favorites', icon: Copy, onClick: handleCopyProfileLink },
  ];

  const dropdownMenuContent = (
    <div
      ref={dropdownRef}
      className={`fixed z-[1000] w-56 rounded-4xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen && !isAnimating
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-90 pointer-events-none'
      }`}
      style={{
        top: dropdownPosition.top,
        right: dropdownPosition.right,
        background: 'rgba(15, 15, 15, 0.85)',
        backdropFilter: 'blur(32px) saturate(120%) brightness(1.05)',
        WebkitBackdropFilter: 'blur(32px) saturate(120%) brightness(1.05)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: `
          0 32px 80px rgba(0, 0, 0, 0.5),
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 0 1px rgba(255, 255, 255, 0.05)
        `,
        transformOrigin: 'top right'
      }}
    >
      <div className="p-3">
        <div className="space-y-1 mt-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group text-white"
                style={{
                  background: hoveredItem === item.id
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'transparent',
                  backdropFilter: hoveredItem === item.id ? 'blur(20px)' : 'none',
                  WebkitBackdropFilter: hoveredItem === item.id ? 'blur(20px)' : 'none',
                  boxShadow: hoveredItem === item.id 
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)'
                    : 'none'
                }}
              >
                <Icon className={`w-5 h-5 opacity-90 transition-all duration-200 ${
                  hoveredItem === item.id ? 'scale-110 opacity-100' : ''
                }`} />
                <span className="flex-1 text-left text-sm font-medium tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
          
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3" />

          <button
            onClick={handleSignOut}
            onMouseEnter={() => setHoveredItem('sign-out')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group text-red-400 hover:text-red-300"
            style={{
              background: hoveredItem === 'sign-out'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'transparent',
              backdropFilter: hoveredItem === 'sign-out' ? 'blur(20px)' : 'none',
              WebkitBackdropFilter: hoveredItem === 'sign-out' ? 'blur(20px)' : 'none',
              boxShadow: hoveredItem === 'sign-out' 
                ? 'inset 0 1px 0 rgba(239, 68, 68, 0.1), 0 4px 12px rgba(239, 68, 68, 0.1)'
                : 'none'
            }}
            disabled={isSigningOut}
          >
            <div className="flex items-center justify-center w-5 h-5">
              {isSigningOut ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <LogOut className={`w-4 h-4 opacity-90 transition-all duration-200 ${
                  hoveredItem === 'sign-out' ? 'scale-110 opacity-100' : ''
                }`} />
              )}
            </div>
            <span className="flex-1 text-left text-sm font-medium tracking-wide">
              {isSigningOut ? 'Гарах...' : 'Гарах'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center font-sans">
      {user ? (
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="relative group focus:outline-none flex items-center justify-center"
          >
            <div className="relative">
              <div
                className={`h-9 w-9 items-center rounded-full overflow-hidden transition-all duration-300 ease-out ${
                  isOpen ? 'scale-110 ring-2 ring-white/20' : 'hover:scale-105'
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(40px) saturate(200%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: isOpen 
                    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 255, 255, 0.1)'
                    : '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </button>

          {(isOpen || isAnimating) && createPortal(dropdownMenuContent, document.body)}
        </div>
      ) : (
        <button
          className="group relative overflow-hidden transition-all bg-white text-black duration-300 items-center hover:scale-105 focus:outline-none"
          onClick={handleSignIn}
          style={{
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            padding: '6px 10px'
          }}
        >
          <div className="flex items-center gap-1 text-black font-medium text-sm relative z-10">
            Нэвтрэх
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 hidden lg:block" />
          </div>
          <div
            className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          />
        </button>
      )}
    </div>
  );
};

export default AuthButton;