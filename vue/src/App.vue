<template>
  <div id="app">
    <section class="section">
    <div class="container">
      <figure class="image mb-5">
        <img src="/img/morpher-solid.svg" style="max-width: 500px" />
      </figure>
    </div>
    <transition name="fade" mode="out-in">
    <router-view/>
    </transition>
    </section>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

</style>
