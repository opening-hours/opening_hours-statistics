

.PHONY: dev
dev:
	cd ../ && python -m SimpleHTTPServer &
	xdg-open 'http://localhost:8000/ohs/'
