import Web3 from "web3";

import Web3ProviderEngine from "web3-provider-engine";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import SubscriptionsSubprovider from "web3-provider-engine/subproviders/subscriptions";
//import RpcSubprovider from "web3-provider-engine/subproviders/rpc";
import WebsockerSubprovider from 'web3-provider-engine/subproviders/websocket';

const getWeb3 = (tryMetaMask, keystore) =>
  new Promise((resolve, reject) => {
    if (!tryMetaMask) {
      // Light-wallet options

      var engine = new Web3ProviderEngine();

      const web3 = new Web3(engine);

      engine.addProvider(
        new HookedWalletSubprovider({
          getAccounts: function (cb) {
            
            //some more code here
            //setTimeout(() => cb(null, keystore.getAddresses()), 5000);
            cb(null, keystore.getAddresses());
            //added some code
            
          },
          //signTransaction: (tx, ecb) =>  {
          //  var send = window.confirm("Do you want to send off this transaction?");
          //  if(send) {
          //    ks.signTransaction(tx, ecb);
          //  }
          //},
          //approveTransaction: function(cb){ window.confirm("Do you want to send off this transaction?"); return true; },
          signTransaction: function (tx, cb) {
            if (window.confirm("Do you want to send off this transaction?")) {
              //setTimeout(() => keystore.signTransaction(tx,cb), 5000);
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
          rpcUrl: 'ws://127.0.0.1:7545'
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

      console.log(web3);

      resolve(web3);
    } else {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener("load", async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            // Request account access if needed
            await window.ethereum.enable();
            // Acccounts now exposed
            resolve(web3);
          } catch (error) {
            reject(error);
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          // Use Mist/MetaMask's provider.
          const web3 = window.web3;
          console.log("Injected web3 detected.");
          resolve(web3);
        }
        // Fallback to localhost; use dev console port by default...
        else {
          const provider = new Web3.providers.HttpProvider(
            "http://127.0.0.1:8545"
          );
          const web3 = new Web3(provider);
          console.log("No web3 instance injected, using Local web3.");
          resolve(web3);
        }
      });
    }
  });

export default getWeb3;
