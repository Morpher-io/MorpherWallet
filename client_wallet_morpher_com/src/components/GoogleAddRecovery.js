import React, { Component } from "react";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import config from "./../config.json";
const {
  backupGoogleSeed,
  changePasswordEncryptedSeed,
} = require("./../morpher/backupRestore");

/**
 * This is used to add google as social recovery method
 */
class GoogleAddRecovery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogined: false,
      loginButtonText: props.loginButtonText || "Add Google Recovery",
      logoutButtonText: props.loginButtonText || "Remove Google Recovery",
      walletEmail: props.walletEmail
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);
  }

  async login(response) {
    if (response.accessToken) {

      let encryptedSeedFromPassword =
        localStorage.getItem("encryptedSeed") || "";

      if (encryptedSeedFromPassword === "") {
        throw new Error("Keystore not found, aborting");
      }


      let encryptedSeedFromGoogleID = await changePasswordEncryptedSeed(
        JSON.parse(encryptedSeedFromPassword),
        window.sessionStorage.getItem("password"),
        response.profileObj.googleId
      );
      try {
        await backupGoogleSeed(
          this.state.walletEmail,
          response.profileObj.googleId,
          encryptedSeedFromGoogleID
        );
        this.setState({ isLogined: true });
      } catch {
        this.setState({ isLogined: false });
      }
    }
  }

  logout(response) {
    this.setState((state) => ({
      isLogined: false,
      accessToken: "",
    }));
  }

  handleLoginFailure(response) {
    alert("Failed to log in");
    console.error(response);
  }

  handleLogoutFailure(response) {
    alert("Failed to log out");
  }

  render() {
    return (
      <div>
          <GoogleLogin
            clientId={config.GOOGLE_APP_ID}
            buttonText={this.state.loginButtonText}
            onSuccess={this.login}
            onFailure={this.handleLoginFailure}
            cookiePolicy={"single_host_origin"}
            responseType="code,token"
          />
      </div>
    );
  }
}

export default GoogleAddRecovery;
