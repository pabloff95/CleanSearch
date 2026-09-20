echo "Building extension..."
yarn build
cp extension/manifest.json extension/dist/manifest.json
cp extension/package.json extension/dist/package.json
cp -r extension/icons extension/dist/icons
echo "Extension build complete."