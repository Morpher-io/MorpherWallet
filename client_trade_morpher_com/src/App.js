/**
 * Sample app using the wallet-sdk
 */
import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ZeroWallet from 'zerowallet-sdk';
import "./App.css";

class App extends Component {
  
  state = {
    walletEmail: "",
    walletPassword: "",
    isAuthenticated: false,
    user: null,
    token: "",
    web3: null,
    accounts: null,
    hasWallet: false,
    hasWalletRecovery: false,
    loginFailure: false,
  };

  async componentDidMount() {
    this.zeroWallet = new ZeroWallet("ws://127.0.0.1:7545");
    let isAuthenticated = await this.zeroWallet.isLoggedIn();
    this.setState({isAuthenticated});
  }

  startWeb3Init = async (user_id, app_id) => {
    try {
      const web3 = await getWeb3(false, user_id + "" + app_id);
      console.log(web3);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      this.setState({ web3, accounts });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  

  logout = () => {
    localStorage.clear();
    //this.setState({ isAuthenticated: false, token: "", user: null, web3: null, hasWallet:false });
    window.location.reload();
  };

  

  onFailure = (error) => {
    alert(error);
  };

  sendEther = async (amount, to) => {
    const { web3, accounts } = this.state;
    let result = await web3.eth.sendTransaction({
      from: accounts[0],
      to,
      value: amount * 1000000000000000000,
    });
    console.log(result);
  };

  

  render() {
    let content = this.state.isAuthenticated ? (<div>Authenticated</div>) : (<div>Not logged in!</div>);
    return <div className="App"><h1>Welcome to the trade engine!</h1><br />{content}</div>;
  }
}

export default App;
