app.controller('questionsCtrl', ['$scope', 'vfr', 'ngForceConfig', 'questionnaireService', 'identityService', 
                                 'sharedObject', '$timeout','$location','$routeParams', '$rootScope',
                                 function($scope, vfr,ngForceConfig,questionnaireService, identityService, 
                                		 sharedObject, $timeout,$location,$routeParams, $rootScope) {

		$scope.user = [];
        $scope.answers = {};
        $scope.user = sharedObject.get('user');
        $scope.searchButtonText = "Update";

		$scope.supplierID = $routeParams.Id;
		console.log($scope.supplierID)

   		$scope.$watch('supplier', function (value) {
            $scope.supplier = value;
            if (angular.isDefined($scope.supplier)) {
                questionnaireService.getAnswerObj($scope.supplier).then(function (resp) {
                    if (angular.isDefined(resp) && resp.length >= 0) {
                        for (var item in resp) {
                            $scope.answers[resp[item].Question__c] = resp[item].ResponseText__c;
                        }

                    }
                });
            }
        });


        identityService.fetchBuyerCommunity($scope.user).then(function (resp) {
            $scope.buyers = resp;
        });



        questionnaireService.getQuestionnaire($scope.user).then(function (d) {
            $scope.questions = d;
            $scope.questionnaire = $scope.makeQuestionTree();
        });


        $scope.publishTo = function (buyer){


        }

        $scope.$on('UpdateAnswers', function(args) {
        	 questionnaireService.updateQuestionnaireResponses($scope.supplier,$scope.buyers,$scope.answers).then(function(resp){
        		 $rootScope.$broadcast("AnswersUpdated",[]);
             });
	    });
        
        $scope.upDateAnswer = function () {
            $scope.searchButtonText = "Updating";
            questionnaireService.updateQuestionnaireResponses($scope.supplier,$scope.buyers,$scope.answers).then(function(resp){
                $scope.searchButtonText = "Update";
            });
        }

        $scope.makeQuestionTree = function () {		 //TODO may be better when located apex service.
            function findintree(m, v) {
                for (var i = 0; i < m.length; i++) {
                    var q = m[i];
                    if (v.Parent__c && q.Id === v.Parent__c) {
                        q.children.push(v);
                        found.parent = true;
                    }
                    if (q.Parent__c && q.Parent__c === v.Id) {
                        var json_data = JSON.stringify(q);
                        var copyq = JSON.parse(json_data);
                        v.children.push(copyq);
                        if (found.child) {
                            m.splice(i, 1);
                            i--;
                        }
                        else
                            m.splice(i, 1, v);
                        found.child = true;
                        continue;
                    }
                    if (q.children.length > 0) {
                        findintree(q.children, v);
                    }
                }
                return;
            };
            var tree = [];
            var qs = $scope.questions;
            for (var i = 0; i < qs.length; i++) {
                var q = qs[i];
                q.children = [];
                var found = {parent: false, child: false};

	    	findintree(tree,q,found);
	    	if(!found.child && !found.parent){
	    		tree.push(q);
	    	}
		}

		return tree;
	};



    }]);