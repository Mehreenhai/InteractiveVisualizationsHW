
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
    //  console.log(element);
    });

}

function getOTUs() {
    return fetch('/otu').then(function(response) { return response.json();})
        .then(function(data) {
            return data;
        });
}

function makePie() {
var default_url = "/samples/BB_940";
Plotly.d3.json(default_url, function(error, response) {
    if (error) return console.warn(error);
    console.log(response);
    var otus = getOTUs();
    var ids = response[0]['otu_ids'];
    var values = response[0]['sample_values'];
    var hovers = [];
    for (var i = 0; i < ids.length; i++) {
        hovers.push(otus[ids[i]]);
    }
    var data = [{
        values: values,
        labels: ids,
        type: 'pie',
    }];
    var layout = {
        height: 400,
        width: 500
    };
      
    Plotly.plot("pie", data, layout)
})
}

// // Update the plot with new data
// function updatePlotly(newdata) {
//     var Bar = document.getElementById('bar');
//     Plotly.restyle(Pie, 'x', [newdata.sample_values])
//     // Plotly.restyle(Bar, 'y', [newdata.y])
// }

// // Get new data whenever the dropdown selection changes
// function optionChanged(route) {
//     console.log(route);
//     Plotly.d3.json(`/${route}`, function(error, data) {
//         console.log("newdata", data);
//         updatePlotly(data);
//     });
// }



buildPlot();
makePie();