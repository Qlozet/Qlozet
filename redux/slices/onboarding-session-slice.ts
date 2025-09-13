import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'onboardingSession',
  initialState: {
    payload: '',
    PlanSubscriptionDetails: {
      plan: null,
      userCounter: null,
      chargingPeriod: null,
      chargeAmount: null,
      trialOrSubscription: null,
    },
    isUserLoggedIn: false,
    userProfile: {
      first_name: null,
      last_name: null,
      email: null,
      country: null,
      phone_number: null,
    },
  },
  reducers: {
    getOnboardingSessionId: (state, { payload }) => {
      state.payload = payload;
    },
    setPlanSubscriptionAndUserCounter: (state, { payload }) => {
      state.PlanSubscriptionDetails = payload;
    },
    setUserLoggedIn: (state, { payload }) => {
      state.isUserLoggedIn = payload;
    },
    setUserLoggedInData: (state, { payload }) => {
      state.userProfile = payload;
    },
  },
});

export const {
  getOnboardingSessionId,
  setPlanSubscriptionAndUserCounter,
  setUserLoggedIn,
  setUserLoggedInData,
} = slice.actions;
export default slice.reducer;
