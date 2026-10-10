import React from 'react';
import { Recycle, ShieldCheck, Globe2, Award, Heart, BarChart3, Truck, RefreshCw, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 py-10 px-6 mt-16 transition-all">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Upper Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80 text-xs">
          {/* Col 1: Platform Identity */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-800 to-emerald-500 flex items-center justify-center text-white font-extrabold shadow-md">
                <Recycle className="w-4 h-4 animate-spin-slow" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">RECYCLORA</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Cloud-Based Intelligent Waste Management, Segregation, Doorstep Pickups & Circular Economy Analytics SaaS for India.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold text-[11px]">
              <Globe2 className="w-3.5 h-3.5" /> 12 Indian Regional Languages Supported
            </div>
          </div>

          {/* Col 2: Core Platform Modules */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform Operations</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> CivicCare (5R Education & Incident Reporting)
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                <Truck className="w-3.5 h-3.5 text-teal-500" /> WasteFlow (Pickups & Smart Bin IoT)
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> CircuLab (DIY Blueprints & Marketplace)
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer">
                <BarChart3 className="w-3.5 h-3.5 text-purple-500" /> EarthScope (Scikit-Learn ML Analytics)
              </li>
            </ul>
          </div>

          {/* Col 3: Key Frameworks & Standards */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Standards & Intelligence</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 5R Waste Hierarchy (Refuse, Reduce, Reuse, Repurpose, Recycle)
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> 6-Country International Techniques Comparison
              </li>
              <li className="flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-blue-400" /> OpenStreetMap & Leaflet Interactive Maps
              </li>
            </ul>
          </div>

          {/* Col 4: Technology Stack */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Tech Stack Specifications</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Built with React, TypeScript, Tailwind CSS, Python FastAPI, PostgreSQL, SQLAlchemy ORM, Pandas, and Scikit-Learn ML Forecasting.
            </p>
          </div>
        </div>

        {/* Lower Footer Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2">
          <div>
            © 2026 RECYCLORA SaaS Platform. All Rights Reserved. Dedicated to India's Clean Urban Vision.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">System Status: Active (100% Operational)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
