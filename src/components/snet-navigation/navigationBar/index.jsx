import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Wallets from './wallets';
import Logo from './logo';
import navbarStyles from '../style';
import propTypes from 'prop-types';

const NavigationBar = ({ openModal, onWalletConnect }) => {
  const classes = navbarStyles();

  return (
    <AppBar position="static" color="white" sx={{ padding: 2 }} className={classes.header}>
      {/* <Box className={classes.items}> */}
      <Box className={classes.row}>
        <Box className={classes.leftItems}>
          <Logo />
        </Box>
        <Box className={classes.rightItems}>
          <Box className={classes.accent}>
            <a href="https://www.cogitoprotocol.com/#waitlist">Join the waitlist</a>
          </Box>
          {/* <div className={classes.gap}></div> */}
          <Wallets openModal={openModal} onWalletConnect={onWalletConnect} />
        </Box>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.leftItems}>
        </Box>
        <Box className={classes.rightItems}>
          <Box className={classes.smallPrint}>
          Cardano testnet: preprod
          </Box>
        </Box>
      </Box>
{/* 
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Logo />
      </Box>
      <Box>
        Join the waitlist
      </Box>
      <Wallets openModal={openModal} onWalletConnect={onWalletConnect} /> */}
      {/* </Box> */}
    </AppBar>
  );
};

NavigationBar.propTypes = {
  openModal: propTypes.func.isRequired,
  onWalletConnect: propTypes.func.isRequired
};

export default NavigationBar;
