import { EventEmitter} from 'events';

import { getChain, makeError } from './utils';
import { createPublicClient, http, stringify, toHex, webSocket  } from 'viem';
import { WindowMessenger, connect } from 'penpal';
import { onWindowLoad } from './onWindowLoad';
import { styles, closeButton } from './styles';

var __defProp = Object.defineProperty;
var __name = (target: any, value: string) => __defProp(target, "name", { value, configurable: true });
const MORPHERWALLET_IFRAME_CLASS = 'morpherwallet-widget-frame';
const MORPHERWALLET_CONTAINER_CLASS = 'morpherwallet-container';

export type MorpherWalletConfig = {
	__typename?: "MorpherWalletConfig";
	env: string;
  show_transaction: boolean;
	confirm_transaction: boolean;
	show_message: boolean;
  confirm_message: boolean;
  locale?: string;
} | null;
export class MorpherWalletProvider extends EventEmitter {
  protected WIDGET_URL: string;
  protected morpherWalletIframe: HTMLIFrameElement;
  protected morpherWalletContainer: HTMLDivElement;
	protected chainId: number;
	protected widget: any;
  public isConnecting: boolean = false;
  
  protected _on2FAUpdateCallback: any;
  protected _onRecoveryUpdateCallback: any;
  protected _onRecoveryCallback: any;
	protected _onLoginCallback: any;
  protected _on2FACallback: any;
  protected _onLoginErrorCallback: any;
	protected _onLogoutCallback: any;
	protected _onCloseCallback: any;
	protected _onActiveWalletChangedCallback: any;
	protected _onErrorCallback: any;
  protected _onSendCallback: any;
	protected config: MorpherWalletConfig;
	protected _selectedAddress: any;
  protected loggedIn: boolean = false;
protected rpcURL: string;
  static {
    __name(this, "MorpherWalletProvider");
  }
  protected public_client;

  
 constructor(rpcURL: string, chainId: number, config: MorpherWalletConfig) {
  super();
  
  this.rpcURL = rpcURL;
  if (config === null) {
    config = {
      show_transaction: false,
      confirm_transaction: false,
      show_message: false,
      confirm_message: false,
      env: 'live'
    };
  }

  this.config = config

  if (!config.env) {
    config.env = 'live';
  }
  if (config.env === 'live') {
    this.WIDGET_URL = 'https://wallet.morpher.com';			
  } else if (config.env === 'dev') {
    this.WIDGET_URL = 'https://wallet-dev-test.morpher.com';
  } else {
    this.WIDGET_URL = 'http://localhost:3001';
  }

  this.chainId = chainId;

  if (document.getElementById('morpher_wallet_sdk_iframe')) {
    this.morpherWalletIframe = (document.getElementById('morpher_wallet_sdk_iframe') as HTMLIFrameElement);
  } else {
    this.morpherWalletIframe = document.createElement('iframe');
    this.morpherWalletIframe.id = 'morpher_wallet_sdk_iframe';
    this.morpherWalletIframe.className = MORPHERWALLET_IFRAME_CLASS;
    this.morpherWalletIframe.scrolling = "no";
    this.morpherWalletIframe.style.overflow = "hidden";
    this.morpherWalletIframe.style.width = "0";
    this.morpherWalletIframe.style.height = "0";
  }

  if (document.getElementById('morpher_wallet_sdk_container')) {
    this.morpherWalletContainer = (document.getElementById('morpher_wallet_sdk_container') as HTMLDivElement);
  } else {
    this.morpherWalletContainer = document.createElement('div');
  }


  this.widget = this._initWidget();

   // signer: JsonRpcSigner, provider?: JsonRpcSigner["provider"]
 
   let chain = getChain(chainId, rpcURL)

   const public_client = createPublicClient({
      chain: chain,
      transport: rpcURL.includes('http') ? http() : webSocket(),
      cacheTime: 10_000
    });
    
    this.public_client = public_client;
  }
  async _initWidget() {
    this.isConnecting = true;
    
    await onWindowLoad();
    const style = document.createElement('style');
    style.innerHTML = styles;

    const closeButtonHtml = document.createElement('div');
    closeButtonHtml.innerHTML = closeButton;
    closeButtonHtml.className = 'hidden';
    closeButtonHtml.id='morpher_WalletCloseButton'
    

		if (!document.getElementById('morpher_wallet_sdk_container')) {
			this.morpherWalletContainer.id= 'morpher_wallet_sdk_container';
			this.morpherWalletContainer.className = MORPHERWALLET_CONTAINER_CLASS;
      this.morpherWalletContainer.appendChild(closeButtonHtml);
      closeButtonHtml.style.visibility = 'invisible'
      
			this.morpherWalletContainer.style.width = '0';
			this.morpherWalletContainer.style.height = '0';
			this.morpherWalletContainer.style.border = 'none';
      this.morpherWalletContainer.style.overflow = 'hidden';
			this.morpherWalletContainer.style.visibility = 'invisible';
			this.morpherWalletContainer.style.top = '-999px';
			this.morpherWalletContainer.style.left = '-999px';
			this.morpherWalletContainer.appendChild(this.morpherWalletIframe);
			document.body.appendChild(this.morpherWalletContainer);
			document.head.appendChild(style);
	
		}

    const communicationPromise = new Promise(resolve => {
      this.morpherWalletIframe.onload = () => {
          if (this.morpherWalletIframe?.contentWindow) {
              const messenger = new WindowMessenger({
                  remoteWindow: this.morpherWalletIframe.contentWindow,
                  allowedOrigins: [new URL(this.morpherWalletIframe.src).origin]
              });

              const connection = connect({
                  messenger: messenger,
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
                    hideWallet: this.hideWallet.bind(this),
                    openSendInApp: this._onSend.bind(this),
                    showWallet: this.showWallet.bind(this)
                  },
              });
              resolve(connection.promise);
          } else {
              resolve(undefined);
          }
      };
    });

    this.morpherWalletIframe.src = this.WIDGET_URL;

    let communication = await communicationPromise;
    
    // communication.retrieveSession();

    this.isConnecting = false;

    return { communication: (communication as any), iframe: this.morpherWalletIframe };
  }
  setConfig(config: MorpherWalletConfig) {
      this.config = config;
  }
  getProvider () {
    return this
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
    this._onSendCallback = callback;
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

    if (!this.morpherWalletContainer) {
      this.morpherWalletContainer = (document.getElementById('morpher_wallet_sdk_container') as HTMLDivElement);
    }

    
    if (!this.morpherWalletContainer) {
      console.log('Cannnot show wallet - No wallet container was found')
      return
    }

    if (!this.morpherWalletIframe) {
      this.morpherWalletIframe = (document.getElementById('morpher_wallet_sdk_iframe') as HTMLIFrameElement);
    }

    if (!this.morpherWalletContainer) {
      console.log('Cannnot show wallet - No wallet frame was found')
      return
    }
		
    let closeButtonHtml = document.getElementById('morpher_WalletCloseButton')
    
    
    if (closeButtonHtml) {
      closeButtonHtml.className = 'close-button'
      closeButtonHtml.addEventListener("click", this.hideWallet);
    }

    this.morpherWalletContainer.addEventListener("click", this.hideWallet);
    this.morpherWalletContainer.style.height = '100%';
    this.morpherWalletContainer.style.width = '100%';
    this.morpherWalletContainer.style.top = '0';
    this.morpherWalletContainer.style.left = '0';
    this.morpherWalletContainer.style.display = 'inline';
    this.morpherWalletContainer.style.visibility = 'visible';
    this.morpherWalletIframe.style.width = '';
    this.morpherWalletIframe.style.height = '';
    
    if (this.config && this.config.env === 'dev') {
      this.morpherWalletIframe.style.border = '3px solid #00d492';
    }
	}

	async hideWallet() {
    if (!this.morpherWalletContainer) {
      this.morpherWalletContainer = (document.getElementById('morpher_wallet_sdk_container') as HTMLDivElement);
    }
    
    if (!this.morpherWalletContainer) {
      console.log('Cannnot hide wallet - No wallet container was found')
      return
    }

    if (!this.morpherWalletIframe) {
      this.morpherWalletIframe = (document.getElementById('morpher_wallet_sdk_iframe') as HTMLIFrameElement);
    }

    if (!this.morpherWalletContainer) {
      console.log('Cannnot hide wallet - No wallet frame was found')
      return
    }
    

    let closeButtonHtml = document.getElementById('morpher_WalletCloseButton')
    
    
    if (closeButtonHtml) {
      closeButtonHtml.className = 'hidden'
    }

    this.morpherWalletContainer.style.width = '0';
    this.morpherWalletContainer.style.height = '0';
    this.morpherWalletContainer.style.display = 'block';
    this.morpherWalletContainer.style.visibility = 'invisible';
    this.morpherWalletContainer.style.top = '-999px';
    this.morpherWalletContainer.style.left = '-999px';
    this.morpherWalletIframe.style.width = '0';
    this.morpherWalletIframe.style.height = '0';
    this.morpherWalletIframe.style.border = 'none';
	}

  async isLoggedIn() {

		await this.iframeLoaded();

		const widget = await this.widget;

		const widgetCommunication = (await this.widget).communication;
    const loggedIn = await widgetCommunication.isLoggedIn();
    
    
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
      let frame:any = document.getElementById('morpher_wallet_sdk_iframe');
      try {
          if (frame && frame.contentWindow && !frame.contentDocument) {
              return resolve(true);
          }
      } catch (err) {
          
      }
      const int = setInterval(() => {
          try {
              frame = document.getElementById('morpher_wallet_sdk_iframe');
              if (frame && frame.contentWindow && !frame.contentDocument) {
                  clearInterval(int);
                  return resolve(true);
              }
          } catch (err) {
              
          }
      }, 100);
    });
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

  _onSend() {
    this.hideWallet()
    if (this._onSendCallback) {
      this._onSendCallback();
    }
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
  request(request: {
    method: string;
    params?: Array<any>;
}) {
    return this.send(request.method, request.params || []);
  }
  async send(method: string, params?: any[]) {
    //console.log('send', {method, params})
    function throwUnsupported(message: string) {
      const erroInfo = {
        operation: method
      };
      return makeError(
        message,
        "UNSUPPORTED_OPERATION",
        erroInfo
      );
    }
    __name(throwUnsupported, "throwUnsupported");
    let coerce = /* @__PURE__ */ __name((value: any) => value, "coerce");
    switch (method) {
      case "eth_gasPrice": {
          const result = (await this.public_client.getGasPrice());
          return result ? result.toString() : null;
      }
      case "eth_accounts": {
          let result = [];
          let loggedIn = await this.isLoggedIn();
          if (loggedIn.isLoggedIn) {
              const widgetCommunication = (await this.widget).communication;
              result = await widgetCommunication.getAccounts();
          }
          return result;
      }
      case "eth_blockNumber": {
          let block = await this.public_client.getBlockNumber();
          return block.toString();
      }
      case "eth_chainId": {
          let chainId = await this.public_client.getChainId();
          return chainId;
      }
      case "eth_getBalance": {
          if (!params) {
              return 0;
          }
          let balance = await this.public_client.getBalance({ address: params[0], blockTag: params[1] || undefined });
          return balance.toString();
      }
      case "eth_getStorageAt": {
          if (!params) {
              return '';
          }
          let address = params[0];
          let storage = await this.public_client.getStorageAt({ address, slot: params[1], blockNumber: params[2] });
          return storage;
      }
      case "eth_getTransactionCount": {
          if (!params) {
              return 0;
          }
          const result = await this.public_client.getTransactionCount({
              address: params[0],
              blockNumber: params[1]
          });
          return result;
      }
      case "eth_getBlockTransactionCountByHash":
      case "eth_getBlockTransactionCountByNumber": {
          if (!params) {
              return 0;
          }
          let param;
          if (params[0] && params[0].toString().includes('0x')) {
              param = { blockHash: params[0] };
          }
          else {
              param = { blockNumber: params[0] };
          }
          const result = await this.public_client.getBlock(param);
          return result && result.transactions ? result.transactions.length : result;
      }
      case "eth_getCode": {
          if (!params) {
              return 0;
          }
          const result = await this.public_client.getCode({
              address: params[0],
              blockNumber: params[1]
          });
          return result;
      }
      case "eth_sendRawTransaction": {
          let loggedIn = await this.isLoggedIn();
          if (!params || !loggedIn.isLoggedIn) {
              return 0;
          }
          const result = await this.public_client.sendRawTransaction({ serializedTransaction: params[0] });
          return result;
      }
      case "eth_call": {
          if (!params) {
              return 0;
          }
          let call_prams = {
              account: params[0].from,
              to: params[0].to,
              value: params[0].value,
              data: params[0].data,
          };
          const result = await this.public_client.call(call_prams);
          return result.data;
      }
      case "estimateGas": {
          if (!params) {
              return 0;
          }
          if (params[1] && params[1] !== "latest") {
              throwUnsupported("estimateGas does not support blockTag");
          }
          const result = await this.public_client.estimateGas({ account: params[0] });
          return result.toString();
      }
      case "eth_getBlockByHash":
      case "eth_getBlockByNumber": {
          if (!params) {
              return 0;
          }
          let param;
          if (params[0] && params[0].toString().includes('0x')) {
              param = { blockHash: params[0] };
          }
          else {
              if (isNaN(Number(params[0]))) {
                  param = { blockTag: params[0] };
              }
              else {
                  param = { blockNumber: BigInt(params[0]) };
              }
          }
          const result = await this.public_client.getBlock(param);
          return JSON.parse(stringify(result));
      }
      case "eth_getTransactionByHash": {
          if (!params) {
              return 0;
          }
          const result = await this.public_client.getTransaction({ hash: params[0] });
          return JSON.parse(stringify(result));
      }
      case "eth_getTransactionReceipt": {
          if (!params) {
              return 0;
          }
          const result = await this.public_client.waitForTransactionReceipt({ hash: params[0] });
          const result_formatted = JSON.parse(stringify(result));
          result_formatted.transactionIndex = (result_formatted.transactionIndex).toString();
          if (result_formatted.status === "success") {
              result_formatted.status = true;
          }
          else if (result_formatted.status !== false && result_formatted.status !== true) {
              result_formatted.status = false;
          }
          result_formatted.status = 'success';
          return result_formatted;
      }
      case "eth_signTypedData_v3":
      case "eth_signTypedData_v4": {
          if (!params) {
              return throwUnsupported("eth_signTypedData requires an account");
          }
          let loggedIn = await this.isLoggedIn()
          if (!loggedIn.isLoggedIn) {
             return throwUnsupported("cannot sign when not logged in");
           }

         
          const widgetCommunication = (await this.widget).communication;
            let sign_params: any = {}

            if (params.length == 2) {
              sign_params.account = params[0]
              sign_params.data = params[1]
              sign_params.messageStandard = 'signTypedMessage'
            } else {
              sign_params= Object.assign({}, params, { messageStandard: 'signTypedMessage' });
            }
    
            let cfg = {
              confirm_message: this.config?.confirm_message,
              show_message: this.config?.show_message,
            }
            const  result  = await widgetCommunication.signMessage(sign_params, cfg);
            

           return result; 
      }
      case "personal_sign":
      case "eth_sign": {
          if (!params) {
              return throwUnsupported("eth_sign requires an account");
          }
          let loggedIn = await this.isLoggedIn();
          if (!loggedIn.isLoggedIn) {
              return throwUnsupported("cannot sign when not logged in");
          }
          const widgetCommunication = (await this.widget).communication;
          const sign_params = Object.assign({}, params, { messageStandard: 'signMessage' });

          let cfg = {
              confirm_message: this.config?.confirm_message,
              show_message: this.config?.show_message,
          };
          const result = await widgetCommunication.signMessage(sign_params, cfg);

          return result;
      }
      case "wallet_sendTransaction":
      case "eth_sendTransaction": {
          if (method === 'wallet_sendTransaction') {
            console.log('wallet_sendTransaction params:', params)
          }
          if (!params) {
              return throwUnsupported("eth_sendTransaction requires an account");
          }
          let loggedIn = await this.isLoggedIn();
          if (!loggedIn.isLoggedIn) {
              return throwUnsupported("cannot send a transaction when not logged in");
          }
          
          const widgetCommunication = (await this.widget).communication;
          let txParams = params[0];
          txParams.chainId = this.chainId;
          if (txParams.maxFeePerGas !== undefined && txParams.maxPriorityFeePerGas !== undefined && txParams.gasPrice !== undefined)
              delete txParams.gasPrice;
          if (txParams.maxFeePerGas !== undefined && txParams.maxPriorityFeePerGas !== undefined && txParams.chainId && Number(txParams['chainId']) !== 21 && Number(txParams['chainId']) !== 210 && Number(txParams['chainId']) !== 2100) {
              txParams.chain = 'mainnet';
              txParams.hardfork = 'london';
          }

          let cfg = {
              confirm_transaction: this.config?.confirm_transaction
          };
          if (!txParams.gas && !txParams.gasLimit) {
              // const txObj =  JSON.parse(JSON.stringify(txParams))
              // if (txObj.gas && String(txObj.gas).includes('0x')) {
              //   txObj.gas = fromHex(txObj.gas, "bigint")
              // }
              // // if (!txObj.gas) {
              // //   txObj.gas = BigInt(21000)
              // // }
              // if (txObj.value && String(txObj.value).includes('0x')) {
              //   txObj.value = fromHex(txObj.value, "bigint")
              // }
              // if (txObj.maxFeePerGas && String(txObj.maxFeePerGas).includes('0x')) {
              //   txObj.maxFeePerGas = fromHex(txObj.maxFeePerGas, "bigint")
              // }
              // if (txObj.maxPriorityFeePerGas && String(txObj.maxPriorityFeePerGas).includes('0x')) {
              //   txObj.maxPriorityFeePerGas = fromHex(txObj.maxPriorityFeePerGas, "bigint")
              // }
              // txObj.gas = BigInt(1)
              let gasTx = {
                  account: txParams.from || txParams.account,
                  to: txParams.to,
                  value: txParams.value,
                  data: txParams.data
              };
              let gas = await this.public_client.estimateGas(gasTx);
              txParams.gas = toHex(gas);
          }
          if (!txParams.nonce) {
              let nonce = await this.public_client.getTransactionCount({
                  address: txParams.from
              });
              txParams.nonce = nonce;
          }
          if (!txParams.gasPrice && !txParams.maxFeePerGas) {
              const { maxFeePerGas, maxPriorityFeePerGas } = await this.public_client.estimateFeesPerGas();
              txParams.maxFeePerGas = toHex(maxFeePerGas);
              txParams.maxPriorityFeePerGas = toHex(maxPriorityFeePerGas);
          }
          const result = await widgetCommunication.signTransaction(txParams, cfg, this.rpcURL);
          if (!result) {
              return throwUnsupported("Error signing transaction with wallet");
          }

          let tx_hash = await this.public_client.sendRawTransaction({
              serializedTransaction: result
          });
          return tx_hash;
          // return tx.hash;
      }
      case "eth_getUncleCountByBlockHash":
      case "eth_getUncleCountByBlockNumber": {
          this.public_client.simulateContract;
          coerce = 0;
          break;
      }
  }
    // if (this.send) {
    
    //   const result: any = await this.send(method, params || []);
    //   return coerce(result);
    // }
    return throwUnsupported(`unsupported method: ${method}`);
  }

};

export default MorpherWalletProvider;
