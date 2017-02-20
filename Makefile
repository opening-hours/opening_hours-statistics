## vim: foldmarker={{{,}}} foldlevel=0 foldmethod=marker spell:

SHELL := /bin/bash -o nounset -o pipefail -o errexit
REPO_FILES ?= git ls-files -z | xargs --null -I '{}' find '{}' -type f -regextype posix-extended -not -regex '.*/?submodules/.*' -print0

.PHONY: dev
dev:
	cd ../ && python -m SimpleHTTPServer &
	xdg-open 'http://localhost:8000/ohs/'

qa-https-everywhere:
	$(REPO_FILES) | xargs -0 sed --regexp-extended --in-place 's#http(:\\?/\\?/)(overpass-turbo\.eu|www\.gnu\.org|stackoverflow\.com|openstreetmap\.org|www\.openstreetmap\.org|nominatim\.openstreetmap\.org|taginfo\.openstreetmap\.org|wiki\.openstreetmap\.org|josm.openstreetmap.de|www.openstreetmap.org\\/copyright)#https\1\2#g;'
	$(REPO_FILES) | xargs -0 sed -i 's#https://overpass-api.de/#https://overpass-api.de/#g;'
	$(REPO_FILES) | xargs -0 sed --regexp-extended --in-place 's#http://(\w+\.wikipedia\.org)#https://\1#g;'
