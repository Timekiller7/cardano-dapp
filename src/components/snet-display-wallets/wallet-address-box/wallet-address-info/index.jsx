import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Typography, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import {
    setCurrentAddress
} from '../../../../store/slices/wallet/walletSlice';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CopyOrEditIcon from '@mui/icons-material/ContentCopy';
import LogoutIcon from '@mui/icons-material/Logout';
import style from './style';
import propTypes from 'prop-types';

const WalletAddressInfo = ({walletObj, extension, onWalletConnect }) => {
    const dispatch = useDispatch();
    const walletAddress = walletObj.address;
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    const onClickCopy = () => {
        onCopyAddress(walletAddress);
        setCopyButtonText('Copied');
        setTimeout(() => {
            setCopyButtonText('Copy');
        }, 3000);
    };

    const onCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
    };

    const addEllipsisInBetweenString = (str) => {
            return `${str.substr(0, 25)}...${str.substr(str.length - 25)}`;
    };

    const onDisconnect = async () => {
        dispatch(setCurrentAddress(null));
        onWalletConnect(true);
        // onDialogClose();
    }

    const DisconnectWalletButton = () => {
           return <Button
                onClick={onDisconnect}
                variant="text"
                sx={[style.disconnectBtn, style.buttonWalletAddress]}
                startIcon={<LogoutIcon />}
            >
                Disconnect
            </Button>
    }

    const WalletAddressBlock = () => {
        return (
            <Typography variant="caption" color="common.white" fontSize="16px">
                {addEllipsisInBetweenString(walletAddress)}
            </Typography>
        );
    }

    const CopyAddressButton = () => {
        return (
            <Button
                sx={style.buttonWalletAddress}
                padding="0"
                variant="text"
                onClick={onClickCopy}
                startIcon={<CopyOrEditIcon />}
            >
                {copyButtonText}
            </Button>
        )
    }

    return (
        <Box sx={style.flexBox}>
            <Box sx={style.flexNoShrinkBox}>
                <Tooltip title={extension.wallet}>
                    <img alt={extension.wallet} src={extension.logo} />
                </Tooltip>
            </Box>
            <Box sx={style.addressInfo}>
                <Stack direction="row" alignItems="center">
                    <WalletIcon sx={style.icon} />
                    <WalletAddressBlock />
                </Stack>
                <Stack direction="row" sx={style.btnsAfterConnectOrAdd}>
                    <CopyAddressButton />
                    <DisconnectWalletButton />
                </Stack>
            </Box>
        </Box>
    );
};

WalletAddressInfo.propTypes = {
    onWalletConnect: propTypes.func.isRequired,
    walletObj: propTypes.object.isRequired,
    extension: propTypes.object.isRequired
};

export default WalletAddressInfo;
