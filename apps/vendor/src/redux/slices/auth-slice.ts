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
  /**
   * The store picker in the app shell is open because the person lost access
   * to the store they had open; holds the message to show above the list.
   * Null when the picker is closed or was opened by choice.
   */
  storePickerReason: string | null;
  storePickerOpen: boolean;
}

const initialState: AuthState = {
  businesses: [],
  activeBusiness: null,
  mustChangePassword: false,
  storePickerReason: null,
  storePickerOpen: false,
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
        // A fresh sign-in starts with no leftover picker from last session.
        state.storePickerOpen = false;
        state.storePickerReason = null;
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
      state.storePickerOpen = false;
      state.storePickerReason = null;
    },

    /** Drop a store the person can no longer open from the switcher list. */
    forgetBusiness: (state, action: PayloadAction<string>) => {
      state.businesses = state.businesses.filter(
        (b) => b._id !== action.payload
      );
    },

    /** Open the shell's store picker, optionally forced with a reason. */
    openStorePicker: (state, action: PayloadAction<string | undefined>) => {
      state.storePickerOpen = true;
      state.storePickerReason = action.payload ?? null;
    },

    closeStorePicker: (state) => {
      state.storePickerOpen = false;
      state.storePickerReason = null;
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
  forgetBusiness,
  openStorePicker,
  closeStorePicker,
  clearMustChangePassword,
  clearAuth,
} = authSlice.actions;

// ---- Selectors ----
export const selectBusinesses = (state: { auth: AuthState }) =>
  state.auth.businesses;
export const selectActiveBusiness = (state: { auth: AuthState }) =>
  state.auth.activeBusiness;
export const selectStorePickerOpen = (state: { auth: AuthState }) =>
  state.auth.storePickerOpen ?? false;
export const selectStorePickerReason = (state: { auth: AuthState }) =>
  state.auth.storePickerReason ?? null;
export const selectMustChangePassword = (state: { auth: AuthState }) =>
  state.auth.mustChangePassword;

export const authSliceReducer = authSlice.reducer;
