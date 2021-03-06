module.exports = {
	entry: {
		'test1/bundle': './tests/test1/index.ts',
		'test2/bundle': './tests/test2/index.ts',
	},
	output: {
		filename: '[name].js',
		path: './tests'
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [{
                loader: "style-loader" // creates style nodes from JS strings
				}, {
					loader: "css-loader" // translates CSS into CommonJS
				}, {
					loader: "sass-loader" // compiles Sass to CSS
				}]
			},
			{
				enforce: 'pre',
				test: /\.js$/,
				loader: "source-map-loader"
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader?' + JSON.stringify({
					transpileOnly: true,
					configFileName: 'tsconfig.webpack.json'
				}),
				exclude: /node_modules/,
			},
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	devtool: 'source-map'
};
