<template>
	<div class="control is-expanded">
		<button class="button is-fullwidth" @click="doLogin">
			<span class="icon google-icon">
				<i class="fab fa-google"></i>
			</span>
			<span> Link to VKontakte</span>
		</button>
	</div>
</template>

<script>
import { backupVKSeed, changePasswordEncryptedSeed } from '../utils/backupRestore';

export default {
	name: 'VKaddRecovery',
	components: {},
	data: function() {
		return {
			isLogined: false
		};
	},
	props: {
		walletEmail: {
			type: String,
			default: ''
		}
	},
	methods: {
		vkPopup: function(options) {
			const screenX = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
				screenY = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
				outerWidth = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
				outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : document.body.clientHeight - 22,
				width = options.width,
				height = options.height,
				left = parseInt(screenX + (outerWidth - width) / 2, 10),
				top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
				features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top;
			return window.open(options.url, 'vk_oauth', features);
		},

		doLogin: async function() {
			console.log(this.walletEmail);

			const redirectUri = 'http://localhost:3001';
			const uriRegex = new RegExp(redirectUri);
			const url =
				'http://oauth.vk.com/authorize?client_id=7548057&display=popup&v=5.120&response_type=token&scope=offline&redirect_uri=' +
				redirectUri;
			const win = this.vkPopup({
				width: 620,
				height: 370,
				url: url
			});

			const watchTimer = setInterval(async function() {
				try {
					if (uriRegex.test(win.location)) {
						clearInterval(watchTimer);
						const hash = win.location.hash.substr(1);
						const params = hash.split('&').reduce(function(result, item) {
							const parts = item.split('=');
							result[parts[0]] = parts[1];
							return result;
						}, {});
						//console.log(params)
						//console.log("Access token: " + params.access_token)
						//console.log("UserID: " + params.user_id)

						setTimeout(function() {
							win.close();
							//document.location.reload();
						}, 500);

						const encryptedSeedFromPassword = localStorage.getItem('encryptedSeed') || '';

						if (encryptedSeedFromPassword === '') {
							throw new Error('Keystore not found, aborting');
						}

						const encryptedSeedFromVKID = await changePasswordEncryptedSeed(
							JSON.parse(encryptedSeedFromPassword),
							window.sessionStorage.getItem('password'),
							params.user_id
						);
						try {
							await backupVKSeed(this.walletEmail, params.user_id, encryptedSeedFromVKID);
							this.isLogined = true;
						} catch {
							this.isLogined = false;
						}
					}
				} catch (e) {
					//win.close()
					console.log(e);
				}
			}, 100);
		}
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
