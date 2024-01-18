const webpack = require('webpack');

module.exports = {
	// This configuration extends the one which can be found in vue-default-webpack-config.js.
	// For more info check out vue-default-webpack-config.js or https://cli.vuejs.org/guide/webpack.html#simple-configuration
	configureWebpack: {
		plugins: [
			// Work around for Buffer is undefined:
			// https://github.com/webpack/changelog-v5/issues/10
			new webpack.ProvidePlugin({
				Buffer: ['buffer', 'Buffer'],
				process: 'process/browser'
			})
		],
		resolve: {
			fallback: {
				assert: require.resolve('assert'),
				crypto: require.resolve('crypto-browserify'),
				http: require.resolve('stream-http'),
				https: require.resolve('https-browserify'),
				os: require.resolve('os-browserify/browser'),
				stream: require.resolve('stream-browserify'),
				buffer: require.resolve('buffer'),
				zlib: require.resolve('browserify-zlib')
				
			}
		},
		devServer: {
			// allowedHosts: "all",
			// webSocketServer: false,
			// liveReload: false,
		}
	}
};
