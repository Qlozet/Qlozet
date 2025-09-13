import { createSlice } from "@reduxjs/toolkit";
import { BuildingTypeSchema } from "@/lib/utils/building-type-schema";

interface BuildingDetails {
  buildingName: string | null;
  buildingType: BuildingTypeSchema | null;
  buildingAddress: string | null;
  buildingDescription: string | null;
  numberOfFloors: number | null;
  numberOfUnits: number | null;
  actionType?: "save" | "submit" | null;
}

interface UnitDetails {
  unitNumber: string | null;
  unitType: string | null;
  floorNumber: number | null;
  unitSize: number | null;
  numberOfRooms: number | null;
  rentAmount: number | null;
}

interface Document {
  id: string;
  name: string;
  url: string;
}

interface BuildingSetupState {
  buildingDetails: BuildingDetails;
  unitDetails: UnitDetails;
  documents: Document[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BuildingSetupState = {
  buildingDetails: {
    buildingName: null,
    buildingType: null,
    buildingAddress: null,
    buildingDescription: null,
    numberOfFloors: null,
    numberOfUnits: null,
    actionType: null,
  },
  unitDetails: {
    unitNumber: null,
    unitType: null,
    floorNumber: null,
    unitSize: null,
    numberOfRooms: null,
    rentAmount: null,
  },
  documents: [],
  isLoading: false,
  error: null,
};

const slice = createSlice({
  name: "buildingSetup",
  initialState,
  reducers: {
    setBuildingDetails: (
      state,
      { payload }: { payload: Partial<BuildingDetails> }
    ) => {
      state.buildingDetails = { ...state.buildingDetails, ...payload };
    },
    setUnitDetails: (state, { payload }: { payload: Partial<UnitDetails> }) => {
      state.unitDetails = { ...state.unitDetails, ...payload };
    },
    addDocument: (state, { payload }: { payload: Document }) => {
      state.documents.push(payload);
    },
    removeDocument: (state, { payload }: { payload: string }) => {
      state.documents = state.documents.filter((doc) => doc.id !== payload);
    },
    setLoading: (state, { payload }: { payload: boolean }) => {
      state.isLoading = payload;
    },
    setError: (state, { payload }: { payload: string | null }) => {
      state.error = payload;
    },
    resetBuildingSetup: (state) => {
      state.buildingDetails = initialState.buildingDetails;
      state.unitDetails = initialState.unitDetails;
      state.documents = [];
      state.error = null;
    },
  },
});

export const {
  setBuildingDetails,
  setUnitDetails,
  addDocument,
  removeDocument,
  setLoading,
  setError,
  resetBuildingSetup,
} = slice.actions;

export default slice.reducer;
