import { Box } from '@mui/system';
import WalletAddressInfo from './wallet-address-info';
import style from './style';
import propTypes from 'prop-types';

const WalletAddressBox = ({ extensions, wallet, onWalletConnect }) => {
   
    return  wallet ? (
        <Box sx={style.walletInfoBox}>
           <WalletAddressInfo
                    walletObj={wallet}
                    extension={extensions[wallet.extension]}
                    onWalletConnect={onWalletConnect}
                     />
        </Box>
    ) : null;
};

WalletAddressBox.propTypes = {
    onWalletConnect: propTypes.func.isRequired,
    extensions: propTypes.object.isRequired,
    wallet: propTypes.object.isRequired,
}

export default WalletAddressBox;
