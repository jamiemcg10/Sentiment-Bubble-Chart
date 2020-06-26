document.addEventListener("Data Loaded", function(){
                
    var selectedDatasetName = document.getElementById('dataset-select');
    var selectedDatasetTitle = document.querySelector('option[value="' + selectedDatasetName.value + '"]').innerHTML;
    var cropStartBtn = document.getElementById('crop-start-btn');
    var cropEndBtn = document.getElementById('crop-end-btn');

    var positiveSelectedData = data.filter(function(dPoint){
        return dPoint.video === selectedDatasetName.value & dPoint.y >= 0;
    });

    var negativeSelectedData = data.filter(function(dPoint){
        return dPoint.video === selectedDatasetName.value & dPoint.y < 0;
    });

    var axisMin;
    var axisMax;

    var ctx = document.getElementById('myChart');
    var chart = new Chart(ctx,{type:"bubble",
                                data:  {
                                    datasets:[
                                        {
                                            label:"positive",
                                            data: positiveSelectedData,
                                            backgroundColor: "rgb(0,67,107)",
                                            hoverBackgroundColor: "rgb(171,171,171)",
                                            hoverBorderColor: "rgb(0,67,107)",
                                        },
                                        {
                                            label:"negative",
                                            data: negativeSelectedData,
                                            backgroundColor: "rgb(190,0,0)",
                                            hoverBackgroundColor: "rgb(171,171,171)",
                                            hoverBorderColor: "rgb(190,0,0)",
                                        }
                                    ]
                                },
                                options: {
                                    showAllTooltips: true,
                                    title: {
                                        display: true,
                                        text: selectedDatasetTitle + ' Sentiment',
                                        fontSize: 24,
                                    },
                                    tooltips: {
                                        enabled: true,
                                        intersect: true,
                                        position: "nearest",
                                        callbacks: {
                                            label: function(tooltipItem, data){
                                                var label = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x.toLocaleTimeString('en-GB') + ' - ' + data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].comment;
                                                return label;
                                            }
                                        }
                                    },
                                    legend: {
                                        display: false,
                                    },
                                    layout: {
                                        padding: {
                                            left: 25,
                                            right: 25,
                                            top: 25
                                        }
                                    },
                                    scales: {
                                        xAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Time",
                                                fontStyle: 'bold',
                                            },
                                            type: 'time',
                                            time: {
                                                tooltipFormat: "HH:mm:ss",
                                                displayFormats: {
                                                    millisecond: 'HH:mm:ss',
                                                    second: 'HH:mm:ss',
                                                    minute: 'HH:mm:ss',
                                                    hour: 'HH:mm:ss',
                                                    year: 'HH:mm:ss',
                                                },
                                            },
                                            ticks: {
                                                maxRotation: 50,
                                                autoSkipPadding: 15,
                                                fontStyle: 'bold',
                                            }
                                        }],
                                        yAxes: [{
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Sentiment",
                                                fontStyle: 'bold',
                                            },
                                            ticks: {                                                
                                                fontStyle: 'bold',
                                            }
                                        }]
                                    }
                                }                                             
                            });     
                            


    function generateBackgroundColors(data){
        var arr = [];
        data.forEach(function(point){
            if (point.y < 0){
                arr.push("rgb(190,0,0)");
            } else {
                arr.push("rgb(0,67,107)");
            }
        });
        return arr;
    }



    function cropData(event,direction,h,m,s,reset){
        var tempAxisMin = axisMin;
        var tempAxisMax = axisMax;

        if (direction === "start"){
            axisMin = new Date(2000, 0, 1, h, m, s);
            positiveSelectedData = data.filter(function(dPoint){
                return dPoint.video === selectedDatasetName.value & dPoint.y >= 0 & dPoint.x >= axisMin & (dPoint.x <= axisMax || axisMax === undefined);
            });
            negativeSelectedData = data.filter(function(dPoint){
                return dPoint.video === selectedDatasetName.value & dPoint.y < 0 & dPoint.x >= axisMin & (dPoint.x <= axisMax || axisMax === undefined);
            });
        } else if (direction === "end"){
            if (reset){
                axisMax = undefined;
                positiveSelectedData = data.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.y >= 0 & (dPoint.x >= axisMin || axisMin === undefined);
                });
                negativeSelectedData = data.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.y < 0 & (dPoint.x >= axisMin || axisMin === undefined);
                });
            } else{
                axisMax = new Date(2000, 0, 1, h, m, s);
                positiveSelectedData = data.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.y >= 0 & dPoint.x <= axisMax & (dPoint.x >= axisMin || axisMin === undefined);
                });
                negativeSelectedData = data.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.y < 0 & dPoint.x <= axisMax & (dPoint.x >= axisMin || axisMin === undefined);
                });
            }
        }

        if (positiveSelectedData.length !== 0 | negativeSelectedData.length !== 0){
            
            chart.options.scales.xAxes[0].ticks.min = axisMin;
            chart.options.scales.xAxes[0].ticks.max = axisMax;

            chart.data.datasets[0].data = positiveSelectedData;
            chart.data.datasets[1].data = negativeSelectedData;

            chart.update();
        } else {
            axisMin = tempAxisMin;
            axisMax = tempAxisMax;
        }

    }

    cropStartBtn.addEventListener("click", function(){
        var h = document.getElementById('hStart').value;
        var m = document.getElementById('mStart').value;
        var s = document.getElementById('sStart').value;

        if (h === "") {
            h = 0;
        }

        if (m === "") {
            m = 0;
        }

        if (s === "") {
            s = 0;
        }

        if (chart.options.scales.xAxes[0].ticks.max !== undefined & chart.options.scales.xAxes[0].ticks.max <= new Date(2000, 0, 1, h, m, s)){
            event.preventDefault();
        } else {
            cropData(event,"start",h,m,s);
        }

        document.getElementById('hStart').value = '';
        document.getElementById('mStart').value = '';
        document.getElementById('sStart').value = '';

    });
    
    cropEndBtn.addEventListener("click", function(event){
        var h = document.getElementById('hEnd').value;
        var m = document.getElementById('mEnd').value;
        var s = document.getElementById('sEnd').value;

        if (h === "" & m === "" & s === ""){
            cropData(event,"end",h,m,s,"resetEnd");
        } else if (chart.options.scales.xAxes[0].ticks.min !== undefined & chart.options.scales.xAxes[0].ticks.min >= new Date(2000, 0, 1, h, m, s)){
            event.preventDefault();
        } else {
            cropData(event,"end",h,m,s);
        }

        document.getElementById('hEnd').value = '';
        document.getElementById('mEnd').value = '';
        document.getElementById('sEnd').value = '';

    });

    selectedDatasetName.addEventListener("change", function(){
        positiveSelectedData = data.filter(function(dPoint){
            return dPoint.video === selectedDatasetName.value & dPoint.y >= 0;
        });
        negativeSelectedData = data.filter(function(dPoint){
            return dPoint.video === selectedDatasetName.value & dPoint.y < 0;
        });

        chart.data.datasets[0].data = positiveSelectedData;
        chart.data.datasets[1].data = negativeSelectedData;

        
        selectedDatasetTitle = document.querySelector("option[value='" + selectedDatasetName.value + "']").innerHTML;
        chart.options.title.text = selectedDatasetTitle + " Sentiment";

        chart.options.scales.xAxes[0].ticks.min = undefined;
        chart.options.scales.xAxes[0].ticks.max = undefined;
        
        chart.update();
    });


});