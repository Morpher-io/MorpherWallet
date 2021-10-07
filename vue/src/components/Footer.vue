<template>
	<footer class="footer">
		<!-- NFT Background -->
		<div v-if="NFTBackground" class="nft-details has-line-height-1">
			<i class="fas fa-info-circle"></i> NFT Background <a :href="NFTBackground.link" target="__blank">{{ NFTBackground.artist }}</a>
		</div>
		<!-- Language -->
		<div class="language-selector has-line-height-1">
			<div
				:class="{
					dropdown: true,
					active: dropdownOpen
				}"
			>
				<button @click="dropdownOpen = !dropdownOpen" class="button lang-button is-size-14 dark-btn has-text-weight-normal">
					<span>{{ $i18n.locale.toUpperCase() }}</span>
					<img :src="require('../assets/img/flags/' + $i18n.locale.split('-')[0] + '.svg')" />
				</button>

				<div class="dropdown-items">
					<div
						v-for="language in languages"
						:key="language.code"
						@click="() => setLanguage(language.code)"
						class="lang-item has-text-grey-faded"
					>
						<img :src="require('../assets/img/flags/' + language.code + '.svg')" />
						<span>{{ language.name }}</span>
					</div>
				</div>
			</div>
		</div>
	</footer>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import Cookie from 'js-cookie';
import { BackgroundNFT } from '../utils/backgroundNFT';

@Component({})
export default class Footer extends Vue {
	@Prop()
	NFTBackground!: BackgroundNFT | null;

	dropdownOpen = false;
	languages = [
		{
			code: 'en',
			name: 'English'
		},
		{
			code: 'ru',
			name: 'Русский'
		},
		{
			code: 'bs',
			name: 'Bosanski'
		}
	];
	setLanguage(lang: string): void {
		this.dropdownOpen = false;
		this.$i18n.locale = lang;
		document.querySelector('html')?.setAttribute('lang', lang);
		if (lang === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
		else document.querySelector('html')?.setAttribute('dir', '');
		Cookie.set('locale', lang);
	}
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

	.language-selector {
		margin-left: auto;

		.dropdown {
			position: relative;

			.dropdown-items {
				position: absolute;
				bottom: 30px;
				right: 0;
				background: #fff;
				border: 1px solid #eae9ed;
				box-shadow: 0px 2px 4px 0px rgb(51 51 51 / 10%);
				border-radius: 13px;
				padding-top: 0;
				padding-bottom: 0;
				overflow: hidden;
				margin-bottom: 0.5rem;
				opacity: 0;
				visibility: none;
				transition: 200ms;

				.lang-item {
					text-align: left;
					padding: 0.625rem 0.625rem;
					padding-right: 3rem;
					display: flex;
					justify-content: flex-start;
					align-items: center;
				}
			}

			&.active {
				.dropdown-items {
					visibility: visible;
					opacity: 1;
				}
			}
		}

		.lang-button {
			display: flex;
			align-items: center;
			padding-right: 0.5rem;
			padding-left: 0.5rem;
			height: 30px;
			width: auto;
			border: 1px solid #eae9ed;
			border-radius: 6px;
			box-shadow: 0px 2px 4px 0px rgb(51 51 51 / 10%);

			> img {
				margin-left: 5px;
				width: 18px;
				height: 18px;
			}
		}

		.lang-item {
			display: flex;
			align-items: center;

			&:hover {
				cursor: pointer;
				background-color: #f7f7f7;
				text-decoration: none;
			}

			> img {
				margin-right: 10px;
				width: 18px;
				height: 18px;
			}
		}
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
