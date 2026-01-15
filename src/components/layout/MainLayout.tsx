import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Sparkles, MessageCircle, Star, Sun, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen flex flex-col bg-cosmic-black">
      <main className="flex-1 overflow-hidden">{children}</main>

      {/* Navigation bar - Modern sleek design */}
      <nav className="flex-shrink-0 bg-black/95 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
          {[
            { to: '/univers', icon: Sparkles, label: 'Univers' },
            { to: '/messages', icon: MessageCircle, label: 'Messages' },
            { to: '/astra', icon: Star, label: 'ASTRA' },
            { to: '/astro', icon: Sun, label: 'Astro' },
            { to: '/profile', icon: User, label: 'Profil' },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-4 py-2 transition-all duration-300 ${
                  isActive ? 'text-cosmic-red' : 'text-white/40 hover:text-white/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cosmic-red rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-cosmic-red/10 rounded-xl -z-10"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
