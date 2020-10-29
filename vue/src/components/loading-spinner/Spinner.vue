<template>
  <transition name="fade">
    <div class="overlay" v-if="isActive">
      <dots></dots>
      <p class="status-text">{{ status }} </p>
    </div>
  </transition>
</template>


<script>
import Dots from "./Dots";

export default {
  name: "Spinner",
  components: {
    Dots,
  },
   props: {
        active: Boolean,
        status: String,
   },
  data() {
    return {
      isActive: this.active || false,
    };
  },
  model: {
    prop: "active",
    event: "update:active",
  },
  watch: {
    active(value) {
      this.isActive = value;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.overlay {
  background: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: none;
  top: 0;
  left: 0;
  padding-top: 10%;
  text-align: center;
  z-index: 9999;
}
.status-text {
    text-align: center;
    font-size: 150%;
    font-weight: 500;
    background: rgba(0,0,0,0.5);
    padding: 15px;
    color: #fff;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>