//
// WHAT DO ReportAgentRent NEED FROM THE REPORT-FORM?
//
// -->  ALL properties or  SPECIFIC properties
//
app.controller("reportAgentRentController", function ($scope, $http, $rootScope, $location, ReportData) {

    var formData = ReportData.get();
    console.log('######### REPORT: ' + formData.reportName);
	console.log('propertyArr: ' + JSON.stringify(formData.propertyArr, null, 4));


	// Load all properties
	var findProperties = function() {
		return new Promise((resolve, reject) => {
		$http({
			method: 'POST',
			url: globalNodeUrl + 'report/getAgentRentReport',
			headers: { 'Content-Type': 'application/json' },
			data: { propertyID : formData.propertyArr }
		}).then(function successCallback(res) {
			console.log('WE GOT THE DATA BACK FROM ROUTER!!!')
			// console.log('data: ' + JSON.stringify(res, null, 4))
			console.log('data: ' + JSON.stringify(res.data.propertyArray, null, 4))
            resolve(res.data.propertyArray);
		}, function errorCallback(err) {
			reject(new Error('getAgentRentReport ERROR : ' + err));
		});
	})};


	// Create HTML for the entire report page
	var makeReport = function (propertyArray) {
		return new Promise((resolve, reject) => {
		console.log('WE MAKE THE REPORT!!!');
	    console.log("propertyArray Result: " + JSON.stringify(propertyArray, null, 4));
		console.log('fromDate: ' + formData.fromDate);
		console.log('toDate: ' + formData.toDate);
		var topHeadtxt = 'Property Rent Pricelist for Agents'
		var htmlCode = setupRentReport(formData.fromDate, formData.toDate, propertyArray, topHeadtxt)
		resolve(htmlCode);
	})};


	// Show the report
    var showReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE SHOW THE REPORT!!!');
		var topHeadtxt = 'Property Rent Pricelist for Agents'
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
			console.log("reportAgentRentController ERROR: " + err.message );
		})

})


// Setup Pricelist
function setupRentReport(fromDate, toDate, propertyArray, topHeadtxt) {
	var htmlTHL = '<th style="text-align:left; height:26px; padding-left:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTHC = '<th style="text-align:center; height:26px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTHR = '<th style="text-align:right; height:26px; padding-right:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTDL = '<td style="text-align:left; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDN = '<td style="text-align:left; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial Narrow;">#FIELD#</td>'
	var htmlTDC = '<td style="text-align:center; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR1 = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#f6e4bc; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR2 = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#bbf6bb; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'

	var reportHead = ''
	document.title = topHeadtxt;

	// Put page title the same as report headline
	reportHead = reportAgentHeadline();  			// grab the html header for this report cause its special
	reportHead = findTexts(reportHead); 			// grab the html header for this report cause its special
	
	// Render the report 
	htmlCode = '';
	htmlCode += topHeadline(topHeadtxt);
	htmlCode += reportHead;
	htmlCode += renderRentReportTableHeader();

	// Loop thru all properties
	var lines=0
	for (var i=0; i<propertyArray.length; i++) {	

		if (propertyArray[i].checkout) {
			var textCheckout = '<span style="color:#e60000; font-weight:bold;">' + (new Date(propertyArray[i].checkout*1000).format('d M Y')) + '</span>';
		} else {
			var textCheckout = '<span style="color:#009900; font-weight:bold;">Now!</span>';
		}
		
		// Render result
		htmlCode +='<tr>'
		htmlCode +=htmlTDL.replace('#FIELD#', propertyArray[i].name);
		htmlCode +=htmlTDL.replace('#FIELD#', propertyArray[i].unitNumber.replace('(Venus Building D)', ''));
		htmlCode +=htmlTDN.replace('#FIELD#', propertyArray[i].floor);
		htmlCode +=htmlTDN.replace('#FIELD#', propertyArray[i].view.substring(0, 18));
		htmlCode +=htmlTDL.replace('#FIELD#', propertyArray[i].propertyType);
		htmlCode +=htmlTDR.replace('#FIELD#', propertyArray[i].sqm);
		htmlCode +=htmlTDC.replace('#FIELD#', textCheckout);
		htmlCode +=htmlTDR1.replace('#FIELD#', accFormat(propertyArray[i].priceWeek1));
		htmlCode +=htmlTDR1.replace('#FIELD#', accFormat(propertyArray[i].commissionDay) + '%');
		htmlCode +=htmlTDR2.replace('#FIELD#', accFormat(propertyArray[i].priceWeek2*7));
		htmlCode +=htmlTDR2.replace('#FIELD#', accFormat(propertyArray[i].commissionWeek) + '%');
		htmlCode +=htmlTDR1.replace('#FIELD#', accFormat(propertyArray[i].priceMonth1*30));
		htmlCode +=htmlTDR1.replace('#FIELD#', accFormat(propertyArray[i].commissionMonth) + '%');
		htmlCode +=htmlTDR2.replace('#FIELD#', accFormat(propertyArray[i].priceMonth6*30));
		htmlCode +=htmlTDR2.replace('#FIELD#', '½ Mth');
		htmlCode +=htmlTDR1.replace('#FIELD#', accFormat(propertyArray[i].priceYear*30));
		htmlCode +=htmlTDR1.replace('#FIELD#', '1 Mth');
		htmlCode +='</tr>'

		// Break every 17 lines  
		lines += 1;
		if (lines>26) {
			htmlCode += '</table>';
			htmlCode += reportFooter();
			htmlCode += reportPageBreak();
			htmlCode += topHeadline(topHeadtxt);
			htmlCode += reportHead;
			htmlCode += renderRentReportTableHeader();			
			lines = 0;
		}				
	}

	// End of the report
	htmlCode += '</table>';
	htmlCode += reportFooter();		
	return htmlCode;
}


// Render Table Header
function renderRentReportTableHeader() {
	var htmlTHL = '<td style="text-align:left; height:26px; padding-left:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlTHC = '<td style="text-align:center; height:26px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlTHR = '<td style="text-align:right; height:26px; padding-right:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	htmlCode = '';
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;">'
	htmlCode += '<tr>'
	htmlCode +=htmlTHL.replace('#FIELD#', 'Project');
	htmlCode +=htmlTHL.replace('#FIELD#', 'Unit');
	htmlCode +=htmlTHC.replace('#FIELD#', 'Floor');
	htmlCode +=htmlTHL.replace('#FIELD#', 'View');
	htmlCode +=htmlTHC.replace('#FIELD#', 'Type');
	htmlCode +=htmlTHC.replace('#FIELD#', 'Sqm');
	htmlCode +=htmlTHL.replace('#FIELD#', 'Available');
	htmlCode +=htmlTHL.replace('#FIELD#', 'Daily');
	htmlCode +=htmlTHL.replace('#FIELD#', 'Comm');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Weekly');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Comm');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Monthly');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Comm');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Half Year');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Comm');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Full Year');
	htmlCode +=htmlTHR.replace('#FIELD#', 'Comm');
	htmlCode += '</tr>'
	return htmlCode; 
}
