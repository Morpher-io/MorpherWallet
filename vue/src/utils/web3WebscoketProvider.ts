import Web3ProviderEngine from "web3-provider-engine";
const HookedWalletSubprovider = require("web3-provider-engine/subproviders/hooked-wallet.js");
const SubscriptionsSubprovider = require("web3-provider-engine/subproviders/subscriptions");
//const RpcSubprovider  = require('web3-provider-engine/subproviders/rpc.js');
const WebsocketSubprovider = require("web3-provider-engine/subproviders/websocket");

const getWeb3WebsocketProvider = (keystore: any, wsRpcUrl: string) =>
  new Promise((resolve, reject) => {
    const engine = new Web3ProviderEngine();
    engine.addProvider(
      new HookedWalletSubprovider({
        getAccounts: function(cb: any) {
          cb(null, keystore.getAddresses());
        },
        signTransaction: function(tx: any, cb: any) {
          if (window.confirm("Sign this transaction?")) {
            keystore.signTransaction(tx, cb);
          }
        }
      })
    );
    engine.addProvider(new SubscriptionsSubprovider());
    // data source
    engine.addProvider(
      //new RpcSubprovider({
      //  rpcUrl: "http://127.0.0.1:7545",
      //})
      new WebsocketSubprovider({
        rpcUrl: wsRpcUrl
      })
    );

    // log new blocks
    // engine.on("block", function (block) {
    //   console.log("================================");
    //   console.log(
    //     "BLOCK CHANGED:",
    //     "#" + block.number.toString("hex"),
    //     "0x" + block.hash.toString("hex")
    //   );
    //   console.log("================================");
    // });

    // network connectivity error
    engine.on("error", () => {
      // report connectivity errors
      console.error("network connectivity error");
    });

    // start polling for blocks
    engine.start();

    resolve(engine);
  });

export default getWeb3WebsocketProvider;
