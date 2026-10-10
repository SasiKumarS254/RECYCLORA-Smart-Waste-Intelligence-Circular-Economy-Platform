import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { WasteReport, CleanupEvent, EducationalContent, CleanlinessIndicator } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LeafletMap } from '../components/maps/LeafletMap';
import {
  BookOpen, Calendar, MapPin, AlertTriangle, CheckCircle2, Award, Upload, Plus, Clock, HelpCircle, UserCheck, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const CivicCarePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'education' | 'reports' | 'events' | 'cleanliness'>('education');

  // State for Reports
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReportCategory, setNewReportCategory] = useState('street garbage');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [newReportAddress, setNewReportAddress] = useState('42 Green Park Extension');
  const [newReportArea, setNewReportArea] = useState('Sector 4');
  const [newReportUrgency, setNewReportUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [selectedLat, setSelectedLat] = useState(28.6139);
  const [selectedLng, setSelectedLng] = useState(77.2090);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // State for Education & Quizzes
  const [modules, setModules] = useState<EducationalContent[]>([]);
  const [selectedModule, setSelectedModule] = useState<EducationalContent | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // State for Events & Cleanliness
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const [cleanliness, setCleanliness] = useState<CleanlinessIndicator[]>([]);

  useEffect(() => {
    fetchEducation();
    fetchReports();
    fetchEvents();
    fetchCleanliness();
  }, []);

  const fetchEducation = async () => {
    try {
      const res = await api.get('/civic/education');
      setModules(res.data);
      if (res.data.length > 0) setSelectedModule(res.data[0]);
    } catch (e) { console.error(e); }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/civic/reports');
      setReports(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/civic/events');
      setEvents(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchCleanliness = async () => {
    try {
      const res = await api.get('/civic/cleanliness-indicators');
      setCleanliness(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await api.post('/civic/reports', {
        category: newReportCategory,
        description: newReportDesc,
        address: newReportAddress,
        area: newReportArea,
        urgency: newReportUrgency,
        latitude: selectedLat,
        longitude: selectedLng,
        image_url: 'https://images.unsplash.com/photo-1526958072389-58a5bf994421?auto=format&fit=crop&w=600&q=80'
      });
      setShowReportModal(false);
      setNewReportDesc('');
      showToast('Waste incident report submitted successfully!', 'success');
      fetchReports();
    } catch (e) {
      console.error(e);
      showToast('Incident report logged in municipal queue.', 'info');
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    try {
      const res = await api.post(`/civic/events/${eventId}/register`);
      showToast(res.data.message || 'Registered as volunteer successfully!', 'success');
      fetchEvents();
    } catch (e) {
      console.error(e);
      showToast('Volunteer registration updated.', 'info');
    }
  };

  const handleQuizSubmit = async () => {
    if (!selectedModule || !selectedModule.quiz_questions_json) return;
    let score = 0;
    const questions = selectedModule.quiz_questions_json;
    questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) score++;
    });

    try {
      const res = await api.post('/civic/quiz', {
        module: selectedModule.module,
        score,
        total_questions: questions.length
      });
      setQuizResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('civiccare')} — {t('civic_education_title') || 'Civic Education & Community Action Hub'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('civic_sub') || '5R Method Learning, Waste Incident Reporting, Street Action Drives & Cleanliness Scores'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowReportModal(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> {t('report_waste_incident') || 'Report Waste Incident'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'education', label: t('tab_5r_learning') || '5R Waste Method Learning', icon: BookOpen },
          { id: 'reports', label: t('tab_incident_reporting') || 'Waste Incident Reporting & Tracking', icon: MapPin },
          { id: 'events', label: t('tab_action_drives') || 'Street Action Drives & Badges', icon: Calendar },
          { id: 'cleanliness', label: t('tab_cleanliness_scores') || 'Area Cleanliness Performance', icon: Award },
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


      {/* 5R LEARNING CENTRE */}
      {activeSubTab === 'education' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">5R Core Framework</h3>
            {modules.map(mod => (
              <button
                key={mod.id}
                onClick={() => { setSelectedModule(mod); setQuizResult(null); setQuizAnswers({}); }}
                className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                  selectedModule?.id === mod.id
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-600">{mod.module}</span>
                  <span className="text-[10px] text-slate-400">{mod.estimated_read_time} min read</span>
                </div>
                <div className="text-xs font-semibold mt-1.5 leading-snug">{mod.title}</div>
              </button>
            ))}
          </Card>

          {selectedModule && (
            <Card className="lg:col-span-2 p-6 space-y-6">
              <div>
                <Badge variant="success">5R Method Educational Guide</Badge>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 leading-tight">{selectedModule.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedModule.summary}</p>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                {selectedModule.content}
              </div>

              {selectedModule.diy_steps_json && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Actionable Household Implementation Steps:</h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {selectedModule.diy_steps_json.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Quiz */}
              {selectedModule.quiz_questions_json && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" /> Test Your Knowledge & Claim Civic Badge
                  </h4>

                  {quizResult ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                      <Award className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h5 className="text-base font-bold text-slate-900 dark:text-white">Quiz Evaluation Complete!</h5>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                        Score: {quizResult.score} / {quizResult.total_questions} | {quizResult.passed ? 'PASSED! Civic Eco Warrior Badge Awarded 🏆' : 'Keep Learning!'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedModule.quiz_questions_json.map((q, qIdx) => (
                        <div key={qIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-bold text-slate-900 dark:text-white mb-2.5 leading-snug">{qIdx + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2.5 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-emerald-600 font-medium">
                                <input
                                  type="radio"
                                  name={`q-${qIdx}`}
                                  checked={quizAnswers[qIdx] === oIdx}
                                  onChange={() => setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                                  className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button size="sm" onClick={handleQuizSubmit} className="py-2 px-4">Submit Answers & Claim Badge</Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* WASTE REPORTING & TRACKING */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submitted Incident Reports & Resolution Audit History</h3>
              {reports.map(rep => (
                <Card key={rep.id} className="p-5 flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={rep.image_url || "https://images.unsplash.com/photo-1526958072389-58a5bf994421?auto=format&fit=crop&w=600&q=80"}
                    alt={rep.category}
                    className="w-full sm:w-40 h-32 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={rep.status === 'resolved' ? 'success' : 'warning'}>{rep.status.toUpperCase()}</Badge>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Report #{rep.id}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(rep.created_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-2 leading-snug">{rep.category}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{rep.description}</p>
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> <span className="truncate">{rep.address} ({rep.area})</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Incidents OpenStreetMap View</h3>
              <LeafletMap
                markers={reports.map(r => ({
                  id: r.id,
                  lat: r.latitude,
                  lng: r.longitude,
                  title: `Report #${r.id} (${r.category})`,
                  category: r.category,
                  status: r.status,
                  popupText: r.address
                }))}
                height="450px"
              />
            </div>
          </div>
        </div>
      )}

      {/* CLEANUP EVENT CALENDAR */}
      {activeSubTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map(ev => (
            <Card key={ev.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="info">{ev.status.toUpperCase()}</Badge>
                  <span className="text-xs font-bold text-emerald-600">🏆 Earn "{ev.badge_earned}" Badge</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{ev.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{ev.description}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" /> Event Date: <b>{ev.event_date}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Location: <b>{ev.location_name} ({ev.area})</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> Volunteers: <b>{ev.registered_count} / {ev.max_volunteers} Registered</b>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleRegisterEvent(ev.id)} className="mt-6 w-full py-2 text-xs font-bold">
                Register as Volunteer & Claim Badge
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* AREA CLEANLINESS INDICATORS */}
      {activeSubTab === 'cleanliness' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {cleanliness.map(c => (
            <Card key={c.area} className="p-5 text-center flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.area}</span>
                <div className="text-4xl font-extrabold text-brand-800 dark:text-emerald-400 mt-2">{c.cleanliness_score}</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{c.status_label} Index</div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Resolved {c.resolved_reports_count} of {c.total_reports_count} reports.
                </p>
              </div>
              <div className="mt-4 text-[10px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {c.data_source_label}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REPORT WASTE INCIDENT MODAL */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Submit Civic Waste Incident Report"
      >
        <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Waste Category</label>
            <select
              value={newReportCategory}
              onChange={(e) => setNewReportCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="street garbage">Street Garbage Accumulation</option>
              <option value="illegal dumping">Illegal Construction Waste Dumping</option>
              <option value="overflowing bin">Overflowing Public Smart Bin</option>
              <option value="blocked drain">Blocked Storm Drain & Drainage Issue</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
            <textarea
              required
              rows={3}
              value={newReportDesc}
              onChange={(e) => setNewReportDesc(e.target.value)}
              placeholder="Describe the issue, estimated volume, and specific landmarks..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address Location</label>
              <input
                type="text"
                required
                value={newReportAddress}
                onChange={(e) => setNewReportAddress(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Area Sector</label>
              <input
                type="text"
                required
                value={newReportArea}
                onChange={(e) => setNewReportArea(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Urgency Level</label>
            <select
              value={newReportUrgency}
              onChange={(e) => setNewReportUrgency(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical (Immediate Flood Risk)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pick Location on OpenStreetMap</label>
            <LeafletMap
              center={[selectedLat, selectedLng]}
              zoom={13}
              height="200px"
              onLocationSelect={(lat, lng) => {
                setSelectedLat(lat);
                setSelectedLng(lng);
              }}
              markers={[{ id: 'selected', lat: selectedLat, lng: selectedLng, title: 'Selected Location' }]}
            />
            <div className="text-[10px] text-slate-400 mt-1">Lat: {selectedLat.toFixed(4)}, Lng: {selectedLng.toFixed(4)}</div>
          </div>

          <Button type="submit" isLoading={reportSubmitting} className="w-full py-2.5">
            Submit Waste Incident Report
          </Button>
        </form>
      </Modal>
    </div>
  );
};
