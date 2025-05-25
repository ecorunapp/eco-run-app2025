
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Activity, Award, Gift, User, Zap } from '@/components/icons'; // Added Award
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/activities', label: 'Track', icon: Activity },
  { path: '/challenges', label: 'Challenges', icon: Award }, // Added Challenges
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/ecotab-details', label: 'Ecotab', icon: Zap },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-top-md z-50">
      <div className="max-w-screen-md mx-auto grid grid-cols-6">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-primary transition-colors duration-200 group",
                isActive && "text-primary"
              )}
            >
              <item.icon size={24} className={cn("mb-0.5 group-hover:scale-110 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-xs font-medium", isActive && "font-semibold")}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

