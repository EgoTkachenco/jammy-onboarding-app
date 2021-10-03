module.exports = {
  reactStrictMode: true,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.bin$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'file-loader',
          options: {
            encoding: false,
            mimetype: false,
            generator: (content) => {
              return content
            },
          },
        },
      ],
    })

    return config
  },
}
