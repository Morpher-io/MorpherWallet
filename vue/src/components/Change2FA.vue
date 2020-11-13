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

        <img v-if="this.qrCode !== '' || this.qrCode !== undefined" style="height: 400px" v-bind:src="this.qrCode" />

        <br>

        <input type="submit" style="margin: 10px" value="Generate QR Code" v-on:click="generateQR" />
    </div>
</template>


<script>
    import { getPayload, change2FAMethods, getQRCode, generateQRCode } from "../utils/backupRestore";

    const { sha256 } = require("../utils/cryptoFunctions");

    export default {
        name: "change2FA",
        data: function(){
            return {
                email: false,
                authenticator: false,
                qrCode: ''
            }
        },
        props: [''],
        methods: {
            async formSubmitChange2FA (e) {
                e.preventDefault();

                let email = localStorage.getItem("email");

                try{
                    await change2FAMethods(email, this.email, this.authenticator);
                    alert('2FA methods changed successfully.')
                }
                catch(e){
                    alert("Email is not right.")
                }

            },

            async generateQR(){
                let email = localStorage.getItem("email");

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
