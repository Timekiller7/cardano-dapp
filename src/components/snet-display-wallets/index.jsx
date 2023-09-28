import { useSelector } from 'react-redux';
//import {setIsLoading} from '../../store/slices/application/appSlice'
import { Box } from '@mui/system';
import { cardanoBlockchain, supportedWallets } from '../../data/constants/constants';
import SnetButton from '../ui/snet-button';
import SnetDialog from '../snet-dialog';
import SnetBlockchainListHeader from '../ui/snet-blockchain-list-header';
import WalletAddressBox from './wallet-address-box';
import propTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { setCurrentAddress } from '../../store/slices/wallet/walletSlice';

// import {saveState} from "../../utils/browserStorage";
// import store from "../../store";

const SnetDisplayWallets = ({ isDialogOpen, onDialogClose, onWalletConnect }) => {
    const dispatch = useDispatch();
    const currentWallet = useSelector(state => state.wallets.currentWallet);

    const mapArrayToObject = (bArray) => {
        const result = {}
        bArray.forEach(element => {
            const id = element.identifier;
            result[id] = element;
        });
        return result;
    }

    function logOut(){
        dispatch(setCurrentAddress(null));
        onWalletConnect(true);
    }
    const ConnectedWallets = ({onWalletConnect}) => {
        return (
            <Box>
                <SnetBlockchainListHeader blockchain={cardanoBlockchain} />
                <WalletAddressBox
                    blockchain={cardanoBlockchain}
                    wallet={currentWallet}
                    extensions={mapArrayToObject(supportedWallets.CARDANO)}
                    onWalletConnect={onWalletConnect}
                />
            </Box>
        )
    }

    return (
        <>
            <SnetDialog title="Connected Wallet" onDialogClose={onDialogClose} isDialogOpen={isDialogOpen}>
                <ConnectedWallets onWalletConnect={onWalletConnect} />
                {/* <SnetButton onClick={logOut} name='Log out' /> */}
            </SnetDialog>
        </>
    )
}

SnetDisplayWallets.propTypes = {
    isDialogOpen: propTypes.bool.isRequired,
    onDialogClose: propTypes.func.isRequired,
    onWalletConnect: propTypes.func.isRequired
};

export default SnetDisplayWallets;
