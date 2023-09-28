{-# LANGUAGE DataKinds           #-}
{-# LANGUAGE DeriveAnyClass      #-}
{-# LANGUAGE DeriveGeneric       #-}
{-# LANGUAGE FlexibleContexts    #-}
{-# LANGUAGE ImportQualifiedPost #-}
{-# LANGUAGE OverloadedStrings   #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell     #-}
{-# LANGUAGE TypeApplications    #-}
{-# LANGUAGE TypeFamilies        #-}
{-# LANGUAGE TypeOperators       #-}
{-# LANGUAGE NoImplicitPrelude   #-}

module NFT
  ( threadName,
    ownerOref,
    threadPolicyFromRef,
    threadCurSymbol
  )
where

import Cardano.Api.Shelley (PlutusScript (..), PlutusScriptV1, serialiseToCBOR)
import Codec.Serialise
import qualified Data.ByteString.Lazy  as LBS
import Data.ByteString.Short qualified as SBS
import qualified Data.ByteString as B
import qualified Data.ByteString.Base16 as B16
import Ledger hiding (mint, singleton)
import Ledger.Typed.Scripts qualified as Scripts
import Ledger.Value as Value
import Plutus.Script.Utils.V1.Scripts (scriptCurrencySymbol)
import Plutus.V1.Ledger.Scripts (mkMintingPolicyScript, unMintingPolicyScript)
import PlutusTx qualified
import PlutusTx.Prelude hiding (Semigroup (..), unless)
import Prelude qualified hiding (($))


{-# INLINEABLE threadName #-}
threadName :: TokenName
threadName = TokenName "GCOIN:Thread"

ownerOref :: TxOutRef
ownerOref = TxOutRef "a3f8b4672d20c799fdd06e67cb2e37f1e729969bd1e4913cb9fdd6fcac38695d" 0

{-# INLINEABLE mkThreadPolicy #-}
mkThreadPolicy :: TxOutRef -> TokenName -> () -> ScriptContext -> Bool
mkThreadPolicy oref tn () ctx =
    traceIfFalse "UTxO not consumed" hasUTxO && 
    traceIfFalse "wrong amount minted" checkMintedAmount
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    hasUTxO :: Bool
    hasUTxO = any (\i -> txInInfoOutRef i == oref) $ txInfoInputs info

    checkMintedAmount :: Bool
    checkMintedAmount = case flattenValue (txInfoMint info) of
      [(_, tn', amt')] -> tn == tn' && amt' == 1
      _ -> False

threadPolicy :: TxOutRef -> TokenName -> Scripts.MintingPolicy
threadPolicy oref tn =
  mkMintingPolicyScript $
    $$(PlutusTx.compile [||\oref' tn' -> Scripts.mkUntypedMintingPolicy $ mkThreadPolicy oref' tn'||])
      `PlutusTx.applyCode` PlutusTx.liftCode oref
      `PlutusTx.applyCode` PlutusTx.liftCode tn

threadCurSymbol :: CurrencySymbol
threadCurSymbol = scriptCurrencySymbol $ threadPolicy ownerOref threadName

threadPolicyFromRef :: B.ByteString
threadPolicyFromRef = B16.encode $ serialiseToCBOR ((PlutusScriptSerialised $ SBS.toShort . LBS.toStrict $ serialise $ unMintingPolicyScript (threadPolicy ownerOref threadName)) :: PlutusScript PlutusScriptV1)


