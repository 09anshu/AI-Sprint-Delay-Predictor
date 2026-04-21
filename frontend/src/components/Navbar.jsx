/**
 * Navbar.jsx — Top navigation bar component.
 * 
 * Shows app branding, user info, and logout button.
 * Only visible when authenticated.
 */

import { useAuth } from '../context/AuthContext';
import { HiOutlineLogout, HiOutlineBell, HiOutlineSparkles } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
            <HiOutlineSparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">AI Sprint Predictor</h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-colors">
            <HiOutlineBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500"></span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 pl-4 border-l border-dark-700">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-dark-200">{user?.name || 'User'}</p>
              <p className="text-xs text-dark-500">{user?.email || ''}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <HiOutlineLogout className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
