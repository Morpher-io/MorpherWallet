import Web3 from "web3";

import Lightwallet from 'eth-lightwallet';
import Web3ProviderEngine from 'web3-provider-engine';
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import SubscriptionsSubprovider from 'web3-provider-engine/subproviders/subscriptions';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';



const getWallet = (password) => new Promise((resolve, reject) => {
  
  const secretSeed = Lightwallet.keystore.generateRandomSeed();
  const vaultOpts = {
    seedPhrase: secretSeed, //'motion candy violin crazy north hazard uphold corn spray message vibrant palace',
    password: password,
    hdPathString: "m/44'/60'/0'/0",
  }

  try {
    Lightwallet.keystore.createVault(vaultOpts, (err1, ks) => {
       if (err1) throw err1;

       ks.keyFromPassword(vaultOpts.password, (err2, pwDerivedKey) => {
           if (err2) throw err2;

           ks.generateNewAddress(pwDerivedKey, 1);

           //don't prompt the user for the password on every transaction sign
           ks.passwordProvider = function (callback) {
              callback(null, password);
          };
           resolve(ks);
           
       });
   });
 } catch(err) {reject(err) };
})

const getWeb3 = (tryMetaMask, zwPassword) =>
  new Promise((resolve, reject) => {


    if(!tryMetaMask) {
      // Light-wallet options
      
      var engine = new Web3ProviderEngine();
      
      const web3 = new Web3(engine);

      getWallet(zwPassword).then(keystore => {


        engine.addProvider(new HookedWalletSubprovider({
          getAccounts: function(cb) {cb(null, keystore.getAddresses())},
          //signTransaction: (tx, ecb) =>  {
          //  var send = window.confirm("Do you want to send off this transaction?");
          //  if(send) {
          //    ks.signTransaction(tx, ecb);
          //  }
          //},
          //approveTransaction: function(cb){ window.confirm("Do you want to send off this transaction?"); return true; },
          signTransaction: function(tx, cb){ 
            if(window.confirm("Do you want to send off this transaction?")) {
              keystore.signTransaction(tx, cb); 
            }
          }
      }));
        engine.addProvider(new SubscriptionsSubprovider());
        // data source
        engine.addProvider(new RpcSubprovider({
          rpcUrl: 'http://127.0.0.1:7545',
        }));
  
        // log new blocks
        engine.on('block', function(block){
          console.log('================================')
          console.log('BLOCK CHANGED:', '#'+block.number.toString('hex'), '0x'+block.hash.toString('hex'))
          console.log('================================')
        })
  
        // network connectivity error
        engine.on('error', function(err){
          // report connectivity errors
          console.error(err.stack)
        })
  
        // start polling for blocks
        engine.start();
  
        console.log(web3);
        
        resolve(web3);
      });
     
      

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
