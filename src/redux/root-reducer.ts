import { combineReducers } from "@reduxjs/toolkit";

import { baseAPI } from "./api/base-api";
import storage from "redux-persist/lib/storage";
import { filterSliceReducer } from "./slices/filter-slice";

export const rootPersistConfig = {
    key: "root",
    storage,
    keyPrefix: "Qlozet-",
    blacklist: [baseAPI.reducerPath]
};

const rootReducer = combineReducers({
    [baseAPI.reducerPath]: baseAPI.reducer,
    filter: filterSliceReducer,
});

export default rootReducer;
