import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, X, FileText, Truck, ShoppingBag, BookOpen, Globe } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const timer = setTimeout(() => performSearch(), 250);
      return () => clearTimeout(timer);
    } else {
      setResults(null);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports, pickups, products, learning modules, country profiles..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center text-xs text-slate-400">Searching RECYCLORA index...</div>
          )}

          {!loading && !results && query.length < 2 && (
            <div className="p-6 text-center text-xs text-slate-400">
              Type at least 2 characters to search across reports, products, guides & analytics.
            </div>
          )}

          {!loading && results && (
            <div className="space-y-4">
              {results.reports?.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Waste Reports
                  </h5>
                  <div className="space-y-1">
                    {results.reports.map((item: any) => (
                      <a
                        key={item.id}
                        href={item.link}
                        onClick={onClose}
                        className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {results.products?.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" /> Recycled Marketplace
                  </h5>
                  <div className="space-y-1">
                    {results.products.map((item: any) => (
                      <a
                        key={item.id}
                        href={item.link}
                        onClick={onClose}
                        className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-emerald-600 font-medium">{item.subtitle}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {results.countries?.length > 0 && (
                <div>
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Global Waste Intelligence
                  </h5>
                  <div className="space-y-1">
                    {results.countries.map((item: any) => (
                      <a
                        key={item.id}
                        href={item.link}
                        onClick={onClose}
                        className="block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                      >
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.subtitle}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
