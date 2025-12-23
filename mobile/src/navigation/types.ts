export type RootStackParamList = {
  MainTabs: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  EditActivity: { activityId: string; tripId: string };
  EditMeal: { meal: any; onSave: () => void };
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
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};
