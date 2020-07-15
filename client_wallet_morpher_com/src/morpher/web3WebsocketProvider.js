import Web3ProviderEngine from "web3-provider-engine";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import SubscriptionsSubprovider from "web3-provider-engine/subproviders/subscriptions";
//import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
import WebsockerSubprovider from "web3-provider-engine/subproviders/websocket";

const getWeb3WebsocketProvider = (keystore, wsRpcUrl) =>
  new Promise((resolve, reject) => {
    var engine = new Web3ProviderEngine();
    engine.addProvider(
      new HookedWalletSubprovider({
        getAccounts: function (cb) {
          cb(null, keystore.getAddresses());
        },
        signTransaction: function (tx, cb) {
          if (window.confirm("Sign this transaction?")) {
            keystore.signTransaction(tx, cb);
          }
        },
      })
    );
    engine.addProvider(new SubscriptionsSubprovider());
    // data source
    engine.addProvider(
      //new RpcSubprovider({
      //  rpcUrl: "http://127.0.0.1:7545",
      //})
      new WebsockerSubprovider({
        rpcUrl: wsRpcUrl,
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
    engine.on("error", function (err) {
      // report connectivity errors
      console.error(err.stack);
    });

    // start polling for blocks
    engine.start();

    resolve(engine);
  });

export default getWeb3WebsocketProvider;
