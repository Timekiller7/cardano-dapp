import { useState, useEffect } from 'react';
import NavigationBar from './navigationBar';
import SnetConnectWallets from '../snet-connect-wallets';
import SnetDisplayWallets from '../snet-display-wallets';
import { isMobile } from 'react-device-detect';

const SnetNavigation = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWalletConnecting, setIsWalletConnecting] = useState(true);

  const toggleIsModalVisible = () => {
    setIsModalVisible(!isModalVisible);
  };

  const WalletModal = ({isWalletConnecting}) => {
    return isWalletConnecting ? 
       (
        <SnetConnectWallets
          isDialogOpen={isModalVisible}
          onDialogClose={toggleIsModalVisible}
          onWalletConnect={setIsWalletConnecting}
        />
      )
      :
      (
        <SnetDisplayWallets
          isDialogOpen={isModalVisible}
          onDialogClose={toggleIsModalVisible}
          onWalletConnect={setIsWalletConnecting}
        />
      )
  }

  useEffect(()=>{
    if(!isMobile){
      setIsModalVisible(true);
    }
  }, []);

  return (
    <>
      <WalletModal isWalletConnecting={isWalletConnecting}/>
      <NavigationBar 
        openModal={toggleIsModalVisible} 
        onWalletConnect={setIsWalletConnecting}/>
    </>
  );
};

export default SnetNavigation;
