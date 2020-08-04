<template>
        <div>
            <v-facebook-login app-id="299132904630133"  @sdk-init="handleSdkInit" @login="onLogin"  v-model="facebook.model"
            ><span slot="login">ADD FACEBOOK RECOVERY</span>
            </v-facebook-login>
        </div>
</template>


<script>

    const {
        backupFacebookSeed,
        changePasswordEncryptedSeed
    } = require("../utils/backupRestore");
    import VFacebookLogin from 'vue-facebook-login-component'


    export default {
        name: 'FBAddRecovery',
        components: {
            VFacebookLogin
        },
        data: function(){
            return {
                isLogined: false,
                facebook: {
                    FB: {},
                    model: {},
                    scope: {}
                }
            }
        },
        props: {
            walletEmail: ""
        },
        methods: {
            handleSdkInit({ FB, scope }){
                this.facebook.scope = scope
                this.facebook.FB = FB
            },
            async onLogin(data) {
                let userID = data.authResponse.userID
                let encryptedSeedFromPassword = localStorage.getItem("encryptedSeed") || "";
                if (encryptedSeedFromPassword === "") {
                    throw new Error("Keystore not found, aborting");
                }

                let encryptedSeedFromFacebookUserID = await changePasswordEncryptedSeed(
                    JSON.parse(encryptedSeedFromPassword),
                    window.sessionStorage.getItem("password"),
                    userID
                );
                try {
                    await backupFacebookSeed(
                        this.walletEmail,
                        userID,
                        encryptedSeedFromFacebookUserID
                    );
                    this.hasWalletRecovery = true;
                } catch {
                    this.hasWalletRecovery = false;
                }
            },
        },
        mounted(){

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
