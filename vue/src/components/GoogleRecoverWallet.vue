<template>
    <div>
        <div>
            <GoogleLogin :params="{client_id: '376509986959-k6tstmq30f4spbp9vd1u94tvt8dg714b.apps.googleusercontent.com'}" :onSuccess="onLogin">Recover with Google</GoogleLogin>
        </div>
    </div>
</template>


<script>
    const { sha256 } = require("../utils/cryptoFunctions");
    const {
        recoverGoogleSeed,
        changePasswordEncryptedSeed,
        saveWalletEmailPassword
    } = require("../utils/backupRestore");
    import GoogleLogin from 'vue-google-login';


    export default {
        name: 'GoogleRecoverWallet',
        components: {
            GoogleLogin
        },
        data: function(){
            return {
                isLogined: false
            }
        },
        props: {
            walletEmail: ""
        },
        methods: {
            async onLogin(data){
                try {
                    let userID = data.Da
                    let accessToken = data.wc.access_token
                    let encryptedSeedFacebook = await recoverGoogleSeed(
                        accessToken,
                        this.walletEmail
                    );
                    var newPasswordForLocalStorage = prompt(
                        "Enter a new password for you local vault",
                        "Super Strong Pass0wrd!"
                    );
                    //double hashing the password
                    newPasswordForLocalStorage = await sha256(newPasswordForLocalStorage);
                    let encryptedSeedPassword = await changePasswordEncryptedSeed(
                        encryptedSeedFacebook,
                        userID,
                        newPasswordForLocalStorage
                    );
                    saveWalletEmailPassword(this.walletEmail, encryptedSeedPassword);
                    window.localStorage.setItem("encryptedSeed", JSON.stringify(encryptedSeedPassword));
                    window.sessionStorage.setItem("password", newPasswordForLocalStorage);
                } catch (e) {
                    alert(
                        "Your account wasn't found with Google recovery, create one with username and password first"
                    );
                }
            }
        },
        mounted(){

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
