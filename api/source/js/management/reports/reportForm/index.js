
app.controller("reportFormController", function ($scope, $http, $rootScope, $location, ReportData) {
    var vm = this;


    //
    // Fill out properties and expenses and reconstruct all other fields
    //
    $scope.loadReport = function () {

        // Put default values in the dates
        var fromDate = new Date();
        var firstDay = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
        var lastDay = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);

        vm.stretchExpense   = true;
        vm.bookingAgents    = true;
        vm.bookingInvoices  = true;
        vm.bookingInclude   = "ACTIVE"; 
        vm.bookingSort      = "DATE"; 
        vm.fldFromDate      = new Date(firstDay.format('Y-m-d'));
        vm.fldToDate        = new Date(lastDay.format('Y-m-d'));

        // Get data from ReportData factory
        var formData = ReportData.get();
        if (formData.reportName!==undefined) {
            console.log("XXX formData.bookingInclude XXX " + formData.bookingInclude);
            console.log("XXX formData.bookingInclude XXX " + formData.bookingInclude);
            vm.reportName       = formData.reportName;
            vm.fldFromDate      = new Date(formData.fromDate*1000);
            vm.fldToDate        = new Date(formData.toDate*1000);
            vm.bankAccounts     = formData.bankAccounts;
            vm.expenseType      = formData.expenseCategory;
            vm.stretchExpense   = formData.stretchExpense;
            vm.bookingInclude   = formData.bookingInclude;
            vm.bookingSort      = formData.bookingSort;
            vm.bookingAgents    = formData.bookingAgents;
            vm.bookingInvoices  = formData.bookingInvoices;
        }


        // Show the form
        $scope.modifyForm()<

        // Load all property IDs
        $http({
            method: 'GET',
            url: globalNodeUrl + 'report/getPropertyIdList'
        }).then(function successCallback(response) {
            vm.propertyIdList = response.data.data;
            vm.propertyIdList.unshift({ "_id": "ALL PROPERTIES" });
            vm.selectedPropertiesMulti = formData.propertyArr;
            vm.selectedPropertiesSingle = formData.propertySingle;
        }, function errorCallback(err) {
            console.log("getPropertyIdList ERROR: " + JSON.stringify(err, null, 4));
        }); 

        // Load all expense categories
        $http({
            method: 'GET',
            url: globalNodeUrl + 'report/getExpenseCategory'
        }).then(function successCallback(response) {
            vm.expenseCategory = response.data.data;
            vm.expenseCategory.unshift({ "_id": "ALL", "name": "All Categories" });
            vm.selectedExpense = formData.expenseArr;
        }, function errorCallback(err) {
            console.log("getExpenseCategory ERROR: " + JSON.stringify(err, null, 4));
        });

        // Load all bank accounts
        $http({
            method: 'GET',
            url: globalNodeUrl + 'report/getBankList'
        }).then(function successCallback(response) {
            vm.bankAccounts = response.data.data;
            vm.bankAccounts.unshift({ "_id": "ALL", "account": "All Accounts" });
            vm.selectedBank = formData.bankArr;
        }, function errorCallback(err) {
            console.log("getBankList ERROR: " + JSON.stringify(err, null, 4));
        });
    }


    //
    // Gets data from form and push to router or page
    //
    $scope.callReport = function () {

        console.log ('CALL REPORT: ' + vm.reportName)
        // console.log ('SINGLE: ' + vm.selectedPropertiesSingle)
        // console.log ('MULTI: ' + vm.selectedPropertiesMulti)
        // console.log ('EXPENSE: ' + vm.selectedExpense)

        var expenseArr = [];
        if (!vm.selectedExpense || vm.selectedExpense[0]._id=='ALL'){
            expenseArr = '';
        } else {
            expenseArr = vm.selectedExpense;
        }

        var bankArr = [];
        if (!vm.selectedBank || vm.selectedBank[0]._id=='ALL'){
            bankArr = '';
        } else {
            bankArr = vm.selectedBank;
        }

        var propertyArr = [];
        if (!vm.selectedPropertiesMulti || vm.selectedPropertiesMulti[0]._id=='ALL PROPERTIES') {
            propertyArr = '';
        } else {
            propertyArr = vm.selectedPropertiesMulti;
        }

        ReportData.add(
            {
                reportName:         vm.reportName,
                fromDate:           new Date(vm.fldFromDate)/1000,
                toDate:             new Date(vm.fldToDate)/1000,
                expenseCategory:    vm.expenseType,
                stretchExpense:     vm.stretchExpense,
                bookingInclude:     vm.bookingInclude,
                bookingSort:        vm.bookingSort,      
                bookingAgents:      vm.bookingAgents,    
                bookingInvoices:    vm.bookingInvoices,  
                propertySingle:     vm.selectedPropertiesSingle,
                bankArr:            bankArr,
                expenseArr:         expenseArr,
                propertyArr:        propertyArr
            }
        );

        switch(vm.reportName) {
            case 'BANK':
                var url='reportBankAccount/';
                break;

            case 'EXPENSES':
                var url='reportExpense/';
                break;

            case 'AGENTSALE':
                var url='reportAgentSale/';
                break;

            case 'AGENTRENT':
                var url='reportAgentRent/';
                break;

            case 'BALANCE':
                var url='reportBalanceSheet/';
                break;

            case 'BOOKING':
                var url='reportBooking/';
                break;
        }
        $location.path(url);
    }


    //
    // Report selected, show the correct fields
    //
    $scope.modifyForm = function () {

        $scope.lineOne              = true;
        $scope.showFromDate         = false;
        $scope.showToDate           = false;
        $scope.lineTwo              = false;
        $scope.expenseCategories    = false;
        $scope.bankAccounts         = false;
        $scope.expenseStretch       = false;
        $scope.includeBookings      = false;
        $scope.sortBookings         = false;
        $scope.bookingAgent         = false;
        $scope.bookingInvoice       = false;
        $scope.lineThree            = false;
        $scope.propertiesMulti      = false;
        $scope.propertiesSingle     = false;
        $scope.lineFour             = false;
        $scope.generate             = false;

        switch(vm.reportName) {

            case '':
                break;

            case 'STATUS':
                $scope.showFromDate         = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                vm.fldFromDate              = new Date(new Date().format('Y-m-d'));
                break;

            case 'BANK':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.bankAccounts         = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'BOOKING':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.includeBookings      = true;
                $scope.sortBookings         = true;
                $scope.bookingAgent         = true;
                $scope.bookingInvoice       = true;
                $scope.lineThree            = true;
                $scope.propertiesMulti      = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'OCCUPANCY':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.propertiesMulti      = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'EXPENSES':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.expenseCategories    = true;
                $scope.expenseStretch       = true;
                $scope.lineThree            = true;
                $scope.propertiesMulti      = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'BALANCE':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.propertiesSingle     = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'PERFORMANCE':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.propertiesSingle     = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'REVENUE':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.expenseStretch       = true;
                $scope.lineThree            = true;
                $scope.propertiesMulti      = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'PROFIT':
            case 'ROIBUY':
            case 'ROISALE':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.propertiesMulti     = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'AGENTSALE':
            case 'AGENTRENT':
                $scope.propertiesMulti      = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;

            case 'CHANNEL':
                $scope.showFromDate         = true;
                $scope.showToDate           = true;
                $scope.lineTwo              = true;
                $scope.propertiesMulti      = true;
                $scope.lineFour             = true;
                $scope.generate             = true;
                break;


        }
    }
})
            


function callReportLink(nameReport) {
    switch(nameReport) {

        case 'BOOKINGS':
            document.location.href='ReportBookings.html';
            break;		
    
        case 'OCCUPANCY':
            document.location.href='ReportOccupancy.html';
            break;

        case 'EXPENSES':
            document.location.href='ReportExpenses.html';
            break;

        case 'BALANCE':
            document.location.href='ReportProperty.html';
            break;

        case 'PERFORMANCE':
            document.location.href='ReportPerformance.html';
            break;

        case 'REVENUE':
            profit  = false; 				
            ROIbuy  = false;
            ROIsale = false;
            document.location.href='ReportProfit.html';
            break;

        case 'PROFIT':
            stretch = true; 				
            profit  = true; 				
            ROIbuy  = false;
            ROIsale = false;
            document.location.href='ReportProfit.html';
            break;
            
        case 'ROIBUY':
            stretch = true; 				
            profit  = true; 				
            ROIbuy  = true;
            ROIsale = false;
            document.location.href='ReportProfit.html';
            break;

        case 'ROISALE':
            stretch = true; 				
            profit  = true; 				
            ROIbuy  = false;
            ROIsale = true;
            document.location.href='ReportProfit.html';
            break;

        case 'AGENTSALE':
            document.location.href='ReportAgentSale.html';
            break;

        case 'AGENTRENT':
            document.location.href='ReportAgentRent.html';
            break;
                            
            
    }
}

