clean:
	rm -rf dist
build:
	stencil build

fix_icons_dist_path:
	cd dist && \
	sed -i "s#./assets/icons/#./conversations/assets/icons/#g" conversations/*.js && \
	sed -i "s#./assets/icons/#./conversations/assets/icons/#g" collection/components/conversation/main.js && \
	sed -i "s#./assets/icons/#./conversations/assets/icons/#g" esm/*.js && \
	sed -i "s#./assets/icons/#./conversations/assets/icons/#g" esm-es5/*.js && \
	sed -i "s#./assets/icons/#./conversations/assets/icons/#g" cjs/*.js

publish: clean build fix_icons_dist_path
	npm publish

