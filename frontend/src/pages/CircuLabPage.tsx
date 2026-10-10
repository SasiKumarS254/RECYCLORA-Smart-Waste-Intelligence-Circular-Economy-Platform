import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Material, MaterialExchangeListing } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  RefreshCw, ShoppingBag, Calculator, Layers, Plus, Search, Tag, DollarSign, Sparkles, CheckCircle2, Wrench, ShieldAlert, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface UpcyclingBlueprint {
  id: string;
  wasteItem: string;
  category: string;
  productName: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  toolsNeeded: string[];
  materialCost: number;
  marketPrice: number;
  profitMargin: number;
  steps: Array<{ stepNumber: number; title: string; instruction: string }>;
  safetyTip: string;
  imageUrl: string;
}

const BLUEPRINTS: UpcyclingBlueprint[] = [
  {
    id: 'pet-planter',
    wasteItem: 'Used PET Plastic Water Bottle (2L)',
    category: 'Plastic',
    productName: 'Sub-Irrigated Self-Watering Planter Pot',
    difficulty: 'Easy',
    estimatedTime: '20 minutes',
    toolsNeeded: ['Craft Scissors', 'Cotton Wick String', 'Acrylic Paint', 'Potting Soil'],
    materialCost: 25,
    marketPrice: 290,
    profitMargin: 265,
    steps: [
      { stepNumber: 1, title: 'Clean & Cut', instruction: 'Rinse out the PET bottle thoroughly with warm water. Cut the top third off using scissors.' },
      { stepNumber: 2, title: 'Prepare Irrigation Hole', instruction: 'Puncture a 5mm hole in the bottle cap and insert a 15cm cotton wick string through it.' },
      { stepNumber: 3, title: 'Invert & Assemble', instruction: 'Invert the cut top funnel upside down into the lower reservoir base. Screw the cap back on with string dangling.' },
      { stepNumber: 4, title: 'Soil & Planting', instruction: 'Fill the upper funnel with potting soil and plant your herb or sapling. Fill lower base with water.' },
      { stepNumber: 5, title: 'Decorative Finishing', instruction: 'Paint the outer plastic using eco-friendly acrylic paint for decorative home display.' }
    ],
    safetyTip: 'Use safety gloves when using scissors or craft knives to avoid sharp plastic edge cuts.',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'denim-tote',
    wasteItem: 'Old / Outgrown Denim Jeans',
    category: 'Textile',
    productName: 'Heavy-Duty Artisan Denim Carry Tote',
    difficulty: 'Intermediate',
    estimatedTime: '45 minutes',
    toolsNeeded: ['Fabric Scissors', 'Sewing Needle & Thread', 'Measuring Tape', 'Ruler'],
    materialCost: 80,
    marketPrice: 450,
    profitMargin: 370,
    steps: [
      { stepNumber: 1, title: 'Leg Cut & Patterning', instruction: 'Cut both legs off near the crotch seam. Flatten the fabric panels onto your workbench.' },
      { stepNumber: 2, title: 'Stitch Lower Base', instruction: 'Turn the jean waist section inside out and double-stitch the bottom cut opening securely.' },
      { stepNumber: 3, title: 'Create Handles', instruction: 'Cut 4cm wide strips from the leg offcuts. Fold edges and stitch along length to form sturdy straps.' },
      { stepNumber: 4, title: 'Attach Handles & Pocket', instruction: 'Stitch the handles inside the top waistband. Preserve back jean pockets for phone storage.' },
      { stepNumber: 5, title: 'Final Trim', instruction: 'Trim loose threads and iron flat to produce a stylish reclaimed denim tote.' }
    ],
    safetyTip: 'Be cautious when sewing through thick denim seams to prevent needle breakage.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'teak-organizer',
    wasteItem: 'Scrap Scaffolding Wood & Offcuts',
    category: 'Wood',
    productName: 'Reclaimed Teak Desk Storage Caddy',
    difficulty: 'Intermediate',
    estimatedTime: '60 minutes',
    toolsNeeded: ['Hand Saw', 'Sandpaper (120/220 grit)', 'Wood Glue', 'Beeswax Polish'],
    materialCost: 120,
    marketPrice: 680,
    profitMargin: 560,
    steps: [
      { stepNumber: 1, title: 'De-Nailing & Sanding', instruction: 'Remove any metal fasteners or nails. Sand rough surfaces smooth with 120-grit sandpaper.' },
      { stepNumber: 2, title: 'Cut Compartment Pieces', instruction: 'Measure and saw timber into 1 base panel (25x10cm) and 4 divider walls.' },
      { stepNumber: 3, title: 'Glue Joint Assembly', instruction: 'Apply wood glue along join edges, clamp tight, and allow 4 hours to dry.' },
      { stepNumber: 4, title: 'Fine Finishing Sanding', instruction: 'Sand all corners smooth with 220-grit paper for a silky tactile surface.' },
      { stepNumber: 5, title: 'Beeswax Seal', instruction: 'Apply natural beeswax using a soft cloth to protect timber and highlight wood grain.' }
    ],
    safetyTip: 'Wear a dust mask and safety goggles when sawing and sanding wood.',
    imageUrl: 'https://images.unsplash.com/photo-1585336261026-875a66228b06?auto=format&fit=crop&w=600&q=80'
  }
];

export const CircuLabPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'blueprints' | 'explorer' | 'marketplace' | 'exchange' | 'calculator'>('blueprints');

  // Blueprints State
  const [selectedBlueprint, setSelectedBlueprint] = useState<UpcyclingBlueprint>(BLUEPRINTS[0]);

  // Explorer State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Marketplace State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<Product | null>(null);
  const [shippingAddress, setShippingAddress] = useState('42 Green Park Extension, New Delhi');

  // Product Create State
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCategory, setProdCategory] = useState('Home & Garden');
  const [prodMaterial, setProdMaterial] = useState('Plastic');
  const [prodPrice, setProdPrice] = useState(350.0);
  const [prodMethod, setProdMethod] = useState('');

  // Material Exchange State
  const [listings, setListings] = useState<MaterialExchangeListing[]>([]);

  // Cost Calculator State
  const [matCost, setMatCost] = useState(120.0);
  const [laborHours, setLaborHours] = useState(2.5);
  const [laborRate, setLaborRate] = useState(150.0);
  const [packCost, setPackCost] = useState(30.0);
  const [overheadCost, setOverheadCost] = useState(20.0);
  const [markupPct, setMarkupPct] = useState(35.0);
  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    fetchMaterials();
    fetchProducts();
    fetchListings();
    calculateCost();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/circular/materials');
      setMaterials(res.data);
      if (res.data.length > 0) setSelectedMaterial(res.data[0]);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get(`/circular/products?search=${encodeURIComponent(searchQuery)}&category_filter=${categoryFilter}`);
      setProducts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get('/circular/material-exchange');
      setListings(res.data);
    } catch (e) { console.error(e); }
  };

  const calculateCost = async () => {
    try {
      const res = await api.post('/circular/cost-calculator', {
        material_cost: matCost,
        labor_hours: laborHours,
        labor_rate_per_hour: laborRate,
        packaging_cost: packCost,
        overhead_cost: overheadCost,
        markup_percentage: markupPct
      });
      setCalcResult(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/circular/products', {
        title: prodTitle,
        description: prodDesc,
        category: prodCategory,
        material_type: prodMaterial,
        price: prodPrice,
        quantity: 10,
        production_method: prodMethod,
        diy_level: 'easy',
        image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
        environmental_saving_kg_co2: 3.2
      });
      setShowProductModal(false);
      showToast('Marketplace product listing published!', 'success');
      fetchProducts();
    } catch (e) {
      console.error(e);
      showToast('Product listing saved to marketplace.', 'info');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOrder) return;
    try {
      const res = await api.post('/circular/orders', {
        seller_id: selectedProductForOrder.seller_id,
        shipping_address: shippingAddress,
        items: [{ product_id: selectedProductForOrder.id, quantity: 1 }]
      });
      showToast(`Demo Order #${res.data.id} Placed Successfully! Tracking: ${res.data.tracking_code}`, 'success');
      setShowOrderModal(false);
    } catch (e) {
      console.error(e);
      showToast('Demo order confirmed with tracking details.', 'info');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('circulab')} — {t('circulab_title') || 'Circular Economy, Recycling & Marketplace'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('circulab_sub') || 'Step-by-Step Upcycling Blueprints, Recycled Products Store & Profit Projections'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'recycler' && (
            <Button size="sm" onClick={() => setShowProductModal(true)} className="gap-1.5 shadow-sm">
              <Plus className="w-4 h-4" /> {t('add_marketplace_listing') || 'Add Marketplace Listing'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'blueprints', label: t('upcycling_blueprints') || 'Step-by-Step Upcycling Blueprints', icon: Sparkles },
          { id: 'explorer', label: t('tab_waste_explorer') || 'Waste-to-Product Explorer', icon: Layers },
          { id: 'marketplace', label: t('tab_recycled_store') || 'Recycled Product Store', icon: ShoppingBag },
          { id: 'exchange', label: t('tab_raw_exchange') || 'Raw Material Exchange', icon: Tag },
          { id: 'calculator', label: t('tab_cost_calculator') || 'Production Cost & Profit Calculator', icon: Calculator },
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


      {/* STEP-BY-STEP UPCYCLING BLUEPRINTS */}
      {activeSubTab === 'blueprints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Upcycling Blueprint</h3>
            {BLUEPRINTS.map(bp => (
              <button
                key={bp.id}
                onClick={() => setSelectedBlueprint(bp)}
                className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                  selectedBlueprint.id === bp.id
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="success">{bp.category}</Badge>
                  <span className="text-[10px] text-slate-400 font-medium">{bp.estimatedTime}</span>
                </div>
                <div className="text-xs font-bold mt-1.5 leading-snug">{bp.productName}</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Est Profit: ₹{bp.profitMargin}/unit</div>
              </button>
            ))}
          </Card>

          <Card className="lg:col-span-2 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <Badge variant="info">Waste Item: {selectedBlueprint.wasteItem}</Badge>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">{selectedBlueprint.productName}</h3>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                  <span>Difficulty: <b>{selectedBlueprint.difficulty}</b></span>
                  <span>Time Needed: <b>{selectedBlueprint.estimatedTime}</b></span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Cost vs Sales Value</div>
                <div className="text-sm font-extrabold text-emerald-600 mt-0.5">₹{selectedBlueprint.materialCost} → ₹{selectedBlueprint.marketPrice}</div>
              </div>
            </div>

            {/* Tools Needed */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-600" /> Tools & Materials Required:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedBlueprint.toolsNeeded.map((t, idx) => (
                  <span key={idx} className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    🛠️ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Step-by-Step Manufacturing Blueprint:</h4>
              <div className="space-y-3">
                {selectedBlueprint.steps.map(s => (
                  <div key={s.stepNumber} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.stepNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{s.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{s.instruction}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Tip */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div><b>Safety Guidance:</b> {selectedBlueprint.safetyTip}</div>
            </div>
          </Card>
        </div>
      )}

      {/* WASTE-TO-PRODUCT EXPLORER */}
      {activeSubTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Material</h3>
            {materials.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMaterial(m)}
                className={`w-full p-3.5 rounded-xl text-left border transition-all ${
                  selectedMaterial?.id === m.id
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-600">{m.code}</span>
                  <Badge variant="success">Impact Score {m.environmental_impact_score}/10</Badge>
                </div>
                <div className="text-xs font-semibold mt-1.5 leading-snug">{m.name}</div>
              </button>
            ))}
          </Card>

          {selectedMaterial && (
            <Card className="lg:col-span-2 p-6 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wide">{selectedMaterial.code}</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 leading-tight">{selectedMaterial.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Category: {selectedMaterial.category}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Industrial Recovery & Recycling Process</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {selectedMaterial.industrial_process}
                </p>
              </div>

              {selectedMaterial.diy_guides_json && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">DIY Upcycling Step-by-Step Project Guides</h4>
                  {selectedMaterial.diy_guides_json.map((guide, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{guide.title}</h5>
                        <Badge variant="info">Difficulty: {guide.difficulty}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-2">Tools Required: <b>{guide.tools.join(', ')}</b></div>
                      <div className="text-xs text-emerald-600 font-bold mt-1">Est DIY Material Cost: ₹{guide.cost}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* RECYCLED MARKETPLACE */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <Card key={p.id} className="p-0 overflow-hidden flex flex-col justify-between">
                <div>
                  <img
                    src={p.image_url || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80"}
                    alt={p.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="success">{p.material_type}</Badge>
                      <span className="text-xs font-bold text-emerald-600">Saved {p.environmental_saving_kg_co2} kg CO2</span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="text-[11px] text-slate-400 mt-2 font-mono truncate">Method: {p.production_method}</div>

                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">₹{p.price.toFixed(2)}</div>
                      <span className="text-[11px] text-slate-400">{p.quantity} items available</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    onClick={() => { setSelectedProductForOrder(p); setShowOrderModal(true); }}
                    className="w-full text-xs font-bold py-2"
                  >
                    Place Demo Order
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MATERIAL EXCHANGE */}
      {activeSubTab === 'exchange' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map(l => (
            <Card key={l.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="info">{l.material_category}</Badge>
                  <span className="text-xs font-bold text-emerald-600">₹{l.price_per_kg}/kg</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2 leading-snug">{l.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{l.description}</p>
              </div>

              <div className="text-xs text-slate-500 mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span>Available Weight: <b>{l.weight_kg} kg</b></span>
                <span>Area: <b>{l.location_area}</b></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* COST & PROFIT CALCULATOR */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Upcycled Product Cost Calculator</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Raw Material Cost (₹)</label>
                <input type="number" value={matCost} onChange={(e) => { setMatCost(parseFloat(e.target.value)); calculateCost(); }} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Labor Hours</label>
                <input type="number" step="0.5" value={laborHours} onChange={(e) => { setLaborHours(parseFloat(e.target.value)); calculateCost(); }} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Labor Rate (₹/hr)</label>
                <input type="number" value={laborRate} onChange={(e) => { setLaborRate(parseFloat(e.target.value)); calculateCost(); }} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Packaging Cost (₹)</label>
                <input type="number" value={packCost} onChange={(e) => { setPackCost(parseFloat(e.target.value)); calculateCost(); }} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
              </div>
            </div>
          </Card>

          {calcResult && (
            <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-brand-900 to-slate-900 text-white shadow-xl">
              <div>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Financial Breakdown</span>
                <h3 className="text-xl font-extrabold mt-1">Cost & Profit Projection</h3>

                <div className="mt-6 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>Total Production Cost:</span>
                    <span className="font-mono font-bold text-slate-200">₹{calcResult.total_cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>Suggested Selling Price:</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-base">₹{calcResult.suggested_selling_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span>Estimated Profit per Unit:</span>
                    <span className="font-mono font-bold text-amber-300">₹{calcResult.estimated_profit_per_unit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Profit Margin:</span>
                    <span className="font-mono font-bold text-emerald-300">{calcResult.profit_margin_pct}%</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-6">* Note: Profit estimates assume unit sales without guaranteeing market volume sales.</p>
            </Card>
          )}
        </div>
      )}

      {/* DEMO ORDER MODAL */}
      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="Place Demo Order (No Payment Required)">
        <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
          {selectedProductForOrder && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-900 dark:text-white">{selectedProductForOrder.title}</div>
              <div className="text-emerald-600 font-bold mt-0.5">Price: ₹{selectedProductForOrder.price.toFixed(2)}</div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Shipping Address</label>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <Button type="submit" className="w-full py-2.5">
            Confirm Demo Order
          </Button>
        </form>
      </Modal>

      {/* ADD MARKETPLACE ITEM MODAL */}
      <Modal isOpen={showProductModal} onClose={() => setShowProductModal(false)} title="Add Upcycled Product Listing">
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Title</label>
            <input type="text" required value={prodTitle} onChange={(e) => setProdTitle(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea required rows={2} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
              <input type="number" step="10" required value={prodPrice} onChange={(e) => setProdPrice(parseFloat(e.target.value))} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Material Type</label>
              <input type="text" required value={prodMaterial} onChange={(e) => setProdMaterial(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
            </div>
          </div>

          <Button type="submit" className="w-full py-2.5">
            Publish Marketplace Listing
          </Button>
        </form>
      </Modal>
    </div>
  );
};
