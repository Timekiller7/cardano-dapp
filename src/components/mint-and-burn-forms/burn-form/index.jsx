import Box from '@mui/material/Box';
import { useStyles } from '../common/styles';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import MintandburnButton from '../../ui/mintandburn-button';
import AmountInput from '../amount-input';
import {variants} from '../amount-input';
import MintAndBurnSmallSpinner from '../../ui/mintandbrun-small-spinner';

import {lucid, payBackGCOIN, _changeRate, exchangeRateForBurn} from '../../../cardano/nft';
import {setIsMainDetailsLoading } from '../../../store/slices/walletDetails/walletDetailsSlice';
import {getWalletDetailsByApi} from '../../../store/slices/walletDetails/walletDetailsActions';

import { convertBigIntToFloat, convertFloatToBigInt, getStringOrDash} from '../common';

const BurnForm = () => {
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

function handlerClickBurn(){
        async function asyncHandler() {
            if(currentWallet == null) {
              setResult({
                success: "",
                error: "Current wallet isn't set",
              });
            } else {
              const currentAddress = currentWallet.address
              const currentWalletExtension = currentWallet.extension
              const txHash = await payBackGCOIN(currentWalletExtension, currentAddress, convertFloatToBigInt(Number(walletDetails.noSpacesBurnInputValue))).catch((e) => {
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

    return (
        <Box className={classes.form}>
            <Box className="header">
                Burn GCOIN
            </Box>
            <Box className="smallPrint">
                Exchange rate: {walletDetails.isTimeLoading || walletDetails.isRatesUpdating ? <MintAndBurnSmallSpinner></MintAndBurnSmallSpinner>
                    :
                    `${getStringOrDash(convertBigIntToFloat(exchangeRateForBurn))} tADA`
                    } 
                    
            </Box>
            <AmountInput variant={variants.BURN} currentWallet={currentWallet} onInputValidCallBack={onInputValidCallBack} isNeedNumericalValidation={isNeedNumericalValidation} setIsNeedNumericalValidation={setIsNeedNumericalValidation}></AmountInput>
            <Box className='details-list'>
                <Box className='details-item'>
                    <Box className='property-name'>
                        Get (tADA)
                    </Box>
                    <Box className='property-value'>
                        {getStringOrDash(walletDetails.burnOperationDetails.get)}
                    </Box>
                </Box>
                <Box className='details-item'>
                    <Box className='property-name'>
                        Service fee
                    </Box>
                    <Box className='property-value'>
                        {getStringOrDash(walletDetails.burnOperationDetails.serviceFee)}
                    </Box>
                </Box>
                <Box className='details-item'>
                    <Box className='property-name'>
                        Approx. blockchain fee
                    </Box>
                    <Box className='property-value'>
                        {getStringOrDash(walletDetails.burnOperationDetails.approxBlockchainFee)}
                    </Box>
                </Box>
                <Box className='details-item'>
                    <Box className='property-name'>
                        <span>Total payment</span>
                    </Box>
                    <Box className='property-value'>
                    <span>{getStringOrDash(walletDetails.burnOperationDetails.totalPayment)}</span>
                    </Box>
                </Box>
            </Box>
            <Box className='button-component'>
                <MintandburnButton onClick={handlerClickBurn} name='Burn GCOIN' variant='common' disabled={!isInputValid} />
            </Box>
        </Box>
    )
}
export default BurnForm;