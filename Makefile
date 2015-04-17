all:
	babel --modules umd fetcher.es6.js | sed -e "s/require('param')/require\(\'jquery-param\'\)/" > fetcher.js
