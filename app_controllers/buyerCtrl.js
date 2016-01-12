app.controller('buyerCtrl', ['$scope', 'vfr', 'buyerService', 'identityService', 'sharedObject', '$timeout',
    function ($scope, vfr, buyerService, identityService, sharedObject, $timeout) {

        $scope.user = [];
        $scope.answers = {};
        $scope.user = sharedObject.get('user'); 
        $scope.tierDetails = {};
        $scope.inviteDetails = {};
        $scope.suppliers = [];
        $scope.invitaions = [];
        $scope.invitaionsMap = {};
        $scope.inviteButtonText = "Invite Suppliers";
	// get supplier list
        buyerService.getSuppliers($scope.user.CommunityAccount__r.Community__r.Id).then(function (c) {
            $scope.suppliers = c;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        });

        $scope.$watch('suppliers', function (newvalue, oldvalue) {
            $scope.tierDetails.countAll = $scope.suppliers.length;
            $scope.tierDetails.countRegisSupp = 0;
            $scope.tierDetails.countL1Supp = 0;
            $scope.tierDetails.countL2Supp = 0;
            for (var i = 0; i < $scope.suppliers.length; i++) {//TODO will get these counts from queries in the future
                var sup = $scope.suppliers[i];
                if (sup.Supplier__r.CommunityAccount__r) {
                    $scope.tierDetails.countRegisSupp++;
                    if (sup.Supplier__r.CommunityAccount__r.Level__c == 1)
                        $scope.tierDetails.countL1Supp++;
                    else if (sup.Supplier__r.CommunityAccount__r.Level__c == 2)
                        $scope.tierDetails.countL2Supp++;
                }
            }
        });

        $scope.showInvitations = function (invites) {
            buyerService.getInvitations($scope.buyer.Id).then(function (invites) {
                $scope.invitaions = invites;
                $scope.inviteDetails.countAll = $scope.invitaions.length;
                $scope.inviteDetails.countRegisSupp = 0;
                $scope.inviteDetails.countRejected = 0;
                $scope.inviteDetails.countOpened = 0;
                for (var i = 0; i < $scope.invitaions.length; i++) { //TODO will get these counts from queries in the future
                    var invite = $scope.invitaions[i];
                    $scope.invitaionsMap[invite.Supplier__c] = invite;
                    if (invite.Supplier__r.CommunityAccount__c) {
                        $scope.inviteDetails.countRegisSupp++;
                        if (invite.Status__c == 'Open')
                            $scope.inviteDetails.countOpened++;
                        else if (invite.Status__c == 'Bounced')
                            $scope.inviteDetails.countRejected++;
                    }
                }
                $scope.inviteButtonText = "Invite Suppliers";
                $scope.$apply();
            });
        };

        $scope.showInvitations(); //iif
        $scope.selectedRows = [];
        $scope.setClickedRow = function (index) {
            var inx = $scope.selectedRows.indexOf(index);
            if (inx == -1)
                $scope.selectedRows.push(index);
            else
                $scope.selectedRows.splice(inx, 1);
        };

        $scope.sendInvites = function () {
            $scope.inviteButtonText = "Please Wait.."
            var createNewCampain = false;
            var invitationList = [];
            for (var i = 0; i < $scope.suppliers.length; i++) {
                var invite = {};
                if ($scope.selectedRows.indexOf(i) != -1) {
                    var sup = $scope.suppliers[i];
                    if (!$scope.invitaionsMap[sup.Supplier__c]) { //TODO sedn invite if published and change invite status to closed
                        createNewCampain = true; //createNewCampain if atleast one supplier not yet invited
                        invite.Supplier__c = sup.Supplier__c;
                        invite.Contact__c = sup.Supplier__r.PrimaryContact__c;
                        invite.Status__c = 'Open';
                        invite.Name = 'Invite_' + sup.Supplier__c;
                        invitationList.push(invite);
                    }
                }
            }
            if (createNewCampain) {
                buyerService.sendInvites($scope.buyer, invitationList).then(function (camp) {
                    $scope.showInvitations();
                }, function (error) {
                    console.log('nop');
                });
            } else {
                $scope.inviteButtonText = "Invite Suppliers";
            }
        };

        ////////////////////////////////////////////////////////

        $scope.showBuyerSupplier = true;
        $scope.showBuyerSupplierdetail = false;
        $scope.callsupdetail = function (selectedSupplier) {
            $scope.showBuyerSupplier = !$scope.showBuyerSupplier;
            $scope.showBuyerSupplierdetail = !$scope.showBuyerSupplierdetail;
            if(selectedSupplier){
	            $scope.supplierName = selectedSupplier.Name;
	            $scope.supplierDUNS = selectedSupplier.DUNS__c;
	            $scope.selectedInvite= $scope.invitaionsMap[selectedSupplier.Id];
            }
            delete $scope.questionnaire; 
            $scope.selectedSupplier= selectedSupplier;
            
        };


        buyerService.getCommunityLinkage($scope.user.CommunityAccount__r.Community__r.Id).then(function (cu) {
            $scope.communities = cu;
            var usrList = $scope.communities;

            var lvl1 = 0;
            var lvl2 = 0;
            var lvl3 = 0;

            for (var i = 0; i < usrList.length; i++) {
                var lvlVal = usrList[i].RegisteredLevel__c;
                if (lvlVal == 1) {
                    lvl1 = lvl1 + 1;
                }
                if (lvlVal == 2) {
                    lvl2 = lvl2 + 1;
                }
                if (lvlVal == 3) {
                    lvl3 = lvl3 + 1;
                }
            }

            $scope.level1Cnt = lvl1;
            $scope.level2Cnt = lvl2;
            $scope.level3Cnt = lvl3;
        });
            //////////////////////////Remove this..
        buyerService.getInvitations().then(function (invRes) {
            $scope.invitaions = invRes;
            $scope.invitaionCount = invRes.length;
        });

        buyerService.getSupplierInvitaion($scope.user).then(function (supRes) {
            $scope.suppInvLst = supRes;
        });


    }]); 
