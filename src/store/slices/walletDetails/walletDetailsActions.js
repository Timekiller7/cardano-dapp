import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { setExtension, displayStates, displayFee, exchangeRateForMint, exchangeRateForBurn } from "../../../cardano/nft";
import { offchainConstants } from "../../../cardano/nft/offchainConstants";
import { convertBigIntToFloat, convertFloatToBigInt, displayPriceFix } from "../../../components/mint-and-burn-forms/common";
import { showErrorNotification } from "../notifications/notificationsSlice";
import {setGetMintOperationDetailsByApiStartTimeStamp, setGetBurnOperationDetailsByApiStartTimeStamp} from './walletDetailsSlice';

export const getCurrentTime = createAsyncThunk(
  "walletDetails/getCurrentTime",
  async (numberOfAttempts, thunkAPI) => {
    // console.log("fetching time...");
    let date;
    for (let i = 0; i < numberOfAttempts; i++) {
      try {
        const result = await axios.get(
          "https://worldtimeapi.org/api/timezone/Etc/UTC"
        );
        date = new Date(result.data.datetime).toISOString();
        break;
      } catch (e) {
        // console.log("Attempt failed e=" + e);
        if (i === numberOfAttempts - 1) {
          console.warn("this was last try. fallback to user time");
          date = new Date().toISOString();
        }
      }
    }
    return date;
  }
);

export const getWalletDetailsByApi = createAsyncThunk(
  "walletDetails/getWalletDetailsByApi",
  async (_, { getState, dispatch }) => {
    // console.log("getWalletDetailsByApi createAsyncThunk: start");

    let state = getState();
    const startCurrentWallet = state.wallets.currentWallet;

    const emptyMainDetails = {
      balance: undefined,
      minCurrencyAmount: undefined,
      maxMintAmount: undefined,
      maxBurnAmount: undefined,
    };

    const mainDetails = {
      balance: undefined,
      minCurrencyAmount: undefined,
      maxMintAmount: undefined,
      maxBurnAmount: undefined,
    };

    if (!state.wallets.currentWallet) {
      return JSON.stringify(mainDetails);
    }

    const currentExtension = state.wallets.currentWallet.extension;
    const currentAddress = state.wallets.currentWallet.address;
    setExtension(currentExtension, currentAddress);

    try {
      const offchainStates = await displayStates(
        state.wallets.currentWallet.extension,
        state.wallets.currentWallet.address
      );
      const userBalance = convertBigIntToFloat(offchainStates.balance);
      const maxMintAmount = convertBigIntToFloat(offchainStates.maxMint);
      const maxBurnAmount = convertBigIntToFloat(offchainStates.maxBurn);

      // console.log("convertBigIntToFloat: ", userBalance, "  ", maxMintAmount, "  ", maxBurnAmount)

      mainDetails.balance = userBalance;
      mainDetails.minCurrencyAmount = offchainConstants.minCurrencyAmount;
      mainDetails.maxMintAmount = maxMintAmount;
      mainDetails.maxBurnAmount = maxBurnAmount;
    } catch (e) {
      console.error(e);
      dispatch(showErrorNotification({ message: e.message }));
    }

    state = getState();
    const endCurrentWallet = state.wallets.currentWallet;
    const isWalletActual = startCurrentWallet === endCurrentWallet;

    if (!isWalletActual) {
      return JSON.stringify(emptyMainDetails);
    }
    return JSON.stringify(mainDetails);
  }
);

export const getMintOperationDetailsByApi = createAsyncThunk(
  "walletDetails/getMintOperationDetailsByApi", async ({ inputValue, isOperationDetailsFetchAccessible, active }, { dispatch, getState, rejectWithValue }) => {
    // console.log("getMintOperationDetailsByApi createAsyncThunk: start");
    const startTime = (new Date()).getTime();
    dispatch(setGetMintOperationDetailsByApiStartTimeStamp(startTime));

    let state = getState();

    const mintOperationDetails = {
      pay: undefined,
      serviceFee: undefined,
      approxBlockchainFee: undefined,
      totalPayment: undefined,
    };
    // console.log("getMintOperationDetailsByApi createAsyncThunk: isOperationDetailsFetchAccessible="+isOperationDetailsFetchAccessible);
    if (!isOperationDetailsFetchAccessible) {
      if(startTime !== getState().walletDetails.getMintOperationDetailsByApiStartTimeStamp){
        return rejectWithValue('fetched data is deprecated');
      }else{
        return JSON.stringify(mintOperationDetails);
      }
    }
    mintOperationDetails.pay = convertBigIntToFloat(BigInt(displayPriceFix(convertFloatToBigInt(Number(inputValue)), exchangeRateForMint))); //TODO: from smart
    mintOperationDetails.serviceFee = offchainConstants.serviceFee;
    if (state.wallets.currentWallet) {
      const maxValue = state.walletDetails.mainDetails.maxMintAmount;
      if ((Number(inputValue) > 0) && (Number(inputValue) <= Number(maxValue))) {
        console.log("inputValue > 0 && inputValue <= maxValue =" + (inputValue > 0 && inputValue <= maxValue));
        try {
          mintOperationDetails.approxBlockchainFee = convertBigIntToFloat(await displayFee(convertFloatToBigInt(Number(inputValue)), true));
          mintOperationDetails.totalPayment = (Number(mintOperationDetails.pay) + Number(mintOperationDetails.approxBlockchainFee)).toFixed(offchainConstants.DECIMAL_PLACES_NUMBER);
        } catch (exception) {
          console.error(exception);
          let error = new Error(exception);
          error.message = "approximateBlockchainFee: " + error.message;
          console.error(error);
          dispatch(showErrorNotification({ message: error.message }));
        } 
      }
    }
    const result = JSON.stringify(mintOperationDetails);
    // console.log("result=" + result);
    if(startTime !== getState().walletDetails.getMintOperationDetailsByApiStartTimeStamp){
      return rejectWithValue('fetched data is deprecated');
    }else{
      return result;
    }
  }
);

export const getBurnOperationDetailsByApi = createAsyncThunk(
  "walletDetails/getBurnOperationDetailsByApi",
  async (
    { inputValue, isOperationDetailsFetchAccessible, active },
    { dispatch, getState, rejectWithValue }
  ) => {
    console.log("getBurnOperationDetailsByApi createAsyncThunk: start");
    const startTime = (new Date()).getTime();
    dispatch(setGetBurnOperationDetailsByApiStartTimeStamp(startTime));

    let state = getState();
    // dispatch(setIsBurnOperationDetailsLoading(true));
    const burnOperationDetails = {
      get: undefined,
      serviceFee: undefined,
      approxBlockchainFee: undefined,
      totalPayment: undefined,
    };
    if (!isOperationDetailsFetchAccessible) {
      if(startTime !== getState().walletDetails.getBurnOperationDetailsByApiStartTimeStamp){
        return rejectWithValue('fetched data is deprecated');
      }else{
        return JSON.stringify(burnOperationDetails);
      }
    }
    burnOperationDetails.get = convertBigIntToFloat(BigInt(displayPriceFix(convertFloatToBigInt(Number(inputValue)), exchangeRateForBurn))); //TODO: from smart
    burnOperationDetails.serviceFee = offchainConstants.serviceFee;
    if (state.wallets.currentWallet) {
      const maxValue = state.walletDetails.mainDetails.maxBurnAmount;
      if ((Number(inputValue) > 0) && (Number(inputValue) <= Number(maxValue))) {
        try {
          burnOperationDetails.approxBlockchainFee = convertBigIntToFloat(await displayFee(convertFloatToBigInt(Number(inputValue)), false));
          burnOperationDetails.totalPayment = (
            Number(burnOperationDetails.get) -
            Number(burnOperationDetails.approxBlockchainFee)
          ).toFixed(offchainConstants.DECIMAL_PLACES_NUMBER);
        } catch (exception) {
          console.error(exception);
          let error = new Error(exception);
          error.message = "approximateBlockchainFee: " + error.message;
          console.error(error);
          dispatch(showErrorNotification({ message: error.message }));
        }
      }
    }
    const result = JSON.stringify(burnOperationDetails);
    // console.log("result=" + result);
    if(startTime !== getState().walletDetails.getBurnOperationDetailsByApiStartTimeStamp){
      return rejectWithValue('fetched data is deprecated');
    }else{
      return result;
    }
  }
);