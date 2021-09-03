<template>
	<div class="card">
		<div class="custom-card">
			<div class="card-content">
				<div class="is-flex">
					<div class="details has-text-left mr-4">
						<p class="has-text-weight-bold is-size-5">
							<i class="fas fa-envelope" />
							<span class="ml-2">Email</span>
						</p>
						<p>Get a code sent to your email address every time you log in.</p>
					</div>
					<div class="actions">
						<button
							:class="{
								'button is-light-green is-small-button has-text-weight-bold transition-faster': true,
								'is-light-danger': store.twoFaRequired.email
							}"
							@click="setCurrentMethod('email', !store.twoFaRequired.email)"
						>
							<span>{{ !store.twoFaRequired.email ? 'Enable' : 'Disable' }}</span>
						</button>
					</div>
				</div>
				<p class="has-text-left mt-2 is-size-7">{{ store.email }}</p>
			</div>
		</div>
		<div v-if="store.twoFaRequired.email" class="recovery-active is-text-small">
			<span class="icon">
				<i class="fas fa-check-circle"></i>
			</span>
			Verification enabled
		</div>
		<div class="custom-card mt-5">
			<div class="card-content">
				<div class="is-flex">
					<div class="details has-text-left mr-4">
						<p class="has-text-weight-bold is-size-5">
							<i class="fas fa-mobile-alt" />
							<span class="ml-2">Authenticator</span>
						</p>
						<p>Use an authenticator app to generate a code for logging in.</p>
					</div>
					<div class="actions">
						<button
							:class="{
								'button is-light-green is-small-button has-text-weight-bold transition-faster': true,
								'is-light-danger': store.twoFaRequired.authenticator
							}"
							@click="setCurrentMethod('authenticator', !store.twoFaRequired.authenticator)"
						>
							<span>{{ !store.twoFaRequired.authenticator ? 'Enable' : 'Disable' }}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
		<div v-if="store.twoFaRequired.authenticator" class="recovery-active is-text-small">
			<span class="icon">
				<i class="fas fa-check-circle"></i>
			</span>
			Verification enabled
		</div>
		<div class="alert warning mt-5 is-size-7 has-text-left">
			⚠ If you lose your 2-step verification device, trusted account recovery will not work.
		</div>
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
