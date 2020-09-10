<template>
    <div style="margin-top:10px">
        <input
                type="password"
                name="password"
                placeholder="Enter old password"
                v-model="password"
        />
        <button @click="exportSeedPhrase">
            Export Seed Phrase
        </button>
        <button @click="exportPrivateKey">
            Export Private Key
        </button>
        <div v-if="seedPhrase">
            <h3>Seed Phrase:</h3>
            <h4>{{seedPhrase}}</h4>
        </div>
    </div>
</template>


<script>
    const { sha256, cryptoDecrypt } = require("../utils/cryptoFunctions");

    export default {
        name: "ExportWallet",
        data: function(){
            return {
                password: "",
                seedPhrase: ""
            }
        },
        methods: {
            async exportSeedPhrase () {
                let storedPassword = window.sessionStorage.getItem("password")
                let password = await sha256(this.password);
                if(storedPassword === password) {
                    let encryptedSeed = JSON.parse(localStorage.getItem("encryptedSeed"))
                    console.log(encryptedSeed)
                    this.seedPhrase = await cryptoDecrypt(password, encryptedSeed.ciphertext, encryptedSeed.iv, encryptedSeed.salt)
                    this.password = "";
                }

                else alert('Password is not right!')

            },
            exportPrivateKey(){

            }
        },
        mounted(){

        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
