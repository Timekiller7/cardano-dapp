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
  TxComplete,
  WalletApi
} 
from "lucid-cardano";
import scripts from "./scriptsCurrent.json";
import {decodeAddress} from "../../utils/wallet"
import { estimateScriptFee } from "./fee";


export const lucid = await Lucid.new(
  new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprodM0gEL7WPaXREI728fDXVAjWs5zavdEms"),
  "Preprod",
)

let extension
let client: Lucid
let walletAPI: WalletApi

export const setExtension = async (expectedExtension: string) => {
  extension = expectedExtension
  walletAPI = await (window as any)?.cardano[expectedExtension].enable()
  client = await clientInstance()

  console.log("Set extension: ", expectedExtension)
}

const { threadPolicy, tokenPolicy, handlerContract } = scripts;

export const clientInstance = async () => {
  return lucid.selectWallet(walletAPI)
}
export const getUtxos = async () => {
  try {
    const utxos = await lucid.wallet.getUtxos()
    return utxos
  } catch(error) {
    console.log("UTxOs error: no any spendable UTxO to interact with script")
    //throw new Error ("UTxOs error: no any spendable UTxO to interact with script")
  }
}


const findPaymentPubKeyHash = async () => {
  const walletAddr = (await walletAPI.getUsedAddresses())[0]
  return walletAddr.slice(2, 58)
}


function completeScript(policy: string) : { type: ScriptType; script: string; } {
  return {
      type: "PlutusV1",
      script: policy
  };
};

/*thread token*/
const threadTokenPolicy: MintingPolicy = completeScript(threadPolicy)
const threadCurrency = lucid.utils.validatorToScriptHash(threadTokenPolicy)
const thread = (currency: string, prefix: string) => currency + Buffer.from(prefix).toString("hex")
const threadToken = thread(threadCurrency, "GCOIN:Thread")
type oref = {
  txHash: string,
  outputIndex: number 
}
export const threadOref: oref = {
  txHash: "f7f1cb671b7c7f92401ea07a2480fc2311e85853a4349c22da51c767c2ed3c77",
  outputIndex: 1
}
export let exchangeRate = 1000000n
export let exchangeRateForMint = exchangeRate + exchangeRate/100n
export let exchangeRateForBurn = exchangeRate - exchangeRate/100n

const decimalsAda: number = 6
const tokenDecimals: bigint = BigInt(Math.pow(10, decimalsAda))


let threadData = {
  state: true,
  exchangeRate: exchangeRate,
};
const handlerDataType = Data.Object({
  state: Data.Boolean,
  exchangeRate: Data.BigInt,
});  
let threadDatum = Data.to(threadData, handlerDataType);
const emptyRedeemer = Data.void();

/*gcoin*/
const gcoinPolicy: MintingPolicy = completeScript(tokenPolicy)
const redemeerMint = () => Data.to(new Constr(0, [])) as Redeemer
const redemeerBurn = (pkh:string) => Data.to(new Constr(1, [pkh])) as Redeemer
const gcoinCurrency = lucid.utils.validatorToScriptHash(gcoinPolicy)
const calculateUnit = (currency: string, prefix: string) =>
  (currency + Buffer.from(prefix).toString("hex"))
const unit = calculateUnit(gcoinCurrency, "GCOIN")

/*handler validator*/
const handlerValidator: SpendingValidator = completeScript(handlerContract)
const handlerAddress: Address = lucid.utils.validatorToAddress(handlerValidator)
const redemeerUpdate =  Data.to(new Constr(0, [])) as Redeemer
const redemeerUse =  Data.to(new Constr(1, [])) as Redeemer
const redemeerClaim =  Data.to(new Constr(2, [])) as Redeemer

export const _changeRate = (newRate:bigint) => {
  exchangeRate = newRate
  exchangeRateForMint = exchangeRate + exchangeRate/100n
  exchangeRateForBurn = exchangeRate - exchangeRate/100n
  threadData.exchangeRate = exchangeRate
  threadDatum = Data.to(threadData, handlerDataType)

  console.log("Exchanges: ", exchangeRateForMint, " \n ",exchangeRateForBurn)
}

/*     GETTERS     */
const getUtxoWithThread = async() => {
  const utxoWithThread = (await lucid.utxosAtWithUnit(handlerAddress, threadToken))[0]
  console.log("UTXO with tread token: ", utxoWithThread)
  return utxoWithThread
}

const setExchangeRateFromNetwork = async() => {
  console.log("setExchangeRateFromNetwork: utxoWithThread");
  
  const utxoWithThread = (await getUtxoWithThread())
  const actualDatum = Data.from(await lucid.datumOf(utxoWithThread))
  console.log("ActualDatum is: ",actualDatum )

  if(!(actualDatum instanceof Constr)) {
    throw new Error("Different datum type expected")
  }

  const rate = (actualDatum.fields)[1]
  if(!(typeof rate === 'bigint')) {
    throw new Error("bigint datum type expected")
  }
  
  _changeRate(rate)
  console.log("rate changed to ", rate)
  console.log("rate var changed to ", exchangeRate)
  
}

console.log("rate set from script", await setExchangeRateFromNetwork())


export const getPriceForMint = (tokensToMint: bigint) => {
  const withoutTokenDecimals = tokensToMint*exchangeRateForMint
  const actualPrice = (withoutTokenDecimals)/tokenDecimals 
  console.log("getPriceForMint, withoutTokenDecimals: ", withoutTokenDecimals)
  console.log("getPriceForMint, actualPrice: ", actualPrice)
  return actualPrice 

}
export const getPriceForPayBack = (tokensToBurn: bigint) => {
  return (tokensToBurn*exchangeRateForBurn)/tokenDecimals
}

type walletBalance = {
  lovelaces: bigint,
  gcoins: bigint
}

const getWithoutLockedTokensBalance = async () => {
  console.log("***   Getting balance   ***")
  const utxos = await getUtxos()
  console.log("All utxos: ", utxos)

  let balances: walletBalance = {lovelaces: BigInt(0), gcoins: BigInt(0)}

  if(utxos != undefined) {
      utxos.forEach(element => {
      if(element.assets[unit]!= undefined)
        balances.gcoins += element.assets[unit]

      if(element.assets.lovelace >= BigInt(2000000)) // && Object.keys(element.assets).length == 1)
        balances.lovelaces += element.assets.lovelace
    });
  }
  console.log("Actual balance: ", balances.lovelaces)
  console.log("All gcoins (max for burn): ", balances.gcoins)
  console.log("***   ************   ***")

  return balances
}


export const getMaxTokensMint = async (balance: bigint) => {
  console.log("point8");
  await checkCollateral()

  if(balance == BigInt(0))
    return BigInt(0)
  const reservedAmount: bigint = 3000000n   // minAda + averageFee

  let flag = true
  let maxTokens = ((balance-reservedAmount)*tokenDecimals)/exchangeRateForMint/BigInt(1000000) * BigInt(1000000);
  console.log("balance=" + balance + " reservedAmount=" + reservedAmount + " exchangeRateForMint=" + exchangeRateForMint);
  console.log("Max number of tokens to mint is: ", maxTokens)


  let i = 20

  while(flag && maxTokens > 0 && i != 0 ) {
    try {
      console.log("point7");
      console.log("maxTokens="+ maxTokens);
      await buildMintTransaction(maxTokens)
      flag = false
    } catch (e) {
      console.log("e=");
      console.log(e);
      maxTokens -= BigInt(1000000)
      i--
    }
  }

  return maxTokens
}


/*     Display values for frontend     */
export const displaygetPrice = (tokens: bigint, mint: boolean) => {
  let price: bigint 

  if(mint)
    price = getPriceForMint(tokens)
  else
    price = getPriceForPayBack(tokens)

  return price
}

export type OffchainStates = {
  balance: bigint,
  maxMint: bigint,
  maxBurn: bigint
}

//displayUserBalance

export const displayStates = async (expectedExtension: string, expectedAddress: string) => {
  await setExtension(expectedExtension)
  await compareCurrentAndExpectedWallets(expectedExtension, expectedAddress)
  await setExchangeRateFromNetwork()

  let returnStates: OffchainStates = {balance: BigInt(0), maxMint: BigInt(0), maxBurn: BigInt(0)}
  const balance = await getWithoutLockedTokensBalance()
  returnStates.balance = balance.lovelaces
  returnStates.maxMint = await getMaxTokensMint(balance.lovelaces)
  returnStates.maxBurn = balance.gcoins

  return returnStates
}

export const displayFee = async (tokens: bigint, mint: boolean) => {
  const fee = BigInt(await estimateFee(tokens, mint))
  console.log("display fee: ", fee)
  return fee
}


// Blockchain fee estimation
export const estimateFee = async(tokens: bigint, mint: boolean) => {
  await checkCollateral()

  if(mint) {
    const txCompleted = await buildMintTransaction(tokens)
    const txCore = txCompleted.txComplete

    return await estimateScriptFee(txCore)
  } 
  const txCompleted = await buildPayBackTransaction(tokens)
  const txCore = txCompleted.txComplete

  return await estimateScriptFee(txCore)
} 

/*   Checks   */
const compareCurrentAndExpectedWallets = async (expectedExtension: string, expectedAddress: string) => {
  try {
    const cardano = window?.cardano

    if (!cardano || !cardano[expectedExtension]) 
      throw new Error ("Expected wallet: " + expectedExtension)

    const usedAddress = (await walletAPI.getUsedAddresses())[0]
    const currentAddress = decodeAddress(usedAddress)

    if(currentAddress != expectedAddress) 
      throw new Error ("Current address doesn't match with the connected one")
    
  } catch (error) {
    console.error('Error on wallet connection: ', error)
    //throw error
  }
}

const checkCollateral = async () => {
  const collateral = await walletAPI.experimental.getCollateral()
  
  if (collateral.length == 0) {
    throw new Error("Set collateral for interacting with service!")
  }
}


/*     Actual mint of GCOINS     */
export const mintGCOIN = async (expectedExtension: string, expectedAddress: string, tokensToMint: bigint) => {
  await compareCurrentAndExpectedWallets(expectedExtension, expectedAddress)

  console.log("***TOKENS MINT***")

  await checkCollateral()

  const txCompleted = await buildMintTransaction(tokensToMint)
  const signedTx = await txCompleted.sign().complete();
  const txHash = await signedTx.submit();

  return txHash;
}

/*     Pay back of user's GCOINs (burning)     */
// to-do: add other utxos to spend (in future)
export const payBackGCOIN = async (expectedExtension: string, expectedAddress: string, tokensToBurn: bigint) => {
  await compareCurrentAndExpectedWallets(expectedExtension, expectedAddress)

  console.log("***TOKENS PAYBACK***")

  await checkCollateral()

  const txCompleted = await buildPayBackTransaction(tokensToBurn)
  const signedTx = await txCompleted.sign().complete();
  const txHash = await signedTx.submit();

  return txHash;
}

const buildMintTransaction = async(tokensToMint: bigint) => {

  console.log("tokensToMint="+ tokensToMint);
  console.log("exchangeRateForMint=" + exchangeRateForMint);
  
  
  console.log("Building minting transaction")
  
  console.log("buildMintTransaction: utxoWithThread");
  const utxoWithThread = (await getUtxoWithThread())
  const assetsInThreadUtxo = utxoWithThread.assets.lovelace
  const payToContract = assetsInThreadUtxo + getPriceForMint(tokensToMint)   // in thread utxo + gcoin mint
  console.log("getPriceForMint(tokensToMint)="+getPriceForMint(tokensToMint));
  
 
  const tx = client
    .newTx()
    .collectFrom([utxoWithThread], redemeerUse)  
    .payToContract(handlerAddress, threadDatum, {[threadToken] : 1n, lovelace: payToContract}) 
    // .payToContract(handlerAddress, Data.void(), {lovelace : 2000000n})  
    .mintAssets({ [unit]: tokensToMint }, redemeerMint())
    .attachMintingPolicy(gcoinPolicy)
    .attachSpendingValidator(handlerValidator)
    .complete()

  return tx
}

const buildPayBackTransaction = async(tokensToBurn: bigint) => {
  console.log("Building burning transaction")

  tokensToBurn = - tokensToBurn  // negative
  console.log("buildPayBackTransaction: utxoWithThread");
  
  const utxoWithThread = (await getUtxoWithThread())
  const assetsInThreadUtxo = utxoWithThread.assets.lovelace 
  const payBack = assetsInThreadUtxo + getPriceForPayBack(tokensToBurn)
  
  const unit = calculateUnit(gcoinCurrency, "GCOIN")
 
  const tx = await client
    .newTx()
    .collectFrom([utxoWithThread], redemeerUse) // in thread utxo must be sufficient amount for paying back
    .payToContract(handlerAddress, threadDatum, {[threadToken] : 1n, lovelace : payBack}) 
    .mintAssets({ [unit]: tokensToBurn}, redemeerBurn(await findPaymentPubKeyHash()))
    .attachMintingPolicy(gcoinPolicy)
    .attachSpendingValidator(handlerValidator)
    .complete();

  return tx
}



/*     Handler initialize     */
export const deploy = async () => {
  const utxos = await lucid.wallet.getUtxos()
  console.log(utxos)

  const utxo = utxos.find(
    (utxo) =>
      utxo.txHash === threadOref.txHash && utxo.outputIndex === threadOref.outputIndex
  )
  if (!utxo) throw new Error("Utxo is required to deploy NFT contract")

  const tx = await client
    .newTx()
    .collectFrom([utxo])
    .mintAssets({ [threadToken]: 1n }, emptyRedeemer)
    .payToContract(handlerAddress, threadDatum, {[threadToken] : 1n})
    .attachMintingPolicy(threadTokenPolicy)
    .complete()

  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();

  return txHash;
}

export function changeExchangeRateForMint(newRate: bigint) { 
  exchangeRateForMint = newRate
}

// const privKey = process.env.PRIVATE_KEY
// const privateKey = C.PrivateKey.from_normal_bytes(
  // Buffer.from(privKey, "hex") 
// )

// export const changeRate = async (newRate: bigint) => {
//   console.log("Changing rate ...")

//   const newThreadData = {
//     state: true,
//     exchangeRate: newRate,
//   };
//   const newThreadDatum = Data.to(newThreadData, handlerDataType);

  
//   const keyBech32 = privateKey.to_bech32()
//   const anotherClient = lucid.selectWalletFromPrivateKey(keyBech32)
//   const systemAddress = await anotherClient.wallet.address()
//   console.log("Sys address: ", systemAddress)

//   const currentThreadUtxo = (await anotherClient.utxosAtWithUnit(handlerAddress, threadToken))[0]
 
//   const currentAssetsInThreadUtxo = currentThreadUtxo.assets.lovelace

//   const tx = await anotherClient
//     .newTx()
//     .addSigner(systemAddress)
//     .collectFrom([currentThreadUtxo], redemeerUpdate)  
//     .payToContract(handlerAddress, newThreadDatum, {[threadToken] : 1n, lovelace: currentAssetsInThreadUtxo}) 
//     .attachSpendingValidator(handlerValidator)
//     .complete();

//   const signedTx = await tx.signWithPrivateKey(keyBech32).complete()
//   const txHash = await signedTx.submit();

//   console.log(txHash)

//   return txHash;
// }

