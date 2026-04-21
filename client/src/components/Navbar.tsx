'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/dashboard', label: '🏠 Dashboard' },
    { href: '/workouts/log', label: '➕ Log Workout' },
    { href: '/progress', label: '🏆 Records' },
  ];

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          FitTrack
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                pathname === link.href
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <UserButton />
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <UserButton />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 focus:outline-none"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-3 border-t pt-3">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium px-2 py-1 rounded hover:bg-gray-100 ${
                pathname === link.href ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}