
function buildPlot() {
    var element = document.getElementById("selDataset");
    
    var url = '/names';    
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(data) {
        var list = []
        for (i = 0; i < data.length; i++) { 
            var newOption = document.createElement("option"); 
            var t = document.createTextNode(data[i]);      
            newOption.appendChild(t); 
            newOption.setAttribute('value', data[i]);
            
            element.appendChild(newOption);
        }
    });

}

function getOTUs() {
    return fetch('/otu').then(function(response) { return response.json();})
        .then(function(data) {
            return data;
        });
}


function getPieData(response) {
    var otus = getOTUs();
    var ids = response[0]['otu_ids'];
    pie_ids = ids.slice(0,10);
    var values = response[0]['sample_values'];
    pie_values = values.slice(0,10);
    var hovers = [];
    for (var i = 0; i < pie_ids.length; i++) {
        hovers.push(otus[ids[i]]);
    }
    var data = [{
        values: pie_values,
        labels: pie_ids,
        type: 'pie',
    }];
    return data;
}

function getMetaData(id) {
    id = id
    return fetch('/metadata/'+id).then(function(response) { return response.json();})
        .then(function(data) {
            var element = document.getElementById("text_box");
            element.innerHTML = '';
            var text = document.createElement("ul");

            var age = document.createElement("li");
            age.textContent = "Age: " + data['AGE'];

            var bbtype = document.createElement("li");
            bbtype.textContent = "BBType: " + data['BBTYPE'];

            var ethnicity = document.createElement("li");
            ethnicity.textContent = "Ethnicity: " + data['ETHNICITY'];

            var gender = document.createElement("li");
            gender.textContent = "Gender: " + data['GENDER'];

            var location = document.createElement("li");
            location.textContent = "Location: " + data['LOCATION'];

            var sampleid = document.createElement("li");
            sampleid.textContent = "SampleID: " + data['SAMPLEID'];

            text.appendChild(age)
            text.appendChild(bbtype)
            text.appendChild(ethnicity)
            text.appendChild(gender)
            text.appendChild(location)            
            text.appendChild(sampleid)
            
            // console.log(data['AGE'])
        ;
            
            element.appendChild(text);
            console.log(element);
            
        });
}

function metaTable() {
    id = "BB_940"
    var data = getMetaData(id);   
}



function makePie() {
    var default_url = "/samples/BB_940";
    Plotly.d3.json(default_url, function(error, response) {
        if (error) return console.warn(error);
        console.log(response);
        var data = getPieData(response);
        var layout = {
            height: 600,
            width: 600
        };
        
        Plotly.plot("pie", data, layout)
    })
}

function getBubbleData(response) {
    var otus = getOTUs();
    var ids = response[0]['otu_ids'];
    var values = response[0]['sample_values'];
    var hovers = [];
    for (var i = 0; i < ids.length; i++) {
        hovers.push(otus[ids[i]]);
    }

    var trace1 = {
        x: ids,
        y: values,
        mode: 'markers',
        marker: {
        size: values,
        color: ids
        }
    };
    
    var data = [trace1];
    return data;
}

function bubbleUp() {
    var default_url = "/samples/BB_940";

    Plotly.d3.json(default_url, function(error, response) {
        if (error) return console.warn(error);
        console.log(response);
        var data = getBubbleData(response);
        
        var layout = {
            title: 'Sample Values by OTU ID',
            showlegend: false,
            height: 600,
            width: 1200
        };
        
        Plotly.newPlot('bubble', data, layout);
    })
}



// Update the plot with new data
function updatePlotly(response) {
    var Bubble = document.getElementById('bubble');
    var newdata = getBubbleData(response);
    console.log(newdata);
    Plotly.deleteTraces(
        Bubble,
        0
    )
    Plotly.addTraces(
        Bubble,
        newdata[0],
    )

    var Pie = document.getElementById('pie');
    var newdata = getPieData(response);
    console.log(newdata);
    Plotly.deleteTraces(
        Pie,
        0
    )
    Plotly.addTraces(
        Pie,
        newdata[0],
    )

}

// Get new data whenever the dropdown selection changes
function optionChanged(route) {
    console.log(route);
    getMetaData(route);
    Plotly.d3.json(`/samples/${route}`, function(error, response) {
        console.log("newdata", response);
        updatePlotly(response);
    });
}



buildPlot();
makePie();
bubbleUp();
metaTable();