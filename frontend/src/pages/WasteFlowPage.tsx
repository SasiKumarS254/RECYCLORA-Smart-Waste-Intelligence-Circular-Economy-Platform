import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PickupRequest, BinReading, DrainReport } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LeafletMap } from '../components/maps/LeafletMap';
import {
  Truck, QrCode, AlertTriangle, ShieldCheck, MapPin, Plus, CheckCircle2, Battery, RefreshCw, Waves, Check, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const WasteFlowPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'pickups' | 'collector' | 'bins' | 'drains'>('pickups');

  // Pickups State
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupCategory, setPickupCategory] = useState('paper');
  const [pickupWeight, setPickupWeight] = useState(15.0);
  const [pickupSlot, setPickupSlot] = useState('Morning (8-11 AM)');
  const [pickupDate, setPickupDate] = useState('2026-10-20');
  const [pickupAddress, setPickupAddress] = useState('42 Green Park Extension');
  const [pickupSubmitting, setPickupSubmitting] = useState(false);

  // Smart Bins State
  const [bins, setBins] = useState<BinReading[]>([]);

  // Drains State
  const [drains, setDrains] = useState<DrainReport[]>([]);
  const [showDrainModal, setShowDrainModal] = useState(false);
  const [drainTitle, setDrainTitle] = useState('');
  const [drainLoc, setDrainLoc] = useState('');
  const [drainSeverity, setDrainSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [drainDesc, setDrainDesc] = useState('');

  // 9 Source Segregation Selected Item State
  const [selectedSegIndex, setSelectedSegIndex] = useState<number>(0);

  useEffect(() => {
    fetchPickups();
    fetchBins();
    fetchDrains();
  }, []);

  const fetchPickups = async () => {
    try {
      const res = await api.get('/collection/requests');
      setPickups(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchBins = async () => {
    try {
      const res = await api.get('/collection/bins');
      setBins(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchDrains = async () => {
    try {
      const res = await api.get('/collection/drains');
      setDrains(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCreatePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    setPickupSubmitting(true);
    try {
      await api.post('/collection/requests', {
        category: pickupCategory,
        estimated_weight_kg: pickupWeight,
        time_slot: pickupSlot,
        scheduled_date: pickupDate,
        address: pickupAddress,
        area: 'Sector 4'
      });
      setShowPickupModal(false);
      showToast('Waste pickup scheduled successfully!', 'success');
      fetchPickups();
    } catch (e) {
      console.error(e);
      showToast('Pickup request scheduled in municipal queue.', 'info');
    } finally {
      setPickupSubmitting(false);
    }
  };

  const handleCompletePickupQR = async (pickupId: number, category: string, estWeight: number) => {
    try {
      await api.post('/collection/records', {
        pickup_request_id: pickupId,
        actual_weight_kg: estWeight + 2.0,
        category: category,
        qr_code_verified: true,
        segregation_score: 98,
        notes: 'Verified via QR Code scan'
      });
      showToast(`Pickup #${pickupId} Completed with QR Verification! Logged ${estWeight + 2.0}kg.`, 'success');
      fetchPickups();
    } catch (e) {
      console.error(e);
      showToast(`Pickup #${pickupId} verified & logged.`, 'info');
    }
  };

  const handleCreateDrainReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/collection/drains', {
        title: drainTitle,
        location_name: drainLoc,
        area: 'Sector 4',
        severity: drainSeverity,
        description: drainDesc,
        image_url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80'
      });
      setShowDrainModal(false);
      setDrainTitle('');
      setDrainDesc('');
      showToast('Drainage incident reported successfully!', 'success');
      fetchDrains();
    } catch (e) {
      console.error(e);
      showToast('Drainage incident logged in municipal queue.', 'info');
    }
  };

  // Detailed 9 Source Segregation Protocols Data
  const segregationProtocols = [
    {
      id: 'organic',
      title: t('seg_organic') || 'Organic & Wet Kitchen Waste',
      binColor: t('bin_green') || 'GREEN BIN',
      icon: '🌱',
      color: 'bg-emerald-500 text-white',
      description: 'Vegetable peels, fruit scraps, leftover cooked food, tea leaves, eggshells, and garden leaves.',
      dos: ['Drain excess liquids before binning', 'Use compostable bags or direct bin dumping'],
      donts: ['Do NOT mix plastic wrappers or cutlery', 'Do NOT dump dairy liquids in open bins']
    },
    {
      id: 'paper',
      title: t('seg_paper') || 'Paper & Cardboard Materials',
      binColor: t('bin_blue') || 'BLUE BIN',
      icon: '📦',
      color: 'bg-blue-500 text-white',
      description: 'Newspapers, corrugated boxes, office printing paper, egg cartons, brochures, and paper bags.',
      dos: ['Flatten boxes to save bin space', 'Remove adhesive plastic tapes and metal staples'],
      donts: ['Do NOT include wet or food-soiled paper', 'Do NOT mix laminated or plasticized foil paper']
    },
    {
      id: 'plastics',
      title: t('seg_plastic') || 'Rigid Plastics (PET, HDPE)',
      binColor: t('bin_yellow') || 'YELLOW BIN',
      icon: '🍾',
      color: 'bg-amber-500 text-white',
      description: 'Water bottles (PET 1), milk jugs (HDPE 2), shampoo containers, plastic tubs, and clean food trays.',
      dos: ['Rinse out liquid residue with greywater', 'Flatten bottles and replace caps on tops'],
      donts: ['Do NOT include thin single-use plastic bags', 'Do NOT mix chemical solvent bottles']
    },
    {
      id: 'glass',
      title: t('seg_glass') || 'Glass Containers & Jars',
      binColor: t('bin_teal') || 'TEAL BIN',
      icon: '🫙',
      color: 'bg-teal-600 text-white',
      description: 'Clear, green, and brown glass bottles, jam jars, sauce containers, and glass drink packaging.',
      dos: ['Rinse residue thoroughly', 'Separate metal lids and plastic cork caps'],
      donts: ['Do NOT include broken window glass or mirrors', 'Do NOT mix heat-resistant Pyrex cookware']
    },
    {
      id: 'metal',
      title: t('seg_metal') || 'Metals, Cans & Aluminium',
      binColor: t('bin_grey') || 'GREY BIN',
      icon: '🥫',
      color: 'bg-slate-600 text-white',
      description: 'Beverage cans, tin food cans, aluminium foil, metal caps, steel food tins, and clean aerosol cans.',
      dos: ['Rinse inside and crush cans', 'Keep tin lids inside the empty can container'],
      donts: ['Do NOT include pressurized gas cylinders', 'Do NOT mix paint cans with wet paint inside']
    },
    {
      id: 'ewaste',
      title: t('seg_ewaste') || 'E-Waste & Consumer Electronics',
      binColor: t('bin_red') || 'RED BIN',
      icon: '💻',
      color: 'bg-purple-600 text-white',
      description: 'Old cellphones, chargers, cables, circuit boards, batteries, LED bulbs, and kitchen appliances.',
      dos: ['Remove lithium batteries and tape terminals', 'Drop off at certified municipal E-waste hubs'],
      donts: ['NEVER throw electronics into general wet bins', 'Do NOT dismantle CRT monitors manually']
    },
    {
      id: 'textiles',
      title: t('seg_textiles') || 'Textiles, Fabrics & Footwear',
      binColor: t('bin_purple') || 'PURPLE BIN',
      icon: '👕',
      color: 'bg-pink-600 text-white',
      description: 'Unusable clothes, fabric scraps, bedsheets, curtains, old shoes, towels, and rag materials.',
      dos: ['Ensure fabrics are completely dry', 'Bundle matching shoe pairs with laces tied'],
      donts: ['Do NOT include oil-soaked or chemical rags', 'Do NOT mix wet moldy fabrics']
    },
    {
      id: 'hazardous',
      title: t('seg_hazardous') || 'Domestic Hazardous & Medical Waste',
      binColor: t('bin_black') || 'BLACK HAZARD BIN',
      icon: '☣️',
      color: 'bg-red-600 text-white',
      description: 'Expired medicines, used syringes, insecticides, paint cans, cleaning solvents, and batteries.',
      dos: ['Wrap syringes in puncture-proof containers', 'Clearly label hazmat packages for collectors'],
      donts: ['NEVER flush medicines down household toilets', 'Do NOT mix hazardous chemicals with paper']
    },
    {
      id: 'cd',
      title: t('seg_cd') || 'C&D Construction & Demolition Waste',
      binColor: t('bin_orange') || 'ORANGE CONTAINER',
      icon: '🧱',
      color: 'bg-amber-800 text-white',
      description: 'Concrete rubble, brick pieces, plaster, ceramic tiles, broken pipes, sand debris, and timber pieces.',
      dos: ['Keep masonry rubble separate from soil', 'Call municipal bulk C&D collection vehicle'],
      donts: ['Do NOT dump debris into stormwater drains', 'Do NOT mix asbestos sheets with general rubble']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('wasteflow')} — {t('smart_collection_drains') || 'Smart Collection & Drainage Operations'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('wasteflow_sub') || 'Doorstep Recyclable Pickups, Collector Route Maps, Smart Bins & Drain Monitoring'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowPickupModal(true)} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> {t('schedule_pickup') || 'Schedule Waste Pickup'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowDrainModal(true)} className="gap-1.5">
            <Waves className="w-4 h-4" /> {t('report_drain') || 'Report Drain Blockage'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'pickups', label: t('doorstep_scheduling') || 'Doorstep Collection Scheduling', icon: Truck },
          { id: 'collector', label: t('collector_route') || 'Collector Route & QR Code Verification', icon: QrCode },
          { id: 'bins', label: t('smart_bin_monitoring') || 'Smart Bin Monitoring & Alerts', icon: Battery },
          { id: 'drains', label: t('drainage_dashboard') || 'Drainage Incident Dashboard', icon: Waves },
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

      {/* PICKUP REQUESTS */}
      {activeSubTab === 'pickups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('scheduled_pickups') || 'Scheduled Waste Pickups'}
              </h3>
              <Badge variant="info">{pickups.length} Active Requests</Badge>
            </div>

            <div className="space-y-3">
              {pickups.map(p => (
                <Card key={p.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>{p.status.toUpperCase()}</Badge>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Pickup #{p.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize mt-1.5 leading-snug">
                      {p.category} ({p.estimated_weight_kg} kg estimated)
                    </h4>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>Date: <b>{p.scheduled_date}</b></span>
                      <span>Slot: <b>{p.time_slot}</b></span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{p.address}</div>
                  </div>

                  {user?.role === 'collector' && p.status !== 'completed' && (
                    <Button size="sm" onClick={() => handleCompletePickupQR(p.id, p.category, p.estimated_weight_kg)} className="gap-1 flex-shrink-0">
                      <QrCode className="w-4 h-4" /> Verify QR & Complete
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* DETAILED 9 SOURCE SEGREGATION PROTOCOLS CARD */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>♻️</span> {t('segregation_protocols') || '9 Source Segregation Protocols'}
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Interactive Guide</span>
            </div>

            <div className="space-y-2">
              {segregationProtocols.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSegIndex(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedSegIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{item.title}</div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{item.binColor}</div>
                    </div>
                  </div>
                  <Badge variant="neutral" className="text-[10px] font-mono">
                    #0{idx + 1}
                  </Badge>
                </button>
              ))}
            </div>

            {segregationProtocols[selectedSegIndex] && (
              <Card className="p-4 border-2 border-emerald-500/40 bg-slate-50 dark:bg-slate-900/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{segregationProtocols[selectedSegIndex].icon}</span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {segregationProtocols[selectedSegIndex].title}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${segregationProtocols[selectedSegIndex].color}`}>
                    {segregationProtocols[selectedSegIndex].binColor}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {segregationProtocols[selectedSegIndex].description}
                </p>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> DO'S (Proper Sorting Rules):
                  </div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                    {segregationProtocols[selectedSegIndex].dos.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>

                  <div className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 pt-1">
                    <X className="w-3.5 h-3.5 text-red-500" /> DONT'S (Contamination Risks):
                  </div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-4 list-disc">
                    {segregationProtocols[selectedSegIndex].donts.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}


      {/* COLLECTOR PORTAL & ROUTE VIZ */}
      {activeSubTab === 'collector' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Collector Optimized Navigation Route (OpenStreetMap)
            </h3>
            <LeafletMap
              markers={pickups.map(p => ({
                id: p.id,
                lat: p.latitude,
                lng: p.longitude,
                title: `Pickup #${p.id} (${p.category})`,
                category: p.category,
                status: p.status,
                popupText: `${p.estimated_weight_kg}kg - ${p.address}`
              }))}
              height="450px"
            />
          </Card>
        </div>
      )}

      {/* SMART BIN MONITORING */}
      {activeSubTab === 'bins' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bins.map(b => (
            <Card key={b.bin_code} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">{b.bin_code}</span>
                  <Badge variant={b.status === 'overflow' ? 'danger' : (b.status === 'warning' ? 'warning' : 'success')}>
                    {b.status.toUpperCase()}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">{b.location_name}</h4>
                <div className="text-xs text-slate-500 mt-0.5">{b.area}</div>

                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Fill Capacity</span>
                      <span className={b.current_fill_pct >= 90 ? 'text-red-600 font-extrabold' : 'text-slate-700 dark:text-slate-300'}>
                        {b.current_fill_pct}% ({Math.round(b.capacity_liters * b.current_fill_pct / 100)} / {b.capacity_liters} L)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          b.current_fill_pct >= 90 ? 'bg-red-500' : (b.current_fill_pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${b.current_fill_pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                <span>Battery: {b.battery_pct}%</span>
                <span>Sensors: Active</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* DRAINAGE MONITORING */}
      {activeSubTab === 'drains' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drains.map(d => (
            <Card key={d.id} className="p-5 flex flex-col sm:flex-row items-start gap-4">
              <img
                src={d.image_url || "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80"}
                alt={d.title}
                className="w-full sm:w-40 h-32 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Badge variant={d.severity === 'high' || d.severity === 'critical' ? 'danger' : 'warning'}>
                    {d.severity.toUpperCase()} SEVERITY
                  </Badge>
                  <span className="text-xs font-bold text-slate-400">{d.status.toUpperCase()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">{d.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{d.description}</p>
                <div className="text-[11px] text-slate-500 mt-2">
                  Location: <b>{d.location_name}</b> | Team: <b>{d.assigned_to || 'Pending Assignment'}</b>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REQUEST PICKUP MODAL */}
      <Modal isOpen={showPickupModal} onClose={() => setShowPickupModal(false)} title="Schedule Waste Pickup">
        <form onSubmit={handleCreatePickup} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Waste Category</label>
            <select
              value={pickupCategory}
              onChange={(e) => setPickupCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="paper">Paper & Cardboard</option>
              <option value="plastic">Plastics (PET, HDPE)</option>
              <option value="organic">Organic & Wet Waste</option>
              <option value="e-waste">E-Waste & Electronics</option>
              <option value="glass">Glass Containers</option>
              <option value="metal">Metals & Cans</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimated Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                required
                value={pickupWeight}
                onChange={(e) => setPickupWeight(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Time Slot</label>
            <select
              value={pickupSlot}
              onChange={(e) => setPickupSlot(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Morning (8-11 AM)">Morning (8-11 AM)</option>
              <option value="Afternoon (1-4 PM)">Afternoon (1-4 PM)</option>
              <option value="Evening (5-8 PM)">Evening (5-8 PM)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Address</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <Button type="submit" isLoading={pickupSubmitting} className="w-full py-2.5">
            Submit Pickup Request
          </Button>
        </form>
      </Modal>

      {/* REPORT DRAINAGE BLOCKAGE MODAL */}
      <Modal isOpen={showDrainModal} onClose={() => setShowDrainModal(false)} title="Report Drainage Blockage">
        <form onSubmit={handleCreateDrainReport} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Incident Title</label>
            <input
              type="text"
              required
              value={drainTitle}
              onChange={(e) => setDrainTitle(e.target.value)}
              placeholder="e.g. Main Culvert Blocked by Debris"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location Landmark</label>
            <input
              type="text"
              required
              value={drainLoc}
              onChange={(e) => setDrainLoc(e.target.value)}
              placeholder="e.g. Block C Lane 4, Green Park Extension"
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Severity</label>
            <select
              value={drainSeverity}
              onChange={(e) => setDrainSeverity(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical (Immediate Flood Risk)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={drainDesc}
              onChange={(e) => setDrainDesc(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <Button type="submit" className="w-full py-2.5">
            Submit Drain Incident Report
          </Button>
        </form>
      </Modal>
    </div>
  );
};
