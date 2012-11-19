all:
	browserify js/main.js --ignore 'ws' -v -o js/bin/client.js; node js/main.js

deploy:
	browserify js/main.js --ignore 'ws' -v -o js/bin/client.js; python -m 'SimpleHTTPServer' & node js/main.js

build:
	browserify js/main.js --ignore 'ws' -v -o js/bin/client.js

watch:
	browserify js/main.js --ignore 'ws' -w -v -o js/bin/client.js

server:
	node js/main.js

