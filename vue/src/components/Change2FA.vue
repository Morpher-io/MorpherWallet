<template>
    <div>
        <form v-on:submit.prevent="formSubmitChange2FA">
            <input type="checkbox" id="email" class="option" v-model="email">
            <label class="boxLabel" for="email">Email</label>
            <span></span>
            <input type="checkbox"  id="authenticator" class="option" v-model="authenticator">
            <label class="boxLabel" for="authenticator">Authenticator</label>
            <input type="submit" style="margin: 10px" value="Submit" />
        </form>

        <img v-if="this.authenticator && (this.qrCode !== '' || this.qrCode !== undefined)" style="height: 400px; margin: 10px" v-bind:src="this.qrCode" />


        <input v-if="this.authenticator" type="submit" style="margin: 10px; display: block" value="Generate QR Code" v-on:click="generateQR" />

        <input v-if="this.authenticator && !this.authenticatorConfirmed" type="text" style="margin: 10px"  placeholder="Authenticator Code" class="textbox" v-model="authenticatorCode">

        <input v-if="this.authenticator && !this.authenticatorConfirmed" style="margin: 10px; display: block"  type="submit" value="Confirm Authenticator" v-on:click="confirmAuthenticator" />
    </div>
</template>


<script>
    import { getPayload, change2FAMethods, getQRCode, generateQRCode, verifyAuthenticatorCode, getKeystoreFromEncryptedSeed } from "../utils/backupRestore";

    import Lightwallet from 'eth-lightwallet'
    const { sha256 } = require("../utils/cryptoFunctions");

    export default {
        name: "change2FA",
        data: function(){
            return {
                email: false,
                authenticator: false,
                authenticatorConfirmed: false,
                authenticatorCode: '',
                qrCode: ''
            }
        },
        props: [''],
        methods: {
            async formSubmitChange2FA (e) {
                e.preventDefault();

                try{
                    if(!this.email && this.authenticator && !this.authenticatorConfirmed){
                        alert('Please confirm Authenticator first.')
                    }
                    else {
                        let password = window.sessionStorage.getItem("password");
                        let encryptedSeed = window.localStorage.getItem("encryptedSeed");
                        let keystore = await getKeystoreFromEncryptedSeed(JSON.parse(encryptedSeed), password);
                        const self = this;
                        keystore.keyFromPassword(password, async function (err, pwDerivedKey) {
                            let signedMessage = Lightwallet.signing.signMsg(keystore, pwDerivedKey, "authentication", keystore.addresses[0])
                            await change2FAMethods(signedMessage, self.email, self.authenticator);
                        })
                        alert('2FA methods changed successfully.')
                    }
                }
                catch(e){
                    alert("Email is not right.")
                }
            },

            async confirmAuthenticator(){
                let email = localStorage.getItem("email");

                this.authenticatorConfirmed = (await verifyAuthenticatorCode(email, this.authenticatorCode)).verified;

                if(this.authenticatorConfirmed){
                    alert('Authenticator confirmed.')
                }
                else {
                    alert('Authenticator code is not right.')
                }
            },

            async generateQR(){
                let email = localStorage.getItem("email");
                this.authenticatorConfirmed = false;
                this.authenticatorCode = '';

                const qrCode = await generateQRCode(email);
                this.qrCode = qrCode.image;
            }
        },
        async mounted(){
            let email = localStorage.getItem("email");

            try{
                const twoFAMethods = await getPayload(email);

                const qrCode = await getQRCode(email);
                this.qrCode = qrCode.image;

                if(twoFAMethods.email !== undefined) this.email = twoFAMethods.email
                if(twoFAMethods.authenticator !== undefined) this.authenticator = twoFAMethods.authenticator
                if(twoFAMethods.authenticatorConfirmed !== undefined) this.authenticatorConfirmed = twoFAMethods.authenticatorConfirmed
            }
            catch(e){
                alert("Email is not right.")
            }

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.option, .boxLabel{
    margin:10px;
}
</style>
