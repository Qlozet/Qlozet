import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface ProfileImage {
//   id: number;
//   url: string;
//   media_type: string;
//   access_level: string;
// }

interface ProfileCompletionRate {
  profile_completion_rate: number;
  buyerprofile_completion_rate: number;
  renterprofile_completion_rate: number;
}

interface CustomerProfileState {
  profile_img_url: string | null;
  profile_type: string | null;
  customer_type: string | null;
  is_completed: boolean;
  profile_completion_rate: ProfileCompletionRate;
}

const initialState: CustomerProfileState = {
  profile_img_url: null,
  profile_type: null,
  customer_type: null,
  is_completed: false,
  profile_completion_rate: {
    profile_completion_rate: 0,
    buyerprofile_completion_rate: 0,
    renterprofile_completion_rate: 0,
  },
};

const customerProfileSlice = createSlice({
  name: 'customerProfile',
  initialState,
  reducers: {
    setProfileImageUrl: (state, action: PayloadAction<string>) => {
      state.profile_img_url = action.payload;
    },
    setProfileType: (state, action: PayloadAction<string>) => {
      state.profile_type = action.payload;
    },
    setCustomerType: (state, action: PayloadAction<string>) => {
      state.customer_type = action.payload;
    },
    setIsProfileComplete: (state, action: PayloadAction<boolean>) => {
      state.is_completed = action.payload;
    },
    setProfileCompletionRate: (state, action: PayloadAction<ProfileCompletionRate>) => {
      state.profile_completion_rate = action.payload;
    },
    clearProfile: (state) => {
      state.profile_img_url = null;
      state.profile_type = null;
      state.customer_type = null;
      state.profile_completion_rate = {
        profile_completion_rate: 0,
        buyerprofile_completion_rate: 0,
        renterprofile_completion_rate: 0,
      };
    },
  },
});

export const {
  setProfileImageUrl,
  setProfileType,
  setCustomerType,
  setIsProfileComplete,
  setProfileCompletionRate,
  clearProfile,
} = customerProfileSlice.actions;

export default customerProfileSlice.reducer;
