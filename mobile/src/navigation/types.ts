export type RootStackParamList = {
  MainTabs: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  EditActivity: { activityId: string; tripId: string };
  Subscription: undefined;
  Payment: { planId: string };
  ManageSubscription: undefined;
  TravelPreferences: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trips: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};
