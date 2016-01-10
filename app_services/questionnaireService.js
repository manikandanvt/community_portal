app.service('questionnaireService', ['vfr', 'sharedObject', function (vfr, sharedObject) {
    this.getQuestionnaire = function (user) {

        var level = user.CommunityAccount__r.Level__c;

        var selectCriteria = '';
        if (level == '1') {
            selectCriteria = ' where RegisteredLevel__c= 1 ';
        } else {
            //get the selector obj.. for now keep it as empty..
        }
        var questionnaireQuery = vfr.query("Select Id,  Name, DataType__c, isAnswerRequired__c, isPrefilledbyDNB__c, QuestionText__c, Selector__c, QuestionType__c, Parent__c, DisplayLevel__c, DisplayOrder__c, RegisteredLevel__c FROM Question__c" + selectCriteria);
        return questionnaireQuery.then(function (response) {
            return response.records;
        });
    }
 
    this.getAnswerObj = function (supplier) {
        var query = vfr.query("Select Buyer__c,Question__c,ResponseID__c,ResponseText__c,Status__c,Supplier__c from Supplierresponse__c where supplier__c='" + supplier.Id + "'");
 
        return query.then(function (response) {
            return response.records;
        });
    }
 
    this.getPublishedAnswerObj = function (supplier, buyerID) {
        var query = vfr.query("Select Buyer__c,Question__c,ResponseID__c,ResponseText__c,Status__c,Supplier__c from PublishedQuestionnaire__c  where supplier__c='" + supplier.Id + "' and buyer__c='" + buyerID + "'");
        console.log("Select Buyer__c,Question__c,ResponseID__c,ResponseText__c,Status__c,Supplier__c from PublishedQuestionnaire__c  where supplier__c='" + supplier.Id + "' and buyer__c='" + buyerID + "'");
        return query.then(function (response) {
            return response.records;
        });
    }

    this.getInvitations = function (supplier) {
        var query = vfr.query("SELECT Campaign__r.Buyer__r.Id,Campaign__r.Buyer__r.Name,Notes__c,Status__c,Id FROM Invitation__c where supplier__r.Id='" + supplier.Id + "'");
        return query.then(function (response) {
            return response.records;
        });
    }

    this.updateQuestionnaireResponses = function (supplier, answerModel) {
        var answerObj = [];
        for (var item in answerModel)
            if (answerModel.hasOwnProperty(item)) {
                var tmpJson = {
                    //"Buyer__c": buyers[0].Buyer__c,
                    "Question__c": item,
                    "ResponseID__c": item + supplier.Id,
                    "ResponseText__c": answerModel[item],
                    "Supplier__c": supplier.Id
                }
                answerObj.push(tmpJson);
            }
        return vfr.updateResponse(angular.toJson(answerObj));
    }

    this.updateInvitationStatus = function (invitationId, status) {
        var tmpArray = [];
        var tmpJson = {
            "Id": invitationId,
            "Status__c": status
        }

        tmpArray.push(tmpJson);
        console.log(tmpArray);
        // Issue in ngforce.. update does not seem to work.. using bulk update insert as a work around..
        return vfr.bulkUpdate("Invitation__c", angular.toJson(tmpArray));
    }
    this.publish = function (supplier, buyerId, answerModel) {
        var answerObj = [];
        for (var item in answerModel)
            if (answerModel.hasOwnProperty(item)) {
                var tmpJson = {
                    "Buyer__c": buyerId,
                    "Question__c": item, 
                    "ResponseID__c": item + buyerId + supplier.Id,
                    "ResponseText__c": answerModel[item],
                    "Supplier__c": supplier.Id,
                    "Status__c": "published"
                }
                answerObj.push(tmpJson);
            }

        return vfr.publishResponse(angular.toJson(answerObj));
    }

}]);
