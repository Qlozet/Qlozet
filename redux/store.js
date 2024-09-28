import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { sliceReducer } from "./slice";

const rootReducer = combineReducers({
  filter: sliceReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Use `store.getState()` to get the root state
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
