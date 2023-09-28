import {decodeAddress} from "../../utils/wallet";

const useInjectableCardanoHook = () => {

  const cardano = window?.cardano;

  const connectCardanoWallet = async (extension) => {
    let wallet
    try {
      const extensionIdentifier = extension?.identifier.toLowerCase();
      if (!extensionIdentifier) {
        throw new Error('Can not find an extension');
      }
      if (cardano && cardano[extensionIdentifier]) {
        try {
          wallet = await cardano[extensionIdentifier].enable();
        } catch (error) {
          throw new Error("Wallet isn't initialized ");
        }

        const networkId = await wallet.getNetworkId();

        const encodedAddresses = await wallet.getUsedAddresses();
        if (!encodedAddresses?.length) {
          throw new Error('No initialized addresses in wallet');
        }
        const address = decodeAddress(encodedAddresses[0]);

        const encodedStakeKeys = await wallet.getRewardAddresses();
        const stake_key = Array.isArray(encodedStakeKeys) && encodedStakeKeys.length ? decodeAddress(encodedStakeKeys[0]) : '';

        return {networkId, address, stake_key};
      }
      else {
        throw new Error('Can not find an extension: ' + extensionIdentifier);
      }
    } catch (error) {
      console.error('Error on connectWallet: ', error);
      throw error;
    }
  };

  return {
    connectCardanoWallet
  }
}

export default useInjectableCardanoHook;
