import { combineReducers } from "@reduxjs/toolkit";

import { baseAPI } from "./api/base-api";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import storage from "redux-persist/lib/storage";
import customerProfileReducer from "./slices/customer-profile-slice";
import onboardingSessionReducer from "./slices/onboarding-session-slice";
import sidebarStateReducers from "./slices/sidebar-state-slice";

export const rootPersistConfig = {
    key: "root",
    storage,
    keyPrefix: "Oolom-customer-",
    whitelist: ["sidebarState"],
    blacklist: [baseAPI.reducerPath]
};

const rootReducer = combineReducers({
    [baseAPI.reducerPath]: baseAPI.reducer,
    customerProfile: customerProfileReducer,
    onboardingSession: onboardingSessionReducer,
    sidebarState: sidebarStateReducers
});

export default rootReducer;
