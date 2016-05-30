makedirs:
	mkdir -p work/mdnDb-parts
tests:
	./node_modules/.bin/mocha
supportdb: makedirs
	# node tools/wikipediaScraper.js
	node tools/mdnScraper.js
mdnmirror: makedirs
	curl http://code.jquery.com/jquery.js > work/jquery.js
	rm -rf work/developer.mozilla.org
	wget -r -l 1 --convert-links --adjust-extension --no-parent -P work/ https://developer.mozilla.org/en-US/docs/Web/CSS/Reference
servemirror:
	cd work;\
	python -m SimpleHTTPServer
