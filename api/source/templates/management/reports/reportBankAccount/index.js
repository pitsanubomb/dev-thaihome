//
// WHAT DO ReportBankAccount NEED FROM THE REPORT-FORM?
//
// -->  FROM date and TO date 
//
app.controller("reportBankAccountController", function ($scope, $http, $rootScope, $location, ReportData) {

	var topHeadtxt = 'Book Bank Account Report';
    var formData = ReportData.get();
    console.log('######### REPORT: ' + formData.reportName);
    console.log('fromDate: ' + formData.fromDate);
    console.log('toDate: ' + formData.toDate);
	console.log('bankArr: ' + JSON.stringify(formData.bankArr, null, 4));


	// Load all data
	var findData = function() {
		return new Promise((resolve, reject) => {
		$http({
			method: 'POST',
			url: globalNodeUrl + 'report/getBankAccountReport',
			headers: { 'Content-Type': 'application/json' },
			data: { fromDate: formData.fromDate, toDate: formData.toDate, bank:formData.bankArr }
		}).then(function successCallback(res) {
			console.log('WE GOT THE DATA BACK FROM ROUTER!!!')
			// console.log('data: ' + JSON.stringify(res.data, null, 4))
            resolve(res.data);
		}, function errorCallback(err) {
			reject(new Error('getBankAccountReport ERROR : ' + err));
		});
	})};


	// Create HTML for the entire report page
	var makeReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE MAKE THE REPORT!!!');
		let bankArray = data.bank;
		let receiptArray = data.receipt;
		let expenseArray = data.expense;
		// console.log('### bankArray: ' + JSON.stringify(bankArray, null, 4))
		// console.log('### receiptArray: ' + JSON.stringify(receiptArray, null, 4))
		// console.log('### expenseArray: ' + JSON.stringify(expenseArray, null, 4))
		var htmlCode = setupBankAccountReport(formData.fromDate, formData.toDate, bankArray, receiptArray, expenseArray, topHeadtxt)
		resolve(htmlCode);
	})};



	// Show the report
	var showReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE SHOW THE REPORT!!!');
		var topHeadtxt = 'Property Sale Pricelist for Agents'
		data = pageButtons(topHeadtxt) + data 
		document.getElementById('contentAll').innerHTML = data;	
	})};


	// Start all the promises
	findData()
		.then(makeReport)
		.then(showReport)
		.catch(err => {
			console.error(err);
			console.log("reportBankAccountController ERROR: " + err.message );
			return;
		})

})


// Setup Pricelist
function setupBankAccountReport(parmFromDate, parmToDate, bankArray, receiptArray, expenseArray, topHeadtxt) {
	
	var htmlTDL = '<td style="text-align:left; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDX = '<td style="text-align:left; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial Narrow;">#FIELD#</td>'
	var htmlTDC = '<td style="text-align:center; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDT = '<td colspan="4" style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:bold; font-family:Arial;">#FIELD#</td>'
	var htmlCode = '';
	var reportHead = ''
	var fromDate = new Date(parmFromDate*1000);
	var toDate = new Date(parmToDate*1000);
	var statsArray = [];

	document.title = topHeadtxt;

	// Loop thru all bank accounts
	for (var i=0; i<bankArray.length; i++) {		

		// Prepair the dates
		var fromMonth = fromDate.getMonth()+1;
		var toMonth = toDate.getMonth()+1;
		var fromYear = fromDate.getFullYear();
		var toYear = toDate.getFullYear();
		var cntFromMonth = 0;
		var cntToMonth = 0;
		var lines = 0;

		// Set Report header for this Bank Account
		reportHead = '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse;">'
					+ '<tr><td style="font-family: Arial Narrow, Arial; font-size:15px;">Account: </td><td style="font-family: Arial Narrow, Arial; font-size:15px;"><b>' + bankArray[i].account + '</b></td><td colspan="4" style="font-family: Arial Narrow, Arial; font-size:15px;">Period from <b>' + fromDate.format('j M Y') + '</b> to <b>' + toDate.format('j M Y') + '</b></td></tr>'
					+ '<tr><td style="font-family: Arial Narrow, Arial; font-size:15px;">Bank: </td><td style="font-family: Arial Narrow, Arial; font-size:15px;"><b>' + bankArray[i].bank + '</b></td><td style="font-family: Arial Narrow, Arial; font-size:15px;">No: </td><td style="font-family: Arial Narrow, Arial; font-size:15px;"><b>' + bankArray[i].accountNo + '</b></td><td style="font-family: Arial Narrow, Arial; font-size:15px;">Name: </td><td style="font-family: Arial Narrow, Arial; font-size:15px;"><b>' + bankArray[i].accountHolder + '</b></td></tr></table>'

		// Render Header
		if (i!=0) { 
			htmlCode += reportPageBreak();
		}
		htmlCode += topHeadline('Book Bank ' + bankArray[i].account);
		htmlCode += reportHeadline(reportHead);
		htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; margin-top:6px;">'

		// Count for all years 
		for (var countYear=fromYear; countYear<=toYear; countYear++) {
		
			// If this year is bigger than fromYear then we need to count from 1st month 
			if (countYear > fromYear) {
				cntFromMonth = 1
			} else {
				cntFromMonth = fromMonth
			}
		
			// If this year is smaller than toYear then we need to count all 12 months 
			if (countYear < toYear) {
				cntToMonth = 12
			} else {
				cntToMonth = toMonth
			}
			
			// looping thru all months for the countYear 
			for (var countMonth=cntFromMonth; countMonth<=cntToMonth; countMonth++) {

				var minDate = new Date(countYear + '-' + countMonth + '-01 00:00:00') / 1000
				var maxDays = new Date(countYear, countMonth, 0).getDate();
				var maxDate = new Date(countYear + '-' + countMonth + '-' + maxDays + ' 23:59:59') / 1000
				var totalReceipt = 0;
				var totalExpense = 0;
				var htmlRecp = '';

				// Find receipts
				var selectReceipt = receiptArray.filter(function(obj){
					return obj.account == bankArray[i]._id && obj.paidDate >= minDate && obj.paidDate <= maxDate;
				})

				sortBy(selectReceipt, (o) => o.paidDate);
				for (var r=0; r<selectReceipt.length; r++) {
					htmlRecp = '<tr>';
					htmlRecp += htmlTDL.replace('#FIELD#', new Date(selectReceipt[r].paidDate * 1000).format('d M'));
					htmlRecp += htmlTDL.replace('#FIELD#', selectReceipt[r].property);
					htmlRecp += htmlTDX.replace('#FIELD#', selectReceipt[r].name.substring(0,20));
					htmlRecp += htmlTDR.replace('#FIELD#', selectReceipt[r]._id);
					htmlRecp += htmlTDR.replace('#FIELD#', accFormat(selectReceipt[r].amount));
					htmlRecp += '</tr>';
					totalReceipt += selectReceipt[r].amount;
					pushStats(r, htmlRecp, '', statsArray);
				}
				htmlRecp = '<tr>';
				htmlRecp += htmlTDT.replace('#FIELD#', 'Total Receipts for ' + new Date(minDate*1000).format('F'));
				htmlRecp += htmlTDR.replace('#FIELD#', '<b>' + accFormat(totalReceipt) + '</b>');
				htmlRecp += '</tr>';
				pushStats((r+1), htmlRecp, '', statsArray);

				// Find expenses
				var selectExpense = expenseArray.filter(function(obj){
					return obj.account == bankArray[i]._id && obj.dueDate >= minDate && obj.dueDate <= maxDate
				})	
				sortBy(selectExpense, (o) => o.dueDate);
				
				var htmlExpe = '';
				for (var e=0; e<selectExpense.length; e++) {
					htmlExpe = '<tr>';
					htmlExpe += htmlTDL.replace('#FIELD#', new Date(selectExpense[e].dueDate*1000).format('d M'));
					if (typeof(selectExpense[e].propertyId)=='object') {
						htmlExpe += htmlTDL.replace('#FIELD#', 'MULTIPLE');
					} else {
						htmlExpe += htmlTDL.replace('#FIELD#', selectExpense[e].propertyId);
					}
					htmlExpe += htmlTDX.replace('#FIELD#', selectExpense[e].expenseCategory);
					htmlExpe += htmlTDX.replace('#FIELD#', selectExpense[e].text.substring(0,20));
					htmlExpe += htmlTDR.replace('#FIELD#', accFormat(selectExpense[e].amount));
					htmlExpe += '</tr>';
					totalExpense += selectExpense[e].amount;
					pushStats(e, '', htmlExpe, statsArray);
				}
				htmlExpe = '<tr>';
				htmlExpe += htmlTDT.replace('#FIELD#', 'Total Expense for ' + new Date(minDate*1000).format('F'));
				htmlExpe += htmlTDR.replace('#FIELD#', '<b>' + accFormat(totalExpense) + '</b>');
				htmlExpe += '</tr>';
				pushStats((e+1), '', htmlExpe, statsArray);

				// Render Month Headline
				htmlCode += '<tr><td colspan="3" style="width:90%; text-align:left; padding-left:6px; padding-top:10px; background-color:#FFFFFF; color:#000000; border:0px; height:25px; white-space: nowrap; font-size:20px; font-weight:bold; font-family:Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;">' + new Date(minDate*1000).format('F Y') + '</td></tr>';
				htmlRecp = renderBankAccountTableHead("RECEIPT");
				htmlExpe = renderBankAccountTableHead("EXPENSE");
				lines += 2;
				for (var l=0; l<statsArray.length; l++) {

					// Break every 24 lines  
					lines += 1;
					if (lines>18) {
						htmlCode += '<tr><td style="vertical-align:top;">' + htmlRecp + '</table></td><td>&nbsp;</td><td style="vertical-align:top;">' + htmlExpe + '</table></td><tr>';
						htmlCode += '</table>';
						htmlCode += reportFooter();			
						htmlCode += reportPageBreak();
						htmlCode += topHeadline('Book Bank ' + bankArray[i].account);
						htmlCode += reportHeadline(reportHead);
						htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; margin-top:6px;">'
						htmlCode += '<tr><td colspan="3" style="width:90%; text-align:left; padding-left:6px; padding-top:10px; background-color:#FFFFFF; color:#000000; border:0px; height:25px; white-space: nowrap; font-size:20px; font-weight:bold; font-family:Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;">' + new Date(minDate*1000).format('F Y') + '</td></tr>';
						htmlRecp = renderBankAccountTableHead("RECEIPT");
						htmlExpe = renderBankAccountTableHead("EXPENSE");
						lines = 0;
					}	

					if (statsArray[l].receipt) {htmlRecp += statsArray[l].receipt;}
					if (statsArray[l].expense) {htmlExpe += statsArray[l].expense;}
					
				}
				htmlCode += '<tr><td style="vertical-align:top;">' + htmlRecp + '</table></td><td>&nbsp;</td><td style="vertical-align:top;">' + htmlExpe + '</table></td><tr>';
				statsArray = [];
			}
		}
		htmlCode += '</table>';
		htmlCode += reportFooter();	
	}
	return htmlCode;
}

// Render table HEADER for the table with all data (because its longer than one page and need to break)
function renderBankAccountTableHead(whichHeader){
	var htmlTHL = '<th style="text-align:left; height:26px; padding-left:6px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTHC = '<th style="text-align:center; height:26px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlTHR = '<th style="text-align:right; height:26px; padding-right:6px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlCode = '' 
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; margin-top:6px;">'
	if (whichHeader=='RECEIPT') {
		htmlCode += '<tr><td colspan="5" style="width:90%; text-align:center; padding-left:6px; background-color:#FFFFFF; color:#000000; border:1px solid #AAAAAA; height:25px; white-space: nowrap; font-size:16px; font-weight:bold; font-family:Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;">Money in - Receipts</td></tr>'
		htmlCode += '<tr>'
		htmlCode += htmlTHL.replace('#FIELD#', 'Date');
		htmlCode += htmlTHL.replace('#FIELD#', 'Unit');
		htmlCode += htmlTHL.replace('#FIELD#', 'Tenant');
		htmlCode += htmlTHR.replace('#FIELD#', 'RecNo');
		htmlCode += htmlTHR.replace('#FIELD#', 'Amount');
	} else {
		htmlCode += '<tr><td colspan="5" style="width:90%; text-align:center; padding-left:6px; background-color:#FFFFFF; color:#000000; border:1px solid #AAAAAA; height:25px; white-space: nowrap; font-size:16px; font-weight:bold; font-family:Roboto, Helvetica Neue, Arial, Helvetica, sans-serif;">Money out - Expenses</td></tr>'
		htmlCode += '<tr>'
		htmlCode += htmlTHL.replace('#FIELD#', 'Date');
		htmlCode += htmlTHL.replace('#FIELD#', 'Unit');
		htmlCode += htmlTHL.replace('#FIELD#', 'Category');
		htmlCode += htmlTHL.replace('#FIELD#', 'Expense');
		htmlCode += htmlTHR.replace('#FIELD#', 'Amount');
	}
	htmlCode += '</tr>'
	return htmlCode;
}

// Push Stats
function pushStats(currKey, lineRecp, lineExpe, statsArray){
	var selectStats = statsArray.filter(function(obj){
		return obj.key == currKey
	})
  	if (!selectStats.length) {
		statsArray.push(
			{
				'key'		: currKey,
				'receipt'	: lineRecp,
				'expense'	: lineExpe
			}
		)
	} else {
		if (lineRecp) {
			selectStats[0].receipt = lineRecp;
		} else {
			selectStats[0].expense = lineExpe;
		}
	}
}





