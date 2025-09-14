import { combineReducers } from "@reduxjs/toolkit";

import { baseAPI } from "./api/base-api";
import storage from "redux-persist/lib/storage";
import { filterSliceReducer } from "./slices/filter-slice";
import { productsApiSlice } from "./services/products/products.api-slice";
import { customersApiSlice } from "./services/customers/customers.api-slice";
import { ordersApiSlice } from "./services/orders/orders.api-slice";
import { dashboardApiSlice } from "./services/dashboard/dashboard.api-slice";
import { authApiSlice } from "./services/auth/auth.api-slice";
import { settingsApiSlice } from "./services/settings/settings.api-slice";
import { supportApiSlice } from "./services/support/support.api-slice";
import { notificationApiSlice } from "./services/notification/notification.api-slice";
import { walletApiSlice } from "./services/wallet/wallet.api-slice";
import { productDetailsApiSlice } from "./services/product-details/product-details.api-slice";

export const rootPersistConfig = {
    key: "root",
    storage,
    keyPrefix: "Qlozet-",
    blacklist: [
        baseAPI.reducerPath,
        productsApiSlice.reducerPath,
        customersApiSlice.reducerPath,
        ordersApiSlice.reducerPath,
        dashboardApiSlice.reducerPath,
        authApiSlice.reducerPath,
        settingsApiSlice.reducerPath,
        supportApiSlice.reducerPath,
        notificationApiSlice.reducerPath,
        walletApiSlice.reducerPath,
        productDetailsApiSlice.reducerPath
    ]
};

const rootReducer = combineReducers({
    [baseAPI.reducerPath]: baseAPI.reducer,
    filter: filterSliceReducer,
});

export default rootReducer;
