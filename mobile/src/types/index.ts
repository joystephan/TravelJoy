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

export interface TravelPreferences {
  activityType?: string;
  foodPreference?: string;
  transportPreference?: string;
  schedulePreference?: string;
}
