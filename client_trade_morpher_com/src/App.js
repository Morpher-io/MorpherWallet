/**
 * Sample app using the wallet-sdk
 */
import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ZeroWallet from "zerowallet-sdk";
import "./App.css";
//import { connectToChild } from 'penpal';

class App extends Component {
  //connection;

  state = {
    walletEmail: "",
    walletPassword: "",
    walletAddress: "",
    isAuthenticated: false,
    user: null,
    token: "",
    web3: null,
    accounts: null,
    hasWallet: false,
    hasWalletRecovery: false,
    loginFailure: false,
    showWallet: false
  };

  async componentDidMount() {

    this.zeroWallet = new ZeroWallet("ws://127.0.0.1:7545");
    //let web3 = await this.zeroWallet.getProvider();

    let res = await this.zeroWallet.isLoggedIn();
    if (res.isLoggedIn === true) {
      this.setState({ walletEmail: res.walletEmail });
      let web3 = await getWeb3();
      let accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ isAuthenticated: true, web3 });
    }

    this.zeroWallet.onLogin(async (walletAddress, walletEmail) => {
      this.setState({ walletEmail: walletEmail });
      this.setState({ walletAddress: walletAddress });
      let web3 = await getWeb3();

      let accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ isAuthenticated: true, web3 });
      document.getElementsByClassName("zerowallet-iframe")[0].style.display = "none"

    });

    this.zeroWallet.onLogout(() => {
      this.setState({ walletEmail: "" });
      this.setState({ walletAddress: "" });
      this.setState({ isAuthenticated: false });
    });
  }

  startWeb3Init = async (user_id, app_id) => {
    try {
      const web3 = await getWeb3(false, user_id + "" + app_id);
      const accounts = await web3.eth.getAccounts();
      this.setState({ web3, accounts });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  sendEth = async () => {
    let amount = 1;
    let to = "0x687b9F4D948D5151b3F28e747773063b1f0a4a6F";
    const { web3, walletAddress } = this.state;
    let result = await web3.eth.sendTransaction({
      from: walletAddress,
      to,
      value: amount * 1000000000000000000,
    });
    console.log(result);
  };

  toggleWallet = async() => {
    if(this.state.showWallet) {
      document.getElementsByClassName("zerowallet-iframe")[0].style.display = "none"
      this.setState({ showWallet: false });

    } else {
      document.getElementsByClassName("zerowallet-iframe")[0].style.display = ""
      this.setState({ showWallet: true });

    }

  }

  logout = () => {
    localStorage.clear();
    //this.setState({ isAuthenticated: false, token: "", user: null, web3: null, hasWallet:false });
    window.location.reload();
  };

  onFailure = (error) => {
    alert(error);
  };


  render() {
    let content = this.state.isAuthenticated ? (
      <div>
        <h2>Hi {this.state.walletEmail}</h2>{" "}
        <div>
          <button onClick={this.sendEth}>Send eth</button>
          <button onClick={this.toggleWallet}>Wallet</button>
        </div>
      </div>
    ) : (
      <div>Not logged in!</div>
    );
    return (
      <div className="App">
        <h1>Welcome to the trade engine!</h1>
        <br />
        {content}
      </div>
    );
  }
}

export default App;
