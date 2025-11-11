export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tripsThisMonth: number;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface Trip {
  id: string;
  destination: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  status: string;
  dailyPlans?: DailyPlan[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DailyPlan {
  id: string;
  date: Date;
  activities: Activity[];
  meals: Meal[];
  transportations: Transportation[];
  estimatedCost: number;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  duration: number;
  cost: number;
  category: string;
  rating?: number;
  imageUrl?: string;
}

export interface Meal {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  mealType: string;
  cost: number;
  cuisine?: string;
}

export interface Transportation {
  id: string;
  fromLocation: string;
  toLocation: string;
  fromLatitude: number;
  fromLongitude: number;
  toLatitude: number;
  toLongitude: number;
  mode: string;
  duration: number;
  cost: number;
}

export interface TravelPreferences {
  activityType?: string[] | string;
  foodPreference?: string[] | string;
  transportPreference?: string[] | string;
  schedulePreference?: string;
}
