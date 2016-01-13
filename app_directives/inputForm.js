app.directive("inputForm", function (ngForceConfig) {
    return {
        templateUrl: ngForceConfig.resourceUrl + '/app_templates/input-field.html',
        scope: { 
            answers: '=', 
            question: '='
        }, link: function (scope, elem, attr) {
            //if (scope.question.DataType__c == 'date' && angular.isDefined(scope.model)) {
            //    scope.model = new Date(scope.model);
            //}


        }, controller: 'FieldsCtrl'
    }
})

app.directive("showEditControl", function (ngForceConfig) {
    return {
        restrict: "E",
        templateUrl: ngForceConfig.resourceUrl + "/app_templates/editControlButtons.html",
        scope: {},
        require: "^form",
        link: function (scope, element, attrs, form) {
            scope.form = form; 
        },
        controller: 'FormsValidationCtrl'

    }
})

app.controller("FieldsCtrl", ['$scope','$filter' ,function ($scope,$filter) {

    $scope.statuses = [
        {value: 'true', text: 'Yes'},
        {value: 'false', text: 'No'},
    ];
    $scope.inputVal={};
    $scope.init = function() {
    	$scope.inputVal.stringVal=$scope.answers[$scope.question.Id];
    	if ($scope.question.DataType__c == 'number') {//TODO Do this for date etc
               if($scope.inputVal.stringVal){
            	   if(!isNaN(Number($scope.inputVal.stringVal)))
            		   $scope.inputVal.formVal=Number($scope.inputVal.stringVal);
               }
         }else{
        	 $scope.inputVal.formVal=$scope.inputVal.stringVal;
         }
    };
    $scope.init();
//    $scope.$watch('inputVal.formVal', function (newValue, oldValue) {
//    	if(newValue){
//    		console.log('inputVal.formVal : ') 
//            $scope.answers[$scope.question.Id]=newValue ;
//    	}
//    });
    
    $scope.showYesNoOptions = function() {
        var selected = $filter('filter')($scope.statuses, {value: $scope.inputVal.formVal});
        return ($scope.inputVal.formVal && selected.length) ? selected[0].text : '___';
      };

    $scope.validate = function (data, validationClass) {
        //return true;
    	if(data)
    		$scope.answers[$scope.question.Id]=data ;
    	
        if (validationClass == 'DUNS' && (data && data.toString().length < 9)) {
            return "DUNS number cannot be less than 9 digits"
        }

    }

}]);

app.controller("FormsValidationCtrl", ['$scope', function ($scope) {
    $scope.searchButtonText = "Edit";
    $scope.$watch('model', function (newValue, oldValue) {
        //console.log('scope reached child : '+$scope.model);
    });
    $scope.$on('UpdateAnswers', function (args) {
    	$scope.searchButtonText = "Updating..."; 
    });
    $scope.$on('AnswersUpdated', function (args) {
        $scope.searchButtonText = "Edit";
        $scope.$apply();
    });


}]);