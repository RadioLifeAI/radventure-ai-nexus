
export type AdminRole = 
  | 'DEV'
  | 'TechAdmin'
  | 'WebSecuritySpecialist'
  | 'ContentEditor'
  | 'WebPerformanceSpecialist'
  | 'WebAnalyticsManager'
  | 'DigitalMarketingSpecialist'
  | 'EcommerceManager'
  | 'CustomerSupportCoordinator'
  | 'ComplianceOfficer'
  | 'ADMIN_DEV'
  | 'SHIELD_MASTER'
  | 'LORE_CRAFTER'
  | 'SPEED_WIZARD'
  | 'DATA_SEER'
  | 'GROWTH_HACKER'
  | 'LOOT_KEEPER'
  | 'HELP_RANGER'
  | 'LAW_GUARDIAN';

export type PermissionAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';
export type ResourceType = 'USERS' | 'CASES' | 'EVENTS' | 'SUBSCRIPTIONS' | 'ANALYTICS' | 'SETTINGS' | 'AI_TUTOR' | 'CONTENT' | 'PAYMENTS' | 'SUPPORT';

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  type: 'USER' | 'ADMIN';
  academic_stage: 'Student' | 'Intern' | 'Resident' | 'Specialist';
  medical_specialty: string;
  total_points: number;
  radcoin_balance: number;
  created_at: string;
  city: string;
  state: string;
  bio?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
};

export type AITutorConfig = {
  id: string;
  config_name: string;
  model_name: string;
  api_provider: string;
  prompt_template: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
};

export type Achievement = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon_url?: string;
  rarity: string;
  points_required?: number;
  conditions: Record<string, any>;
  rewards?: Record<string, any>;
  is_active: boolean;
};
