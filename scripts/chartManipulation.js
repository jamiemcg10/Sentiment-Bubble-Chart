document.addEventListener("Data Loaded", function(event){
    var selectedDatasetName = document.getElementById('dataset-select');
    var selectedDatasetTitle = document.querySelector('option[value="' + selectedDatasetName.value + '"]').innerHTML;
    var cropStartBtn = document.getElementById('crop-start-btn');
    var cropEndBtn = document.getElementById('crop-end-btn');
    var showComments = document.getElementById('showComments');
    var shownCommentData = [];

    filterData();

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
                                            yAxisID: 'sentiment-axis'
                                        },
                                        {
                                            label:"negative",
                                            data: negativeSelectedData,
                                            backgroundColor: "rgb(190,0,0)",
                                            hoverBackgroundColor: "rgb(171,171,171)",
                                            hoverBorderColor: "rgb(190,0,0)",
                                            yAxisID: 'sentiment-axis'
                                        },
                                        {
                                            data: shownCommentData,
                                            yAxisID: 'comment-axis',
                                            type: 'line',
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
                                                var content = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].comment !== undefined ? data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].comment : data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].y;
                                                var label = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].x.toLocaleTimeString('en-GB') + ' - ' + content;
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
                                            id: 'sentiment-axis',
                                            scaleLabel: {
                                                display: true,
                                                labelString: "Sentiment",
                                                fontStyle: 'bold',
                                            },
                                            ticks: {                                                
                                                fontStyle: 'bold',
                                            }
                                        },{
                                            id: 'comment-axis',
                                            position: 'right',
                                            scaleLabel: {
                                                display: true,
                                                labelString: '# of comments',
                                                fontStyle: 'bold',
                                            },
                                            ticks: {                                                
                                                fontStyle: 'bold',
                                                min: 0,
                                                stepSize: 1,
                                            },
                                            display: false,   
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
            selectedCommentData = commentData.filter(function(dPoint){
                return dPoint.video === selectedDatasetName.value & dPoint.x >= axisMin & (dPoint.x <= axisMax || axisMax === undefined);
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
                selectedCommentData = commentData.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & (dPoint.x >= axisMin || axisMin === undefined);
                });
            } else{
                axisMax = new Date(2000, 0, 1, h, m, s);
                positiveSelectedData = data.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.y >= 0 & dPoint.x <= axisMax & (dPoint.x >= axisMin || axisMin === undefined);
                });
                negativeSelectedData = data.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.y < 0 & dPoint.x <= axisMax & (dPoint.x >= axisMin || axisMin === undefined);
                });
                selectedCommentData = commentData.filter(function(dPoint){
                    return dPoint.video === selectedDatasetName.value & dPoint.x <= axisMax & (dPoint.x >= axisMin || axisMin === undefined);
                });
            }
        }

        selectedCommentData = insertMissingTimes(selectedCommentData);

        if (positiveSelectedData.length !== 0 | negativeSelectedData.length !== 0){
            
            chart.options.scales.xAxes[0].ticks.min = axisMin;
            chart.options.scales.xAxes[0].ticks.max = axisMax;
            chart.options.scales.yAxes[1].ticks.max = undefined;

            chart.data.datasets[0].data = positiveSelectedData;
            chart.data.datasets[1].data = negativeSelectedData;
            chart.data.datasets[2].data = showComments.checked ? selectedCommentData : [];

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

    function filterData(){
        positiveSelectedData = data.filter(function(dPoint){
            return dPoint.video === selectedDatasetName.value & dPoint.y >= 0;
        });
        negativeSelectedData = data.filter(function(dPoint){
            return dPoint.video === selectedDatasetName.value & dPoint.y < 0;
        });
        selectedCommentData = commentData.filter(function(dPoint){
            return dPoint.video === selectedDatasetName.value;
        });

        selectedCommentData = insertMissingTimes(selectedCommentData);
        
    }

    function insertMissingTimes(array){
        var fullArray = [];
        var start;
        if (new Date(2000, 0, 1, 0, 0, 0) < array[0].x){
            // do something if first entry isn't 0
            fullArray.push({x: new Date(2000, 0, 1, 0, 0, 0), y: 0, video: array[0].video});
            start=0;
        } else {
            fullArray.push(array[0]);
            start=1;
        }
        for (var i=start; i<array.length; i++){
            while (array[i].x - fullArray[fullArray.length-1].x > 5000){
                fullArray.push({x: new Date(fullArray[fullArray.length-1].x.getTime() + 5000), y: 0, video: array[i].video});
            } 
            
            fullArray.push(array[i]);
            
        }

        return fullArray;
    }

    selectedDatasetName.addEventListener("change", function(){
        filterData();

        chart.data.datasets[0].data = positiveSelectedData;
        chart.data.datasets[1].data = negativeSelectedData;
        chart.data.datasets[2].data = showComments.checked ? selectedCommentData : [];

        
        selectedDatasetTitle = document.querySelector("option[value='" + selectedDatasetName.value + "']").innerHTML;
        chart.options.title.text = selectedDatasetTitle + " Sentiment";

        chart.options.scales.xAxes[0].ticks.min = undefined;
        chart.options.scales.xAxes[0].ticks.max = undefined;
        
        chart.update();
    });

    showComments.addEventListener("change", function(){
        console.log(showComments.checked);
        if (showComments.checked){            
            chart.data.datasets[2].data = selectedCommentData;
            chart.options.scales.yAxes[1].display = true;
        } else {
            chart.data.datasets[2].data = [];
            chart.options.scales.yAxes[1].display = false;
        }

        console.log(selectedCommentData);
        chart.options.scales.yAxes[1].ticks.max = undefined;
        chart.update();
    });



});