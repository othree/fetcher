all: param.js fetcher.js
	cat param.js fetcher.js > dist/fetcher.js

param.js:
	cat node_modules/jquery-param/src/jquery-param.js | dos2unix > param.js

fetcher.js:
	babel --modules umd --module-id fetcher fetcher.es6.js > fetcher.js

node_modules/jquery-param/src/jquery-param.js:
	npm install
