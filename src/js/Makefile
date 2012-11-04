all:
	browserify main.js --ignore 'ws' -o bin/client.js

watch:
	browserify main.js --ignore 'ws' -w -v -o bin/client.js

server:
	node main.js

