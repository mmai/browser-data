makedirs:
	mkdir -p work/mdnDb-parts
tests:
	./node_modules/.bin/mocha
supportdb: makedirs
	# node tools/wikipediaScraper.js
	node tools/mdnScraper.js
mdnmirror: makedirs
	cd work;\
	wget http://code.jquery.com/jquery.js;\
	wget -r -l 1 --convert-links --adjust-extension --no-parent -P work/ https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
servemirror:
	cd work;\
	python -m SimpleHTTPServer
testm:
	cd work;\
	ls
