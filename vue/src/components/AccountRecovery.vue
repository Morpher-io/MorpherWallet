<template>
  <div class="card">
    <div>
      <div class="field is-grouped">
        <router-link
          to="/addrecovery"
          tag="button"
          class="button is-green big-button is-login transition-faster"
        >
          <span class="icon is-small">
            <i class="fas fa-life-ring"></i>
          </span>
          <span class="text smaller-font">{{ $t('recovery.ADD_ACCOUNT_RECOVERY') }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { defineComponent } from 'vue'
export default defineComponent({})
</script>
<style scoped>
.smaller-font {
  font-size: 14px;
}
</style>
