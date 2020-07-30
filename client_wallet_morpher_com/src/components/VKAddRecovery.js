import React, { Component } from "react";
const {
    backupVKSeed,
    changePasswordEncryptedSeed,
} = require("./../morpher/backupRestore");

/**
 * This is used to add google as social recovery method
 */
class VKAddRecovery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLogined: false,
            loginButtonText: props.loginButtonText || "Add VK Recovery",
            logoutButtonText: props.loginButtonText || "Remove VK Recovery",
            walletEmail: props.walletEmail
        };

        this.vk_popup = this.vk_popup.bind(this);
        this.doLogin = this.doLogin.bind(this);
    }

   vk_popup(options){
        var
            screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
            screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
            outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
            outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
            width = options.width,
            height = options.height,
            left = parseInt(screenX + ((outerWidth - width) / 2), 10),
            top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
            features = (
                'width=' + width +
                ',height=' + height +
                ',left=' + left +
                ',top=' + top
            );
        return window.open(options.url, 'vk_oauth', features);
    }

    doLogin() {
        var win;
        var redirect_uri = 'http://localhost:3001';
        var uri_regex = new RegExp(redirect_uri);
        var url = 'http://oauth.vk.com/authorize?client_id=7548057&display=popup&v=5.120&response_type=token&scope=offline&redirect_uri=' + redirect_uri;
        win = this.vk_popup({
            width:620,
            height:370,
            url:url
        });
        var self = this
        var watch_timer = setInterval(async function () {
            try {
                if (uri_regex.test(win.location)) {
                    clearInterval(watch_timer);
                    var hash = win.location.hash.substr(1);
                    var params = hash.split('&').reduce(function (result, item) {
                        var parts = item.split('=');
                        result[parts[0]] = parts[1];
                        return result;
                    }, {});
                    //console.log(params)
                    //console.log("Access token: " + params.access_token)
                    //console.log("UserID: " + params.user_id)

                    setTimeout(function () {
                        win.close();
                        //document.location.reload();
                    }, 500);

                    let encryptedSeedFromPassword =
                        localStorage.getItem("encryptedSeed") || "";

                    if (encryptedSeedFromPassword === "") {
                        throw new Error("Keystore not found, aborting");
                    }


                    let encryptedSeedFromVKID = await changePasswordEncryptedSeed(
                        JSON.parse(encryptedSeedFromPassword),
                        window.sessionStorage.getItem("password"),
                        params.user_id
                    );
                    try {
                        await backupVKSeed(
                            self.state.walletEmail,
                            params.user_id,
                            encryptedSeedFromVKID
                        );
                        self.setState({ isLogined: true });
                    } catch {
                        self.setState({ isLogined: false });
                    }
                }
            } catch (e) {
                win.close()
                console.log(e)
            }
        }, 100);
    }


    render() {
        return (
            <div>
            <button onClick={this.doLogin}>{this.state.loginButtonText}</button>
            </div>
    );
    }
}

export default VKAddRecovery;
