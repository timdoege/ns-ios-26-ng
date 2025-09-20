const webpack = require('@nativescript/webpack');
 // Import NativeScriptHTTPPlugin
const NativeScriptHTTPPlugin = require('@klippa/nativescript-http/webpack');

module.exports = (env) => {
	webpack.init(env);

	// SQ customization: The ba lib project includes a "xlsx" package which requires stream, fs and crypto from browsers
	// and since we don't need those here/cannot use those, we do not include a polyfill but tell webpack to ignore them
	// when resolving
	webpack.chainWebpack((config) => {

		// https://github.com/nativescript-community/sentry
		config.entry('bundle').prepend('@nativescript-community/sentry/process');

		webpack.Utils.addCopyRule('./src/fonts/*.js');

		// Klippa HTTP plugin
		config.plugin('NativeScriptHTTPPlugin').use(NativeScriptHTTPPlugin, [
			{
				replaceHTTP: true,
				replaceImageCache: false
			}
		])

		config.set('externalsPresets', {
			node: false
		})
		config.resolve.fallback = config.resolve.fallback || {};
		/*
		    "stream-browserify": "^3.0.0",
		    "tty-browserify": "^0.0.1",
    		"os-browserify": "^0.3.0",
		*/
		config.resolve.set('fallback', {
		  stream: false, // require.resolve('stream-browserify'),
		  os: false, // require.resolve('os-browserify'),
		  tty: false, // require.resolve('tty-browserify'),
		  fs: false,
		  crypto:false,
		  path: false,
		  url: false,
		  util: false,
		  zlib: false,
		  http: require.resolve('stream-http'),
		  https: require.resolve('https-browserify'),
		});
		// https://github.com/NativeScript/NativeScript/discussions/9693
		config.output.devtoolNamespace('app');

		// Contentful
		// globalThis.process && globalThis.process.env.NODE_ENV === "production"
		// TypeError: Cannot read properties of undefined (reading 'NODE_ENV')
		
		/*
		config.plugin("DefinePlugin").tap((args) => {
			Object.assign(args[0], {
			"process.env": {
			NODE_DEBUG:false,
			NODE_ENV: 'development',
			READABLE_STREAM: JSON.stringify('readable-stream'),
			},
		});
			return args;
		});
		*/
		
		/*
		config.plugin('DefinePlugin').tap(args => {
			{
				"Trace.write(`Could not load CSS from ${uri}: ${e}`, Trace.categories.Error, Trace.messageType.warn);": ""
			  }
			  
			Object.assign(args[0], {
			  'global.isProduction': !!env.production,
			  'global.someNumber': 42,
			  'global.someString': JSON.stringify('some string value')
			})
	  
			return args
		  })
		  */
	});

	return webpack.resolveConfig();
};