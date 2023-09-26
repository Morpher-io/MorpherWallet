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
const MORPHERWALLET_IFRAME_CLASS = 'morpherwallet-widget-frame';
const MORPHERWALLET_CONTAINER_CLASS = 'morpherwallet-container';
let morpherWalletIframe: HTMLIFrameElement;
let morpherWalletContainer: HTMLDivElement;
let _onSendCallback:any = null;


if (document.getElementById('morpher_wallet_sdk_iframe')) {
	morpherWalletIframe = (document.getElementById('morpher_wallet_sdk_iframe') as HTMLIFrameElement);
} else {
  morpherWalletIframe = document.createElement('iframe');
  morpherWalletIframe.id = 'morpher_wallet_sdk_iframe';
  morpherWalletIframe.className = MORPHERWALLET_IFRAME_CLASS;
  morpherWalletIframe.scrolling = "no";
  morpherWalletIframe.style.overflow = "hidden";
  morpherWalletIframe.style.width = "0";
  morpherWalletIframe.style.height = "0";
}


export type MorpherWalletConfig = {
	__typename?: "Type2FARequired";
	env: string;
  show_transaction: boolean;
	confirm_transaction: boolean;
	show_message: boolean;
  confirm_message: boolean;
  locale?: string;
} | null;

export default class MorpherWallet {

	wsRPCEndpointUrl: string;
	chainId: number;
	widget: any;
	provider: Web3ProviderEngine;
  _on2FAUpdateCallback: any;
  _onRecoveryUpdateCallback: any;
  _onRecoveryCallback: any;
	_onLoginCallback: any;
  _on2FACallback: any;
  _onLoginErrorCallback: any;
	_onLogoutCallback: any;
	_onCloseCallback: any;
	_onActiveWalletChangedCallback: any;
	_onErrorCallback: any;
	config: MorpherWalletConfig;
	_selectedAddress: any;
  
  constructor(wsRPCEndpointUrl: string, chainId: number, config: MorpherWalletConfig = null) {
		if (config === null) {
			config = {
				show_transaction: false,
				confirm_transaction: false,
				show_message: false,
				confirm_message: false,
				env: 'live'
      };
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

    this.setLanguage(this.config.locale);

		
    //window.morpherwallet = this;
  }
 
  setConfig(config: MorpherWalletConfig) {
     this.config = config;
  }

  getProvider() {
    return this.provider;
  }

  getChainId() {
    return this.chainId;
  }

  async showMorpherWallet() {
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

  on2FA(callback: any) {
    this._on2FACallback = callback;
  }
  

  on2FAUpdate(callback: any) {
    this._on2FAUpdateCallback = callback;
  }

  onRecoveryUpdate(callback: any) {
    this._onRecoveryUpdateCallback = callback;
  }
  onRecovery(callback: any) {
    this._onRecoveryCallback = callback;
  }
  onLoginError(callback: any) {
    this._onLoginErrorCallback = callback;
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
  onSend(callback: any) {
    _onSendCallback = callback;
  }
  async openSendInApp() {
    this.hideWallet()
    if (_onSendCallback) {
      _onSendCallback();
    }
  }
	
	async loginWallet() {
		const loggedInResult = await this.isLoggedIn();
		if (loggedInResult && loggedInResult.isLoggedIn) {
			const widgetCommunication = (await this.widget).communication;
			const result = await widgetCommunication.getAccounts();
      if (this._onLoginCallback) {
        this._onLoginCallback(result[0], loggedInResult.walletEmail, loggedInResult.recovery_type);
    }      
			return result
		} else {
			this.showWallet();
		}

	}

  async loginWalletHidden(type: string, user: string, password: string) {
    this.hideWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.loginWalletHidden(type, user, password);
  }

  async loginWallet2fa(twoFACode: string) {
    this.hideWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.loginWallet2fa(twoFACode);
  }

  async loginWallet2faSend() {
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.loginWallet2faSend();

  }

  async walletRecoveryHidden(type: string, data: any) {
    this.hideWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.walletRecoveryHidden(type, data);

  }

  async signupWalletHidden(type: string, walletEmail: string, walletPassword: string, walletPasswordRepeat: string, loginUser: any) {
  	

    this.hideWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.signupWalletHidden(type, walletEmail, walletPassword, walletPasswordRepeat, loginUser);
  }

	async showWalletSettings() {
		this.showWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('settings');
	}

  async showWallet2fa() {
    this.showWallet();
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('2fa');
  }    

  async showWalletRecovery() {
    this.showWallet();
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('recovery');
  }    

  async showWalletEmail() {
    this.showWallet();
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('email');
  } 

  async showWalletPassword(password: string) {
    this.showWallet();
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('password', password);
}

	async showWalletRegister() {
		this.showWallet()
    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.showPage('register');
	}

	async showWallet() {
		
    morpherWalletContainer.style.height = '100%';
    morpherWalletContainer.style.width = '100%';
    morpherWalletContainer.style.top = '0';
    morpherWalletContainer.style.left = '0';
    morpherWalletContainer.style.display = 'inline';
    morpherWalletContainer.style.visibility = 'visible';
    morpherWalletIframe.style.width = '';
    morpherWalletIframe.style.height = '';
    
    if (this.config && this.config.env === 'dev') {
      morpherWalletIframe.style.border = '3px solid #00d492';
    }
	}

	async hideWallet() {
    morpherWalletContainer.style.width = '0';
    morpherWalletContainer.style.height = '0';
    morpherWalletContainer.style.display = 'block';
    morpherWalletContainer.style.visibility = 'invisible';
    morpherWalletContainer.style.top = '-999px';
    morpherWalletContainer.style.left = '-999px';
    morpherWalletIframe.style.width = '0';
    morpherWalletIframe.style.height = '0';
    morpherWalletIframe.style.border = 'none';
	}

  async isLoggedIn() {

		await this.iframeLoaded();

		const widget = await this.widget;

		const widgetCommunication = (await this.widget).communication;
    const loggedIn = widgetCommunication.isLoggedIn();
    return loggedIn

  }

  async setLanguage(lang?: string) {
    if (!lang) return;

		await this.iframeLoaded();

		const widgetCommunication = (await this.widget).communication;

		return widgetCommunication.setLanguage(lang);
	}

  async hasSocialRecoveryMethods() {

    await this.iframeLoaded();

    const widget = await this.widget;

    const widgetCommunication = (await this.widget).communication;
    return widgetCommunication.hasSocialRecoveryMethods();        
}

  async iframeLoaded() {
    return new Promise((resolve) => {
      const frame:any = document.getElementById('morpher_wallet_sdk_iframe');
      try {
          if (frame && frame.contentWindow && !frame.contentDocument) {
              return resolve(true);
          }
      } catch (err) {
          
      }
      const int = setInterval(() => {
          try {
              if (frame && frame.contentWindow && !frame.contentDocument) {
                  clearInterval(int);
                  return resolve(true);
              }
          } catch (err) {
              
          }
      }, 100);
    });
  }

  async _initWidget() {
		morpherWalletIframe.src = WIDGET_URL;
    
    await onWindowLoad();
    const style = document.createElement('style');
    style.innerHTML = styles;

		if (document.getElementById('morpher_wallet_sdk_container')) {
			morpherWalletContainer = (document.getElementById('morpher_wallet_sdk_container') as HTMLDivElement);
		} else {
			morpherWalletContainer = document.createElement('div');
			morpherWalletContainer.id= 'morpher_wallet_sdk_container';
			morpherWalletContainer.className = MORPHERWALLET_CONTAINER_CLASS;
			morpherWalletContainer.style.width = '0';
			morpherWalletContainer.style.height = '0';
			morpherWalletContainer.style.border = 'none';
      morpherWalletContainer.style.overflow = 'hidden';
			morpherWalletContainer.style.visibility = 'invisible';
			morpherWalletContainer.style.top = '-999px';
			morpherWalletContainer.style.left = '-999px';
			morpherWalletContainer.appendChild(morpherWalletIframe);
			document.body.appendChild(morpherWalletContainer);
			document.head.appendChild(style);
	
		}

    const connection = connectToChild({
      iframe: morpherWalletIframe,
      methods: {
        setHeight: this._setHeight.bind(this),
        getWindowSize: this._getWindowSize.bind(this),
				onLogin: this._onLogin.bind(this),
        on2FA: this._on2FA.bind(this),
        on2FAUpdate: this._on2FAUpdate.bind(this),
        onRecoveryUpdate: this._onRecoveryUpdate.bind(this),
        onRecovery: this._onRecovery.bind(this),
        onLoginError: this._onLoginError.bind(this),
				onClose: this._onClose.bind(this),
        onLogout: this._onLogout.bind(this),
        onActiveWalletChanged: this._onActiveWalletChanged.bind(this),
				onError: this._onError.bind(this),
				hideWallet: this.hideWallet,
        openSendInApp: this.openSendInApp,
        showWallet: this.showWallet
      },
    });

    const communication = await connection.promise;
    //communication.retrieveSession();

    return { communication: (communication as any), iframe: morpherWalletIframe };
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
          if (txParams.maxFeePerGas !== undefined && txParams.maxPriorityFeePerGas !== undefined && txParams.gasPrice !== undefined) 
            delete txParams.gasPrice;

          if (txParams.maxFeePerGas !== undefined && txParams.maxPriorityFeePerGas !== undefined && txParams.chainId && Number(txParams['chainId']) !== 21 && Number(txParams['chainId']) !== 210 && Number(txParams['chainId']) !== 2100) {
            txParams.chain = 'mainnet';
            txParams.hardfork = 'london';
          }          
          
          if (this.config?.show_transaction || this.config?.confirm_transaction || (Number(txParams.chainId) !== 21 && Number(txParams.chainId) !== 210 && Number(txParams.chainId) !== 2100))
            this.showWallet();
          const result = await widgetCommunication.signTransaction(txParams, this.config, this.wsRPCEndpointUrl);

          if (this.config?.show_transaction || this.config?.confirm_transaction || (Number(txParams.chainId) !== 21 && Number(txParams.chainId) !== 210 && Number(txParams.chainId) !== 2100))
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
          if (this.config?.show_message || this.config?.confirm_message)
            this.showWallet();
          const  result  = await widgetCommunication.signMessage(params, this.config);
          if(cb) {
						cb(null, result);
					}
          if (this.config?.show_message || this.config?.confirm_message)
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

  _onLogin(walletAddress: any, email: any, recovery_type: any) {
		this.hideWallet();
    if (this._onLoginCallback) {
      this._onLoginCallback(walletAddress, email, recovery_type);
    }
	}

  _on2FA(data: any) {
    if (this._on2FACallback) {
      this._on2FACallback(data);
    }
  }


  _on2FAUpdate(method: any, enabled: any) {
    if (this._on2FAUpdateCallback) {
      this._on2FAUpdateCallback(method, enabled);
    }
  }

  _onRecoveryUpdate(method: any, enabled: any) {
    if (this._onRecoveryUpdateCallback) {
      this._onRecoveryUpdateCallback(method, enabled);
    }    
  }

  _onRecovery(type: any, data: any) {
    if (this._onRecoveryCallback) {
      this._onRecoveryCallback(type, data);
    }    
  }

  _onLoginError(email: any, error: any) {
    if (this._onLoginErrorCallback) {
      this._onLoginErrorCallback(email, error);
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