export const HOME_TYPES = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'condo', label: 'Condo' },
  { value: 'multi_family', label: 'Multi-Family' },
  { value: 'mobile_home', label: 'Mobile Home' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'other', label: 'Other' },
] as const

export const GARAGE_TYPES = [
  { value: 'attached', label: 'Attached' },
  { value: 'detached', label: 'Detached' },
  { value: 'carport', label: 'Carport' },
  { value: 'none', label: 'None' },
] as const

export const FREQUENCY_TYPES = [
  { value: 'once', label: 'One Time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Every 3 Months' },
  { value: 'semi_annual', label: 'Every 6 Months' },
  { value: 'annual', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
] as const

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
] as const

export const MEMBER_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full access to everything' },
  { value: 'contributor', label: 'Contributor', description: 'Can add/edit equipment and complete tasks' },
  { value: 'viewer', label: 'Viewer', description: 'View only access' },
] as const

export const TASK_STATUS_COLORS = {
  overdue: 'bg-red-100 text-red-800 border-red-200',
  due_soon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
} as const
