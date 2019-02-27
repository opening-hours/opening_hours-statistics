## vim: foldmarker={{{,}}} foldlevel=0 foldmethod=marker spell:

SHELL := /bin/bash -o nounset -o pipefail -o errexit
REPO_FILES ?= git ls-files -z | xargs --null -I '{}' find '{}' -type f -print0 | egrep -zZv '^(submodules|holidays/nominatim_cache).*$$'
REPO_SOURCE_FILES ?= $(REPO_FILES) | egrep -zZv '(\.png)$$'

.PHONY: dev
dev:
	cd ../ && python -m SimpleHTTPServer &
	xdg-open 'http://localhost:8000/ohs/'

.PHONY: qa-https-everywhere
qa-https-everywhere:
	$(REPO_SOURCE_FILES) | xargs --null sed --regexp-extended --in-place 's#http(:\\?/\\?/)((:?www\.)?momentjs\.com|overpass-turbo\.eu|gnu\.org|stackoverflow\.com|openstreetmap\.(org|de)|nominatim\.openstreetmap\.org|taginfo\.openstreetmap\.org|wiki\.openstreetmap\.org|josm\.openstreetmap\.de|www\.openstreetmap\.org\\/copyright|github\.com|xkcd\.com|heise\.de|readthedocs\.org|askubuntu\.com|xpra\.org|docker\.com|linuxcontainers\.org|ecma-international\.org|w3\.org|example\.com|fsf\.org|jquery\.com|openingh\.openstreetmap\.de)#https\1\2#g;'
	$(REPO_SOURCE_FILES) | xargs --null sed -i 's#http://overpass-api\.de#https://overpass-api.de#g;'
	$(REPO_SOURCE_FILES) | xargs --null sed --regexp-extended --in-place 's#http://(\w+\.wikipedia\.org)#https://\1#g;'
