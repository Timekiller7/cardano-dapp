import { createSlice } from "@reduxjs/toolkit";
import {getCurrentTime, getWalletDetailsByApi, getMintOperationDetailsByApi, getBurnOperationDetailsByApi} from './walletDetailsActions';

const walletDetailsSlice = createSlice({
  name: "walletDetails",
  initialState: { //all numerical values are floating point Numbers
    isMainDetailsLoading: false,
    mainDetails: {
      balance: undefined,
      minCurrencyAmount: undefined,
      maxMintAmount: undefined,
      maxBurnAmount: undefined,
    },
    
    isTimeLoading: false,
    currentTime: undefined,

    isRatesUpdating: false,

    isMintOperationDetailsLoading: false,
    getMintOperationDetailsByApiStartTimeStamp: undefined,
    mintOperationDetails: {
      pay:undefined,
      serviceFee:undefined,
      approxBlockchainFee:undefined,
      totalPayment:undefined
    },
    isBurnOperationDetailsLoading: false,
    getBurnOperationDetailsByApiStartTimeStamp: undefined,
    burnOperationDetails:{
      get:undefined,
      serviceFee:undefined,
      approxBlockchainFee:undefined,
      totalPayment:undefined
    },

    noSpacesMintInputValue: undefined,
    noSpacesBurnInputValue: undefined,
  },
  reducers: {
    setIsMainDetailsLoading: (state, action) => {
      state.isMainDetailsLoading = action.payload;
    },
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload;
    },
    setIsRatesUpdating: (state, action) => {
      state.isRatesUpdating = action.payload;
    },
    setIsMintOperationDetailsLoading: (state, action) => {
      state.isMintOperationDetailsLoading = action.payload;
    },
    setGetMintOperationDetailsByApiStartTimeStamp: (state, action) => {
      state.getMintOperationDetailsByApiStartTimeStamp = action.payload;
    },
    setIsBurnOperationDetailsLoading: (state, action) => {
      state.isBurnOperationDetailsLoading = action.payload;
    },
    setGetBurnOperationDetailsByApiStartTimeStamp: (state, action) => {
      state.getBurnOperationDetailsByApiStartTimeStamp = action.payload;
    },
    setNoSpacesMintInputValue: (state, action) => {
      state.noSpacesMintInputValue = action.payload;
    },
    setNoSpacesBurnInputValue: (state, action) => {
      state.noSpacesBurnInputValue = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentTime.pending, (state) => {
        state.isTimeLoading = true;
      })
      .addCase(getCurrentTime.fulfilled, (state, action) => {
        state.isTimeLoading = false;
        state.currentTime = action.payload;
      })
      .addCase(getCurrentTime.rejected, (state, action) => {
        console.error(action);
        state.isTimeLoading = false;
      })

      .addCase(getWalletDetailsByApi.pending, (state) => {
        state.isMainDetailsLoading = true;
      })
      .addCase(getWalletDetailsByApi.fulfilled, (state, action) => {
        const mainDetails = JSON.parse(action.payload);
        state.mainDetails = mainDetails;
        state.isMainDetailsLoading = false;
      })
      .addCase(getWalletDetailsByApi.rejected, (state, action) => {
        console.error(action);
        state.isMainDetailsLoading = false;
      })

      .addCase(getMintOperationDetailsByApi.pending, (state, action) => {
        // console.log(action);
        setIsMintOperationDetailsLoading(true);     
      })
      .addCase(getMintOperationDetailsByApi.fulfilled, (state, action) => {
        // console.log(action.payload);
        const mintOperationDetails = JSON.parse(action.payload);
        state.mintOperationDetails = mintOperationDetails;
        setIsMintOperationDetailsLoading(false);
      })
      .addCase(getMintOperationDetailsByApi.rejected, (state, action) => {
        if(action.payload !== 'fetched data is deprecated'){
          console.error(action);
        }
        setIsMintOperationDetailsLoading(false);          
      })

      .addCase(getBurnOperationDetailsByApi.pending, (state, action) => {
      //  console.log(action);
        setIsBurnOperationDetailsLoading(true);     
      })
      .addCase(getBurnOperationDetailsByApi.fulfilled, (state, action) => {
        // console.log(action.payload);
        const burnOperationDetails = JSON.parse(action.payload);
        state.burnOperationDetails = burnOperationDetails;
        setIsBurnOperationDetailsLoading(false);
      })
      .addCase(getBurnOperationDetailsByApi.rejected, (state, action) => {
        if(action.payload !== 'fetched data is deprecated'){
          console.error(action);
        }
        setIsBurnOperationDetailsLoading(false);         
      })
  },
});
export const {
  setWalletDetails,
  setIsMainDetailsLoading,
  setCurrentTime,
  setIsRatesUpdating,
  setIsMintOperationDetailsLoading,
  setGetMintOperationDetailsByApiStartTimeStamp,
  setIsBurnOperationDetailsLoading,
  setGetBurnOperationDetailsByApiStartTimeStamp,

  setNoSpacesMintInputValue,
  setNoSpacesBurnInputValue
} = walletDetailsSlice.actions;
export default walletDetailsSlice;
