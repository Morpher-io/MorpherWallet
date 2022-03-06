import * as zksync from 'zksync'
import {ethers} from 'ethers';
import { WalletBase } from '@/types/global-types';



const changePubKey = async (syncWallet: zksync.Wallet) => {

    // IMPORTANT: Franck there is a type mismatch here

    let feeToken = "ETH";
    const accountState = await syncWallet.getAccountState()
    const balances = accountState.committed.balances;
    if (balances.ETH && balances.ETH > 0.005e18) {
        feeToken = "ETH";
    } else if (balances.USDC && balances.USDC > 20e6) {
        feeToken = "USDC";
    } else if (balances.USDT && balances.USDT > 20e6) {
        feeToken = "USDT";
    } else if (balances.DAI && balances.DAI > 20e6) {
        feeToken = "DAI";
    } else if (balances.WBTC && balances.WBTC > 0.0003e8) {
        feeToken = "WBTC";
    } else {
        console.warn("Your token balances are very low. You might need to bridge in more funds first.");
        feeToken = "ETH";
    }

    const signingKey = await syncWallet.setSigningKey({
        feeToken,
        ethAuthType: "ECDSALegacyMessage",
    });

    await signingKey.awaitReceipt();
    return signingKey;
}

const getBalances = async (syncWallet: zksync.Wallet) => {
    const account = await syncWallet.getAccountState()
    const balances = {}
    return balances
};


const getTransactionFee = async (syncProvider: zksync.Provider, walletAddress: string, token: string) => {
    /*
    * Returns the gas fee associated with transferring tokens to user
    * */

    const decimals = 18;
    const fee = await syncProvider.getTransactionFee(
    'Transfer',
    walletAddress,
    token
    )
    return parseInt(fee.totalFee.toString()) / 10 ** decimals;
};

export { changePubKey, getBalances, getTransactionFee }