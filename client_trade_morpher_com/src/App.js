/**
 * Sample app using the wallet-sdk
 */
import React, { Component } from "react";
import getWeb3 from "./getWeb3";
import ZeroWallet from 'zerowallet-sdk';
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
  };

  async componentDidMount() {
    this.zeroWallet = new ZeroWallet("ws://127.0.0.1:7545");
    //let web3 = await this.zeroWallet.getProvider();

    let res = await this.zeroWallet.isLoggedIn()
    if(res.isLoggedIn == true) {
      this.setState({walletEmail: res.walletEmail})
      this.setState({isAuthenticated: true})
    }

    this.zeroWallet.onLogin((walletAddress, walletEmail)=>{
      this.setState({walletEmail: walletEmail})
      this.setState({walletAddress: walletAddress})
      this.setState({isAuthenticated: true})
    })

    this.zeroWallet.onLogout(()=>{
      this.setState({walletEmail: ""})
      this.setState({walletAddress: ""})
      this.setState({isAuthenticated: false})
    })

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

  sendEth = async() => {
    console.log(this.zeroWallet)
  }

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
    let content = this.state.isAuthenticated ? (<div><h2>Hi {this.state.walletEmail}</h2> <div><button onClick={this.sendEth}>Send eth</button></div></div>) : (<div>Not logged in!</div>);
    return <div className="App"><h1>Welcome to the trade engine!</h1><br />{content}</div>;
  }
}

export default App;
