import Box from '@mui/material/Box';
import { useStyles } from '../common/styles';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import MintandburnButton from '../../ui/mintandburn-button';
import AmountInput from '../amount-input';
import {variants} from '../amount-input';
import MintAndBurnSmallSpinner from '../../ui/mintandbrun-small-spinner';

import {lucid, mintGCOIN, _changeRate, changeExchangeRateForMint, exchangeRateForMint} from '../../../cardano/nft';
import {setIsMainDetailsLoading } from '../../../store/slices/walletDetails/walletDetailsSlice';
import {getWalletDetailsByApi} from '../../../store/slices/walletDetails/walletDetailsActions';

import { convertBigIntToFloat, convertFloatToBigInt, getStringOrDash} from '../common';

const MintForm = ({exchangeRateFrontEnd}) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const [isInputValid, setIsInputValid] = useState(false);
    const [isNeedNumericalValidation, setIsNeedNumericalValidation] = useState(false);
   
    const currentWallet = useSelector((state) => state.wallets.currentWallet);
    const walletDetails = useSelector((state) => state.walletDetails);

    const [result, setResult] = useState({ success: "", error: "" });

    function onInputValidCallBack(isInputValid){
        setIsInputValid(isInputValid);
    }

    function handlerClickMint(){
        async function asyncHandler() {
            if(currentWallet == null) {
              setResult({
                success: "",
                error: "Current wallet isn't set",
              });
            } else {
              const currentAddress = currentWallet.address
              const currentWalletExtension = currentWallet.extension
              const txHash = await mintGCOIN(currentWalletExtension, currentAddress, convertFloatToBigInt(Number(walletDetails.noSpacesMintInputValue))).catch((e) => { 
                console.error(e);
                setResult({
                  success: "",
                  error: e?.message || JSON.stringify(e),
                });
              });

              if (txHash) {
                dispatch(setIsMainDetailsLoading(true));
                await lucid.awaitTx(txHash);
                setTimeout(()=>{
                    dispatch(getWalletDetailsByApi());
                }, 60000);
                
                setResult({
                   success: `https://preprod.cardanoscan.io/transaction/${txHash}`,
                   error: "",
                });
                
              }
            }
          }
          asyncHandler();
    }

    // const [exchangeRateMintFix, setExchangeRateMintFix] = useState(''); 
    // useEffect(()=>{
    //     // console.log(exchangeRateFrontEnd);
    //     const newRate = (Number(exchangeRateFrontEnd) + Number(exchangeRateFrontEnd/100));
    //     setExchangeRateMintFix(newRate);
    //     // console.log(newRate);
    //     if(newRate){
    //         // console.log("nesRate=" + newRate);
    //         // console.log(BigInt(Math.round(newRate*Math.pow(10,6))));
    //         changeExchangeRateForMint(BigInt(Math.round(newRate*Math.pow(10,6))));
    //     }
        
    // }, [exchangeRateFrontEnd]);

    return (
            <Box className={classes.form}>
                <Box className="header">
                    Mint GCOIN
                </Box>
                <Box className="smallPrint">
                Exchange rate: {walletDetails.isTimeLoading || walletDetails.isRatesUpdating ? <MintAndBurnSmallSpinner></MintAndBurnSmallSpinner>
                    :
                    `${getStringOrDash(convertBigIntToFloat(exchangeRateForMint))} tADA`} 
                </Box>
                <Box className="amount-input-wrapper">
                    <AmountInput variant={variants.MINT} currentWallet={currentWallet} onInputValidCallBack={onInputValidCallBack} isNeedNumericalValidation={isNeedNumericalValidation} setIsNeedNumericalValidation={setIsNeedNumericalValidation}></AmountInput>
                </Box>
                <Box className='details-list'>
                    <Box className='details-item'>
                        <Box className='property-name'>
                            Pay (tADA)
                        </Box>
                        <Box className='property-value'>
                            {getStringOrDash(walletDetails.mintOperationDetails.pay)}
                        </Box>
                    </Box>
                    <Box className='details-item'>
                        <Box className='property-name'>
                            Service fee
                        </Box>
                        <Box className='property-value'>
                            {getStringOrDash(walletDetails.mintOperationDetails.serviceFee)}
                        </Box>
                    </Box>
                    <Box className='details-item'>
                        <Box className='property-name'>
                            Approx. blockchain fee
                        </Box>
                        <Box className='property-value'>
                            {getStringOrDash(walletDetails.mintOperationDetails.approxBlockchainFee)}
                        </Box>
                    </Box>
                    <Box className='details-item'>
                        <Box className='property-name'>
                           <span>Total payment</span>
                        </Box>
                        <Box className='property-value'>
                           <span>{getStringOrDash(walletDetails.mintOperationDetails.totalPayment)}</span>
                        </Box>
                    </Box>
                </Box>
                <Box className='button-component'>
                    <MintandburnButton onClick={handlerClickMint} name='Mint GCOIN' variant='common' disabled={!isInputValid} />
                </Box>
            </Box>
    )
}
export default MintForm;