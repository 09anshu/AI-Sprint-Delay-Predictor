import { NavLink } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineFolder, HiOutlineLightningBolt, HiOutlineSparkles, HiOutlineChartBar, HiOutlineDatabase, HiOutlineCog, HiOutlineClipboardList } from 'react-icons/hi';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { to: '/users', label: 'Users', icon: HiOutlineUsers },
  { to: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { to: '/sprints', label: 'Sprints', icon: HiOutlineLightningBolt },
  { to: '/predictions', label: 'Predictions', icon: HiOutlineSparkles },
  { to: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { to: '/database', label: 'Database', icon: HiOutlineDatabase },
  { to: '/settings', label: 'Settings', icon: HiOutlineCog },
  { to: '/logs', label: 'Logs', icon: HiOutlineClipboardList },
];

const Sidebar = () => (
  <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-40 hidden lg:flex flex-col">
    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
          <HiOutlineSparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white">Admin Panel</h1>
          <p className="text-[11px] text-slate-500">AI Sprint Predictor</p>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {nav.map(item => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'}`}>
          <item.icon className="w-5 h-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
      <p className="text-[11px] text-slate-400 text-center">v1.0 · Admin Panel</p>
    </div>
  </aside>
);

export default Sidebar;
