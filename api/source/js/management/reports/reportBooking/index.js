//
// WHAT DO reportBooking NEED FROM THE REPORT-FORM?
//
// - From and To Date
// - Multiple properties or ALL
// - Booking Status
// - Sort by
// - Include Agents and Invoices?
//
app.controller("reportBookingController", function ($scope, $http, $rootScope, $location, ReportData) {

	var topHeadtxt = 'Booking Report';
    var formData = ReportData.get();
    console.log('######### REPORT: ' + formData.reportName);
    console.log('fromDate: ' + formData.fromDate);
    console.log('toDate: ' + formData.toDate);
    console.log('bookingInclude: ' + formData.bookingInclude);
    console.log('bookingSort: ' + formData.bookingSort);
    console.log('bookingAgents: ' + formData.bookingAgents);
    console.log('bookingInvoices: ' + formData.bookingInvoices);
    console.log('propertyArr: ' + JSON.stringify(formData.propertyArr, null, 4));


	// Load all data
	var findData = function() {
		return new Promise((resolve, reject) => {
		$http({
			method: 'POST',
			url: globalNodeUrl + 'report/getBookingList',
			headers: { 'Content-Type': 'application/json' },
			data: { fromDate: formData.fromDate, toDate: formData.toDate, status: formData.bookingInclude, propertyID: formData.propertyArr }
		}).then(function successCallback(res) {
			console.log('WE GOT getBookingList DATA BACK FROM ROUTER!!!')
			// console.log('data: ' + JSON.stringify(res.data, null, 4))
            resolve(res.data);
		}, function errorCallback(err) {
			reject(new Error('getBookingList ERROR : ' + err));
		});
	})};


	// Create HTML for the entire report page
	var makeReport = function(data) {
		return new Promise((resolve, reject) => {
		console.log('WE MAKE THE REPORT!!!');
		let bookingkArray = data.booking;
		let receiptArray = data.receipt;
		let invoiceArray = data.invoice;
		console.log('### bookingkArray: ' + JSON.stringify(bookingkArray, null, 4))
		console.log('### receiptArray: ' + JSON.stringify(receiptArray, null, 4))
		console.log('### invoiceArray: ' + JSON.stringify(invoiceArray, null, 4))
		var htmlCode = setupBookingReport(
			formData.fromDate, 
			formData.toDate, 
			formData.bookingInclude,	
			formData.bookingSort,	
			formData.bookingAgents,	
			formData.bookingInvoices,	
			bookingkArray, 
			receiptArray, 
			invoiceArray, 
			topHeadtxt
		)
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
			console.log("reportBookingController ERROR: " + err.message );
			return;
		})

})


// Setup Booking List Report
function setupBookingReport(parmFromDate, parmToDate, includeBookings, sortBookings, showAgent, showInv, bookingArray, receiptArray, invoiceArray, topHeadtxt) {
	
	document.title = topHeadtxt;
	var htmlCode = '';

	console.log("parmFromDate: " + parmFromDate)
	console.log("showAgent: " + showAgent)
	console.log("includeBookings: " + includeBookings)
	console.log("receiptArray: " + receiptArray)
	console.log("sortBookings: " + sortBookings)

	// Prepair the dates
	var fromDate = new Date(parmFromDate*1000);
	var toDate = new Date(parmToDate*1000);
	var reportHead = 'Period from <b>' + fromDate.format('d M Y') + '</b> to <b>' + toDate.format('d M Y') + '</b>';
	var showChannel = true;
	var showStatus = true;
	var showUnit = true;

	// Set the headline and the status conditions
	switch(includeBookings) {
		case 'ACTIVE':
			var txtInclude = 'Active Bookings'
			break;
		case 'ALL':
			var txtInclude = 'All Bookings'
			break;
		case 'NOPAY':
			var txtInclude = 'Unpaid Bookings'
			break;
		case '0':
			var txtInclude = 'New Bookings'
			break;
		case '1':
			var txtInclude = 'Pending'
			break;
		case '2':
			var txtInclude = 'Booked'
			break;
		case '3':
			var txtInclude = 'Check-in'
			break;
		case '4':
			var txtInclude = 'Check-out'
			break;
		case '5':
			var txtInclude = 'Done'
			break;
		case '6':
			var txtInclude = 'Cancelled'
			break;
	}


	
	// Sort bookingArray by different things
	switch(sortBookings) {
		case 'DATE':
			var txtSort = 'Checkin Date'
			sortBy(bookingArray, (o) => o.checkin);
			break;
		case 'CHANNEL':
			var txtSort = 'Booking Channel'
 			sortBy(bookingArray, (o) => [o.source, o.checkin]);
			break;
		case 'PROPERTY':
			var txtSort = 'Property'
			sortBy(bookingArray, (o) => [o.property, o.checkin]); 
			break;
		case 'STATUS':
			var txtSort = 'Booking Status'
 			sortBy(bookingArray, (o) => [o.status, o.checkin]);
			break;
	}

	sortBy(invoiceArray, (o) => o._id);

	// Put page title the same as report headline
	document.title = txtInclude + ' sort by ' + txtSort;
	topHeadtxt = txtInclude + ' sort by ' + txtSort ; 
	
	// Render the report 
	var fldSort = ''
	var htmlCode = ''
	htmlCode = '';
	htmlCode += topHeadline(topHeadtxt);
	htmlCode += reportHeadline(reportHead)	
	

	// DATE
	if (sortBookings=='DATE') {
		htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
	
		// Loop thru all bookings
		var lines=0;
		for (var i=0; i<bookingArray.length; i++) {	
			htmlCode += renderBookings(i, includeBookings, sortBookings, showChannel, showStatus, showUnit, showAgent, showInv, bookingArray, receiptArray, invoiceArray);

			// Break every 28 lines  
			lines += 1;
			if (lines>28) {
				lines = 0;
				htmlCode += '</table>';
				htmlCode += reportFooter();			
				htmlCode += reportPageBreak();
				htmlCode += topHeadline(topHeadtxt);
				htmlCode += reportHeadline(txtSort)	
				htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
			}
		}

	} else {

	
		// CHANNEL
		if (sortBookings=='CHANNEL') {

			showChannel = false;
			htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
			
			// Loop thru all bookings
			var lines = 0;
			for (var i=0; i<bookingArray.length; i++) {	
				if (fldSort != bookingArray[i].source || lines>26) {
					fldSort = bookingArray[i].source;
					// Break every 26 lines  
					lines += 2;
					if (lines>26) {
						lines = 0;
						htmlCode += '</table>';
						htmlCode += reportFooter();			
						htmlCode += reportPageBreak();
						htmlCode += topHeadline(topHeadtxt);
						htmlCode += reportHeadline(txtSort)	
						htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
					}
					var htmlHead = '<tr><th colspan="20" style="background-color:#EEEEEE; color:#000000; border:1px solid #AAAAAA; text-align:left; height:38px; padding-left:6px; white-space: nowrap;">#FIELD#</th></tr>'
					var txtStatus = '<div style="background-color:#999999; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">UNKNOWN</div>'
					switch(fldSort) {
						case '':
							var txtStatus = '<div style="background-color:#999999; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">UNKNOWN</div>'
							break;
						case 'T':
							var txtStatus = '<div style="background-color:#4CACCD; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">THAIHOME</div>'
							break;
						case 'B':
							var txtStatus = '<div style="background-color:#003580; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">BOOKING.COM</div>'
							break;
						case 'A':
							var txtStatus = '<div style="background-color:#FF8084; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">AIRBNB</div>'
							break;
						case 'E':
							var txtStatus = '<div style="background-color:#00355F; color:#FFCB00; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">EXPEDIA</div>'
							break;
						case 'G':
							var txtStatus = '<div style="background-color:#C59064; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">AGENTS</div>'
							break;
					}
					htmlCode += htmlHead.replace('#FIELD#', txtStatus);
				}
				if (fldSort != '') {
					htmlCode += renderBookings(i, includeBookings, sortBookings, showChannel, showStatus, showUnit, showAgent, showInv, bookingArray, receiptArray, invoiceArray);
					lines += 1;
				}
				
			}
		}


		// PROPERTY
		if (sortBookings=='PROPERTY') {

			// Make the table header
			var lines = 0;
			showUnit = false;
			htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
			
			// Loop thru all bookings
			var lines = 0;
			for (var i=0; i<bookingArray.length; i++) {	

				if (fldSort != bookingArray[i].property || lines>24) {
					fldSort = bookingArray[i].property;
					// Break every 25 lines  
					lines += 2;
					if (lines>24) {
						lines = 0;
						htmlCode += '</table>';
						htmlCode += reportFooter();			
						htmlCode += reportPageBreak();
						htmlCode += topHeadline(topHeadtxt);
						htmlCode += reportHeadline(txtSort)	
						htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
					}
					var htmlHead = '<tr><th colspan="20" style="background-color:#EEEEEE; color:#000000; border:1px solid #AAAAAA; text-align:left; height:38px; padding-left:6px; white-space: nowrap;">#FIELD#</th></tr>'
					var txtStatus = '<div style="padding-left:10px; background-color:#FFFFFF; color:#333333; width:250px; display: block; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">Property: &nbsp; ' + bookingArray[i].property + '</div>'
					htmlCode += htmlHead.replace('#FIELD#', txtStatus);
				}
				if (fldSort != '') {
					htmlCode += renderBookings(i, includeBookings, sortBookings, showChannel, showStatus, showUnit, showAgent, showInv, bookingArray, receiptArray, invoiceArray);
					lines += 1;
				}
			}
		}


		// STATUS
		if (sortBookings=='STATUS') {

			// Make the table header
			var lines = 0;
			showStatus = false;
			htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
			fldSort = 99;
			
			// Loop thru all bookings
			var lines = 0;
			for (var i=0; i<bookingArray.length; i++) {	
				if (fldSort != bookingArray[i].status || lines>24) {
					fldSort = bookingArray[i].status;
					// Break every 25 lines  
					lines += 2;
					if (lines>24) {
						lines = 0;
						htmlCode += '</table>';
						htmlCode += reportFooter();			
						htmlCode += reportPageBreak();
						htmlCode += topHeadline(topHeadtxt);
						htmlCode += reportHeadline(txtSort)	
						htmlCode += renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv);
					}
					var htmlHead = '<tr><th colspan="20" style="background-color:#EEEEEE; color:#000000; border:1px solid #AAAAAA; text-align:left; height:40px; padding-left:6px; white-space: nowrap;">#FIELD#</th></tr>'
					var txtStatus = '<div style="background-color:#999999; color:#FFFFFF; width:250px; display: block; text-align:center; font-weight:bold; font-size:18px; font-family:Roboto, Arial;">UNKNOWN</div>'
					switch(fldSort) {
						case 0:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#FFE5E5;border: 1px solid #804040; color:#804040; width:200px; display: block;">NEW BOOKINGS</div>'
							break;
						case 1:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#FFE5E5;border: 1px solid #804040; color:#804040; width:200px; display: block;">PENDING</div>'
							break;
						case 2:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#DDFFDD;border: 1px solid #007000; color:#007000; width:200px; display: block;">BOOKED</div>'
							break;
						case 3:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#DDFFDD;border: 1px solid #007000; color:#007000; width:200px; display: block;">CHECKIN</div>'
							break;
						case 4:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#E0E0E0;border: 1px solid #808080; color:#404040; width:200px; display: block;">CHECKOUT</div>'
							break;
						case 5:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#E0E0E0;border: 1px solid #808080; color:#404040; width:200px; display: block;">DONE</div>'
							break;
						case 6:
							var txtStatus = '<div style="padding-left:12px; font-family:Roboto, Arial; font-size:18px; background-color:#E0E0E0;border: 1px solid #808080; color:#404040; width:200px; display: block;">CANCEL</div>'
							break;
					}
					htmlCode += htmlHead.replace('#FIELD#', txtStatus);
				}
				if (fldSort != 99) {
					htmlCode += renderBookings(i, includeBookings, sortBookings, showChannel, showStatus, showUnit, showAgent, showInv, bookingArray, receiptArray, invoiceArray);
					lines += 1;
				}
			}
		}
	}	

	// Render footer
	htmlCode += '</table>';
	htmlCode += reportFooter();			
	
	return htmlCode;
}

// Render the table header
function renderBookingTableHeader(showChannel, showStatus, showUnit, showAgent, showInv){
	var htmlTHL = '<td style="text-align:left; height:26px; padding-left:6px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlTHC = '<td style="text-align:center; height:26px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlTHR = '<td style="text-align:right; height:26px; padding-right:6px; white-space: nowrap; background-color:#EEEEEE; border:1px solid #AAAAAA; font-size:14px; font-family:Arial Narrow; font-weight:bold; color:#000000;">#FIELD#</td>'
	var htmlCode = '';
	htmlCode += '<table border="0" cellspacing="0" cellpadding="0" style="width:100%; background-color:#FFFFFF; border-spacing:0px; border-collapse:collapse; border:1px solid #AAAAAA; padding:8px 8px 8px 8px;">'
	htmlCode += '<tr>'
	if (showChannel) {htmlCode += htmlTHC.replace('#FIELD#', 'Ch')};
	if (showStatus) {htmlCode += htmlTHC.replace('#FIELD#', 'Status')};
	if (showUnit) {htmlCode += htmlTHL.replace('#FIELD#', 'Unit')};
	htmlCode += htmlTHL.replace('#FIELD#', 'Book');
	htmlCode += htmlTHC.replace('#FIELD#', 'Checkin');
	htmlCode += htmlTHC.replace('#FIELD#', 'Checkout');
	htmlCode += htmlTHC.replace('#FIELD#', 'Nights');
	htmlCode += htmlTHL.replace('#FIELD#', 'Tenant');
	if (showAgent) {htmlCode += htmlTHL.replace('#FIELD#', 'Agent')};
	htmlCode += htmlTHR.replace('#FIELD#', 'Price');
	htmlCode += htmlTHR.replace('#FIELD#', 'Paid');
	htmlCode += htmlTHR.replace('#FIELD#', 'Missing');
	if (showInv) {
		htmlCode += htmlTHC.replace('#FIELD#', 'Inv');
		htmlCode += htmlTHC.replace('#FIELD#', 'Rec');
	}
	htmlCode += '</tr>'
	return htmlCode;
}


// Render the bookings
function renderBookings(x, includeBookings, sortBookings, showChannel, showStatus, showUnit, showAgent, showInv, bookingArray, receiptArray, invoiceArray){
	var htmlTDL = '<td style="text-align:left; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDC = '<td style="text-align:center; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#FFFFFF; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR1 = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#f6e4bc; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	var htmlTDR2 = '<td style="text-align:right; height:30px; white-space: nowrap; padding-left:4px; padding-right:4px; color:#000000; background-color:#bbf6bb; border:1px solid #AAAAAA; font-size:14px; font-weight:normal; font-family:Arial;">#FIELD#</td>'
	
	// Find invoices
	var selectInvoice = invoiceArray.filter(function(obj){
		return obj.bookingId == bookingArray[x]._id;
	})			
	var  invoiceTotal = 0;
	var  invoices = '';
	for (var k=0; k<selectInvoice.length; k++) {	
		invoices += selectInvoice[k]._id + ','
		invoiceTotal += selectInvoice[k].sum 
	}
	if (invoices!='') {invoices=invoices.slice(0, -1)}
	if (invoiceTotal < (bookingArray[x].priceDay * bookingArray[x].nights)) {invoiceTotal = bookingArray[x].priceDay * bookingArray[x].nights;}

	
	// Find receipts
	var selectReceipt = receiptArray.filter(function(obj){
		return obj.bookingId == bookingArray[x]._id;
	})			
	var  receiptTotal = 0;
	var  receipts = '';
	for (var k=0; k<selectReceipt.length; k++) {	
		receiptTotal += selectReceipt[k].amount
		receipts += selectReceipt[k]._id + ','
	}
	if (receipts!='') {receipts=receipts.slice(0, -1)}
	if (receiptTotal > 0) {
		var paidAlready = '<span style="color:#007700; font-weight:bold;">' + accFormat(receiptTotal) + '</span>'
	} else {
		var paidAlready = '<span style="color:#999999; font-weight:bold;">0</span>'
	}
	if (receiptTotal<invoiceTotal){
		var missingPayment = '<span style="color:#770000; font-weight:bold;">' + accFormat(invoiceTotal-receiptTotal) + '</span>'
	} else if (receiptTotal>invoiceTotal){
		var missingPayment = '<span style="color:#003300; font-weight:bold;">' + accFormat(invoiceTotal-receiptTotal) + '</span>'
	} else {
		var missingPayment = '<span style="color:#999999; font-weight:bold;">0</span>'
	}

	if (includeBookings=='NOPAY' && receiptTotal>=(invoiceTotal+500)) {
		return htmlCode;
	}	
	
	// Render result
	var htmlCode = '';
	htmlCode += '<tr>'
	
	if (showChannel) {
		var txtStatus = '';
		switch(bookingArray[x].source) {
			case 'T':
				var txtStatus = '<div style="font-family:Roboto, Arial; font-size:14px; background-color:#4CACCD; color:#FFFFFF; width:14px; display: block; text-align:center; font-weight:bold;">T</div>'
				break;
			case 'B':
				var txtStatus = '<div style="font-family:Roboto, Arial; font-size:14px; background-color:#003580; color:#FFFFFF; width:14px; display: block; text-align:center; font-weight:bold;">B</div>'
				break;
			case 'A':
				var txtStatus = '<div style="font-family:Roboto, Arial; font-size:14px; background-color:#FF8084; color:#FFFFFF; width:14px; display: block; text-align:center; font-weight:bold;">A</div>'
				break;
			case 'E':
				var txtStatus = '<div style="font-family:Roboto, Arial; font-size:14px; background-color:#00355F; color:#FFCB00; width:14px; display: block; text-align:center; font-weight:bold;">E</div>'
				break;
			case 'G':
				var txtStatus = '<div style="font-family:Roboto, Arial; font-size:14px; background-color:#C59064; color:#FFFFFF; width:14px; display: block; text-align:center; font-weight:bold;">G</div>'
				break;
		}	
		htmlCode += htmlTDC.replace('#FIELD#', txtStatus)
	};

	if (showStatus) {
		var txtStatus = '';
		switch(bookingArray[x].status) {
			case 0:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#FFE5E5;border: 1px solid #804040; color:#804040; width:60px; display: block;">NEW BOOK</div>'
				break;
			case 1:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#FFE5E5;border: 1px solid #804040; color:#804040; width:60px; display: block;">PENDING</div>'
				break;
			case 2:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#DDFFDD;border: 1px solid #007000; color:#007000; width:60px; display: block;">BOOKED</div>'
				break;
			case 3:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#DDFFDD;border: 1px solid #007000; color:#007000; width:60px; display: block;">CHECKIN</div>'
				break;
			case 4:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#E0E0E0;border: 1px solid #808080; color:#404040; width:60px; display: block;">CHECKOUT</div>'
				break;
			case 5:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#E0E0E0;border: 1px solid #808080; color:#404040; width:60px; display: block;">DONE</div>'
				break;
			case 6:
				var txtStatus = '<div style="font-family:Arial Narrow; font-size:12px; background-color:#E0E0E0;border: 1px solid #808080; color:#404040; width:60px; display: block;">CANCEL</div>'
				break;
		}
		htmlCode += htmlTDC.replace('#FIELD#', txtStatus)
	};
	
	if (showUnit) {htmlCode += htmlTDL.replace('#FIELD#', bookingArray[x].property)};
	htmlCode += htmlTDC.replace('#FIELD#', '<span style="font-family:Arial Narrow">' + bookingArray[x]._id + '</span>');
	htmlCode += htmlTDC.replace('#FIELD#', new Date(bookingArray[x].checkin*1000).format('d/m/Y'));
	htmlCode += htmlTDC.replace('#FIELD#', new Date(bookingArray[x].checkout*1000).format('d/m/Y'));
	htmlCode += htmlTDR.replace('#FIELD#', daysBetween(new Date(bookingArray[x].checkin*1000), new Date(bookingArray[x].checkout*1000)));
	htmlCode += htmlTDL.replace('#FIELD#', '<span style="font-family:Arial Narrow">' + (bookingArray[x].name.substr(0,24)) + '[' + bookingArray[x].langCode + ']' + '</span>');
	if (showAgent) {htmlCode += htmlTDL.replace('#FIELD#', '<span style="font-family:Arial Narrow">' + (bookingArray[x].agent.substr(0,15)) + '</span>')};
	htmlCode += htmlTDR.replace('#FIELD#', '<span style="color:#000000; ">' + accFormat(invoiceTotal) + '</span>');
	htmlCode += htmlTDR.replace('#FIELD#', paidAlready);
	htmlCode += htmlTDR.replace('#FIELD#', missingPayment);
	if (showInv) {
		htmlCode += htmlTDL.replace('#FIELD#', '<span style="color:#333333; font-family:Arial Narrow;">' + invoices + '</span>');
		htmlCode += htmlTDL.replace('#FIELD#', '<span style="color:#333333; font-family:Arial Narrow;">' + receipts + '</span>');
	}
	htmlCode += '</tr>'
	return htmlCode;
}
