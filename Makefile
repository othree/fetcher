all:
	babel --modules umd --module-id fetcher fetcher.es6.js | sed -e "s/require('param')/require\(\'jquery-param\'\)/" > fetcher.js
