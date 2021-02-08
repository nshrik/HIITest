"use strict";
(function () {
    app.factory('sharedService', function ($rootScope) {
		var service = {};
		service.data = null; 

		service.getbroadcastdata = function () {
			return this.data;
		};

		service.broadcast_loadPhysicianContract = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcast_loadPhysicianContract');
		}; 

		service.broadcast_loadContractPayElementDetailsByProvider = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcast_loadContractPayElementDetailsByProvider');
		}; 

		//Contract PayElements controller 
		service.broadcast_PayElements = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcast_PayElements');
		}; 

		//Contract provCompController controller
		service.broadcast_OnContractDataChange = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcast_OnContractDataChange');
		}; 

		//sending data from child controller to parent controller
		service.broadcastcontractEventInParentControl = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcastcontractEventInParentControl');
		};   

		//sending data from pay element controller to provComp. controller
		service.broadcastPayElementEventInProvContractControl = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcastPayElementEventInProvContractControl');
		}; 
		 
		//sending data from parent controller to child controller
		service.broadcastHandleResponseChildControl = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcastHandleResponseChildControl');
		}; 

		//sending data from parent controller to child controller
		service.broadcastClearFormErrors = function (item) {
			this.data = item;
			$rootScope.$broadcast('broadcastClearFormErrors');
		};
		 
		return service;
	});
})();
