<template>
	<div id="app">
		<section class="section">
			<div class="container">
				<figure class="image mb-5">
					<img src="/img/morpher-solid.svg" style="max-width: 500px" />
				</figure>
			</div>
			<transition name="fade" mode="out-in">
				<router-view />
			</transition>
		</section>
	</div>
</template>

<style lang="scss">
//@import "./assets/styles.scss";
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	color: #2c3e50;
}

</style>
