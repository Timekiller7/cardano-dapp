import { cardanoBlockchain } from '../../data/constants/constants'
import SnetDialog from '../snet-dialog';
import ConnectOptions from './connect-options';
import propTypes from 'prop-types';

const SnetConnectWallets = ({ isDialogOpen, onDialogClose, onWalletConnect }) => {
  return (
    <>
      <SnetDialog title="Connect Your Wallet" onDialogClose={onDialogClose} isDialogOpen={isDialogOpen}>
          <ConnectOptions blockchain={cardanoBlockchain} onWalletConnect={onWalletConnect}/>
      </SnetDialog>
    </>
  );
};

SnetConnectWallets.propTypes = {
  isDialogOpen: propTypes.bool.isRequired,
  onDialogClose: propTypes.func.isRequired,
  onWalletConnect: propTypes.func.isRequired
};

export default SnetConnectWallets;
