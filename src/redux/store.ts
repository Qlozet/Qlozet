import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE
} from "redux-persist";
import { setupListeners } from "@reduxjs/toolkit/query";
import rootReducer, { rootPersistConfig } from "./root-reducer";
import { baseAPI, custom401Middleware } from "./api/base-api";
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

const reducer = persistReducer<ReturnType<typeof rootReducer>>(
  rootPersistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(baseAPI.middleware)
      .concat(productsApiSlice.middleware)
      .concat(customersApiSlice.middleware)
      .concat(ordersApiSlice.middleware)
      .concat(dashboardApiSlice.middleware)
      .concat(authApiSlice.middleware)
      .concat(settingsApiSlice.middleware)
      .concat(supportApiSlice.middleware)
      .concat(notificationApiSlice.middleware)
      .concat(walletApiSlice.middleware)
      .concat(productDetailsApiSlice.middleware)
      .concat(custom401Middleware),

  devTools: process.env.NODE_ENV !== "production",
});

// enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
