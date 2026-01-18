import { combineReducers } from '@reduxjs/toolkit';

import { baseAPI } from './api/base-api';
import storage from 'redux-persist/lib/storage';
import { filterSliceReducer } from './slices/filter-slice';
// Individual API slices are no longer needed here when using injectEndpoints
// They are automatically included in the baseAPI.reducer

export const rootPersistConfig = {
  key: 'root',
  storage,
  keyPrefix: 'Qlozet-',
  blacklist: [
    baseAPI.reducerPath, // All API slices use the same reducer path when using injectEndpoints
  ],
};

const rootReducer = combineReducers({
  [baseAPI.reducerPath]: baseAPI.reducer,
  filter: filterSliceReducer,
});

export default rootReducer;
