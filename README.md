# Децентрализованное приложение в блокчейне Кардано для покупки и продажи цифрового актива

## Description
Разработка децентрализованного приложения включает в себя:
 - фронтенд часть (получение из API индекса CO2, взаимодействие со скриптами в блокчейне)
 - <a target="_blank" href="https://github.com/Timekiller7/cardano-dapp/blob/ccdf7be321ce231ebd4630bd0f85752c89028aa2/src/cardano/nft/onchain/HandlerContract.hs#L211"><b>скрипт пула, контролирующего рейт ЦФА к CO2 </b></a>
 - <a target="_blank" href="https://github.com/Timekiller7/cardano-dapp/blob/ccdf7be321ce231ebd4630bd0f85752c89028aa2/src/cardano/nft/onchain/HandlerContract.hs#L122C1-L122C14"><b>скрипт самого ЦФА, контролирующий его покупку и продажу</b></a>
 - <a target="_blank" href="https://github.com/Timekiller7/cardano-dapp/blob/ccdf7be321ce231ebd4630bd0f85752c89028aa2/src/cardano/nft/onchain/NFT.hs#L46"><b>скрипт для тред-токена, идентифицирующего output, в котором находится рейт </b></a> 

App launching:
      npm install --force
      npm start


