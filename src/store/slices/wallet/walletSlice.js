import {createSlice} from "@reduxjs/toolkit";

const WalletSlice = createSlice({
    name: "wallets",
    initialState: {
        currentWallet: null
    },
    reducers: {
        setCurrentAddress: (state, action) => {
            state.currentWallet = action.payload;
            // console.log(action.payload);
        },
    },
});

export const {
    setCurrentAddress
} = WalletSlice.actions;
export default WalletSlice;
