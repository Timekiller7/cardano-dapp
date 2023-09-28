import {
    C,
    Lucid,
    Blockfrost,
    Data,
    Redeemer,
    MintingPolicy,
    Address,
    Constr,
    SpendingValidator,
    ScriptType,
    Core
} from "lucid-cardano";
import {lucid} from "./offchain"
  

export const estimateScriptFee = async (tx: Core.Transaction) => {
    const protocolParams = await lucid.provider.getProtocolParameters()
    const linearFee = C.LinearFee.new(C.BigNum.from_str(protocolParams.minFeeA.toString()),C.BigNum.from_str(protocolParams.minFeeB.toString()))
 
    const firstUnit =  C.UnitInterval.from_float(protocolParams.priceMem)
    const secondUnit = C.UnitInterval.from_float(protocolParams.priceStep)
  
    const minFee = (C.min_fee(tx, linearFee, C.ExUnitPrices.new(firstUnit,secondUnit))).to_str()

    console.log("estimateScriptFee: ", minFee)
    return minFee
}




