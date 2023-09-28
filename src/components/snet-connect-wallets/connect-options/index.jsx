import { useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import { supportedWallets, cardanoNetworks } from '../../../data/constants/constants';

import {setCurrentAddress} from '../../../store/slices/wallet/walletSlice';

import { showErrorNotification } from '../../../store/slices/notifications/notificationsSlice';
import useInjectableCardanoHook from '../../../lib/cardanoWalletHook/useInjectableCardanoHook';
import SnetBlockchainListHeader from '../../ui/snet-blockchain-list-header';
import ExtensionList from './extensions-list';
import style from './style';
import isNil from 'lodash/isNil';
import propTypes from 'prop-types';
import { setIsLoading } from '../../../store/slices/application/appSlice';
import { offchainConstants } from '../../../cardano/nft/offchainConstants';

const ConnectOptions = ({ blockchain, onWalletConnect }) => {
    const CARDANO_CHAIN_ID = offchainConstants.REACT_APP_CARDANO_NETWORK_ID;
    const { connectCardanoWallet } = useInjectableCardanoHook();
    const BLOCKCHAIN_IDENTIFIER = blockchain.name.toUpperCase();
    const dispatch = useDispatch();

    const constructWalletObject = (address, extension) => {
        return {
            address: address,
            extension: extension
        }
    }

    const isAddressAvailable = (address) => {
        return !isNil(address);
    }

    const isAtExpectedNetwork = (chainID) => {
        if(!(chainID === Number(CARDANO_CHAIN_ID))){
            const walletCardanoNetwork = cardanoNetworks.find((element, index, array)=>{
                return element.chainID === chainID;
            });
            const currentCardanoNetwork = cardanoNetworks.find((element, index, array)=>{
                return element.chainID === CARDANO_CHAIN_ID;
            });
            let errorMessage;
            if(walletCardanoNetwork){
                errorMessage = `Wallet is in ${walletCardanoNetwork.name} network! Expected network is ${currentCardanoNetwork.name}`;
            }else{
                errorMessage = `Wallet is in unknown network! Expected network is ${currentCardanoNetwork.name}`;
            }
            dispatch(showErrorNotification({message: errorMessage}));
            return false;
        };
        return true;
    }

    const connectCardanoWalletIfNotConnected = async (extension) => {
        try {
            dispatch(setIsLoading(true));
            const {networkId, address} = await connectCardanoWallet(extension);
            if(!isAddressAvailable(address)) {
                dispatch(showErrorNotification({message: extension.wallet + ": extension is not present or it is locked!"}));
                return false;
            }
            if(!isAtExpectedNetwork(networkId)){
                return false;
            }
            else {
                const walletObject = constructWalletObject(address, extension.identifier);
                dispatch(setCurrentAddress(walletObject));
                return true;
            }
        }
        catch (e) {
            throw e;
        }
    }

    const connectWallet = async (extension) => {
        try {
            const isWalletConnectedSuccessfully = await connectCardanoWalletIfNotConnected(extension);
            if(isWalletConnectedSuccessfully){
                onWalletConnect(false);
            }
            dispatch(setIsLoading(false));
        } catch (error) {
            dispatch(setIsLoading(false));
            dispatch(showErrorNotification({message: "Error while connecting wallet: " + error?.message}))
        }
    }

    return (
        <Box sx={(style.box, style.customBox)}>
            <SnetBlockchainListHeader blockchain={blockchain} />
            <Box display="flex" alignItems="center" marginTop={'40px'} marginBottom={0}>
                <ExtensionList connectWallet={connectWallet} supportedExtensions={supportedWallets[BLOCKCHAIN_IDENTIFIER]} />
            </Box>
        </Box>
    );
};

ConnectOptions.propTypes = {
    blockchain: propTypes.object.isRequired,
    onWalletConnect: propTypes.func.isRequired
};

export default ConnectOptions;
