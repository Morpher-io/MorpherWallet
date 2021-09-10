import store from '../store/index';
// check for sesion storage events from other tabs. This will logout if other tabs logged out, log in if other tabs logged in or fetch the the password from the session storage in other tabs
const sessionStorageTransfer = function(event: any) {
	if (!event) {
		event = window.event;
	}
	// check for logout/login events from other tabs
	if (event.key == 'encryptedSeed') {
		if (event.newValue) {
			if (!store.state.encryptedSeed.ciphertext) {
				store.dispatch('loginWallet');
			}
		} else {
			if (store.state.encryptedSeed.ciphertext) {
				store.dispatch('logoutWallet');
			}
		}
	}
	if (!event.newValue) return; // do nothing if no value to work with
	if (event.key == 'getWalletSessionStorage') {
		const password = sessionStorage.getItem('password');
		if (password) {
			// another tab asked for the sessionStorage -> send it
			localStorage.setItem('setWalletSessionStorage', password);
			// the other tab should now have it, so we're done with it.
			localStorage.removeItem('setWalletSessionStorage'); // <- could do short timeout as well.
		}
	} else if (event.key == 'setWalletSessionStorage') {
		// another tab sent data <- get it
		sessionStorage.setItem('password', event.newValue);
	}
};

// listen for changes to localStorage
window.addEventListener('storage', sessionStorageTransfer, false);

// save data to the session store
export function saveSessionStore(key: string, value: string) {
	sessionStorage.setItem(key, value);
}
// Get session storage data from other tabs
async function getFromOtherTab(key: string): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			let sessionValue = '';
			localStorage.setItem('getWalletSessionStorage', 'temp');
			localStorage.removeItem('getWalletSessionStorage');
			let timeout = 0;
			const interval = setInterval(() => {
				timeout += 1;
				sessionValue = sessionStorage.getItem(key) || '';
				if (timeout > 10 || sessionValue) {
					clearInterval(interval);
					resolve(sessionValue || '');
				}
			}, 100);
		} catch (err) {
			reject(err);
		}
	});
}
// Get session storage data from other tabs
export async function getSessionStore(key: string): Promise<string> {
	return new Promise(async (resolve, reject) => {
		try {
			let sessionValue = sessionStorage.getItem(key) || '';
			if (!sessionValue) {
				sessionValue = await getFromOtherTab(key);
			}

			resolve(sessionValue || '');
		} catch (err) {
			reject('');
		}
	});
}
// remove data from the session store
export function removeSessionStore(key: string): void {
	sessionStorage.removeItem(key);
}
