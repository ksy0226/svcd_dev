$(function() {

    Morris.Area({
        element: 'morris-area-chart',
        data: [{
            period: '2015 Q1',
            test1: 66,
            test2: 47
        }, {
            period: '2015 Q2',
            test1: 78,
            test2: 41
        }, {
            period: '2015 Q3',
            test1: 12,
            test2: 21
        }, {
            period: '2015 Q4',
            test1: 67,
            test2: 89
        }, {
            period: '2016 Q1',
            test1: 68,
            test2: 93
        }, {
            period: '2016 Q2',
            test1: 70,
            test2: 81
        }, {
            period: '2016 Q3',
            test1: 20,
            test2: 15
        }, {
            period: '2016 Q4',
            test1: 73,
            test2: 75
        }, {
            period: '2017 Q1',
            test1: 87,
            test2: 80
        }, {
            period: '2017 Q2',
            test1: 84,
            test2: 91
        }],
        xkey: 'period',
        ykeys: ['test1', 'test2'],
        labels: ['test1', 'test2'],
        pointSize: 1,
        hideHover: 'auto',
        resize: true
    });

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '요청/처리',
            a: 75,
            b: 65
        }, {
            y: '처리기간',
            a: 100,
            b: 90
        }, {
            y: '응답율',
            a: 100,
            b: 90
        }, {
            y: '만족율',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Series A', 'Series B'],
        hideHover: 'auto',
        resize: true
    });
    
});
