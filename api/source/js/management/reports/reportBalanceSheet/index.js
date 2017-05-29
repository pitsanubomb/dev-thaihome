//
// WHAT DO Property Balance SHeet NEED FROM THE REPORT-FORM?
//
// -->  FROM date and TO date 
// -->  One Property
//
app.controller("reportBalanceSheetController", function ($scope, $http, $rootScope, $location, ReportData) {

	var topHeadtxt = 'Property Balance Sheet';
    var formData = ReportData.get();
    console.log('######### REPORT: ' + formData.reportName);
    console.log('fromDate: ' + formData.fromDate);
    console.log('toDate: ' + formData.toDate);
    console.log('propertySingle: ' + JSON.stringify(formData.propertySingle, null, 4));


	// Load all data
	var findData = function() {
		return new Promise((resolve, reject) => {
		$http({
			method: 'POST',
			url: globalNodeUrl + 'report/getBalanceSheet',
			headers: { 'Content-Type': 'application/json' },
			data: { propertyID:formData.propertySingle, fromDate: formData.fromDate, toDate: formData.toDate}
		}).then(function successCallback(res) {
			console.log('WE GOT THE getBalanceSheet BACK FROM ROUTER!!!')
			// console.log('data: ' + JSON.stringify(res.data, null, 4))
            resolve(res.data);
		}, function errorCallback(err) {
			reject(new Error('getBalanceSheet ERROR : ' + err));
		});
	})};


	// Create HTML for the entire report page
	var makeReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE MAKE THE REPORT!!!');
		let bookingArray = data.booking;
		let expenseArray = data.expense;
		let propertyArray = data.property;
		// console.log('### bankArray: ' + JSON.stringify(bankArray, null, 4))
		// console.log('### receiptArray: ' + JSON.stringify(receiptArray, null, 4))
		// console.log('### expenseArray: ' + JSON.stringify(expenseArray, null, 4))
		var htmlCode = setupBalanceReport(formData.propertySingle._id, formData.fromDate, formData.toDate, bookingArray, expenseArray, propertyArray, topHeadtxt)
		resolve(htmlCode);
	})};


	// Show the report
	var showReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE SHOW THE REPORT!!!');
		data = pageButtons(topHeadtxt) + data 
		document.getElementById('contentAll').innerHTML = data;	
	})};


	// Start all the promises
	findData()
		.then(makeReport)
		.then(showReport)
		.catch(err => {
			console.error(err);
			console.log("reportBalanceSheetController ERROR: " + err.message );
			return;
		})

})


// Setup Balance Sheet Report
function setupBalanceReport(currProperty, parmFromDate, parmToDate, bookingArray, expenseArray, propertyArray, topHeadtxt) {

	console.log('currProperty: ' + currProperty)
	console.log('parmFromDate: ' + parmFromDate)
	console.log('parmToDate: ' + parmToDate)

	document.title = topHeadtxt;
	var fromDate = new Date(parmFromDate*1000);
	var toDate = new Date(parmToDate*1000);
	var reportHead = 'Period from <b>' + fromDate.format('j M Y') + '</b> to <b>' + toDate.format('j M Y') + '</b>';

	var greenTxt = 'color:#007000;';
	var greenBg  = 'background-color:#DDFFDD;';
	var redTxt = 'color:#804040;';
	var redBg  = 'background-color:#FFE5E5;';
	var greyTxt = 'color:#808080;';
	var greyBg  = 'background-color:#E0E0E0;';
	var yellowTxt = 'color:#707000;';
	var yellowBg  = 'background-color:#FFFFB2;';

	// Find property 
	var selectProperty = propertyArray.filter(function(obj){
		return obj._id == currProperty;
	})			
	
	// Render the report
	var htmlCode = ''
	htmlCode += topHeadline(topHeadtxt + ' for ' + selectProperty[0]._id);
	htmlCode += reportHeadline(reportHead + ' for <b>' + selectProperty[0]._id + '</b>')
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse;">'
	htmlCode += '<tr><td style="vertical-align:top;">'
	
	var htmlTHL = '<th style="text-align:left; padding-left:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTHC = '<th style="text-align:center; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTHR = '<th style="text-align:right; padding-right:6px; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTDL = '<td style="text-align:left; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDC = '<td style="text-align:center; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR = '<td style="text-align:right; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTotal = '<td colspan="#SPAN#" style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:right; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; border-top:2px solid #666666; border-bottom:2px solid #666666; font-size:14px; font-weight:bold; font-family:Arial;">#FIELD#</td>'
	var htmlTotalSum = '<td colspan="#SPAN#" style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:right; #COLOR# background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:bold; font-family:Arial;">#FIELD#</td>'

	// Invoice Headline
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse;">'
	htmlCode += '<tr>'
	htmlCode += htmlTHC.replace('#FIELD#', 'Date');
	htmlCode += htmlTHC.replace('#FIELD#', 'Inv');
	htmlCode += htmlTHC.replace('#FIELD#', 'Book');
	htmlCode += htmlTHL.replace('#FIELD#', 'Description');
	htmlCode += htmlTHR.replace('#FIELD#', 'Amount');
	htmlCode += '</tr>'

	// Sort invoiceArray by dueDate oldest to newest
	sortBy(bookingArray, (o) => o.checkin);

	// Loop thru all bookings
	var totalIncome = 0;
	var totalExpense = 0;
	for (var b=0; b<bookingArray.length; b++) {	

		// Loop thru all invoices on that booking
		for (var i=0; i<bookingArray[b].invoice.length; i++) {	
	
			htmlCode += '<tr>'
			htmlCode += htmlTDC.replace('#FIELD#', new Date(bookingArray[b].invoice[i].dueDate*1000).format('d/m/Y'));
			htmlCode += htmlTDR.replace('#FIELD#', bookingArray[b].invoice[i].invoiceNumber);
			htmlCode += htmlTDC.replace('#FIELD#', bookingArray[b].invoice[i].bookingId);

			// Loop thru all lines on the invoice
			var invoiceTotal = 0;
			var invoiceText = '';

			for (var l=0; l<bookingArray[b].invoice[i].invoiceLines.length; l++) {	
				if (invoiceText == '') {
					invoiceText += htmlTDL.replace('#FIELD#', bookingArray[b].invoice[i].invoiceLines[l].lineText);
				}
				invoiceTotal += bookingArray[b].invoice[i].invoiceLines[l].amountTotal;
			}
			htmlCode += invoiceText;

			// Loop thru all receipts on that invoice
			var receiptTotal = 0;
			for (var r=0; r<bookingArray[b].receipt.length; r++) {	
				if (bookingArray[b].receipt[r].invoiceId == bookingArray[b].invoice[i]._id) {
					receiptTotal += bookingArray[b].receipt[r].amount;
				}
			}
			
			// if this is a completed booking (checkout before today) then use amount from receipts
			currAmount = 0;
			if (bookingArray[b].checkout <= new Date().format('U')) {
				currAmount = receiptTotal
			} else {
				currAmount = invoiceTotal
			}
			htmlCode += htmlTDR.replace('#FIELD#', ('฿ ' + accFormat(currAmount)));
			htmlCode += '</tr>'
			totalIncome += currAmount;
		}

		// Loop thru all receipts with no invoice on this booking
		var receiptTotal = 0;
		var duedate = 0;
		var recpNo = 0;
		for (var r=0; r<bookingArray[b].receipt.length; r++) {	
			if (bookingArray[b].receipt[r].invoiceId == "") {
				receiptTotal += bookingArray[b].receipt[r].amount;
				duedate = bookingArray[b].checkin;
				recpNo = bookingArray[b].receipt[r].receiptNo;
			}
		}
		if (receiptTotal != 0) {
			htmlCode += '<tr>'
			htmlCode += htmlTDC.replace('#FIELD#', new Date(duedate*1000).format('d/m/Y'));
			htmlCode += htmlTDR.replace('#FIELD#', 0);
			htmlCode += htmlTDC.replace('#FIELD#', bookingArray[b]._id);
			htmlCode += htmlTDL.replace('#FIELD#', 'Extra receipts');		
			htmlCode += htmlTDR.replace('#FIELD#', ('฿ ' + accFormat(receiptTotal)));
			htmlCode += '</tr>'
			totalIncome += currAmount;
		}
	}

	// Writing the total Income
	htmlCode += '<tr>'
	var renderLine = htmlTotal.replace('#FIELD#', 'Total Income');
	renderLine = renderLine.replace('#SPAN#','4');
	htmlCode += renderLine;
	var renderLine = htmlTotal.replace('#FIELD#', ('฿ ' + accFormat(totalIncome)));
	renderLine = renderLine.replace('#SPAN#','1');
	htmlCode += renderLine;
	htmlCode += '</tr></table>'

	
	// Expense Headline
	htmlCode += '</td><td style="width:8px;"></td><td style="vertical-align:top;">'
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse;">'
	htmlCode += '<tr>'
	htmlCode += htmlTHC.replace('#FIELD#', 'Date');
	htmlCode += htmlTHC.replace('#FIELD#', 'ExpNo');
	htmlCode += htmlTHL.replace('#FIELD#', 'Description');
	htmlCode += htmlTHR.replace('#FIELD#', 'Amount');
	htmlCode += '</tr>'

	// Sort expenseArray by dueDate oldest to newest
	sortBy(expenseArray, (o) => o.dueDate);

	// Loop thru all expenses
	for (var e=0; e<expenseArray.length; e++) {	

		// Should this expense be split between several properties?
		shareModifier = 100;
		if (typeof(expenseArray[e].propertyId)=='object') {
			console.log ('ITS ARRAY OF PROPERTIES!!!')

			// Find total salesprice for all properties who share this expense and put into totalSaleprice
			var totalSaleprice = 0;
			for (let p=0; p<expenseArray[e].propertyId.length; p++) {
				let selecter = propertyArray.filter(function(obj){
					return obj._id == expenseArray[e].propertyId;
				})			
				if (selecter[0].saleprice) {
					totalSaleprice += selecter[0].saleprice;
				}				
			}
			if (totalSaleprice==0) {
				totalSaleprice = selectProperty[0].saleprice
			};
			shareModifier = Math.round((selectProperty[0].saleprice/totalSaleprice)*100)
			console.log ('shareModifier ' + shareModifier)
		} else {
			console.log ('Its single property ')
			shareModifier = 100;
		}
	
		// Render the line
		htmlCode += '<tr>'
		htmlCode += htmlTDC.replace('#FIELD#', new Date(expenseArray[e].dueDate*1000).format('d/m/Y'));
		htmlCode += htmlTDR.replace('#FIELD#', expenseArray[e]._id);
		htmlCode += htmlTDL.replace('#FIELD#', expenseArray[e].text);
		htmlCode += htmlTDR.replace('#FIELD#', ('฿ ' + accFormat(expenseArray[e].amount * (shareModifier/100))));
		htmlCode += '</tr>'
		
		totalExpense += Math.round(expenseArray[e].amount * (shareModifier/100));
		
	}

	// Writing the total Expense
	htmlCode += '<tr>'
	var renderLine = htmlTotal.replace('#FIELD#', 'Total Expense');
	renderLine = renderLine.replace('#SPAN#','3');
	htmlCode += renderLine;
	var renderLine = htmlTotal.replace('#FIELD#', ('฿ ' + accFormat(totalExpense)));
	renderLine = renderLine.replace('#SPAN#','1');
	htmlCode += renderLine;
	htmlCode += '</tr>'
	
	htmlCode += '<tr><td colspan="4" style="border:0; height:16px;"></td></tr>'
	

	
	// Totals
	htmlCode += '<tr>'

	var renderLine = htmlTotalSum.replace('#FIELD#', 'Total Income from ' + selectProperty[0]._id);
	renderLine = renderLine.replace('#COLOR#','color:#000000;');
	renderLine = renderLine.replace('#SPAN#','3');
	htmlCode += renderLine;

	var renderLine = htmlTotalSum.replace('#FIELD#', ('฿ ' + accFormat(totalIncome)));
	renderLine = renderLine.replace('#COLOR#',greenTxt);
	renderLine = renderLine.replace('#SPAN#','1');
	htmlCode += renderLine;

	htmlCode += '</tr>'
	htmlCode += '<tr>'
	
	var renderLine = htmlTotalSum.replace('#FIELD#', 'Total Expense from ' + selectProperty[0]._id);
	renderLine = renderLine.replace('#COLOR#','color:#000000;');
	renderLine = renderLine.replace('#SPAN#','3');
	htmlCode += renderLine;

	var renderLine = htmlTotalSum.replace('#FIELD#', ('฿ -' + accFormat(totalExpense)));
	renderLine = renderLine.replace('#COLOR#',redTxt);
	renderLine = renderLine.replace('#SPAN#','1');
	htmlCode += renderLine;

	htmlCode += '</tr>'
	htmlCode += '<tr>'
	if (totalExpense<=totalIncome) {
		var renderLine = htmlTotalSum.replace('#FIELD#', 'Total PROFIT from ' + selectProperty[0]._id);
	} else {
		var renderLine = htmlTotalSum.replace('#FIELD#', 'Total LOSS from ' + selectProperty[0]._id);
	}
	renderLine = renderLine.replace('#COLOR#','color:#000000;');
	renderLine = renderLine.replace('#SPAN#','3');
	htmlCode += renderLine;

	var renderLine = htmlTotalSum.replace('#FIELD#', ('฿ ' + accFormat(totalIncome-totalExpense)));
	if (totalExpense<=totalIncome) {
		renderLine = renderLine.replace('#COLOR#',greenTxt);
	} else {
		renderLine = renderLine.replace('#COLOR#',redTxt);
	}
	renderLine = renderLine.replace('#SPAN#','1');
	htmlCode += renderLine;
	htmlCode += '</tr></table>'
	htmlCode += '</td></tr></table>'

	htmlCode += reportFooter();
	return htmlCode;	
}
