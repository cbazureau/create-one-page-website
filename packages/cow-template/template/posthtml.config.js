module.exports = {
  publicUrl: '/create-one-page-website/',
  extraFilesToCopy: ['.nojekyll'],
  plugins: {
    'cow-scripts/posthtml-cow-component': {
      workingDir: __dirname,
      manifest: {
        short_name: 'COW',
        name: 'Create One-page Website',
        start_url: '/',
        // icons key isn't needed
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#ffffff',
      },
    },
  },
};
