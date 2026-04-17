'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const pathname = usePathname();

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

        <div className="flex items-center gap-6">
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
      </div>
    </nav>
  );
}