/**
 * @author PDufrene
 */
var GUID = new Array();
var xhrVariable = createXMLHttpRequest();

function getTypeID(type){
    for (var index = 0; index < availableTypes.length; index++) {
        if (availableTypes[index][0] == type) 
            return availableFormats[index][1];
    }
    return '-';
}

function getFormatID(format){
    for (var index = 0; index < availableFormats.length; index++) {
        if (availableFormats[index][0] == format) 
            return availableFormats[index][1];
    }
    return '-';
}

function getDefaultFormatID(typeID){
    for (var index = 0; index < availableTypes.length; index++) {
        if (availableTypes[index][1] == typeID) 
            return availableTypes[index][2];
    }
    return '-';
}

function getVariableIndex(array, name){
    if (array == undefined ) return -1;
    for (var index = 0; index < array.length; index++) {
        if (array[index][0] == name) 
            return index;
    }
    return -1;
}

//This function search for all variable in array from srcArray
//and build the request to send to the server
function buildRequest(array, availableArray, formatArray){
    var request = '';
    for (var i = 0; i < array.length; i++) {
        var index = getVariableIndex(availableArray, array[i])
        if (index != -1) {
            if ( (formatArray == undefined) || (formatArray[i] == null) )
                request += availableArray[index][2] + ';' + availableArray[index][1] + ';' + getDefaultFormatID(availableArray[index][1]) + ';';
            else
                request += availableArray[index][2] + ';' + availableArray[index][1] + ';' + formatArray[i] + ';';
        }
        else 
            request += '-;'
    }
    return request;
}

//This function creates a list on the server and returns the ID of this list
function buildList(request){
    var xhrVariable = createXMLHttpRequest();
    xhrVariable.open("POST", "/plcExchange/buildList/", false);
    xhrVariable.setRequestHeader("Content-length", request.length);
    xhrVariable.send(request);
    if (xhrVariable.readyState == 4 && xhrVariable.status == 200) {
        return xhrVariable.responseText;
    }
    else if (xhrVariable.readyState == 4 && xhrVariable.status == 410) {
        window.top.location.replace('/login.htm');
    }
    return 0;
}

//This function retrieve values of variable as specified in request
function getValues(request){
    var xhrVariable = createXMLHttpRequest();
    xhrVariable.open("POST", "/plcExchange/getValues/", false);
    for (var g in GUID) {
        xhrVariable.setRequestHeader('GUID_' + g, GUID[g]);
    }
    xhrVariable.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    xhrVariable.send(request);
    if (xhrVariable.readyState == 4 && xhrVariable.status == 200) {
        return xhrVariable.responseText;
	}
    else if (xhrVariable.readyState == 4 && xhrVariable.status == 410) {
        window.top.location.replace('/login.htm');
    }
	else {
	
	}
    return '-;'
}

//This function retrieve values of variable as specified in request
//And call back the specified function when finished
function getValuesAsync(request, callback){
    var xhrVariable = createXMLHttpRequest();
    xhrVariable.open("POST", "/plcExchange/getValues/", true);
    xhrVariable.onload = callback;
    for (var g in GUID) {
        xhrVariable.setRequestHeader("GUID_" + g, GUID[g]);
    }
    xhrVariable.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    xhrVariable.send(request);
}

//This function retrieve valued of variable in list identified by ListID
function refreshValues(ListID){
    var xhrVariable = createXMLHttpRequest();
    xhrVariable.open("GET", "/plcExchange/getValues/", false);
    xhrVariable.setRequestHeader("ListID", ListID);
    for (var g in GUID) {
        xhrVariable.setRequestHeader("GUID_" + g, GUID[g]);
    }
     try {
         xhrVariable.send(null);
    } catch(e) {
	  Ext.Msg.alert("M241/M251", "Communication error" );
	  return;
	}    
    if (xhrVariable.readyState == 4 && xhrVariable.status == 200) {
        return xhrVariable.responseText;
    }
    else if (xhrVariable.readyState == 4 && xhrVariable.status == 410) {
        window.top.location.replace('/login.htm');
    }
    return "-;";
}
function refreshValues(ListID){
    var xhrVariable = createXMLHttpRequest();
    xhrVariable.open("GET", "/plcExchange/getValues/", false);
    xhrVariable.setRequestHeader("ListID", ListID);
    for (var g in GUID) {
        xhrVariable.setRequestHeader("GUID_" + g, GUID[g]);
    }
     try {
         xhrVariable.send(null);
    } catch(e) {
	  Ext.Msg.alert("M241/M251", "Communication error" );
	  return;
	}    
    if (xhrVariable.readyState == 4 && xhrVariable.status == 200) {
        return xhrVariable.responseText;
    }
    else if (xhrVariable.readyState == 4 && xhrVariable.status == 410) {
        window.top.location.replace('/login.htm');
    }
    return "-;";
}

//This function retrive the value of a variable 
function getRTValue( variableName, format ) {
    var index = -1;
    var request = '';
    var variableAddr = '';
    var variableType = '';
    var variableFormat = '';
    var values = new Array();
    
    if ( typeof(availableVariables) != "undefined" )
        index = getVariableIndex( availableVariables, variableName );
    if ( index != -1 ) {
        variableAddr = availableVariables[index][2];
        variableType = availableVariables[index][1];
        if ( format == undefined )
            variableFormat = getDefaultFormatID( variableType );
        else
            variableFormat = format;
    } else {
        if ( typeof(availableSystems) != "undefined" )
          index = getVariableIndex( availableSystems, variableName );
        if ( index != -1 ) {
            variableAddr = availableSystems[index][2];
            variableType = availableSystems[index][1];
            if ( format == undefined )
                variableFormat = getDefaultFormatID( variableType );
            else
                variableFormat = format;
        }
    }
    if ( index != -1 ) {
        request = variableAddr + ';' + variableType + ';' + variableFormat + ';' ;
        var xhrVariable = createXMLHttpRequest();
        xhrVariable.open("POST", "/plcExchange/getValues/", false);
        for (var g in GUID) {
            xhrVariable.setRequestHeader('GUID_' + g, GUID[g]);
        }
        xhrVariable.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhrVariable.send(request);
        if (xhrVariable.readyState == 4 && xhrVariable.status == 200) {
            values = xhrVariable.responseText.split(';');
            if ( variableType == 's' ) {
                return unescape( values[0] );
            } else {
                return values[0];
            }
        }        
        else if (xhrVariable.readyState == 4 && xhrVariable.status == 410) {
            window.top.location.replace('/login.htm');
        }
    }
    return '-';
}

function setRTValue( variableName, format, value ) {
    var index = -1;
    var request = '';
    var variableAddr = '';
    var variableType = '';
    var variableFormat = '';
    
    index = getVariableIndex( availableVariables, variableName );
    if ( index != -1 ) {
        variableAddr = availableVariables[index][2];
        variableType = availableVariables[index][1];
        if ( format == undefined )
            variableFormat = getDefaultFormatID( variableType );
        else
            variableFormat = format;
    } else {
        index = getVariableIndex( availableSystems, variableName );
        if ( index != -1 ) {
            variableAddr = availableSystems[index][2];
            variableType = availableSystems[index][1];
            if ( format == undefined )
                variableFormat = getDefaultFormatID( variableType );
            else
                variableFormat = format;
        }
    }
    if ( index != -1 ) {
        if ( variableType == 's' ) {
            request = variableAddr + ';' + variableType + ';' + variableFormat + ';' + escape(value) + ';';
        } else {
            request = variableAddr + ';' + variableType + ';' + variableFormat + ';' + value + ';';
        }
        var xhrVariable = createXMLHttpRequest();
        xhrVariable.open("POST", "/plcExchange/setValues/", false);
        for (var g in GUID) {
            xhrVariable.setRequestHeader('GUID_' + g, GUID[g]);
        }
        xhrVariable.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
        xhrVariable.send(request);
        if (xhrVariable.status == 410) {
            window.top.location.replace('/login.htm');
        } else if (xhrVariable.status != 200) {alert("Operation not Allowed");}
    } 
}

function appMap () {
    var xhrRequest = createXMLHttpRequest();
    xhrRequest.onreadystatechange = function () {
        if (xhrRequest.readyState == 4) {
            if (xhrRequest.status == 200) {
                var i = xhrRequest.responseText.search("availableVariables");
                if (i < 0) {
                    availableVariables = new Array();
                } else {
                    availableVariables = eval(xhrRequest.responseText.slice(i + 21));
                }
            }
            else if (xhrRequest.status == 410) {
                window.top.location.replace('/login.htm');
            }
        }
    };
    xhrRequest.open("GET", "/usr/App/Application.map", false);
    xhrRequest.send(null);
}
