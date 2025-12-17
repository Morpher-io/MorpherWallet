<script setup lang="ts">
import { onMounted, ref } from "vue";
import MorpherWallet from "morpherwallet-sdk";
//import Web3 from 'web3';
import { morpherOracleAbi, morpherTokenAbi } from "./contracts/abis";

import {
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  type Account,
  type Address,
  type PublicClient,
  type WalletClient,
} from "viem";
import { getChain, soliditySha3 } from "./helpers";

const eth_address = ref("");
const morpherWallet = ref(undefined as MorpherWallet | undefined);
const isAuthenticated = ref(false);
const walletEmail = ref("");

const showWallet = ref(false);
const balance = ref("0");
const numberOfEther = ref(0.02);
const targetAddress = ref("0x1E030F5077Af470041D744B7B17bCf610C7a0ECd");
const oracleAddress = "0x2BD68DA45015aded895C03153edB203746EF2A8E";
const tokenAddress = "0xa1bbaE686eCdE4F61DaF1f40bf4FB81F4BC60f40";
const chain = getChain(210, "wss://sidechain-test-ws.morpher.com:8546");
onMounted(async () => {
  eth_address.value = "";

  morpherWallet.value = new MorpherWallet(
    "wss://sidechain-test-ws.morpher.com:8546",
    210,
    {
      show_transaction: false,
      confirm_transaction: false,
      show_message: false,
      confirm_message: false,
      env: "local",
    },
  );

  morpherWallet.value.onLogin(
    async (wallet_eth_address: string, wallet_email: string) => {
      walletEmail.value = wallet_email;
      eth_address.value = wallet_eth_address;

      //let web3 = await getWeb3();
      //let web3 = new Web3(await morpherWallet.value?.getProvider());

      isAuthenticated.value = true;
      //web3Ref.value = web3
      //let accounts = await web3.eth.getAccounts();
      //let balanceUpdate = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), "ether");
      //balance.value = balanceUpdate
      if (morpherWallet.value) {
        await morpherWallet.value.hideWallet();
        let provider = morpherWallet.value.getProvider();

        let wallet_client = createWalletClient({
          chain: chain,
          account: wallet_eth_address as `0x${string}`,
          transport: custom(provider),
        });

        let public_client = createPublicClient({
          chain: chain,
          transport: custom(provider),
          cacheTime: 10_000,
        });
        isAuthenticated.value = true;

        let accounts = await wallet_client.getAddresses();

        eth_address.value = accounts[0];

        let balanceFetch = await public_client.getBalance({
          address: accounts[0],
        });
        balance.value = String(Number(balanceFetch) / 10 ** 18);
        //showWallet.value = false
      }
    },
  );

  morpherWallet.value.onLogout(() => {
    walletEmail.value = "";
    eth_address.value = "";
    isAuthenticated.value = false;
  });

  let res = await morpherWallet.value.isLoggedIn();

  if (res.isLoggedIn === true) {
    walletEmail.value = res.walletEmail;
    let provider = morpherWallet.value.getProvider();

    isAuthenticated.value = true;
    let wallet_client = createWalletClient({
      chain: chain,
      transport: custom(provider),
      account: res.accounts[0] as `0x${string}`,
    });

    let public_client = createPublicClient({
      chain: chain,
      transport: custom(provider),
      cacheTime: 10_000,
    });

    isAuthenticated.value = true;


    let accounts = await wallet_client.getAddresses();

    eth_address.value = accounts[0];
    walletEmail.value = res.walletEmail;
    eth_address.value = accounts[0];

    let balanceFetch = await public_client.getBalance({ address: accounts[0] });
    balance.value = String(Number(balanceFetch) / 10 ** 18);
    showWallet.value = false;
  } else {
    showWallet.value = false;
  }

  // let provider = morpherWallet.value.getProvider()
  // let web3 = new Web3(provider);
  // let sign = web3.eth.personal.sign('Wallet Migration', accounts[0], '')

  // console.log('sign', sign)
});

const toggleWallet = async () => {
  if (showWallet.value && morpherWallet.value) {
    await morpherWallet.value.hideWallet();
    showWallet.value = false;
  } else {
    if (morpherWallet.value) {
      await morpherWallet.value.showWallet();
      showWallet.value = false;
    }
  }
};

const testTrade = async (e: any) => {
  e.preventDefault();

  if (!morpherWallet.value) {
    return
  }
  let provider = morpherWallet.value.getProvider();

  let wallet_client = createWalletClient({
    chain: chain,
    account: eth_address.value as `0x${string}`,
    transport: custom(provider),
  });

  let public_client = createPublicClient({
    chain: chain,
    transport: custom(provider),
    cacheTime: 10_000,
  });

  const contractInstance = getContract({
    address: oracleAddress,
    abi: morpherOracleAbi,

    client: {
      
      public: public_client ,
      wallet: wallet_client ,
    },
  });

  const tokenInstance = getContract({
    address: tokenAddress,
    abi: morpherTokenAbi,

    client: {
      public: public_client,
      wallet: wallet_client,
    },
  });

  const decimals = await tokenInstance.read.decimals();
  const name = await tokenInstance.read.name();
  const token_balance: any = await tokenInstance.read.balanceOf([
    eth_address.value as `0x${string}`,
  ]);

  if (token_balance > BigInt(1 * 10 ** 18)) {
    const open_mph_token_amount = BigInt(1 * 10 ** 18);
    const close_shares_amount = BigInt(0);
    const direction: boolean = true;
    const leverage = BigInt(2 * 10 ** 8);
    const priceAbove = BigInt(0);
    const priceBelow = BigInt(0);
    const good_until = BigInt(0);
    const good_from = BigInt(0);
    const market = soliditySha3("CRYPTO_DASH");

    const tx_hash = await (contractInstance.write as any).createOrder([
      market,
      close_shares_amount,
      open_mph_token_amount,
      direction,
      leverage,
      priceAbove,
      priceBelow,
      good_until,
      good_from,
    ]);

    let result = await public_client.waitForTransactionReceipt({
      hash: tx_hash,
    });

    if (result.status === "success" || result.transactionHash) {
      alert("Trade was successful");
      let accounts = await wallet_client.getAddresses();
      let balanceFetch = await public_client.getBalance({
        address: accounts[0],
      });
      balance.value = String(Number(balanceFetch) / 10 ** 18);
    }
  }
};

const sendEther = async (e: any) => {
  if (!morpherWallet.value) {
    return
  }  
    let provider = morpherWallet.value.getProvider();

  let wallet_client = createWalletClient({
    chain: chain,
    account: eth_address.value as `0x${string}`,
    transport: custom(provider),
  });

  let public_client = createPublicClient({
    chain: chain,
    transport: custom(provider),
    cacheTime: 10_000,
  });

  const signature_1 = await wallet_client.signMessage({
    message: "hello world",
  });

  console.log("signature_1", signature_1);

  e.preventDefault();
  let amount = numberOfEther.value;
  let to = targetAddress.value as Address;
  
  const walletAddress = eth_address.value;

  let tx_hash = await wallet_client.sendTransaction({
    to,
    value: BigInt(amount * 10 ** 18),
  });

  let result = await public_client.waitForTransactionReceipt({
    hash: tx_hash,
  });

  if (result.status === "success" || result.transactionHash) {
    alert("Sent was successful");
    let accounts = await wallet_client.getAddresses();

    let balanceFetch = await public_client.getBalance({
      address: accounts[0],
    });
    balance.value = String(Number(balanceFetch) / 10 ** 18);
  }
};
</script>

<template>
  <header>
    <img
      alt="Vue logo"
      class="logo"
      src="./assets/morpher_logo.svg"
      width="125"
      height="125"
    />

    <div v-if="isAuthenticated" class="wrapper">
      <h2>Hi {{ walletEmail }}</h2>

      <div>
        <p><strong>Your eth_address is:</strong> {{ eth_address }}</p>
        <p><strong>Your Balance is:</strong> {{ balance }} ether</p>

        <form @submit.prevent="sendEther" class="send-ether-form">
          <h3>Send some Ether</h3>
          <div class="form-group">
            <label for="targetAddress">Target Address:</label>
            <input
              id="targetAddress"
              type="text"
              name="targetAddress"
              placeholder="0x123"
              v-model="targetAddress"
            />
          </div>
          <div class="form-group">
            <label for="numberOfEther">Ether:</label>
            <input
              id="numberOfEther"
              type="text"
              name="numberOfEther"
              placeholder="1"
              v-model="numberOfEther"
              className="Input"
            />
          </div>
          <button type="submit">Send Now</button>
        </form>

        <div class="actions">
          <button @click="testTrade">Test Trade</button>
          <button @click="toggleWallet">Show/Hide Wallet</button>
        </div>
      </div>
    </div>
    <div v-else class="wrapper">
      <div>Not logged in!</div>
      <div>
        <button @click="toggleWallet">Show/Hide Wallet</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.send-ether-form {
  margin-top: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
}

.actions {
  margin-top: 2rem;
}

.actions button {
  margin-right: 1rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
