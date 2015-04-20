# opening_hours-statistics

Simple visualization of the [opening_hours][Key:opening_hours] values in [OpenStreetMap](http://openstreetmap.org).
The purpose of this statistic is to show the data quality and grow over time. Because of this, the [library][oh-lib] version which parses the opening_hours is pinned to [v3.0.0](https://github.com/ypid/opening_hours.js/releases/tag/v3.0.0).

See [announcement blog post in ypid’s OSM diary](https://www.openstreetmap.org/user/ypid/diary/23881).

## Internals

The data is downloaded once a day from [taginfo][] and then parsed with [opening_hours.js][oh-lib] (see real_test.js which exports the csv files).

For visualization the [flot JavaScript library][flot-lib] is used.

You are encouraged to generate your own stats. Here is the data:

http://openingh.openstreetmap.de/stats_data/real_test.opening_hours.stats.csv
http://openingh.openstreetmap.de/stats_data/

## Author
[Robin `ypid` Schneider](http://wiki.openstreetmap.org/wiki/User:Ypid)

<!-- Link definitions {{{ -->
[Key:opening_hours]: http://wiki.openstreetmap.org/wiki/Key:opening_hours
[flot-lib]: https://github.com/flot/flot
[oh-lib]: https://github.com/ypid/opening_hours.js
[taginfo]: http://taginfo.openstreetmap.org/
[real_test.js]: https://github.com/ypid/opening_hours.js/blob/master/real_test.js
[opening_hours_map]: https://github.com/ypid/opening_hours_map
<!-- }}} -->
