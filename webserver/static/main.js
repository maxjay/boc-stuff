var currentData = [];
var voltageData = [];
var tempData = [];
var powerData = [];
var data = ['currentData', 'voltageData', 'tempData', 'powerData'];
var graphs = document.getElementsByClassName('graph');
var datalols = [];
var database = 'lol';
var check = [false,false,false];
var updating;

window.onload = function() {
    disableButton();
    $('.filename').on('input', ':text', function(){ doSomething(); });
    mainChart = new CanvasJS.Chart("mainGraph", { 
        title: {
            text: "BOC_HYMERA_CONTROL"
        },
        axisY: {
            includeZero: false
        },
        legend:{
            cursor: "pointer",
            fontSize: 16,
            itemclick: toggleDataSeries
        },
        toolTip:{
            shared: true
        },
        zoomEnabled: true,
        data: [
            {
                showInLegend: true,
                name: "Stack_Current",
                type: "line",
                xValueType: "dateTime",
                dataPoints: currentData,
            },
            {
                showInLegend: true,
                name: "Stack_Voltage",
                type: "line",
                xValueType: "dateTime",
                dataPoints: voltageData,
            },
            {
                showInLegend: true,
                name: "Temperature",
                type: "line",
                xValueType: "dateTime",
                dataPoints: tempData,
            },
            {
                showInLegend: true,
                name: "Power",
                type: "line",
                xValueType: "dateTime",
                dataPoints: powerData,
            }
        ]
    });
    mainChart.render();
    getDatabases();
    var updateRate = parseInt(document.getElementById('updateRate').value);
    updating = setTimeout(function(){fetchData()}, updateRate * 1000);
}

function toggleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	}
	else{
		e.dataSeries.visible = true;
	}
	mainChart.render();
}

function updateData(data) {
    /*var values = data['results'][0]['series'][0]['values'];
    var columns = data['results'][0]['series'][0]['columns'];
    console.log(currentData);
    for(var i = 0; i < columns.length; i++){
        if (columns[i] == 'current') {
            var currentIndex = i;
        } else if (columns[i] == 'voltage') {
            var voltageIndex = i;
        } else if (columns[i] == 'power') {
            var powerIndex = i;
        } else if (columns[i] == 'temperature') {
            var tempIndex = i;
        } else if (columns[i] == 'time') {
            var timeIndex = i;
        }
    }
    if (currentData.length == values.length) {
        if ((currentData[currentData.length-1]['x'] == values[values.length-1][timeIndex]) && (currentData[0]['x'] == values[0][timeIndex])) {
            console.log('skip');
        } else {
            for (var j = 0; j < values.length; j++) {
                currentData[j] = {x: values[j][timeIndex], y:values[j][currentIndex]}
                voltageData[j]= {x: values[j][timeIndex], y:values[j][voltageIndex]}
                powerData[j] = {x: values[j][timeIndex], y:values[j][powerIndex]}
                tempData[j] ={x: values[j][timeIndex], y:values[j][tempIndex]}
            }
        }
    } else {
        currentData = [];
        voltageData = [];
        powerData = [];
        tempData = [];
        for (var j = 0; j < values.length; j++) {
            currentData.push({x: values[j][timeIndex], y:values[j][currentIndex]})
            voltageData.push({x: values[j][timeIndex], y:values[j][voltageIndex]})
            powerData.push({x: values[j][timeIndex], y:values[j][powerIndex]})
            tempData.push({x: values[j][timeIndex], y:values[j][tempIndex]})
        }
    }*/
    currentData = [];
    voltageData = [];
    powerData = [];
    tempData = [];
    for (var i = 0; i < data.length; i++){
        currentData.push({x: data[i]['time'], y: data[i]['STACK_I']});
        voltageData.push({x: data[i]['time'], y: data[i]['STACK_V']});
        powerData.push({x: data[i]['time'], y: data[i]['OUTPUT_POWER']});
        tempData.push({x: data[i]['time'], y: data[i]['STACK_TEMP']});
    }
    console.log(mainChart.data[0]);
    mainChart.options.data[0].dataPoints = currentData;
    mainChart.options.data[1].dataPoints = voltageData;
    mainChart.options.data[2].dataPoints = powerData;
    mainChart.options.data[3].dataPoints = tempData;
    mainChart.render();
    
}

function fetchData() {
    console.log('FETCHING DATA...');
    $.post("../database", {query: 'SELECT', measurement: database, batchsize: '*'}).done(function(response){
        data = eval(response);
        updateData(data);
    });
    if ($('.updateRate').attr('value') == '') {
        updateRate == 5;
    } else {
        updateRate = parseInt(document.getElementById('updateRate').value);
    }
    console.log('UPDATE RATE VALUE' + document.getElementById('updateRate').value);
    clearTimeout(updating);
    console.log('UPDATE RATE... -> ' + updateRate);
    updating = setTimeout(function(){fetchData()}, updateRate * 1000);
}

function getDatabases() {
    $.post('../database', {query: 'SHOW', measurement: 'None', batchsize: 0}).done(function(response){
        response = eval(response);
        $('.databases')
            .find('option')
            .remove();
        for (var i = 0; i < response.length; i++) {
            $('.databases').append('<option value="'+response[i]+'">'+response[i]+'</option>')
        }
    });
}

function updateDatabase() {
    database = $('.databases')[0].value;
    console.log(database);
    fetchData();
}

function removeDatabase() {
    $.post('../database', {query: 'DROP', measurement: $('.databases')[0].value, batchsize: 0}).done(function(data){
        console.log(data);
    });
    getDatabases();
}

function Call(thing) {
    var Class = thing[0].className;
    if (thing.val() == '') {
        if (Class == 'filename') {
            check[0] = false;
        } else if (Class == 'serial') {
            check[1] = false;
        } else if (Class == 'purpose') {
            check[2] = false;
        }
    } else {
        if (Class == 'filename') {
            check[0] = true;
        } else if (Class == 'serial') {
            check[1] = true;
        } else if (Class == 'purpose') {
            check[2] = true;
        }
    }
    disableButton();
}

function disableButton(){
    if (true == check[0] && check[1] == true && check[2] == true) {
        $('.startConsole').prop('disabled', false);
    } else {
        $('.startConsole').prop('disabled', true);
    }
}

function startConsole(){
    var purpose = $('.purpose').val();
    var model = $('.model').val();
    var serial = $('.serial').val();
    var filename = $('.filename').val();
    $.post("../start", {Purpose: purpose, Model: model, Serial: serial, Filename: filename})
        .done(function(data) {
            console.log( "Data Loaded: " + data );
        });
}