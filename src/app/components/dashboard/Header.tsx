// components/Header.tsx
"use client";

import { useUser } from "@/app/providers";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getUserInitials = () => {
    if (!user?.email) return "US";
    const [first, last] = user.email.split('@')[0].split(/[._]/);
    return `${first[0]}${last ? last[0] : ''}`.toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand Section - START */}
          <div className="flex items-center space-x-2">
            {/* Replace the existing <div> and <h1> with your <img> tag.
              - src: Point this to your logo file in the 'public' directory.
              - alt: Provide a descriptive alt text for accessibility.
              - className: Adjust 'h-8 w-8' (height and width) to fit your logo's dimensions.
            */}
             <Image
              src="/images/icondashboard.png" 
              alt="My Brand Name Logo"
              width={32} 
              height={32} 
              className="object-contain" 
            />
            <h1 className="text-xl font-bold text-gray-800">AnimSinc</h1> {/* Optional: Keep brand name text */}
          </div>
          {/* Logo/Brand Section - END */}

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
              Dashboard
            </Link>
            <Link href="/projects" className="text-gray-600 hover:text-gray-900 transition-colors">
              Projects
            </Link>
            <Link href="/activity" className="text-gray-600 hover:text-gray-900 transition-colors">
              Activity
            </Link>
            <Link href="/render" className="text-gray-600 hover:text-gray-900 transition-colors">
              Render Queue
            </Link>
          </nav>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {getUserInitials()}
                    </span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {user.email}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;