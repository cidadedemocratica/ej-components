clean:
	rm -rf dist
build:
	stencil build

fix_icons_dist_path:
	cd dist && \
	sed -i "s#./assets/icons/#./opinion-button/assets/icons/#g" opinion-button/*.js && \
	sed -i "s#./assets/icons/#./opinion-button/assets/icons/#g" collection/components/my-component/my-component.js && \
	sed -i "s#./assets/icons/#./opinion-button/assets/icons/#g" esm/*.js && \
	sed -i "s#./assets/icons/#./opinion-button/assets/icons/#g" esm-es5/*.js && \
	sed -i "s#./assets/icons/#./opinion-button/assets/icons/#g" cjs/*.js

publish: clean build fix_icons_dist_path
	npm publish

