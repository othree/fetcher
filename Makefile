all:
	babel --modules umd --module-id fetcher --blacklist strict fetcher.es6.js > fetcher.js
