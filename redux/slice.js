import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: "",
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.state = action.payload;
    },
  },
});

export const { setFilter } = filterSlice.actions;
export const sliceReducer = filterSlice.reducer;
