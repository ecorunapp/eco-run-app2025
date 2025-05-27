import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Zap, Gift, User } from 'lucide-react'; // Removed Users icon

const BottomNav = () => {
  const location = useLocation();
  const navItems = [{
    path: '/',
    label: 'Home',
    icon: Home
  }, {
    path: '/activities',
    label: 'Activities',
    icon: Zap
  },
  // { path: '/meet-and-run', label: 'Meet & Run', icon: Users }, // Removed this line
  {
    path: '/rewards',
    label: 'Rewards',
    icon: Gift
  }, {
    path: '/profile',
    label: 'Profile',
    icon: User
  }];
  return <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 shadow-top-md z-50 bg-gray-900">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map(item => {
        const isActive = location.pathname === item.path || item.path === '/' && location.pathname.startsWith('/dashboard');
        return <Link key={item.label} to={item.path} className={`flex flex-col items-center justify-center text-sm transition-colors duration-200 ease-in-out p-2 rounded-md
                ${isActive ? 'text-purple-600 scale-110' : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50'}`} style={{
          minWidth: '60px'
        }} // Ensure items have enough space
        >
              <item.icon className={`h-6 w-6 mb-0.5 transition-transform duration-200 ease-in-out ${isActive ? 'transform scale-110' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </Link>;
      })}
      </div>
    </nav>;
};
export default BottomNav;