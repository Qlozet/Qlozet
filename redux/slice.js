import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: "",
  email: "",
  logout: false
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.state = action.payload;
    },
    setEmail: (state, action) => {
      state.email = action.payload
    },
    handlelogout: (state, action) => {
      state.logout = action.payload.logout
    }
  },
});

export const { setFilter, setEmail, handlelogout } = filterSlice.actions;
export const reduxData = (state) => state.filter;

export const sliceReducer = filterSlice.reducer;
