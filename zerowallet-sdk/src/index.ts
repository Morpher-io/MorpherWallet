/**
 * @file index.js
 * @authors:
 *   Thomas Wiesner <thomas@morpher.com>
 * @date 2020
 */

import Web3ProviderEngine from "web3-provider-engine";

const HookedWalletSubprovider = require("web3-provider-engine/subproviders/hooked-wallet.js");
const WebsocketSubprovider = require("web3-provider-engine/subproviders/websocket");

//import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';
//import Web3Subprovider from 'web3-provider-engine/subproviders/web3';
import { styles } from "./styles";
import { onWindowLoad } from "./onWindowLoad";
import { connectToChild } from 'penpal';


let WIDGET_URL: string;
const ZEROWALLET_IFRAME_CLASS = 'zerowallet-widget-frame';
const ZEROWALLET_CONTAINER_CLASS = 'zerowallet-container';
let zeroWalletIframe: HTMLIFrameElement;
let zeroWalletContainer: HTMLDivElement;

if (document.getElementById('zero_wallet_sdk_iframe')) {
	zeroWalletIframe = (document.getElementById('zero_wallet_sdk_iframe') as HTMLIFrameElement);
} else {
	zeroWalletIframe = document.createElement('iframe');
	zeroWalletIframe.id= 'zero_wallet_sdk_iframe';
	zeroWalletIframe.className = ZEROWALLET_IFRAME_CLASS;
	zeroWalletIframe.scrolling="no";
	zeroWalletIframe.style.overflow="hidden";
}


export type ZeroWalletConfig = {
	__typename?: "Type2FARequired";
	env: string;
  show_transaction: boolean;
	confirm_transaction: boolean;
	show_message: boolean;
  confirm_message: boolean;
} | null;

let iframeLoadedFired = false;

export default class ZeroWallet {

	wsRPCEndpointUrl: string;
	chainId: number;
	widget: any;
	provider: Web3ProviderEngine;
	_onLoginCallback: any;
	_onLogoutCallback: any;
	_onCloseCallback: any;
	_onActiveWalletChangedCallback: any;
	_onErrorCallback: any;
	config: ZeroWalletConfig;
	_selectedAddress: any;
  
  constructor(wsRPCEndpointUrl: string, chainId: number, config: ZeroWalletConfig = null) {
		if (config === null) {
			config = {
				show_transaction: false,
				confirm_transaction: false,
				show_message: false,
				confirm_message: false,
				env: 'live'
			}
		}
		
		if (!config.env) {
			config.env = 'live';
		}
		if (config.env === 'live') {
			WIDGET_URL = 'https://wallet.morpher.com';			
		} else if (config.env === 'dev') {
			WIDGET_URL = 'https://wallet-dev.morpher.com';
		} else {
			WIDGET_URL = 'http://localhost:3001';
		}
		this.config = config;
    this.wsRPCEndpointUrl = wsRPCEndpointUrl;
    this.chainId = chainId;
    this.widget = this._initWidget();
		this.provider = this._initProvider();

		
    //window.zerowallet = this;
  }

  getProvider() {
    return this.provider;
  }

  getChainId() {
    return this.chainId;
  }

  async showZeroWallet() {
		this.showWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('wallet');
  }

  async logout() {
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.logout();
  }

  onLogin(callback: any) {
    this._onLoginCallback = callback;
  }

	onClose(callback: any) {
    this._onCloseCallback = callback;
	}
	
  onLogout(callback: any) {
    this._onLogoutCallback = callback;
  }

  onActiveWalletChanged(callback: any) {
    this._onActiveWalletChangedCallback = callback;
  }

  onError(callback: any) {
    this._onErrorCallback = callback;
	}
	
	async loginWallet() {
		const loggedInResult = await this.isLoggedIn();
		if (loggedInResult && loggedInResult.isLoggedIn) {
			const widgetCommunication = (await this.widget).communication;
			const result = await widgetCommunication.getAccounts();
			return result
		} else {
			this.showWallet();
		}

	}

	async showWalletSettings() {
		this.showWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('settings');
	}

	async showWalletRegister() {
		this.showWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('register');
	}

	async showWallet() {
		
    zeroWalletContainer.style.position = 'absolute';
    zeroWalletContainer.style.height = '100%';
    zeroWalletContainer.style.width = '100%';
    zeroWalletContainer.style.top='0';
    zeroWalletContainer.style.left='0';
		zeroWalletContainer.style.display = 'inline';
		zeroWalletContainer.style.visibility = 'visible';
	
	}

	async hideWallet() {
		zeroWalletContainer.style.position = 'absolute';
		zeroWalletContainer.style.width = '0';
		zeroWalletContainer.style.height = '0';
		zeroWalletContainer.style.display = 'none';
		zeroWalletContainer.style.visibility = 'invisible';
		zeroWalletContainer.style.top = '-999px';
		zeroWalletContainer.style.left = '-999px';		
	}

  async isLoggedIn() {

		await this.iframeLoaded();

		const widget = await this.widget;

		const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.isLoggedIn();
  }

  async iframeLoaded() {
    return new Promise((resolve): void => {
      if(iframeLoadedFired) {
        resolve(true);
      }

      zeroWalletIframe.onload = () => {
        iframeLoadedFired = true;
        resolve(true);
      };
    });
  }

  async _initWidget() {
		zeroWalletIframe.src = WIDGET_URL;
		
		zeroWalletIframe.onload = () => {
			iframeLoadedFired = true;
		};
    
    await onWindowLoad();
    const style = document.createElement('style');
    style.innerHTML = styles;

		if (document.getElementById('zero_wallet_sdk_container')) {
			zeroWalletContainer = (document.getElementById('zero_wallet_sdk_container') as HTMLDivElement);
		} else {
			zeroWalletContainer = document.createElement('div');
			zeroWalletContainer.id= 'zero_wallet_sdk_container';
			zeroWalletContainer.className = ZEROWALLET_CONTAINER_CLASS;
			zeroWalletContainer.style.width = '0';
			zeroWalletContainer.style.height = '0';
			zeroWalletContainer.style.border = 'none';
			zeroWalletContainer.style.display = 'none';
			zeroWalletContainer.style.visibility = 'invisible';
			zeroWalletContainer.style.position = 'absolute';
			zeroWalletContainer.style.top = '-999px';
			zeroWalletContainer.style.left = '-999px';
			zeroWalletContainer.appendChild(zeroWalletIframe);
			document.body.appendChild(zeroWalletContainer);
			document.head.appendChild(style);
	
		}

    const connection = connectToChild({
      iframe: zeroWalletIframe,
      methods: {
        setHeight: this._setHeight.bind(this),
        getWindowSize: this._getWindowSize.bind(this),
				onLogin: this._onLogin.bind(this),
				onClose: this._onClose.bind(this),
        onLogout: this._onLogout.bind(this),
        onActiveWalletChanged: this._onActiveWalletChanged.bind(this),
				onError: this._onError.bind(this),
				hideWallet: this.hideWallet,
        showWallet: this.showWallet
      },
    });

    const communication = await connection.promise;
    //communication.retrieveSession();

    return { communication: (communication as any), iframe: zeroWalletIframe };
  }

  _initProvider() {
    const engine = new Web3ProviderEngine();
    

    //engine.addProvider(new CacheSubprovider());
    //engine.addProvider(new SubscriptionsSubprovider());
    //engine.addProvider(new FilterSubprovider());
    //engine.addProvider(new NonceSubprovider());

    let self = this;
   
    engine.addProvider(
      new HookedWalletSubprovider({
        getAccounts: async (cb: any) => {
          const widgetCommunication = (await this.widget).communication;
          const result = await widgetCommunication.getAccounts();
          cb(null, result);
				},
        signTransaction: async (txParams: any, cb: any) => {
          const widgetCommunication = (await this.widget).communication;
         
          txParams.chainId = self.getChainId();
          if (this.config?.show_transaction || Number(txParams.chainId) !== 21)
            this.showWallet();                
					const result = await widgetCommunication.signTransaction(txParams, this.config);

          if (this.config?.show_transaction || Number(txParams.chainId) !== 21)
            this.hideWallet();           

					if(cb) {
            if (!result) {
              cb("The transaction was cancelled by the user");  
              return;
            }
						cb(null, result);
					}
               
          return result;
				},
        
        signMessage: async (msgParams: any, cb: any) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signMessage' });
          if (this.config?.show_message)
            this.showWallet();
          const  result  = await widgetCommunication.signMessage(params, this.config);
          if(cb) {
						cb(null, result);
					}
          if (this.config?.show_message)
            this.hideWallet();    
          return result;           
        },
        signPersonalMessage: async (msgParams: any, cb: any) => {
					
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signPersonalMessage' });
          if (this.config?.show_message)
            this.showWallet();                  
          const result  = await widgetCommunication.signMessage(params, this.config);
					if(cb) {
						cb(null, result);
					}
          if (this.config?.show_message)
            this.hideWallet();    
          return result;                     

        },
        signTypedMessage: async (msgParams: any, cb: any) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signTypedMessage' });
          if (this.config?.show_message)
            this.showWallet();                  
          const { error, result } = await widgetCommunication.signMessage(params, this.config);
					if(cb) {
						cb(null, result);
					}
          if (this.config?.show_message)
            this.hideWallet();    
          return result;                     
        },
        signTypedMessageV3: async (msgParams: any, cb: any) => {
          const widgetCommunication = (await this.widget).communication;
          const params = Object.assign({}, msgParams, { messageStandard: 'signTypedMessageV3' });
          if (this.config?.show_message)
            this.showWallet();                  
          const { error, result } = await widgetCommunication.signMessage(params, this.config);
					if(cb) {
						cb(null, result);
					}
          if (this.config?.show_message)
            this.hideWallet();    
          return result;                     
				},
				/*
        estimateGas: async (txParams: any, cb: any) => {
					console.log('wallet provider - estimateGas')
					//const gas = await getTxGas(query, txParams);
					const gas = 0;
          cb(null, gas);
        },
        getGasPrice: async (cb: any) => {
					console.log('wallet provider - getGasPrice')
          cb(null, '');
				},
				*/
        
      }),
    );

    
    engine.addProvider(
      //  new RpcSubprovider({
      //    rpcUrl: "http://127.0.0.1:7545",
      //  })
        new WebsocketSubprovider({
          rpcUrl: this.wsRPCEndpointUrl
        })
      );

			
/*
    engine.on('error', () => {
      if (error && error.message && error.message.includes('PollingBlockTracker')) {
        console.warn('If you see this warning constantly, there might be an error with your RPC node.');
      } else {
        console.error(error);
      }
    });
*/
    engine.start();
    return engine;
  }

  async _setHeight(height: any) {
    const widgetFrame = (await this.widget).widgetFrame;
    widgetFrame.style.height = `${height}px`;
  }

  _getWindowSize() {
    const body = document.getElementsByTagName('body')[0];
    const width = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || body.clientHeight;
    return { width, height };
  }

  _onLogin(walletAddress: any, email: any) {
		this.hideWallet();
    if (this._onLoginCallback) {
      this._onLoginCallback(walletAddress, email);
    }
	}
	
	_onClose() {
    if (this._onCloseCallback) {
      this._onCloseCallback();
    }
  }

  _onLogout() {
    this._selectedAddress = '';
    if (this._onLogoutCallback) {
      this._onLogoutCallback();
    }
  }

  _onActiveWalletChanged(walletAddress: any) {
    if (this._onActiveWalletChangedCallback) {
      this._onActiveWalletChangedCallback(walletAddress);
    }
  }

  _onError(error: any) {
    if (this._onErrorCallback) {
      this._onErrorCallback(error);
    }
  }

  clearSubprovider(subproviderType: any) {
    //const subprovider = this.provider._providers.find((subprovider: any) => subprovider instanceof subproviderType);
    //this.provider.removeProvider(subprovider);
    //this.provider.addProvider(new subproviderType());
  }
}