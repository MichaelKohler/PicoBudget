$(document).ready(function() {
  drawSpendingPerDayChart();
  drawEarningPerDayChart();
  drawSpendingTagChart();
  drawEarningTagChart();

  function drawSpendingPerDayChart() {
    $.ajax({
      url: "/getMonthSpendingTransactions"
    }).done(function(data) {
      var datapoints = data.sums.map(function (item) { return item.amount; });
      $('#spendingperdaycontainer').highcharts({
        title: {
          text: 'Spending per day',
          x: -20 //center
        },
        xAxis: {
          categories: data.categories
        },
        yAxis: {
          title: {
            text: 'Amount'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle',
          borderWidth: 0
        },
        series: [{
          name: 'Spending',
          data: datapoints
        }]
      });
    });
  }

  function drawEarningPerDayChart() {
    $.ajax({
      url: "/getMonthEarningTransactions"
    }).done(function(data) {
      var datapoints = data.sums.map(function (item) { return item.amount; });
      $('#earningperdaycontainer').highcharts({
        title: {
          text: 'Earning per day',
          x: -20 //center
        },
        xAxis: {
          categories: data.categories
        },
        yAxis: {
          title: {
            text: 'Amount'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#00bbaa'
          }]
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle',
          borderWidth: 0
        },
        series: [{
          name: 'Earning',
          data: datapoints
        }]
      });
    });
  }

  function drawSpendingTagChart() {
    $.ajax({
      url: "/getTagSums"
    }).done(function(data) {
      var realDatapoints = data.tags.filter(function (item) { return item.type == '-'; });
      var datapoints = realDatapoints.map(function (item) { return [item.name, item.current] });
      $('#spendingtagcontainer').highcharts({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'Spending amount per tag'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          }
        },
        series: [{
          type: 'pie',
          name: 'Tags',
          data: datapoints
        }]
      });
    });
  }

  function drawEarningTagChart() {
    $.ajax({
      url: "/getTagSums"
    }).done(function (data) {
      var realDatapoints = data.tags.filter(function (item) {
        return item.type == '+';
      });
      var datapoints = realDatapoints.map(function (item) {
        return [item.name, item.current]
      });
      $('#earningtagcontainer').highcharts({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
        },
        title: {
          text: 'Earning amount per tag'
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              style: {
                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
              }
            }
          }
        },
        series: [
          {
            type: 'pie',
            name: 'Tags',
            data: datapoints
          }
        ]
      });
    });
  }
});