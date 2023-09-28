import Box from '@mui/material/Box';
import { useStyles } from './styles';

import { useEffect, useState, useRef} from 'react';
import { inputErrors, maxCharactersInIntegerPartOfInput, maxCharactersInFractionalPartOfInput } from '../../../data/constants/constants';

import {getMintOperationDetailsByApi, getBurnOperationDetailsByApi} from '../../../store/slices/walletDetails/walletDetailsActions';
import LoadingSpinner from '../../ui/mintandbrun-small-spinner';

import { useSelector, useDispatch } from 'react-redux';
import { getStringOrDash } from '../common';
import { setNoSpacesBurnInputValue, setNoSpacesMintInputValue } from '../../../store/slices/walletDetails/walletDetailsSlice';

export const variants = {
    MINT: 'mint',
    BURN: 'burn',
}

const AmountInput = ({variant, currentWallet, onInputValidCallBack, isNeedNumericalValidation, setIsNeedNumericalValidation}) => {
    const dispatch = useDispatch();
    const classEnum = {
        INVALID : 'invalid',
    };
    const [stateInputValue, setStateInputValue] = useState('');

    const warnings = inputErrors.warnings;
    const [inputWarningsList, setInputWarningsList] = useState([]);
    const [isInputValidSyntax, setIsInputValidSyntax] = useState(false);
    let draftInputWarningsList = [];

    const errors = inputErrors.errors;
    const [inputErrorsList, setInputErrorsList] = useState([]);
    let draftInputErrorsList = [];
    
    const classes = useStyles();
    const walletDetails = useSelector((state)=> state.walletDetails);
    const inputRef = useRef(null);

    function setIsInputValidWithCallBack(isInputValid){
        onInputValidCallBack(isInputValid);
    }
    function invalidClass(){
        if(!inputErrorsList.every((error) => error.message === "")){
            return classEnum.INVALID;
        }
    }
    function setInputValueAndCursor(inputValue, cursorPosition){
        setStateInputValue(inputValue);
        inputRef.current.value = inputValue;
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
    function obtainIntegersNumberBeforeCursor(inputString, selectionStart){
        inputString = (inputString.substr(0, selectionStart));
        let integersNumberBeforeCursor = 0;
        for(let i=0; i<inputString.length; i++){
            if(inputString.charAt(i) !== ' '){
                integersNumberBeforeCursor++;
            }
        }
        return integersNumberBeforeCursor;
    }
    function obtainCursorPositionAfterSpaceFormatting(integersNumberBeforeCursor, inputString, isThereSpaceBeforeCursor){
        let newCursorPosition = 0;
        let lookedIntegersNumber = 0;
        while(lookedIntegersNumber < integersNumberBeforeCursor){
            if(inputString.charAt(newCursorPosition) !== " "){
                lookedIntegersNumber++;
            }
            newCursorPosition++;
        }
        if(isThereSpaceBeforeCursor && inputString.charAt(newCursorPosition) === ' '){
            newCursorPosition++;
        }
        return newCursorPosition;
    }
    function isThereSpaceBeforeCursorFunc(inputString, selectionStart){
        return (inputString.charAt(selectionStart-1) === ' ') ? true : false;
    }
    function removeAndAddSpaces(inputString){
        inputString = inputString.split(/\s+/).join('');
        const firstDotPosition = inputString.indexOf('.');
        let integralPartLength;
        if(firstDotPosition !== -1){
            integralPartLength = firstDotPosition;
        }else{
            integralPartLength = inputString.length;
        }
        let currentPosition = integralPartLength % 3;
        if(currentPosition < integralPartLength  && currentPosition>0){
            inputString = inputString.slice(0, currentPosition) + " " + inputString.slice(currentPosition);
            currentPosition += 4;
            integralPartLength +=1;
        }else{
            currentPosition += 3;
        }
        while(currentPosition < integralPartLength){
            inputString = inputString.slice(0, currentPosition) + " " + inputString.slice(currentPosition);
            currentPosition += 4;
            integralPartLength +=1;
        }
        return inputString;
    }
    function spaceFormatting(inputString, selectionStart){
        const isThereSpaceBeforeCursor = isThereSpaceBeforeCursorFunc(inputString, selectionStart);
        const integersNumberBeforeCursor = obtainIntegersNumberBeforeCursor(inputString, selectionStart);
        inputString = removeAndAddSpaces(inputString);
        const cursorPosition = obtainCursorPositionAfterSpaceFormatting(integersNumberBeforeCursor, inputString, isThereSpaceBeforeCursor);
        setInputValueAndCursor(inputString, cursorPosition);
    }
    function isStringConsistOfAllowableCharacters(inputString){
        return inputString.match(/^[0-9\s.]*$/) !== null;
    }
    function warningListDraftToState(){
        setInputWarningsList([...draftInputWarningsList]);
    }
    function addWarningToList(warning){
        if(!draftInputWarningsList.includes(warning)){
            draftInputWarningsList.push(warning);
        }
    }
    function errorsListDraftToState(){
        setInputErrorsList([...draftInputErrorsList]);
    }
    function addErrorToList(error){
        if(!draftInputErrorsList.includes(error)){
            draftInputErrorsList.push(error);
        }
    }
    function onlyOneDotCheck(inputString){
        if(inputString.match(/^.*\..*\..*$/) === null){
            return true;
        }else{
            addWarningToList(warnings.triedInputMoreThenOneDot);
            return false;
        }
    }
    function maxNumberOfIntegerAndFractionalPartsBlockingCheck(inputString){
        const noSpacesString =  inputString.split(/\s+/).join('');
        const noSpacesStateInputString = stateInputValue.split(/\s+/).join('');
        let integerPart;
        let fractionalPart;
        let result = true;
        [integerPart, fractionalPart] = noSpacesString.split('.');
        if(integerPart.length > maxCharactersInIntegerPartOfInput && noSpacesString.length > noSpacesStateInputString.length){
            addWarningToList(warnings.triedTooManyCharactersIntegerPart);
            result = false;
        }
        if(fractionalPart && fractionalPart.length > maxCharactersInFractionalPartOfInput && noSpacesString.length >= noSpacesStateInputString.length){
            addWarningToList(warnings.triedTooManyCharactersFractionalPart);
            result = false;
        }
        return result;
    }
    function inputBlockingChecks(inputString){
        let result = false;
        if(onlyOneDotCheck(inputString)){
            if(maxNumberOfIntegerAndFractionalPartsBlockingCheck(inputString)){
                result = true;
            }
        }
        warningListDraftToState();
        return result;
    }
    function restoreInputToPreviousState(inputString, selectionStart){
        const pastedLength = inputString.length - stateInputValue.length;
        setInputValueAndCursor(stateInputValue, selectionStart-pastedLength);
    }
    function inputBlockingChecksWithRestore(inputString, selectionStart){
        if(isStringConsistOfAllowableCharacters(inputString)){
            if(inputBlockingChecks(inputString)){
                return true;
            }
            else{
                restoreInputToPreviousState(inputString, selectionStart);
            }
        } else{
            restoreInputToPreviousState(inputString, selectionStart);
            inputBlockingChecks(stateInputValue);
        }
        return false;
    }
    function emptyStringCheck(noSpacesString){
        if(noSpacesString){
            return true;
        }
        addErrorToList(errors.emptyStringCheck);
        return false;
    }
    function maxNumberOfIntegerAndFractionalPartsNoBlockingCheck(noSpacesString){
        let integerPart;
        let fractionalPart;
        let result = true;
        [integerPart, fractionalPart] = noSpacesString.split('.');
        if(integerPart.length > maxCharactersInIntegerPartOfInput){
            addErrorToList(errors.enteredTooManyCharactersIntegerPart);
            result = false;
        }
        if(fractionalPart && fractionalPart.length > maxCharactersInFractionalPartOfInput){
            addErrorToList(errors.enteredTooManyCharactersFractionalPart);
            result = false;
        }
        return result;
    }
    function integerAndFractionalPartsExistenceCheck(noSpacesString){
        let result=true;
        let integerPart;
        let fractionalPart;
        [integerPart, fractionalPart] = noSpacesString.split('.');
        if(integerPart === "" && fractionalPart !== undefined){
            addErrorToList(errors.noIntegerPart);
            result = false;
        }
        if(fractionalPart === ""){
            addErrorToList(errors.noFractionalPart);
            result = false;
        }
        if(integerPart.length > 1 && integerPart.charAt(0) === '0'){
            addErrorToList(errors.leadingZeros);
            result = false;
        }
        return result;
    }
    function inputNoBlockingChecks(noSpacesString){
        const result = emptyStringCheck(noSpacesString) & maxNumberOfIntegerAndFractionalPartsNoBlockingCheck(noSpacesString) & integerAndFractionalPartsExistenceCheck(noSpacesString);
        errorsListDraftToState();
        return result;
    }
    function balanceCheck(noSpacesString){
        const maxAllowableAmount = (variant === variants.MINT ? walletDetails.mainDetails.maxMintAmount : walletDetails.mainDetails.maxBurnAmount);

        if(Number(noSpacesString) > Number(maxAllowableAmount)){
            addErrorToList(errors.insufficientBalance);
            return false;
        }
        return true;   
    }

    function minMintAmountCheck(noSpacesString){
        if(noSpacesString < walletDetails.mainDetails.minCurrencyAmount){
            addErrorToList(errors.amountLessThenMin);
            return false;
        }
        return true;
    }
    function isWalletConnected(){
        return currentWallet;
    }
    function isWalletConnectedCheck(){
        if(isWalletConnected()){
            return true;
        }
        addErrorToList(errors.noCurrentWallet);
        return false;
    }
    function inputNumericalValueValidation(noSpacesString){
        let result = false;
        if(isWalletConnectedCheck()){
            result = balanceCheck(noSpacesString) & minMintAmountCheck(noSpacesString);
        }
        errorsListDraftToState();
        return result;
    }
    function handleChange(){
        console.log("handleChange: start");
        const inputString = inputRef.current.value;
        const selectionStart = inputRef.current.selectionStart;
        const noSpacesString =  inputString.split(/\s+/).join('');
        setIsInputValidWithCallBack(false);

        if(inputBlockingChecksWithRestore(inputString, selectionStart)){
            spaceFormatting(inputString, selectionStart); 
            if(inputNoBlockingChecks(noSpacesString)){
                setIsInputValidSyntax(true);
            }else{
                setIsInputValidSyntax(false);
            }
            variant === variants.MINT ? dispatch(setNoSpacesMintInputValue(noSpacesString)) : dispatch(setNoSpacesBurnInputValue(noSpacesString));
            variant === variants.MINT ? dispatch(getMintOperationDetailsByApi({inputValue: noSpacesString, isOperationDetailsFetchAccessible:isOperationDetailsFetchAccessible()})) : dispatch(getBurnOperationDetailsByApi({inputValue: noSpacesString, isOperationDetailsFetchAccessible:isOperationDetailsFetchAccessible()})); 
        }
        setIsNeedNumericalValidation(true);
        
    }
    function maxAmountToInput(){
        if(isWalletConnected()){
            if(variant === variants.MINT){
                    inputRef.current.value = walletDetails.mainDetails.maxMintAmount;
                    handleChange();
            }else{
                inputRef.current.value = walletDetails.mainDetails.maxBurnAmount;
                handleChange();    
            }
        }
    }
    function isOperationDetailsFetchAccessible(){
        return draftInputErrorsList.every((error)=> {return error.type !== "syntax"});
    }
    function inputNumericalValueValidationWithList(){
        const noSpacesString = stateInputValue.split(/\s+/).join('');
        if(isInputValidSyntax){
            if(inputNumericalValueValidation(noSpacesString)){
                setIsInputValidWithCallBack(true);
            }else{
                setIsInputValidWithCallBack(false);
            }
        }
        setIsNeedNumericalValidation(false);
    }

    useEffect(()=>{
        handleChange();
    }, [walletDetails.mainDetails]); //TODO: too many calls
    
    useEffect(()=>{
        if(variant === variants.MINT && isNeedNumericalValidation){

            inputNumericalValueValidationWithList();
        }
    }, [currentWallet, walletDetails.mintOperationDetails, isNeedNumericalValidation]);
    
    useEffect(()=>{
        if(variant === variants.BURN && isNeedNumericalValidation){
            inputNumericalValueValidationWithList();
        }
    }, [currentWallet, walletDetails.burnOperationDetails, isNeedNumericalValidation]);

    function getWalletBalance(variant){
        return variant === variants.MINT ? walletDetails.mainDetails.balance : walletDetails.mainDetails.maxBurnAmount;
    }

    return (
        <Box className={[classes.AmountContainer]}>
            <Box className='right-side-container'>
                Balance({(variant === variants.MINT ? 'tADA':'GCOIN')}): {(walletDetails.isMainDetailsLoading? <LoadingSpinner/> : getStringOrDash(getWalletBalance(variant)))}   
            </Box>
            <Box className={['input-container', invalidClass()]}>
                <input type="text" placeholder='Enter' ref={inputRef} onChange={handleChange}/>
                <Box className='max-amount-container' onClick={maxAmountToInput}>
                    Max
                </Box>
            </Box>
            <Box className='right-side-container'>
                Min amount: {getStringOrDash(walletDetails.mainDetails.minCurrencyAmount)}
            </Box>
            <Box className={classes.WarningsAndErrorsContainer}>
                <Box className='warnings-list'>
                    {inputWarningsList.map((item, index) => (
                        <div key={index}>{item}</div>
                    ))}
                </Box>
                <Box className='errors-list'>
                    {inputErrorsList.map((item, index) => (
                        item !== "" ?
                        <div key={index}>{item.message}</div>
                        : null
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
export default AmountInput;