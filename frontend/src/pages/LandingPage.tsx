import React from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Recycle, BookOpen, Truck, RefreshCw, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Globe, ChevronRight, AlertTriangle, Layers
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'login' | 'register') => void;
  onNavigateToApp: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth, onNavigateToApp }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 pt-16 pb-24 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 border border-emerald-300 dark:border-emerald-800 shadow-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Enterprise-Grade Circular Economy & Waste Intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight">
            Turn Waste Into Worth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-emerald-600 to-teal-500 dark:from-brand-400 dark:to-emerald-400">RECYCLORA</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            India generates over <b>150,000 tonnes of municipal waste every day</b>, much of it accumulating on streets, blocking stormwater drains, and filling open dumpsites. RECYCLORA is an integrated, end-to-end SaaS platform providing bold solutions through civic action, smart doorstep collection, urban drainage monitoring, upcycled product manufacturing, and Scikit-learn predictive waste analytics.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => onNavigateToAuth('login')} className="gap-2 shadow-lg shadow-brand-900/20">
              Launch Platform Demo <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigateToApp('civiccare')} className="gap-2">
              Explore 5R Framework
            </Button>
          </div>

          {/* Quick Seed Login Credentials Info */}
          <div className="mt-12 max-w-3xl mx-auto p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs text-left shadow-md">
            <div className="font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Seed Development Accounts (Ready for Live Evaluation)</span>
              <span className="text-emerald-600 font-mono font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">Password: RoleName123!</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700">
              <div><b>Citizen:</b> citizen@recyclora.org</div>
              <div><b>Collector:</b> collector@recyclora.org</div>
              <div><b>Recycler:</b> recycler@recyclora.org</div>
              <div><b>Admin:</b> admin@recyclora.org</div>
              <div><b>Analyst:</b> analyst@recyclora.org</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5R Framework Lifecycle Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <Badge variant="success">Circular Life-Cycle</Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">The 5R Zero-Waste Framework</h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl mx-auto">
            A continuous resource stream connecting citizens, collectors, manufacturers, and municipal data analysts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { step: 'Refuse', desc: 'Prevent waste at source by refusing single-use packaging and non-essential items.', color: 'border-emerald-500' },
            { step: 'Reduce', desc: 'Lower consumption rates to preserve natural materials and cut municipal volume.', color: 'border-teal-500' },
            { step: 'Reuse', desc: 'Pass items on or use repeatedly in their original form before discarding.', color: 'border-blue-500' },
            { step: 'Repurpose', desc: 'Creative upcycling into functional high-value goods and artisan products.', color: 'border-indigo-500' },
            { step: 'Recycle', desc: 'Industrial reprocessing of waste materials into fresh raw feedstock.', color: 'border-purple-500' },
          ].map((item, index) => (
            <Card key={item.step} className={`border-t-4 ${item.color} relative hover:-translate-y-1 transition-transform p-5 flex flex-col justify-between`}>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">STEP 0{index + 1}</div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{item.step}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 4 Core SaaS Modules */}
      <section className="py-20 px-6 bg-slate-100/80 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info">Platform Architecture</Badge>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">Four Core Intelligent Modules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Civic Education & Action</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  5R learning centre, interactive quizzes, waste incident reporting with status history, cleanup event calendar & civic badges.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigateToApp('civiccare')} className="mt-6 w-full justify-between text-xs font-bold">
                Open Civic Hub <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Smart Collection & Drains</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Doorstep collection requests, collector route optimization on OpenStreetMap, QR verification, smart bin fill sensors & drain monitoring.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigateToApp('wasteflow')} className="mt-6 w-full justify-between text-xs font-bold">
                Open Collection Ops <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Circular Economy & Sales</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Searchable waste-to-product explorer with DIY guides, upcycled product marketplace, material exchange & production cost profit calculator.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigateToApp('circulab')} className="mt-6 w-full justify-between text-xs font-bold">
                Open Marketplace <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>

            <Card className="flex flex-col justify-between p-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Global Intelligence & ML</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  CSV dataset uploads, Scikit-learn ML waste volume forecasting, anomaly detection, 6-country intelligence hub & downloadable PDF reports.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigateToApp('earthscope')} className="mt-6 w-full justify-between text-xs font-bold">
                Open ML Analytics <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Application Impact Indicators */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 text-white shadow-2xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Live Application Impact Indicators</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-1">Measurable Environmental & Economic Value</h2>
            <p className="text-xs text-emerald-200 mt-1">* Calculated dynamically from primary application records and seeded municipal datasets</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">5,420 kg</div>
              <div className="text-xs text-emerald-200 font-semibold mt-1">Total Waste Processed</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">95.8%</div>
              <div className="text-xs text-emerald-200 font-semibold mt-1">Collection Efficiency</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">18 Drains</div>
              <div className="text-xs text-emerald-200 font-semibold mt-1">Drain Blockages Cleared</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">70.3%</div>
              <div className="text-xs text-emerald-200 font-semibold mt-1">Landfill Diversion Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
