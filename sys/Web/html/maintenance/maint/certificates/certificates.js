

var arrayStrCertifCurrent = [];
var arrayStrCertifNew = [];
var arrayStrIdx = {  // Index in the array of sub string
    C:  0,   // Country
    ST: 1,   // State
    L:  2,   // Locality
    O:  3,   // Organization
    OU: 4,   // Organization unit
    CN: 5    // Common name
};
for (let i=0; i < arrayStrIdx.length; i++) {
    // fill default cert and newCert
    arrayStrCertifCurrent[i] = arrayStrCertifNew[i] = "";
}
var szResponsePos = {
    curCountry:      0,
    curState:        0,
    curLocality:     0,
    curOrganization: 0,
    curOrgaUnit:     0,
    curCommonName:   0,
    newCountry:      0,
    newState:        0,
    newLocality:     0,
    newOrganization: 0,
    newOrgaUnit:     0,
    newCommonName:   0
};

function readOwnCertif() {
   sendCertifToServer_Synchro(""); 
   refreshOwnCertificatePage();
    
}


// response format:
//  "/C=??/ST=????/L=????/O=????/OU=????/CN=????" +
//  "/#C=??/#ST=????/#L=????/#O=????/#OU=????/#CN=????/";
/*
regex to capture replies: /(?:\/C=([^\/]+))?(?:\/ST=([^\/]+))?(?:\/L=([^\/]+))?(?:\/O=([^\/]+))?(?:\/OU=([^\/]+))?(?:\/CN=([^\/]+))?(?:\/#C=([^\/]+))?(?:\/#ST=([^\/]+))?(?:\/#L=([^\/]+))?(?:\/#O=([^\/]+))?(?:\/#OU=([^\/]+))?(?:\/#CN=([^\/]+))?/
*/

function updateOwnCertifArrayString(szResponse) {
   szResponsePos.curCountry      = szResponse.indexOf("/C=");
   szResponsePos.curState        = szResponse.indexOf("/ST=");
   szResponsePos.curLocality     = szResponse.indexOf("/L=");
   szResponsePos.curOrganization = szResponse.indexOf("/O=");
   szResponsePos.curOrgaUnit     = szResponse.indexOf("/OU=");
   szResponsePos.curCommonName   = szResponse.indexOf("/CN=");
   szResponsePos.newCountry      = szResponse.indexOf("/#C=");
   szResponsePos.newState        = szResponse.indexOf("/#ST=");
   szResponsePos.newLocality     = szResponse.indexOf("/#L=");
   szResponsePos.newOrganization = szResponse.indexOf("/#O=");
   szResponsePos.newOrgaUnit     = szResponse.indexOf("/#OU=");
   szResponsePos.newCommonName   = szResponse.indexOf("/#CN=");


  if(szResponsePos.curCountry >= 0) {
      // OK found
    arrayStrCertifCurrent[arrayStrIdx.C] = subStringExtract(szResponse, szResponsePos.curCountry);
  }
  else {
    // Not found
      arrayStrCertifCurrent[arrayStrIdx.C] = "";
  }

  if (szResponsePos.curState >= 0) {
      // OK found
      arrayStrCertifCurrent[arrayStrIdx.ST] = subStringExtract(szResponse, szResponsePos.curState);
  }
  else {
      // Not found
      arrayStrCertifCurrent[arrayStrIdx.ST] = "";   // NOTE: <void> is not displayed
  }


  if (szResponsePos.curLocality >= 0) {
      // OK found
      arrayStrCertifCurrent[arrayStrIdx.L] = subStringExtract(szResponse, szResponsePos.curLocality);
  }
  else {
      // Not found
      arrayStrCertifCurrent[arrayStrIdx.L] = "";
  }


  if (szResponsePos.curOrganization >= 0) {
      // OK found
      arrayStrCertifCurrent[arrayStrIdx.O] = subStringExtract(szResponse, szResponsePos.curOrganization);
  }
  else {
      // Not found
      arrayStrCertifCurrent[arrayStrIdx.O] = "";
  }


  if (szResponsePos.curOrgaUnit >= 0) {
      // OK found
      arrayStrCertifCurrent[arrayStrIdx.OU] = subStringExtract(szResponse, szResponsePos.curOrgaUnit);
  }
  else {
      // Not found
      arrayStrCertifCurrent[arrayStrIdx.OU] = "";
  }


  if (szResponsePos.curCommonName >= 0) {
      // OK found
      arrayStrCertifCurrent[arrayStrIdx.CN] = subStringExtract(szResponse, szResponsePos.curCommonName);
  }
  else {
      // Not found
      arrayStrCertifCurrent[arrayStrIdx.CN] = "";
  }

  ///////  NEW CERTIFICATE  //////////////////////////

  if (szResponsePos.newCountry >= 0) {
      // OK found
      arrayStrCertifNew[arrayStrIdx.C] = subStringExtract(szResponse, szResponsePos.newCountry);
  }
  else {
      // Not found
      arrayStrCertifNew[arrayStrIdx.C] = "";
  }

  if (szResponsePos.newState >= 0) {
      // OK found
      arrayStrCertifNew[arrayStrIdx.ST] = subStringExtract(szResponse, szResponsePos.newState);
  }
  else {
      // Not found
      arrayStrCertifNew[arrayStrIdx.ST] = "";
  }


  if (szResponsePos.newLocality >= 0) {
      // OK found
      arrayStrCertifNew[arrayStrIdx.L] = subStringExtract(szResponse, szResponsePos.newLocality);
  }
  else {
      // Not found
      arrayStrCertifNew[arrayStrIdx.L] = "";
  }


  if (szResponsePos.newOrganization >= 0) {
      // OK found
      arrayStrCertifNew[arrayStrIdx.O] = subStringExtract(szResponse, szResponsePos.newOrganization);
  }
  else {
      // Not found
      arrayStrCertifNew[arrayStrIdx.O] = "";
  }


  if (szResponsePos.newOrgaUnit >= 0) {
      // OK found
      arrayStrCertifNew[arrayStrIdx.OU] = subStringExtract(szResponse, szResponsePos.newOrgaUnit);
  }
  else {
      // Not found
      arrayStrCertifNew[arrayStrIdx.OU] = "";
  }


  if (szResponsePos.newCommonName >= 0) {
      // OK found
      arrayStrCertifNew[arrayStrIdx.CN] = subStringExtract(szResponse, szResponsePos.newCommonName);
  }
  else {
      // Not found
      arrayStrCertifNew[arrayStrIdx.CN] = "";
  }

}



function subStringExtract(szResponse, startPos) {
    var szResult = "";
    var pos0 = startPos;
    var pos1 = pos0;
    var f_found = false;


    for(f_found = false; pos0 < szResponse.length; pos0++) {
        if (szResponse.charAt(pos0) == '=') {
            f_found = true;
            break;
        }
    }
     

    if(f_found == true) {  // OK
      pos0++; // char after '='
      pos1 = pos0;
    }
    else { // ERROR
       return "ERROR Not found";
    }

    for(f_found = false; pos1 < szResponse.length; pos1++) {
        if (szResponse.charAt(pos1) == '/') {
            f_found = true;
            break;
        }
    }

    
    if(f_found == true) { // OK
      szResult = szResponse.slice(pos0, pos1);
    }
    else {  // ERROR
      szResult = "ERROR Not found";
    }

    //window.alert("subStringExtract() " + szResult);
    return szResult;

}


function refreshOwnCertificatePage() {

  //window.alert("Refresh own certificate");    
  // Refresh current certificate
  document.getElementById("idCountryCurrent").innerHTML      = arrayStrCertifCurrent[0];  
  document.getElementById("idStateCurrent").innerHTML        = arrayStrCertifCurrent[1];
  document.getElementById("idLocalityCurrent").innerHTML     = arrayStrCertifCurrent[2];
  document.getElementById("idOrganizationCurrent").innerHTML = arrayStrCertifCurrent[3];
  document.getElementById("idOrgaUnitCurrent").innerHTML     = arrayStrCertifCurrent[4];
  document.getElementById("idCommonNameCurrent").innerHTML   = arrayStrCertifCurrent[5];
            
  // Refresh new certificate after reboot
  document.getElementById("idCountryNew").value      = arrayStrCertifNew[0];
  document.getElementById("idStateNew").value        = arrayStrCertifNew[1];
  document.getElementById("idLocalityNew").value     = arrayStrCertifNew[2];
  document.getElementById("idOrganizationNew").value = arrayStrCertifNew[3];
  document.getElementById("idOrgaUnitNew").value     = arrayStrCertifNew[4];
  document.getElementById("idCommonNameNew").value   = arrayStrCertifNew[5];
  
}

function testInputCertif(szInputVal) {


   if (/[\u0391-\u03d6]/.test(szInputVal) == true) { return "ERROR: Greek characters are forbidden "; }

   if (/[\u0400-\u04ff]/.test(szInputVal) == true) { return "ERROR: Cyrillic characters are forbidden "; }
    
   if (/[\u3400-\u9FBF]/.test(szInputVal) == true) { return "ERROR: Chinese characters are forbidden "; }

   if (/[^\u0020-\u007E]/.test(szInputVal) == true) { return "ERROR: Non ASCII characters are forbidden "; }

   if (/[%*<>,?!+\042\057\134]/.test(szInputVal) == true)    { return "ERROR: Characters \042 ! % * + , / < >  ?  \\  are forbidden "; }

   return "";  
    
}


function saveOwnCertif() {
    var szErrorMsg = "";
    var f_return = false;
    var certifFields = "";

    var inputVal = document.getElementById("idCountryNew").value;
    if (inputVal == "") {
        window.alert("ERROR: Country must be filled out");
        return false;
    }
    else if (/[^A-Z]/.test(inputVal) == true) {    // Only Upper case letters are allowed
        window.alert("ERROR: Only upper case letters (A-Z) are allowed in Country");
        return false;
    }
    else {
        certifFields = "/#C=" + inputVal;
    }


    inputVal = document.getElementById("idStateNew").value;
    if (inputVal == "") {  // State could be empty
    }
    else if((szErrorMsg = testInputCertif(inputVal)) == ""){     
        certifFields += "/#ST=" + inputVal;
    }   
    else {
        window.alert(szErrorMsg + "in State");
        return false;      
    }
               

    inputVal = document.getElementById("idLocalityNew").value;
    if (inputVal == "") {
        window.alert("ERROR: Locality must be filled out");
        return false;
    }
    else if((szErrorMsg = testInputCertif(inputVal)) == "") {       
        certifFields += "/#L=" + inputVal;
    }
    else {
        window.alert(szErrorMsg + "in Locality");
        return false;       
    }
    

    inputVal = document.getElementById("idOrganizationNew").value;
    if (inputVal == "") {
        window.alert("ERROR: Organization must be filled out");
        return false;
    }
    else if((szErrorMsg = testInputCertif(inputVal)) == "") {      
        certifFields += "/#O=" + inputVal;
    }
    else {
        window.alert(szErrorMsg + "in Organization");
        return false;    
    }


    inputVal = document.getElementById("idOrgaUnitNew").value;
    if (inputVal == "") {
        window.alert("ERROR: Organization Unit must be filled out");
        return false;
    }
    else if((szErrorMsg = testInputCertif(inputVal)) == "") {      
        certifFields += "/#OU=" + inputVal;
    }
    else {
        window.alert(szErrorMsg + "in Organization unit");
        return false;      
    }

    inputVal = document.getElementById("idCommonNameNew").value;
    if (inputVal == "") {
        window.alert("ERROR: Common name must be filled out");
        return false;
    }
    else if((szErrorMsg = testInputCertif(inputVal)) == "") {     
        certifFields += "/#CN=" + inputVal + "/";
    }
    else {
        window.alert(szErrorMsg + "in Common name");
        return false;
    }    

    // Result string =   "/#C=--/#ST=----/#L=----/#O=----/#OU=----/#CN=----/" 
    
    if (sendCertifToServer_Synchro(certifFields) == true) {
        window.alert("OK: New certificate will be created at the next reboot of PLC !");
        f_return = true;
    }
    else {
        //window.alert("ERROR: New certificate refused by the Server !");
    }


    return f_return;
}




function sendCertifToServer_Synchro(certifFields) {
    var f_return = false;
    var xmlhttpReq = createXMLHttpRequest();

    xmlhttpReq.open("POST", "/certificate/", false);  // false => synchronous 

    xmlhttpReq.setRequestHeader("ListId", certifFields);  // GET
    xmlhttpReq.send(null);
    if (xmlhttpReq.readyState == 4 && xmlhttpReq.status == 200) {
        updateOwnCertifArrayString(xmlhttpReq.responseText);
        f_return = true;
    }
    else if (xmlhttpReq.readyState == 4 && xmlhttpReq.status == 410) {
        window.top.location.replace('/login.htm');
    }
    refreshOwnCertificatePage();

    return f_return;
}

