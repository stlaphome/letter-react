import { configureStore } from "@reduxjs/toolkit";

import storage from "redux-persist/lib/storage";

import { persistStore, persistReducer } from "redux-persist";
import thunk from "redux-thunk";

import DynamicReportReducer from "./DynamicReport/DynamicReportReducer";
import Branch from "./Branch";

const persistConfig = {
  key: "branch",
  storage,
};
const persistedReducer = persistReducer(persistConfig, Branch);
const store = configureStore({
  reducer: {
    branch: persistedReducer,
    letterGeneration: DynamicReportReducer,
  },
  middleware: [thunk],
});
export const persistor = persistStore(store);
export default store;
