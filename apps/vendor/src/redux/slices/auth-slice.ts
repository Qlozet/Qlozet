import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ---- Types ----

export interface Business {
  _id: string;
  business_name: string;
  business_logo_url?: string | null;
  status?: string;
  role: string;
  role_id: string;
  is_owner: boolean;
}

export interface ActiveBusiness {
  _id: string;
  business_name: string;
  role: string;
  is_owner: boolean;
}

interface AuthState {
  businesses: Business[];
  activeBusiness: ActiveBusiness | null;
  mustChangePassword: boolean;
}

const initialState: AuthState = {
  businesses: [],
  activeBusiness: null,
  mustChangePassword: false,
};

// ---- Slice ----

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called after a successful login to hydrate the full auth state. */
    setCredentials: (
      state,
      action: PayloadAction<{
        businesses?: Business[];
        activeBusiness?: ActiveBusiness | null;
        mustChangePassword?: boolean;
      }>
    ) => {
      if (action.payload.businesses !== undefined) {
        state.businesses = action.payload.businesses;
      }
      if (action.payload.activeBusiness !== undefined) {
        state.activeBusiness = action.payload.activeBusiness;
      }
      if (action.payload.mustChangePassword !== undefined) {
        state.mustChangePassword = action.payload.mustChangePassword;
      }
    },

    /** Called after switching businesses — updates active business only. */
    setActiveBusiness: (state, action: PayloadAction<ActiveBusiness>) => {
      state.activeBusiness = action.payload;
    },

    /** Called after a forced password change to clear the flag. */
    clearMustChangePassword: (state) => {
      state.mustChangePassword = false;
    },

    /** Called on logout to reset everything. */
    clearAuth: () => initialState,
  },
});

export const {
  setCredentials,
  setActiveBusiness,
  clearMustChangePassword,
  clearAuth,
} = authSlice.actions;

// ---- Selectors ----
export const selectBusinesses = (state: { auth: AuthState }) =>
  state.auth.businesses;
export const selectActiveBusiness = (state: { auth: AuthState }) =>
  state.auth.activeBusiness;
export const selectMustChangePassword = (state: { auth: AuthState }) =>
  state.auth.mustChangePassword;

export const authSliceReducer = authSlice.reducer;
