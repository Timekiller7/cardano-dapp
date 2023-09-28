import { configureStore } from '@reduxjs/toolkit';
import walletSlice from './slices/wallet/walletSlice';
import notificationsSlice from './slices/notifications/notificationsSlice';
import applicationSlice from './slices/application/appSlice';
import walletDetailsSlice from './slices/walletDetails/walletDetailsSlice';
// import {loadState} from "../utils/browserStorage";

const reducer = {
  wallets: walletSlice.reducer,
  notifications: notificationsSlice.reducer,
  application: applicationSlice.reducer,
  walletDetails: walletDetailsSlice.reducer,
};

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV === 'development',
  // preloadedState: loadState(), 
});
window.store = store;
export default store;
export {reducer};
