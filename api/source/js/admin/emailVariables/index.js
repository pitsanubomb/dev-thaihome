(function () {
  'use strict';
  angular.module('ThaiHome')
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider
        .state('admin.emailVariables', {
          url: 'emailVariables/',
          css: '/css/admin.css',
          controller: 'EmailVaraiblesCtrl',
          templateProvider: function ($templateCache) {
            return $templateCache.get('templates/admin/emailVariables/index.html');
          }
        })
      }])
    .controller('EmailVaraiblesCtrl', ['$stateParams', '$scope', '$state', 'Notification', '$rootScope', 'CONFIG', '$timeout', '$http',
     function ($stateParams, $scope, $state, Notification, $rootScope, CONFIG, $timeout, $http) {
             $http.get(CONFIG.HELPER_URL + '/emailVariable/getVariablesForAdmin/', {
                headers: {'Content-Type': 'application/json'}
              }).then(function(result){
               console.log("VARIABLES", result.data.data);
               $scope.variables = result.data.data;
               $scope.updateStatus = false;
               $scope.actionStatus = true;
               $scope.bufferClean = function(){
                 $scope.variable = {
                   func:"",
                   condition:"",
                   variable:"",
                   default:""
                 };
                 $scope.currentId = '';
               }
               $scope.bufferClean();
               $scope.toggleActionStatus = function(){
                 $scope.actionStatus = !$scope.actionStatus;
               }
               $scope.editVariable = function(id){
                 var currentVariable = $scope.variables.filter(function(obj){
                   return obj._id == id;
                 });
                 currentVariable = currentVariable[0];
                 $scope.variable.variable = currentVariable.variable;
                 $scope.variable.func = currentVariable.func;
                 $scope.variable.condition = currentVariable.condition;
                 $scope.variable.default = currentVariable.default;
                 $scope.currentId = currentVariable._id;
                 $scope.updateStatus = true;
                 $scope.toggleActionStatus();
               }

               $scope.cancel = function(){
                 $scope.toggleActionStatus();
                 $scope.bufferClean();
                 $scope.updateStatus = false;
               }

               $scope.delete = function(id){
                 $http.get(CONFIG.HELPER_URL + '/emailVariable/deleteVariable/' + id, {
                    headers: {'Content-Type': 'application/json'}
                  }).then(function(result){
                    if(!result.data.error){
                      $scope.variables = $scope.variables.filter(function(obj){
                        return obj._id != id;
                      });
                    }
                  });
               };

               $scope.saveVariable = function(){
                 if(!$scope.updateStatus){
                   $http.post(CONFIG.HELPER_URL + '/emailVariable/addVariable/',{
                     func:$scope.variable.func,
                     condition:$scope.variable.condition,
                     variable:$scope.variable.variable,
                     default:$scope.variable.default
                   }, {
                      headers: {'Content-Type': 'application/json'}
                    }).then(function(result){
                      console.log(result);
                      $scope.variables.push(result.data.data);
                      $scope.toggleActionStatus();
                      $scope.bufferClean();
                    });
                 }else{
                   $http.post(CONFIG.HELPER_URL + '/emailVariable/updateVariable/' + $scope.currentId,{
                     func:$scope.variable.func,
                     condition:$scope.variable.condition,
                     variable:$scope.variable.variable,
                     default:$scope.variable.default
                   }, {
                      headers: {'Content-Type': 'application/json'}
                    }).then(function(result){
                      console.log(result);
                      for(var i = 0; i < $scope.variables.length; i++){
                        if($scope.variables[i]._id == result.data.data._id){
                          $scope.variables[i] = result.data.data;
                        }
                      }
                      $scope.toggleActionStatus();
                      $scope.bufferClean();
                      $scope.updateStatus = false;
                    });
                 }
               };


             });
  }]);
})();
