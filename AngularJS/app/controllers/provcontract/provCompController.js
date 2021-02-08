"use strict";
(function () {
	app.controller('provCompController', function ($scope, $timeout, $exceptionHandler, provHelper, UtilService, provService, sharedService, focus) {
		var vm = this;
		vm.dateformat = 'MM/DD/YYYY';
		vm.loadingStatus = { yettobeloaded: 0, loading: 1, warn: 2, error: 3, ignore: 4, loaded: 5 }
		vm.recordstatus = {
			new: "new", modified: "modified", original: "original"
		}
		vm.imLoading = false;
		vm.imLoadingMiscProf = false;
		vm.imLoadingPE = false;

		//images for fte
		vm.imgFTEAddValidationLoading = false;

		//images for costcenter 
		vm.imgCCAddValidationLoading = false;

		//local variable:ContractPayElements to manage con
		vm.CurrentPayElements = [];

		vm.PhysicianContractFTE = {};
		vm.FTECategories = {};
		vm.compModelSpecialties = {};
		vm.displaySettings = {};
		vm.displayProfileSettings = {};

		vm.RegionMasterList = [];

		vm.hdnConsiderFTESum = $("input[name$='hdnConsiderFTESum']").val();

		//local variables which needs to be filled from parent controller  
		vm.operationmode = { load: "load", add: "add", edit: "edit", view: "view", delete: 'delete' }

		//multi select location
		vm.MultiRegionLocation = {
			Model: [],
			events: {
				onItemSelect: function (item) {
					$timeout(function () {
						vm.physicianContractDetails.LocationId = item.id + '';
						vm.onlocationIdChange();
					}, 10);
				},
				onItemDeselect: function (item) {
					$timeout(function () {
						vm.physicianContractDetails.LocationId = '0';
						vm.onlocationIdChange();
					}, 10);
				},
				onDeselectAll: function (item) {
					$timeout(function () {
						vm.physicianContractDetails.LocationId = '0';
						vm.onlocationIdChange();
					}, 10);
				}
			},
			settings: {
				selectionLimit: 1,
				scrollable: true,
				showCheckAll: false,
				keyboardControls: true,
				checkBoxes: false,
				closeOnSelect: true
			},
			defaultSelectText: { buttonDefaultText: "-Select Location-" }
		}


		vm.MultiRegionLocationCC = {
			Model: [],
			events: {
				onItemSelect: function (item) {
					$timeout(function () {
						vm.physicianContractDetails.CostCenterId = item.id + '';
						vm.loadDisplaySettingsByCostCenter();
					}, 10);
				},
				onItemDeselect: function (item) {
					$timeout(function () {
						vm.physicianContractDetails.CostCenterId = '0';
						vm.loadDisplaySettingsByCostCenter();
					}, 10);
				},
				onDeselectAll: function (item) {
					$timeout(function () {
						vm.physicianContractDetails.CostCenterId = '0';
						vm.loadDisplaySettingsByCostCenter();
					}, 10);
				}
			},
			settings: {
				selectionLimit: 1,
				scrollable: true,
				showCheckAll: false,
				keyboardControls: true,
				checkBoxes: false,
				closeOnSelect: true
			},
			defaultSelectText: { buttonDefaultText: "-Select Cost Center-" }
		}

		//multi select drop-down settings
		vm.MultiDisplaySettings = {
			settings: {
				//selectionLimit: 10,   
			},
			texts: { buttonDefaultText: '-Select Display Settings-' }
		}

		//multi select drop-down settings
		vm.PopupMultiLocation = {
			Model: [],
			events: {
				onItemSelect: function (item) {
					$timeout(function () {
						vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = item.id + '';
						vm.loadCostCentersinPopup();
					}, 10);
				},
				onItemDeselect: function (item) {
					$timeout(function () {
						vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = '0';
						vm.loadCostCentersinPopup();
					}, 10);
				},
				onDeselectAll: function (item) {
					$timeout(function () {
						vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = '0';
						vm.loadCostCentersinPopup();
					}, 10);
				}
			},
			settings: {
				selectionLimit: 1,
				scrollable: true,
				showCheckAll: false,
				keyboardControls: true,
				checkBoxes: false,
				closeOnSelect: true
			},
			defaultSelectText: { buttonDefaultText: "-Select Location-" }
		}

		vm.PopupMultiCostCenter = {
			Model: [],
			events: {
				onItemSelect: function (item) {
					$timeout(function () {
						vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = item.id + '';
					}, 10);
				},
				onItemDeselect: function (item) {
					$timeout(function () {
						vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';
					}, 10);
				},
				onDeselectAll: function (item) {
					$timeout(function () {
						vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';
					}, 10);
				}
			},
			settings: {
				selectionLimit: 1,
				scrollable: true,
				showCheckAll: false,
				keyboardControls: true,
				checkBoxes: false,
				closeOnSelect: true
			},
			defaultSelectText: { buttonDefaultText: "-Select Cost Center-" }
		}

		vm.currentTab = null;
		vm.physicianContractDetails = {
			ContractChanges: {}
		};

		//to keep track of async calls
		vm.trackAsyncData = [];

		// this gets invoked from provmaster controller
		$scope.$on('broadcast_loadPhysicianContract', function () {
			var data = sharedService.getbroadcastdata();
			if (data != null && data.tab != null) {
				if (vm.currentTab != null && vm.currentTab.Id == data.tab.Id) {		//retreive physicianId and Contract Id and other contract info 
					vm.currentTab = data.tab;

					vm.currentTab.IsDataLoaded = true;
					vm.populatePhysicianContractDetails(data);
				}
			}
		});



		vm.editProvFTE = function (item) {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationFTEpopup.id);

			//reset:IsOverlappingRangeFlag if any
			vm.tmpPhysicianContractFTE = UtilService.resetOverlappingRangeFlag(vm.tmpPhysicianContractFTE);

			vm.Control.ddlpopupFTECategory.SelectedFTECategoryId = item.FTECategoryID + '';

			vm.Control.txtContractFTE.value = (item.ContractFTEValue != null ? item.ContractFTEValue.toFixed(3) : item.ContractFTEValue);
			vm.Control.FtecategoryStartDate.value = item.StartDate;
			vm.Control.FtecategoryEndDate.value = item.EndDate;
			vm.Control.btnSaveFTECategories.value = 'Update';

			vm.Control.SelectedFTEItem = item;
		}

		//displayValidationMessages
		vm.displayValidationMessages = function (statusInfo, divId) {
			try {
				var msgobj = {
					MessageType: UtilService.MessageType.Validation,
					Message: statusInfo.ErrorMessage
				}

				UtilService.manageUserFriendlyNotifications(msgobj, divId);

				if (statusInfo.ErrorControlIds != undefined && statusInfo.ErrorControlIds != null && statusInfo.ErrorControlIds.length > 0) {
					//focus effective date
					setTimeout(function () {
						focus(statusInfo.ErrorControlIds[0]);
					}, 10);
				}
			} catch (e) {//ignore  
			}
		}

		vm.addProvFTE = function () {

			var FTECategoryID = vm.Control.ddlpopupFTECategory.SelectedFTECategoryId;
			var FTECategoryDesc = UtilService.getDropdownTextById(vm.FTECategories, vm.Control.ddlpopupFTECategory.SelectedFTECategoryId, '');

			var model = {
				UniqueRowID: 0, //int sequential in database
				PhysicianContractFTEID: 0, //int 0,
				RefPhysicianContractFTEID: 0,//int 0, 
				FTECategoryID: FTECategoryID, //int 0, 
				FTECategoryDesc: FTECategoryDesc,
				ContractFTEValue: vm.Control.txtContractFTE.value,
				StartDate: vm.Control.FtecategoryStartDate.value,
				EndDate: vm.Control.FtecategoryEndDate.value,
				FTEHours: 0,
				Active: true,
				IsOverlappingRange: false,//local variable to display right arrow icon in UI
			};

			model.StartDate = UtilService.getDefaultValueIfItsNull(model.StartDate, '');
			model.EndDate = UtilService.getDefaultValueIfItsNull(model.EndDate, '');

			//edit mode
			if (vm.Control.SelectedFTEItem != null) {
				model.UniqueRowID = vm.Control.SelectedFTEItem.UniqueRowID;
				model.PhysicianContractFTEID = vm.Control.SelectedFTEItem.PhysicianContractFTEID;
				model.RefPhysicianContractFTEID = vm.Control.SelectedFTEItem.RefPhysicianContractFTEID;
				model.FTEHours = vm.Control.SelectedFTEItem.FTEHours;
			} else {
				//form validation success  
				model.UniqueRowID = (vm.tmpPhysicianContractFTE.length + 1);
			}

			//reset:IsOverlappingRangeFlag if any
			vm.tmpPhysicianContractFTE = UtilService.resetOverlappingRangeFlag(vm.tmpPhysicianContractFTE);

			var statusInfo = vm.validateFTECategory(model);

			//is form valid
			if (statusInfo.IsValid) {
				//1.get uniqueCategoryNames 
				var ftearr = angular.copy(vm.tmpPhysicianContractFTE);

				//validate FTE SumCategory data
				vm.validateFTESUM(model, ftearr);
			}
		}

		//REST
		vm.validateFTESUM = function (newModel, UpdatedDataset) {
			var gridData = [];
			for (var i = 0; i < UpdatedDataset.length; i++) {
				if (vm.Control.btnSaveFTECategories.value == 'Update' && UpdatedDataset[i].UniqueRowID == newModel.UniqueRowID) {
					var currentrecord = UpdatedDataset[i];

					//re-assign :updated info to the grid
					currentrecord.StartDate = newModel.StartDate;
					currentrecord.EndDate = newModel.EndDate;
					currentrecord.ContractFTEValue = newModel.ContractFTEValue;
					currentrecord.FTECategoryDesc = newModel.FTECategoryDesc;
					currentrecord.FTECategoryID = newModel.FTECategoryID;

					UpdatedDataset[i].isNewRecord = true;
				} else {
					UpdatedDataset[i].isNewRecord = false;
				}

				//reset the flags
				UpdatedDataset[i].IsOverlappingRange = false;
				UpdatedDataset[i].IsOverlappingRangeValue = false;

				//add
				gridData.push(UpdatedDataset[i]);
			}

			//additional new record
			if (vm.Control.btnSaveFTECategories.value == 'Add') {
				newModel.isNewRecord = true;
				gridData.push(newModel);
			}

			var query = {
				PhysicianID: vm.physicianContractDetails.PhysicianId,
				GroupFTEDurationLessthanContractDuration: UtilService.convertDataByDatatype($("input[name$='hdnGroupFTEDurationLessthanContractDuration']").val(), UtilService.datatype.number, 0, 0),//int 0
				FTEDurationLessthanContractDuration: UtilService.convertDataByDatatype($("input[name$='hdnFTEDurationLessthanContractDuration']").val(), UtilService.datatype.number, 0, 0),//int 0 
				ConsiderFTESumofAllCategory: UtilService.convertDataByDatatype($("input[name$='hdnConsiderFTESumofAllCategory']").val(), UtilService.datatype.number, 0, 0),//int 0  
				ConfiguredHourValue: 0,
				imgbtnSaveFTE: vm.Control.btnSaveFTECategories.value,
				PhysicianContractFTE: gridData
			}

			//2.block UI  
			UtilService.blockUI();

			$timeout(function () { vm.imgFTEAddValidationLoading = true; $scope.$apply(); }, 10);

			//3. make service call 
			$timeout(function () { provService.validateFTE(query).then(onSuccess, onError); }, 100);

			function onSuccess(response) {
				vm.imgFTEAddValidationLoading = false;
				//unblockui
				$.unblockUI();

				//when NotificationMessages = null then there validation errors
				if (response != undefined) {
					var _responseData = [];

					if (response.PhysicianContractFTE != undefined) {
						response.PhysicianContractFTE = removeDumplicateValue(response.PhysicianContractFTE);
					}

					if (response.NotificationMessages != null) {
						if (response.NotificationMessages.Message.indexOf('Sum of all FTE category value') != -1) {

							//failure: exclude the record and then display it
							for (var i = 0; i < response.PhysicianContractFTE.length; i++) {
								var currentrecord = response.PhysicianContractFTE[i];
								//excldue new record
								if (!(vm.Control.btnSaveFTECategories.value == 'Add' && currentrecord.UniqueRowID == newModel.UniqueRowID)) {
									currentrecord.isNewRecord = false;

									if (currentrecord.IsOverlappingRange == true) {
										currentrecord.IsOverlappingRangeValue = true;
									}

									if (currentrecord.UniqueRowID == newModel.UniqueRowID) {
										//existing record
										var exisrecord = getCurrentRecordById(vm.tmpPhysicianContractFTE, newModel.UniqueRowID);
										if (exisrecord != null) {
											currentrecord.StartDate = exisrecord.StartDate;
											currentrecord.EndDate = exisrecord.EndDate;
											currentrecord.ContractFTEValue = exisrecord.ContractFTEValue;
											currentrecord.FTECategoryDesc = exisrecord.FTECategoryDesc;
											currentrecord.FTECategoryID = exisrecord.FTECategoryID;
										}
									}
									_responseData.push(currentrecord);
								}
							}


							//wait for 10 
							$timeout(function () { vm.tmpPhysicianContractFTE = _responseData; }, 10);

						} else {
							//general validation error messages
						}

						UtilService.manageUserFriendlyNotifications(response, vm.Control.pnlValidationFTEpopup.id);
					} else {
						//success   
						for (var i = 0; i < response.PhysicianContractFTE.length; i++) {
							var currentrecord = response.PhysicianContractFTE[i];
							currentrecord.IsOverlappingRange = false;
							currentrecord.IsOverlappingRangeValue = false;
							currentrecord.isNewRecord = false;
							_responseData.push(currentrecord);
						}

						//assign data
						$timeout(function () {

							vm.tmpPhysicianContractFTE = _responseData; vm.clearFTECategory();
						}, 10);
					}
				}
			}

			function removeDumplicateValue(myArray) {
				var newArray = [];

				$.each(myArray, function (key, value) {
					var exists = false;
					$.each(newArray, function (k, val2) {
						if (value.UniqueRowID == val2.UniqueRowID) { exists = true };
					});
					if (exists == false && value.UniqueRowID != "") { newArray.push(value); }
				});

				return newArray;
			}

			function getCurrentRecordById(UpdatedDataset, UniqueRowID) {
				var model = null;
				if (UpdatedDataset != null) {
					for (var i = 0; i < UpdatedDataset.length; i++) {
						if (UpdatedDataset[i].UniqueRowID == UniqueRowID) {
							model = UpdatedDataset[i];
							break;
						}
					}
				}

				return model;
			}

			function onError(jqXHR) {
				vm.imgFTEAddValidationLoading = false;
				//unblockui
				$.unblockUI();

				provHelper.handleServerError(jqXHR, vm.Control.pnlValidationFTEpopup.id);
			}
		}

		vm.validateFTECategory = function (model) {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationFTEpopup.id);

			//start validating contract start & end dates
			var sbError = [];
			var errorControlIds = [];

			//start validating contract and master contract info before proceeding further
			var statusInfo = vm.validateContractInfo(1);
			if (!statusInfo.IsValid) {
				return statusInfo;
			}

			var ContStartDt = vm.physicianContractDetails.StartDate;
			var ContEndDt = vm.physicianContractDetails.EndDate;


			//FTECategory
			if (!parseInt(model.FTECategoryID) > 0) {
				errorControlIds.push(vm.Control.ddlpopupFTECategory.id);
				vm.Control.ddlpopupFTECategory.IsValid = false;
				vm.Control.ddlpopupFTECategory.ErrorDesc = "Please select a FTE Category.";
				sbError.push(vm.Control.ddlpopupFTECategory.ErrorDesc);
			}

			//validation inside popup starts: startdate, location, cost center
			if (!UtilService.isValidDate(model.StartDate)) {
				errorControlIds.push(vm.Control.FtecategoryStartDate.id);
				vm.Control.FtecategoryStartDate.IsValid = false;
				vm.Control.FtecategoryStartDate.ErrorDesc = "Please select Start Date.";
				sbError.push(vm.Control.FtecategoryStartDate.ErrorDesc);
			}
			else {
				//check start date againsit with hire date
				var hireDate = provHelper.isDateGreaterThanHireDate($scope.$parent.ms.PhysicianDetails, model.StartDate);
				if (!hireDate.IsValid) {
					errorControlIds.push(vm.Control.FtecategoryStartDate.id);
					vm.Control.FtecategoryStartDate.IsValid = false;
					vm.Control.FtecategoryStartDate.ErrorDesc = "Provider '" + $scope.$parent.ms.PhysicianDetails.ProviderName + "' FTE Category " + hireDate.ErrorMessage;
					sbError.push(vm.Control.FtecategoryStartDate.ErrorDesc);
				}

				if (model.EndDate != null && model.EndDate != undefined && model.EndDate != "") {
					if (!UtilService.isValidDate(model.EndDate)) {
						errorControlIds.push(vm.Control.FtecategoryEndDate.id);
						vm.Control.FtecategoryEndDate.IsValid = false;
						vm.Control.FtecategoryEndDate.ErrorDesc = "Please enter valid End Date.";
						sbError.push(vm.Control.FtecategoryEndDate.ErrorDesc);
					} else {
						if (moment(model.StartDate).isAfter(moment(model.EndDate))
							|| moment(model.StartDate).isSame(moment(model.EndDate))) {
							errorControlIds.push(vm.Control.FtecategoryEndDate.id);
							vm.Control.FtecategoryEndDate.IsValid = false;
							vm.Control.FtecategoryEndDate.ErrorDesc = "Please Enter End Date Greater than Start Date.";
							sbError.push(vm.Control.FtecategoryEndDate.ErrorDesc);
						}
					}
				}

				//check if start date is b/w contract dates
				//if (moment(ContStartDt).isAfter(moment(model.StartDate))) {
				//	errorControlIds.push(vm.Control.FtecategoryStartDate.id);
				//	vm.Control.FtecategoryStartDate.IsValid = false;
				//	vm.Control.FtecategoryStartDate.ErrorDesc = "Please select Start Date in between Contract Start and End dates.";
				//	sbError.push(vm.Control.FtecategoryStartDate.ErrorDesc);
				//}

				////check if end date is b/w contract dates
				//if (UtilService.isValidDate(model.EndDate)) {
				//	if (moment(model.EndDate).isAfter(moment(ContEndDt))) {
				//		errorControlIds.push(vm.Control.FtecategoryEndDate.id);
				//		vm.Control.FtecategoryEndDate.IsValid = false;
				//		vm.Control.FtecategoryEndDate.ErrorDesc = "Please select End Date in between Contract Start and End dates.";
				//		sbError.push(vm.Control.FtecategoryEndDate.ErrorDesc);
				//	} 
				//}
			}

			if (model.ContractFTEValue == "" || model.ContractFTEValue == 0) {
				errorControlIds.push(vm.Control.txtContractFTE.id);
				vm.Control.txtContractFTE.IsValid = false;
				vm.Control.txtContractFTE.ErrorDesc = "Please Enter valid FTE value.";
				sbError.push(vm.Control.txtContractFTE.ErrorDesc);
			}
			else {
				if (model.ContractFTEValue < 0 || model.ContractFTEValue > 1) {
					errorControlIds.push(vm.Control.txtContractFTE.id);
					vm.Control.txtContractFTE.IsValid = false;
					vm.Control.txtContractFTE.ErrorDesc = "FTE value range should be 0 to 1.";
					sbError.push(vm.Control.txtContractFTE.ErrorDesc);
				}
			}

			try {
				//display error message  
				if (sbError.length > 0) {
					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: sbError.join("<br>")
					}
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlValidationFTEpopup.id);
				}

				if (errorControlIds != undefined && errorControlIds != null && errorControlIds.length > 0) {
					//focus effective date
					setTimeout(function () {
						focus(errorControlIds[0]);
					}, 150);
				}
			} catch (e) {//ignore 

			}

			return {
				IsValid: sbError.length > 0 ? false : true //|| !isEntireFormValid 
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''

			}
		}

		vm.clearFTECategory = function () {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationFTEpopup.id);

			$timeout(function () {
				vm.Control.ddlpopupFTECategory.SelectedFTECategoryId = '0';
				vm.Control.txtContractFTE.value = '';
				vm.Control.btnSaveFTECategories.value = 'Add';
				vm.Control.SelectedFTEItem = null;

				vm.Control.FtecategoryStartDate.value = vm.physicianContractDetails.StartDate;
				vm.Control.FtecategoryEndDate.value = "";
			}, 10);

			//assign default date 
			if (vm.tmpPhysicianContractFTE == null) {
				vm.tmpPhysicianContractFTE = [];
			}
			var _list = vm.tmpPhysicianContractFTE;

			////reset increment id
			//_list = UtilService.addUniqueRowIdTotheList(_list);

			//reset:IsOverlappingRangeFlag if any
			$timeout(function () { vm.tmpPhysicianContractFTE = UtilService.resetOverlappingRangeFlag(_list); }, 10);
		}

		vm.deleteProvFTE = function (item) {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationFTEpopup.id);

			var _list = vm.tmpPhysicianContractFTE;

			var _subcategoryArr = [];
			for (var i = 0; i < _list.length; i++) {
				if (_list[i].FTECategoryID == item.FTECategoryID) {
					_subcategoryArr.push(_list[i]);
				}
			}

			//sort it based on row number
			if (_subcategoryArr != null && _subcategoryArr.length > 0) {
				var sortedArray = _subcategoryArr.sort((a, b) => moment(a.StartDate) - moment(b.StartDate));

				for (var i = 0; i < sortedArray.length; i++) {
					if (sortedArray[i].UniqueRowID == item.UniqueRowID) {
						//_subcategoryArr.push(ftearr[j]);
						if ((sortedArray.length - 1) > i) {
							var ProposedStartDate = sortedArray[i].StartDate;

							//assign end date dynamically
							sortedArray[i + 1].StartDate = ProposedStartDate;
							break;
						}
					}
				}

				//update dates for the next record 
				for (var i = 0; i < _list.length; i++) {
					for (var j = 0; j < sortedArray.length; j++) {
						if (_list[i].UniqueRowID == sortedArray[j].UniqueRowID) {
							_list[i] = sortedArray[j];
							break;
						}
					}
				}
			}

			//Delete from the grid array 
			//var _list = _list;
			for (var i = 0; i < _list.length; i++) {
				if (_list[i].UniqueRowID == item.UniqueRowID && _list[i].FTECategoryID == item.FTECategoryID) {
					_list.splice(i, 1);
					break;
				}
			}

			//reassign list
			$timeout(function () {
				//reset increment id
				_list = UtilService.addUniqueRowIdTotheList(_list);

				vm.tmpPhysicianContractFTE = _list;
				vm.clearFTECategory();
			}, 10);
		}

		vm.applyProvFTE = function () {
			//assign data
			vm.PhysicianContractFTE = vm.getArrayData(vm.tmpPhysicianContractFTE);

			$timeout(function () { vm.setFteCategoryTitle(); }, 10);

			vm.closePopup(vm.Control.popupLinkFTECategory.id);
		}

		vm.setFteCategoryTitle = function () {
			var completeTitle = [];
			var arr = vm.PhysicianContractFTE;

			if (arr != null && arr.length > 0) {

				// Group by category as key to the fte array
				var fteDataByCategory = UtilService.groupBy(arr, 'FTECategoryDesc');

				if (fteDataByCategory != null && fteDataByCategory != undefined) {
					for (var prop in fteDataByCategory) {
						var subArr = fteDataByCategory[prop];


						if (subArr.length > 0) {
							//1. sort all the records within category
							var sortedArray = subArr.sort((a, b) => moment(a.StartDate) - moment(b.StartDate));

							var sbTitle = [];

							//2.sort records by date
							for (var x = sortedArray.length - 1; x >= 0; x--) {
								var selItem = sortedArray[x];

								//3. fill the required info 
								var dynamicString = [];
								if (selItem != null) {
									dynamicString.push(" " + selItem.StartDate);

									//if (selItem.EndDate != null && selItem.EndDate != '')
									//	dynamicString.push("-" + selItem.EndDate);

									if (selItem.ContractFTEValue != null)
										dynamicString.push(" : " + selItem.ContractFTEValue.toFixed(3));
								}

								//4.append the string
								if (dynamicString.length > 0) {
									sbTitle.push(dynamicString.join(""));
								}
							}

							if (dynamicString.length > 0) {
								completeTitle.push(selItem.FTECategoryDesc + " - Effective" + sbTitle.join(";"));
							}
						}
					}
				}
			}

			//set title
			vm.PhysicianContractFTETitle = completeTitle.length > 0 ? completeTitle.join(" \n ") : '';
		}

		vm.validatePopupCostCenterModel = function (model) {
			//start validating contract start & end dates
			var sbError = [];
			var errorControlIds = [];

			//start validating contract and master contract info before proceeding further
			var statusInfo = vm.validateContractInfo(1);
			if (!statusInfo.IsValid) {
				return statusInfo;
			}

			var ContStartDt = vm.physicianContractDetails.StartDate;
			var ContEndDt = vm.physicianContractDetails.EndDate;

			//location 
			if (!parseInt(model.LocationId) > 0) {
				errorControlIds.push(vm.Control.ddlCostCenterPopupLocation.id);
				vm.Control.ddlCostCenterPopupLocation.IsValid = false;
				vm.Control.ddlCostCenterPopupLocation.ErrorDesc = "Please select a Location.";
				sbError.push(vm.Control.ddlCostCenterPopupLocation.ErrorDesc);
			}

			//CostCenter
			if (!parseInt(model.DepartmentId) > 0) {
				//vm.showPopupErrorCm = true;
				errorControlIds.push(vm.Control.ddlCostCenterPopupCostCenter.id);
				vm.Control.ddlCostCenterPopupCostCenter.IsValid = false;
				vm.Control.ddlCostCenterPopupCostCenter.ErrorDesc = "Please select a CostCenter.";
				sbError.push(vm.Control.ddlCostCenterPopupCostCenter.ErrorDesc);
			}


			//validation inside popup starts: startdate, location, cost center
			if (!UtilService.isValidDate(model.StartDate)) {
				errorControlIds.push(vm.Control.CostCenterStartDate.id);
				vm.Control.CostCenterStartDate.IsValid = false;
				vm.Control.CostCenterStartDate.ErrorDesc = "Please select Start Date.";
				sbError.push(vm.Control.CostCenterStartDate.ErrorDesc);
			}
			else {
				//check start date againsit with hire date
				var hireDate = provHelper.isDateGreaterThanHireDate($scope.$parent.ms.PhysicianDetails, model.StartDate);
				if (!hireDate.IsValid) {
					errorControlIds.push(vm.Control.CostCenterStartDate.id);
					vm.Control.CostCenterStartDate.IsValid = false;
					vm.Control.CostCenterStartDate.ErrorDesc = "Provider '" + $scope.$parent.ms.PhysicianDetails.ProviderName + "' Cost Center " + hireDate.ErrorMessage;
					sbError.push(vm.Control.CostCenterStartDate.ErrorDesc);
				}

				if (model.EndDate != undefined && model.EndDate != "") {
					if (!UtilService.isValidDate(model.EndDate)) {
						errorControlIds.push(vm.Control.CostCenterEndDate.id);
						vm.Control.CostCenterEndDate.IsValid = false;
						vm.Control.CostCenterEndDate.ErrorDesc = "Please enter valid End Date.";
						sbError.push(vm.Control.CostCenterEndDate.ErrorDesc);
					} else {
						if (moment(model.StartDate).isAfter(moment(model.EndDate))
							|| moment(model.StartDate).isSame(moment(model.EndDate))) {
							errorControlIds.push(vm.Control.CostCenterEndDate.id);
							vm.Control.CostCenterEndDate.IsValid = false;
							vm.Control.CostCenterEndDate.ErrorDesc = "Please Enter End Date Greater than Start Date.";
							sbError.push(vm.Control.CostCenterEndDate.ErrorDesc);
						}
					}
				}

				//check if start date is b/w contract dates
				//if (moment(ContStartDt).isAfter(moment(model.StartDate))) {
				//	errorControlIds.push(vm.Control.CostCenterStartDate.id);
				//	vm.Control.CostCenterStartDate.IsValid = false;
				//	vm.Control.CostCenterStartDate.ErrorDesc = "Please select Start Date in between Contract Start and End dates.";
				//	sbError.push(vm.Control.CostCenterStartDate.ErrorDesc);
				//}

				//if (UtilService.isValidDate(model.EndDate)) {
				//	if (moment(model.EndDate).isAfter(moment(ContEndDt))) {
				//		errorControlIds.push(vm.Control.CostCenterStartDate.id);
				//		vm.Control.CostCenterStartDate.IsValid = false;
				//		vm.Control.CostCenterStartDate.ErrorDesc = "Please select End Date in between Contract Start and End dates.";
				//		sbError.push(vm.Control.CostCenterStartDate.ErrorDesc);
				//	}
				//}

			}

			try {
				//display error message  
				if (sbError.length > 0) {
					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: sbError.join("<br>")
					}
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlValidationCostCenterpopup.id);
				}

				if (errorControlIds != undefined && errorControlIds != null && errorControlIds.length > 0) {
					//focus effective date
					setTimeout(function () {
						focus(errorControlIds[0]);
					}, 150);
				}
			} catch (e) {//ignore 

			}
			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
			}
		}

		vm.loadCostCentersinPopup = function () {
			var selcostcenter = '0';
			vm.loadPopupCostCenterByLocId(selcostcenter);
		}

		//REST:this service to get PayCycle based on Region and Location
		vm.getPayCycleByRegionAndLocation = function () {
			var locationId = vm.physicianContractDetails.LocationId;
			vm.physicianContractDetails.PayCycleName = null;

			if (parseInt(locationId) > 0) {
				var regionId = vm.physicianContractDetails.RegionId;

				var query = {
					regionId: regionId,
					locationId: locationId,
				}

				provService.getPayCycleByRegionAndLocation(query).then(function (response) {
					if (response != undefined && response.PayCycleName != undefined) {
						vm.physicianContractDetails.PayCycleName = response.PayCycleName;
					}
				}, function (jqXHR) {
					//log the exception
					try { $exceptionHandler(jqXHR); } catch (e1) { }
				});
			}
		}

		vm.loadPopupCostCenterByLocId = function (selcostcenter) {
			var locationId = vm.Control.ddlCostCenterPopupLocation.SelectedLocationId;

			if (parseInt(locationId) > 0) {
				//get region&location Id
				var regionId = vm.physicianContractDetails.RegionId;

				//refresh costcenters by location & region 
				var userInfo = UtilService.getCurrentUserInfo();
				var cacheConfig = {
					enmkey: UtilService.enmCache.CostcentersByLocationId,
					cacheKey: UtilService.enmCache.CostcentersByLocationId + '_' + regionId + '_' + locationId,
					model: { roleCode: userInfo.CurrentUserRoleCode, regionId: regionId, locationId: locationId },
					status: vm.loadingStatus.loading
				}

				//get pay elements data from cache  
				provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {
					//try {
					var _list = [];
					if (response != null) {
						_list = response.costcenters;
					}

					if (_list != null && _list.length > 0 && parseInt(_list[0].id) == 0)
						_list.splice(0, 1);

					vm.CostcenterDropDownData = _list;
					//reset cost center selection
					vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = selcostcenter;
					vm.PopupMultiCostCenter.Model = UtilService.getSelectedDropdownModelByValue(vm.CostcenterDropDownData, selcostcenter);

					//} catch (err) { console.log(JSON.stringify(err)); }
				}, function (jqXHR) {
					//error
					vm.CostcenterDropDownData = [];
					vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';
					vm.PopupMultiCostCenter.Model = [];
					//log the exception
					try { $exceptionHandler(jqXHR); } catch (e1) { }
				});
			} else {
				//reset cost center selection 
				vm.CostcenterDropDownData = [];
				vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';
				vm.PopupMultiCostCenter.Model = [];
			}
		}

		vm.clearProvCostCenter = function () {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationCostCenterpopup.id);

			//for popup
			$timeout(function () {

				if (vm.Control.ddlCostCenterPopupLocation.disabled != true) {
					vm.PopupMultiLocation.Model = [];
					vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = '0';
					vm.CostcenterDropDownData = [];
				}

				vm.PopupMultiCostCenter.Model = [];
				vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';

				vm.Control.CostCenterStartDate.value = '';
				vm.Control.CostCenterEndDate.value = '';
				vm.Control.btnSaveCostCenters.value = 'Add';
				vm.Control.SelectedCostCenterItem = null;

				//assign default date 
				vm.Control.CostCenterStartDate.value = vm.physicianContractDetails.StartDate;
			}, 10);

			//assign default date 
			if (vm.tmpProvCostcenterData == null) {
				vm.tmpProvCostcenterData = [];
			}

			var _list = vm.tmpProvCostcenterData;
			//reset increment id
			_list = UtilService.addUniqueRowIdTotheList(_list);

			//reset:IsOverlappingRangeFlag if any
			$timeout(function () { vm.tmpProvCostcenterData = UtilService.resetOverlappingRangeFlag(_list); }, 10);
		}

		vm.deleteProvCostCenter = function (item) {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationCostCenterpopup.id);

			//Delete from the grid array
			var _list = vm.tmpProvCostcenterData;
			for (var i = 0; i < _list.length; i++) {
				if (_list[i].UniqueRowID == item.UniqueRowID) {
					_list.splice(i, 1);
					break;
				}
			}

			//reassign list
			vm.tmpProvCostcenterData = _list;

			vm.clearFTECategory();
		}



		vm.editProvCostCenter = function (item) {
			//clear notifications within popup
			provHelper.hideAllNotifications(vm.Control.pnlValidationCostCenterpopup.id);

			//reset:IsOverlappingRangeFlag if any
			vm.tmpProvCostcenterData = UtilService.resetOverlappingRangeFlag(vm.tmpProvCostcenterData);

			vm.Control.SelectedCostCenterItem = item;
			vm.Control.CostCenterStartDate.value = item.StartDate;
			vm.Control.CostCenterEndDate.value = item.EndDate;
			vm.Control.btnSaveCostCenters.value = 'Update';

			vm.PopupMultiLocation.Model = UtilService.getSelectedDropdownModelByValue(vm.LocationMasterList, item.LocationId);
			vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = item.LocationId + '';

			vm.loadPopupCostCenterByLocId(item.id + '');
		}

		vm.addProvCostCenter = function () {
			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.pnlValidationCostCenterpopup.id);

			var ccId = parseInt(vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId);
			var ccDesc = UtilService.getDropdownTextById(vm.CostcenterDropDownData, vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId, '');

			var model = {
				UniqueRowID: 0, //int sequential in database
				ContractId: vm.physicianContractDetails.ContractId,//int 1391, 
				PCCostCenterDtId: 0,//int,
				RefPCCostCenterDtId: 0,//int 0, 
				LocationId: parseInt(vm.Control.ddlCostCenterPopupLocation.SelectedLocationId),//int?  69,
				LocationDesc: UtilService.getDropdownTextById(vm.LocationMasterList, vm.Control.ddlCostCenterPopupLocation.SelectedLocationId, ''),
				DepartmentId: ccId,//int 518,//
				DepartmentDesc: ccDesc,//string
				id: ccId,//int 518,//
				label: ccDesc,
				StartDate: vm.Control.CostCenterStartDate.value,//DateTime "1/1/2020 12:00:00 AM",
				EndDate: vm.Control.CostCenterEndDate.value,//DateTime? null 
				IsOverlappingRange: false//local variable to display right arrow icon in UI
			}

			model.StartDate = UtilService.getDefaultValueIfItsNull(model.StartDate, '');
			model.EndDate = UtilService.getDefaultValueIfItsNull(model.EndDate, '');

			//edit mode
			if (vm.Control.SelectedCostCenterItem != null) {
				model.UniqueRowID = vm.Control.SelectedCostCenterItem.UniqueRowID;
				model.PCCostCenterDtId = vm.Control.SelectedCostCenterItem.PCCostCenterDtId;
				model.RefPCCostCenterDtId = vm.Control.SelectedCostCenterItem.RefPCCostCenterDtId;
			} else {
				//form validation success 
				model.UniqueRowID = (vm.tmpProvCostcenterData.length + 1);
			}


			//reset:IsOverlappingRangeFlag if any
			vm.tmpProvCostcenterData = UtilService.resetOverlappingRangeFlag(vm.tmpProvCostcenterData);

			var statusInfo = vm.validatePopupCostCenterModel(model);

			//is form valid
			if (statusInfo.IsValid) {
				vm.validateCostCenter(model, vm.tmpProvCostcenterData);
			}
		}

		//REST
		vm.validateCostCenter = function (newModel, UpdatedDataset) {
			{

				var requestData = angular.copy(UpdatedDataset);

				if (vm.Control.btnSaveCostCenters.value == 'Add') {
					newModel.isNewRecord = true;
					requestData.push(newModel);
				}

				var gridData = [];
				for (var i = 0; i < requestData.length; i++) {
					if (requestData[i].UniqueRowID == newModel.UniqueRowID) {
						gridData.push(newModel);
					} else {
						gridData.push(requestData[i]);
					}
				}

				var query = {
					StartDate: UtilService.getDefaultValueIfItsNull(vm.physicianContractDetails.StartDate, ""), //string "1/1/2020 12:00:00 AM",
					EndDate: UtilService.getDefaultValueIfItsNull(vm.physicianContractDetails.EndDate, ""), //string "12/31/2020 12:00:00 AM",  
					AllowPayElementsDatesoutsideContractDates: vm.physicianContractDetails.AllowPayElementsDatesoutsideContractDates, // 1, int
					//imgbtnSave: 'Edit',//vm.Control.btnSaveCostCenters.value,
					PhysicianContractCostCenter: gridData,
					newCostCenter: newModel
				}

				//2.block UI  
				UtilService.blockUI();

				$timeout(function () { vm.imgCCAddValidationLoading = true; $scope.$apply(); }, 10);

				//3. make service call 
				$timeout(function () { provService.validateCostCenter(query).then(onSuccess, onError); }, 100);
			}


			function onSuccess(response) {
				vm.imgCCAddValidationLoading = false;
				//unblockui
				$.unblockUI();

				//when NotificationMessages = null then there validation errors
				if (response != undefined) {
					if (response.NotificationMessages != null) {
						//failure:exclude the record and then display it
						var gridData = [];
						for (var i = 0; i < response.ContractCostCenter.length; i++) {
							if (response.ContractCostCenter[i].UniqueRowID != newModel.UniqueRowID) {
								gridData.push(response.ContractCostCenter[i]);
							}
						}

						vm.tmpProvCostcenterData = gridData;

						UtilService.manageUserFriendlyNotifications(response, vm.Control.pnlValidationCostCenterpopup.id);
					} else {
						//success 
						vm.tmpProvCostcenterData = response.ContractCostCenter;
						vm.clearProvCostCenter();
					}
				}
			}

			function onError(jqXHR) {
				vm.imgCCAddValidationLoading = false;
				//unblockui
				$.unblockUI();

				provHelper.handleServerError(jqXHR, vm.Control.pnlValidationCostCenterpopup.id);
			}
		}

		vm.applyCostCenter = function () {
			var selItem = null;

			var _arr = vm.tmpProvCostcenterData;
			if (_arr != null) {
				var sortedArray = [];
				if (_arr.length > 0) {
					sortedArray = _arr.sort((a, b) => moment(a.StartDate) - moment(b.StartDate));
				} else {
					sortedArray = _arr;
				}

				//1.re-assign sorted dates
				vm.tmpProvCostcenterData = sortedArray;

				//2. take the current record which is in contract start/end dates
				var _isActiveCostCenterFound = false;
				if (sortedArray.length > 0) {

					//contract dates
					var ContStartDt = moment(vm.physicianContractDetails.StartDate);
					var ContEndDt = moment(vm.physicianContractDetails.EndDate);

					for (var i = sortedArray.length - 1; i >= 0; i--) {
						var item = sortedArray[i];

						var isValidRange = false;

						var ccStartDate = moment(item.StartDate).subtract(1, 'days');
						var ccEndDate = item.EndDate;

						//default 
						if (item.EndDate == "" || item.EndDate == null || item.EndDate == undefined) {
							ccEndDate = moment('12/31/2099');
						}
						else {
							ccEndDate = moment(ccEndDate).add(1, 'days');
						}

						//check if end date is is in between cost center start and end date 
						if (ContStartDt.isSameOrBefore(ccStartDate) || ContStartDt.isAfter(ccStartDate)) {
							if (ContEndDt.isAfter(ccStartDate) && ContEndDt.isBefore(ccEndDate)) {
								isValidRange = true;
							}
						}

						if (isValidRange == true) {
							_isActiveCostCenterFound = true;
							selItem = item;
							break;
						}

					}
				}

				//2. take the latest record if nothing is found
				//if (!_isActiveCostCenterFound) {
				//	selItem = UtilService.latestRecordAFromSortedArray(sortedArray);
				//}
			}

			if (selItem != null) {
				//apply temp cost center data to original  
				vm.ProvCostcenterData = vm.getArrayData(vm.tmpProvCostcenterData);

				//update location & cost center id if it's not the same
				if (parseInt(vm.physicianContractDetails.LocationId) != parseInt(selItem.LocationId)
					|| parseInt(vm.physicianContractDetails.CostCenterId) != parseInt(selItem.DepartmentId)) {

					//clear all pay elements on location Id change
					if (parseInt(vm.physicianContractDetails.LocationId) != parseInt(selItem.LocationId)) {
						vm.clearAllPayElementsOnLocationChange();
					}

					//changing location or cost center will update Misc profiles 
					vm.physicianContractDetails.LocationId = selItem.LocationId + '';
					vm.MultiRegionLocation.Model = UtilService.getSelectedDropdownModelByValue(vm.LocationMasterList, selItem.LocationId);

					//update costcenter and then reload misc. profie
					var CostcenterId = UtilService.convertDataByDatatype(selItem.DepartmentId, UtilService.datatype.number, 0, 0);
					$timeout(function () { vm.loadCostCentersByLocationId(selItem.LocationId, 'popup', CostcenterId); }, 50);
				} else {
					vm.closePopup(vm.Control.popupLinkCostCenter.id);
				}
			} else {
				//apply temp cost center data to original 
				vm.ProvCostcenterData = vm.getArrayData(vm.tmpProvCostcenterData);

				////clear all pay elements on location Id change
				//if (parseInt(vm.physicianContractDetails.LocationId) != 0) {
				//	vm.clearAllPayElementsOnLocationChange();
				//}

				vm.physicianContractDetails.LocationId = '0';
				vm.MultiRegionLocation.Model = [];

				vm.physicianContractDetails.CostCenterId = '0';
				vm.MultiRegionLocationCC.Model = [];
				//pass LocationId to Payelements controller to load cost centers and display add button
				vm.informPayElemtsCostCenterChangingonLocationId();

				//get pay cycle for the selected location
				$timeout(function () { vm.getPayCycleByRegionAndLocation(); }, 10);

				//refresh misc. profile section
				vm.loadDisplaySettingsBySpeciality();

				//console.log('Ignore reloading Misc.Prof data as there are no selected/ valid cost centers found')

				vm.closePopup(vm.Control.popupLinkCostCenter.id);
			}
		}

		vm.getArrayData = function (sourceArr) {
			var _arr = [];
			if (sourceArr != null & sourceArr.length > 0) {
				_arr = sourceArr.slice();
			}
			return _arr;
		}

		//populatePhysicianContractDetails
		vm.populatePhysicianContractDetails = function (data) {
			//start processing contract data

			vm.physicianContractDetails = data.physicianContractDetails;

			vm.physicianContractDetails.IsCurrentContractActive = vm.physicianContractDetails.Active;

			//imp:******  we get the complete data for the selected tab  

			//add or modifying original db info for ui purpose
			vm.SendToPayrollOrAPDetails = data.response.SendToPayrollOrAPDetails;


			//FTE data inside popup
			var fteList = data.response.PhysicianContractFTE;

			//reset increment id
			fteList = UtilService.addUniqueRowIdTotheList(fteList);

			vm.PhysicianContractFTE = fteList;

			//set FTE title
			vm.setFteCategoryTitle();

			//get cost center data and selected costcenter Id
			vm.ProvCostcenterData = data.response.CostcenterData;

			//assign cost center 
			var defaultCCId = 0;
			if (vm.physicianContractDetails.ContractId == 0) {
				defaultCCId = vm.physicianContractDetails.DeptId;
			} else {
				defaultCCId = UtilService.getSelectedDropdownListValue(vm.ProvCostcenterData, 0);
			}

			vm.physicianContractDetails.CostCenterId = defaultCCId + '';
			vm.MultiRegionLocationCC.Model = UtilService.getSelectedDropdownModelByValue(vm.physicianContractDetails.CostcenterDropDownData, defaultCCId);

			//if mark completed is checked then disable it 
			vm.physicianContractDetails.MarkCompleteEnabled = (vm.physicianContractDetails.IsMarkCompleted == true ? false : true);

			//MarkCompleteVisible
			if (vm.physicianContractDetails.ApprovalMarkCompleted == 1 || vm.physicianContractDetails.ApprovalProcessExists >= 2) {
				vm.physicianContractDetails.MarkCompleteVisible = true;
			} else {
				vm.physicianContractDetails.MarkCompleteVisible = false;
			}

			//prepare data for miscellaneous Prof.Settings: [accordion controls]   
			//var CostcenterId = UtilService.convertDataByDatatype(vm.physicianContractDetails.CostCenterId, UtilService.datatype.number, 0, 0);

			//if (vm.physicianContractDetails.RegionId > 0 && vm.physicianContractDetails.LocationId > 0 && CostcenterId > 0 && vm.physicianContractDetails.CompModelSpecialtyId > 0) {
			//	vm.displayProfileSettings = vm.prepareMiscProfileData(data.response.displayProfileSettings);
			//} else {
			//	vm.displayProfileSettings = null;
			//}

			//fill entity name for ui
			vm.physicianContractDetails.BillingEntityName = vm.physicianContractDetails.EntityName;

			vm.setDisplayProfileSettings(data.response.displayProfileSettings);

			//1.master data to be loaded: flag each and every server call status and handle response accordingly   
			vm.loadMasterData();

			//pass LocationId to Payelements controller to load cost centers and display add button
			vm.informPayElemtsCostCenterChangingonLocationId(vm.operationmode.load);

			//get pay cycle for the selected location
			$timeout(function () { vm.getPayCycleByRegionAndLocation(); }, 10);

			//entity search
			$timeout(function () { vm.setupAutoCompletion(); }, 10);
		}

		vm.setDisplayProfileSettings = function (displaySettings) {
			//set master data in cache 
			displaySettings = vm.cacheMasterDisplaySettingsIndetailsSourcesData(displaySettings);

			var disProfSettings = vm.prepareMiscProfileData(displaySettings);

			for (var i = 0; i < disProfSettings.length; i++) {
				var _detrows = disProfSettings[i].displaySettingsIndetails;

				//reset overlapping flag
				_detrows = UtilService.resetOverlappingRangeFlag(_detrows);
				disProfSettings[i].displaySettingsIndetails = _detrows;

			}
			vm.displayProfileSettings = disProfSettings;

			setTimeout(function () { vm.setupdatepickers(); }, 50);
		}

		//track: asynchronous calls status and inform parent controller to enable save button 
		vm.loadMasterData = function () {
			var userInfo = UtilService.getCurrentUserInfo();
			vm.trackAsyncData = [
				{
					enmkey: UtilService.enmCache.FTEData,
					cacheKey: UtilService.enmCache.FTEData,
					model: null,
					status: vm.loadingStatus.loading
				},
				{
					enmkey: UtilService.enmCache.specialities,
					cacheKey: UtilService.enmCache.specialities + '_' + vm.currentTab.CompensationModelId,
					model: { compensationModelId: vm.currentTab.CompensationModelId },
					status: vm.loadingStatus.loading
				},
				{
					enmkey: UtilService.enmCache.displaySettings,
					cacheKey: UtilService.enmCache.displaySettings + '_' + vm.currentTab.CompensationModelId,
					model: { compensationModelId: vm.currentTab.CompensationModelId },
					status: vm.loadingStatus.loading
				},
				{
					enmkey: UtilService.enmCache.contractChanges,
					cacheKey: UtilService.enmCache.contractChanges + '_' + vm.physicianContractDetails.IsMarkCompleted,
					model: { isMarkComplete: vm.physicianContractDetails.IsMarkCompleted == true ? 1 : 0 },
					status: vm.loadingStatus.loading
				},
				//{
				//	enmkey: UtilService.enmCache.Regions,
				//	cacheKey: UtilService.enmCache.Regions,
				//	model: { roleCode: userInfo.CurrentUserRoleCode },
				//	status: vm.loadingStatus.loading
				//},
				{
					enmkey: UtilService.enmCache.LocationsByRegionId,
					cacheKey: UtilService.enmCache.LocationsByRegionId + '_' + vm.physicianContractDetails.RegionId,
					model: { roleCode: userInfo.CurrentUserRoleCode, regionId: vm.physicianContractDetails.RegionId },
					status: vm.loadingStatus.loading
				},
				{
					enmkey: UtilService.enmCache.CostcentersByLocationId,
					cacheKey: UtilService.enmCache.CostcentersByLocationId + '_' + vm.physicianContractDetails.RegionId + '_' + vm.physicianContractDetails.LocationId,
					model: { roleCode: userInfo.CurrentUserRoleCode, regionId: vm.physicianContractDetails.RegionId, locationId: vm.physicianContractDetails.LocationId },
					status: vm.loadingStatus.loading
				}
			];

			vm.loadMasterDataByKey(userInfo, vm.trackAsyncData[0]);
		}

		//REST: load all master data
		vm.loadMasterDataByKey = function (userInfo, cacheConfig) {
			//get pay elements data from cache  
			provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {
				//success:update status 
				cacheConfig.status = vm.loadingStatus.loaded;
				vm.handleSuccessCacheData(cacheConfig, response);

				//load other dropdowns data
				for (var i = 0; i < vm.trackAsyncData.length; i++) {
					if (vm.trackAsyncData[i].enmkey != cacheConfig.enmkey && vm.trackAsyncData[i].status != vm.loadingStatus.loaded) {
						//vm.trackAsyncData[i].status = cacheConfig.status;
						var config = vm.trackAsyncData[i];
						return vm.loadMasterDataByKey(userInfo, config);
						break;
					}
				}

				//hide loading image
				$timeout(function () { vm.imLoading = false; }, 10);
				//$scope.$apply();

			}, function (jqXHR) {
				//err:update status
				vm.imLoading = false;
				//log the exception
				try { $exceptionHandler(jqXHR); } catch (e1) { }

				//there is some error
				cacheConfig.status = vm.loadingStatus.error;
				vm.handleSuccessCacheData(cacheConfig, jqXHR);
			});
		}

		//handleSuccessCacheData
		vm.handleSuccessCacheData = function (cacheConfig, response) {
			//update status
			for (var i = 0; i < vm.trackAsyncData.length; i++) {
				if (vm.trackAsyncData[i].enmkey == cacheConfig.enmkey) {
					vm.trackAsyncData[i].status = cacheConfig.status;
					break;
				}
			}

			if (cacheConfig.enmkey == UtilService.enmCache.FTEData) {
				if (cacheConfig.status == vm.loadingStatus.loaded) {
					//update loading status to loaded  
					if (response != null) {
						var _list = response.fTECategories;

						if (_list != null && _list.length > 0 && parseInt(_list[0].id) == 0)
							_list.splice(0, 1);
						vm.FTECategories = _list;
					}
				} else {//error
					vm.FTECategories = [];
				}
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.specialities) {
				if (cacheConfig.status == vm.loadingStatus.loaded) {
					var _compModelSpecialties = [];
					if (response != null) {
						_compModelSpecialties = response.compModelSpecialties;
					}
					//assign comp speciality models
					vm.compModelSpecialties = _compModelSpecialties;
				} else {//error
					vm.compModelSpecialties = [];
				}
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.displaySettings) {

				if (cacheConfig.status == vm.loadingStatus.loaded) {
					var _displaySettings = [];

					//fill display profile settings dropdown 
					if (response != null && response.DisplaySettings != null) {
						_displaySettings = response.DisplaySettings;
					}

					//get selected display settings for the selected contract and mark it as selected
					//vm.physicianContractDetails.DisplaySettingIds.split(','); 
					var _selDispArr = [];

					if (vm.displayProfileSettings != null) {
						for (var i = 0; i < vm.displayProfileSettings.length; i++) {
							if (vm.displayProfileSettings[i].IsSelected == true) {
								//_selDispArr.push(vm.displayProfileSettings[i].LookupType);
								_displaySettings[i].IsSelected = true;
								_selDispArr.push(_displaySettings[i]);
							}
						}
					}

					//assign comp speciality models
					vm.displaySettings = _displaySettings;
					vm.selectDisplaySettingsModel = _selDispArr;
				} else {
					//error
					vm.displaySettings = [];
					vm.selectDisplaySettingsModel = [];
				}
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.contractChanges) {
				if (cacheConfig.status == vm.loadingStatus.loaded) {
					var _contractChanges = [];
					var _selContractId = "0";
					if (response != null) {
						//Subcontract changes 
						_contractChanges = response.contractChanges;
						_selContractId = UtilService.getSelectedDropdownListValue(_contractChanges, "0");
					}
					//assign contract changes 
					vm.physicianContractDetails.ContractChanges = _contractChanges;
					vm.physicianContractDetails.SelectedContractId = _selContractId;
				} else {//error
					vm.physicianContractDetails.ContractChanges = [];
					vm.physicianContractDetails.SelectedContractId = "0";
				}
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.Regions) {
				vm.bindRegionAndLocationMasterList(cacheConfig, response);
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.LocationsByRegionId) {
				vm.bindRegionAndLocationMasterList(cacheConfig, response);
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.CostcentersByLocationId) {
				vm.bindRegionAndLocationMasterList(cacheConfig, response);
			}
		}

		//bind regionAndLocationMasterList and pass LocationId to Payelements controller to load cost centers and display add button
		vm.bindRegionAndLocationMasterList = function (cacheConfig, response) {
			if (cacheConfig.enmkey == UtilService.enmCache.Regions) {
				var _regionIds = [];
				//var _selectedRegionModel = [];
				if (cacheConfig.status == vm.loadingStatus.loaded) {
					if (response != null) {
						_regionIds = response.regions;
					}
				}
				//assign set the region id if it has got already
				vm.RegionMasterList = _regionIds;
				//vm.SelectedRegionModel = _selectedRegionModel;
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.LocationsByRegionId) {
				var _list = [];
				if (cacheConfig.status == vm.loadingStatus.loaded) {
					if (response != null) {
						_list = response.locations;

						if (_list != null && _list.length > 0 && parseInt(_list[0].id) == 0)
							_list.splice(0, 1);
					}
				}
				//assign set the region id if it has got already
				vm.LocationMasterList = _list;

				//set the location values
				vm.LocationDropDownData = _list;

				var _selid = vm.physicianContractDetails.LocationId
				//assign cost center
				if (vm.physicianContractDetails.CostcenterDropDownData != null && vm.physicianContractDetails.CostcenterDropDownData.length > 0) {
					//clear cost center dropdown selection
					_selid = '0';
				}
				//select default value
				_selid = (_selid == null ? '0' : _selid);

				//assign
				vm.physicianContractDetails.LocationId = _selid + '';
				vm.MultiRegionLocation.Model = UtilService.getSelectedDropdownModelByValue(vm.LocationMasterList, _selid);

				//update tab Name based on Location
				vm.updateTabName();
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.CostcentersByLocationId) {
				//bind regionAndLocationMasterList and pass LocationId to Payelements controller to load cost centers and display add button 
				var _list = [];
				if (cacheConfig.status == vm.loadingStatus.loaded) {
					if (response != null) {
						_list = response.costcenters;

						if (_list != null && _list.length > 0 && parseInt(_list[0].id) == 0)
							_list.splice(0, 1);

						//make list null when region or location id is null. There shudn't be any performance issue as we retreive this datafrom cache
						if (parseInt(vm.physicianContractDetails.LocationId) == 0) {
							_list = null;
						}
					}
				}

				//when contract is new then assign default dept id to costcenter 
				var defaultCCId = 0;
				if (vm.physicianContractDetails.ContractId == 0) {
					defaultCCId = vm.physicianContractDetails.DeptId;
				} else {
					defaultCCId = vm.physicianContractDetails.CostCenterId;
				}


				var _selCostCenterId = 0;
				if (_list != null) {
					for (var i = 0; i < _list.length; i++) {
						if (_list[i].id == parseInt(defaultCCId)) {
							_selCostCenterId = _list[i].id;
							break;
						}
					}
				}

				//assign selected cost center
				if (_list != null && _list.length == 1) {
					vm.physicianContractDetails.CostCenterId = _list[0].id + '';
				} else {
					vm.physicianContractDetails.CostCenterId = _selCostCenterId + '';
				}

				//below CostcenterDropDownData in contract section next to specialities
				vm.physicianContractDetails.CostcenterDropDownData = _list;
				vm.MultiRegionLocationCC.Model = UtilService.getSelectedDropdownModelByValue(_list, vm.physicianContractDetails.CostCenterId);



				vm.CostcenterDropDownData = _list;
				vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';
				vm.PopupMultiCostCenter.Model = [];
			}
		}

		//pass LocationId to Payelements controller to load cost centers and display add button 
		vm.informPayElemtsCostCenterChangingonLocationId = function (operationmode) {
			//do we need to reload costcenter list for this tab as well for the selected region & location  
			setTimeout(function () {
				sharedService.broadcast_OnContractDataChange({
					tab: vm.currentTab, source: provHelper.contractPESource.RegionLocationId
					, operationmode: operationmode
					, physicianContractDetails: vm.physicianContractDetails
				});
			}, 10);
		}

		//when region dopdown selection changes
		vm.loadLocationsByRegionId = function (regionId) {
			vm.physicianContractDetails.LocationId = '0';
			vm.MultiRegionLocation.Model = [];

			//clear cost center popup dropdown selection as well 
			vm.PopupMultiLocation.Model = [];
			vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = 0;
			vm.Control.ddlCostCenterPopupLocation.SelectedCostCenterId = 0;

			//pass LocationId to Payelements controller to load cost centers and display add button
			vm.informPayElemtsCostCenterChangingonLocationId();

			//get pay cycle for the selected location
			$timeout(function () { vm.getPayCycleByRegionAndLocation(); }, 10);

			var userInfo = UtilService.getCurrentUserInfo();

			//refresh location list by region
			var _cacheConfig = {
				enmkey: UtilService.enmCache.LocationsByRegionId,
				cacheKey: UtilService.enmCache.LocationsByRegionId + '_' + vm.physicianContractDetails.RegionId,
				model: { roleCode: userInfo.CurrentUserRoleCode, regionId: vm.physicianContractDetails.RegionId },
				status: vm.loadingStatus.loading
			}

			vm.loadMasterDataByKey(userInfo, _cacheConfig);
		}

		vm.updateTabName = function () {
			var locShortName = null;
			var locobj = UtilService.getSelectedDropdownModelByValue(vm.LocationMasterList, vm.physicianContractDetails.LocationId, null);
			if (locobj != null && locobj.length > 0) {
				locShortName = locobj[0].LocationShortName;
			}
			//update tab name
			$scope.$parent.ms.updateCompModelTabNameByLocationAndCostCenter(vm.currentTab, vm.physicianContractDetails.RegionDesc, locShortName, locobj);
		}

		//clear all pay elements on location Id change 
		vm.clearAllPayElementsOnLocationChange = function () {
			//clear all pay elements
			setTimeout(function () {
				sharedService.broadcast_OnContractDataChange({
					tab: vm.currentTab, source: provHelper.contractPESource.LocationId
					, physicianContractDetails: vm.physicianContractDetails
				});
			}, 10);
		}

		vm.enableLocationConfirmation = function () {
			//create dynamic modal popup 
			var title = "Are you sure want to proceed?";
			var message = 'Pay Element changes will be lost if you change the Location.';

			var newDiv = $(document.createElement('div'));

			var dynamicbuttons = {
				"Yes": function () {
					newDiv.dialog("close");
					vm.clearAllPayElementsOnLocationChange();
				},
				"No": function () {
					newDiv.dialog("close");
				}
			};


			newDiv.dialog({
				title: title,
				autoOpen: true,
				modal: true,
				resizable: false,
				closeOnEscape: true,
				open: function () {
					$(this).html(message);
				},
				show: {
					effect: "blind",
					duration: 500
				},
				hide: {
					effect: "explode",
					duration: 500
				}
				, buttons: dynamicbuttons
			});
		}

		vm.onlocationIdChange = function (locationId) {
			vm.loadCostCentersByLocationId(locationId);

			//clear all pay elements on location Id change
			vm.clearAllPayElementsOnLocationChange();
		}

		//when location dopdown selection changes
		vm.loadCostCentersByLocationId = function (locId, source, tobeselCostCenterId) {
			if (tobeselCostCenterId == undefined || tobeselCostCenterId == null) {
				//clear cost center dropdown selection
				tobeselCostCenterId = '0';
			} else {
				tobeselCostCenterId = tobeselCostCenterId + '';
			}

			//update tab name
			vm.updateTabName();

			//clear cost center dropdownlist data
			vm.physicianContractDetails.CostcenterDropDownData = [];

			//get region&location Id
			var regionId = vm.physicianContractDetails.RegionId;
			var locationId = vm.physicianContractDetails.LocationId;

			//refresh costcenters by location & region 
			var userInfo = UtilService.getCurrentUserInfo();
			var cacheConfig = {
				enmkey: UtilService.enmCache.CostcentersByLocationId,
				cacheKey: UtilService.enmCache.CostcentersByLocationId + '_' + regionId + '_' + locationId,
				model: { roleCode: userInfo.CurrentUserRoleCode, regionId: regionId, locationId: locationId },
				status: vm.loadingStatus.loading
			}

			//get pay elements data from cache  
			provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {
				var _list = [];
				if (response != null) {
					_list = response.costcenters;
				}

				//make list null when region or location id is null. There shudn't be any performance issue as we retreive this datafrom cache
				if (parseInt(locationId) == 0) {
					_list = null;
				}

				//var _selcostcenter = tobeselCostCenterId;//vm.physicianContractDetails.CostCenterId; 
				var _selcostcenter = null;
				if (_list != null) {
					for (var i = 0; i < _list.length; i++) {
						if (parseInt(_list[i].id) == parseInt(tobeselCostCenterId)) {
							_selcostcenter = _list[i].id;
							break;
						}
					}
				}
				//assign cost center 

				//select default value
				_selcostcenter = (_selcostcenter == null ? '0' : _selcostcenter);


				//below CostcenterDropDownData in contract section next to specialities
				vm.physicianContractDetails.CostcenterDropDownData = _list;
				//assign
				vm.physicianContractDetails.CostCenterId = _selcostcenter + '';
				vm.MultiRegionLocationCC.Model = UtilService.getSelectedDropdownModelByValue(vm.physicianContractDetails.CostcenterDropDownData, _selcostcenter);

				//pass LocationId to Payelements controller to load cost centers and display add button
				$timeout(function () { vm.informPayElemtsCostCenterChangingonLocationId(); }, 50);

				//get pay cycle for the selected location
				$timeout(function () { vm.getPayCycleByRegionAndLocation(); }, 10);

				if (source == 'popup') {
					//reload misc. profile section
					vm.loadDisplaySettingsBySpeciality();
					vm.closePopup(vm.Control.popupLinkCostCenter.id);
				}

			}, function (jqXHR) {
				//log the exception
				try { $exceptionHandler(jqXHR); } catch (e1) { }

				vm.physicianContractDetails.CostcenterDropDownData = [];
				vm.physicianContractDetails.CostCenterId = '0';
				vm.MultiCostCenter.Model = [];

				//reload misc. profile section
				vm.loadDisplaySettingsBySpeciality();

				//err:update status
				//vm.handleSuccessCacheData(cacheConfig, err);
			});
		}

		//this event gets invoked whenever Specialty value gets changed
		vm.loadDisplaySettingsByCostCenter = function () {
			$timeout(function () {
				//pass LocationId to Payelements controller to load cost centers and display add button 
				vm.informPayElemtsCostCenterChangingonLocationId();

				vm.loadDisplaySettingsProfilesByRLCSP();
			}, 10);
		}
		//this event gets invoked whenever Specialty value gets changed
		vm.loadDisplaySettingsBySpeciality = function () {
			$timeout(function () { vm.loadDisplaySettingsProfilesByRLCSP(); }, 10);
		}

		/* auto complete: provider search */
		vm.setupAutoCompletion = function () {
			var userInfo = UtilService.getCurrentUserInfo();

			//set up auto complete
			$(".autosuggestEntity").autocomplete({
				source: function (request, response) {
					if (request.term.length >= 1) {
						var query = {
							searchParams: $.trim(request.term),
							PhysicianID: vm.physicianContractDetails.PhysicianId,
							orgCompModelId: vm.currentTab.CompensationModelId,
							currentRoleName: userInfo.CurrentUserRole,
						};

						//clear all error messages
						provHelper.hideAllNotifications();
						//get the data
						provService.entitySearch(query).then(providerSearchCallback, function errorCallback(err) {
							vm.physicianContractDetails.EntityID = 0;
							vm.physicianContractDetails.EntityName = "";
							err = 'No results found.';
							// called if any error occurs 
							response([{ label: JSON.stringify(err), val: 0 }]);
						});

						function providerSearchCallback(result) {
							//process the response
							if (result == null || result.length == 0 || result.ProviderSearchList == null
								|| result.ProviderSearchList == undefined || result.ProviderSearchList.length == 0) {
								response([{ label: 'No results found.', val: 0 }]);
							}
							else {
								response($.map(result.ProviderSearchList, function (item) {
									return {
										label: item.ProviderName,//item.split('©')[0],
										val: item.ProviderId,//item.split('©')[1], 
									}
								}))
							}
						}
					}
					else {
						$(this).removeClass("ui-autocomplete-loading");
					}
				},
				select: function (e, data) {

					// remove loading image from search box
					$(this).attr('title', data.item.label).removeClass("ui-autocomplete-loading");

					if (data.item.val <= 0) {
						$(this).focus();
						return;
					}

					vm.physicianContractDetails.EntityID = data.item.val;
					vm.physicianContractDetails.EntityName = data.item.label;
					//temp variable
					vm.physicianContractDetails.BillingEntityName = data.item.label;
				},
				minLength: 1
			})//.on("blur", function () {
			//	$timeout(function () { vm.physicianContractDetails.BillingEntityName = vm.physicianContractDetails.EntityName; }, 10);
			//});
		}

		//REST:load displaysettings profiles based on Region,location,Costcenter, Speciality,PositionLevel 
		vm.loadDisplaySettingsProfilesByRLCSP = function () {
			//clear all error messages 
			provHelper.hideAllNotifications()

			var CostcenterId = UtilService.convertDataByDatatype(vm.physicianContractDetails.CostCenterId, UtilService.datatype.number, 0, 0);

			if (parseInt(vm.physicianContractDetails.RegionId) > 0 && parseInt(vm.physicianContractDetails.LocationId) > 0 && parseInt(CostcenterId) > 0 && parseInt(vm.physicianContractDetails.CompModelSpecialtyId) > 0) {

				vm.imLoadingMiscProf = true;
				//prepare data for post
				var selectedDisplaysettingsIds = vm.getDisplaySettingIds();

				//get user info
				var userInfo = UtilService.getCurrentUserInfo();

				//1.prepare model
				var query = {
					providerId: vm.physicianContractDetails.PhysicianId
					, masterContractID: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedMasterContractId
					, year: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedYear
					, currentRoleID: userInfo.CurrentRoleID
					, currentRoleName: userInfo.CurrentUserRole
					, RegionId: vm.physicianContractDetails.RegionId
					, LocationId: vm.physicianContractDetails.LocationId
					, CostcenterId: CostcenterId
					, PositionLevelID: vm.physicianContractDetails.PositionId
					, compensationModels: vm.currentTab.Value
					, selectedDisplaysettingsIds: selectedDisplaysettingsIds
					, orgCompModelSpecialityId: vm.physicianContractDetails.CompModelSpecialtyId
				};

				//2.blockui
				UtilService.blockUI();

				//3. make service call
				provService.loadDisplaySettingsProfilesByRLCSP(query).then(onSuccess, onError);

				//4.success callback
				function onSuccess(response) {
					//unblockui
					$.unblockUI();

					var displayProfileSettings = null;
					if (response != null && response.displayProfileSettings != null) {
						displayProfileSettings = response.displayProfileSettings;
					}

					//prepare data for miscellaneous Prof.Settings: [accordion controls] 
					vm.setDisplayProfileSettings(displayProfileSettings);

					vm.imLoadingMiscProf = false;
				}

				function onError(jqXHR) {
					//unblockui
					$.unblockUI();
					vm.displayProfileSettings = null;
					vm.imLoadingMiscProf = false;

					provHelper.handleServerError(jqXHR, vm.Control.PnlContractValidationSummary.id);
				}
			} else {
				vm.displayProfileSettings = null;
				vm.imLoadingMiscProf = false;
			}
		}

		vm.cacheMasterDisplaySettingsIndetailsSourcesData = function (disProfSettings) {
			if (disProfSettings != null) {
				for (var i = 0; i < disProfSettings.length; i++) {

					//to be fine tuned in api: need this data to bring to root node and decouple it from get response and use it from cache later
					var _cacheMasterDropdownData = [];


					var _detrows = disProfSettings[i].displaySettingsIndetails;
					if (_detrows != null) {
						for (var j = 0; j < _detrows.length; j++) {

							_detrows[j].displaySettingsIndetailsSources.forEach(function (obj) {
								obj.id = parseInt(obj.id);
							});

							//use angular.copy to avoid deep copy
							_cacheMasterDropdownData = angular.copy(_detrows[j].displaySettingsIndetailsSources);

							//since this is master data, update IsSelected to false for all options
							_cacheMasterDropdownData.forEach(function (obj) {
								obj.IsSelected = false
							});

							//assign dropdown data for cache purpose
							disProfSettings[i].MasterDisplaySettingsIndetailsSourcesData = _cacheMasterDropdownData;


							break;

						}
					}
				}
			}
			return disProfSettings != null ? disProfSettings : [];
		}
		//prepare data for miscellaneous Prof.Settings: [accordion controls] 
		vm.prepareMiscProfileData = function (disProfSettings) {
			if (disProfSettings != null) {
				for (var i = 0; i < disProfSettings.length; i++) {
					disProfSettings[i].selectedDisplaysettingProfileId = UtilService.getSelectedDropdownListValue(disProfSettings[i].displysettingsProfileSource, "0");

					//to be fine tuned in api: need this data to bring to root node and decouple it from get response and use it from cache later
					//var _cacheMasterDropdownData = [];
					//accordion table data 
					var prof = disProfSettings[i];
					var _detrows = prof.displaySettingsIndetails;
					if (_detrows != null) {
						for (var j = 0; j < _detrows.length; j++) {
							//set the selected value
							//convert string to number for id property
							_detrows[j].displaySettingsIndetailsSources.forEach(function (obj) {
								obj.id = parseInt(obj.id);
							});

							//update SourcePKID 
							_detrows[j].SourcePKID = UtilService.getSelectedDropdownListValue(_detrows[j].displaySettingsIndetailsSources, -1);

							//add dynamic seqrowid to manage add delete data
							_detrows[j].UniqueRowID = j;

							_detrows[j].SeqRowId = j;

							// append dynamic control 
							_detrows[j].Control = vm.getMiscControlIdConfigBySeqRowId(prof.LookupType, j);


							//add the record status, helps in displaying confirmation message while deleting original data.
							_detrows[j].recordstatus = (_detrows[j].recordstatus == undefined ? vm.recordstatus.original : _detrows[j].recordstatus);

							//IsDeleted:false only on explictly deleted rows
							_detrows[j].IsDeleted = (_detrows[j].IsDeleted != undefined ? _detrows[j].IsDeleted : false);

							//set IsOverlappingRange to false
							_detrows[j].IsOverlappingRange = (_detrows[j].IsOverlappingRange != undefined ? _detrows[j].IsOverlappingRange : false);
						}
					}

					prof.accordion = "profiles_accordion_" + i + vm.currentTab.Id;
					prof.accordionNotificationDiv = prof.accordion + "_errmessage";

					disProfSettings[i] = prof;
				}
			}
			return disProfSettings != null ? disProfSettings : [];
		}

		//display settings multi select actions
		vm.displaySettingsEvents = {
			onItemSelect: function (item) {
				vm.updateDisplayProfileSettingsFlag(item, true);
			},
			onItemDeselect: function (item) {
				vm.updateDisplayProfileSettingsFlag(item, false);
			},
			onSelectAll: function () {
				vm.updateDisplayProfileSettingsFlag(null, true);
			},
			onDeselectAll: function (item) {
				vm.updateDisplayProfileSettingsFlag(null, false);
			}
		}

		//compare and set isselected to true/false for the Miscellaneous prof. settings
		vm.getDisplayProfileSettingsItemById = function (id) {
			var prof = null;
			var _displayProfileSettings = vm.displayProfileSettings;
			if (_displayProfileSettings != null) {
				for (var i = 0; i < _displayProfileSettings.length; i++) {
					//compare and set isselected to true/false 
					if (_displayProfileSettings[i].accordion == id) {
						prof = _displayProfileSettings[i];
						break;
					}
				}
			}
			return prof;
		}

		vm.updateDisplayProfileSettingsFlag = function (item, b) {
			var _displayProfileSettings = vm.displayProfileSettings;
			if (_displayProfileSettings != null) {
				for (var i = 0; i < _displayProfileSettings.length; i++) {
					//compare and set isselected to true/false 
					if (item == null || _displayProfileSettings[i].DisplaySettingName == item.label || _displayProfileSettings[i].DisplaySettingName == item.DisplaySettingName) {
						_displayProfileSettings[i].IsSelected = b;
					}
				}
			}
			vm.displayProfileSettings = _displayProfileSettings;
		}

		vm.expandMiscProfAccordion = function (prof, toogle) {
			var $profaccordion = $('#' + prof.accordion);
			$profaccordion.attr("state", "open");
			//find icon next to header and then toggle the class
			$profaccordion.prevAll("h3:first").find('span.ui-icon').removeAttr('class').attr('class', '').addClass("ui-icon ui-icon-triangle-1-s");

			if (toogle != undefined) {
				$profaccordion.css("display", "block");
			}

			//open panel
			if (prof.IsSelected == false) {
				for (var i = 0; i < vm.displayProfileSettings.length; i++) {
					if (vm.displayProfileSettings[i].LookupType == prof.LookupType) {
						vm.displayProfileSettings[i].IsError = true;
						break;
					}
				}
			}
		}

		vm.collapseMiscProfAccordion = function (prof, toogle) {
			var $profaccordion = $('#' + prof.accordion);
			$profaccordion.attr("state", "close");
			//find icon next to header and then toggle the class
			$profaccordion.prevAll("h3:first").find('span.ui-icon').removeAttr('class').attr('class', '').addClass("ui-icon ui-icon-triangle-1-e");

			if (toogle != undefined) {
				$profaccordion.css("display", "none");
			}
		}

		//toggleMiscProfAccordion
		vm.toggleMiscProfAccordion = function (prof) {
			var _isItDropdown = false;
			try {
				if (event.target.type.indexOf("select") != -1) {
					_isItDropdown = true;
				}
			} catch (e) { }

			if (!_isItDropdown) {
				var $profaccordion = $('#' + prof.accordion);
				if ($profaccordion.attr("state") == undefined || $profaccordion.attr("state") == "close") {
					vm.expandMiscProfAccordion(prof);
				} else {
					vm.collapseMiscProfAccordion(prof);
				}
				$profaccordion.slideToggle();
			}
		}

		//REST:broadcast_loadPhysicianContract
		vm.refreshContractSectionData = function () {
			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.PnlContractValidationSummary.id);

			setTimeout(function () {
				vm.imLoading = true;
				$scope.$apply();
			}, 10);

			setTimeout(function () {
				//invoke parent controller function
				//get user info
				var userInfo = UtilService.getCurrentUserInfo();

				//1.prepare model
				var query = {
					providerId: vm.physicianContractDetails.PhysicianId
					, masterContractID: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedMasterContractId
					, year: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedYear
					, compensationModels: vm.currentTab.Value// vm.currentTab.Value
					, currentRoleID: userInfo.CurrentRoleID
					, currentRoleName: userInfo.CurrentUserRole
					//, isShowOriginal
					//, loadPreview 
				};


				//3. make service call
				provService.loadPhysicianContract(query).then(onSuccess, onError);
				//success callback
				function onSuccess(response) {
					if (response != null && response.physicianContractDetails != null) {
						setTimeout(function () {
							//6.update tab contents

							//wait for a half sec while tabs are getting constrcuted
							for (var i = 0; i < response.physicianContractDetails.length; i++) {
								//take respective tab data only and then ignore rest tab data 
								if (vm.currentTab.Value == response.physicianContractDetails[i].ContractCompmodelId) {
									var _data = { physicianContractDetails: response.physicianContractDetails[i], response: response };

									//reassign tab content data
									vm.currentTab.physicianContractDetails = _data.physicianContractDetails;
									vm.currentTab.IsDataLoaded = true;
									vm.currentTab.response = _data.response;
									//vm.currentTab.IsDataLoaded = true;
									vm.populatePhysicianContractDetails(_data);
									//sharedService.broadcast_loadPhysicianContract({ tab: tab, physicianContractDetails: response.physicianContractDetails[i], response: response });
									break;
								}
							}
							//4. unblock ui 
						}, 50);
					}
				}

				function onError(jqXHR) {
					//unblockui
					$.unblockUI();
					vm.imLoading = false;

					provHelper.handleServerError(jqXHR, vm.Control.PnlContractValidationSummary.id);
				}
				//var selCompId = vm.parentTab.Value;
				//$scope.$parent.$parent.ms.broadcast_loadPhysicianContract(vm.parentTab, selCompId);
			}, 100);
		}

		vm.initializeProvCompFields = function () {
			//init and clear data
			vm.clearFormData();

			setTimeout(function () { vm.setupdatepickers(); }, 100);
			setTimeout(function () { vm.setupPopUpDialog(); }, 100);

		}

		vm.clearFormData = function () {
			//get current tab configuration from parent controller

			vm.physicianContractDetails = {
				ContractId: 0,
				PhysicianId: 0,
				CompensationModelId: 0,
				CompModelSpecialtyId: 0,
				DeptId: 0,
				PositionId: 0,
				StartDate: "",
				EndDate: "",
				Active: true,
				InActivatedOn: null,
				PhysicianContractReferenceId: null,
				PhysicianContractReferenceNavigationURL: "",
				CalenderYearBased: null,
				ContractHtmlContent: null,
				MaxCompensationAmount: null,
				Comments: "",
				DisplaySettingIds: "",
				QuarterlytrueupPercentage: null,
				OriginalEndDate: "",
				CompensationBenchMarkingThreshold: 0.00,
				BenchMarkingSource: null,
				NoticePeriod: null,
				OrgCompensationModelID: null,
				CompensationModelName: "",
				BenchmarkingSourceId: null,
				AnnualwRVUSTarget: null,
				AnnualCollectionsTarget: null,
				FTE: null,
				MasterContractID: 0,
				LocationId: 0,
				RegionId: 0,
				IsMarkCompleted: true,
				ContractStatus: 0,
				ContractCompmodelId: "",
				PositionDesc: "",
				PayrollID: "",
				DeptDesc: null,
				SendToPayrollOrAP: 0,
				AllowPayElementsDatesoutsideContractDate: 0,
				ApprovalProcessExists: 0,
				StatusLabelText: "",
				StatusButtonText: null,
				CurrentApprovalStatus: 0,
				ApprovalStatus: 0,
				ApprovalRefContractID: 0,
				ApprovalMarkCompleted: 0,
				IsApprovedContractModified: 0,
				ApprovedContractModifiedContractID: 0,
				LastModifiedBy: "",
				ApproverName: "",
				LastApprovedBy: "",
				DiscardChanges: 0,
				ApprovalReqStatus: 0,
				LastApprovedOn: "",
				LastApprovalComments: "",
				ConCurrencyModifiedDate: "",
				ContractAmendedDate: null,
				HireDate: "",
				EntityID: 0,
				EntityName: "",
				BillingEntityName: "",//temp variable
				IsSelected: false
			}


			var _currentTab = $scope.$parent.tab;

			vm.currentTab = _currentTab;
			//field control configuration
			var fieldConfig = {
				SeqProvId: "",
				SeqCompContractId: "",
				PnlContractValidationSummary: { id: "pnlContractCompValidationMessage" },
				chkMarkcomplete: { id: "chkMarkcomplete", value: false },
				rbnSendPayrollOrAP: { id: "rbnSendPayrollOrAP", value: 'checked' },
				chkContractActive: { id: "chkContractActive", value: false },

				/*start, end date,Contract Ref ID,Anniv. Notice (Days),Cost Center,Specialty,,Max Compensation,Comments,Display Settings,Contract Changes,Display Settings,Contract Changes*/

				txtBilltoProvider: { id: "txtBilltoProvider" },
				StartDate: { id: "txtCurrentContractFrom" },
				EndDate: { id: "txtCurrentContractTo" },
				ContractRefID: { id: "txtContractRefID", value: "" },
				AnnivNoticePeriod: { id: "txtAnnivNoticePeriod", value: "" },
				txtMaxCompenSation: { id: "txtMaxCompenSation" },
				txtComments: { id: "txtComments", value: "" },
				BenchThresh: { id: "txtBenchThresh", value: "0.00" },
				BenchMarkingSource: { id: "ddlBenchMarkingSource", list: [], selvalue: "" },
				AnnWrvuTarget: { id: "txtAnnWrvuTarget_0", value: "" },
				AnnCollTarget: { id: "txtAnnCollTarget", value: "" },
				ddlRegionLocation: {
					id: "ddlRegionLocation", disabled: false
				},
				ddlRegionLocCostCenter: {
					id: "ddlRegionLocCostCenter"
				},
				ddlRegion: { id: "ddlRegion" },
				CostCenter: {
					id: "ddlCostCenter"
				},
				Location: {
					id: "ddlLocation"
				},
				ddlCompModelSpecialty: { id: "ddlCompModelSpecialty" },
				//popup 
				DisplaySettings: { id: "ddlDisplaySettings" },
				MiscellaneousProfileMessage: { id: "divMiscProfMsg" },
				//contract change controls
				SubContractAction: { id: "ddlSubContractAction", list: [], selvalue: "" },
				//SubContAmendDate-eff.date
				SubContAmendDate: { id: "txtSubContAmendDate", value: "" },
				SubContRenewal: { id: "ddlSubContRenewal", list: [], selvalue: "" },
				ddlContractPayElements: { id: "ddlContractPayElements" },
				CompModel: { id: "ddlCompensationModel", list: [], selvalue: "" },

				//effective date labels
				pnlAmendValMessages: { id: 'pnlAmendValMessages' },
				EffDtTitle: { value: "" },
				PayElementTitle: { value: "" },
				txtRenewalDate: {
					id: "txtRenewalDate"
					, Details: { RenewalDate: "", IsContMultiYear: false, IsProductivity: true, IsRenewalDateEnabled: true }
				},
				SubContractAmend: { id: "btnSubContractAmend", value: "" },
				//payElements 
				ddlAmendRenewalPayElements: {
					id: "ddlAmendRenewalPayElements"
					, settings: {
						//groupByTextProvider: function (groupValue) {
						//	return groupValue;
						//}
						//, groupBy: 'GroupName'
					}
				},
				//pop up - Cost Center Controls which used in the popup 
				popupLinkCostCenter: { id: "popupCostCenter" },
				pnlValidationCostCenterpopup: { id: "pnlValidationCostCenterpopup" },
				ddlCostCenterPopupLocation: { id: "ddlCostCenterPopupLocation", SelectedLocationId: 0, disabled: false },
				ddlCostCenterPopupCostCenter: { id: "ddlCostCenterPopupCostCenter", SelectedCostCenterId: 0 },
				CostCenterStartDate: { id: "txtCostCenterStDate", value: "" },
				CostCenterEndDate: { id: "txtCostCenterEndDate", value: "" },
				btnSaveCostCenters: { id: "btnSaveCostCenters", value: "Add" },
				SelectedCostCenterItem: null,
				//FTE Category
				popupLinkFTECategory: { id: "popupFTECategory" },
				pnlValidationFTEpopup: { id: "pnlValidationFTEpopup" },
				ddlpopupFTECategory: { id: "ddlpopupFTECategory", SelectedFTECategoryId: '0' },
				FTEcategory: { id: "ddlFTEcategoryPopup_DropDown", list: [], selvalue: "" },
				FtecategoryStartDate: { id: "txtFtecategoryStartDate", value: "" },
				FtecategoryEndDate: { id: "txtFtecategoryEndDate", value: "" },
				txtContractFTE: { id: "txtContractFTE", value: "" },
				btnSaveFTECategories: { id: "btnSaveFTECategories", value: "Add" },
				SelectedFTEItem: null
			}

			//append id with tabId to make it dynamic and unique
			for (var prop in fieldConfig) {
				if (fieldConfig[prop] != null && fieldConfig[prop].id != undefined && fieldConfig[prop].id != "") {
					fieldConfig[prop].id = fieldConfig[prop].id + '_' + _currentTab.Id;
				}
			}

			//assign controls config
			vm.Control = fieldConfig;

			vm.Control.ProfileDetailsSourceModel = { MPVDetailID: 0, StartDate: "", EndDate: "", SourcePKID: -1, MPVDescription: "", recordstatus: vm.recordstatus.new, IsOverlappingRange: false };


			//SubContractAction enum
			vm.SubContractActionActType = { Select: "0", Amend: "1", Extend: "2", Renewal: "3", Transition: "4", End: "5" }
		}

		//misc. configuration
		vm.getMiscControlIdConfigBySeqRowId = function (type, SeqRowId) {
			//field control configuration
			var fieldConfig = {
				SeqRowId: SeqRowId,
				StartDate: { id: "txtMiscProfStartDate", IsValid: true, ErrorDesc: '' },
				EndDate: { id: "txtMiscProfEndDate", IsValid: true, ErrorDesc: '' },
				ddlSourcePKID: { id: "ddlSourcePKID", IsValid: true, ErrorDesc: '' },
				LookupType: type
			}

			var _prefixId = 'miscprofile_row_';
			//append id with tabId to make it dynamic
			for (var prop in fieldConfig) {
				if (fieldConfig[prop].id != undefined && fieldConfig[prop].id != "") {
					fieldConfig[prop].id = _prefixId + '_' + type + '_' + fieldConfig[prop].id + '_' + vm.currentTab.Id + '_' + SeqRowId;
				}
			}
			return fieldConfig;
		}

		vm.onError = function (jqXHR) {
			//if user session is invalid then redirect to sessiontimeout page
			provHelper.redirectIfSessionTimeout(jqXHR)

			//unblock the ui 
			$timeout(function () {
				vm.imLoading = false;
				vm.imLoadingMiscProf = false;
				vm.imLoadingPE = false;
			}, 10);

			//4. unblock ui
			$.unblockUI();

			//scroll to top to focus user on error msg
			$timeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 200);

			//5. handle errors in ui  
			provHelper.handleServerError(jqXHR, vm.Control.PnlContractValidationSummary.id);
		}

		vm.onPageLoad = function () {
			//initialize field configuration
			vm.initializeProvCompFields();
		}

		vm.openPopup = function (popupid) {
			return provHelper.openPopup(popupid);
		}

		vm.closePopup = function (popupid) {
			return provHelper.closePopup(popupid);
		}

		vm.disableLocationIfAnyPayElementExists = function () {
			var _isActivePEFound = false;

			//check if at least on active record in db 
			if (vm.CurrentPayElements != undefined && vm.CurrentPayElements.length > 0) {
				_isActivePEFound = true;
			}

			if (_isActivePEFound) {
				vm.Control.ddlRegionLocation.disabled = true;
				vm.Control.ddlCostCenterPopupLocation.disabled = true;
			} else {
				vm.Control.ddlRegionLocation.disabled = false;
				vm.Control.ddlCostCenterPopupLocation.disabled = false;
			}
		}

		//set costcenter, FTE category modal pop ups dynamically 
		vm.setupPopUpDialog = function () {
			$('#' + vm.Control.popupLinkCostCenter.id, $("#" + vm.currentTab.Id)).dialog({
				autoOpen: false,
				modal: true,
				width: 650,
				//height: 500,
				resizable: false,
				closeOnEscape: false,
				show: {
					effect: "blind",
					duration: 100
				},
				hide: {
					effect: "explode",
					duration: 500
				}
				, open: function () {
					//clear all notifications
					provHelper.hideAllNotifications();

					//assign data
					vm.tmpProvCostcenterData = vm.ProvCostcenterData.slice();

					for (var i = 0; i < vm.tmpProvCostcenterData.length; i++) {
						vm.tmpProvCostcenterData[i].DepartmentId = vm.tmpProvCostcenterData[i].id;
						vm.tmpProvCostcenterData[i].DepartmentDesc = vm.tmpProvCostcenterData[i].label;
					}

					vm.clearProvCostCenter();

					//for popup 
					$timeout(function () {
						vm.disableLocationIfAnyPayElementExists();

						vm.PopupMultiLocation.Model = UtilService.getSelectedDropdownModelByValue(vm.LocationMasterList, vm.physicianContractDetails.LocationId);
						vm.Control.ddlCostCenterPopupLocation.SelectedLocationId = vm.physicianContractDetails.LocationId + '';

						vm.CostcenterDropDownData = vm.physicianContractDetails.CostcenterDropDownData;

						if (vm.tmpProvCostcenterData.length > 0) {
							vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = '0';
							vm.PopupMultiCostCenter.Model = [];
						} else {
							vm.Control.ddlCostCenterPopupCostCenter.SelectedCostCenterId = vm.physicianContractDetails.CostCenterId + '';
							vm.PopupMultiCostCenter.Model = UtilService.getSelectedDropdownModelByValue(vm.CostcenterDropDownData, vm.physicianContractDetails.CostCenterId);
						}
					}, 100);
				},
				close: function () {
				}
			});

			$('#' + vm.Control.popupLinkFTECategory.id, $("#" + vm.currentTab.Id)).dialog({
				autoOpen: false,
				modal: true,
				width: 600,
				//height: 500,
				resizable: false,
				closeOnEscape: false,
				show: {
					effect: "blind",
					duration: 100
				},
				hide: {
					effect: "explode",
					duration: 500
				},
				open: function () {
					//clear all notifications
					provHelper.hideAllNotifications();

					//assign data 
					vm.tmpPhysicianContractFTE = vm.getArrayData(vm.PhysicianContractFTE);

					vm.clearFTECategory();
				},
				close: function () {
				}
			});
		}

		//date pickers
		vm.setupdatepickers = function () {
			$('.renewalDate-datePicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleOtherDatePicker
			}).on("change", handleOtherDatePicker);

			$('.amend-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleOtherDatePicker
			}).on("change", handleOtherDatePicker);


			$('.costcenter-startdate-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleOtherDatePicker
			}).on("change", handleOtherDatePicker);

			$('.ftestart-datepicker,.fteend-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleOtherDatePicker
			}).on("change", handleOtherDatePicker);


			$('.contract-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleDatePicker,
				beforeShow: function (input, inst) {
					if (vm.physicianContractDetails.AllowContractDatesoutsideMasterContractDates == 0) {
						return {
							minDate: $scope.$parent.$parent.ms.Prov.MasterContractDetails.MasterContractStartDate,
							maxDate: $scope.$parent.$parent.ms.Prov.MasterContractDetails.MasterContractEndDate
						};
					}
				}
			}).on("change", handleDatePicker);

			function handleOtherDatePicker() {
				var txtid = $(this).attr('id');
				var txtValue = $(this).val();
				if (UtilService.isValidDate(txtValue)) {
					txtValue = moment(txtValue).format('L');
				}

				$timeout(function () {
					switch (txtid) {
						case vm.Control.SubContAmendDate.id:
							vm.physicianContractDetails.ContractAmendedDate = txtValue;
							break;
						case vm.Control.txtRenewalDate.id:
							vm.Control.txtRenewalDate.Details.RenewalDate = txtValue;
							break;
						case vm.Control.FtecategoryStartDate.id:
							vm.Control.FtecategoryStartDate.value = txtValue;
							break;
						case vm.Control.FtecategoryEndDate.id:
							vm.Control.FtecategoryEndDate.value = txtValue;
							break;

						case vm.Control.CostCenterStartDate.id:
							vm.Control.CostCenterStartDate.value = txtValue;
							break;
						case vm.Control.CostCenterEndDate.id:
							vm.Control.CostCenterEndDate.value = txtValue;
							break;
					}
				}, 10);
			}



			//this method gets invoked whenever start, end dates are changed 
			function handleDatePicker() {
				var txtid = $(this).attr('id');
				var txtValue = $(this).val();
				if (UtilService.isValidDate(txtValue)) {
					txtValue = moment(txtValue).format('L');
				}

				switch (txtid) {
					case vm.Control.StartDate.id:
						vm.physicianContractDetails.StartDate = txtValue;
						break;
					case vm.Control.EndDate.id:
						vm.physicianContractDetails.EndDate = txtValue;
						break;
				}

				//update start, end dates in pay elements grid
				if (txtid == vm.Control.StartDate.id || txtid == vm.Control.EndDate.id) {
					var statusInfo = vm.validateContractInfo(1);

					//update pay element dates as per logic though the date is invalid
					setTimeout(function () { sharedService.broadcast_OnContractDataChange({ tab: vm.currentTab, source: provHelper.contractPESource.ContractDate, physicianContractDetails: vm.physicianContractDetails }); }, 10);
				}
			}

			$('.prof-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleProfDatePicker
			}).on("change", handleProfDatePicker);

			//this method gets invoked whenever start, end dates are changed 
			function handleProfDatePicker() {
				var txtid = $(this).attr('id');
				var lookupType = $(this).attr('LookupType');
				var txtValue = $(this).val();

				if (UtilService.isValidDate(txtValue)) { 
					txtValue = moment(txtValue).format('L');
				}

				vm.validateMiscProfileRowsData(txtid, txtValue, lookupType);
			}
		}

		vm.validateMiscProfileRowsData = function (txtid, txtValue, lookupType) {
			var profSettings = angular.copy(vm.displayProfileSettings);

			var result = provHelper.getMisCProfileDataOnSelectedRow(txtid, txtValue, lookupType, profSettings);

			if (result.totaldetrows != null) {

				var lookupIdx = result.lookupIdx;
				var detRowIdx = result.detRowIdx;

				var prof = result.prof;
				var totalrows = result.totaldetrows;
				var activerecords = result.activerecords;
				var det = result.det;

				//1.exclude the deleted ids and 
				//2.then increase or decrease the dates in textbox 
				//3. start validating overlapping range 

				//1.clear all error messages
				UtilService.clearNotificationsById(prof.accordionNotificationDiv);

				//2.reset:IsOverlappingRangeFlag if any
				activerecords = UtilService.resetOverlappingRangeFlag(activerecords);


				//start validating contract and master contract info before proceeding further 

				//validate current model: check start date, End Date  
				var statusInfo = provHelper.checkIsDateOverlappingRange(activerecords, totalrows, prof, vm.physicianContractDetails);

				if (statusInfo.IsValid == false) {

					// form is invalid 
					vm.displayValidationMessages(statusInfo, prof.accordionNotificationDiv);
				}

				//update main model 
				$timeout(function () {
					vm.displayProfileSettings[lookupIdx].displaySettingsIndetails = statusInfo.validatedRecords;
					setTimeout(function () { vm.setupdatepickers(); }, 50);
				}, 10);


				////update accordingly
				//if (result.propName == 'StartDate') {

				//}
				//else if (result.propName == 'EndDate') {

				//} 
			}
		}

		//vm.validationInfo = function (item) {
		//	var title = 'Validation Error';
		//	var message = item.ErrorMessage;
		//	provHelper.displayValidationInfo(title, message, item);
		//}

		vm.fnShowHideInactiveAlert = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			if (vm.physicianContractDetails.InActivatedOn == null && vm.physicianContractDetails.Active == true) {
				if (confirm("Are you sure you want to Inactive Contract?")) {
					vm.physicianContractDetails.Active = false;
				}
				else {
					setTimeout(function () {
						vm.physicianContractDetails.Active = true;
						$scope.$apply();
					}, 100);
				}
			} else {
				vm.physicianContractDetails.Active = false;
			}
		}

		/*accordion control events starts: Miscellaneous profile settings start*/
		//add new profile: clear MVP description and then clear profile source detail (accordion table) data
		vm.filterProfileData = function (item) {
			if (item.IsDeleted == true) {
				return false;
			}
			return true;
		}

		vm.isDeletableProfileData = function (arr) {
			var activeRecords = [];
			for (var i = 0; i < arr.length; i++) {
				if (vm.filterProfileData(arr[i])) {
					activeRecords.push(arr[i])
				}
			}
			return (activeRecords.length > 1 ? true : false)
		}

		vm.addNewProfile = function (prof) {
			//1.clear all data and then create a new empty details row (accordion table) data
			var model = {
				displaySettingsIndetails: []
			}

			//imp:better avoid deep copy
			model.displaySettingsIndetails.push(angular.copy(vm.Control.ProfileDetailsSourceModel));

			//2.update MVP description
			vm.updateMVPDescription(prof, model);

			//3.populate the data
			vm.populateMiscellaneousProfileData(prof, model, vm.operationmode.add);

			//expand accordion
			vm.expandMiscProfAccordion(prof, true);
		}

		//add new profile detail data
		vm.addNewProfileSource = function (profdet, prof) {
			//clear notifications
			UtilService.clearNotificationsById(prof.accordionNotificationDiv);

			var model = {};
			//imp:better avoid deep copy
			var _newmodel = angular.copy(vm.Control.ProfileDetailsSourceModel);

			//1.get existing rows data  
			var totaldetrows = vm.getdisplaysettingDetailsByLookupType(prof);

			//var profSettings = angular.copy(vm.displayProfileSettings);  
			//var result = provHelper.getMisCProfileDataOnSelectedRow(null, null, prof.LookupType, profSettings);

			//2.reset:IsOverlappingRangeFlag if any
			totaldetrows = UtilService.resetOverlappingRangeFlag(totaldetrows);

			//3.get active records
			var activerecords = [];
			if (totaldetrows != null) {
				for (var i = 0; i < totaldetrows.length; i++) {
					if (totaldetrows[i].IsDeleted != true) {
						activerecords.push(totaldetrows[i]);
					}
				}
			}

			//4.validate current model: check start date, End Date  
			var statusInfo = provHelper.checkIsDateOverlappingRange(activerecords, totaldetrows, prof, vm.physicianContractDetails);

			if (statusInfo.IsValid == false) {
				// form is invalid 
				vm.displayValidationMessages(statusInfo, prof.accordionNotificationDiv);

				var errorControlIds = statusInfo.ErrorControlIds;

				//display error message    
				if (errorControlIds != undefined && errorControlIds != null && errorControlIds.length > 0) {
					//focus effective date
					setTimeout(function () {
						focus(errorControlIds[0]);
					}, 150);
				}

				//update main model 
				$timeout(function () {
					for (var i = 0; i < vm.displayProfileSettings.length; i++) {
						if (vm.displayProfileSettings[i].LookupType == prof.LookupType) {
							vm.displayProfileSettings[i].displaySettingsIndetails = statusInfo.validatedRecords;
							break;
						}
					}

					setTimeout(function () { vm.setupdatepickers(); }, 50);
				}, 10);

				return;
			} else {

				var isEndDateFound = (activerecords.length > 0 ? false : true);
				if (totaldetrows != null) {
					if (activerecords.length > 0) {

						//sort it based on row number
						activerecords = activerecords.sort((a, b) => moment(a.StartDate) - moment(b.StartDate));

						//get the latest record
						var latestrecord = UtilService.latestRecordAFromSortedArray(activerecords);

						//start filling start date in the new row
						if (latestrecord != null) {
							if (UtilService.isValidDate(latestrecord.EndDate)) {
								isEndDateFound = true;
								if (UtilService.isValidDate(latestrecord.StartDate) && UtilService.isValidDate(latestrecord.EndDate)) {
									_newmodel.StartDate = moment(latestrecord.EndDate).add(1, 'days').format('L');
								}
							}
							else if (latestrecord.EndDate == null || latestrecord.EndDate == "") {
								//errorControlIds.push(latestrecord.Control.StartDate.id);
								latestrecord.Control.StartDate.IsValid = false;
								latestrecord.Control.StartDate.ErrorDesc = "Please enter valid End Date" + ' for Row ' + (activerecords.length) + '.';
								//sbError.push(latestrecord.Control.StartDate.ErrorDesc);


								var statusInfo = {
									ErrorMessage: latestrecord.Control.StartDate.ErrorDesc
								}

								return vm.displayValidationMessages(statusInfo, prof.accordionNotificationDiv);
							}
						}
					}
				}
			}

			//valid form
			if (isEndDateFound) {
				model.displaySettingsIndetails = totaldetrows;

				//2.add default new row to the existing data
				model.displaySettingsIndetails.push(_newmodel);

				//3.populate data
				vm.populateMiscellaneousProfileData(prof, model, vm.operationmode.add);
			}
		}

		//delete profile detail data
		vm.deleteProfileSource = function (profdet, prof) {
			//clear notifications
			UtilService.clearNotificationsById(prof.accordionNotificationDiv);

			//ask for conifrmation if it's a original record
			//new records can be deleted without any confirmations
			if (profdet.recordstatus == vm.recordstatus.new || (profdet.recordstatus == vm.recordstatus.original && confirm("Are you sure want to delete Record?"))) {
				//default model
				var model = {
					displaySettingsIndetails: []
				}

				//1.get existing rows data 
				var _existingRows = vm.getdisplaysettingDetailsByLookupType(prof);

				//2.find all the records except the one which is selected
				for (var j = 0; j < _existingRows.length; j++) {
					//ignore the selected row and fill the other data for re populating data
					if (profdet.recordstatus == vm.recordstatus.original) {
						if (profdet.SeqRowId == _existingRows[j].SeqRowId) {
							_existingRows[j].IsDeleted = true;
							model.displaySettingsIndetails.push(_existingRows[j]);
						} else {
							model.displaySettingsIndetails.push(_existingRows[j]);
						}
					} else {
						if (profdet.SeqRowId != _existingRows[j].SeqRowId) {
							model.displaySettingsIndetails.push(_existingRows[j]);
						}
					}
				}

				//3. populate the data
				vm.populateMiscellaneousProfileData(prof, model, vm.operationmode.delete);

				//validation
				vm.validateMiscProfileRowsData(null, null, prof.LookupType);
			}
		}

		vm.displaysettingDetailsChanged = function (prof) {
			$timeout(function () { vm.displaysettingDetailsByMPVHeaderID(prof); }, 10);
		}

		//REST:get profile detail data by selected Id (this service for loading data when clicking on hyperink of display setting dropdown)
		vm.displaysettingDetailsByMPVHeaderID = function (prof) {
			//clear error messages
			provHelper.hideAllNotifications(prof.accordionNotificationDiv);

			var statusInfo = vm.validateContractInfo(1);
			if (!statusInfo.IsValid) {
				prof.selectedDisplaysettingProfileId = prof.MPVHeaderID + '';
				return statusInfo;
			}

			//re-set MVPHeaderId 
			prof.MPVHeaderID = prof.selectedDisplaysettingProfileId;

			if (parseInt(prof.selectedDisplaysettingProfileId) <= 0) {
				return vm.addNewProfile(prof);
			}

			//get user info
			var userInfo = UtilService.getCurrentUserInfo();


			//1.prepare model
			var query = {
				mPVHeaderId: prof.MPVHeaderID,
				lookupType: prof.LookupType,
				physicianId: vm.physicianContractDetails.PhysicianId,
				orgCompModelId: vm.currentTab.CompensationModelId,
				contractId: vm.currentTab.ContractId,
				contractStartDate: vm.physicianContractDetails.StartDate,
				contractEndDate: vm.physicianContractDetails.EndDate,
				orgCompModelSpecialtyId: vm.physicianContractDetails.CompModelSpecialtyId,
				departmentId: parseInt(vm.physicianContractDetails.CostCenterId),
				roleId: userInfo.CurrentRoleID
			};

			//get selected Profile Description by Id
			//var _seleProfileDescription = UtilService.getDropdownTextById(prof.selectedDisplaysettingProfileId, prof.selectedDisplaysettingProfileId); 

			//2.block UI 
			var msg = "Please wait while fetching data...";
			UtilService.blockUIWithText(msg);

			//3. make service call
			provService.displaysettingDetailsByMPVHeaderID(query).then(function (response) {
				//4. process response and then unblock ui
				$.unblockUI();
				//extract MVP description and constrcut dynamic row data with dropdownlist



				//1.update MVP description
				vm.updateMVPDescription(prof, response);

				//2.update detail rows
				vm.populateMiscellaneousProfileData(prof, response, vm.operationmode.load);

				//3.collapse accordion 
				vm.collapseMiscProfAccordion(prof, true);

			}, function (jqXHR) {
				$.unblockUI();
				//pending displaying error 
				// or server returns response with an error status.
				//console.log('Err:', JSON.stringify(err));
				//5. handle errors in ui   
				provHelper.handleServerError(jqXHR, vm.Control.PnlContractValidationSummary.id);
			});
		}

		//update MVP description 
		vm.updateMVPDescription = function (prof, response) {
			//update mpv description:this code might go off as and when response changes 
			var MPVDescription = "";
			if (response != null && response.displaySettingsIndetails != null && response.displaySettingsIndetails.length > 0) {
				MPVDescription = response.displaySettingsIndetails[0].MPVDescription;
			}

			var _disProfSettings = angular.copy(vm.displayProfileSettings);
			if (_disProfSettings != null) {
				for (var i = 0; i < _disProfSettings.length; i++) {
					if (_disProfSettings[i].LookupType == prof.LookupType) {
						vm.displayProfileSettings[i].MPVDescription = MPVDescription;
						break;
					}
				}
			}
		}

		//get profile details by lookup type
		vm.getdisplaysettingDetailsByLookupType = function (prof) {
			var _details = {};
			var _disProfSettings = angular.copy(vm.displayProfileSettings);
			if (_disProfSettings != null) {
				for (var i = 0; i < _disProfSettings.length; i++) {
					if (_disProfSettings[i].LookupType == prof.LookupType) {
						_details = _disProfSettings[i].displaySettingsIndetails;
						break;
					}
				}
			}
			return _details;
		}

		//profile details data: accordion table row data
		vm.populateMiscellaneousProfileData = function (sourceprof, response, source) {
			//selectedDisplaysettingProfileId 
			var _disProfSettings = angular.copy(vm.displayProfileSettings);
			if (_disProfSettings != null) {
				for (var i = 0; i < _disProfSettings.length; i++) {
					var prof = _disProfSettings[i];

					if (_disProfSettings[i].LookupType == sourceprof.LookupType) {
						//found lookup type
						var _detrows = response.displaySettingsIndetails;
						if (_detrows != undefined) {
							for (var j = 0; j < _detrows.length; j++) {

								//accordion table row data  

								//update SourcePKID
								if (source == vm.operationmode.load) {
									//initialize SelectedId to SourcePKID on refreshing the data
									_detrows[j].SourcePKID = _detrows[j].SelectedId;
								}

								//add dynamic seqrowid to manage add delete data
								_detrows[j].UniqueRowID = j;

								_detrows[j].SeqRowId = j;

								// append dynamic control 
								_detrows[j].Control = vm.getMiscControlIdConfigBySeqRowId(prof.LookupType, j);

								//add the record status, helps in displaying confirmation message while deleting original data.
								_detrows[j].recordstatus = (_detrows[j].recordstatus == undefined ? vm.recordstatus.original : _detrows[j].recordstatus);

								//IsDeleted:false only on explictly deleted rows
								_detrows[j].IsDeleted = (_detrows[j].IsDeleted != undefined ? _detrows[j].IsDeleted : false);

								//set IsOverlappingRange to false
								_detrows[j].IsOverlappingRange = (_detrows[j].IsOverlappingRange != undefined ? _detrows[j].IsOverlappingRange : false);
							}
						}

						//assign dynamically constructed accordion table data    

						vm.displayProfileSettings[i].displaySettingsIndetails = _detrows;

						break;
					}
				}
			}
			//enable date pickers
			$timeout(function () { vm.setupdatepickers(); }, 50);
		}

		//REST:this service for load data when click on hyperink of display setting
		vm.displaySettingHyperlinkData = function (prof) {
			//clear all error messages
			provHelper.hideAllNotifications();

			//start validating contract and master contract info before proceeding further
			var statusInfo = vm.validateContractInfo(3);
			if (!statusInfo.IsValid) {
				return statusInfo;
			}

			//get user info
			var userInfo = UtilService.getCurrentUserInfo();

			//1.prepare model
			var query = {
				mPVHeaderId: prof.MPVHeaderID,
				profileDecriptionName: prof.MPVDescription,
				lookupType: prof.LookupType,
				physicianId: vm.physicianContractDetails.PhysicianId,
				orgCompModelId: vm.currentTab.CompensationModelId,
				contractId: vm.currentTab.ContractId,
				contractStartDate: vm.physicianContractDetails.StartDate,
				contractEndDate: vm.physicianContractDetails.EndDate,
				orgCompModelSpecialtyId: vm.physicianContractDetails.CompModelSpecialtyId,
				departmentId: parseInt(vm.physicianContractDetails.CostCenterId),
				roleId: userInfo.CurrentRoleID
			};

			//get selected Profile Description by Id
			var _seleProfileDescription = UtilService.getDropdownTextById(prof.displysettingsProfileSource, prof.selectedDisplaysettingProfileId);

			//2.block UI 
			var msg = "Please wait while fetching data...";
			UtilService.blockUIWithText(msg);

			//3. make service call
			provService.getDisplaySettingHyperlinkData(query).then(onSuccess, onError);

			function onSuccess(response) {
				//4. process response and then unblock ui
				$.unblockUI();

				if (response == undefined) { return; }

				prof.HyperLinkData = response;
				//pending: display data in popup if it's popup headerName is null or not
				if (response.PopupHeaderName == null || response.PopupHeaderName == "") {
					//set session value and then open a new tab
					//var navigationURl = response.NavigationURL;
					var navurl = response.NavigationURL
					var model = {};
					var methodName = '';
					if (UtilService.isEqual(prof.LookupType, 'HolidayProfile')) {
						var sourceid = 0;
						var sourcedesc = '';
						var selrecord = null;
						try {
							//1.get existing rows data  
							var _rowdetails = vm.getdisplaysettingDetailsByLookupType(prof);
							if (_rowdetails != null) {
								var _activeRecords = [];
								for (var i = 0; i < _rowdetails.length; i++) {
									if (_rowdetails[i].IsDeleted != true) {
										_activeRecords.push(_rowdetails[i]);
									}
								}

								if (_activeRecords.length > 0) {

									//sort based on start dates. reverse latest record first
									_activeRecords = _activeRecords.sort((a, b) => moment(b.StartDate) - moment(a.StartDate));

									//start validating contract start & end dates
									var ContStartDt = vm.physicianContractDetails.StartDate;
									var ContEndDt = vm.physicianContractDetails.EndDate;



									//pending:loop thru dataset and fetch the record within contract start and end dates
									if (UtilService.isValidDate(ContStartDt) && UtilService.isValidDate(ContEndDt)) {
										for (var i = 0; i < _activeRecords.length; i++) {
											var item = _activeRecords[i];

											//check if it's valid date
											if (UtilService.isValidDate(item.StartDate)) {
												if (item.EndDate == null || item.EndDate == "") {
													if (moment(item.StartDate).isSameOrBefore(moment(ContStartDt))) {
														selrecord = item;
														break;
													}
												}
												else if (UtilService.isValidDate(item.EndDate)) {
													//check if end date is valid and start&end date are withint contract start and End dates
													if ((moment(item.StartDate).isBetween(moment(ContStartDt), moment(ContEndDt)) || moment(item.StartDate).isSame(moment(ContStartDt)))
														&& (moment(item.EndDate).isBetween(moment(ContStartDt), moment(ContEndDt)) || moment(item.EndDate).isSame(moment(ContEndDt)))) {
														selrecord = item;
														break;
													}
												}
											}
										}
									}

									if (selrecord == null) {
										if (_activeRecords.length > 0) {
											selrecord = _activeRecords[0];
										}
									}
								}
							}

						} catch (err) {
							console.log(JSON.stringify(err));
						}

						if (selrecord != null) {
							sourceid = selrecord.SourcePKID;
							if (sourceid > 0) {
								sourcedesc = UtilService.getDropdownTextById(prof.MasterDisplaySettingsIndetailsSourcesData, sourceid, '');
							}
						}

						model.SourceId = sourceid;
						model.SourceDesc = sourcedesc;
						methodName = 'SetHolidayProfileParams';
					} else {
						model.selectedPerformanceMetricName = _seleProfileDescription;
						methodName = 'SetPerformanceMetricName';
					}

					//set session before a url is opened
					UtilService.postDataByUrlAndMethodName("AngPhyContract.aspx", "/" + methodName, model).then(function (response) {
						//open url in a new tab
						if (navurl.indexOf('~') != -1 && navurl.indexOf('~/') == -1) {
							window.open(navurl.replace("~", "../"));
						} else {
							window.open(navurl.replace("~/", "../"));
						}
					}, function (jqXHR) {
						//log the exception
						try { $exceptionHandler(jqXHR); } catch (e1) { }
					});

				} else {
					//process dynamic column and row data
					if (prof.HyperLinkData.displaySettingHyperlinkData != null) {
						//process data
						for (var x = 0; x < prof.HyperLinkData.displaySettingHyperlinkData.length; x++) {
							var hyper = prof.HyperLinkData.displaySettingHyperlinkData[x];
							var _dynamicArrangedRowData = [];
							if (hyper != null && hyper.ColumnNames != null) {
								var cols = hyper.ColumnNames;
								var _rawrows = hyper.dynamicColumnData;
								var _listOfRows = [];
								for (var i = 0; i < _rawrows.length; i++) {
									var _rows = [];
									for (var j = 0; j < cols.length; j++) {
										var regExpr = /[^a-zA-Z0-9-. ]/g;
										var colname = cols[j].replace(regExpr, '').replace(/\s/g, '');
										if (_rawrows[i][colname] != undefined) {
											_rows.push(_rawrows[i][colname]);
										} else {
											_rows.push("");
										}
									}
									_listOfRows.push(_rows);
								}
								_dynamicArrangedRowData.push(_listOfRows);
							}
							prof.HyperLinkData.displaySettingHyperlinkData[x].dynamicRow = _dynamicArrangedRowData;
						}


						//$('#' + prof.accordion + '_hyperlink', $("#" + vm.currentTab.Id))
						//display popup
						setTimeout(function () {
							//$('div[modal-dialog="'++'"')
							$('#' + prof.accordion + '_hyperlink_modal').css("display", "block").dialog({
								autoOpen: true,
								modal: true,
								title: prof.HyperLinkData.PopupHeaderName,
								width: 493,
								height: 319,
								resizable: false,
								closeOnEscape: true,
								show: {
									effect: "blind",
									duration: 500
								},
								hide: {
									effect: "explode",
									duration: 500
								}
								//appendTo: "form", 
							});
						}, 500);
					}
				}
			}
			function onError(jqXHR) {
				$.unblockUI();
				//pending displaying error 
				// or server returns response with an error status. 

				provHelper.handleServerError(jqXHR, vm.Control.PnlContractValidationSummary.id);
			}
		}

		vm.getOriginalSpecialityId = function () {
			//for misc.profile we need to send original speciality id
			var _orgSpecialtyId = 0;
			if (vm.compModelSpecialties != null) {
				for (var i = 0; i < vm.compModelSpecialties.length; i++) {
					if (vm.compModelSpecialties[i].id == vm.physicianContractDetails.CompModelSpecialtyId) {
						_orgSpecialtyId = vm.compModelSpecialties[i].CompModelSpecialtyId;
						break;
					}
				}
			}
			return _orgSpecialtyId;
		}

		/*accordion control events starts: Miscellaneous profile settings end*/
		vm.getValidationStatusOfMiscProfile = function () {
			var _isValidForm = true;

			//start validating contract start & end dates
			var ContStartDt = vm.physicianContractDetails.StartDate;
			var ContEndDt = vm.physicianContractDetails.EndDate;

			var _disProfSettings = vm.displayProfileSettings;
			if (_disProfSettings != null) {

				for (var i = 0; i < _disProfSettings.length; i++) {

					var prof = _disProfSettings[i];

					//clear all error messages
					UtilService.clearNotificationsById(prof.accordionNotificationDiv);

					//1.get existing rows data
					var totaldetrows = vm.getdisplaysettingDetailsByLookupType(prof);

					//2.reset:IsOverlappingRangeFlag if any
					totaldetrows = UtilService.resetOverlappingRangeFlag(totaldetrows);

					//3.get active records
					var activerecords = [];
					if (totaldetrows != null) {
						for (var x = 0; x < totaldetrows.length; x++) {
							if (totaldetrows[x].IsDeleted != true) {
								activerecords.push(totaldetrows[x]);
							}
						}
					}

					//4.validate current model: check start date, End Date  
					var statusInfo = provHelper.checkIsDateOverlappingRange(activerecords, totaldetrows, prof, vm.physicianContractDetails);

					if (statusInfo.IsValid == false) {
						_isValidForm = false;

						statusInfo.ErrorControlIds = null;


						// form is invalid 
						vm.displayValidationMessages(statusInfo, prof.accordionNotificationDiv);

						var errorControlIds = statusInfo.ErrorControlIds;

						//update main model 

						for (var x = 0; x < vm.displayProfileSettings.length; x++) {
							if (vm.displayProfileSettings[i].LookupType == prof.LookupType) {
								vm.displayProfileSettings[i].displaySettingsIndetails = statusInfo.validatedRecords;
								break;
							}
						}

						vm.expandMiscProfAccordion(prof, true);
					}
				}

				$timeout(function () {
					setTimeout(function () { vm.setupdatepickers(); }, 50);
				}, 10);
			}

			return _isValidForm;
		}
		//get accordion data
		vm.getMiscProfileValuesForSaving = function () {

			//validation starts here
			var _isValidForm = vm.getValidationStatusOfMiscProfile();

			var userInfo = UtilService.getCurrentUserInfo();

			var MiscProfileValues = [];
			var _disProfSettings = vm.displayProfileSettings;
			if (_disProfSettings != null) {

				for (var x = 0; x < _disProfSettings.length; x++) {
					var prof = _disProfSettings[x];

					//pass data only which is displayed  
					var CostcenterId = UtilService.convertDataByDatatype(vm.physicianContractDetails.CostCenterId, UtilService.datatype.number, 0, 0);

					var model = {
						MiscProfileValuesHeader: {
							AccordionId: prof.accordion,
							MPVHeaderID: prof.MPVHeaderID,//int 432,
							IsProviderSpecificFlag: parseInt(prof.MPVHeaderID) <= 0 ? true : false,//bool false,
							MPVDescription: UtilService.getDefaultValueIfItsNull(prof.MPVDescription, ""),//string "Bench-marking Percentile Threshold",
							LookupID: prof.LookupID, //int 13
							LookupType: UtilService.getDefaultValueIfItsNull(prof.LookupType, ""), //string""
							LookupDescription: UtilService.getDefaultValueIfItsNull(prof.LookupDescription, ""),//string"" 
							RegionId: vm.physicianContractDetails.RegionId,//int?  9,
							LocationId: vm.physicianContractDetails.LocationId,//int?  69,
							DeptId: CostcenterId,//int?  518,  
							CompModelSpecialtyId: vm.getOriginalSpecialityId(),//int?  175,
							RegionDesc: UtilService.getDropdownTextById(vm.RegionMasterList, vm.physicianContractDetails.RegionId, ''),// "string",
							LocationDesc: UtilService.getDropdownTextById(vm.LocationMasterList, vm.physicianContractDetails.LocationId, ''), //"string",
							CostCenterDesc: UtilService.getDropdownTextById(vm.physicianContractDetails.CostcenterDropDownData, vm.physicianContractDetails.CostCenterId, ''),// vm.physicianContractDetails.CostCenterDesc,// "string",
							SpecialtyDesc: UtilService.getDropdownTextById(vm.compModelSpecialties, vm.physicianContractDetails.CompModelSpecialtyId, ''),// "string",
							PositionId: vm.physicianContractDetails.PositionId,//int?  17,
							RefContractProfileSettingsID: prof.RefContractProfileSettingsID,//int?  0,
							//for the new record
							CreatedBy: UtilService.getDefaultValueIfItsNull(userInfo.UserID, ""),//string "e82f5a9f-6183-4d97-9b01-0d20e9e95c87",
							WFMPVHeaderID: prof.WFMPVHeaderID,//int 0,
							//LookupTypes: prof.LookupTypes, //updated 
							ConfigValue: prof.LookupTypes,//string "1",   
							PositionDesc: vm.physicianContractDetails.PositionDesc,// "string"
							IsMandatory: prof.IsMandatory //false
						}
					}

					//accordion table detail rows data
					var _deletedIds = [];
					var _MiscProfileValuesDetail = [];

					if (prof.displaySettingsIndetails != undefined) {
						var RowId = 0;
						var displaySettingsIndetails = prof.displaySettingsIndetails;

						for (var j = 0; j < displaySettingsIndetails.length; j++) {
							var row = displaySettingsIndetails[j];
							//if row is deleted then assign MPVDetailID
							if (row.IsDeleted != true) {
								//increment the id
								RowId = RowId + 1;

								var detailrow = {}
								for (var prop in model.MiscProfileValuesHeader) {
									detailrow[prop] = model.MiscProfileValuesHeader[prop];
								}

								detailrow.MPVDetailID = row.MPVDetailID;//int 493,--accordion dropdown ID  

								detailrow.StartDate = UtilService.getDefaultValueIfItsNull(row.StartDate, "");//string "01/01/2016",
								detailrow.EndDate = UtilService.getDefaultValueIfItsNull(row.EndDate, ""); //string "",
								detailrow.SourcePKID = row.SourcePKID;//int SourcePKID;//484, ,--accordion detail table row dropdown ID  
								//detailrow.CurrentEndDate = row.CurrentEndDate;// "string", removed as discussed
								//lookup and value
								detailrow.MiscLookupCode = prof.MiscLookupCode;// "string",
								detailrow.MiscLookupValue = prof.MiscLookupValue;// "string", 

								//add to the list
								_MiscProfileValuesDetail.push(detailrow);
							} else {
								_deletedIds.push(row.MPVDetailID);;
							}
						}

						//update deleted Ids to each node
						for (var z = 0; z < _MiscProfileValuesDetail.length; z++) {
							//detailrow.DeletedIds = "";
							_MiscProfileValuesDetail[z].DeletedIds = _deletedIds.length > 0 ? _deletedIds.toString() : "";
						}
					}

					//assign  
					model.MiscProfileValuesDetail = _MiscProfileValuesDetail.length > 0 ? _MiscProfileValuesDetail : null;

					//fill data
					MiscProfileValues.push(model);
				}
			}



			return {
				MiscProfileValues: MiscProfileValues.length > 0 ? MiscProfileValues : null,
				IsValidMiscProfileForm: _isValidForm
			};
		}

		vm.getDisplaySettingIds = function () {
			var _selectDisplaySettingsValues = null;

			if (vm.selectDisplaySettingsModel != null && vm.selectDisplaySettingsModel.length > 0) {
				_selectDisplaySettingsValues = vm.selectDisplaySettingsModel.map(function (item) { return item['id']; });
				if (_selectDisplaySettingsValues != null && _selectDisplaySettingsValues.length > 0) {
					_selectDisplaySettingsValues = _selectDisplaySettingsValues.toString();
				}
			}
			return UtilService.getDefaultValueIfItsNull(_selectDisplaySettingsValues, "");
		}

		vm.getPhysicianContractDetailsForSaving = function () {

			var userInfo = UtilService.getCurrentUserInfo();

			var _selectDisplaySettingsValues = vm.getDisplaySettingIds();

			//clear entity Id and name if SendToPayrollOrAPDetails is not Send to Payroll:2 is SendToPayrollOrAP
			var EntityID = 0;
			var EntityName = "";
			if (vm.physicianContractDetails.SendToPayrollOrAP == 2) {
				EntityID = vm.physicianContractDetails.EntityID;
				EntityName = vm.physicianContractDetails.EntityName
			}

			var PhysicianContract = {
				TabId: vm.currentTab.Id,
				AllowToGroupContractPayElementsBasedOnCostCenter: $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter,
				PhysicianContractReferenceId: vm.physicianContractDetails.PhysicianContractReferenceId, //string null,
				ConCurrencyModifiedDate: (vm.physicianContractDetails.ContractId > 0 ? vm.physicianContractDetails.ConCurrencyModifiedDate : null), // "2020-06-05 11:20:00 AM",DateTime 
				AllowPayElementsDatesoutsideContractDates: vm.physicianContractDetails.AllowPayElementsDatesoutsideContractDates, // 1, int
				AllowContractDatesoutsideMasterContractDates: vm.physicianContractDetails.AllowContractDatesoutsideMasterContractDates, // 1, int 
				ApprovalStatus: vm.physicianContractDetails.ApprovalStatus, //int  0
				CurrentApprovalStatus: vm.physicianContractDetails.CurrentApprovalStatus, //int 0,
				NavigationUrl: window.location.pathname, // "string",//current page url
				ContractId: vm.physicianContractDetails.ContractId, // 1391, int
				//revisit:int this was not provided in the doc but exists in api. is this internal variable used in api, can this be ignored? dont' need it from UI  
				ApprovalContractID: vm.physicianContractDetails.ApprovalContractID != undefined ? vm.physicianContractDetails.ApprovalContractID : 0, //vm.physicianContractDetails.ApprovalContractID, //int  1391, int 
				MasterContractID: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedMasterContractId, //int  606,
				OrgCompensationModelID: vm.physicianContractDetails.CompensationModelId, //int  476, 
				StartDate: UtilService.getDefaultValueIfItsNull(vm.physicianContractDetails.StartDate, ""), //string "1/1/2020 12:00:00 AM",
				EndDate: UtilService.getDefaultValueIfItsNull(vm.physicianContractDetails.EndDate, ""), //string "12/31/2020 12:00:00 AM", 
				CostCenterId: UtilService.convertDataByDatatype(vm.physicianContractDetails.CostCenterId, UtilService.datatype.number, 0, 0), //int?  518, 
				CompModelSpecialtyId: vm.physicianContractDetails.CompModelSpecialtyId, //int?  9614,
				SelectedOrgCompmodelSpecialityText: UtilService.getDropdownTextById(vm.compModelSpecialties, vm.physicianContractDetails.CompModelSpecialtyId, ''), //string
				PositionId: vm.physicianContractDetails.PositionId, //int?  17,
				MaxCompensationAmount: vm.physicianContractDetails.MaxCompensationAmount, //decimal? null,
				CompensationBenchMarkingThreshold: vm.physicianContractDetails.CompensationBenchMarkingThreshold, //decimal? 0.00,
				BenchMarkingSource: vm.physicianContractDetails.BenchMarkingSource, //int? null,
				NoticePeriod: vm.physicianContractDetails.NoticePeriod, //int? null,
				AnnualwRVUSTarget: vm.physicianContractDetails.AnnualwRVUSTarget, //decimal? null,
				AnnualCollectionsTarget: vm.physicianContractDetails.AnnualCollectionsTarget, //decimal? null,
				CreatedBy: userInfo.UserID,//vm.physicianContractDetails.CreatedBy, //Guid "e82f5a9f-6183-4d97-9b01-0d20e9e95c87",
				EntityID: EntityID, //int 0,
				EntityName: EntityName,
				Comments: UtilService.getDefaultValueIfItsNull(vm.physicianContractDetails.Comments, ""), //string "",
				DisplaySettingIds: _selectDisplaySettingsValues, //string "BenchMarkingPercentileThreshold,BONUSYEAR,MAXCOMPENSATIONDURATION,NEGATIVECARRYFORWARD,TerminationProtection,PERFORMANCEMETRICS,WRVUTIERANDRATE",

				ApprovalRefContractID: vm.physicianContractDetails.ApprovalRefContractID, //int 0,
				ContractAmendedDate: vm.physicianContractDetails.ContractAmendedDate, // null, DateTime?
				IsContractExtend: vm.physicianContractDetails.IsContractExtend, //bool? false,
				IsContractAmend: vm.physicianContractDetails.IsContractAmend, //bool? false,
				IsContractRenewed: vm.physicianContractDetails.IsContractRenewed, //bool? false,
				ActionType: UtilService.getDefaultValueIfItsNull(vm.physicianContractDetails.ActionType, ""), //string "",
				ActionDate: vm.physicianContractDetails.ActionDate, //DateTime?  null,
				TransCompModel: vm.physicianContractDetails.TransCompModel, //int?  
				Active: vm.physicianContractDetails.Active, //bool true,
				SendToPayrollOrAP: vm.physicianContractDetails.SendToPayrollOrAP, //int 
				//start check this with the team:tbd: when IsApprovalModified,IsSendToApproval,btnApprovalClicked
				IsApprovalModified: vm.physicianContractDetails.IsApprovalModified != undefined ? vm.physicianContractDetails.IsApprovalModified : null, //int?    
				IsSendToApproval: vm.physicianContractDetails.IsSendToApproval != undefined ? vm.physicianContractDetails.IsSendToApproval : null, //int?  
				btnApprovalClicked: vm.physicianContractDetails.btnApprovalClicked != undefined ? vm.physicianContractDetails.btnApprovalClicked : false, //bool 
				//end  
				MarkCompleteVisible: vm.physicianContractDetails.MarkCompleteVisible, //bool
				MarkCompleteEnabled: vm.physicianContractDetails.MarkCompleteEnabled, //bool
				chkMarkcomplete: vm.physicianContractDetails.IsMarkCompleted, //bool // property name to be renamed
				MarkcompleteForSave: vm.physicianContractDetails.MarkcompleteForSave != undefined ? vm.physicianContractDetails.MarkcompleteForSave : false,//bool
				OverlapContractId: vm.physicianContractDetails.OverlapContractId != undefined ? vm.physicianContractDetails.OverlapContractId : 0,//int? 0  
				RegionId: UtilService.convertDataByDatatype(vm.physicianContractDetails.RegionId, UtilService.datatype.number, 0, 0),//int?  9,
				LocationId: UtilService.convertDataByDatatype(vm.physicianContractDetails.LocationId, UtilService.datatype.number, 0, 0),//int?  69, 
				IsMarkCompleted: vm.physicianContractDetails.IsMarkCompleted, //bool vm.physicianContractDetails.IsMarkCompleted,//false,
				ContractStatus: vm.physicianContractDetails.ContractStatus, //int 0,
				HireDate: vm.physicianContractDetails.HireDate, // "string", 
				GroupFTEDurationLessthanContractDuration: UtilService.convertDataByDatatype($("input[name$='hdnGroupFTEDurationLessthanContractDuration']").val(), UtilService.datatype.number, 0, 0),//int 0
				FTEDurationLessthanContractDuration: UtilService.convertDataByDatatype($("input[name$='hdnFTEDurationLessthanContractDuration']").val(), UtilService.datatype.number, 0, 0),//int 0 
				ConsiderFTESumofAllCategory: UtilService.convertDataByDatatype($("input[name$='hdnConsiderFTESumofAllCategory']").val(), UtilService.datatype.number, 0, 0),//int 0  
				IsSelected: vm.currentTab.IsDataLoaded,//bool only when tab content is loaded (to true then) only this data gets saved 
			};


			//FTE data
			var PhysicianContractFTE = [];
			if (vm.PhysicianContractFTE != null) {
				for (var i = 0; i < vm.PhysicianContractFTE.length; i++) {
					var item = vm.PhysicianContractFTE[i];
					PhysicianContractFTE.push({
						PhysicianContractFTEID: item.PhysicianContractFTEID, //int 0,
						RefPhysicianContractFTEID: item.RefPhysicianContractFTEID,//int 0,
						FTECategoryID: parseInt(item.FTECategoryID),//int 0,
						ContractFTEValue: item.ContractFTEValue,//decimal 0,
						StartDate: item.StartDate,//DateTime? "2020-10-06T09:57:06.517Z",
						EndDate: item.EndDate,//DateTime?"2020-10-06T09:57:06.517Z",
						Active: true,//item.Active,//bool true,
						FTEHours: item.FTEHours, //decimal? 0 
						UniqueRowID: i //int //sequential in database
					});
				}
			}

			//assign fte data 
			PhysicianContract.PhysicianContractFTE = (PhysicianContractFTE.length > 0 ? PhysicianContractFTE : null);

			//cost center data
			var ProvCostcenterData = [];

			if (vm.ProvCostcenterData != null) {
				for (var i = 0; i < vm.ProvCostcenterData.length; i++) {
					var item = vm.ProvCostcenterData[i];
					ProvCostcenterData.push({
						PCCostCenterDtId: item.PCCostCenterDtId,//int,
						RefPCCostCenterDtId: item.RefPCCostCenterDtId,//int 0,
						ContractId: item.ContractId,//int 1391, 
						LocationId: parseInt(item.LocationId),//int?  69,
						LocationDesc: item.LocationDesc,
						DepartmentId: parseInt(item.id),//int 518,//
						DepartmentDesc: item.label,//string //cost center name is coming in label
						StartDate: item.StartDate,//DateTime "1/1/2020 12:00:00 AM",
						EndDate: (item.EndDate == null || item.EndDate == undefined || item.EndDate == "" ? null : item.EndDate)//DateTime? null
					});
				}
			}

			//assign cost center data
			PhysicianContract.CostcenterData = (ProvCostcenterData.length > 0 ? ProvCostcenterData : null);

			//MiscProfForms data
			var MiscProfForms = vm.getMiscProfileValuesForSaving();
			PhysicianContract.MiscProfileValues = MiscProfForms.MiscProfileValues;
			PhysicianContract.IsValidMiscProfileForm = MiscProfForms.IsValidMiscProfileForm;

			return PhysicianContract;
		}

		vm.getContractAndPayElementsDataForSaving = function (type) {
			if (vm.currentTab.IsDataLoaded == undefined || vm.currentTab.IsDataLoaded == false) {
				//assign those values to send data for saving purpose 
				vm.currentTab.IsDataLoaded = false;

				for (var i = 0; i < vm.currentTab.response.physicianContractDetails.length; i++) {
					//take first tab data only and then ignore rest tab data
					//ContractCompmodelId
					if (vm.currentTab.Value == vm.currentTab.response.physicianContractDetails[i].ContractCompmodelId) {
						vm.physicianContractDetails = vm.currentTab.response.physicianContractDetails[i];
						break;
					}
				}
			}

			var ContractPayElementsModel = vm.getPayElementModelByContractActionType(provService.contractActionType.Save);

			var model = {};
			//2.fille contract data
			model = vm.getPhysicianContractDetailsForSaving();
			//3.get pay elements model
			model.ContractPayElements = ContractPayElementsModel.ContractPayElements;
			model.ContractPayElementCustomColumns = ContractPayElementsModel.ContractPayElementCustomColumns;
			model.DeletedPayElementIds = ContractPayElementsModel.DeletedPayElementIds;
			model.ShowAll = ContractPayElementsModel.ShowAll;
			model.IsValidPayElementsForm = ContractPayElementsModel.IsValidPayElementsForm;
			return model;
		}

		//discard changes
		vm.discardChanges = function () {
			if (confirm('Are you sure you want to Discard Changes?')) {
				//clear all notifications
				provHelper.hideAllNotifications();
				vm.contractAction(provService.contractActionType.Discard);
			}
		}

		//dynamic button text: Send To Approval
		vm.performContractActionByCurrentStatus = function () {
			/*	ApprovalProcessExists: 0 or 1
				0 - Inprogress - new contract is in progress(Send To Approval-- > send approval status = 1) / discard changes on flag
				1 - pending for Approval
				2 - nothing
				3 - approved(ApprovalProcess = 1 and approvalstatus = 3 -- > approvalcontractId=0, RefContractId = CurrentContractId)
				4 - rejected(denied)
		   */
			if (vm.physicianContractDetails.CurrentApprovalStatus == 1) {
				// inprogress -->pending for approval 
				//click master save button
				vm.contractAction(provService.contractActionType.SendToApproval);
			}
			else if (vm.physicianContractDetails.CurrentApprovalStatus == 67) {

			}
		}

		vm.approveContract = function () {
			vm.contractAction(provService.contractActionType.Approve);
		}

		vm.rejectContract = function () {
			vm.contractsAction(provService.contractActionType.Reject);
		}

		vm.getContractChangesTitleById = function () {
			var selectedContractStatus = UtilService.getDropdownTextInUpperCaseById(vm.physicianContractDetails.ContractChanges, vm.physicianContractDetails.SelectedContractId);
			var result = {
				EffDtTitle: ""
				, PayElementTitle: ""
				, SubContractAmend: ""
			}

			switch (selectedContractStatus) {
				case provService.contractActionType.Renewal:
					result.EffDtTitle = "Renewal Date";
					result.PayElementTitle = "Pay Elements";
					result.SubContractAmend = "Apply & Save";
					break;
				case provService.contractActionType.Amend:
					result.EffDtTitle = "Effective Date";
					result.PayElementTitle = "Pay Elements";
					result.SubContractAmend = "Apply";
					break;
				case provService.contractActionType.Extend:
					result.EffDtTitle = "Till Date";
					result.PayElementTitle = "Pay Elements";
					result.SubContractAmend = "Apply";
					break;
				case provService.contractActionType.Transition:
					result.EffDtTitle = "Transition Date";
					result.PayElementTitle = "Comp. Model";
					result.SubContractAmend = "Apply & Save";
					break;
				case provService.contractActionType.End:
					result.EffDtTitle = "End Date";
					result.PayElementTitle = "";
					result.SubContractAmend = "Apply & Save";
					break;
			}
			return result;
		}
		//changeSubContractAction
		vm.changeSubContractAction = function (selValue) {
			//clear all error messages 
			provHelper.hideAllNotifications();

			var _effTitle = "";
			var _payElmntTitle = "";
			var _btnAmendTitle = "";

			var selectedContractStatus = UtilService.getDropdownTextInUpperCaseById(vm.physicianContractDetails.ContractChanges, vm.physicianContractDetails.SelectedContractId);
			if (UtilService.isEqual(provService.contractActionType.Renewal, selectedContractStatus)
				|| UtilService.isEqual(provService.contractActionType.Amend, selectedContractStatus)) {

				//start validating info before proceeding further
				var statusInfo = vm.validateContractInfo(1);

				if (statusInfo.IsValid) {
					switch (selectedContractStatus) {
						case provService.contractActionType.Renewal:
							_effTitle = "Renewal Date";
							_payElmntTitle = "Pay Elements";
							_btnAmendTitle = "Apply & Save";
							//display renewal date dynamically
							break;
						case provService.contractActionType.Amend:
							_effTitle = "Effective Date";
							_payElmntTitle = "Pay Elements";
							_btnAmendTitle = "Apply";
							break;
					}
					//update contract change label titles
					vm.Control.EffDtTitle = _effTitle;
					vm.Control.PayElementTitle = _payElmntTitle;
					vm.Control.SubContractAmend.value = _btnAmendTitle;


					//refresh pay elements dropdown
					$timeout(function () { vm.renewalOrAmendPayElementList(selectedContractStatus); }, 50);

				} else {
					//no errors proceed further
					//reset contract change status to select
					vm.physicianContractDetails.SelectedContractId = '0';
				}
			}
			else {

				switch (selectedContractStatus) {
					case provService.contractActionType.Extend:
						_effTitle = "Till Date";
						_payElmntTitle = "Pay Elements";
						_btnAmendTitle = "Apply";
						break;
					case provService.contractActionType.Transition:
						_effTitle = "Transition Date";
						_payElmntTitle = "Comp. Model";
						_btnAmendTitle = "Apply & Save";
						//assign comp model
						vm.CompensationModel = [];
						vm.getCompModelListForTransition();
						vm.physicianContractDetails.SelectedCompensationModelId = '';
						break;
					case provService.contractActionType.End:
						_effTitle = "End Date";
						_payElmntTitle = "";
						_btnAmendTitle = "Apply & Save";
						break;
					default:
						break;
				}

				//update contract change label titles
				vm.Control.EffDtTitle = _effTitle;
				vm.Control.PayElementTitle = _payElmntTitle;
				vm.Control.SubContractAmend.value = _btnAmendTitle;
				//focus effective date
				setTimeout(function () {
					focus(vm.Control.SubContAmendDate.id);
				}, 100);
			}
		}

		//getCompModelListForTransition
		vm.getCompModelListForTransition = function () {
			//get compensation model list from parent controller
			var allcompmodels = [];
			//all tabs
			var tabs = $scope.$parent.$parent.ms.PhysicianContractTabs;

			//get comp model for the selected region 

			var userInfo = UtilService.getCurrentUserInfo();
			var regionId = vm.physicianContractDetails.RegionId;

			var cacheConfig = {
				enmkey: UtilService.enmCache.CompModelsByRegion,
				cacheKey: UtilService.enmCache.CompModelsByRegion + '_' + vm.SelectedRegionId,
				model: {
					regionId: regionId,
					roleCode: userInfo.CurrentUserRoleCode
				}
			}


			provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {
				var _list = [];
				var availCompmodel = [];

				if (response != null) {
					_list = response.CompensationModel;
				}
				allcompmodels = _list;

				for (var i = 0; i < allcompmodels.length; i++) {
					var alreadyexisting = false;
					for (var j = 0; j < tabs.length; j++) {
						if (allcompmodels[i].id == tabs[j].CompensationModelId) {
							alreadyexisting = true;
							break;
						}
					}

					if (!alreadyexisting) {
						availCompmodel.push(allcompmodels[i]);
					}

				}

				vm.CompensationModel = availCompmodel;

			}, function (jqXHR) {
				vm.CompensationModel = [];
				//log the exception
				try { $exceptionHandler(jqXHR); } catch (e1) { }
			});


		}

		//the below method used for for payelements section
		vm.btnGetFormStatusOfContractInfo = function () {
			//start validating contract and master contract info before proceeding further
			var AllowToGroupContractPayElementsBasedOnCostCenter = $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter

			var statusInfo = null;
			if (AllowToGroupContractPayElementsBasedOnCostCenter) {
				//do not validate location, cost center in this case
				statusInfo = vm.validateContractInfo(1);
			} else {
				statusInfo = vm.validateContractInfo(2);
			}

			sharedService.broadcast_OnContractDataChange({
				tab: vm.currentTab
				, source: provHelper.contractPESource.validateContractInfo
				, physicianContractDetails: vm.physicianContractDetails
				, contractformstatusInfo: statusInfo
			});

		}

		//validation for contract form data: stepsOfValidations:2 validate only when it is for saving:validate Region, Location, Cost Center
		vm.validateContractInfo = function (stepsOfValidations) {
			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.PnlContractValidationSummary.id);

			//start validating contract start & end dates
			var sbError = [];
			var errorControlIds = [];

			if (vm.currentTab.IsDataLoaded) {

				var ContStartDt = vm.physicianContractDetails.StartDate;
				var ContEndDt = vm.physicianContractDetails.EndDate;
				var masterContrStartDt = $scope.$parent.$parent.ms.Prov.MasterContractDetails.MasterContractStartDate;
				var masterContrEndDt = $scope.$parent.$parent.ms.Prov.MasterContractDetails.MasterContractEndDate;

				//1 for validating just dates which is needed for fetching payelements based on Renewal & Amend 
				//2 for entire contract section info and Misc profile info 

				//check if contract start and end dates are valid
				if (stepsOfValidations == undefined) {
					stepsOfValidations = 4;
				}

				if (UtilService.isValidDate(ContStartDt) && UtilService.isValidDate(ContEndDt)) {
					if (moment(ContStartDt).isSameOrAfter(moment(ContEndDt))) {
						errorControlIds.push(vm.Control.StartDate.id);
						vm.Control.StartDate.IsValid = false;
						vm.Control.StartDate.ErrorDesc = "Please Enter Contract Start Date Less than Contract End Date.";
						sbError.push(vm.Control.StartDate.ErrorDesc);
					}
					else {

						//AllowContractDatesoutsideMasterContractDates : 1/true/ allow outside years
						//AllowContractDatesoutsideMasterContractDates : 0/false/ allow outside years
						if (vm.physicianContractDetails.AllowContractDatesoutsideMasterContractDates == 1) {

							//check start date againsit with hire date
							var hireDate = provHelper.isDateGreaterThanHireDate($scope.$parent.ms.PhysicianDetails, ContStartDt);
							if (!hireDate.IsValid) {
								errorControlIds.push(vm.Control.StartDate.id);
								vm.Control.StartDate.IsValid = false;
								vm.Control.StartDate.ErrorDesc = "Provider '" + $scope.$parent.ms.PhysicianDetails.ProviderName + "' contract " + hireDate.ErrorMessage;
								sbError.push(vm.Control.StartDate.ErrorDesc);
							}
							else {
								//master contract dates
								var startDate = moment(masterContrStartDt).subtract(1, 'days');
								var endDate = moment(masterContrEndDt).add(1, 'days');

								//range
								var stDtrange = moment(ContStartDt).isBetween(startDate, endDate);
								var endDtrange = moment(ContEndDt).isBetween(startDate, endDate);

								//one of the (start/end) date should be within master contract date
								if (stDtrange == false && endDtrange == false) {
									errorControlIds.push(vm.Control.StartDate.id);
									vm.Control.StartDate.IsValid = false;
									vm.Control.StartDate.ErrorDesc = "Contract Start Date or End Date should be within master contract start/end Dates.";
									sbError.push(vm.Control.StartDate.ErrorDesc);
								}
							}

						} else {
							if (moment(masterContrStartDt).isAfter(moment(ContStartDt))) {
								errorControlIds.push(vm.Control.StartDate.id);
								vm.Control.StartDate.IsValid = false;
								vm.Control.StartDate.ErrorDesc = "Please Enter Contract Start Date Greater than or Equal to Master Contract Start Date.";
								sbError.push(vm.Control.StartDate.ErrorDesc);
							}

							if (moment(masterContrEndDt).isBefore(moment(ContEndDt))) {
								errorControlIds.push(vm.Control.EndDate.id);
								vm.Control.EndDate.IsValid = false;
								vm.Control.EndDate.ErrorDesc = "Please Enter Contract End Date Less than or Equal to Master Contract End Date.";
								sbError.push(vm.Control.EndDate.ErrorDesc);
							}
						}

						//stepsOfValidations:2 validate only when it is for saving:validate Region, Location, Cost Center
						if (stepsOfValidations >= 2) {
							//region, location, costcenter
							//if (!vm.physicianContractDetails.RegionId > 0) {
							//	errorControlIds.push(vm.Control.ddlRegion.id);
							//	vm.Control.ddlRegion.IsValid = false;
							//	vm.Control.ddlRegion.ErrorDesc = "Please Select a Region.";
							//	sbError.push(vm.Control.ddlRegion.ErrorDesc);
							//}

							if (!parseInt(vm.physicianContractDetails.LocationId) > 0) {
								errorControlIds.push(vm.Control.ddlRegionLocation.id);
								vm.Control.ddlRegionLocation.IsValid = false;
								if (parseInt(vm.physicianContractDetails.ContractId) == 0) {
									vm.Control.ddlRegionLocation.ErrorDesc = "Please Select Location.";
								} else {
									vm.Control.ddlRegionLocation.ErrorDesc = "Please Select Location within the contract duration.";
								}
								sbError.push(vm.Control.ddlRegionLocation.ErrorDesc);
							}

							var CostcenterId = UtilService.convertDataByDatatype(vm.physicianContractDetails.CostCenterId, UtilService.datatype.number, 0, 0);

							if (!CostcenterId > 0) {
								errorControlIds.push(vm.Control.ddlRegionLocCostCenter.id);
								vm.Control.ddlRegionLocCostCenter.IsValid = false;
								if (parseInt(vm.physicianContractDetails.ContractId) == 0) {
									vm.Control.ddlRegionLocCostCenter.ErrorDesc = "Please Select Cost Center.";
								} else {
									vm.Control.ddlRegionLocCostCenter.ErrorDesc = "Please Select Cost Center within the contract duration.";
								}
								sbError.push(vm.Control.ddlRegionLocCostCenter.ErrorDesc);
							}
						}

						if (stepsOfValidations >= 3) {

							if (!parseInt(vm.physicianContractDetails.CompModelSpecialtyId) > 0) {
								errorControlIds.push(vm.Control.ddlCompModelSpecialty.id);
								vm.Control.ddlCompModelSpecialty.IsValid = false;
								vm.Control.ddlCompModelSpecialty.ErrorDesc = "Please Select Specialty.";
								sbError.push(vm.Control.ddlCompModelSpecialty.ErrorDesc);
							}
						}

						if (stepsOfValidations >= 4) {
							if (vm.physicianContractDetails.IsMarkCompleted == true && (vm.physicianContractDetails.PayrollID == "" || vm.physicianContractDetails.PayrollID == null)) {
								errorControlIds.push(vm.Control.chkMarkcomplete.id);
								vm.Control.chkMarkcomplete.IsValid = false;
								vm.Control.chkMarkcomplete.ErrorDesc = "Contract Cannot be marked complete without defining Payroll ID for Provider.";
								sbError.push(vm.Control.chkMarkcomplete.ErrorDesc);
							}

							if (vm.physicianContractDetails.MaxCompensationAmount != null) {
								//var maxlength = parseInt($("#" + vm.Control.txtMaxCompenSation.id).attr('max-length'));
								//var actlength = (vm.physicianContractDetails.MaxCompensationAmount + '').replace('.', '').length;
								//if (actlength > maxlength) {
								//	errorControlIds.push(vm.Control.txtMaxCompenSation.id);
								//	vm.Control.txtMaxCompenSation.IsValid = false;
								//	vm.Control.txtMaxCompenSation.ErrorDesc = "Max Compensation($) length should be less than " + maxlength + ".";
								//	sbError.push(vm.Control.txtMaxCompenSation.ErrorDesc);
								//}
							}
						}
					}
				}
				else {
					if (!UtilService.isValidDate(ContStartDt)) {
						errorControlIds.push(vm.Control.StartDate.id);
						vm.Control.StartDate.IsValid = false;
						vm.Control.StartDate.ErrorDesc = "Please Enter Valid Contract Start Date.";
						sbError.push(vm.Control.StartDate.ErrorDesc);
					}

					//validation for End Date
					if (!UtilService.isValidDate(ContEndDt)) {
						errorControlIds.push(vm.Control.EndDate.id);
						vm.Control.EndDate.IsValid = false;
						vm.Control.EndDate.ErrorDesc = "Please Enter Valid Contract End Date.";
						sbError.push(vm.Control.EndDate.ErrorDesc);
					}
				}


				try {
					//display error message  
					if (sbError.length > 0) {
						var msgobj = {
							MessageType: UtilService.MessageType.Validation,
							Message: sbError.join("<br>")
						}
						UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.PnlContractValidationSummary.id);
					}

					if (errorControlIds != undefined && errorControlIds != null && errorControlIds.length > 0) {
						//focus effective date
						setTimeout(function () {
							focus(errorControlIds[0]);
						}, 150);
					}
				} catch (e) {//ignore 

				}
			}

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
			}
		}

		//validation for contract changes:renewal, amend, transition, end
		vm.validationForContractChanges = function (selectedContractStatus) {

			//start validating contract and master contract info before proceeding further
			var statusInfo = null;

			if (selectedContractStatus == provService.contractActionType.Amend) {
				statusInfo = vm.validateContractInfo(1);
			} else {
				//validate all fields
				statusInfo = vm.validateContractInfo(4);
			}

			if (!statusInfo.IsValid) {
				return statusInfo;
			}

			//start validating contract start, end, amend dates
			var EffDtTitle = vm.Control.EffDtTitle;

			var sbError = [];
			var ContractAmendedDate = null;
			if (UtilService.isEqual(provService.contractActionType.Renewal, selectedContractStatus)) {
				ContractAmendedDate = vm.Control.txtRenewalDate.Details.RenewalDate;
			} else {
				ContractAmendedDate = vm.physicianContractDetails.ContractAmendedDate;
			}

			var errorControlIds = [];
			if (!UtilService.isValidDate(ContractAmendedDate)) {
				errorControlIds.push(vm.Control.SubContAmendDate.id);
				vm.Control.SubContAmendDate.IsValid = false;
				vm.Control.SubContAmendDate.ErrorDesc = "Please Enter Valid " + EffDtTitle + ".";
				sbError.push(vm.Control.SubContAmendDate.ErrorDesc);
			} else {
				var ContStartDt = vm.physicianContractDetails.StartDate;
				var ContEndDt = vm.physicianContractDetails.EndDate;


				//isContMultiYear not implemented in the serverside 
				switch (selectedContractStatus) {
					case provService.contractActionType.Amend:
					case provService.contractActionType.Transition:
					case provService.contractActionType.Renewal:
					case provService.contractActionType.End:

						if (UtilService.isEqual(provService.contractActionType.Amend, selectedContractStatus)) {
							//contrStrtDt>amend
							if (moment(ContStartDt).isAfter(moment(ContractAmendedDate))) {
								errorControlIds.push(vm.Control.SubContAmendDate.id);
								vm.Control.SubContAmendDate.IsValid = false;
								vm.Control.SubContAmendDate.ErrorDesc = "Please Enter " + EffDtTitle + " Greater than or equal Contract Start Date.";
								sbError.push(vm.Control.SubContAmendDate.ErrorDesc);
							}

							//speciality is required
							if (!parseInt(vm.physicianContractDetails.CompModelSpecialtyId) > 0) {
								errorControlIds.push(vm.Control.ddlCompModelSpecialty.id);
								vm.Control.ddlCompModelSpecialty.IsValid = false;
								vm.Control.ddlCompModelSpecialty.ErrorDesc = "Please Select Specialty.";
								sbError.push(vm.Control.ddlCompModelSpecialty.ErrorDesc);
							}
						} else {
							//contrStrtDt>=amend
							if (moment(ContStartDt).isSameOrAfter(moment(ContractAmendedDate))) {
								errorControlIds.push(vm.Control.SubContAmendDate.id);
								vm.Control.SubContAmendDate.IsValid = false;
								vm.Control.SubContAmendDate.ErrorDesc = "Please Enter " + EffDtTitle + " Greater than Contract Start Date.<br/>";
								sbError.push(vm.Control.SubContAmendDate.ErrorDesc);
							}
						}

						if (UtilService.isEqual(provService.contractActionType.Amend, selectedContractStatus) ||
							UtilService.isEqual(provService.contractActionType.Transition, selectedContractStatus)) {
							//if amend>contrendDt
							if (moment(ContractAmendedDate).isAfter(moment(ContEndDt))) {
								errorControlIds.push(vm.Control.SubContAmendDate.id);
								vm.Control.SubContAmendDate.IsValid = false;
								vm.Control.SubContAmendDate.ErrorDesc = "Please Enter " + EffDtTitle + " Less than Contract End Date.";
								sbError.push(vm.Control.SubContAmendDate.ErrorDesc);
							}
						}
						break;
				}
			}

			if (UtilService.isEqual(provService.contractActionType.Amend, selectedContractStatus) ||
				UtilService.isEqual(provService.contractActionType.Renewal, selectedContractStatus)) {
				//check pay element list
				if (!(vm.SelectedAmmendRenewalPEModel != null && vm.SelectedAmmendRenewalPEModel != undefined && vm.SelectedAmmendRenewalPEModel.length > 0)) {
					errorControlIds.push(vm.Control.ddlContractPayElements.id);
					vm.Control.ddlContractPayElements.IsValid = false;
					vm.Control.ddlContractPayElements.ErrorDesc = "Please Select Pay Element(s).";
					sbError.push(vm.Control.ddlContractPayElements.ErrorDesc);
				}
			}

			//sel comp.model is required for transition
			if (UtilService.isEqual(provService.contractActionType.Transition, selectedContractStatus)) {
				//convert to number and then validate
				if (!UtilService.convertDataByDatatype(vm.physicianContractDetails.SelectedCompensationModelId, UtilService.datatype.number, 0, 0) > 0) {
					errorControlIds.push(vm.Control.CompModel.id);
					vm.Control.CompModel.IsValid = false;
					vm.Control.CompModel.ErrorDesc = "Please Select a Comp. Model.";
					sbError.push(vm.Control.CompModel.ErrorDesc);
				}
			}

			try {
				//display error message  
				if (sbError.length > 0) {
					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: sbError.join("<br>")
					}
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlAmendValMessages.id);
				}

				if (errorControlIds != undefined && errorControlIds != null && errorControlIds.length > 0) {
					//focus effective date
					setTimeout(function () {
						focus(errorControlIds[0]);
					}, 150);
				}
			} catch (e) {/*ignore */ }


			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
			}
		}

		vm.markComplete = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			//send the update provcomp controller obj to contract pay elements controller before extracting data from it.
			$timeout(function () { sharedService.broadcast_OnContractDataChange({ tab: vm.currentTab, source: 'Update', physicianContractDetails: vm.physicianContractDetails }); }, 10);
		}

		vm.isSendToPayrollOrAP = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			//send the update provcomp controller obj to contract pay elements controller before extracting data from it.
			//focus effective date
			setTimeout(function () {
				focus(vm.Control.txtBilltoProvider.id);
			}, 100);
		}

		//temp variable
		vm.payelementmodelForContractAction = {};

		//got the model data from pay elements controller for saving in db
		$scope.$on('broadcastPayElementEventInProvContractControl', function () {
			var data = sharedService.getbroadcastdata();
			if (data != null && data.tab != null) {
				if (vm.currentTab != null && vm.currentTab.Id == data.tab.Id) {
					var actionType = data.source;

					if (actionType != null) {
						if (UtilService.isEqual(actionType, provService.contractActionType.Save)
							|| UtilService.isEqual(actionType, provHelper.contractPESource.AmendRenewalPayElements)
							|| UtilService.isEqual(actionType, provService.contractActionType.Amend)
							|| UtilService.isEqual(actionType, provService.contractActionType.Renewal)
							|| UtilService.isEqual(actionType, provService.contractActionType.Transition)
							|| UtilService.isEqual(actionType, provService.contractActionType.End)) {

							if (actionType == provHelper.contractPESource.AmendRenewalPayElements) {
								vm.payelementmodelForContractAction = data.model;

							} else if (actionType == provService.contractActionType.Save) {
								vm.payelementmodelForContractAction = data.model;
							} else {
								//Renewal,Transition,End  
								vm.payelementmodelForContractAction = data.model;
							}
						} else {
							if (UtilService.isEqual(actionType, provService.contractActionType.Save)) {

							}
						}
					}
				}
			}
		});


		//this gets called from contract PayElementController to handle payElements data
		$scope.$on('broadcast_PayElements', function () {
			var data = sharedService.getbroadcastdata();
			if (data != null && data.tab != null) {
				if (vm.currentTab != null && vm.currentTab.Id == data.tab.Id) {

					//assign updated pay elements
					vm.CurrentPayElements = data.ContractPayElements;


					//clear all error messages
					provHelper.hideAllNotifications(vm.Control.PnlContractValidationSummary.id);
					//clear all error messages
					provHelper.hideAllNotifications(vm.Control.pnlAmendValMessages.id);

					var selectedContractStatus = UtilService.getDropdownTextInUpperCaseById(vm.physicianContractDetails.ContractChanges, vm.physicianContractDetails.SelectedContractId);

					switch (selectedContractStatus) {
						case provService.contractActionType.Amend:
						case provService.contractActionType.Renewal:
							////update pay elements multi select
							vm.SelectedAmmendRenewalPEModel = [];
							//reset contract change status to select
							//vm.physicianContractDetails.ContractAmendedDate = '';
							vm.physicianContractDetails.SelectedContractId = '0';
							break;
					}


					//handle other controls like LocationId ddl which is based on pay elements  
					vm.disableLocationIfAnyPayElementExists();
				}
			}
		});

		vm.getPayElementModelByContractActionType = function (selectedContractStatus) {
			//ensure all required valid values are entered
			vm.payelementmodelForContractAction = {};

			//send the update provcomp controller obj to contract pay elements controller before extracting data from it.
			sharedService.broadcast_OnContractDataChange({ tab: vm.currentTab, source: provHelper.contractPESource.SendPayElementsToContract, actionType: selectedContractStatus, physicianContractDetails: vm.physicianContractDetails });

			//get the data by cfrom payelements:getPayElementDataByActionType-->broadcastPayElementEventInProvContractControl
			var ContractPayElementsModel = vm.payelementmodelForContractAction;

			vm.payelementmodelForContractAction = {};

			return ContractPayElementsModel;
		}

		vm.contractActionBySelectedStatus = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			//ensure all required valid values are entered   

			//get respective pay elements
			var selectedContractStatus = UtilService.getDropdownTextInUpperCaseById(vm.physicianContractDetails.ContractChanges, vm.physicianContractDetails.SelectedContractId);

			var pemodel = vm.getPayElementModelByContractActionType(selectedContractStatus);

			var selectedContractStatus = UtilService.getDropdownTextInUpperCaseById(vm.physicianContractDetails.ContractChanges, vm.physicianContractDetails.SelectedContractId);

			var statusInfo = vm.validationForContractChanges(selectedContractStatus);

			if (statusInfo.IsValid) {
				vm.contractAction(selectedContractStatus, pemodel);
			}
		}

		//REST:renewalOrAmendPayElementList
		vm.renewalOrAmendPayElementList = function (selectedContractStatus) {

			////ensure all required valid values are entered  
			var pemodel = vm.getPayElementModelByContractActionType(provHelper.contractPESource.AmendRenewalPayElements).ContractPayElements;

			//1.prepare model
			var query = {
				PhysicianId: vm.physicianContractDetails.PhysicianId,
				ContractId: vm.physicianContractDetails.ContractId,
				ContractStartDate: vm.physicianContractDetails.StartDate,
				ContractEndDate: vm.physicianContractDetails.EndDate,
				ActionType: selectedContractStatus,
				AllowPayElementsDatesoutsideContractDates: vm.physicianContractDetails.AllowPayElementsDatesoutsideContractDates,
				AllowToGroupContractPayElementsBasedOnCostCenter: $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter,
				ContractPayElement: pemodel
			};

			//blockui
			UtilService.blockUI();

			//2. make service call
			provService.renewalOrAmendPayElementList(query).then(onSuccess, onError);

			//3.success callback
			function onSuccess(response) {
				$.unblockUI();

				var ContractPayElements = null;
				////PayElements
				var _arrPayElmnts = [];
				var _selPayElements = [];
				//revisit
				// display error message if any
				// UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlAmendValMessages.id);

				//we got the data
				if (response != undefined && response.RenewalOrAmendPayElementList != undefined) {
					ContractPayElements = response.RenewalOrAmendPayElementList;
				}

				//1. sort pay elements
				if (ContractPayElements != null && ContractPayElements.length > 0) {
					for (var i = 0; i < ContractPayElements.length; i++) {

						var label = ContractPayElements[i].GroupName != null ? ContractPayElements[i].GroupName + ' - ' + ContractPayElements[i].label : ContractPayElements[i].label;
						_arrPayElmnts.push({
							id: ContractPayElements[i].id,
							label: label,
							GroupName: ContractPayElements[i].GroupName,
							UniquePERowId: ContractPayElements[i].UniquePERowId,
							DeptId: ContractPayElements[i].DeptId,
						})

						//default select it to true 
						if (ContractPayElements[i].IsSelected == true) {
							_selPayElements.push(_arrPayElmnts[i]);
						}
					}

					//sort list
					//if (_arrPayElmnts.length > 0) {
					//	_arrPayElmnts.sort(function (a, b) {
					//		var a1 = a.label.toLowerCase(), b1 = b.label.toLowerCase();
					//		if (a1 == b1) return 0;
					//		return a1 > b1 ? 1 : -1;
					//	});
					//}
				}

				//2.assign pay elements multi select
				vm.AmmendRenewalContractPayElements = _arrPayElmnts;
				vm.SelectedAmmendRenewalPEModel = _selPayElements;

				//3.assign renewal details info
				if (UtilService.isEqual(provService.contractActionType.Renewal, selectedContractStatus)) {
					//start assigning info
					if (response != undefined && response.RenewalDateDetails != undefined) {
						vm.Control.txtRenewalDate.Details = response.RenewalDateDetails;
					} else {
						vm.Control.txtRenewalDate.Details = { RenewalDate: "", IsContMultiYear: false, IsProductivity: true, IsRenewalDateEnabled: true }
					}

					////focus renewal date
					$timeout(function () { focus(vm.Control.txtRenewalDate.id); }, 100);
				}
				else {
					////focus effective date
					setTimeout(function () {
						focus(vm.Control.SubContAmendDate.id);
					}, 100);
				}
			}


			function onError(jqXHR) {
				//unblockui
				$.unblockUI();
				vm.imLoadingPE = false;
				vm.AmmendRenewalContractPayElements = [];
				vm.SelectedAmmendRenewalPEModel = [];

				provHelper.handleServerError(jqXHR, vm.Control.pnlAmendValMessages.id);
			}
		}

		//button:SubContractAmend
		vm.btnContractActionBySelectedStatus = function () {
			$timeout(function () { vm.contractActionBySelectedStatus() }, 10)
		}

		vm.contractAction = function (type, othermodel) {
			//get user info
			var userInfo = UtilService.getCurrentUserInfo();
			//1.prepare model
			var model = {}
			if (type == provService.contractActionType.Save) {
				model = vm.getContractAndPayElementsDataForSaving(type);
			}
			else if (type == provService.contractActionType.Discard) {
				model = {
					ContractId: vm.currentTab.ContractId,
					MasterContractId: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedMasterContractId,
					PhysicianId: vm.physicianContractDetails.PhysicianId,
					ApprovedContractModifiedContractID: vm.physicianContractDetails.ApprovedContractModifiedContractID,
					ApproveRejectComments: vm.physicianContractDetails.Comments,
					CompensationModelId: vm.currentTab.CompensationModelId,
					ConCurrencyModifiedDate: vm.physicianContractDetails.ConCurrencyModifiedDate, // "2020-06-05 11:20:00 AM",DateTime 
					CurrentRoleId: userInfo.CurrentRoleID
				};
				//overwrite the below values in model and never ever modify the actual object (vm.physicianContractDetails..) as it's difficult reupdate those values in case of any server errors,
				//discard no need to overwrite the changes
			}
			else if (type == provService.contractActionType.SendToApproval) {
				model = vm.getContractAndPayElementsDataForSaving(type);

				//overwrite the below values in model and never ever modify the actual object (vm.physicianContractDetails..) as it's difficult reupdate those values in case of any server errors,
				model.ApprovalContractID = vm.physicianContractDetails.ContractId; //int
				model.IsApprovalModified = 1; //int?
				model.IsSendToApproval = 1; //int?
			}
			else if (type == provService.contractActionType.Approve) {
				model = vm.getPhysicianContractDetailsForSaving();

				//overwrite the below values in model and never ever modify the actual object (vm.physicianContractDetails..) as it's difficult reupdate those values in case of any server errors, 
				model.btnApprovalClicked = true;
			}
			else if (type == provService.contractActionType.Reject) {
				model = {
					ContractId: vm.currentTab.ContractId,
					MasterContractId: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedMasterContractId,
					PhysicianId: vm.physicianContractDetails.PhysicianId,
					ApprovedContractModifiedContractID: vm.physicianContractDetails.ApprovedContractModifiedContractID,
					ApproveRejectComments: vm.physicianContractDetails.Comments,
					CompensationModelId: vm.currentTab.CompensationModelId,
					ConCurrencyModifiedDate: vm.physicianContractDetails.ConCurrencyModifiedDate, // "2020-06-05 11:20:00 AM",DateTime 
					CurrentRoleId: userInfo.CurrentRoleID
				};
			}
			else if (UtilService.isEqual(provService.contractActionType.Amend, type)) {
				var _renewalpayelementids = [];
				var _selpelist = vm.SelectedAmmendRenewalPEModel;

				var _cpeList = othermodel.ContractPayElements;

				if (_cpeList != null && _cpeList.length > 0) {
					for (var x = 0; x < _selpelist.length; x++) {
						for (var y = 0; y < _cpeList.length; y++) {
							if (_selpelist[x].UniquePERowId == _cpeList[y].UniquePERowId) {
								_renewalpayelementids.push(_selpelist[x].UniquePERowId);
								break;
							}
						}
					}
				}

				model.ActionType = "Amend";
				model.PhysicianId = vm.physicianContractDetails.PhysicianId;
				model.EffectiveDate = vm.physicianContractDetails.ContractAmendedDate;
				model.ContractStartDate = vm.physicianContractDetails.StartDate;
				model.ContractEndDate = vm.physicianContractDetails.EndDate;
				model.PayElementIds = _renewalpayelementids.toString();
				model.OrgCompensationModelId = vm.physicianContractDetails.CompensationModelId; //int  476
				model.CompModelSpecialtyId = vm.physicianContractDetails.CompModelSpecialtyId;
				model.ContractPayElements = _cpeList;

			}
			else if (type == provService.contractActionType.Renewal || UtilService.isEqual(provService.contractActionType.Transition, type)
				|| UtilService.isEqual(provService.contractActionType.End, type)) {

				//current tab data 
				model = vm.getPhysicianContractDetailsForSaving();

				//get pay elements model
				model.DeletedPayElementIds = othermodel.DeletedPayElementIds;
				model.ShowAll = othermodel.ShowAll;
				model.IsValidPayElementsForm = othermodel.IsValidPayElementsForm;

				if (type == provService.contractActionType.Renewal) {
					//get only selected payelements data for renewal 
					var _renewalpayelementids = [];
					var _renewalContractPayElementsList = [];

					var _cpeList = othermodel.ContractPayElements;

					var _selpelist = vm.SelectedAmmendRenewalPEModel;
					if (_cpeList != null && _cpeList.length > 0) {
						for (var x = 0; x < _selpelist.length; x++) {

							for (var y = 0; y < _cpeList.length; y++) {
								var cpe = _cpeList[y];

								if (_selpelist[x].UniquePERowId == cpe.UniquePERowId) {
									_renewalContractPayElementsList.push(cpe);
									_renewalpayelementids.push(cpe.ContractPaySubElementID);
									break;
								}
							}
						}
					}

					//custom columns
					var _cpeCustomColumnList = othermodel.ContractPayElementCustomColumns;
					var _renewalCPECustomColumnsList = [];

					if (_cpeCustomColumnList != null) {
						for (var x = 0; x < _renewalContractPayElementsList.length; x++) {
							for (var y = 0; y < _cpeCustomColumnList.length; y++) {//UniquePERowId
								var custcol = _cpeCustomColumnList[y];
								if (_renewalContractPayElementsList[x].UniquePERowId == custcol.UniquePERowId) {
									_renewalCPECustomColumnsList.push(custcol);
								}
							}
						}
					}

					model.ContractPayElements = (_renewalContractPayElementsList.length == 0 ? null : _renewalContractPayElementsList);
					model.ContractPayElementCustomColumns = (_renewalCPECustomColumnsList.length == 0 ? null : _renewalCPECustomColumnsList);
				}
				else {
					model.ContractPayElements = othermodel.ContractPayElements;
					model.ContractPayElementCustomColumns = othermodel.ContractPayElementCustomColumns;
				}


				if (UtilService.isEqual(provService.contractActionType.Transition, type)) {
					model.AdditionalMasterInfo = {
						ActionType: "Transition",
						SubContractDate: vm.physicianContractDetails.ContractAmendedDate,
						ContractStartDate: vm.physicianContractDetails.StartDate,
						ContractEndDate: vm.physicianContractDetails.EndDate,
						IsProductivity: "0",
						RenewOverlap: 0,
						ActionDate: vm.physicianContractDetails.ContractAmendedDate,
						TransitionCompModel: UtilService.convertDataByDatatype(vm.physicianContractDetails.SelectedCompensationModelId, UtilService.datatype.number, 0, 0),
						TransitionCompModelName: UtilService.getDropdownTextById(vm.CompensationModel, vm.physicianContractDetails.SelectedCompensationModelId, ''),
						IsAmend: false,
						IsExtend: false,
						IsRenewed: false,
						AmendDate: null,
						CurrentRoleId: userInfo.CurrentRoleID
					};
				}
				else if (UtilService.isEqual(provService.contractActionType.End, type)) {
					model.AdditionalMasterInfo = {
						ActionType: "ContractEnd",
						SubContractDate: vm.physicianContractDetails.ContractAmendedDate,
						IsProductivity: "0",
						RenewOverlap: 0,
						ActionDate: vm.physicianContractDetails.ContractAmendedDate,
						PayElementIds: "",//do nothing
						IsAmend: false,
						IsExtend: false,
						IsRenewed: false,
						AmendDate: null,
						CurrentRoleId: userInfo.CurrentRoleID
					};
				}
				else {
					model.AdditionalMasterInfo = {
						ActionType: "Renewal",
						SubContractDate: vm.Control.txtRenewalDate.Details.RenewalDate, //renewal date 
						ContractStartDate: vm.physicianContractDetails.StartDate,
						ContractEndDate: vm.physicianContractDetails.EndDate,
						IsProductivity: vm.Control.txtRenewalDate.Details.IsProductivity ? '1' : '0',
						RenewOverlap: 0,
						ActionDate: "",
						IsAmend: false,
						IsExtend: false,
						IsRenewed: true,
						AmendDate: null,
						CurrentRoleId: userInfo.CurrentRoleID
					};

					model.AdditionalMasterInfo.PayElementIds = _renewalpayelementids.toString();
				}
			}

			//vm.performContractActionByType(type, othermodel);
			if (type == provService.contractActionType.SendToApproval || type == provService.contractActionType.Save) {
				//this is where validation happens for the contract form
				var statusInfo = vm.validateContractInfo(4);

				model.IsValidContractForm = statusInfo.IsValid;

				var data = {};
				data.tab = vm.currentTab;
				data.model = model;
				data.actionType = type;   //approve, reject, discard  //data.actionType = provService.contractActionType.Save;  
				//2.send data to parent controller
				sharedService.broadcastcontractEventInParentControl(data);

				//update tab validation status
				var _isInvalidTabData = false;
				if (model.IsValidContractForm == false || model.IsValidMiscProfileForm == false || model.IsValidPayElementsForm == false) {
					_isInvalidTabData = true;
				}

				$scope.$parent.ms.updateCurrentTabValidationStatus(vm.currentTab.Id, _isInvalidTabData);

			} else if (UtilService.isEqual(provService.contractActionType.Amend, type)) {
				vm.amendContract(type, model);
			} else {
				vm.performContractActionByType(type, model);
			}
		}

		//REST:amendContract
		vm.amendContract = function (type, model) {
			vm.imLoadingPE = true;
			//blockui
			UtilService.blockUI();

			//2. make service call
			provService.performContractActionByType(model, type).then(onSuccess, onError);

			//3.success callback
			function onSuccess(response) {
				$.unblockUI();
				vm.imLoadingPE = false;

				var ContractNotificationMessages = response.ContractNotificationMessages;//[]
				if (ContractNotificationMessages == null) {
					//success
					//ContractNotificationMessages
					var AmendContractPayElements = [];
					//we got the data
					if (response != undefined && response.AmendContractPayElements != undefined) {
						AmendContractPayElements = response.AmendContractPayElements;
					}

					vm.AmmendRenewalContractPayElements = [];
					vm.SelectedAmmendRenewalPEModel = [];
					//reset contract change status to select
					vm.physicianContractDetails.ContractAmendedDate = '';
					vm.physicianContractDetails.SelectedContractId = '0';

					////scroll to top to focus user on error msg 
					$timeout(function () { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 200);

					//pass it to pay elements controller
					//send the update provcomp controller obj to contract pay elements controller before extracting data from it.
					sharedService.broadcast_OnContractDataChange({ tab: vm.currentTab, source: provHelper.contractPESource.AmendContractPayElements, physicianContractDetails: vm.physicianContractDetails, AmendContractPayElements: AmendContractPayElements });
				}
				else {
					//failure
					var errorMessage = null;
					for (var i = 0; i < ContractNotificationMessages.length; i++) {
						var _contractObj = ContractNotificationMessages[i];
						if (i == 0) {
							errorMessage = _contractObj.MasterContractMessage;
							MessageType = _contractObj.MessageType;
						}
					}

					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: errorMessage
					}
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlAmendValMessages.id);
				}

			}


			function onError(jqXHR) {
				//unblockui
				$.unblockUI();
				vm.imLoadingPE = false;

				provHelper.handleServerError(jqXHR, vm.Control.pnlAmendValMessages.id);
			}
		}

		//REST:deleteContract confirmation
		vm.deleteContractConfirmation = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			//1.prepare model
			var postdata = {
				ContractId: vm.physicianContractDetails.ContractId,
				PhysicianId: vm.physicianContractDetails.PhysicianId,
				ConfirmationMessage: ""
			}

			var type = provService.contractActionType.Delete;
			//2.block UI 
			UtilService.blockUI();

			provService.performContractActionByType(postdata, type).then(function (response) {
				//unblockui
				$.unblockUI();

				if (response.NotificationMessages != undefined) { response = response.NotificationMessages; }
				//Validation
				var msgobj = {
					MessageType: response.MessageType,
					Message: response.Message
				}

				if (UtilService.isEqual(msgobj.MessageType, UtilService.MessageType.PopUp)) {
					//clear all tabs and reload content again   
					vm.deleteContractConfirmationPopup(response, type, postdata);
				} else {
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlMasterContractValidationMessage.id);
				}

			}, function onError(jqXHR) {
				//unblockui
				$.unblockUI();

				provHelper.handleServerError(jqXHR, vm.Control.PnlContractValidationSummary.id);
			});
		}

		vm.deleteContractConfirmationPopup = function (response, type, postdata) {

			//create dynamic modal
			var newDiv = $(document.createElement('div'));

			var title = "Delete Contract";
			var dynamicbuttons = {};

			var message = response.Message;

			var buttonsName = response.MessageButtons;

			if (buttonsName.indexOf("Yes/No") != -1) {

				dynamicbuttons = {
					"Yes": function () {
						newDiv.dialog("close");
						postdata.ConfirmationMessage = 'yes';
						//delete contract
						vm.performContractActionByType(type, postdata);
					},
					"No": function () {
						newDiv.dialog("close");
					}
				}

			} else {

				dynamicbuttons = {
					"Cancel": function () {
						newDiv.dialog("close");
					}
				}
			}

			//dynamic modal
			newDiv.dialog({
				title: title,
				autoOpen: true,
				modal: true,
				resizable: false,
				closeOnEscape: true,
				open: function () {
					$(this).html(message);
				},
				show: {
					effect: "blind",
					duration: 500
				},
				hide: {
					effect: "explode",
					duration: 500
				}
				, buttons: dynamicbuttons
			});
		}

		//REST:Discard, Renewal, Transition, End, Approve, Reject
		vm.performContractActionByType = function (type, othermodel) {
			//clear all error messages
			provHelper.hideAllNotifications();

			var $parent = $scope.$parent.$parent.ms;

			var postdata = {};
			var isEntireFormValid = true;

			if (type == provService.contractActionType.Discard ||
				type == provService.contractActionType.Approve ||
				type == provService.contractActionType.Reject ||
				type == provService.contractActionType.Delete) {
				postdata = othermodel;
			}
			else {
				//for renewal, Transition, End
				//get parent controller object model
				var model = $parent.getMasterModelForSaving(type, othermodel);

				//for renewal, transition and end: add or override existing model data with othermodel object 
				//add extra info to the root node
				if (othermodel != null && othermodel != null && othermodel.AdditionalMasterInfo != null) {
					for (var prop in othermodel.AdditionalMasterInfo) {
						model[prop] = othermodel.AdditionalMasterInfo[prop];
					}
				}

				//assign all tabs data
				var PhysicianContractData = [];
				PhysicianContractData.push(othermodel);
				model.PhysicianContract = PhysicianContractData;

				//start validating whole form
				var statusInfo = $parent.validateEntireFormData(model);

				//is form valid
				isEntireFormValid = statusInfo.IsValid;
				if (statusInfo.IsValid) {
					//re-assign tab data 
					model.PhysicianContract = statusInfo.PhysicianContract;

					postdata = model;
				}
			}

			if (isEntireFormValid) {
				//block UI 
				UtilService.blockUIWithText("Please wait while processing your request...");
				//just for console
				console.log('Action:' + type);

				console.log(JSON.stringify(postdata, (k, v) => v === undefined ? 'undefined-->check this out??' : v));
				console.log(JSON.stringify(postdata));

				provService.performContractActionByType(postdata, type).then(function (response) {
					vm.onSuccessStatusSaveCallback(response, type);
				}, vm.onError);
			}
		}

		//below method will be called back on success for the following action types: Discard,Renewal,Transistion,End,Amend,Approve,Reject
		vm.onSuccessStatusSaveCallback = function (response, type) {

			var $parent = $scope.$parent.$parent.ms;
			if (type == provService.contractActionType.Discard || type == provService.contractActionType.Delete) {
				//unblock ui while loading other data
				$.unblockUI();

				if (type == provService.contractActionType.Delete) {
					if (response.NotificationMessages != undefined) { response = response.NotificationMessages; }
				}
				//scroll to top to focus user on error msg
				$timeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 200);

				//Validation
				var msgobj = {
					MessageType: response.MessageType,
					Message: response.Message
				}

				if (UtilService.isEqual(msgobj.MessageType, UtilService.MessageType.Success)) {
					//clear all tabs and reload content again   

					////REST call:get selected master contract details - asynchronously 
					//$timeout(function () { vm.getMasterContractDetailsByMasterContractId($scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedMasterContractId, true); }, 600);
					$timeout(function () { $parent.refreshButton(); }, 10);


					$timeout(function () { UtilService.manageUserFriendlyNotifications(msgobj, $parent.Control.pnlMasterContractValidationMessage.id); }, 1100);

				} else {
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlMasterContractValidationMessage.id);
				}

			}
			else if (type == provService.contractActionType.Renewal || type == provService.contractActionType.Transition || type == provService.contractActionType.End) {
				//unblock ui 
				$.unblockUI();

				//scroll to top to focus user on error msg 
				$timeout(function () { window.scrollTo({ top: 20, behavior: 'smooth' }); }, 200);

				//error message
				var MasterContractMessage = null;
				var MessageType = null;
				//assign  

				var ContractNotificationMessages = response.ContractNotificationMessages;
				//when NotificationMessages = null then there validation errors
				if (ContractNotificationMessages != null) {

					for (var i = 0; i < ContractNotificationMessages.length; i++) {
						var _contractObj = ContractNotificationMessages[i];
						if (i == 0) {
							MasterContractMessage = _contractObj.MasterContractMessage;
							MessageType = _contractObj.MessageType;
						}

						if (_contractObj != null && _contractObj != undefined) {
							_contractObj.actionType = type;
						}

						if (UtilService.isEqual(MessageType, UtilService.MessageType.Validation)) {
							_contractObj.TabId = vm.currentTab.Id;

							//display error messages
							sharedService.broadcastHandleResponseChildControl({ response: _contractObj });
						}
						else {
							//unblock ui while loading other data
							$timeout(function () { $parent.refreshButton(); }, 10);
							break;
						}
					}

					var msgobj = {
						MessageType: MessageType,
						Message: MasterContractMessage
					}
					//display userfriendly error message 
					$timeout(function () { UtilService.manageUserFriendlyNotifications(msgobj, $parent.Control.pnlMasterContractValidationMessage.id); }, 900);
				}
			}
			else {
				//unblock ui 
				$.unblockUI();
				alert('handle response for' + type);
			}
		}

		$scope.$on('broadcastClearFormErrors', function () {
			//inform main tab
			//clear misc. prof errors
			if (vm.displayProfileSettings != null) {
				for (var i = 0; i < vm.displayProfileSettings.length; i++) {
					var _detrows = vm.displayProfileSettings[i].displaySettingsIndetails;

					//reset overlapping flag 
					vm.displayProfileSettings[i].displaySettingsIndetails = UtilService.resetOverlappingRangeFlag(_detrows);
				}
			}

			var _isInvalidTabData = false;
			$scope.$parent.ms.updateCurrentTabValidationStatus(vm.currentTab.Id, _isInvalidTabData);

		});

		$scope.$on('broadcastHandleResponseChildControl', function () {
			var response = sharedService.getbroadcastdata();

			if (response.response != undefined) { response = response.response; }

			if (response != null && response.TabId != null) {
				//check if messagetype is of popup then bypass value if it's a active tab
				var ispopupFound = UtilService.isEqual(response.MessageType, UtilService.MessageType.PopUp);

				if (response.TabId == vm.currentTab.Id) {

					var msgobj = { MessageType: response.MessageType };

					if (response.MessageType == UtilService.MessageType.Success) {
						//success reload data 
						vm.refreshContractSectionData();
					}
					else {
						if (ispopupFound) {
							//assign contract error message
							msgobj.Message = response.Message;

							//messageDetailsResult.Message = "There is already a comp model with the same cost center associated. Do you want to continue?";  
							//messageDetailsResult.Message = "Are you sure you want to Mark Complete?"; 
							var isFound = false;

							if (vm.currentTab.IsDataLoaded && msgobj.Message.indexOf("There is already a comp model with the same cost center associated.") > -1) {
								if (confirm(msgobj.Message)) {
									isFound = true;
									//There is already a comp model with the same cost center associated.Do you want to continue?
									//send the OverlapContractId:1 and when click on No, No need to call Save API.
									vm.physicianContractDetails.OverlapContractId = 1;
								}
							} else if (vm.currentTab.IsDataLoaded && msgobj.Message.indexOf("Are you sure you want to Mark Complete?") > -1) {
								if (confirm(msgobj.Message)) {
									isFound = true;
									//need to send the MarkcompleteForSave = True
									vm.physicianContractDetails.MarkcompleteForSave = true;
								}
							} else {
								//if (confirm(msgobj.Message + ' New scenario')) {
								//isFound = true;
								alert(' New scenario:' + msgobj.Message)
								//}
							}

							//click master save button 
							if (isFound == true) {
								if (response.actionType == provService.contractActionType.Save) {
									$scope.$parent.$parent.ms.saveAllContracts(response.actionType);
								} else if (response.actionType == provService.contractActionType.SendToApproval) {
									vm.performContractActionByCurrentStatus();
								}
							}
						} else {
							//assign contract error message
							msgobj.Message = response.ContractMessage;

							//update tab validation status
							var _isInvalidTabData = true;
							$scope.$parent.ms.updateCurrentTabValidationStatus(vm.currentTab.Id, _isInvalidTabData);

							//ContractMessage
							if (msgobj.Message != null) {
								//open tab
								$scope.$parent.$parent.ms.managepanel(vm.currentTab);

								if (response.actionType == provService.contractActionType.Renewal || response.actionType == provService.contractActionType.Transition || response.actionType == provService.contractActionType.End) {
									UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlAmendValMessages.id);
								} else {
									UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.PnlContractValidationSummary.id);
								}
							}

							//assign contract error message
							msgobj.Message = response.MiscellaneousProfileMessage;


							//msgobj.Message = "AccordionId:profiles_accordion_01208-559c9064-7cc1-4031-9e8f-fd2184f30742-903|Please Enter MPV Description1.<br/>AccordionId:profiles_accordion_21208-559c9064-7cc1-4031-9e8f-fd2184f30742-903|Please Select Lookup Value for Row 1.<br/>AccordionId:profiles_accordion_01208-559c9064-7cc1-4031-9e8f-fd2184f30742-903|Please Enter Start Date for Row 2.<br/>AccordionId:pnl88888|Please Enter MPV Description.<br/>AccordionId:pnl88888|Please Enter Start Date for Row 1.<br/>";

							//MiscellaneousProfileMessage
							if (msgobj.Message != null) {
								//select tab which has error messages
								$scope.$parent.$parent.ms.managepanel(vm.currentTab);

								//extract and arrange different accordion ids 
								vm.displayProfileSettingsServerValidationErrorMessage(msgobj.Message);
							}
						}
					}
				}
			}
		});

		vm.displayProfileSettingsServerValidationErrorMessage = function (Message) {
			if (Message == null || Message == undefined) { return; }

			var accordionArr = [];
			var lines = Message.split('<br/>');
			jQuery.each(lines, function (k, v) {
				var row = v.split('|');
				if (row != undefined && row.length > 1) {
					accordionArr.push({ id: row[0], desc: row[1], order: k });
				} else if (row.length == 1 && row[0] != "") {
					accordionArr.push({ id: null, desc: row[0], order: k });
				}
			});

			if (accordionArr.length > 0) {
				var grpobj = groupBy(accordionArr, "id");

				function groupBy(collection, property) {
					var i = 0, val, index, values = [], result = [];
					for (; i < collection.length; i++) {
						val = collection[i][property];
						index = values.indexOf(val);
						if (index > -1)
							result[index].push(collection[i]);
						else {
							values.push(val);
							result.push([collection[i]]);
						}
					}
					return result;
				}


				for (var i = 0; i < grpobj.length; i++) {
					var _profileAccodionId = null;
					var msgs = [];
					for (var j = 0; j < grpobj[i].length; j++) {
						if (j == 0) { _profileAccodionId = grpobj[i][j].id.replace('AccordionId:', ''); }
						msgs.push(grpobj[i][j].desc.replace(_profileAccodionId + '|', ''));
					}

					//now display accordion message
					if (_profileAccodionId != null && _profileAccodionId != '') {

						var prof = vm.getDisplayProfileSettingsItemById(_profileAccodionId);

						//display the accordion which is thrown error message from server
						vm.updateDisplayProfileSettingsFlag(prof, true);

						var msgobj = {
							MessageType: UtilService.MessageType.Validation,
							Message: msgs.join(" <br />")
						}

						UtilService.manageUserFriendlyNotifications(msgobj, prof.accordionNotificationDiv);

						vm.expandMiscProfAccordion(prof, true);
					}
				}
			}
		}

		//onPageLoad
		$(document).ready(function () {
			vm.onPageLoad();
		});



	});
})();
