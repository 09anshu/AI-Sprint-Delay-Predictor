/**
 * Sidebar.jsx — Side navigation component.
 * 
 * Provides navigation links to Dashboard, Projects, and Alert History pages.
 * Highlights the active route. Shows unread alert badge on Alert History.
 */

import { NavLink } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineFolder, 
  HiOutlineLightningBolt,
  HiOutlineBell,
} from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { to: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { to: '/alerts', label: 'Alert History', icon: HiOutlineBell },
];

const Sidebar = () => {
  const { unreadCount } = useAlerts();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-dark-900/50 backdrop-blur-xl border-r border-dark-700/50 z-40 hidden lg:block">
      <div className="flex flex-col h-full p-4">
        {/* Navigation */}
        <nav className="flex-1 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/30'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {/* Unread badge for Alert History */}
              {item.to === '/alerts' && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom card */}
        <div className="glass-card p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineLightningBolt className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-dark-200">AI Powered</span>
          </div>
          <p className="text-xs text-dark-400 leading-relaxed">
            Predict sprint delays using ML trained on 4000+ project risk records.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

