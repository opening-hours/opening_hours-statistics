# opening_hours-statistics

Simple visualization of the [opening_hours][Key:opening_hours] values in [OpenStreetMap](http://openstreetmap.org). The data is downloaded onces a day from [taginfo][] and then parsed with [opening_hours.js][oh-lib] (see real_test.js which exports the csv files).

For visualization the [flot JavaScript library][flot-lib] is used.

You are encouraged to generated your own stats. Here is the data:

http://openingh.openstreetmap.de/opening_hours.js/real_test.opening_hours.stats.csv

## Author
[Robin `ypid` Schneider](http://wiki.openstreetmap.org/wiki/User:Ypid)

<!-- Link definitions {{{ -->
[Key:opening_hours]: http://wiki.openstreetmap.org/wiki/Key:opening_hours
[flot-lib]: https://github.com/flot/flot
[oh-lib]: https://github.com/ypid/opening_hours.js
[taginfo]: http://taginfo.openstreetmap.org/
<!-- }}} -->
