import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface ISidebarState {
    sidebarState?: "purchases" | "leases" | "shortStay";
}

const initialState: ISidebarState = {
    sidebarState: 'purchases',
};

const sidebarStateSlice = createSlice({
    name: "sidebarState",
    initialState,
    reducers: {
        updateSidebarState: (state, action: PayloadAction<ISidebarState["sidebarState"]>) => {
            state.sidebarState = action.payload;
            return state;
        },
    },
});

// Other code such as selectors can use the imported `RootState` type
export const SidebarState = (state: RootState) => state.sidebarState;

export const {
    updateSidebarState
} = sidebarStateSlice.actions;

export default sidebarStateSlice.reducer;
