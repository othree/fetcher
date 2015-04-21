all: fetcher.js node_modules/jquery-param/src/jquery-param.js
	cat fetcher.js node_modules/jquery-param/src/jquery-param.js > dist/fetcher.js

fetcher.js:
	babel --modules umd --module-id fetcher --blacklist strict fetcher.es6.js > fetcher.js

node_modules/jquery-param/src/jquery-param.js:
	npm install
