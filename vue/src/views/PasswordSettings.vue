<template>
  <div class="container">
    <ChangePassword />
  </div>
</template>

<script lang="ts">
import Vue, { defineComponent } from 'vue'
import ChangePassword from '@/components/ChangePassword.vue'

export default defineComponent({
  components: {
    ChangePassword
  },
  methods: {
    redirectUser() {
      this.$router.push('/settings').catch(() => undefined)
    }
  }
})
</script>

<style lang="scss" scoped>
.title-container {
  display: flex;
  align-items: center;

  .title {
    margin: 0;
  }
}
</style>
