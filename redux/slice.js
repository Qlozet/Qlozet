import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  state: "",
  email: ""
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.state = action.payload;
    },

    setEmail: (state, action) => {
      console.log(action.payload)
      state.email = action.payload
    }
  },
});

export const { setFilter, setEmail } = filterSlice.actions;
export const sliceReducer = filterSlice.reducer;
