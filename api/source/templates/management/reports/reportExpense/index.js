//
// WHAT DO ReportExpenses NEED FROM THE REPORT-FORM?
//
// -->  FROM date and TO date 
// -->  Expense Categories or ALL 
// -->  Properties or ALL
// -->  Stretch expenses or not
//
app.controller("reportExpenseController", function ($scope, $http, $rootScope, $location, ReportData) {

	var topHeadtxt = 'Expenses Report';
    var formData = ReportData.get();
    console.log('######### REPORT: ' + formData.reportName);
    console.log('fromDate: ' + formData.fromDate);
    console.log('toDate: ' + formData.toDate);
    console.log('stretchExpense: ' + formData.stretchExpense);
    console.log('expenseArr: ' + JSON.stringify(formData.expenseArr, null, 4));
    console.log('propertyArr: ' + JSON.stringify(formData.propertyArr, null, 4));


    // Load all expense categories
	var expenseCategoryArray = [];
	var findExpenseCategory = function() {
		return new Promise((resolve, reject) => {
		if (!formData.expenseArr) {	
			$http({
				method: 'GET',
				url: globalNodeUrl + 'report/getExpenseCategory'
			}).then(function successCallback(res) {
				expenseCategoryArray = res.data.data;
				resolve(res.data);
			}, function errorCallback(err) {
				reject(new Error('getExpenseCategory ERROR : ' + err));
			});
		} else {
			expenseCategoryArray = formData.expenseArr;
			resolve(expenseCategoryArray);
		}
	})};


	// Load all expenses
	var expenseArray = [];
	var findExpense = function() {
		return new Promise((resolve, reject) => {
		$http({
			method: 'POST',
			url: globalNodeUrl + 'report/getExpense',
			headers: { 'Content-Type': 'application/json' },
			data: { expenseCategory:formData.expenseArr, propertyID:formData.propertyArr }
		}).then(function successCallback(res) {
			expenseArray = res.data.data;
            resolve(res.data);
		}, function errorCallback(err) {
			reject(new Error('getExpenses ERROR : ' + err));
		});
	})};


	// Create HTML for the entire report page
	var makeReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE MAKE THE REPORT!!!');
		var htmlCode = setupExpenseReport(formData.fromDate, formData.toDate, formData.stretchExpense, expenseCategoryArray, expenseArray, topHeadtxt)
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
	findExpenseCategory()
		.then(findExpense)
		.then(makeReport)
		.then(showReport)
		.catch(err => {
			console.error(err);
			console.log("reportExpensesController ERROR: " + err.message );
			return;
		})

})


// Setup Expense Report
function setupExpenseReport(parmFromDate, parmToDate, stretch, expenseCategoryArray, expenseArray, topHeadtxt) {
	
	document.title = topHeadtxt;
	var htmlCode = '';

	// Prepair the dates
	var fromDate = new Date(parmFromDate*1000);
	var toDate = new Date(parmToDate*1000);
	var fromMonth = fromDate.getMonth()+1;
	var toMonth = toDate.getMonth()+1;
	var fromYear = fromDate.getFullYear();
	var toYear = toDate.getFullYear();
	var cntFromMonth = 0;
	var cntToMonth = 0;
	var maxDays = 0;
	var printArr = [];
	var reportHead = 'Period from <b>' + fromDate.format('d M Y') + '</b> to <b>' + toDate.format('d M Y') + '</b>';

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
			for (var i=0; i<expenseCategoryArray.length; i++) {
				maxDays = daysInMonth(countMonth, countYear);
				countExpenses(expenseCategoryArray[i]._id, countYear, countMonth, maxDays, stretch, expenseArray, printArr);
			}
		}
	}

	// Render the total content
	htmlCode += topHeadline(topHeadtxt + ' Totals');
	htmlCode += reportHeadline(reportHead)	
	htmlCode += renderExpenseTopRows(fromYear, toYear, fromMonth, toMonth, expenseCategoryArray, printArr);
	htmlCode += reportFooter();
	htmlCode += reportPageBreak();	

	// Render the detail content
	htmlCode += topHeadline(topHeadtxt + ' Details');
	htmlCode += reportHeadline(reportHead)	
	htmlCode += renderExpenseDetails(fromDate, toDate, expenseArray, expenseCategoryArray);
	htmlCode += reportFooter();

	return htmlCode;	
}

// Loop thru all expenses for given year/month/category
function countExpenses(currentCategory, currentYear, currentMonth, maxDays, stretch, expenseArray, printArr){

	var dateFrom = Date.parse(currentYear + '-' + currentMonth + '-01 00:00:00')/1000;
	var dateTo = Date.parse(currentYear + '-' + currentMonth + '-' + maxDays + ' 23:23:59')/1000;
	var expenseTotal = 0;
	console.log ('----------------------------------------------------------')
	console.log ('CATEGORY: ' + currentCategory)
	console.log ('dateFrom: ' + new Date(dateFrom*1000).format('d M Y'))
	console.log ('dateTo: ' + new Date(dateTo*1000).format('d M Y'))
	console.log ('stretch: ' + stretch)
	console.log ('expenseArray: ' + expenseArray)
	console.log ('----------------------------------------------------------')
	
	// Find all expenses within the given category and dates.  dueDate must be within the date range OR (toDate must be BEFORE date range OR fromDate is AFTER date range)
	var selected = expenseArray.filter(function(obj){
		if (stretch==true) {
			return obj.expenseCategory == currentCategory && ((obj.dueDate >= dateFrom && obj.dueDate <= dateTo) || (obj.paidDate >= dateFrom && obj.paidDate <= dateTo) || (obj.fromDate < obj.toDate))
		} else {
			return obj.expenseCategory == currentCategory && (obj.dueDate >= dateFrom && obj.dueDate <= dateTo)
		}
	})	
	console.log ('length: ' + selected.length)

	// Remember we dont care about expenses shared between properties here, cause its category totals
	for (var j=0; j<selected.length; j++) {
		console.log ('category: ' + selected[j].expenseCategory)
		console.log ('text: ' + selected[j].text)
		console.log ('dueDate: ' + new Date(selected[j].dueDate*1000).format('d M Y'))
		console.log ('amount: ' + selected[j].amount)
		if (selected[j].fromDate) {
			console.log ('fromDate: ' + new Date(selected[j].fromDate*1000).format('d M Y'))
			console.log ('toDate: ' + new Date(selected[j].toDate*1000).format('d M Y'))
		}

		// Calculate STRETCHED espenses 
		if (selected[j].fromDate < selected[j].toDate && stretch==true) {
		
			// This one stretch, so we have to split the amount into months of the stretch
			var monthsNo = monthsBetween(new Date(selected[j].fromDate*1000), new Date(selected[j].toDate*1000));
			var monthAmount = Math.round(selected[j].amount / monthsNo);
			console.log('STRETCH!!!!')
			console.log('monthsNo: ' + monthsNo)
			console.log('monthAmount: ' + monthAmount)

			// If stretch is INSIDE period  
			if (selected[j].fromDate >= dateFrom && selected[j].toDate <= dateTo) {
				expenseTotal += monthAmount
				console.log ('stretch is INSIDE period')
			// If stretch COVERS the whole period
			} else if (selected[j].fromDate <= dateFrom && selected[j].toDate >= dateTo) {
				expenseTotal += monthAmount
				console.log ('stretch COVERS the whole period')
			
			// If stretch is ENDING in period
			} else if (selected[j].fromDate <= dateFrom && selected[j].toDate >= dateFrom) {
				expenseTotal += monthAmount
				console.log ('stretch is ENDING in period')
			
			// If stretch is BEGINNING in period
			} else if (selected[j].fromDate <= dateTo && selected[j].toDate >= dateTo) {
				expenseTotal += monthAmount
				console.log ('stretch is BEGINNING in period')

			} else {
				console.log ('## stretch is OUTSIDE the period ##')
			}				
			console.log('expenseTotal: ' + expenseTotal)
			
		} else {

			// This one does not stretch, so we can count the full amount
			console.log('normal.......')
			expenseTotal += selected[j].amount
			console.log('amount: ' + selected[j].amount)
			console.log('expenseTotal: ' + expenseTotal)

		}
	}

	// Add category totals to print result
	printArr.push(
		{
			'category' : currentCategory,
			'year' : currentYear,
			'month' : currentMonth,
			'amount' : expenseTotal
		}
	)		
	
}


// Render all TOTALS in the top
function renderExpenseTopRows(fromYear, toYear, fromMonth, toMonth, expenseCategoryArray, printArr) {
	var countYear = 0;
	var countMonth = 0;
	var cntFromMonth = 0;
	var cntToMonth = 0;
	var htmlCode = '';
	var totalArray	= [];
	var monthTxt	= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	var htmlTH = '<th style="white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial; font-weight:bold; color:#000000;">#FIELD#</th>'
	var htmlCategory = '<td style="white-space: nowrap; padding-left:8px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; height:24px; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTD = '<td style="white-space: nowrap; padding-left:8px; padding-right:4px; text-align:right; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTotalHead = '<td style="white-space: nowrap; padding-left:8px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; border-top:2px solid #666666; border-bottom:2px solid #666666; height:24px; font-size:14px; font-weight:bold; font-family:Arial;">#FIELD#</td>'
	var htmlTotal = '<td style="white-space: nowrap; padding-left:8px; padding-right:4px; text-align:right; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; border-top:2px solid #666666; border-bottom:2px solid #666666; font-size:14px; font-weight:bold; font-family:Arial;">#FIELD#</td>'

	var htmlCode = '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;" id="totalExpenseTable">'
	htmlCode += '<tr>'
	htmlCode +=htmlTH.replace('#FIELD#', 'Category');
	
	// Generate the table header with months
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
			htmlCode +=htmlTH.replace('#FIELD#', monthTxt[countMonth-1] + "-" + ('0'+(countYear)).slice(-2));
		}
	}
	htmlCode +=htmlTH.replace('#FIELD#', 'Total');
	htmlCode +=htmlTH.replace('#FIELD#', 'Average');
	htmlCode +='</tr>' 

	// Generate the rows with data
	for (var i=0; i<expenseCategoryArray.length; i++) {

		var totalCategory = 0;
		var avgCount = 0;	

		htmlCode +='<tr>' 
		htmlCode +=htmlCategory.replace('#FIELD#', expenseCategoryArray[i]._id);

		var selected = printArr.filter(function(obj){
			return obj.category == expenseCategoryArray[i]._id;
		})	
		
		for (var j=0; j<selected.length; j++) {

			// Render the line
			htmlCode +=htmlTD.replace('#FIELD#', accFormat(selected[j].amount));

			// Adding to Totals 
			var totalSelected = totalArray.filter(function(obj){
				return obj.year == selected[j].year && obj.month == selected[j].month;
			})	
			if (totalSelected.length != 1) {
				totalArray.push(
				{
					'category' : selected[j].Category,
					'year' : selected[j].year,
					'month' : selected[j].month,
					'amount' : selected[j].amount
				});
			} else {
				totalSelected[0].amount += selected[j].amount;
			}
			totalCategory += selected[j].amount;
			avgCount += 1;
		}

		// Put total for category
		var renderLine = htmlTD.replace('#FIELD#', accFormat(totalCategory));
		renderLine = renderLine.replace('normal', 'bold');		
		htmlCode +=renderLine;
		
		// Put average category
		var renderLine = htmlTD.replace('#FIELD#', accFormat(Math.round(totalCategory/avgCount)));
		htmlCode +=renderLine;
		htmlCode +='</tr>' 
	}	

	
	// Generate the totals line
	totalCategory = 0;
	avgCount = 0;
	htmlCode +='<tr>' 
	htmlCode +=htmlTotalHead.replace('#FIELD#', 'TOTAL');
	for (var j=0; j<totalArray.length; j++) {
		htmlCode +=htmlTotal.replace('#FIELD#', accFormat(totalArray[j].amount));;
		totalCategory += totalArray[j].amount;
		avgCount += 1;
	}

	// Put total for all property
	var renderLine = htmlTotal.replace('#FIELD#', accFormat(totalCategory));
	htmlCode +=renderLine;
	
	// Put average all property
	var renderLine = htmlTotal.replace('#FIELD#', accFormat(Math.round(totalCategory/avgCount)));
	htmlCode +=renderLine;

	htmlCode +='</tr>' 
	return htmlCode;
}



// Render all DETAILS data at the bottom 
function renderExpenseDetails(currFromDate, currToDate, expenseArray, expenseCategoryArray) {
	var htmlTDL = '<td style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:left; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR = '<td style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:right; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDC = '<td style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:center; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTotal = '<td colspan="6" style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:right; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; border-top:2px solid #666666; border-bottom:2px solid #666666; font-size:14px; font-weight:bold; font-family:Arial;">Total #CATEGORY#</td>'
	var htmlTDRT = '<td style="white-space: nowrap; padding-left:4px; padding-right:4px; text-align:right; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; border-top:2px solid #666666; border-bottom:2px solid #666666; font-size:14px; font-weight:bold; font-family:Arial;">#FIELD#</td>'
	
	var htmlCode = ''
	var dateFrom = Date.parse(currFromDate)/1000;
	var dateTo = Date.parse(currToDate)/1000;
	var lines=0;
	var showProperty = ''

	sortBy(expenseArray, (o) => o.dueDate);
	
	// Loop thru all details
	for (var i=0; i<expenseCategoryArray.length; i++) {

		var currTotal = 0;
		var selected = expenseArray.filter(function(obj){
			return obj.expenseCategory == expenseCategoryArray[i]._id && (obj.dueDate >= dateFrom && obj.dueDate <= dateTo)
		})		

		// Skip if no expenses in this category
		if (selected.length) {
			lines += 4;
			if (lines>44) {
				htmlCode += '</table>';
				htmlCode += reportFooter();			
				htmlCode += reportPageBreak();
				htmlCode += topHeadline(topHeadtxt + ' Details');
				htmlCode += reportHeadline(reportHead)	
				lines=0;
			}
			htmlCode += renderExpenseTableHead(i, expenseCategoryArray);
		}
		
		// Write expense the lines 
		for (var j=0; j<selected.length; j++) {
			console.log ('text: ' + selected[j].text)		
			console.log ('amount: ' + selected[j].amount)		

			// Break every 36 lines  
			lines += 1;
			if (lines>44) {
				htmlCode += '</table>';
				htmlCode += reportFooter();			
				htmlCode += reportPageBreak();
				htmlCode += topHeadline(topHeadtxt + ' Details');
				htmlCode += reportHeadline(reportHead)	
				htmlCode += renderExpenseTableHead(i, expenseCategoryArray);
				lines=0;
			}
			
			// Find property if any
			console.log ('propertyId: ' + selected[j].propertyId)
			console.log ('propertyId: ' + typeof(selected[j].propertyId))
			console.log ('propertyId: ' + selected[j].propertyId[0])
			
			// Should this expense be split between several properties?
			if (typeof(selected[j].propertyId)=='object') {
				console.log ('ITS ARRAY!!!')
				showProperty = 'MULTIPLE';
			} else {
				console.log ('Its single property ')
				showProperty = selected[j].propertyId;
			}

			if (isNaN(new Date(selected[j].paidDate*1000))) {
				var textPaid = ""; // selected[j].paidDate;
			} else {
				var textPaid = new Date(selected[j].paidDate*1000).format('d/m/Y');
			}
			htmlCode += '<tr>' + 
						htmlTDC.replace('#FIELD#','' + new Date(selected[j].dueDate*1000).format('d/m/Y')) + 
						htmlTDC.replace('#FIELD#', textPaid) + 
						htmlTDL.replace('#FIELD#',selected[j].text) + 
						htmlTDC.replace('#FIELD#',showProperty) + 
						htmlTDL.replace('#FIELD#',selected[j].account) + 
						htmlTDC.replace('#FIELD#',selected[j].managerId) +
						htmlTDR.replace('#FIELD#',accFormat(selected[j].amount)) +
						'</tr>';
			currTotal += selected[j].amount
		}

		// Write the total line 
		if (selected.length) {
			htmlCode += '<tr>' + htmlTotal.replace('#CATEGORY#',expenseCategoryArray[i]._id) + htmlTDRT.replace('#FIELD#',accFormat(currTotal)) + '</tr>';
			htmlCode += '</table><div style="min-height:6px;"></div> ';
		}
	}
	return htmlCode;
}

// Render table head
function renderExpenseTableHead(cnt, expenseCategoryArray) {
	var htmlHead = '<tr><td colspan="7" style="font-size:22px; color:#4CACCD; padding: 5px 5px 2px 5px; text-align:left;font-weight:bold; font-family:Arial; border:0px;"><b>#FIELD#</b></td></tr>'
	var htmlTH = '<td style="width:#WIDTH#; white-space: nowrap; height:20px; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlCode = '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;">'
	htmlCode += htmlHead.replace('#FIELD#', expenseCategoryArray[cnt]._id + '<span style="font-size:14px; font-family:Arial Narrow, Arial; font-weight:normal; color:#333333;"> &nbsp; (' + expenseCategoryArray[cnt].name + ')</span>');
	htmlCode += '<tr>'  
	var tmp = htmlTH.replace('#WIDTH#','1%') 
	htmlCode += tmp.replace('#FIELD#','Due') 
	var tmp = htmlTH.replace('#WIDTH#','1%') 
	htmlCode += tmp.replace('#FIELD#','Paid') 
	var tmp = htmlTH.replace('#WIDTH#','50%') 
	htmlCode += tmp.replace('#FIELD#','Description') 
	var tmp = htmlTH.replace('#WIDTH#','5%') 
	htmlCode += tmp.replace('#FIELD#','Unit') 
	var tmp = htmlTH.replace('#WIDTH#','10%') 
	htmlCode += tmp.replace('#FIELD#','Account') 
	var tmp = htmlTH.replace('#WIDTH#','10%') 
	htmlCode += tmp.replace('#FIELD#','Manager')
	var tmp = htmlTH.replace('#WIDTH#','10%') 
	htmlCode += tmp.replace('#FIELD#','Amount')
	htmlCode += '</tr>';
	return htmlCode;
}
