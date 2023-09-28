{-# LANGUAGE DataKinds             #-}
{-# LANGUAGE DeriveAnyClass        #-}
{-# LANGUAGE DeriveGeneric         #-}
{-# LANGUAGE FlexibleContexts      #-}
{-# LANGUAGE MultiParamTypeClasses #-}
{-# LANGUAGE OverloadedStrings     #-}
{-# LANGUAGE ScopedTypeVariables   #-}
{-# LANGUAGE TemplateHaskell       #-}
{-# LANGUAGE TypeApplications      #-}
{-# LANGUAGE TypeFamilies          #-}
{-# LANGUAGE TypeOperators         #-}
{-# LANGUAGE NoImplicitPrelude     #-}

module HandlerContract
  ( 
    Handler (..),
    HandlerDatum (..),
    HandlerRedeemer (..),
    handlerValue,
    handlerAsset,
    MintRedeemer(..),
    typedHandlerValidator,
    handlerValidator,
    handlerAddress,
    handlerpkh,
    handlerNFT,
    handlerParam,
    updateRedeemer,
    gcoinSymbol,
    serializeGcoinPolicy,
    serializeHandlerScript
  )
where

import Cardano.Api.Shelley (PlutusScript (..), PlutusScriptV1, serialiseToCBOR)
import Codec.Serialise
import Control.Monad hiding (fmap)
import Data.Aeson (FromJSON, ToJSON)
import qualified Data.ByteString as B
import qualified Data.ByteString.Base16 as B16
import qualified Data.ByteString.Lazy as LB
import qualified Data.ByteString.Short as SBS
import Data.Default ()
import GHC.Generics (Generic)
import Ledger hiding (Mint, singleton)
import Ledger.Ada as Ada
import Ledger.Address ()
import qualified Ledger.Typed.Scripts as Scripts
import Ledger.Value
import Plutus.V1.Ledger.Api
import qualified PlutusTx
import PlutusTx.Prelude hiding (Semigroup (..), unless)
import Plutus.Script.Utils.V1.Scripts (scriptCurrencySymbol)
import Prelude (Show (..))
import qualified Prelude
import NFT (threadCurSymbol, threadName)

data Handler = Handler
  { hSymbol :: !CurrencySymbol,
    hOperator :: !PaymentPubKeyHash
  }
  deriving (Show, Generic, FromJSON, ToJSON, Prelude.Eq, Prelude.Ord)

PlutusTx.makeIsDataIndexed ''Handler [('Handler, 0)]
PlutusTx.makeLift ''Handler

data HandlerRedeemer = Update | Use | Claim
  deriving (Show, Generic, FromJSON, ToJSON)

PlutusTx.makeIsDataIndexed ''HandlerRedeemer [('Update, 0), ('Use, 1), ('Claim, 2)]
PlutusTx.makeLift ''HandlerRedeemer

data HandlerDatum = HandlerDatum
  { state :: !Bool,
    exchangeRate :: !Integer
  }
  deriving (Show, Generic, FromJSON, ToJSON)

PlutusTx.makeIsDataIndexed ''HandlerDatum [('HandlerDatum, 0)]
PlutusTx.makeLift ''HandlerDatum

{-# INLINEABLE handlerAsset #-} 
handlerAsset :: Handler -> AssetClass
handlerAsset handler = AssetClass (hSymbol handler, threadName)

{-# INLINEABLE handlerValue #-}
handlerValue :: Maybe Datum -> Maybe HandlerDatum
handlerValue md = do
  Datum d <- md
  PlutusTx.fromBuiltinData d

handlerpkh :: PaymentPubKeyHash
handlerpkh = PaymentPubKeyHash "914f22df6f14eaae81623a9a75b00bbc03aa973e0e0aff3abe75015a"


handlerNFT :: CurrencySymbol
handlerNFT = threadCurSymbol

updateRedeemer :: HandlerRedeemer
updateRedeemer = (Update)

handlerParam :: Handler
handlerParam = Handler {hSymbol = handlerNFT, hOperator = handlerpkh}

data MintRedeemer = MintCoin | BurnCoin PaymentPubKeyHash
  deriving (Generic, ToJSON, FromJSON, Show)

PlutusTx.makeIsDataIndexed ''MintRedeemer [('MintCoin, 0), ('BurnCoin, 1)]
PlutusTx.makeLift ''MintRedeemer 

{-# INLINEABLE gcoinTokenName #-}
gcoinTokenName :: TokenName
gcoinTokenName = TokenName "GCOIN"

{-# INLINEABLE lovelaceInteger #-}
lovelaceInteger :: Value -> Integer
lovelaceInteger = Ada.getLovelace . Ada.fromValue


{--     Policy: mints GCOINs     --}
{-# INLINEABLE mkTokenPolicy #-}
mkTokenPolicy :: Handler -> TokenName -> MintRedeemer -> ScriptContext -> Bool
mkTokenPolicy handler tn re ctx =
  case re of
    MintCoin -> 
      traceIfFalse "Insufficient Ada for GCOIN minting" $ checkAdaPay (calculateValue mintedGCOINS mintRate) 
    BurnCoin user ->
      traceIfFalse "Wrong amount of Ada for redeem" (feesPaid user mintedGCOINS burnRate) &&
      traceIfFalse "The amount is a positive number" (mintedGCOINS < 0)
  where
    info :: TxInfo 
    info = scriptContextTxInfo ctx

    minted :: Value
    minted = txInfoMint $ scriptContextTxInfo ctx

    decimals :: Integer
    decimals = 1000000

    mintedGCOINS :: Integer
    mintedGCOINS = valueOf minted (ownCurrencySymbol ctx) tn

    inputHasNFT :: TxOut -> Bool
    inputHasNFT i = assetClassValueOf (txOutValue i) (handlerAsset handler) == 1

    -- checks that thread input is spent
    scriptThreadInput :: TxOut
    scriptThreadInput =
      let ins =
            [ o
              | i <- txInfoInputs info,
                let o = txInInfoResolved i,
                inputHasNFT o
            ]
      in case ins of
          [o] -> o
          _ -> traceError "expected exactly one handler input"

    handlerValue' :: HandlerDatum
    handlerValue' = case (handlerValue (txOutDatumHash scriptThreadInput >>= flip findDatum info)) of
      Nothing -> traceError "handler value not found"
      Just x -> x

    sellerPubKey :: Address -> PaymentPubKeyHash -> Bool 
    sellerPubKey address pkh = 
      case toPubKeyHash address of
        Just paymentPKH -> paymentPKH == unPaymentPubKeyHash pkh

    calculateValue :: Integer -> Integer -> Integer
    calculateValue amount rate = (amount * rate) `PlutusTx.Prelude.divide` decimals

    lovelaceInThread :: Integer
    lovelaceInThread = lovelaceInteger $ txOutValue scriptThreadInput

    checkAdaPay :: Integer -> Bool
    checkAdaPay amount = outputValue >= lovelaceInThread + amount - 10000 -- so not to loose Ada in thread utxo
      where
        addr' :: ValidatorHash
        addr' = case (toValidatorHash (txOutAddress scriptThreadInput)) of
          Just x -> x
          _ -> traceError "expected ValidatorHash"

        mintOutput = valueLockedBy info addr'
        outputValue = lovelaceInteger mintOutput

    feesPaid :: PaymentPubKeyHash -> Integer -> Integer -> Bool
    feesPaid pkh amount rate =
      let inVal = (lovelaceInteger $ valueSpent info) - lovelaceInThread
          outVal = lovelaceInteger $ valuePaidTo info (unPaymentPubKeyHash pkh)
          payBack = calculateValue amount rate
      in 
        outVal >= (inVal - 4000000) && checkAdaPay payBack
     
    mintRate :: Integer
    mintRate = (exchangeRate handlerValue') + ((exchangeRate handlerValue') `PlutusTx.Prelude.divide` 100)
    
    burnRate :: Integer
    burnRate = (exchangeRate handlerValue') - ((exchangeRate handlerValue') `PlutusTx.Prelude.divide` 100)


policy :: Handler -> TokenName -> MintingPolicy
policy handler tn = 
  mkMintingPolicyScript $
    $$(PlutusTx.compile [|| wrap ||])
      `PlutusTx.applyCode` PlutusTx.liftCode handler
      `PlutusTx.applyCode` PlutusTx.liftCode tn
  where
    wrap handler' tn' = Scripts.mkUntypedMintingPolicy $ mkTokenPolicy handler' tn'

{-# INLINEABLE mkHandlerValidator #-}
mkHandlerValidator :: Handler -> HandlerDatum -> HandlerRedeemer -> ScriptContext -> Bool
mkHandlerValidator handler handlerDatum r ctx =
  case r of 
    Claim ->         -- grab payments for GCOINs
      traceIfFalse "operator signature missing" (txSignedBy info $ unPaymentPubKeyHash $ hOperator handler)
    _ -> 
      traceIfFalse "token missing from input" inputHasNFT && 
      traceIfFalse "token missing from output" outputHasNFT && 
        case r of
          Use -> 
            traceIfFalse "handler value changed" getState 
          Update -> 
            traceIfFalse "operator signature missing" (txSignedBy info $ unPaymentPubKeyHash $ hOperator handler) &&
            traceIfFalse "invalid output datum" validOutputDatum && 
            traceIfFalse "The datum value is not changed" (not getState) 
  where
    info :: TxInfo 
    info = scriptContextTxInfo ctx

    -- function to get the input utxo from the ScriptContext
    ownInput :: TxOut
    ownInput = case findOwnInput ctx of
      Nothing -> traceError "handler input missing"
      Just i -> txInInfoResolved i

    -- function to check if the input utxo has the NFT
    inputHasNFT :: Bool
    inputHasNFT = assetClassValueOf (txOutValue ownInput) (handlerAsset handler) == 1
    --A Function that checks if we have exactly one output UTXO and returns that UTXO to us.
    ownOutput :: TxOut
    ownOutput = case getContinuingOutputs ctx of
      [o] -> o
      _ -> traceError "expected exactly one handler output"

    --A Function that checks if the NFT is present in output UTXO
    outputHasNFT :: Bool
    outputHasNFT = assetClassValueOf (txOutValue ownOutput) (handlerAsset handler) == 1

    outputDatum :: Maybe HandlerDatum
    outputDatum = handlerValue $ txOutDatumHash ownOutput >>= flip findDatum info

    -- function to check that a valid datum is present in the utxo
    validOutputDatum :: Bool
    validOutputDatum = isJust outputDatum

    getState :: Bool
    getState = case outputDatum of
      Just datum -> checkNotChanged datum
      where
        checkNotChanged :: HandlerDatum -> Bool
        checkNotChanged datum = (state datum == state handlerDatum) && (exchangeRate datum == exchangeRate handlerDatum)

--data Handling Provide instance of the ValidatorTypes class to record Datum and Redeemer type
data Handling

instance Scripts.ValidatorTypes Handling where
  type DatumType Handling = HandlerDatum
  type RedeemerType Handling = HandlerRedeemer

--function that Compile mkHandlerValidator to Plutus Core
typedHandlerValidator :: Handler -> Scripts.TypedValidator Handling
typedHandlerValidator handler =
  Scripts.mkTypedValidator @Handling
    ($$(PlutusTx.compile [||mkHandlerValidator||]) `PlutusTx.applyCode` PlutusTx.liftCode handler)
    $$(PlutusTx.compile [||wrap||])
  where
    wrap = Scripts.mkUntypedValidator @HandlerDatum @HandlerRedeemer

--add a wrap function to be able to translate the strong types from the low level version.
handlerValidator :: Handler -> Scripts.Validator
handlerValidator = Scripts.validatorScript . typedHandlerValidator

--create an address for the Validator script
handlerAddress :: Handler -> Ledger.Address
handlerAddress = scriptAddress . handlerValidator

serializeHandlerScript :: B.ByteString
serializeHandlerScript = B16.encode $ serialiseToCBOR ((PlutusScriptSerialised $ SBS.toShort . LB.toStrict $ serialise $ unValidatorScript (handlerValidator handlerParam)) :: PlutusScript PlutusScriptV1)


gcoinSymbol :: CurrencySymbol
gcoinSymbol = scriptCurrencySymbol $ policy handlerParam gcoinTokenName

serializeGcoinPolicy :: B.ByteString
serializeGcoinPolicy = B16.encode $ serialiseToCBOR ((PlutusScriptSerialised $ SBS.toShort . LB.toStrict $ serialise $ unMintingPolicyScript (policy handlerParam gcoinTokenName)) :: PlutusScript PlutusScriptV1)

