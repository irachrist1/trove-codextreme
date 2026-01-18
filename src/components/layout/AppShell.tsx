import { ReactNode, useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Trophy,
  Users,
  Rocket,
  Code2,
  Briefcase,
  Menu,
  X,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { useAuth } from '@/lib/auth'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { href: '/hackathons', label: 'Hackathons', icon: Zap, active: true },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, active: true },
  { href: '/townsquare', label: 'Townsquare', icon: Users, active: false },
  { href: '/buildathon', label: 'Buildathon', icon: Rocket, active: false },
  { href: '/power-of-code', label: 'Power of Code', icon: Code2, active: false },
  { href: '/opportunities', label: 'Opportunities', icon: Briefcase, active: false },
]

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (href: string) => location.pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-black-900)] flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-[var(--color-gray-100)] bg-[var(--color-offwhite-1)] sticky top-0 z-40">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[var(--color-black-900)] rounded-lg flex items-center justify-center">
              <span className="text-[var(--color-white)] font-bold text-sm">T</span>
            </div>
            <span className="font-semibold text-[var(--color-black-900)]">Trove</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href)
                    ? 'bg-[var(--color-offwhite-4)] text-[var(--color-black-900)]'
                    : 'text-[var(--color-black-700)] hover:text-[var(--color-black-900)] hover:bg-[var(--color-offwhite-4)]',
                  !item.active && 'opacity-60'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {!item.active && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-gray-100)] rounded text-[var(--color-gray-400)]">Soon</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Menu */}
        <div className="relative">
          {user ? (
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--color-offwhite-4)] transition-colors"
            >
              <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
            </button>
          ) : (
            <Link to="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          <AnimatePresence>
            {user && userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-[var(--color-gray-100)]">
                  <p className="font-medium text-[var(--color-black-900)]">{user.displayName}</p>
                  <p className="text-sm text-[var(--color-gray-400)]">{user.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-black-800)] hover:bg-[var(--color-offwhite-3)] hover:text-[var(--color-black-900)]"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-black-800)] hover:bg-[var(--color-offwhite-3)] hover:text-[var(--color-black-900)]"
                    onClick={async () => {
                      setUserMenuOpen(false)
                      await logout()
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--color-gray-100)] bg-[var(--color-offwhite-1)] sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-black-900)] rounded-lg flex items-center justify-center">
            <span className="text-[var(--color-white)] font-bold text-sm">T</span>
          </div>
          <span className="font-semibold text-[var(--color-black-900)]">Trove</span>
        </Link>

        <div className="flex items-center gap-2">
          {!user && (
            <Link to="/auth/login">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-black-900)]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--color-white)] border-b border-[var(--color-gray-100)] overflow-hidden"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-[var(--color-offwhite-4)] text-[var(--color-black-900)]'
                      : 'text-[var(--color-black-700)] hover:text-[var(--color-black-900)] hover:bg-[var(--color-offwhite-4)]',
                    !item.active && 'opacity-60'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {!item.active && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[var(--color-gray-100)] rounded text-[var(--color-gray-400)] ml-auto">Soon</span>
                  )}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-offwhite-1)] border-t border-[var(--color-gray-100)] px-2 py-2 z-40">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'text-[var(--color-black-900)]'
                  : 'text-[var(--color-gray-300)]'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
