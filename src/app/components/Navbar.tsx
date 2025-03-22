'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_CATEGORIES } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
  return (
    <nav className="bg-gray-900 p-4 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          Media Stream
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link 
            href="/" 
            className={`text-gray-300 hover:text-white transition ${
              pathname === '/' ? 'text-white font-medium' : ''
            }`}
          >
            Home
          </Link>
          
          {ALL_CATEGORIES.map(category => (
            <Link 
              key={category.id}
              href={`/${category.id}`}
              className={`text-gray-300 hover:text-white transition ${
                pathname === `/${category.id}` ? 'text-white font-medium' : ''
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
        
        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-300 hover:text-white"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef} 
          className="md:hidden mt-2 py-2 bg-gray-800 rounded-lg shadow-lg absolute left-4 right-4 z-20"
        >
          <Link 
            href="/" 
            className={`block px-4 py-2 ${
              pathname === '/' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Home
          </Link>
          
          {ALL_CATEGORIES.map(category => (
            <Link 
              key={category.id}
              href={`/${category.id}`}
              className={`block px-4 py-2 ${
                pathname === `/${category.id}` ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}