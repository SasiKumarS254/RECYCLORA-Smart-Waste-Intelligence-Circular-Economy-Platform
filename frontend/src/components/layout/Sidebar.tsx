import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard, BookOpen, Truck, RefreshCw, BarChart3, Shield, UserCheck, X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}) => {
  const { user, login } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', key: 'dashboard', icon: LayoutDashboard },
    { id: 'civiccare', key: 'civiccare', badge: '5R & Reporting', icon: BookOpen },
    { id: 'wasteflow', key: 'wasteflow', badge: 'Pickups & Bins', icon: Truck },
    { id: 'circulab', key: 'circulab', badge: 'Upcycling & Sales', icon: RefreshCw },
    { id: 'earthscope', key: 'earthscope', badge: 'Big Data & ML', icon: BarChart3 },
    { id: 'admin', key: 'admin', roleGuard: ['administrator'], icon: Shield },
  ];

  const handleRoleSwitch = async (role: string) => {
    const credentials: Record<string, { email: string; pass: string }> = {
      citizen: { email: 'citizen@recyclora.org', pass: 'Citizen123!' },
      collector: { email: 'collector@recyclora.org', pass: 'Collector123!' },
      recycler: { email: 'recycler@recyclora.org', pass: 'Recycler123!' },
      administrator: { email: 'admin@recyclora.org', pass: 'Admin123!' },
      analyst: { email: 'analyst@recyclora.org', pass: 'Analyst123!' },
    };
    if (credentials[role]) {
      await login(credentials[role].email, credentials[role].pass);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-800 to-emerald-500 flex items-center justify-center text-white font-black shadow-md">
              R
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">RECYCLORA</h2>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Intelligent Waste SaaS</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.roleGuard && (!user || !item.roleGuard.includes(user.role))) {
              return null;
            }
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex flex-col items-start px-3.5 py-3 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-brand-800 text-white shadow-lg shadow-brand-900/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2.5 font-bold text-xs">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="leading-snug">{t(item.key)}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Role Switcher Box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> {t('live_role_test') || 'Live Role Authorization Test:'}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {['citizen', 'collector', 'recycler', 'administrator', 'analyst'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`px-2 py-1.5 text-[10px] font-bold rounded-lg border transition-colors capitalize text-center ${
                  user?.role === r
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                }`}
              >
                {r === 'administrator' ? 'Admin' : r}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
