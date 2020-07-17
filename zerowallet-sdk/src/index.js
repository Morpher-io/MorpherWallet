/**
 * @file index.js
 * @authors:
 *   Thomas Wiesner <thomas@morpher.com>
 * @date 2020
 */


import Web3ProviderEngine from "web3-provider-engine";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import WebsockerSubprovider from 'web3-provider-engine/subproviders/websocket';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
//import Web3Subprovider from 'web3-provider-engine/subproviders/web3';
import styles from "./styles";
import onWindowLoad from "./onWindowLoad";
import { connectToChild } from 'penpal';


const WIDGET_URL = 'http://localhost:3001';
const ZEROWALLET_IFRAME_CLASS = 'zerowallet-iframe';
const ZEROWALLET_CONTAINER_CLASS = 'zerowallet-container';

const tempCachingIFrame = document.createElement('iframe');
tempCachingIFrame.className = ZEROWALLET_IFRAME_CLASS;
tempCachingIFrame.style.width = '0';
tempCachingIFrame.style.height = '0';
tempCachingIFrame.style.border = 'none';
tempCachingIFrame.style.position = 'absolute';
tempCachingIFrame.style.top = '-999px';
tempCachingIFrame.style.left = '-999px';
tempCachingIFrame.src = WIDGET_URL;
onWindowLoad().then(() => {
  if (document.getElementsByClassName(ZEROWALLET_IFRAME_CLASS).length) {
    console.warn(
      'Portis script was already loaded. This might cause unexpected behavior. If loading with a <script> tag, please make sure that you only load it once.',
    );
  }
  document.body.appendChild(tempCachingIFrame);
});
let iframeLoadedFired = false;

export default class ZeroWallet {
  
  constructor(wsRPCEndpointUrl, chainId) {
    this.wsRPCEndpointUrl = wsRPCEndpointUrl;
    this.chainId = chainId;
    this.widget = this._initWidget();
    this.provider = this._initProvider();
    window.zerowallet = this;
  }

  getProvider() {
    return this.provider;
  }

  async showZeroWallet() {
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showZeroWallet();
  }

  async logout() {
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.logout();
  }

  onLogin(callback) {
    this._onLoginCallback = callback;
  }

  onLogout(callback) {
    this._onLogoutCallback = callback;
  }

  onActiveWalletChanged(callback) {
    this._onActiveWalletChangedCallback = callback;
  }

  onError(callback) {
    this._onErrorCallback = callback;
  }

  async isLoggedIn() {
    await this.iframeLoaded();
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.isLoggedIn();
  }

  async iframeLoaded() {
    return new Promise((resolve) => {
      if(iframeLoadedFired) {
        resolve();
      }
      tempCachingIFrame.onload = () => {
        iframeLoadedFired = true;
        resolve();
      }
    });
  }

  async _initWidget() {
    await onWindowLoad();
    const style = document.createElement('style');
    style.innerHTML = styles;

    const container = document.createElement('div');
    container.className = ZEROWALLET_CONTAINER_CLASS;

    const widgetFrame = document.createElement('div');
    widgetFrame.id = ZEROWALLET_CONTAINER_CLASS+`-${Date.now()}`;
    widgetFrame.className = ZEROWALLET_IFRAME_CLASS;

    container.appendChild(widgetFrame);
    document.body.appendChild(container);
    document.head.appendChild(style);

    const connection = connectToChild({
      iframe: tempCachingIFrame,
      methods: {
        setHeight: this._setHeight.bind(this),
        getWindowSize: this._getWindowSize.bind(this),
        onLogin: this._onLogin.bind(this),
        onLogout: this._onLogout.bind(this),
        onActiveWalletChanged: this._onActiveWalletChanged.bind(this),
        onError: this._onError.bind(this),
      },
    });


    tempCachingIFrame.style.position = 'absolute';
    tempCachingIFrame.style.height = '600px';
    tempCachingIFrame.style.width = '300px';
    tempCachingIFrame.style.right=0;
    tempCachingIFrame.style.left=0;
    tempCachingIFrame.style.top=0;
    tempCachingIFrame.style.background = "white";
    tempCachingIFrame.style.border = '0 transparent';

    const communication = await connection.promise;
    //communication.retrieveSession();

    return { communication, iframe: connection.iframe, widgetFrame };
  }

  _initProvider() {
    const engine = new Web3ProviderEngine();
    

    //engine.addProvider(new CacheSubprovider());
    //engine.addProvider(new SubscriptionsSubprovider());
    //engine.addProvider(new FilterSubprovider());
    //engine.addProvider(new NonceSubprovider());


   
    engine.addProvider(
      new HookedWalletSubprovider({
        getAccounts: async cb => {
          const widgetCommunication = (await this.widget).communication;
          const result = await widgetCommunication.getAccounts();
          cb(null, result);
        },
        signTransaction: async (txParams, cb) => {
          const widgetCommunication = (await this.widget).communication;
          const result = await widgetCommunication.signTransaction(txParams);
          return result;
        },
        /*
        signMessage: async (msgParams, cb) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signMessage' });
          const { error, result } = await widgetCommunication.signMessage(params, this.config);
          cb(error, result);
        },
        signPersonalMessage: async (msgParams, cb) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signPersonalMessage' });
          const { error, result } = await widgetCommunication.signMessage(params, this.config);
          cb(error, result);
        },
        signTypedMessage: async (msgParams, cb) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signTypedMessage' });
          const { error, result } = await widgetCommunication.signMessage(params, this.config);
          cb(error, result);
        },
        signTypedMessageV3: async (msgParams, cb) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signTypedMessageV3' });
          const { error, result } = await widgetCommunication.signMessage(params, this.config);
          cb(error, result);
        },
        estimateGas: async (txParams, cb) => {
          const gas = await getTxGas(query, txParams);
          cb(null, gas);
        },
        getGasPrice: async cb => {
          cb(null, '');
        },
        */
      }),
    );

    
    engine.addProvider(
      //  new RpcSubprovider({
      //    rpcUrl: "http://127.0.0.1:7545",
      //  })
        new WebsockerSubprovider({
          rpcUrl: this.wsRPCEndpointUrl
        })
      );

   

    engine.isZeroWallet = true;

    engine.on('error', error => {
      if (error && error.message && error.message.includes('PollingBlockTracker')) {
        console.warn('If you see this warning constantly, there might be an error with your RPC node.');
      } else {
        console.error(error);
      }
    });

    engine.start();
    return engine;
  }

  async _setHeight(height) {
    const widgetFrame = (await this.widget).widgetFrame;
    widgetFrame.style.height = `${height}px`;
  }

  _getWindowSize() {
    const body = document.getElementsByTagName('body')[0];
    const width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || body.clientHeight;
    return { width, height };
  }

  _onLogin(walletAddress, email) {
    if (this._onLoginCallback) {
      this._onLoginCallback(walletAddress, email);
    }
  }

  _onLogout() {
    this._selectedAddress = '';
    if (this._onLogoutCallback) {
      this._onLogoutCallback();
    }
  }

  _onActiveWalletChanged(walletAddress) {
    if (this._onActiveWalletChangedCallback) {
      this._onActiveWalletChangedCallback(walletAddress);
    }
  }

  _onError(error) {
    if (this._onErrorCallback) {
      this._onErrorCallback(error);
    }
  }

  clearSubprovider(subproviderType) {
    const subprovider = this.provider._providers.find(subprovider => subprovider instanceof subproviderType);
    this.provider.removeProvider(subprovider);
    this.provider.addProvider(new subproviderType());
  }
}