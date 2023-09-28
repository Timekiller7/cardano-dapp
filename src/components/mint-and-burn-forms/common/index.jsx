
/*Common logic for mint and burn(redeem) forms*/
// import {displayStates, displayFee} from '../../../cardano/nft';
// import {setWalletDetails} from '../../../store/slices/walletDetails/walletDetailsSlice';
// import { showErrorNotification } from '../../../store/slices/notifications/notificationsSlice';
// import { setIsLoading } from '../../../store/slices/application/appSlice';
import { offchainConstants } from "../../../cardano/nft/offchainConstants";

export function displayPriceFix(inputValue, exchangeRate){
    return BigInt(inputValue*exchangeRate/BigInt(Math.pow(10, offchainConstants.DECIMAL_PLACES_NUMBER)));
}

export function getStringOrDash(string){
    if(string === "" || string === null || string === undefined){
        return "-"
    }else{
        return string;
    }
}

export function convertFloatToBigInt(floatValue){
    const expectedType = 'number';
    if(typeof(floatValue) !== expectedType){
        throw new Error("The expected type of floatValue is " + expectedType + " but actual type of floatValue is " + typeof(floatValue));
    }
    return BigInt(Math.floor(floatValue * Math.pow(10, offchainConstants.DECIMAL_PLACES_NUMBER)));
}
export function convertBigIntToFloat(bigIntValue){
    const expectedType = 'bigint';
    if(typeof(bigIntValue) !== expectedType){
        throw new Error("The expected type of bigIntValue is " + expectedType + " but actual type of bigIntValue is " + typeof(bigIntValue));
    }
    return (Number(bigIntValue) / Math.pow(10, offchainConstants.DECIMAL_PLACES_NUMBER)).toFixed(offchainConstants.DECIMAL_PLACES_NUMBER);
}
