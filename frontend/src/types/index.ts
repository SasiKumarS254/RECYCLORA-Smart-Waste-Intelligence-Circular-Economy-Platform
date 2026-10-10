export type UserRole = 'citizen' | 'collector' | 'recycler' | 'administrator' | 'analyst';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  area?: string;
  avatar_url?: string;
  badge_count: number;
  created_at: string;
}

export interface WasteReport {
  id: number;
  reporter_id: number;
  category: string;
  description: string;
  image_url?: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'verified' | 'assigned' | 'in_progress' | 'resolved';
  assigned_collector_id?: number;
  created_at: string;
  updated_at: string;
  reporter?: User;
  collector?: User;
  status_history?: Array<{
    id: number;
    status: string;
    notes?: string;
    timestamp: string;
  }>;
}

export interface PickupRequest {
  id: number;
  citizen_id: number;
  category: string;
  estimated_weight_kg: number;
  time_slot: string;
  scheduled_date: string;
  status: 'requested' | 'scheduled' | 'completed' | 'cancelled';
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  notes?: string;
  created_at: string;
  citizen?: User;
  assignment?: {
    id: number;
    collector_id: number;
    vehicle_details: string;
    scheduled_time: string;
    status: string;
    collector?: User;
  };
}

export interface BinReading {
  id: number;
  bin_code: string;
  location_name: string;
  area: string;
  capacity_liters: number;
  current_fill_pct: number;
  battery_pct: number;
  status: 'normal' | 'warning' | 'overflow';
  latitude: number;
  longitude: number;
  last_updated: string;
}

export interface DrainReport {
  id: number;
  reporter_id: number;
  title: string;
  location_name: string;
  area: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'inspecting' | 'cleaning' | 'cleared';
  image_url?: string;
  description: string;
  assigned_to?: string;
  latitude: number;
  longitude: number;
  created_at: string;
  reporter?: User;
}

export interface CleanupEvent {
  id: number;
  organizer_id: number;
  title: string;
  description: string;
  location_name: string;
  area: string;
  event_date: string;
  max_volunteers: number;
  registered_count: number;
  status: 'upcoming' | 'active' | 'completed';
  badge_earned: string;
  latitude: number;
  longitude: number;
  created_at: string;
  organizer?: User;
}

export interface EducationalContent {
  id: number;
  module: 'refuse' | 'reduce' | 'reuse' | 'repurpose' | 'recycle';
  title: string;
  summary: string;
  content: string;
  diy_steps_json?: string[];
  quiz_questions_json?: Array<{
    question: string;
    options: string[];
    answer: number;
  }>;
  icon: string;
  estimated_read_time: number;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  category: string;
  reuse_options_json?: string[];
  recycling_methods_json?: string[];
  industrial_process?: string;
  diy_guides_json?: Array<{
    title: string;
    difficulty: string;
    tools: string[];
    cost: number;
  }>;
  environmental_impact_score: number;
}

export interface Product {
  id: number;
  seller_id: number;
  title: string;
  description: string;
  category: string;
  material_type: string;
  price: number;
  quantity: number;
  production_method: string;
  diy_level: 'easy' | 'intermediate' | 'advanced';
  image_url?: string;
  status: 'draft' | 'active' | 'sold' | 'moderated';
  environmental_saving_kg_co2: number;
  created_at: string;
  seller?: User;
}

export interface MaterialExchangeListing {
  id: number;
  lister_id: number;
  title: string;
  material_category: string;
  weight_kg: number;
  location_area: string;
  price_per_kg: number;
  status: 'available' | 'reserved' | 'completed';
  description: string;
  created_at: string;
  lister?: User;
}

export interface CountryProfile {
  id: number;
  country_name: string;
  country_code: string;
  recycling_rate_pct: number;
  primary_methods_json: string[];
  case_study_title: string;
  case_study_content: string;
  limitations: string;
  infrastructure: string;
  reference_urls_json: string[];
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  action_link?: string;
  created_at: string;
}

export interface ForecastPoint {
  date: string;
  predicted_weight_kg: number;
  lower_bound_kg: number;
  upper_bound_kg: number;
}

export interface ForecastingResponse {
  model_name: string;
  validation_metrics: {
    MAE: number;
    RMSE: number;
    R2: number;
  };
  train_sample_size: number;
  test_sample_size: number;
  forecast: ForecastPoint[];
  limitations: string;
}

export interface CleanlinessIndicator {
  area: string;
  cleanliness_score: number;
  total_reports_count: number;
  resolved_reports_count: number;
  status_label: string;
  data_source_label: string;
}

export interface AuditLogOut {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  timestamp: string;
}
