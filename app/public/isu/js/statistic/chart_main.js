'use strict';

$( document ).ready(function() {
    chartLoad();
});

function chartLoad() {
    $.ajax({
        type: "GET",
        async: true,
        url: "/statistic/chartLoad",
        dataType: "json", // xml, html, script, json 미지정시 자동판단
        timeout: 30000,
        cache: false,
        data: {},
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error: function (request, status, error) {
            alert("chartLoad error : " + error);
        },
        beforeSend: function (dataObj) {
        },
        success: function (dataObj) {
            setChartLoad(dataObj);
        }
    });
}

function setChartLoad(dataObj) {
    //alert(JSON.stringify(dataObj));
    //alert(JSON.stringify(dataObj[0]));
    //alert(JSON.stringify(dataObj[1].cntCom));
    //alert(JSON.stringify(dataObj[2]));
    //alert(JSON.stringify(dataObj[3]));

    $('#chartPreYear').html(dataObj[2]._id.register_yyyy + '년');
    $('#chartPreYearCnt').html(dataObj[2].count + '건');
    $('#chartYear').html(dataObj[3]._id.register_yyyy + '년');
    $('#chartYearCnt').html(dataObj[3].count + '건');

    var DrawSparkline = function () {
        $('#sparkline1').sparkline(dataObj[0].cnt1, {
            type: 'line',
            width: $('#sparkline1').width(),
            height: '165',
            chartRangeMax: dataObj[0].cnt3,
            chartRangeMin: 0,
            lineColor: '#3bafda',
            fillColor: 'rgba(59,175,218,0.3)',
            highlightLineColor: 'rgba(0,0,0,.1)',
            highlightSpotColor: 'rgba(0,0,0,.2)',
            tooltipFormat: '{{offset:offset}} {{y:value}}건',
            tooltipValueLookups: {
                'offset': {
                    0: dataObj[2]._id.register_yyyy + '년' + ' 1월 :',
                    1: dataObj[2]._id.register_yyyy + '년' + ' 2월 :',
                    2: dataObj[2]._id.register_yyyy + '년' + ' 3월 :',
                    3: dataObj[2]._id.register_yyyy + '년' + ' 4월 :',
                    4: dataObj[2]._id.register_yyyy + '년' + ' 5월 :',
                    5: dataObj[2]._id.register_yyyy + '년' + ' 6월 :',
                    6: dataObj[2]._id.register_yyyy + '년' + ' 7월 :',
                    7: dataObj[2]._id.register_yyyy + '년' + ' 8월 :',
                    8: dataObj[2]._id.register_yyyy + '년' + ' 9월 :',
                    9: dataObj[2]._id.register_yyyy + '년' + ' 10월 :',
                    10: dataObj[2]._id.register_yyyy + '년' + ' 11월 :',
                    11: dataObj[2]._id.register_yyyy + '년' + ' 12월 :'
                }
            },
        });

        $('#sparkline1').sparkline(dataObj[0].cnt2, {
            type: 'line',
            width: $('#sparkline1').width(),
            height: '165',
            chartRangeMax: dataObj[0].cnt3,
            chartRangeMin: 0,
            lineColor: '#00b19d',
            fillColor: 'rgba(0, 177, 157, 0.3)',
            composite: true,
            highlightLineColor: 'rgba(0,0,0,.1)',
            highlightSpotColor: 'rgba(0,0,0,.2)',
            tooltipFormat: '{{offset:offset}} {{y:value}}건',
            tooltipValueLookups: {
                'offset': {
                    0: dataObj[3]._id.register_yyyy + '년' + ' 1월 :',
                    1: dataObj[3]._id.register_yyyy + '년' + ' 2월 :',
                    2: dataObj[3]._id.register_yyyy + '년' + ' 3월 :',
                    3: dataObj[3]._id.register_yyyy + '년' + ' 4월 :',
                    4: dataObj[3]._id.register_yyyy + '년' + ' 5월 :',
                    5: dataObj[3]._id.register_yyyy + '년' + ' 6월 :',
                    6: dataObj[3]._id.register_yyyy + '년' + ' 7월 :',
                    7: dataObj[3]._id.register_yyyy + '년' + ' 8월 :',
                    8: dataObj[3]._id.register_yyyy + '년' + ' 9월 :',
                    9: dataObj[3]._id.register_yyyy + '년' + ' 10월 :',
                    10: dataObj[3]._id.register_yyyy + '년' + ' 11월 :',
                    11: dataObj[3]._id.register_yyyy + '년' + ' 12월 :'
                }
            },
        });
    };

    DrawSparkline();

    var resizeChart;

    $(window).resize(function (e) {
        clearTimeout(resizeChart);
        resizeChart = setTimeout(function () {
            DrawSparkline();
        }, 300);
    });
}