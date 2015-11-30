
// The previous implementations relied on external frameworks to do the work. 
// It seems TypeCooker tends to outlive these frameworks. This makes maintenance
// a bit more difficult. So instead, for this implementation, let's use only
// canonical javascript. http://youmightnotneedjquery.com

//Copyright (c) 2015, Erik van Blokland
//All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:

// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.

// stuff
var parametersURL = "parameters.json";
var selectionLevel = 1;
var currentExplained = null;
var data = {};
var current = {}; // holds the generated parameter - value pairs

// explain text
var explainText = "Hi! If you don&rsquo;t know what kind of letters to draw, TypeCooker can give you some ideas. Try to match as many parameters as you can.<br><a id=\"twitter\" target=\"_new\" href=\"https://twitter.com/typecooker\">@typecooker</a>";
var explainOpen = false;

// load the parameters
var request = new XMLHttpRequest();
request.open('GET', parametersURL, true);
var parameterData = {};
var selectionLevel = 2;
var titleYellow = "#ffc400";

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    parameterData = JSON.parse(request.responseText);
    console.log('succes!', parameterData);
    selectionLevel = getParameterByName('level');
    console.log('selectionLevel', selectionLevel);
    if(selectionLevel==null){
    	selectionLevel=2;
    }
	el = document.getElementById("level"+selectionLevel);
	if (el.classList) {
		el.classList.add('selected');
	} else {
  		el.className += ' ' + 'selected';
	}

	// if there is a hash fragment present in the url, rebuild the interface state
	// to match the options provided
	// else generate a new ranomd set of options
	if (window.location.hash) {
		var options = buildObjFromHash(window.location.hash);
		// "update" share link in the footer to match the current options
		var shareLink = window.location.href + window.location.hash;
    	document.getElementById("share-link").setAttribute("href", shareLink);
		makeFromObject(options, parameterData);

		// then remove the hash form the url, so that a user that came via
		// a set link can still generate new sets
		window.location.hash = "";
	} else {
    	makeSelection(selectionLevel, parameterData);
    }
  } else {
    // We reached our target server, but it returned an error
	  console.log("error loading", parametersURL);
  }
};
request.onerror = function() {
  // There was a connection error of some sort
  console.log("can't load", parametersURL);
};

// send the request
request.send();

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

//http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? 2 : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function buildObjFromHash(hash) {
	// replace any possible starting # sign
	hash = hash.replace(/^#/, ""); 

	// iterate though all & seperated paramater - value pairs
	var parts = hash.split("&"); 
	var obj = {};
	for (part in parts) {
		var components = parts[part].split("=");
		obj[decodeURIComponent(components[0])] = decodeURIComponent(components[1]);
	}
	return obj;
}

function buildHashFromObj(obj) {
	var hash = "";
	for (property in obj) {
		hash += "&" + encodeURIComponent(property) + "=" + encodeURIComponent(obj[property])
	}
	hash = hash.substring(1); // remove that first &
	return hash;
}

// build parameter unit
var buildParameter = function(parameterName){
	// build the structure for the parameter, but without any contents. 
	var t = "";
	var parameterNameAsClass = parameterName.replace(/\s+/g, '');
	var parameterExplainAsClass = parameterNameAsClass+"explain";
	var parameterChoiceAsClass = parameterNameAsClass+"choice";
	t += "<div class=\"container\">";
	t += "<div class=\"entry\" id=\""+parameterNameAsClass+"\">"+"</div>";
	t += "<div class=\"choice\" id=\""+parameterChoiceAsClass+"\">"+"</div>";
	t += "</div>";
	t += "<div class=\"explain\" id=\""+parameterExplainAsClass+"\">"+"</div>";
	//console.log("t", t);
	return t;
}

// show
var explainParameter = function(parameterName){
	console.log('--> explain', parameterName);
	if(currentExplained){
		// we have a previous choice
		document.getElementById(currentExplained+"explain").style.display = "none";
		document.getElementById(currentExplained).style.backgroundColor = titleYellow;
		document.getElementById(currentExplained+"choice").style.backgroundColor = "inherit";
		document.getElementById(currentExplained+"choice").style.color = "black";
		if(currentExplained==parameterName){
			currentExplained = null;
			return;
		}
	}
	document.getElementById(parameterName+"explain").style.display = "block";
	document.getElementById(parameterName+"explain").style.backgroundColor = "black";
	document.getElementById(parameterName+"choice").style.backgroundColor = "black";
	document.getElementById(parameterName+"choice").style.color = titleYellow;
	document.getElementById(parameterName).style.backgroundColor = "black";
	currentExplained = parameterName;
	console.log("done with", currentExplained);
}

// show explanation
var showExplain = function(){
	if(explainOpen){
		document.getElementById("explain").innerHTML = "";
		explainOpen = false;
	} else {
		document.getElementById("explain").innerHTML = explainText;
		explainOpen = true;
	}
}


// build the "recipe" html for all parameterNames
var buildRecipe = function (parameterNames) {
	for(var i=0;i<parameterNames.length;i++){
		document.getElementById("recipe").innerHTML += buildParameter(parameterNames[i]);	    	
    }
}

// build the html for passed parameter
var buildSelection = function(selection, thisName) {	
	var d = "No description for "+thisName;
	if(selection.description!=undefined){
    	d = selection.description;
	}
	var parameterNameAsClass = thisName.replace(/\s+/g, '');
	var el = document.getElementById(parameterNameAsClass);
	var nameCode = "explainParameter(\'"+parameterNameAsClass+"\');";
	var thisNameLink = "<a href=\"#\" onclick=\""+nameCode+"\">"+thisName+"</a>";
	el.innerHTML = thisNameLink+el.innerHTML;	    	
	document.getElementById(parameterNameAsClass+"choice").innerHTML = selection.name;	    	
	document.getElementById(parameterNameAsClass+"explain").innerHTML = d;
}

// got passed a hash on load, build the selection from an object and the passed
// in json data
var makeFromObject = function (obj, data) {
	var parameterNames = [];
	for(var key in data){
		parameterNames.push(key);
	}
 	buildRecipe(parameterNames);

 	// remove the "keys" array form the json data to avoid having it
 	// included as a new parameter listed as selected
 	data.keys = undefined;

 	// since the obj only contains the "name" value of the actual data
 	// let's make an object that has all the data from the json
 	var objectFromJson = obj;
 	for (param in data) {
 		for (index in data[param]) {
 			if (data[param][index]["name"] == obj[param]) {
 				objectFromJson[param] = data[param][index];
 			}
 		}
 	}

 	// build the actual html for each parameter
	for (parameter in objectFromJson) {
		buildSelection(objectFromJson[parameter], parameter);
	}
}

// json loaded and no url has provided, make a new randomized selection
var makeSelection = function(level, data){
	var selectedItems = [];
	var parameterNames = [];
	for(var key in data){
		parameterNames.push(key);
	}	

    parameterNames = shuffle(parameterNames);
 	buildRecipe(parameterNames);

 	for(var i=0;i<parameterNames.length;i++){
 		var thisName = parameterNames[i];
 		var optionsForThisName = [];
        var obj = data[thisName];
        var levelOK = true;
        for(var j=0;j<obj.length;j++){
        	var b = obj[j];
        	if(b.level>level){
        		// above our pay grade, skip.
        		continue;
        	}
        	for(var t=0;t<=b.weight;t++){
        		// add this option according to weight
	        	optionsForThisName.push(b);
        	}
        }
        if(optionsForThisName.length>0){
	    	var selection = optionsForThisName[Math.floor(Math.random()*optionsForThisName.length)];
	    	buildSelection(selection, thisName);
	    	current[thisName] = selection.name;
        }
    }
    // update the footer share link to match the current options
    // remove and hash that might or might not have been in the location
    var shareLink = window.location.href.replace(/#$/, "") + "#" + buildHashFromObj(current);
    document.getElementById("share-link").setAttribute("href", shareLink);
}
// thank you for your attention. Now go draw something.