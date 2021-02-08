"use strict";
(function () {
	/*Provider related services*/
	app.factory('provService', function ($q, UtilService, superCache) {

		var service = {
			//****WARNING: values should be in uppercase as it'll be used in comparison
			contractActionType: {
				Save: 'SAVE', Approve: "APPROVE", Reject: "REJECT", Discard: "DISCARD", SendToApproval: "SENDTOAPPROVAL",
				Renewal: "RENEWAL", Transition: "TRANSITION", End: "END", Amend: "AMEND", Extend: "EXTEND",
				Delete: "DELETE"
			} 
		}

		//cache master data for provider contract module
		service.cacheMasterData = function (userInfo) {
			service.getMasterDataByKey(userInfo, UtilService.enmCache.payElementType, UtilService.enmCache.payElementType, null);
		}

		//getMasterDataByKey from cache if it has else from api
		service.getMasterDataByKey = function (userInfo, enmkey, cacheKey, model) {
			var defer = $q.defer();

			if (cacheKey == undefined) {
				cacheKey = enmkey;
			}

			var _cacheData = superCache.get(cacheKey);
			if (_cacheData == undefined) {
				switch (enmkey) {
					case UtilService.enmCache.payElementType:
						model = {
							roleId: userInfo.CurrentRoleID,
						};
						return setMasterDataByKey(cacheKey, "api/Contract/PayElementsDropdownsList", model);
						break;
					case UtilService.enmCache.specialities:
						return setMasterDataByKey(cacheKey, "api/Contract/Specialties", model);
						break;
					case UtilService.enmCache.payElements:
						return setMasterDataByKey(cacheKey, "api/Contract/PayElement", model);
						break;
					case UtilService.enmCache.costcenter:
						return setMasterDataByKey(cacheKey, "api/Contract/CostCenters", model);
						break;
					case UtilService.enmCache.FTEData:
						return setMasterDataByKey(cacheKey, "api/Contract/FTECategory", {});
						break;
					case UtilService.enmCache.displaySettings:
						return setMasterDataByKey(cacheKey, "api/Contract/DisplaySettings", model);
						break;
					case UtilService.enmCache.contractChanges:
						return setMasterDataByKey(cacheKey, "api/Contract/ContractChanges", model);
						break;
					case UtilService.enmCache.Regions:
						return setMasterDataByKey(cacheKey, "api/Contract/Regions", model);
						break;
					case UtilService.enmCache.LocationsByRegionId:
						return setMasterDataByKey(cacheKey, "api/Contract/LocationsByRegionId", model);
						break;
					case UtilService.enmCache.CostcentersByLocationId:
						return setMasterDataByKey(cacheKey, "api/Contract/CostcentersByLocationId", model);
						break;
					case UtilService.enmCache.CompModelsByRegion:
						return setMasterDataByKey(cacheKey, "api/Contract/CompModelsByRegion", model);
						break;
				}
			} else {
				defer.resolve(_cacheData);
			}
			return defer.promise;


			//Cache data:This service will provides PayElements list
			function setMasterDataByKey(cacheKey, methodName, model) {
				//pass data on load
				var defer = $q.defer();
				console.log("Get master data for cache Key:[" + cacheKey + "] from " + methodName)
				UtilService.getAsyncData(methodName, model).then(function (result) {
					//insert cache  
					if (result != null) {
						superCache.put(cacheKey, result.data);
						console.log("Succesfully stored master data in cache Key:[" + cacheKey + "]");
						defer.resolve(result.data);
					} else {
						defer.reject(result);
					}
				}, function errorCallback(err) {
					// called asynchronously if an error occurs
					// or server returns response with an error status. 
					defer.reject(err);
				});
				return defer.promise;
			}
		}

		//this service to get PayCycle based on Region and Location
		service.getPayCycleByRegionAndLocation = function (model) {
			return UtilService.getSynchronousData("api/Contract/PayCycleByRegionAndLocation", model);
		}

		//This service will provides the PayElements grid dropdown list
		service.getPayElementsDropdownsList = function (model) {
			return UtilService.getSynchronousData("api/Contract/PayElementsDropdownsList", model);
		}


		//this service to check write permission of Contract Page
		service.checkWriteAccess = function (model) {
			return UtilService.getSynchronousData("api/Contract/CheckWriteAccess", model);
		}

		//This service will provides the provider search
		service.providerSearch = function (model) {
			return UtilService.getSynchronousData("api/Contract/ProviderSearch", model);
		};

		//This service will provides the entity search
		service.entitySearch = function (model) {
			return UtilService.getSynchronousData("api/Contract/EntityProviderByCompModelSendToAP", model);
		};

		//This service will provide master contract details of top section
		service.getMasterContractDetails = function (model) {
			return UtilService.getSynchronousData("api/Contract/MasterContractDetails", model);
		}

		//This service will provide master contract details by master contract id
		service.getMasterContractDetailsByMasterContractId = function (model) {
			return UtilService.getSynchronousData("api/Contract/MasterContractDetailsByMasterContractId", model);
		}

		//This service will provide provider Contract Details i.e second section of data of edit Page
		service.contractDetailsByAddingCompModel = function (model) {
			return UtilService.getSynchronousData("/api/Contract/ContractDetailsByAddingCompModel", model);
		}

		//This service will provide provider Contract Details i.e second section of data of edit Page
		service.loadPhysicianContract = function (model) {
			return UtilService.getSynchronousData("api/Contract/LoadPhysicianContract", model);
		}

		//this service for load data when click on hyperink of display setting
		service.getDisplaySettingHyperlinkData = function (model) {
			return UtilService.getSynchronousData("api/Contract/DisplaySettingHyperlinkData", model);
		}

		//this service for load data when click on hyperink of display setting
		service.displaysettingDetailsByMPVHeaderID = function (model) {
			return UtilService.getSynchronousData("api/Contract/DisplaysettingDetailsByMPVHeaderID", model);
		}

		//this Service to load displaysettings profiles based on Region,location,Costcenter, Speciality,PositionLevel
		service.loadDisplaySettingsProfilesByRLCSP = function (model) {
			return UtilService.getSynchronousData("api/Contract/LoadDisplaySettingsProfilesByRLCSP", model);
		}

		//This service to provides get the Renewal Date when selecting the Renewal in Contract Changes and Contract PayElements for Renewal and Amend
		service.renewalOrAmendPayElementList = function (model) {
			return UtilService.postData("api/Contract/RenewalOrAmendPayElementList", model);
		}

		/*pay elements related services start*/
		//This service will provide Add new PayElements to existing contract PayElements along with Custom Columns
		service.addNewPayElementsToExistingContractPayElements = function (model) {
			return UtilService.getSynchronousData("api/Contract/AddNewPayElementsToExistingContractPayElements", model);
		}

		//This service will provide Pay Element Details by Provider along with Custom Columns
		service.getPayElementDetailsByProvider = function (model) {
			return UtilService.getSynchronousData("api/Contract/PayElementDetailsByProvider", model);
		}

		//this service to validate FTE
		service.validateFTE = function (model) {
			return UtilService.postData("api/Contract/ValidateFTE", model);
		}

		//this service to validate Cost Center
		service.validateCostCenter = function (model) {
			return UtilService.postData("api/Contract/ValidateCostCenter", model);
		}

		//documents related
		service.uploadDocument = function (url, methodName, formData) {
			var defer = $q.defer();
			$.ajax({
				type: 'POST',
				url: url + methodName,
				data: formData,
				processData: false,
				contentType: false,
				async: true,
				cache: false,
				success: function (response) {
					//console.log(response);
					defer.resolve(response);
				},
				error: function (err) {
					// called asynchronously if an error occurs
					// or server returns response with an error status. 
					defer.reject(err);
				}
			});
			return defer.promise;
		}

		//service.downloadDocument = function (url, methodName, model) {
		//	// perform some operation, resolve or reject the promise when appropriate.
		//          var defer = $q.defer();

		//	//2.make a service call 
		//          $.ajax({
		//              type: 'POST',
		//              url: url + methodName,
		//              data: model,
		//              processData: false,
		//              contentType: false,
		//              async: true,
		//              cache: false,
		//              success: function (response) {
		//                  //console.log(response);
		//                  defer.resolve(response);
		//              },
		//              error: function (err) {
		//                  // called asynchronously if an error occurs
		//                  // or server returns response with an error status. 
		//                  defer.reject(err);
		//              }
		//          });

		//	return defer.promise;
		//      }

		service.deleteDocument = function (url, methodName, formData) {
			var defer = $q.defer();
			$.ajax({
				type: 'POST',
				url: url + methodName,
				data: formData,
				processData: false,
				contentType: false,
				async: true,
				cache: false,
				success: function (response) {
					//console.log(response);
					defer.resolve(response);
				},
				error: function (err) {
					// called asynchronously if an error occurs
					// or server returns response with an error status. 
					defer.reject(err);
				}
			});
			return defer.promise;
		}

		service.performContractActionByType = function (model, type) {
			switch (type) {
				case service.contractActionType.Save:
					return UtilService.postData("api/Contract/Save", model);
					break;
				case service.contractActionType.SendToApproval:
					return UtilService.postData("api/Contract/SendToApproval", model);
					break;
				case service.contractActionType.Renewal:
					return UtilService.postData("api/Contract/Renewal", model);
					break;
				case service.contractActionType.Transition:
					return UtilService.postData("api/Contract/Transition", model);
					break;
				case service.contractActionType.End:
					return UtilService.postData("api/Contract/End", model);
					break;
				case service.contractActionType.Amend:
					return UtilService.postData("api/Contract/Amend", model);
					break;
				case service.contractActionType.Discard:
					return UtilService.putData("api/Contract/DiscardChanges", model);
					break;
				case service.contractActionType.Approve:
					return UtilService.putData("api/Contract/Approve", model);
					break;
				case service.contractActionType.Reject:
					return UtilService.putData("api/Contract/Reject", model);
					break;
				case service.contractActionType.Delete:
					//This service is used to Delete the inactive Contract
					return UtilService.postData("api/Contract/Delete", model);
					break;
				default:
					alert('Service end point not found')
					break;
			}
		}

		return service;
	});
})();