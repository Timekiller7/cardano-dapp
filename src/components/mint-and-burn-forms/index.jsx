import Box from '@mui/material/Box';

import {offchainConstants} from '../../cardano/nft/offchainConstants';
import {lucid, exchangeRate, _changeRate, exchangeRateForBurn, exchangeRateForMint} from '../../cardano/nft';

import {setIsRatesUpdating} from '../../store/slices/walletDetails/walletDetailsSlice';

import MintForm from "./mint-form";
import BurnForm from "./burn-form";

import MintandburnButtonSmall from '../ui/mintandburn-button-small';

import {useStyles} from './styles';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {getCurrentTime, getWalletDetailsByApi} from '../../store/slices/walletDetails/walletDetailsActions';

const MintAndBurnForms = () => {

const classes = useStyles();
const dispatch = useDispatch();
const currentWallet = useSelector((state) => state.wallets.currentWallet);

useEffect(()=>{
    dispatch(getCurrentTime(15));
}, []);
useEffect(()=>{
    dispatch(getWalletDetailsByApi());
}, [currentWallet]);


function getExchangeRate(){
    const initialExchangeRate = offchainConstants.initialExchangeRate;
    const initialTime = new Date(offchainConstants.initialTime);
    const currentTime = new Date(walletDetails.currentTime);
    const millisecondsInDay = 86400000;
    const dayNumber =  Math.floor((currentTime.getTime()-initialTime.getTime())/millisecondsInDay);

    const currentExchangeRate = initialExchangeRate * Math.pow(1.02, (dayNumber/365));
    // console.log("initialExchangeRateForMinting=" + initialExchangeRateForMinting    );
    // console.log("currentExchangeRateForMinting=" + currentExchangeRateForMinting);
    return currentExchangeRate.toFixed(6);
}
function isSmartExchangeRateNeedUpdate(exchangeRateFrontEnd, exchangeRate){
    return BigInt(Math.round(exchangeRateFrontEnd * Math.pow(10, 6))) !== BigInt(exchangeRate);
}
async function changeRateOnSmart(){
    dispatch(setIsRatesUpdating(true));


    const dataObject = {
        rate: Number(Math.round(exchangeRateFrontEnd * Math.pow(10, 6)))
    }
    // const txHash = await changeRate(BigInt(Math.round(exchangeRateFrontEnd * Math.pow(10, 6))));
    const postUrlSerializeData = process.env.REACT_APP_BACKEND_API;
    const response = await fetch(postUrlSerializeData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(dataObject)
      });
    const serializedData = await response.json();
    // console.log("serializedData=", JSON.stringify(serializedData));
    const txHash = serializedData.txHash;
    
    if (txHash) {
        console.log("txHash="+txHash);
        await lucid.awaitTx(txHash);
        _changeRate(BigInt(Math.round(exchangeRateFrontEnd * Math.pow(10, 6))));
    }
    dispatch(setIsRatesUpdating(false));
    
}

const walletDetails = useSelector((state) => state.walletDetails);
const [exchangeRateFrontEnd, setExchangeRateFrontEnd] = useState('');

// useEffect(()=>{
//     // console.log("point4");
//     // setExchangeRateFrontEnd(getExchangeRate());

// }, [walletDetails.currentTime]);

// useEffect(()=>{
    // console.log("exchangeRateFrontEnd=" + exchangeRateFrontEnd);

    // if(!isNaN(exchangeRateFrontEnd) && exchangeRateFrontEnd !== "" && isSmartExchangeRateNeedUpdate(exchangeRateFrontEnd, exchangeRate)){
        // console.log("smart exchangeRate is updating...");
        
        // console.log("exchangeRateFrontEnd=");
        // console.log(BigInt(Math.round(exchangeRateFrontEnd * Math.pow(10, 6))));
        // console.log("exchangeRate=");
        // console.log(exchangeRate);
        

        // changeRateOnSmart();

        
        // (async ()=>{
        //     const txHash = await changeRate(BigInt(Math.round(exchangeRateFrontEnd * Math.pow(10, 6))));
        //     if (txHash) {
        //         console.log("txHash="+txHash);
        //         await lucid.awaitTx(txHash);
        //         _changeRate(BigInt(Math.round(exchangeRateFrontEnd * Math.pow(10, 6))));
        //     }
        // })();
    // }
// }, [exchangeRateFrontEnd]);








// console.log("new Date().toISOString()=" + new Date().toISOString());
return (
<Box className={classes.MintAndBurnForms}>
    <Box className={classes.HeaderContainer}>
        <Box className={classes.Title}>Green Coin (GCOIN)</Box>
        <Box className={classes.Description}>
            Welcome to the testnet demo of Cogito Protocol's first tracercoin, called <span>Green Coin</span>.
        </Box>
        <MintandburnButtonSmall sx={{marginLeft: "2px"}} name={<a href="https://cogito-protocol-2.gitbook.io/whitepaper/cogito-fundamentals/the-index">What is a Green Coin?</a>}></MintandburnButtonSmall>
    </Box>
    
    <Box className={classes.FormsContainer}>
        <MintForm exchangeRateFrontEnd={exchangeRateFrontEnd}></MintForm>
        <BurnForm></BurnForm>
    </Box>

</Box>
)};
export default MintAndBurnForms;