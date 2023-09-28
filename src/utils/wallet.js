import {Address} from "@emurgo/cardano-serialization-lib-asmjs";
export const decodeAddress = (address) => {
    return Address.from_bytes(Buffer.from(address, 'hex')).to_bech32();
}