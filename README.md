# opening_hours-statistics

Simple visualization of the [opening_hours][Key:opening_hours] values in [OpenStreetMap](http://openstreetmap.org).
The purpose of this statistic is to show the data quality and grow over time. Because of this, the [library][oh-lib] version which parses the opening_hours is pinned to [v3.0.0](https://github.com/ypid/opening_hours.js/releases/tag/v3.0.0).

See [announcement blog post in ypid’s OSM diary](https://www.openstreetmap.org/user/ypid/diary/23881).

Note that [certain](https://github.com/ypid/opening_hours.js/blob/1c4b908e6d67f913e6e3eccdacfb243fde017acc/real_test.js#L39) [values](https://github.com/ypid/opening_hours.js/blob/1c4b908e6d67f913e6e3eccdacfb243fde017acc/real_test.js#L80) are being ignored in this statistic (it appears as if those values where not in OSM at all). So it is possible that the numbers do not quite match up with [taginfo]. It was implemented this way because [the script][real_test.js] used to generate the statistics was originally created to test the [library][oh-lib] against all values in OSM and some values where not interesting in this regard. A second reason is that those values are mapped to different values by the [opening_hours_map]. That the number of total values does not contain them can be considered as a bug but I will leave it like this for now.

## Internals

The data is downloaded once a day from [taginfo][] and then parsed with [opening_hours.js][oh-lib] (see real_test.js which exports the csv files).

For visualization the [flot JavaScript library][flot-lib] is used.

You are encouraged to generate your own stats. Here is the data:

http://openingh.openstreetmap.de/stats_data/real_test.opening_hours.stats.csv

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
