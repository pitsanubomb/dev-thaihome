//
// WHAT DO ReportAgentSale NEED FROM THE REPORT-FORM?
//
// -->  ALL properties or  SPECIFIC properties
//
app.controller("reportAgentSaleController", function ($scope, $http, $rootScope, $location, ReportData) {

    var formData = ReportData.get();
    console.log('######### REPORT: ' + formData.reportName);
	console.log('propertyArr: ' + JSON.stringify(formData.propertyArr, null, 4));


	// Load all properties
	var findProperties = function() {
		return new Promise((resolve, reject) => {
		$http({
			method: 'POST',
			url: globalNodeUrl + 'report/getAgentSaleReport',
			headers: { 'Content-Type': 'application/json' },
			data: { propertyID : formData.propertyArr }
		}).then(function successCallback(res) {
			console.log('WE GOT THE DATA BACK FROM ROUTER!!!')
			// console.log('data: ' + JSON.stringify(res, null, 4))
			console.log('data: ' + JSON.stringify(res.data.data, null, 4))
            resolve(res.data.data);
		}, function errorCallback(err) {
			reject(new Error('getAgentSaleReport ERROR : ' + err));
		});
	})};


	// Create HTML for the entire report page
	var makeReport = function (propertyArray) {
		return new Promise((resolve, reject) => {
		console.log('WE MAKE THE REPORT!!!');
	    console.log("propertyArray Result: " + JSON.stringify(propertyArray, null, 4));
		console.log('fromDate: ' + formData.fromDate);
		console.log('toDate: ' + formData.toDate);
		var topHeadtxt = 'Property Sale Pricelist for Agents'
		var htmlCode = setupSaleReport(formData.fromDate, formData.toDate, propertyArray, topHeadtxt)
		resolve (htmlCode);
	})};


	// Show the report
    var showReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE SHOW THE REPORT!!!');
		var topHeadtxt = 'Property Sale Pricelist for Agents'
		data = pageButtons(topHeadtxt) + data 
		document.getElementById('contentAll').innerHTML = data;	
		resolve();
	})};


	// Start all the promises
	findProperties()
		.then(makeReport)
		.then(showReport)
		.catch(err => {
			console.error(err);
			console.log("reportAgentSaleController ERROR: " + err.message );
		})

})


// Setup Pricelist
function setupSaleReport(fromDate, toDate, propertyArray, topHeadtxt) {
	
	var htmlTDL = '<td style="text-align:left; height:34px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDN = '<td style="text-align:left; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial Narrow;">#FIELD#</td>'
	var htmlTDC = '<td style="text-align:center; height:34px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR = '<td style="text-align:right; height:34px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR1 = '<td style="text-align:right; height:34px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#f6e4bc; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR2 = '<td style="text-align:right; height:34px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#bbf6bb; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'

	var reportHead = ''
	document.title = topHeadtxt;

	// Put page title the same as report headline
	reportHead = reportAgentHeadline();  			// grab the html header for this report cause its special
	reportHead = findTexts(reportHead); 			// grab the html header for this report cause its special
	
	// Render the report 
	htmlCode = '';
	htmlCode += topHeadline(topHeadtxt);
	htmlCode += reportHead;
	htmlCode += renderSaleReportTableHeader();

	// Loop thru all properties
	var lines=0
	for (var i=0; i<propertyArray.length; i++) {	

		console.log('propertyArray[i].sqm = ' + propertyArray[i].sqm)

		// Render result
		htmlCode +='<tr>'
		htmlCode +=htmlTDL.replace('#FIELD#', propertyArray[i].name);
		htmlCode +=htmlTDL.replace('#FIELD#', propertyArray[i].unitNumber.replace('(Venus Building D)', ''));
		htmlCode +=htmlTDN.replace('#FIELD#', propertyArray[i].floor);
		htmlCode +=htmlTDN.replace('#FIELD#', propertyArray[i].view);
		htmlCode +=htmlTDL.replace('#FIELD#', propertyArray[i].propertyType);
		htmlCode +=htmlTDR.replace('#FIELD#', propertyArray[i].sqm);
		htmlCode +=htmlTDC.replace('#FIELD#', propertyArray[i].furnished.substring(0, 3));
		htmlCode +=htmlTDN.replace('#FIELD#', propertyArray[i].ownership);
		htmlCode +=htmlTDR.replace('#FIELD#', accFormat(Math.round(propertyArray[i].saleprice/propertyArray[i].sqm)));
		htmlCode +=htmlTDR2.replace('#FIELD#', '<b>' + accFormat(propertyArray[i].saleprice) + '</b>');
		htmlCode +=htmlTDR2.replace('#FIELD#', accFormat(Math.round((propertyArray[i].saleprice/100)*propertyArray[i].salecommission)));
		htmlCode +=htmlTDR1.replace('#FIELD#', '<b>' + accFormat(propertyArray[i].priceYear*30) + '</b>');
		htmlCode +=htmlTDR1.replace('#FIELD#', '1 mth');
		htmlCode +='</tr>'

		// Break every 26 lines  
		lines += 1;
		if (lines>25) {
			htmlCode += '</table>';
			htmlCode += reportFooter();
			htmlCode += reportPageBreak();
			htmlCode += topHeadline(topHeadtxt);
			htmlCode += reportHead;
			htmlCode += renderSaleReportTableHeader();			
			lines = 0;
		}		
	}

	// End of the report
	htmlCode += '</table>';
	htmlCode += reportFooter();
	return htmlCode;
}

// Render Table Header
function renderSaleReportTableHeader() {
	var htmlTHL = '<td style="text-align:left; height:26px; padding-left:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlTHC = '<td style="text-align:center; height:26px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlTHR = '<td style="text-align:right; height:26px; padding-right:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlCode = '';
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;">'
	htmlCode += '<tr>'
	htmlCode += htmlTHL.replace('#FIELD#', 'Project');
	htmlCode += htmlTHL.replace('#FIELD#', 'Unit');
	htmlCode += htmlTHC.replace('#FIELD#', 'Floor');
	htmlCode += htmlTHL.replace('#FIELD#', 'View');
	htmlCode += htmlTHC.replace('#FIELD#', 'Type');
	htmlCode += htmlTHC.replace('#FIELD#', 'Sqm');
	htmlCode += htmlTHL.replace('#FIELD#', 'Furnished');
	htmlCode += htmlTHL.replace('#FIELD#', 'Ownership');
	htmlCode += htmlTHL.replace('#FIELD#', 'Price/Sqm');
	htmlCode += htmlTHR.replace('#FIELD#', 'Sales Price');
	htmlCode += htmlTHR.replace('#FIELD#', 'Commission');
	htmlCode += htmlTHR.replace('#FIELD#', 'Rent/Month');
	htmlCode += htmlTHR.replace('#FIELD#', 'Comm');
	htmlCode += '</tr>'
	return htmlCode; 
}
