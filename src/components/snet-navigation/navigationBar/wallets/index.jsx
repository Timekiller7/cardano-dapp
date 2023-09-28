import { useSelector } from 'react-redux';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// import SnetButton from '../../../ui/snet-button';
import useNavbarStyles from '../../style';
import propTypes from 'prop-types';

import MintandburnButtonSmall from '../../../ui/mintandburn-button-small';
import { isMobile } from 'react-device-detect';

const Wallets = ({ openModal, onWalletConnect}) => {
    const classes  = useNavbarStyles();
    const currentWallet = useSelector(state => state.wallets.currentWallet);

    const isWalletConnected = () => {
        return currentWallet;
    };

    const openWalletInfo = () => {
        onWalletConnect(false);
        openModal();
    }

    const openWalletConnector = () => {
        onWalletConnect(true);
        openModal();
    }

    return isWalletConnected() ? (
        <Box onClick={openWalletInfo} className={classes.walletConnectionInfo}>
            <IconButton>
                <AccountBalanceWalletIcon />
            </IconButton>
            <Box>
                <Typography>Wallet</Typography>
                <span>Connected</span>
            </Box>
        </Box>
    ) : (
        <>
            {isMobile ? null : <MintandburnButtonSmall name="Connect Wallet" onClick={openWalletConnector}></MintandburnButtonSmall>}

        </>
    )
};

Wallets.propTypes = {
    openModal: propTypes.func.isRequired,
    onWalletConnect: propTypes.func.isRequired
};


export default Wallets;
