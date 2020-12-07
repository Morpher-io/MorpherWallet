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
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#nav {
	padding: 30px;

	a {
		font-weight: bold;
		color: #2c3e50;

		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
