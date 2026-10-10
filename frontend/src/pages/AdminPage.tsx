import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, AuditLogOut } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Shield, Users, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

export const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogOut[]>([]);
  const [sysMetrics, setSysMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [uRes, aRes, mRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
        api.get('/admin/system-metrics')
      ]);
      setUsers(uRes.data);
      setAuditLogs(aRes.data);
      setSysMetrics(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.put(`/admin/users/${userId}/role?new_role=${newRole}`);
      showToast(`User role successfully updated to ${newRole}`, 'success');
      fetchAdminData();
    } catch (e) {
      console.error(e);
      showToast('Could not update role', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          {t('admin_portal_title')}
        </h2>
        <p className="text-xs text-slate-500">
          {t('admin_portal_sub')}
        </p>
      </div>

      {sysMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{t('system_status')}</div>
              <div className="text-sm font-extrabold text-emerald-600">{sysMetrics.status}</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{t('total_users')}</div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">{sysMetrics.active_users_count}</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{t('total_reports')}</div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">{sysMetrics.total_waste_reports}</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{t('marketplace_items')}</div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">{sysMetrics.marketplace_products_count}</div>
            </div>
          </Card>
        </div>
      )}

      {/* User Management */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          {t('user_role_mgmt')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                <th className="pb-3 font-semibold">{t('full_name')}</th>
                <th className="pb-3 font-semibold">{t('email')}</th>
                <th className="pb-3 font-semibold">{t('current_role')}</th>
                <th className="pb-3 font-semibold">{t('assigned_area')}</th>
                <th className="pb-3 font-semibold">{t('change_role')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                  <td className="py-3 text-slate-500 font-mono">{u.email}</td>
                  <td className="py-3"><Badge variant="info">{u.role.toUpperCase()}</Badge></td>
                  <td className="py-3 text-slate-500">{u.area}</td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="citizen">{t('citizen')}</option>
                      <option value="collector">{t('collector')}</option>
                      <option value="recycler">{t('recycler')}</option>
                      <option value="administrator">{t('administrator')}</option>
                      <option value="analyst">{t('analyst')}</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

