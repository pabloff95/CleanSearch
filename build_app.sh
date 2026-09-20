echo "Building extension..."
rm -rf extension/dist
mkdir -p extension/dist
yarn build
cp extension/manifest.json extension/dist/manifest.json
cp extension/package.json extension/dist/package.json
cp -r extension/icons extension/dist/icons
cp LICENSE extension/dist/LICENSE
cp PRIVACY.md extension/dist/PRIVACY.md
echo "Extension build complete."