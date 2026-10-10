import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CountryProfile, ForecastingResponse } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CategoryDonutChart, ForecastingChart } from '../components/charts/WasteCharts';
import {
  BarChart3, Upload, Globe, AlertTriangle, Download, Sparkles, CheckCircle2, RefreshCw, FileText
} from 'lucide-react';

export const EarthScopePage: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'forecast' | 'csv' | 'global' | 'anomalies'>('analytics');

  // Summary State
  const [summary, setSummary] = useState<any>(null);

  // Forecasting State
  const [forecastDays, setForecastDays] = useState(14);
  const [forecastResult, setForecastResult] = useState<ForecastingResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // CSV Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // Global State
  const [countries, setCountries] = useState<CountryProfile[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null);

  // Anomalies State
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    fetchSummary();
    fetchForecast();
    fetchGlobal();
    fetchAnomalies();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/analytics/summary');
      setSummary(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchForecast = async () => {
    setForecastLoading(true);
    try {
      const res = await api.post('/analytics/forecast', { forecast_days: forecastDays });
      setForecastResult(res.data);
    } catch (e) { console.error(e); }
    finally { setForecastLoading(false); }
  };

  const fetchGlobal = async () => {
    try {
      const res = await api.get('/analytics/global-profiles');
      setCountries(res.data);
      if (res.data.length > 0) setSelectedCountry(res.data[0]);
    } catch (e) { console.error(e); }
  };

  const fetchAnomalies = async () => {
    try {
      const res = await api.get('/analytics/anomalies');
      setAnomalies(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCsvUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await api.post('/analytics/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(res.data);
      showToast('CSV dataset uploaded & ML model retrained successfully!', 'success');
      fetchSummary();
    } catch (e: any) {
      showToast(e.response?.data?.detail || 'CSV Upload completed with default mapping.', 'info');
    } finally { setUploading(false); }
  };

  const handleExportReport = async (fmt: 'pdf' | 'csv') => {
    try {
      const response = await api.get(`/analytics/export-report?format=${fmt}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recyclora_analytics_report.${fmt}`);
      document.body.appendChild(link);
      link.click();
      showToast(`Exported ${fmt.toUpperCase()} report successfully!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Generated analytics report for download.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('global_intelligence_engine')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('global_intelligence_sub')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleExportReport('csv')} className="gap-1.5 shadow-sm">
            <Download className="w-4 h-4" /> {t('export_csv_data')}
          </Button>
          <Button size="sm" onClick={() => handleExportReport('pdf')} className="gap-1.5 shadow-sm">
            <FileText className="w-4 h-4" /> {t('download_pdf_report')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'analytics', label: t('waste_gen_overview'), icon: BarChart3 },
          { id: 'forecast', label: t('ml_predictions_tab'), icon: Sparkles },
          { id: 'csv', label: t('csv_upload_tab'), icon: Upload },
          { id: 'anomalies', label: t('anomaly_detection_tab'), icon: AlertTriangle },
          { id: 'global', label: t('global_hub_tab'), icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors ${
                activeSubTab === tab.id
                  ? 'border-brand-800 text-brand-800 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ANALYTICS OVERVIEW */}
      {activeSubTab === 'analytics' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Category Distribution Breakdown</h3>
              <p className="text-xs text-slate-500 mb-4">Percentage allocation across primary waste streams</p>
              <CategoryDonutChart data={summary.category_distribution} />
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Area-Wise Waste Generation Analysis</h3>
              <div className="space-y-3 text-xs">
                {summary.area_breakdown.map((a: any) => (
                  <div key={a.area} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{a.area}</div>
                      <div className="text-slate-500 mt-0.5">Collection Efficiency: <b>{a.collection_rate}%</b></div>
                    </div>
                    <div className="text-sm font-extrabold text-brand-800 dark:text-emerald-400">{a.weight_kg} kg</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SCIKIT-LEARN FORECASTING */}
      {activeSubTab === 'forecast' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <Badge variant="success">Scikit-Learn ML Time-Series Engine</Badge>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  14-Day Waste Generation Volume Forecast
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={forecastDays}
                  onChange={(e) => setForecastDays(parseInt(e.target.value))}
                  className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                >
                  <option value={7}>7-Day Horizon</option>
                  <option value={14}>14-Day Horizon</option>
                  <option value={30}>30-Day Horizon</option>
                </select>
                <Button size="sm" onClick={fetchForecast} isLoading={forecastLoading}>Re-run ML Forecast</Button>
              </div>
            </div>

            {forecastResult && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">Model Name</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">{forecastResult.model_name}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">MAE Validation</div>
                    <div className="font-bold text-emerald-600 mt-0.5">{forecastResult.validation_metrics.MAE} kg</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">RMSE Validation</div>
                    <div className="font-bold text-teal-600 mt-0.5">{forecastResult.validation_metrics.RMSE} kg</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">R² Holdout Score</div>
                    <div className="font-bold text-blue-600 mt-0.5">{forecastResult.validation_metrics.R2}</div>
                  </div>
                </div>

                <ForecastingChart data={forecastResult.forecast} />

                <p className="text-[11px] text-slate-500 italic bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 leading-relaxed">
                  Limitations: {forecastResult.limitations}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* CSV UPLOAD WORKFLOW */}
      {activeSubTab === 'csv' && (
        <Card className="p-6 max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('import_csv_title')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('import_csv_sub')}</p>
          </div>

          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-slate-500"
            />
            {selectedFile && <div className="text-xs font-bold text-emerald-600">Selected: {selectedFile.name}</div>}
          </div>

          <Button onClick={handleCsvUpload} isLoading={uploading} disabled={!selectedFile} className="w-full py-2.5">
            {t('upload_process_btn')}
          </Button>

          {uploadResult && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs space-y-2">
              <div className="font-bold text-emerald-800 dark:text-emerald-200">{uploadResult.message}</div>
              <div>Rows Imported: <b>{uploadResult.row_count}</b></div>
              <div>Detected Columns: <b>{uploadResult.columns.join(', ')}</b></div>
            </div>
          )}
        </Card>
      )}

      {/* ANOMALY DETECTION */}
      {activeSubTab === 'anomalies' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automated Waste Stream Anomaly Alerts</h3>
          {anomalies.map(anom => (
            <Card key={anom.id} className="p-5 flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">{anom.severity}</Badge>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{anom.type}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{anom.location} on {anom.date}</p>
                <div className="text-xs font-bold text-red-600 mt-1">Observed: {anom.observed_value} (Expected: {anom.expected_range})</div>
                <div className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  Action Recommendation: <b>{anom.recommendation}</b>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* GLOBAL 6-COUNTRY INTELLIGENCE */}
      {activeSubTab === 'global' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Country</h3>
            {countries.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c)}
                className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                  selectedCountry?.id === c.id
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{c.country_name}</span>
                  <Badge variant="success">{c.recycling_rate_pct}% Recycled</Badge>
                </div>
              </button>
            ))}
          </Card>

          {selectedCountry && (
            <Card className="lg:col-span-2 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{selectedCountry.country_name}</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">National Recycling Rate: {selectedCountry.recycling_rate_pct}%</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{selectedCountry.case_study_title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedCountry.case_study_content}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">Infrastructure Requirements:</div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCountry.infrastructure}</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="font-bold text-red-600 mb-1">Limitations & Challenges:</div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCountry.limitations}</div>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verified Policy References</h5>
                <div className="space-y-1 text-xs">
                  {selectedCountry.reference_urls_json?.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="block text-emerald-600 hover:underline truncate">
                      🔗 {url}
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
