<template>
	<footer class="footer">
		<!-- NFT Background -->
		<div v-if="NFTBackground" class="nft-details has-line-height-1">
			<i class="fas fa-info-circle"></i> NFT Background <a :href="NFTBackground.link" target="__blank">{{ NFTBackground.artist }}</a>
		</div>
		<!-- Language -->
		<LanguageSelector></LanguageSelector>
		<div class="recaptcha">
			This site is protected by reCAPTCHA and the Google
			<a href="https://policies.google.com/privacy">Privacy Policy</a> and
			<a href="https://policies.google.com/terms">Terms of Service</a> apply.
		</div>
	</footer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import LanguageSelector from '../components/LanguageSelector.vue';
import { BackgroundNFT } from '../utils/backgroundNFT';

@Component({
	components: {
		LanguageSelector
	}
})
export default class Footer extends Vue {
	@Prop()
	NFTBackground!: BackgroundNFT | null;
}
</script>

<style lang="scss" scoped>
footer {
	margin-top: auto;
	padding: 30px;
	display: flex;
	align-items: center;
	margin-top: auto;
	background: none;
	box-shadow: none;
	z-index: 1;

	.recaptcha {
		position: absolute;
		bottom: 5px;
		color: #afafaf;
		font-size: 10px;
	}

	.nft-details {
		background: rgba(255, 255, 255, 0.7);
		border-radius: 7px;
		color: #333333;
		padding: 7px 15px;
	}

	a {
		color: inherit;
		text-decoration: underline;
	}
}
</style>
