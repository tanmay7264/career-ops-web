'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, List, Zap, Inbox, FileText, Settings, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: List },
  { href: '/evaluate', label: 'Evaluate JD', icon: Zap, badge: 'New' },
  { href: '/pipeline', label: 'Pipeline', icon: Inbox },
  { href: '/reports', label: 'Reports', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 flex-shrink-0 bg-[#1a1a2e] text-white flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-base font-bold tracking-tight">
          career<span className="text-indigo-400">ops</span>
        </span>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 mt-2">
        {navItems.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/[0.08] hover:text-white'
            )}
          >
            <Icon size={15} />
            <span>{label}</span>
            {badge && (
              <span className="ml-auto text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <Settings size={15} /> Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
