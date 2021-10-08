<template>
	<div class="card">
		<div class="custom-card">
			<div class="card-content">
				<div class="is-flex">
					<div class="details has-text-left mr-4">
						<p class="has-text-weight-medium is-size-5">
							<i class="fas fa-envelope" />
							<span class="ml-2">{{ $t('common.EMAIL') }}</span>
						</p>
						<p>{{ $t('2fa.2FA_EMAIL_DESCRIPTION') }}</p>
					</div>
					<div class="actions">
						<button
							:class="{
								'button is-light-green is-small-button has-text-weight-bold transition-faster': true,
								'is-light-danger': store.twoFaRequired.email
							}"
							data-cy="emailToggle"
							@click="setCurrentMethod('email', !store.twoFaRequired.email)"
						>
							<span>{{ !store.twoFaRequired.email ? $t('common.ENABLE') : $t('common.DISABLE') }}</span>
						</button>
					</div>
				</div>
				<p class="has-text-left mt-2 is-size-7">{{ store.email }}</p>
			</div>
		</div>
		<div data-cy="email2faConfirmed" v-if="store.twoFaRequired.email" class="recovery-active is-text-small">
			<span class="icon">
				<i class="fas fa-check-circle"></i>
			</span>
			{{ $t('2fa.VERIFICATION_ENABLED') }}
		</div>
		<div class="custom-card mt-5">
			<div class="card-content">
				<div class="is-flex">
					<div class="details has-text-left mr-4">
						<p class="has-text-weight-medium is-size-5">
							<i class="fas fa-mobile-alt" />
							<span class="ml-2">{{ $t('common.AUTHENTICATOR') }}</span>
						</p>
						<p>{{ $t('2fa.2FA_AUTH_DESCRIPTION') }}</p>
					</div>
					<div class="actions">
						<button
							:class="{
								'button is-light-green is-small-button has-text-weight-bold transition-faster': true,
								'is-light-danger': store.twoFaRequired.authenticator
							}"
							data-cy="authenticatorToggle"
							@click="setCurrentMethod('authenticator', !store.twoFaRequired.authenticator)"
						>
							<span>{{ !store.twoFaRequired.authenticator ? $t('common.ENABLE') : $t('common.DISABLE') }}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
		<div data-cy="authenticator2faConfirmed" v-if="store.twoFaRequired.authenticator" class="recovery-active is-text-small">
			<span class="icon">
				<i class="fas fa-check-circle"></i>
			</span>
			{{ $t('2fa.VERIFICATION_ENABLED') }}
		</div>
		<div class="alert warning mt-5 is-size-7 has-text-left">⚠ {{ $t('2fa.VERIFICATION_LOSE') }}</div>
	</div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import { Authenticated } from '../mixins/mixins';

@Component({})
export default class Change2FA extends mixins(Authenticated) {
	@Emit('setCurrentMethod')
	setCurrentMethod(method: string, isEnabling: boolean) {
		return { method, isEnabling };
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
