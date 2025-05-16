
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Gift, User } from '@/components/icons'; // Using our icons.tsx

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/activities', label: 'Activity', icon: BarChart2 },
  { path: '/rewards', label: 'Rewards', icon: Gift },
  { path: '/profile', label: 'Profile', icon: User },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-eco-dark-secondary border-t border-eco-dark shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-1/4 h-full text-xs transition-colors duration-200
               ${isActive ? 'text-eco-accent' : 'text-eco-gray hover:text-eco-light'}`
            }
          >
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
