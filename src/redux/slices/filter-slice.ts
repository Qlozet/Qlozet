import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  state: string;
  email: string;
  logout: boolean;
}

const initialState: FilterState = {
  state: '',
  email: '',
  logout: false,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      state.state = action.payload;
    },
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    handlelogout: (state, action: PayloadAction<{ logout: boolean }>) => {
      state.logout = action.payload.logout;
    },
  },
});

export const { setFilter, setEmail, handlelogout } = filterSlice.actions;
export const reduxData = (state: { filter: FilterState }) => state.filter;

export const filterSliceReducer = filterSlice.reducer;
