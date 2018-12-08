/* Helpers {{{ */
// https://stackoverflow.com/a/1418059
if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
// https://stackoverflow.com/a/2901298
function numberWithSpace(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&nbsp;");
}
/* }}} */

$(function() {
    var stats_csv_source = 'http://openingh.openstreetmap.de/stats_data/';
    // stats_csv_source = '../oh-stats/'; // FIXME dev

    function isCanvasSupported(){
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    }

    if (!isCanvasSupported()) {
        $.simplyToast( "Your browser has Canvas support disabled or does not support it yet."
            + " That is a good thing to protect your privacy but the \"What is in the database?\" part of the site depends on Canvas."
            + " \"What is in the database?\" is folded away for you. Enable Canvas if you want to use it.",
            'warning', { align: "left", delay: 30000, } );
        $("#osm_db_over_time").slideToggle(2000);
        $("#tooltip").hide();
    }

    var plot;

    var plot_options = { /* {{{ */
        series: {
            lines: {
                show: true,
            },
            points: {
                show: true
            },
            shadowSize: 0,
        },
        xaxis: {
            mode: "time",
            tickLength: 5,
            timezone: "browser",
        },
        yaxis: [
            { position: "left" },
            { position: "left" }
        ],
        selection: {
            mode: "x"
        },
        grid: {
            markings: weekendAreas,
            hoverable: true,
            // clickable: true
        },
        legend: {
            // position: "se",
            container: "#legend",
            backgroundOpacity: 0.4,
        },
    }; /* }}} */

    var tag_keys = [ /* {{{ */
        'opening_hours', 'opening_hours:kitchen', 'opening_hours:warm_kitchen',
        'service_times',
        'collection_times', 'fee', 'lit',
        'happy_hours',
        'smoking_hours',
    ]; /* }}} */

    /* Helper for returning the weekends in a period {{{ */
    function weekendAreas(axes) {

        var markings = [],
            d = new Date(axes.xaxis.min);

        // go to the first Saturday

        d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7))
        d.setUTCSeconds(0);
        d.setUTCMinutes(0);
        d.setUTCHours(0);

        var i = d.getTime();

        // when we don't set yaxis, the rectangle automatically
        // extends to infinity upwards and downwards

        do {
            markings.push({ xaxis: { from: i, to: i + 2 * 24 * 60 * 60 * 1000 } });
            i += 7 * 24 * 60 * 60 * 1000;
        } while (i < axes.xaxis.max);

        return markings;
    }
    /* }}} */

    function showStatsForKey(type) { /* {{{ */
        var db_stats_file, punchcard_data_file;
        var key = $('#tag_selector').val();
        var boundary = $('#boundary_selector').val();
        if (boundary === 'planet=earth') {
            db_stats_file = 'real_test.' + key + '.stats.csv';
            punchcard_data_file = 'punchcard.csv';
        } else {
            db_stats_file = 'export♡' + key + '♡' + boundary.replace(/=/g, '♡') + '♡stats.csv';
            punchcard_data_file = 'punchcard♡' + boundary.replace(/=/g, '♡') + '♡csv';
        }
        $.ajax({
            type: "GET",
            url: stats_csv_source + db_stats_file,
            dataType: "text",
        })
            .done(function(data) {
                processData(data);
            })
            .fail(function( jqXHR, textStatus ) {
                $.simplyToast( "The tag <code>" + $('#tag_selector').val() + "</code> has not been used in the selected location yet."
                    + " You can be the first to add one ☺"
                    + " It might also be the case that there is a problem with getting the data.",
                    'warning', { align: "left", delay: 10000, } );
            });
        if (type === '#boundary_selector' || typeof(type) === 'undefined') {
            load_punchcard(stats_csv_source + punchcard_data_file);
        }
    } /* }}} */

    function timePointer(plot, currentTime, id, content, func_add) { /* {{{ */
        if (typeof(func_add) !== 'function') {
            var func_add = function() { return true; };
        }

        /* https://stackoverflow.com/a/17533126/2239985 */
        var id = 'time-pointer-' +  id;

        // Get the currente axes
        var axes = plot.getAxes();
        var xaxis = axes.xaxis;
        var yaxis = axes.yaxis;

        var element = plot.getPlaceholder();

        // Find the chart icon element
        var pointer = element.find('#' + id);

        // Check that the intended point is inside the visible area
        if(func_add(currentTime, id, content) && (currentTime < xaxis.max) && (currentTime > xaxis.min)) {

            if(pointer.length === 0) {
                // If it doesn't exist already, create it
                element.append('<i id="' + id + '" class="time-pointer">' + content + '</i>');
                pointer = element.find('#' + id);
            }

            var plotOffset = plot.offset();
            var offset = {
                top: plotOffset.top - pointer.height() - 5,
                left: xaxis.p2c(currentTime) + plotOffset.left // + pointer.outerWidth(false)
            };
            pointer.offset(offset);
        } else {
            // If the currently selected area doesn't contain the point, erase the pointer
            pointer.remove();
        }
    } /* }}} */

    function placeTimePointers(plot) { /* {{{ */
        timePointer(plot, new Date(2014, 9, 11).getTime(), "issue-28",
            '<a href="https://github.com/ypid/opening_hours_map/issues/28">Server offline</a>',
            function(currentTime, id, content){
                var boundary = $('#boundary_selector').val();
                return boundary === 'planet=earth';
            });
        timePointer(plot, new Date(2015, 3, 12).getTime(), "issue-2",
            '<a href="https://github.com/ypid/opening_hours-statistics/issues/2">Fixed issue 2</a>',
            function(currentTime, id, content){
                var boundary = $('#boundary_selector').val();
                var key = $('#tag_selector').val();
                return boundary === 'planet=earth' && (key === 'fee' || key === 'lit');
            });
        timePointer(plot, new Date(2015, 3, 19).getTime(), "OSMWA1517",
            '<a href="http://blog.openstreetmap.de/blog/2015/04/wochenaufgabe-oeffnungszeiten/">Wochenaufgabe</a>');
        timePointer(plot, new Date(2017, 1, 12).getTime(), "issue-13",
            '<a href="https://github.com/opening-hours/opening_hours-statistics/issues/13">Missing data</a>');
        timePointer(plot, new Date(2018, 11, 12).getTime(), "issue-16",
            '<a href="https://github.com/opening-hours/opening_hours-statistics/issues/16">Missing data</a>');
    } /* }}} */

    /* Create and connect drop down menu to change data source boundary {{{ */
    $('#boundary_selector').append(new Option('planet=earth (not an official tag)', 'planet=earth'));
    $('#boundary_selector').append(new Option("int_name=Deutschland", "int_name♡Deutschland"));
    var boundary_to_name_mapping = {
        /* https://de.wikipedia.org/wiki/ISO_3166-2:DE */
        'ISO3166-2=DE-BW': 'DE: Baden-Württemberg',
        'ISO3166-2=DE-BY': 'DE: Bayern',
        'ISO3166-2=DE-BE': 'DE: Berlin',
        'ISO3166-2=DE-BB': 'DE: Brandenburg',
        'ISO3166-2=DE-HB': 'DE: Bremen',
        'ISO3166-2=DE-HH': 'DE: Hamburg',
        'ISO3166-2=DE-HE': 'DE: Hessen',
        'ISO3166-2=DE-MV': 'DE: Mecklenburg-Vorpommern',
        'ISO3166-2=DE-NI': 'DE: Niedersachsen',
        'ISO3166-2=DE-NW': 'DE: Nordrhein-Westfalen',
        'ISO3166-2=DE-RP': 'DE: Rheinland-Pfalz',
        'ISO3166-2=DE-SL': 'DE: Saarland',
        'ISO3166-2=DE-SN': 'DE: Sachsen',
        'ISO3166-2=DE-ST': 'DE: Sachsen-Anhalt',
        'ISO3166-2=DE-SH': 'DE: Schleswig-Holstein',
        'ISO3166-2=DE-TH': 'DE: Thüringen',
    };
    $.ajax({
        type: "GET",
        url: stats_csv_source + 'stats_for_boundaries.txt',
        dataType: "text",
        // contentType: "text/plain; charset=UTF-8",
        success: function(data) {
            data.split('\n').forEach(function (boundary_selector) {
                if (boundary_selector.match(/^[^#]/)) {
                    boundary_selector = boundary_selector.replace(/♡/g, '=');
                    var name = boundary_selector;
                    if (boundary_selector in boundary_to_name_mapping) {
                        var name = boundary_to_name_mapping[boundary_selector];
                    }
                    // if (boundary_selector === 'int_name♡Österreich') {
                        // console.log(boundary_selector);
                    // }
                    $('#boundary_selector').append(new Option(name, boundary_selector));
                }
            });
        },
    });
    $('#boundary_selector').on('change', function() {
        showStatsForKey('#boundary_selector');
    });
    /* }}} */

    /* Create and connect drop down menu to change data source {{{ */
    $.each(tag_keys, function(ind, text) {
        $('#tag_selector').append(new Option(text, text));
    });
    $('#tag_selector').on('change', function() {
        showStatsForKey('#tag_selector');
    })
    /* }}} */

    function processData(allText) {
        $('#detailed_view').empty();
        $('#overview').empty();

        /* Parse the CSV file {{{ */
        // https://stackoverflow.com/a/7431565
        var allTextLines = allText.split(/\r\n|\n/);
        headers = allTextLines[0].split(',');

        var data_total_values            = [];
        var data_could_be_parsed         = [];
        var data_could_be_parsed_percent = [];
        var data_with_warning            = [];
        var data_with_warning_percent    = [];
        var data_with_unpretty           = [];
        var data_with_unpretty_percent   = [];
        var last_data = allTextLines[allTextLines.length - 2].split(','); // Empty line
        for (var i = 1; i < allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
                if (data.length === headers.length) {
                    var time = new Date(data[0]).getTime();
                    data_total_values.push([ time, data[1]]);
                    data_could_be_parsed.push([ time, data[3]]);
                    data_could_be_parsed_percent.push([ time, data[3] / data[1] * 100]);
                    data_with_warning.push([ time, data[5]]);
                    data_with_warning_percent.push([ time, data[5] / data[1] * 100]);
                    data_with_unpretty.push([ time, data[7]]);
                    data_with_unpretty_percent.push([ time, data[7] / data[1] * 100]);

                    var tarr = [];
                    for (var j = 0; j < headers.length; j++) {
                        tarr.push(data[j].trim());
                    }
                }
                // console.log(JSON.stringify(data_could_be_parsed_percent, null, '  '));
        }
        /* }}} */

        var datasets = [ /* {{{ */
            {
                data: data_total_values,
                label_short: 'Total number',
                label: 'Total number of values',
                checked: true, }, {
                data: data_could_be_parsed,
                label_short: 'Parsed values',
                label: 'Number of values which could be parsed',
            }, {
                data: data_could_be_parsed_percent,
                yaxis: 2,
                label_short: 'Parsed values in %',
                label: 'Number of values which could be parsed in percent',
                checked: true,
                percent_number: true,
            }, {
                data: data_with_warning,
                label_short: 'Warning values',
                label: 'Number of values which returned a warning',
            }, {
                data: data_with_warning_percent,
                yaxis: 2,
                label_short: 'Warning values in %',
                label: 'Number of values which returned a warning in percent',
                percent_number: true,
            }, {
                data: data_with_unpretty,
                label_short: 'Unpretty values',
                label: 'Number of values which are not prettified',
            }, {
                data: data_with_unpretty_percent,
                yaxis: 2,
                label_short: 'Unpretty values in %',
                label: 'Number of values which are not prettified in percent',
                percent_number: true,
            },
        ]; /* }}} */

        /* Set individual color for each column {{{ */
        var i = 0;
        $.each(datasets, function(key, val) {
            val.color = i;
            ++i;
        });
        /* }}} */

        /* Insert check boxes to select data source columns to plot {{{ */
        if ($('#choices').text().length === 0) {
            $.each(datasets, function(key, val) {
                // val.checked = true;
                $("#choices").append("<br/><input type='checkbox' name='" + key + "'" +
                    (val.checked ? " checked='checked'" : '') + " id='id" + key + "'></input>" +
                    "<label for='id" + key + "'>"
                    + val.label_short + "</label>");
            });
            $("#choices").find("input").click(plotAccordingToChoices);
        }
        /* }}} */

        function plotAccordingToChoices() { /* {{{ */
            var data = [];

            $("#choices").find("input:checked").each(function () {
                var key = $(this).attr("name");
                if (key && datasets[key]) {
                    data.push(datasets[key]);
                }
            });

            if (data.length > 0) {
                var opts;
                var this_plot_options = plot_options;
                if (typeof(plot) !== 'undefined'){
                    var xaxes = plot.getOptions().xaxes[0];
                    this_plot_options.xaxis.min = xaxes.min;
                    this_plot_options.xaxis.max = xaxes.max;
                }
                plot = $.plot("#detailed_view", data, this_plot_options);
                placeTimePointers(plot);
            }
        } /* }}} */

        /* Define overview section {{{ */
        var overview = $.plot("#overview", [data_total_values], {
            series: {
                lines: {
                    show: true,
                    lineWidth: 1
                },
                shadowSize: 0,
            },
            xaxis: {
                mode: "time",
                tickLength: 5,
                timezone: "browser",
            },
            yaxis: {
                ticks: [],
                // min: 0,
                autoscaleMargin: 0.1
            },
            selection: {
                mode: "x"
            }
        });
        /* }}} */

        /* connect the detailed_view and the overview {{{ */
        $("#detailed_view").bind("plotselected", function (event, ranges) {

            // do the zooming
            $.each(plot.getXAxes(), function(_, axis) {
                var opts = axis.options;
                opts.min = ranges.xaxis.from;
                opts.max = ranges.xaxis.to;
            });
            plot.setupGrid();
            plot.draw();
            plot.clearSelection();
            placeTimePointers(plot);

            // don't fire event on the overview to prevent eternal loop

            overview.setSelection(ranges, true);
        });

        $("#overview").bind("plotselected", function (event, ranges) {
            plot.setSelection(ranges);
        });

        $("<div id='tooltip'></div>").css({
            position: "absolute",
            display: "none",
            border: "1px solid #fdd",
            padding: "2px",
            "background-color": "#fee",
            opacity: 0.80
        }).appendTo("body");

        $("#detailed_view").bind("plothover", function (event, pos, item) {
            if (item) {
                // console.log(JSON.stringify(item, null, '  '));
                // console.log();
                var date = new Date(item.datapoint[0]),
                    y = item.datapoint[1];

                var additional_node = '';
                if (item.dataIndex > 0) {
                    var diff_to_last_time = y - item.series.data[item.dataIndex - 1][1];
                    additional_node += '<br>Difference to previous value: '
                        + (diff_to_last_time > 0 ? '+' : '')
                        + (item.series.percent_number ? diff_to_last_time.toFixed(4) + '&nbsp;%' : diff_to_last_time).toString();
                }

                $("#tooltip").html(
                    (item.series.percent_number ? y.toFixed(3).toString() + '&nbsp;%' : numberWithSpace(y))
                    + " as of "
                    + date.getFullYear() + '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' : '' ) + date.getDate()
                    + ' ' + (date.getHours() < 10 ? '0' : '') + date.getHours()
                    + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
                    + ' (' + item.series.label + ')'
                    + additional_node)
                    .css({top: item.pageY+5, left: item.pageX+5})
                    .fadeIn(200);
            } else {
                $("#tooltip").hide();
            }
        });
        /* }}} */

        /* Highlight data point when clicked {{{ */
        $("#detailed_view").bind("plotclick", function (event, pos, item) {
            if (item) {
                plot.highlight(item.series, item.datapoint);
            }
        });
        /* }}} */

        plotAccordingToChoices();
    }

    showStatsForKey();
    // load_punchcard(stats_csv_source + 'punchcard.csv');
    /* Plot the default data source */

    /* Punchcard {{{ */
    var punchcard_margin = {top: 10, right: 10, bottom: 10, left: 15};
    var punchcard_width = 1000 - punchcard_margin.left - punchcard_margin.right;
    var punchcard_height = 340 - punchcard_margin.top - punchcard_margin.bottom;
    var punchcard_padding = 3;
    var xLabelHeight = 30;
    var yLabelWidth = 90;
    var borderWidth = 3;
    var punchcard_duration = 500;

    var chart = d3.select('#chart').append('svg')
        .attr('width', punchcard_width + punchcard_margin.left + punchcard_margin.right)
        .attr('height', punchcard_height + punchcard_margin.top + punchcard_margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + punchcard_margin.left + ',' + punchcard_margin.top + ')');

    var border = chart.append('rect')
        .attr('x', yLabelWidth)
        .attr('y', xLabelHeight)
        .style('fill-opacity', 0)
        .style('stroke', '#000')
        .style('stroke-width', borderWidth)
        .style('shape-rendering', 'crispEdges');

    function load_punchcard(name) {
        return d3.text(name, function(dataCSV) {

            var labelsX = null
            var data = []

            d3.csv.parseRows(dataCSV, function(d) {

              if (labelsX === null) return labelsX = d.slice(1)

              var values = d.slice(1)
              var i = 0

              for (; i < values.length; i++) {
                values[i] = parseInt(values[i], 10)
              }

              data.push({
                label: d[0],
                values: values
              })

            })

            update(data, labelsX)
        });
    }

    function update(data, labelsX) {

        var allValues = Array.prototype.concat.apply([], data.map(function(d) { return d.values }))
        var maxWidth = d3.max(data.map(function(d) { return d.values.length }))
        var maxR = d3.min([(punchcard_width - yLabelWidth) / maxWidth, (punchcard_height - xLabelHeight) / data.length]) / 2

        var r = function(d) {
          if (d === 0) return 0

          f = d3.scale.sqrt()
              .domain([d3.min(allValues), d3.max(allValues)])
              .rangeRound([2, maxR - punchcard_padding])

          return f(d)
        }

        var c = d3.scale.linear()
            .domain([d3.min(allValues), d3.max(allValues)])
            .rangeRound([255 * 0.8, 0])

        var rows = chart.selectAll('.row')
            .data(data, function(d){ return d.label })

        rows.enter().append('g')
            .attr('class', 'row')

        rows.exit()
            .transition()
            .duration(punchcard_duration)
            .style('fill-opacity', 0)
            .remove()

        rows.transition()
            .duration(punchcard_duration)
            .attr('transform', function(d, i){ return 'translate(' + yLabelWidth + ',' + (maxR * i * 2 + maxR + xLabelHeight) + ')' })

        var dots = rows.selectAll('circle')
            .data(function(d){ return d.values })

        dots.enter().append('circle')
            .attr('cy', 0)
            .attr('r', 0)
            .style('fill', '#ffffff')
            .text(function(d){ return d })

        dots.exit()
            .transition()
            .duration(punchcard_duration)
            .attr('r', 0)
            .remove()

        dots.transition()
            .duration(punchcard_duration)
            .attr('r', function(d){ return r(d) })
            .attr('cx', function(d, i){ return i * maxR * 2 + maxR })
            .style('fill', function(d){ return 'rgb(' + c(d) + ',' + c(d) + ',' + c(d) + ')' })

        var dotLabels = rows.selectAll('.dot-label')
            .data(function(d){
                return d.values.map(function (v) { return v + ' %'; });
            });

        var dotLabelEnter = dotLabels.enter().append('g')
            .attr('class', 'dot-label')
            .on('mouseover', function(d){
                var selection = d3.select(this)
                selection.select('rect').transition().duration(100).style('opacity', 1)
                selection.select("text").transition().duration(100).style('opacity', 1)
            })
            .on('mouseout', function(d){
                var selection = d3.select(this)
                selection.select('rect').transition().style('opacity', 0)
                selection.select("text").transition().style('opacity', 0)
            });

        dotLabelEnter.append('rect')
            .style('fill', '#005000')
            .style('opacity', 0);

        dotLabelEnter.append('text')
            .style('text-anchor', 'middle')
            .style('fill', '#ffffff')
            .style('opacity', 0);

        dotLabels.exit().remove();

        dotLabels
            .attr('transform', function(d, i){ return 'translate(' + (i * maxR * 2) + ',' + (-maxR) + ')' })
            .select('text')
                .text(function(d){ return d })
                .attr('y', maxR + 4)
                .attr('x', maxR);

        dotLabels
            .select('rect')
            .attr('width', maxR * 2)
            .attr('height', maxR * 2);

        var xLabels = chart.selectAll('.xLabel')
            .data(labelsX);

        xLabels.enter().append('text')
            .attr('y', xLabelHeight)
            .attr('transform', 'translate(0,-6)')
            .attr('class', 'xLabel')
            .style('text-anchor', 'middle')
            .style('fill-opacity', 0);

        xLabels.exit()
            .transition()
            .duration(punchcard_duration)
            .style('fill-opacity', 0)
            .remove();

        xLabels.transition()
            .text(function (d) { return d })
            .duration(punchcard_duration)
            .attr('x', function(d, i){ return maxR * i * 2 + maxR + yLabelWidth })
            .style('fill-opacity', 1);

        var yLabels = chart.selectAll('.yLabel')
            .data(data, function(d){ return d.label });

        yLabels.enter().append('text')
            .text(function (d) { return d.label })
            .attr('x', yLabelWidth)
            .attr('class', 'yLabel')
            .style('text-anchor', 'end')
            .style('fill-opacity', 0);

        yLabels.exit()
            .transition()
            .duration(punchcard_duration)
            .style('fill-opacity', 0)
            .remove();

        yLabels.transition()
            .duration(punchcard_duration)
            .attr('y', function(d, i){ return maxR * i * 2 + maxR + xLabelHeight })
            .attr('transform', 'translate(-6,' + maxR / 2.5 + ')')
            .style('fill-opacity', 1);

        var vert = chart.selectAll('.vert')
            .data(labelsX);

        vert.enter().append('line')
            .attr('class', 'vert')
            .attr('y1', xLabelHeight + borderWidth / 2)
            .attr('stroke', '#888')
            .attr('stroke-width', 1)
            .style('shape-rendering', 'crispEdges')
            .style('stroke-opacity', 0);

        vert.exit()
            .transition()
            .duration(punchcard_duration)
            .style('stroke-opacity', 0)
            .remove();

        vert.transition()
            .duration(punchcard_duration)
            .attr('x1', function(d, i){ return maxR * i * 2 + yLabelWidth })
            .attr('x2', function(d, i){ return maxR * i * 2 + yLabelWidth })
            .attr('y2', maxR * 2 * data.length + xLabelHeight - borderWidth / 2)
            .style('stroke-opacity', function(d, i){ return i ? 1 : 0 });

        var horiz = chart.selectAll('.horiz').
            data(data, function(d){ return d.label });

        horiz.enter().append('line')
            .attr('class', 'horiz')
            .attr('x1', yLabelWidth + borderWidth / 2)
            .attr('stroke', '#888')
            .attr('stroke-width', 1)
            .style('shape-rendering', 'crispEdges')
            .style('stroke-opacity', 0);

        horiz.exit()
            .transition()
            .duration(punchcard_duration)
            .style('stroke-opacity', 0)
            .remove();

        horiz.transition()
            .duration(punchcard_duration)
            .attr('x2', maxR * 2 * labelsX.length + yLabelWidth - borderWidth / 2)
            .attr('y1', function(d, i){ return i * maxR * 2 + xLabelHeight })
            .attr('y2', function(d, i){ return i * maxR * 2 + xLabelHeight })
            .style('stroke-opacity', function(d, i){ return i ? 1 : 0 });

        border.transition()
            .duration(punchcard_duration)
            .attr('width', maxR * 2 * labelsX.length)
            .attr('height', maxR * 2 * data.length);

    }
    /* }}} */

    /* Add the version string to the footer {{{ */
    $(".footer").prepend("D3 " + d3.version + " &ndash; Flot " + $.plot.version + " &ndash; ");
    /* }}} */

    jQuery("h2").click(function() {
        jQuery(this).next(".content").slideToggle(500);
        $("#tooltip").hide();
    });
    // jQuery(".heading").click(function() {
        // jQuery(this)
              // .next(".content").slideToggle(500)
              // .siblings(".content").slideUp(500);
        // $("#tooltip").hide();
    // });
});
