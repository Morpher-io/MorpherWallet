<template>
    <div class="language-selector has-line-height-1" v-click-outside="closeDropdown">
        <div
            :class="{
                dropdown: true,
                active: dropdownOpen
            }"
        >
            <button
                @click="dropdownOpen = !dropdownOpen"
                class="button lang-button is-size-14 dark-btn has-text-weight-normal"
                :class="{
                    active: dropdownOpen
                }"
            >
                <img :src="require('../assets/img/flags/' + $i18n.locale.split('-')[0].toLowerCase() + '.svg')" />
                <span class="has-text-weight-medium lang-name">{{ getLanguageParameter($i18n.locale, 'name') }}</span>
                <i
                    :class="{
                        'fas fa-chevron-up arrow': true
                    }"
                />
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
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Authenticated, Global } from '../mixins/mixins';
import Cookie from 'js-cookie';

@Component({})
export default class LanguageSelector extends mixins(Global, Authenticated) {
    dropdownOpen = false;

	languages: any = [
		{
			code: 'en',
			name: 'English',
			flag: '🇬🇧'
		},
		{
			code: 'ru',
			name: 'Русский',
			flag: '🇷🇺'
		},
		{
			code: 'bs',
			name: 'Bosanski',
			flag: '🇧🇦'
		}
	];

	setLanguage(lang: string): void {
		this.dropdownOpen = false;

		if (lang !== this.$i18n.locale) {
			this.$i18n.locale = lang;
			document.querySelector('html')?.setAttribute('lang', lang);
			if (lang === 'ar') document.querySelector('html')?.setAttribute('dir', 'rtl');
			else document.querySelector('html')?.setAttribute('dir', '');
			Cookie.set('locale', lang);

			if(this.store.keystore){
				this.updateUserPayload({ column: 'app_lang', value: lang });	
			}
		}
	}

	closeDropdown() {
		if (this.dropdownOpen) {
			this.dropdownOpen = false;
		}
	}

	getLanguageParameter(languageCode: string, parameter: string) {
		let value: string = this.languages[0][parameter];

		const findLang: any = this.languages.find((lang: any) => lang.code === languageCode);

		if (findLang) {
			value = findLang[parameter];
		}

		return value;
	}
}
</script>

<style lang="scss" scoped>
    .language-selector {
		display: flex;
		align-items: center;
		margin-left: auto;
		.dropdown {
			position: relative;

			&.mobile {
				.dropdown-items {
					min-width: 160px;
					right: 0;
					left: auto;
				}
			}
			.dropdown-items {
				position: absolute;
				bottom: 25px;
				right: 0;
				background: #fff;
				border: 1px solid #eae9ed;
				box-shadow: 0px 2px 4px 0px rgba(51, 51, 51, 0.1);
				border-radius: 13px;
				padding-top: 0;
				padding-bottom: 0;
				overflow: hidden;
				margin-bottom: 0.5rem;
				opacity: 0;
				visibility: hidden;
				transition: 200ms;
				min-width: 180px;
				.lang-item {
					text-align: left;
					padding: 0.5rem 0.5rem;
					display: flex;
					justify-content: flex-start;
					align-items: center;

					+ .lang-item {
						border-top: 1px solid #eae9ed;
					}
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
				margin-right: 5px;
				width: 18px;
				height: 18px;
			}
			.lang-name {
				margin-right: 5px;
			}
			.arrow {
				transition: 200ms;
				transform-origin: center;
			}

			&.active {
				.arrow {
					transform: rotateZ(180deg);
				}
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
				margin-right: 5px;
				width: 18px;
				height: 18px;
			}
		}
	}
</style>