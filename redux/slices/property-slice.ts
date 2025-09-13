import { createSlice } from '@reduxjs/toolkit';

interface Property {
  id: string;
  [key: string]: any;
}

interface Building {
  id: string;
  [key: string]: any;
}

interface Floor {
  id: string;
  [key: string]: any;
}

interface PropertyState {
  properties: Property[];
  buildings: Building[];
  unitDetails: any | null;
  availabilityDetails: any | null;
  floors: Floor[];
  shortStayCardDetails: any | null;
}

const initialState: PropertyState = {
  properties: [],
  buildings: [],
  unitDetails: null,
  availabilityDetails: null,
  floors: [],
  shortStayCardDetails: null,
};

const slice = createSlice({
  name: 'propertySlice',
  initialState,
  reducers: {

    setUnitDetails: (state, { payload }) => {
      state.unitDetails = payload;
    },
    setPropertyAvailabilityDetails: (state, { payload }) => {
      state.availabilityDetails = payload;
    },
    setFloor: (state, { payload }: { payload: Floor }) => {
      state.floors.push(payload);
    },
    setShortStayCardDetails: (state, { payload }) => {
      state.shortStayCardDetails = payload;
    },
    updateFloorUnit: (state, { payload }: { payload: Floor }) => {
      const floorIndex = state.floors.findIndex(floor => floor.id === payload.id);
      if (floorIndex >= 0) {
        state.floors[floorIndex] = { ...payload };
      }
    },
  },
});

export const {
  setUnitDetails,
  setFloor,
  updateFloorUnit,
  setShortStayCardDetails,
  setPropertyAvailabilityDetails,
} = slice.actions;
export default slice.reducer;
