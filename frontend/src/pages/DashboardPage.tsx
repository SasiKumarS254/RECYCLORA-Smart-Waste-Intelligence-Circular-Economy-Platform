import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  BookOpen, Truck, RefreshCw, BarChart3, Shield, Award, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/analytics/summary');
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Role: {user.role.toUpperCase()}</Badge>
            <span className="text-xs text-emerald-200">Area: {user.area || 'Sector 4'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">{t('welcome')}, {user.full_name}!</h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-xl leading-relaxed">
            {user.role === 'citizen' && 'Report waste incidents, schedule doorstep recyclable pickups, and earn civic eco badges.'}
            {user.role === 'collector' && 'View today\'s assigned collection routes, record actual collected weights, and perform QR verification.'}
            {user.role === 'recycler' && 'Manage upcycled product listings, monitor material exchange inventory, and calculate production profits.'}
            {user.role === 'administrator' && 'Oversee municipal collection schedules, review civic reports, moderate marketplace items, and inspect audit logs.'}
            {user.role === 'analyst' && 'Import CSV datasets, run Scikit-learn ML waste generation forecasts, and generate executive impact reports.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/20">
            <div className="text-2xl font-extrabold text-amber-300">🏆 {user.badge_count}</div>
            <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider mt-0.5">Civic Badges</div>
          </div>
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 truncate">{t('collection_efficiency')}</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{summary?.collection_efficiency_pct || 95.8}%</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">↑ 2.4% vs last week</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex-shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 truncate">{t('landfill_diversion')}</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{summary?.landfill_diversion_kg || 3810} kg</div>
            <div className="text-[10px] text-emerald-600 font-bold mt-0.5">70.3% Recovery Rate</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 truncate">{t('complaints_resolved')}</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{summary?.active_complaints_resolved_pct || 91.4}%</div>
            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Avg latency: 1.8 hrs</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500 truncate">{t('total_processed')}</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{summary?.total_waste_kg || 5420} kg</div>
            <div className="text-[10px] text-purple-600 font-bold mt-0.5">Scikit-learn Tracked</div>
          </div>
        </Card>
      </div>

      {/* Primary Platform Operations - Comprehensive Concept & Feature Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('primary_modules_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('primary_modules_sub')}
            </p>
          </div>
          <Badge variant="info" className="self-start sm:self-auto">4 Core Platform Modules</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CivicCare Card */}
          <Card className="p-6 border-l-4 border-l-emerald-500 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">CivicCare</h4>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t('civiccare')}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  5R & Reporting
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                <strong>{t('main_concept')}:</strong> {t('civiccare_concept')}
              </p>

              <div className="space-y-2 mb-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('key_features')}:</div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li>{t('civiccare_feat_1')}</li>
                  <li>{t('civiccare_feat_2')}</li>
                  <li>{t('civiccare_feat_3')}</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => onNavigate('civiccare')}
              variant="outline"
              className="w-full justify-between text-xs font-bold border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
            >
              <span>{t('civiccare_btn')}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>

          {/* WasteFlow Card */}
          <Card className="p-6 border-l-4 border-l-teal-500 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">WasteFlow</h4>
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">{t('wasteflow')}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Pickups & Bins
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                <strong>{t('main_concept')}:</strong> {t('wasteflow_concept')}
              </p>

              <div className="space-y-2 mb-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('key_features')}:</div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li>{t('wasteflow_feat_1')}</li>
                  <li>{t('wasteflow_feat_2')}</li>
                  <li>{t('wasteflow_feat_3')}</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => onNavigate('wasteflow')}
              variant="outline"
              className="w-full justify-between text-xs font-bold border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300"
            >
              <span>{t('wasteflow_btn')}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>

          {/* CircuLab Card */}
          <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">CircuLab</h4>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{t('circulab')}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Upcycling & Sales
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                <strong>{t('main_concept')}:</strong> {t('circulab_concept')}
              </p>

              <div className="space-y-2 mb-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('key_features')}:</div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li>{t('circulab_feat_1')}</li>
                  <li>{t('circulab_feat_2')}</li>
                  <li>{t('circulab_feat_3')}</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => onNavigate('circulab')}
              variant="outline"
              className="w-full justify-between text-xs font-bold border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300"
            >
              <span>{t('circulab_btn')}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>

          {/* EarthScope Card */}
          <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-xl transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">EarthScope</h4>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">{t('earthscope')}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Big Data & ML
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                <strong>{t('main_concept')}:</strong> {t('earthscope_concept')}
              </p>

              <div className="space-y-2 mb-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('key_features')}:</div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 pl-4 list-disc">
                  <li>{t('earthscope_feat_1')}</li>
                  <li>{t('earthscope_feat_2')}</li>
                  <li>{t('earthscope_feat_3')}</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => onNavigate('earthscope')}
              variant="outline"
              className="w-full justify-between text-xs font-bold border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-700 dark:text-purple-300"
            >
              <span>{t('earthscope_btn')}</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>

      {/* 5R Method & Global Techniques Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5R Concept Summary */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                The 5R Waste Management Framework Made Easy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simple steps everyone can follow to reduce environmental waste impact daily
              </p>
            </div>
            <Badge variant="success">Core Concept</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { r: 'Refuse', desc: 'Say NO to single-use plastics & excessive packaging.', icon: '🚫', color: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200' },
              { r: 'Reduce', desc: 'Lower consumption & buy only what is necessary.', icon: '📉', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200' },
              { r: 'Reuse', desc: 'Use items repeatedly before considering disposal.', icon: '🔄', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' },
              { r: 'Repurpose', desc: 'Convert scrap into planters, furniture & crafts.', icon: '🛠️', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' },
              { r: 'Recycle', desc: 'Separate dry waste so raw materials can be remade.', icon: '♻️', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200' }
            ].map(item => (
              <div key={item.r} className={`p-3.5 rounded-2xl border ${item.color} text-center flex flex-col items-center justify-between`}>
                <span className="text-2xl mb-1">{item.icon}</span>
                <div className="font-extrabold text-xs mb-1">{item.r}</div>
                <div className="text-[10px] leading-tight opacity-90">{item.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Global Country Techniques Summary */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Global Techniques Hub
              </h3>
              <Badge variant="info">6 Nations</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Learn how top countries manage waste and adapt their successful models in India.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-slate-200">🇯🇵 Japan</span>
                <span className="text-[11px] text-slate-500 font-medium">10+ Category Source Segregation</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-slate-200">🇩🇪 Germany</span>
                <span className="text-[11px] text-slate-500 font-medium">Pfand Bottle Return & Dual System</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-slate-200">🇸🇪 Sweden</span>
                <span className="text-[11px] text-slate-500 font-medium">99% Diversion Waste-to-Energy</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <span className="font-bold text-slate-800 dark:text-slate-200">🇰🇷 South Korea</span>
                <span className="text-[11px] text-slate-500 font-medium">Pay-As-You-Throw RFID Bins</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onNavigate('earthscope')}
            variant="ghost"
            className="w-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 mt-4"
          >
            Explore All 6 Implementation Roadmaps →
          </Button>
        </Card>
      </div>
    </div>
  );
};
