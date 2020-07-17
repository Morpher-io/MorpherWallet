import Web3 from "web3";
import getWeb3WebsocketProvider from "./morpher/web3WebsocketProvider";

const getWeb3 = (tryMetaMask, keystore) =>
  new Promise((resolve, reject) => {
    var engine = getWeb3WebsocketProvider(keystore, "ws://127.0.0.1:7545");
    const web3 = new Web3(engine);
    resolve(web3);
  });

export default getWeb3;
