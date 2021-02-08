"use strict";
(function () {
	app.controller('contractPayElementController', function ($scope, $exceptionHandler, provHelper, UtilService, provService, sharedService, focus, $timeout) {
		var vm = this;
		vm.dateformat = 'MM/DD/YYYY';
		vm.currentTab = null;

		vm.loadingStatus = { yettobeloaded: 0, loading: 1, warn: 2, error: 3, ignore: 4, loaded: 5 }
		vm.imLoading = true;

		//local variables which needs to be filled from parent controller
		vm.physicianContractDetails = {};//contract info

		vm.PayElementErrorMessageList = [];
		vm.PayElementServerErrorMessageList = [];

		vm.defaultGroupId = 1;

		vm.recordstatus = provHelper.recordstatus;

		vm.operationmode = { load: "load", add: "add", edit: "edit", view: "view", delete: 'delete' }

		//local variables
		vm.enmPayElement = {
			Type: {
				Fixed: "FIXED", Variable: "VARIABLE", Bonus: "BONUS"
			},
			PayFrequency: {
				TrackingOnly: "TRACKING ONLY"
			},
			UnitorPayFrequency: {
				Amount: "AMOUNT", Rate: "RATE", wRVU: "WRVU", VariableAmount: "VARIABLE AMOUNT"
			},
			Category: {
				Overage: { Text: "OVERAGE", Value: ["4 Weeks", "8 Weeks", "12 Weeks"] }
			}
		};

		vm.showALLRecords = false;
		vm.expandCollapsibleExtraPayElements = true;

		//CostCenterTabs in payelements
		vm.CostCenterTabs = [];

		//multi select drop-down settings 
		vm.MultiCostCenter = {
			Model: [],
			events: {
				onItemSelect: function (item) {
					$timeout(function () {
						vm.SelectedCostCenterId = item.id;
						vm.costcenterChanged();
					}, 10);
				},
				onItemDeselect: function (item) {
					$timeout(function () {
						vm.SelectedCostCenterId = 0;
						vm.costcenterChanged();
					}, 10);
				},
				onDeselectAll: function (item) {
					$timeout(function () {
						vm.SelectedCostCenterId = 0;
						vm.costcenterChanged();
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
		vm.MultiSearchPayElement = {
			settings: {
				//selectionLimit: 10
			},
			events: {
				onItemSelect: function (item) {
					$timeout(function () { vm.multiSelectPayElementChange(); }, 10);
				},
				onItemDeselect: function (item) {
					$timeout(function () { vm.multiSelectPayElementChange(); }, 10);
				},
				onSelectAll: function () {
					$timeout(function () { vm.multiSelectPayElementChange(); }, 10);

				},
				onDeselectAll: function (item) {
					$timeout(function () { vm.multiSelectPayElementChange(); }, 10);
				}
			}
		}

		$scope.$on('broadcast_loadContractPayElementDetailsByProvider', function () {
			var data = sharedService.getbroadcastdata();
			if (data != null && data.tab != null) {
				if (vm.currentTab != null) {
					if (vm.currentTab != null && vm.currentTab.Id == data.tab.Id) {
						//retreive physicianId and Contract Id and other contract info 
						vm.currentTab = data.tab;

						vm.physicianContractDetails = data.tab.OtherInfo;

						//get data from loacl cache
						var _expCollvalue = UtilService.getDataFromLocalStorage('expandCollapsibleExtraPayElements');
						if (_expCollvalue != null) {
							vm.expandCollapsibleExtraPayElements = (_expCollvalue === 'true');
						}

						vm.refreshEntirePayElementsSection();
					}
				}
			}
		});

		//this gets called from prov comp contract Controller to handle start & end date 
		$scope.$on('broadcast_OnContractDataChange', function () {
			var data = sharedService.getbroadcastdata();
			if (data != null && data.tab != null) {
				if (vm.currentTab != null && vm.currentTab.Id == data.tab.Id) {

					//we got the data   
					var contractdata = angular.copy(data.physicianContractDetails);
					vm.physicianContractDetails = contractdata;


					if (data.source == provHelper.contractPESource.RegionLocationId) {
						//set and load only for other than load operation
						if (data.operationmode != vm.operationmode.load) {
							vm.loadCostCentersByRegionAndLocationId(contractdata);
						}
					}
					else if (data.source == provHelper.contractPESource.LocationId) {
						//clear all pay elements on location Id change 
						vm.preparePayElementModel([], vm.operationmode.load);
					}
					else if (data.source == provHelper.contractPESource.ContractDate) {
						var startDate = contractdata.StartDate;
						var endDate = contractdata.EndDate;

						//update start date and end date 
						var _listCPE = vm.ContractPayElements;
						if (_listCPE != null) {
							for (var i = 0; i < _listCPE.length; i++) {

								var item = _listCPE[i];

								if (!item.StartDtManuallyChanged) {
									item.StartDate = startDate;
								}

								if (!item.EndDtManuallyChanged) {
									item.EndDate = endDate;
								}

								vm.isPayElementsDateManuallyChanged(item);

								//if (item.StartDate == vm.physicianContractDetails.StartDate) {
								//	item.StartDtManuallyChanged = false;
								//}

								//if (item.EndDate == vm.physicianContractDetails.EndDate) {
								//	item.EndDtManuallyChanged = false;
								//} 

								//update records only if they were not modified
								//if (!_listCPE[i].StartDtManuallyChanged) {
								//	_listCPE[i].StartDate = startDate;
								//}

								//if (!_listCPE[i].EndDtManuallyChanged) {
								//	_listCPE[i].EndDate = endDate;
								//}
							}
						}

						$timeout(function () {
							vm.ContractPayElements = _listCPE;
							//validate form
							$timeout(function () { vm.validatePayElementModel(provService.contractActionType.Save) }, 600);
						}, 10);

					}
					else if (data.source == provHelper.contractPESource.AmendContractPayElements) {
						var _amendContractPayElements = angular.copy(data.AmendContractPayElements);
						vm.updateAmendContractPayElements(_amendContractPayElements);
					}
					else if (data.source == provHelper.contractPESource.validateContractInfo) {
						vm.contractformstatusInfo = data.contractformstatusInfo;
					}
					else if (data.source == provHelper.contractPESource.SendPayElementsToContract) {
						vm.getPayElementDataByActionType(data.actionType);
					}
					else {
						//source is Update: do nothing, just update the contractcomp object in payelements i.e., vm.physicianContractDetails 
						//validate form
						$timeout(function () { vm.validatePayElementModel(provService.contractActionType.Save) }, 300);
					}
				}
			}
		});

		vm.updateAmendContractPayElements = function (_amendContractPayElements) {
			//append the newly added model  
			var _orgCPE = vm.ContractPayElements == null ? [] : vm.ContractPayElements;

			//take only deleted records
			var _listCPE = [];
			for (var i = 0; i < _orgCPE.length; i++) {
				if (_orgCPE[i].IsDeleted == true) {
					_listCPE.push(_orgCPE[i]);
				}
			}

			var idx = _listCPE.length;
			if (_amendContractPayElements != null) {
				for (var i = 0; i < _amendContractPayElements.length; i++) {
					var item = _amendContractPayElements[i];
					item.status = item.ContractPaySubElementID > 0 ? vm.recordstatus.original : vm.recordstatus.new;

					//add uniqueRowId and control config
					item.Control = vm.getDynamicControlIdConfigBySeqRowId(idx + i);

					//populate prorate value
					item = vm.setDefaultRateOrAmount(item);

					_amendContractPayElements[i] = item;
					_listCPE.push(_amendContractPayElements[i]);
				}
			}

			//prepare the model
			vm.preparePayElementModel(_listCPE, vm.operationmode.add);

			//update pay elements in contract section
			//sharedService.broadcast_PayElements({ tab: vm.currentTab, ContractPayElements: vm.ContractPayElements });

			//reset multi drop down selection only when it is successfully added
			vm.newSelectedPayElmntModel = [];

		}

		vm.setDefaultRateOrAmount = function (item) {
			var d = parseFloat(item.OrigProratedAmount);
			item.AdjustedAnnualAmount = isNaN(d) ? 0 : d;

			//local vairbles to manage default rates on add, load pay elements
			var _amntType = UtilService.getDropdownTextInUpperCaseById(vm.PaySubElementUnit, item.SubPayElementID);

			if (UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.Rate)) {
				item.DefaultUnitorPFRateAnnual = item.AdjustedAnnualAmount;
				//unit, Threshold units, threshold amnt,THFrequency
				item.DefaultUnitorPFRateSubPayElementID = item.PayUnit;
				item.DefaultUnitorPFRateTHUnits = item.ThresholdUnits;
				item.DefaultUnitorPFRateTHAmount = item.ThresholdAmount;
				item.DefaultUnitorPFRateTHFrequency = item.ThresholdFrequencyId;

			} else if (UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.Amount)) {
				item.DefaultUnitorPFAmountAnnual = item.AdjustedAnnualAmount;
				//unit, Threshold units, threshold amnt,THFrequency
				item.DefaultUnitorPFAmountSubPayElementID = item.PayUnit;
				item.DefaultUnitorPFAmountTHUnits = item.ThresholdUnits;
				item.DefaultUnitorPFAmountTHAmount = item.ThresholdAmount;
				item.DefaultUnitorPFAmountTHFrequency = item.ThresholdFrequencyId;
			}
			return item;
		}

		vm.loadCostCentersByRegionAndLocationId = function (physicianContractDetails) {
			//get region&location Id
			var regionId = 0
			var locationId = 0;
			var defaultCCId = '0';

			//get region&location Id 
			if (physicianContractDetails != null && physicianContractDetails != undefined) {
				regionId = physicianContractDetails.RegionId;
				locationId = physicianContractDetails.LocationId;
				defaultCCId = physicianContractDetails.CostCenterId;
			}
			vm.loadCostCentersByLocationId(defaultCCId, regionId, locationId);
		}

		vm.loadCostCentersByLocationId = function (defaultCCId, regionId, locationId) {
			//clear cost center dropdownlist data
			vm.CostCenterMasterList = [];
			//clear selection
			vm.SelectedCostCenterId = 0;
			vm.MultiCostCenter.Model = [];



			//refresh costcenters by location & region 
			var userInfo = UtilService.getCurrentUserInfo();
			var cacheConfig = {
				enmkey: UtilService.enmCache.CostcentersByLocationId,
				cacheKey: UtilService.enmCache.CostcentersByLocationId + '_' + regionId + '_' + locationId,
				model: { roleCode: userInfo.CurrentUserRoleCode, regionId: regionId, locationId: locationId },
				status: vm.loadingStatus.loading
			}

			provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {
				//bind regionAndLocationMasterList and pass LocationId to Payelements controller to load cost centers and display add button 
				var _list = [];
				if (response != null) {
					_list = response.costcenters;

					if (_list != null && _list.length > 0 && parseInt(_list[0].id) === 0)
						_list.splice(0, 1);
				}

				//make list null when region or location id is null. There shudn't be any performance issue as we retreive this datafrom cache
				if (parseInt(locationId) == 0) {
					_list = null;
				}


				//sort cost center by name
				if (_list != null && _list.length > 0) {
					_list.sort((a, b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0));
				}

				//assign cost center
				vm.CostCenterMasterList = _list;

				var SelectedCostCenterId = 0;
				if (_list != null) {
					for (var i = 0; i < _list.length; i++) {
						if (parseInt(_list[i].id) == parseInt(defaultCCId)) {
							SelectedCostCenterId = _list[i].id;
							break;
						}
					}
				}
				vm.SelectedCostCenterId = SelectedCostCenterId + '';
				vm.MultiCostCenter.Model = UtilService.getSelectedDropdownModelByValue(_list, SelectedCostCenterId);

				vm.setPanelById(SelectedCostCenterId);

			}, function (jqXHR) {
				//log the exception
				try { $exceptionHandler(jqXHR); } catch (e1) { }
				//console.log('Err:' + JSON.stringify(jqXHR));
				vm.CostCenterMasterList = [];
			});

		}

		vm.refreshEntirePayElementsSection = function () {
			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);

			//reload image processing 
			$timeout(function () {
				vm.imLoading = true;
				vm.ContractPayElements = [];
				$scope.$apply();
			}, 10);

			$timeout(function () {

				vm.loadMasterDataByKey();

			}, 100);
		}


		//REST: load all master data
		vm.loadMasterDataByKey = function (userInfo) {
			//get user info
			var userInfo = UtilService.getCurrentUserInfo();

			//1.load pay elements master data
			loadPayElementsMasterData();

			function loadPayElementsMasterData() {

				var pecacheConfig = {
					enmkey: UtilService.enmCache.payElements,
					cacheKey: UtilService.enmCache.payElements + '_' + vm.currentTab.ContractId + '_' + vm.currentTab.CompensationModelId,
					model: { contractId: vm.currentTab.ContractId, orgCompensationModelId: vm.currentTab.CompensationModelId },
					status: vm.loadingStatus.loading
				};

				provService.getMasterDataByKey(userInfo, pecacheConfig.enmkey, pecacheConfig.cacheKey, pecacheConfig.model).then(function (response) {
					try {
						vm.handleSuccessCacheData(pecacheConfig, response);

						loadPayElementsTypecacheConfig();

					} catch (jqXHR) {
						//log the exception
						try { $exceptionHandler(jqXHR); } catch (e1) { }
						//console.log(JSON.stringify(err)); //hide loading image
						vm.imLoading = false;
					}
				}, function (err) {
					vm.onError(err);
					$timeout(function () { $(".pay-elements-section", $('#' + vm.currentTab.Id)).css('visibility', 'visible'); }, 300);
					//err:update status 
					vm.handleSuccessCacheData(pecacheConfig, err);
				});
			}

			//2.load pay elementtype master data  
			function loadPayElementsTypecacheConfig() {
				var peTypecacheConfig = {
					enmkey: UtilService.enmCache.payElementType,
					cacheKey: UtilService.enmCache.payElementType,
					model: null,
					status: vm.loadingStatus.loading
				}

				provService.getMasterDataByKey(userInfo, peTypecacheConfig.enmkey, peTypecacheConfig.cacheKey, peTypecacheConfig.model).then(function (response) {
					//try {
					vm.handleSuccessCacheData(peTypecacheConfig, response);

					//once the master data is loaded then load pay elements data by provider
					//3.load payelements data for a provider   

					vm.getPayElementDetailsByProvider();

					//} catch (err) {
					//	console.log(JSON.stringify(err)); //hide loading image
					//	vm.imLoading = false;
					//}
				}, function (jqXHR) {
					//log the exception
					try { $exceptionHandler(jqXHR); } catch (e1) { }

					$timeout(function () { $(".pay-elements-section", $('#' + vm.currentTab.Id)).css('visibility', 'visible'); }, 300);
					//err:update status 
					vm.handleSuccessCacheData(peTypecacheConfig, jqXHR);
				});
			}
		}
		//REST: 1.asynchronous call to load: Costcenter
		vm.handleSuccessCacheData = function (cacheConfig, response) {
			//handle response accordingly
			if (cacheConfig.enmkey == UtilService.enmCache.payElements) {
				vm.PayElement = (response != null ? response.PayElement : []);
				vm.newSelectedPayElmntModel = [];
			}
			else if (cacheConfig.enmkey == UtilService.enmCache.payElementType) {
				if (response != null) {
					vm.PaymentType = response.PaymentType;
					vm.Frequency = response.Frequency;
					vm.PaySubElementUnit = response.PaySubElementUnit;
					vm.PaySubElementUnitInActive = response.PaySubElementUnitInActive;
					vm.ThresholdFrequencies = response.ThresholdFrequencies;
				}
			}
		}

		vm.getClassByControlId = function (id) {
			var classes = {};
			var AllowToGroupContractPayElementsBasedOnCostCenter = $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter;
			if ((AllowToGroupContractPayElementsBasedOnCostCenter == true && parseInt(vm.SelectedCostCenterId) == 0)
				|| vm.newSelectedPayElmntModel == null || vm.newSelectedPayElmntModel.length == 0) {
				classes = 'disable-btn';
			}
			return classes;
		}

		//REST: 4.getPayElementDetailsByProvider
		vm.getPayElementDetailsByProvider = function () {
			$timeout(function () { $(".pay-elements-section", $('#' + vm.currentTab.Id)).css('visibility', 'visible'); }, 300);

			vm.imLoading = true;

			//get user info
			var userInfo = UtilService.getCurrentUserInfo();

			//1.prepare model
			var query = {
				roleCode: userInfo.CurrentUserRoleCode,
				contractId: vm.currentTab.ContractId,
				orgCompensationModelId: vm.currentTab.CompensationModelId, //pending:476 ,
				physicianId: vm.physicianContractDetails.PhysicianId,
				fiscalYear: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedYear,
				orgCompModelSpecialtyID: vm.physicianContractDetails.CompModelSpecialtyId,
				departmentId: vm.physicianContractDetails.DeptId
			};

			//2.block UI 
			//var msg = "Validating...";
			//UtilService.blockUIWithText(msg);

			//3. make service call
			provService.getPayElementDetailsByProvider(query).then(onSuccess, onError);

			function onSuccess(response) {
				//4. process response and then unblock ui
				vm.imLoading = false;

				if (response != null) {
					//prepare model for ui 
					vm.preparePayElementModel(response.ContractPayElements == null ? [] : response.ContractPayElements, vm.operationmode.load);
					//save a original copy
					//vm.OrgContractPayElements = angular.copy(vm.ContractPayElements);  
				}
			}

			function onError(jqXHR) {
				$.unblockUI();
				vm.imLoading = false;

				//vm.preparePayElementModel([], vm.operationmode.load);
				//pending displaying error
				//log the exception
				try { $exceptionHandler(jqXHR); } catch (e1) { }
				// or server returns response with an error status.
				//console.log('Err:', JSON.stringify(err));
			}
		}

		vm.validatePayElementModel = function (source) {
			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);

			vm.PayElementErrorMessageList = [];
			vm.PayElementServerErrorMessageList = [];

			var _listCPE = vm.ContractPayElements;
			if (_listCPE != null) {
				for (var i = 0; i < _listCPE.length; i++) {
					var item = _listCPE[i];

					//uniqueRowId  
					item.Control = (item.Control != undefined ? item.Control : vm.getDynamicControlIdConfigBySeqRowId(i));

					//reset server error
					item.IsServerError = false;

					//reset form errors
					vm.resetFormErrors(item);

					//displaycontrols based on selected values
					item = vm.getStyleForEachControl(item);

					//add rowId
					item.RowId = i;

					//Validate only on clicking on Save, renewal, transition and end
					if (!(UtilService.isEqual(provHelper.contractPESource.AmendRenewalPayElements, source)
						|| UtilService.isEqual(provService.contractActionType.Amend, source))) {
						//start validating data

						vm.validateRowByItem(item);

						//var validInfoObj = vm.getValidationStatusofEachRow(item);

						//re-assign modified object with valid/invalid info
						//item = validInfoObj.item;
						//item.IsValidRow = validInfoObj.IsValidRow;

						//if (!item.IsValidRow) {

						//item.ErrorMessage = validInfoObj.ErrorMessage;
						//item.DetailMessage = validInfoObj.DetailMessage;
						//sbError.push(item.ErrorMessage);
						//vm.PayElementErrorMessageList.push(item);
						//list of tab groupIds
						//tabNames.push(item.DeptDesc);
						//}
					}
					_listCPE[i] = item;
				}
			}

			//re-assign the elements
			vm.ContractPayElements = _listCPE;


			//redirect to the first tab on any error 
			var tabNames = [];

			for (var i = 0; i < vm.PayElementErrorMessageList.length; i++) {
				tabNames.push(vm.PayElementErrorMessageList[i].DeptDesc);
			}

			//create tabs dynamically 
			tabNames = UtilService.getUnique(tabNames);

			//redirect to the first tab on any error
			if (tabNames != null && tabNames.length > 0) {
				tabNames.sort();

				var toBeSelectedTabName = null;

				if (tabNames.length > 0) {
					toBeSelectedTabName = tabNames[0];
				}

				for (var i = 0; i < vm.CostCenterTabs.length; i++) {
					//auto redirect/navigate only on entire form validation 
					if (vm.CostCenterTabs[i].Name == toBeSelectedTabName) {
						vm.CostCenterTabs[i].IsActive = true;
					} else {
						vm.CostCenterTabs[i].IsActive = false;
					}
				}
			}



			$timeout(function () { vm.setupdatepickers(); vm.setupAutoCompletion(); }, 100);

			return vm.PayElementErrorMessageList.length > 0 ? false : true;
		}

		vm.navigateAndfocusOnControl = function (det, item) {
			//validate row
			//vm.validateRowByItem(item);

			//navigate to the tab and then focus the control
			for (var i = 0; i < vm.CostCenterTabs.length; i++) {
				//auto redirect/navigate only on entire form validation 
				if (vm.CostCenterTabs[i].Name == item.DeptDesc) {
					vm.CostCenterTabs[i].IsActive = true;
				} else {
					vm.CostCenterTabs[i].IsActive = false;
				}
			}

			//highlight & focus control
			$timeout(function () {
				provHelper.highlightAndfocusOnErrorControl(det, item);
			}, 10);
		}

		vm.displayPayElementErrorMessages = function (item, errarray) {

			var isItemFound = false;
			for (var i = 0; i < errarray.length; i++) {
				if (errarray[i].Control.UniquePERow.id == item.Control.UniquePERow.id) {
					//if no errors then remove it from error array
					if (item.IsValidRow) {
						errarray.splice(i, 1);
					} else {
						errarray[i] = item;
					}
					isItemFound = true;
					break;
				}
			}

			//if it's a invalid row but not in the list
			if (item.IsValidRow == false && !isItemFound) {
				errarray.push(item);
			}


			if (errarray.length > 0) {
				//sort by dept desc and row number
				errarray = errarray.sort((a, b) => a.DeptDesc == b.DeptDesc ? a.RowId - b.RowId : a.DeptDesc - b.DeptDesc);
			}

			return errarray;
			//display error message
			//if (sbError.length > 0) {
			//	var msgobj = {
			//		MessageType: UtilService.MessageType.Validation,
			//		Message: sbError.join("   <br/>")
			//	}

			//	UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.PnlContractPayElementsMessage.id);
			//} else {
			//	//clear all error messages
			//	provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);
			//}
		}

		vm.preparePayElementModel = function (ContractPayElements, source) {
			//var sbError = []; 
			var AllowToGroupContractPayElementsBasedOnCostCenter = $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter;

			var _listCPE = ContractPayElements;

			if (_listCPE != null && _listCPE.length > 0) {
				_listCPE = _listCPE.sort((a, b) => (a.DeptDesc > b.DeptDesc) ? 1 : ((b.DeptDesc > a.DeptDesc) ? -1 : 0));
			}

			if (ContractPayElements != null) {
				for (var i = 0; i < _listCPE.length; i++) {
					var item = _listCPE[i];
					//uniqueRowId 
					//reset uniqueRowIds to avoid any duplicate ids
					//item.status = (item.status != undefined ? item.status : vm.recordstatus.new);
					item.Control = (item.Control != undefined ? item.Control : vm.getDynamicControlIdConfigBySeqRowId(i));
					//item.Control = vm.getDynamicControlIdConfigBySeqRowId(i);

					//reset server error
					item.IsServerError = false;

					//reset form errors
					vm.resetFormErrors(item);


					//fill up master data
					item.PaymentTypeList = vm.PaymentType;
					//PaymentTypeId 
					item.PayFrequencyList = vm.getFrequecyListByPaymentTypeId(item);
					//PayFrequency  

					//select, Rate, Unit
					item.PaySubPayElementUnit = vm.PaySubElementUnit;
					//SubPayElementID

					//select, extra shift 
					item.PaySubElementUnitInActive = vm.PaySubElementUnitInActive;
					//PayUnit

					//select,ThresholdFrequencies
					item.ThresholdFrequencies = vm.ThresholdFrequencies;
					//item.ThresholdFrequencyId =  

					//update the status 
					if (source == vm.operationmode.load) {
						item.status = vm.recordstatus.original;

						//populate prorate values
						//assign orgiginalprorate amount based on source before execute getStyleForEachControl()
						item = vm.setDefaultRateOrAmount(item);
					}
					else {
						//add new pay elements or amend  
						//delete can also have both new and original records, so leave the status as is if it has earlier
						item.status = (item.status != undefined ? item.status : vm.recordstatus.new);
					}

					//IsDeleted:false only on explictly deleted rows
					item.IsDeleted = (item.IsDeleted != undefined ? item.IsDeleted : false);

					//check if textbox value manually changed
					item = vm.isPayElementsDateManuallyChanged(item);

					//displaycontrols based on selected values
					item = vm.getStyleForEachControl(item);

					item.IsValidRow = true;

					item.GroupId = (AllowToGroupContractPayElementsBasedOnCostCenter ? item.DeptId : vm.defaultGroupId);


					_listCPE[i] = item;
				}
			}


			vm.ContractPayElements = _listCPE;

			$timeout(function () {
				sharedService.broadcast_PayElements({ tab: vm.currentTab, source: provHelper.contractPESource.PayElements, ContractPayElements: vm.ContractPayElements });
			}, 800);



			//create tabs dynamically  
			vm.CostCenterTabs = vm.getTabsByDeptDesc(_listCPE, source);

			//load cost centers on load and then select the cost center from the first tab 
			if (source == vm.operationmode.load) {
				var _isCostCenterListLoaded = false;

				var _tab = vm.getActiveCostCenterTab();
				if (AllowToGroupContractPayElementsBasedOnCostCenter == true) {
					//setCostCenterByTabPanelId
					if (_tab != null) {
						vm.loadPanelData(vm.CostCenterTabs[0]);
						_isCostCenterListLoaded = true;
					}
				}

				if (!_isCostCenterListLoaded) {
					//load default cost center id
					var physicianContractDetails = {
						RegionId: vm.physicianContractDetails.RegionId
						, LocationId: vm.physicianContractDetails.LocationId
						, CostCenterId: (vm.physicianContractDetails.CostCenterId == undefined ? vm.physicianContractDetails.DeptId
							: vm.physicianContractDetails.CostCenterId)
					}
					vm.loadCostCentersByRegionAndLocationId(physicianContractDetails);
				}
			}

			$timeout(function () { vm.setupdatepickers(); vm.setupAutoCompletion(); }, 100);


			//display error message
			//if (sbError.length > 0) {
			//	var msgobj = {
			//		MessageType: UtilService.MessageType.Validation,
			//		Message: sbError.join("   <br/>")
			//	}

			//	UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.PnlContractPayElementsMessage.id);
			//} else {
			//	//clear all error messages
			//	provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);
			//}

			//return sbError;
		}

		vm.getActiveCostCenterTab = function () {
			var _tab = null;

			if (vm.CostCenterTabs != null) {
				for (var i = 0; i < vm.CostCenterTabs.length; i++) {
					if (vm.CostCenterTabs[i].IsActive) {
						_tab = vm.CostCenterTabs[i];
						break;
					}
				}
			}

			return _tab;
		}

		//item=vm.isPayElementsDateManuallyChanged(item);
		vm.isPayElementsDateManuallyChanged = function (item) {
			if (item != null && item != undefined) {
				item.StartDtManuallyChanged = true;
				item.EndDtManuallyChanged = true;

				if (item.StartDate == vm.physicianContractDetails.StartDate) {
					item.StartDtManuallyChanged = false;
				}

				if (item.EndDate == vm.physicianContractDetails.EndDate) {
					item.EndDtManuallyChanged = false;
				}
			}
			return item;
		}

		vm.getPreviouslySelectedTabValue = function (_listCPE) {
			var seldeptId = null;
			if (_listCPE != null && _listCPE != undefined) {
				for (var i = 0; i < _listCPE.length; i++) {
					if (_listCPE[i].IsActive) {
						seldeptId = _listCPE[i].DeptId;
						break;
					}
				}
			}
			return seldeptId;
		}

		vm.getTabsByDeptDesc = function (_listCPE, source) {
			var _tabs = [];

			var selTabValue = null;
			if (source == vm.operationmode.load || source == vm.operationmode.delete) {
				selTabValue = vm.getPreviouslySelectedTabValue(vm.CostCenterTabs);
			}
			else {
				//go to the tab on just selected dept id
				selTabValue = parseInt(vm.SelectedCostCenterId);
			}

			//get unique dept description names
			var uniqueDeptList = [];
			const map = new Map();
			for (const item of _listCPE) {
				if (vm.filterData(item) == true)
					if (!map.has(item.DeptId)) {
						map.set(item.DeptId, true);    // set any value to Map
						uniqueDeptList.push({
							DeptId: item.DeptId,
							DeptDesc: (item.DeptDesc != null && item.DeptDesc != "" ? item.DeptDesc : 'No Cost Center')
						});
					}
			}

			//sort cost center by name
			if (uniqueDeptList.length > 0) {
				uniqueDeptList.sort((a, b) => (a.DeptDesc > b.DeptDesc) ? 1 : ((b.DeptDesc > a.DeptDesc) ? -1 : 0));
			}

			var prevSelectedTabfound = false;

			var AllowToGroupContractPayElementsBasedOnCostCenter = $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter;
			for (var i = 0; i < uniqueDeptList.length; i++) {
				_tabs.push({
					Id: 'grpPEByCostCenter' + '-' + UtilService.getGuid() + '-' + uniqueDeptList[i].DeptId
					, Name: uniqueDeptList[i].DeptDesc
					, DeptId: uniqueDeptList[i].DeptId
					, GroupId: (AllowToGroupContractPayElementsBasedOnCostCenter == true ? uniqueDeptList[i].DeptId : vm.defaultGroupId)
				});

				var _isActive = false;

				if (!prevSelectedTabfound) {
					if (selTabValue == null || selTabValue == undefined) {
						if (i == 0) {
							prevSelectedTabfound = true;
							_isActive = true;
						}
					} else if (selTabValue == uniqueDeptList[i].DeptId) {
						prevSelectedTabfound = true;
						_isActive = true;
					}
				}

				//update isactive
				_tabs[i].IsActive = _isActive;
			}

			//if prevSelectedTabfound = false then set display first tab
			if (!prevSelectedTabfound && _tabs.length > 0) {
				_tabs[0].IsActive = true;
			}

			return _tabs;
		}

		vm.setCostCenterByTabPanelId = function (tab) {
			var defaultCCId = tab.DeptId;
			//assign cost center
			var _list = vm.CostCenterMasterList;

			var SelectedCostCenterId = null;
			if (_list != null) {
				for (var i = 0; i < _list.length; i++) {
					if (parseInt(_list[i].id) == parseInt(defaultCCId)) {
						SelectedCostCenterId = _list[i].id;
						break;
					}
				}
			}

			//set default Cost Center when tab id is not found
			if (SelectedCostCenterId != null) {
				vm.SelectedCostCenterId = SelectedCostCenterId + '';
				vm.MultiCostCenter.Model = UtilService.getSelectedDropdownModelByValue(_list, SelectedCostCenterId);
			}
		}


		vm.setPanelById = function (id) {
			var isTabFound = false;
			if (vm.CostCenterTabs != null) {
				for (var i = 0; i < vm.CostCenterTabs.length; i++) {
					if (parseInt(vm.CostCenterTabs[i].DeptId) == parseInt(id)) {
						vm.CostCenterTabs[i].IsActive = true;
						isTabFound = true;
						break;
					}
				}

				if (isTabFound) {
					for (var i = 0; i < vm.CostCenterTabs.length; i++) {
						if (parseInt(vm.CostCenterTabs[i].DeptId) != parseInt(id)) {
							vm.CostCenterTabs[i].IsActive = false;
						}
					}
				}
			}
		}

		vm.loadPanelData = function (tab) {
			for (var i = 0; i < vm.CostCenterTabs.length; i++) {
				if (vm.CostCenterTabs[i].Id == tab.Id) {
					//load/refresh respective  content
					vm.CostCenterTabs[i].IsActive = true;

					var regionId = vm.physicianContractDetails.RegionId;
					var locationId = vm.physicianContractDetails.LocationId;
					var defaultCCId = tab.DeptId + '';
					//load cost center
					$timeout(function () {
						vm.loadCostCentersByLocationId(defaultCCId, regionId, locationId);
						$timeout(function () {
							vm.checkDuplicatePayElements();
						}, 100);
					}, 10);
				}
				else {
					vm.CostCenterTabs[i].IsActive = false;
				}
			}
		}

		vm.getCssStyleByValidDate = function (dateManuallyChanged, ctrl, item) {
			var style = {}
			if (dateManuallyChanged) {
				style = { 'color': '#999' };
				if (ctrl != null && ctrl != undefined && ctrl.IsValid == false) {
					style = { 'color': '#999', 'border-color': 'red' };
				}
			} else {
				if (ctrl != null && ctrl != undefined && ctrl.IsValid == false) {
					style = { 'border-color': 'red' };
				}
			}
			return style;
		}

		vm.validateAllRows = function (item) {
			//check if the errors are from server
			if (!item.IsServerError) {
				//validate entire pay elements 
				vm.validatePayElementModel(provService.contractActionType.Save, item.DeptDesc);
				//if (!item.IsValidRow) {
				//	vm.validationInfo(item);
				//}

				//provHelper.focusOnAllErroControls(item);
			} else {
				//ununsed remove later
				//vm.validationInfo(item);
			}
		}

		vm.validateRowByControl = function (inputctrl) {

			var UniquePERowId = inputctrl.attr('UniquePERowId');
			var _listCPE = vm.ContractPayElements;
			if (_listCPE != null) {
				for (var i = 0; i < _listCPE.length; i++) {

					if (UniquePERowId == _listCPE[i].Control.UniquePERow.id) {
						var item = _listCPE[i];

						//validate row
						vm.validateRowByItem(item);
						break;
					}
				}
			}
		}

		vm.validateRowByItem = function (item) {
			//do not do anything with server errors

			{

				//reset form errors
				vm.resetFormErrors(item);

				//start validating data
				var validInfoObj = vm.getValidationStatusofEachRow(item);

				//re-assign modified object with valid/invalid info
				item = validInfoObj.item;
				item.IsValidRow = validInfoObj.IsValidRow;

				if (!validInfoObj.IsValidRow) {
					item.ErrorMessage = validInfoObj.ErrorMessage;
					item.DetailMessage = validInfoObj.DetailMessage;
					//sbError.push(validInfoObj.ErrorMessage);
					//list of tab groupIds
					//tabNames.push(item.DeptDesc);
				}
			}

			//update pe error messages, 
			var errarray = angular.copy(vm.PayElementErrorMessageList);

			errarray = vm.displayPayElementErrorMessages(item, errarray);

			var tabNames = [];
			for (var i = 0; i < errarray.length; i++) {
				tabNames.push(errarray[i].DeptDesc);
			}

			//get unique tab names
			tabNames = UtilService.getUnique(tabNames);

			//redirect to the first tab on any error
			if (tabNames != null && tabNames.length > 0) {
				//tabNames.sort();

				for (var i = 0; i < vm.CostCenterTabs.length; i++) {
					//append exclamation-triangle warn icon to the tabs
					if ($.inArray(vm.CostCenterTabs[i].Name, tabNames) != -1) {
						vm.CostCenterTabs[i].IsError = true;
					} else {
						vm.CostCenterTabs[i].IsError = false;
					}
				}
			} else {
				//no errors; hence remove warning message
				for (var i = 0; i < vm.CostCenterTabs.length; i++) {
					vm.CostCenterTabs[i].IsError = false;
				}
			}

			//assign error list
			vm.PayElementErrorMessageList = errarray;
		}

		vm.getValidationStatusofEachRow = function (item) {
			var sbError = [];
			var errorControlIds = [];


			var prefixText = "";
			if ($scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter) {
				prefixText = "In " + item.DeptDesc + "- (" + item.PayElementDesc + "), ";
			} else {
				prefixText = "In Row-" + (item.RowId + 1) + " (" + item.PayElementDesc + "), ";
			}

			var customControls = [];
			//start validating data 
			//check validations for active records
			if (item.IsDeleted != true && item.Active || (!item.Active && item.showALLRecords)) {
				if (!UtilService.isValidDate(item.StartDate)) {
					errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
					item.Control.txtContractPaymentStartDate.IsValid = false;
					item.Control.txtContractPaymentStartDate.ErrorMessage = "Please Enter Valid Start Date.";
					sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
				} else {
					//check start date againsit with hire date
					var hireDate = provHelper.isDateGreaterThanHireDate($scope.$parent.ms.PhysicianDetails, item.StartDate);
					if (!hireDate.IsValid) {
						errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
						item.Control.txtContractPaymentStartDate.IsValid = false;
						item.Control.txtContractPaymentStartDate.ErrorMessage = "Provider '" + $scope.$parent.ms.PhysicianDetails.ProviderName + "' Pay Elements " + hireDate.ErrorMessage;
						sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
					}
				}

				//validation for End Date
				if (!UtilService.isValidDate(item.EndDate)) {
					errorControlIds.push(item.Control.txtContractPaymentEndDate.id);
					item.Control.txtContractPaymentEndDate.IsValid = false;
					item.Control.txtContractPaymentEndDate.ErrorMessage = "Please Enter Valid End Date.";
					sbError.push(item.Control.txtContractPaymentEndDate.ErrorMessage);

				}

				//check if start and end dates are valid
				if (UtilService.isValidDate(item.StartDate) && UtilService.isValidDate(item.EndDate)) {
					if (moment(item.StartDate).isSameOrAfter(moment(item.EndDate))) {
						errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
						item.Control.txtContractPaymentStartDate.IsValid = false;
						item.Control.txtContractPaymentStartDate.ErrorMessage = "Please Enter Start Date Less than End Date.";
						sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
					}

					if (moment(item.StartDate).isLeapYear()) {
						if (moment(item.StartDate).add(1, 'year').add(1, 'day').isSameOrBefore(moment(item.EndDate))) {
							errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
							item.Control.txtContractPaymentStartDate.IsValid = false;
							item.Control.txtContractPaymentStartDate.ErrorMessage = "Start Date and End Date Should be within a Year.";
							sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
						}
					}
					else if (moment(item.StartDate).add(1, 'year').isSameOrBefore(moment(item.EndDate))) {
						errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
						item.Control.txtContractPaymentStartDate.IsValid = false;
						item.Control.txtContractPaymentStartDate.ErrorMessage = "Start Date and End Date Should be within a Year.";
						sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
					}

					//start validating contract start & end dates
					var ContStartDt = vm.physicianContractDetails.StartDate;
					var ContEndDt = vm.physicianContractDetails.EndDate;

					if (vm.physicianContractDetails.AllowPayElementsDatesoutsideContractDates == 1) {
						if (UtilService.isValidDate(ContStartDt) && UtilService.isValidDate(ContEndDt)) {
							//contract dates
							var startDate = moment(ContStartDt).subtract(1, 'days');
							var endDate = moment(ContEndDt).add(1, 'days');

							var stDtrange = moment(item.StartDate).isBetween(startDate, endDate);
							var endDtrange = moment(item.EndDate).isBetween(startDate, endDate);

							//one of the (start/end) date should be within master contract date 
							if (stDtrange == false && endDtrange == false) {
								errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
								item.Control.txtContractPaymentStartDate.IsValid = false;
								item.Control.txtContractPaymentStartDate.ErrorMessage = "Start Date or End Date should be within contract start/end Dates.<br/>";
								sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
							}
						}
					} else {
						//if (UtilService.isValidDate(ContStartDt)) {
						//	if (moment(ContStartDt).isAfter(moment(item.StartDate))) {
						//		errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
						//		item.Control.txtContractPaymentStartDate.IsValid = false;
						//		item.Control.txtContractPaymentStartDate.ErrorMessage = "Start Date should be greater than or equal to Contract Start Date.";
						//		sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
						//	}
						//}

						//if (UtilService.isValidDate(ContEndDt)) {
						//	if (moment(item.EndDate).isAfter(moment(ContEndDt))) {
						//		errorControlIds.push(item.Control.txtContractPaymentStartDate.id);
						//		item.Control.txtContractPaymentStartDate.IsValid = false;
						//		item.Control.txtContractPaymentStartDate.ErrorMessage = "End Date should be less than or equal to Contract End Date.<br/>";
						//		sbError.push(item.Control.txtContractPaymentStartDate.ErrorMessage);
						//	}
						//}
					}

				}

				var IsMarkCompleted = (vm.physicianContractDetails.IsMarkCompleted);

				// Validations for Mark Complete Pay Elements.
				if (IsMarkCompleted) {
					if (item.PayFrequency == 0) {
						errorControlIds.push(item.Control.ddlPayFrequency.id);
						item.Control.ddlPayFrequency.IsValid = false;
						item.Control.ddlPayFrequency.ErrorMessage = "Please Select Pay Frequency.";
						sbError.push(item.Control.ddlPayFrequency.ErrorMessage);
					}

					var _amntType = UtilService.getDropdownTextInUpperCaseById(item.PaySubPayElementUnit, item.SubPayElementID);

					if (item.SubPayElementID == 0) {
						errorControlIds.push(item.Control.ddlUnitorPayFrequency.id);
						item.Control.ddlUnitorPayFrequency.IsValid = false;
						item.Control.ddlUnitorPayFrequency.ErrorMessage = "Please Select Amount Type.";
						sbError.push(item.Control.ddlUnitorPayFrequency.ErrorMessage);
					}

					var _isAdjAmountRequired = false;
					if (UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Fixed)) {
						_isAdjAmountRequired = true;
					} else if (UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Variable)
						|| UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Bonus)) {
						if (UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.Rate) || UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.wRVU)) {
							_isAdjAmountRequired = true;
						}
					}

					//check adjamount
					if (item.SubPayElementID > 0 && _isAdjAmountRequired && $('#' + item.Control.txtAdjustedAnnualAmount.id).css('display') != 'none') {
						if (item.AdjustedAnnualAmount == null || item.AdjustedAnnualAmount == 0) {
							errorControlIds.push(item.Control.txtAdjustedAnnualAmount.id);
							item.Control.txtAdjustedAnnualAmount.ErrorMessage = "Please Enter Ann. Amount/Rate/wRVU.";
							item.Control.txtAdjustedAnnualAmount.IsValid = false;
							sbError.push(item.Control.txtAdjustedAnnualAmount.ErrorMessage);
						}
					}

					if (UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.Rate)
						&& $('#' + item.Control.ddlUnitorPayFrequency.id).css('display') != 'none') {
						if (!item.PayUnit > 0) {
							errorControlIds.push(item.Control.ddlsubUnit.id);
							item.Control.ddlsubUnit.IsValid = false;
							item.Control.ddlsubUnit.ErrorMessage = "Please Select Unit.";
							sbError.push(item.Control.ddlsubUnit.ErrorMessage);
						}
					}
				}



				if (item.AdjustedAnnualAmount != null && $('#' + item.Control.txtAdjustedAnnualAmount.id).css('display') != 'none') {
					//var maxlength = parseInt($("#" + item.Control.txtAdjustedAnnualAmount.id).attr('max-length'));
					//var actlength = (item.AdjustedAnnualAmount + '').replace('.', '').length;
					//if (actlength > maxlength) {
					//	errorControlIds.push(item.Control.txtAdjustedAnnualAmount.id);
					//	item.Control.txtAdjustedAnnualAmount.IsValid = false;
					//	item.Control.txtAdjustedAnnualAmount.ErrorMessage = "Ann. Amount length should be less than " + maxlength + ".";
					//	sbError.push(item.Control.txtAdjustedAnnualAmount.ErrorMessage);
					//}
				}

				var _isThresholdAmountOrUnitsFound = false;
				if (item.ThresholdAmount != null && $('#' + item.Control.txtMaxThresholdAmounts.id).css('display') != 'none') {
					if (parseInt(item.ThresholdAmount) > 0) {
						_isThresholdAmountOrUnitsFound = true;
					}
				}

				if (item.ThresholdUnits != null && $('#' + item.Control.txtMaxThresholdUnits.id).css('display') != 'none') {
					if (parseInt(item.ThresholdUnits) > 0) {
						_isThresholdAmountOrUnitsFound = true;
					}
				}

				if (IsMarkCompleted && _isThresholdAmountOrUnitsFound) {
					if (item.ThresholdFrequencyId == 0 && $('#' + item.Control.ddlThresholdFrequency.id).css('display') != 'none') {
						errorControlIds.push(item.Control.ddlThresholdFrequency.id);
						item.Control.ddlThresholdFrequency.IsValid = false;
						item.Control.ddlThresholdFrequency.ErrorMessage = "Please Select a Threshold Frequency.";
						sbError.push(item.Control.ddlThresholdFrequency.ErrorMessage);
					}
				}


				//extra columns configuration
				if (item.CustomColumnConfigurationByPayElement != null) {
					for (var i = 0; i < item.CustomColumnConfigurationByPayElement.length; i++) {
						var col = item.CustomColumnConfigurationByPayElement[i];
						//if (col.PayElementColumnValue != "") {
						if (col.CustomColumnControlCode == "DT") {
							if (col.PayElementColumnValue != null && col.PayElementColumnValue != "" && !moment(col.PayElementColumnValue).isValid()) {
								//sbError.push(col.LookupDetailValue + ", Please Enter Valid Date for " + col.LookupDetailValue); 
								customControls[{ IsValid: false, ErrorMessage: col.LookupDetailValue + ", Please Enter Valid Date for " + col.LookupDetailValue }]
							}

						} else if (col.CustomColumnControlCode == "DD") {
							//the below validation doesn't exist: just ignore
							//if (col.CustomColumnDropDownValueId == 0) {
							//	sbError.push(col.LookupDetailValue + ", Please select a value for " + col.LookupDetailValue);
							//} else if (col.CustomColumnTextBoxValue == null || col.CustomColumnTextBoxValue == "") {
							//	sbError.push(col.LookupDetailValue + ", Please enter value for " + col.LookupDetailValue); 
							//}
							//handled number input, so ignore this check
						} else if (col.CustomColumnControlCode == "NUM") {
							//handled number input, so ignore this check
						}
						//} 
					}
				}
			}



			//assign error controls
			item.ErrorControlIds = errorControlIds;

			//assign all error control id list
			var det = [];
			if (item.Control != undefined) {
				for (var prop in item.Control) {
					if (item.Control[prop].IsValid == false) {
						det.push(item.Control[prop]);
					}
				}
			}

			//add custom control error messages
			if (customControls.length > 0) {
				for (var i = 0; i < customControls.length; i++) {
					det.push(customControls[i]);
				}
			}

			//assign detail
			item.ErrorControlList = det;

			return {
				item: item
				, IsValidRow: sbError.length > 0 ? false : true
				, ErrorMessage: sbError.length > 0 ? prefixText + sbError.join("<br>" + prefixText) : ''
				, DetailMessage: sbError.length > 0 ? sbError.join("<br> ") : ''
			}
		}

		vm.onRateOrAmountUnitChange = function (item) {
			$timeout(function () {
				item.AdjustedAnnualAmount = null;

				//add the below properties just in case if we want to update the default values
				var _amntType = UtilService.getDropdownTextInUpperCaseById(item.PaySubPayElementUnit, item.SubPayElementID);

				var defAmnt = null;
				var defsubelementId = 0;
				var defthUnits = null;
				var defthAmnt = null;
				var defthFrequencyId = 0;

				if (UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.Rate)) {
					defAmnt = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFRateAnnual, null);
					//unit, Threshold units, threshold amnt,THFrequency
					defsubelementId = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFRateSubPayElementID, 0);
					defthUnits = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFRateTHUnits, null);
					defthAmnt = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFRateTHAmount, null);
					defthFrequencyId = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFRateTHFrequency, 0);
				} else if (UtilService.isEqual(_amntType, vm.enmPayElement.UnitorPayFrequency.Amount)) {
					defAmnt = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFAmountAnnual, null);
					//unit, Threshold units, threshold amnt,THFrequency
					defsubelementId = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFAmountSubPayElementID, 0);
					defthUnits = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFAmountTHUnits, null);
					defthAmnt = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFAmountTHAmount, null);
					defthFrequencyId = UtilService.getDefaultValueIfItsNull(item.DefaultUnitorPFAmountTHFrequency, 0);
				}

				item.AdjustedAnnualAmount = defAmnt;
				//unit, Threshold units, threshold amnt,THFrequency 
				item.PayUnit = defsubelementId;
				item.ThresholdUnits = defthUnits;
				item.ThresholdAmount = defthAmnt;
				item.ThresholdFrequencyId = defthFrequencyId;

				//invoke state management method
				vm.getStyleForEachControl(item);

				//validate row
				$timeout(function () { vm.validateRowByItem(item) }, 10);
			}, 10);
		}

		vm.getStyleForEachControl = function (item) {

			//expand collapsble 
			item.expand = vm.expandCollapsibleExtraPayElements;

			item.Control.txtAdjustedAnnualAmount.style = { "display": "none" };
			item.Control.ddlsubUnit.style = { "display": "none" };
			item.Control.txtMaxThresholdUnits.style = { "display": "none" };
			item.Control.txtMaxThresholdAmounts.style = { "display": "none" };
			item.Control.ddlThresholdFrequency.style = { "display": "none" };


			//set SubPayElementID to zero if it's not found
			if (!UtilService.checkIfValuePresentinList(item.PaySubPayElementUnit, item.SubPayElementID)) {
				//not found: set it to 0
				item.SubPayElementID = 0;
			}

			//get tracking only text == item.PayFrequency  
			if (!UtilService.checkIfValuePresentinList(item.PayFrequencyList, item.PayFrequency)) {
				//not found: set it to 0 
				item.PayFrequency = 0;
			}
			var _payfrequencyName = UtilService.getDropdownTextInUpperCaseById(item.PayFrequencyList, item.PayFrequency);


			//updated:get PayUnit name by Id
			if (!UtilService.checkIfValuePresentinList(item.PaySubElementUnitInActive, item.PayUnit)) {
				//not found: set it to 0
				item.PayUnit = 0;
			}
			//updated
			var _amntType = UtilService.getDropdownTextInUpperCaseById(item.PaySubPayElementUnit, item.SubPayElementID);

			if (item.PaymentTypeList != null && item.PaymentTypeList.length > 0 && item.PaySubPayElementUnit != null && item.PaySubPayElementUnit.length > 0) {
				if (UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Fixed)) {
					switch (_amntType) {
						case vm.enmPayElement.UnitorPayFrequency.Rate:
							item.Control.txtAdjustedAnnualAmount.style = { "display": "inline" };
							item.Control.ddlsubUnit.style = { "display": "inline" };
							item.Control.txtMaxThresholdUnits.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
						case vm.enmPayElement.UnitorPayFrequency.Amount:
							item.Control.txtAdjustedAnnualAmount.style = { "display": "inline" };
							item.Control.txtMaxThresholdAmounts.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
						case vm.enmPayElement.UnitorPayFrequency.wRVU:
							item.Control.ddlsubUnit.style = { "display": "inline" };
							item.Control.txtMaxThresholdUnits.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
					}
				}
				else if (UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Variable)) {
					switch (_amntType) {
						case vm.enmPayElement.UnitorPayFrequency.Rate:
							item.Control.txtAdjustedAnnualAmount.style = { "display": "inline" };
							item.Control.ddlsubUnit.style = { "display": "inline" };
							item.Control.txtMaxThresholdUnits.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
						case vm.enmPayElement.UnitorPayFrequency.Amount:
							if (_payfrequencyName == vm.enmPayElement.PayFrequency.TrackingOnly) {
								item.Control.txtAdjustedAnnualAmount.style = { "display": "inline" };
							}
							item.Control.txtMaxThresholdAmounts.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
						case vm.enmPayElement.UnitorPayFrequency.wRVU:
							item.Control.ddlsubUnit.style = { "display": "inline" };
							item.Control.txtMaxThresholdUnits.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
					}
				}
				else if (UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Bonus)) {
					switch (_amntType) {
						case vm.enmPayElement.UnitorPayFrequency.Rate:
							item.Control.txtAdjustedAnnualAmount.style = { "display": "inline" };
							item.Control.ddlsubUnit.style = { "display": "inline" };
							item.Control.txtMaxThresholdUnits.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
						case vm.enmPayElement.UnitorPayFrequency.Amount:
							if (_payfrequencyName == vm.enmPayElement.PayFrequency.TrackingOnly) {
								item.Control.txtAdjustedAnnualAmount.style = { "display": "inline" };
							}
							item.Control.txtMaxThresholdAmounts.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
						case vm.enmPayElement.UnitorPayFrequency.wRVU:
							item.Control.ddlsubUnit.style = { "display": "inline" };
							item.Control.txtMaxThresholdUnits.style = { "display": "inline" };
							item.Control.ddlThresholdFrequency.style = { "display": "inline" };
							break;
					}
				}
			}

			var AllowToGroupContractPayElementsBasedOnCostCenter = $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter;
			if (AllowToGroupContractPayElementsBasedOnCostCenter == false) {
				item.Control.ddlThresholdFrequency.style = { "display": "none" };
			}

			//item.AdjustedAnnualAmount = 256000; 
			var d = parseFloat(item.AdjustedAnnualAmount);

			if (isNaN(d) || item.AdjustedAnnualAmount == "" || item.AdjustedAnnualAmount == null || d == 0) {
				item.AdjustedAnnualAmount = null;
			}

			return item;
		};

		vm.getFrequecyListByPaymentTypeId = function (item) {
			var _dynamicFrequecyList = []

			if (vm.Frequency != null && vm.Frequency.length > 0) {
				for (var x = 0; x < vm.Frequency.length; x++) {
					if (item.PaymentTypeId == vm.Frequency[x].PaymentTypeId) {
						var frequency = vm.Frequency[x];

						//check if text is in in OverageCategory i.e., 4, 8, 12-weeks
						if (UtilService.isEqual(item.PaymentTypeName, vm.enmPayElement.Type.Fixed) && vm.enmPayElement.Category.Overage.Value.indexOf(frequency.label) > -1) {
							if (UtilService.isEqual(item.PayElementCategory, vm.enmPayElement.Category.Overage.Text)) {
								_dynamicFrequecyList.push(frequency);
							}
						} else {
							_dynamicFrequecyList.push(frequency);
						}
					}
				}
			}

			_dynamicFrequecyList.unshift({ id: 0, label: '-Select-', DisplayOrder: 0 });

			_dynamicFrequecyList.sort(function (a, b) {
				return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
			});

			return _dynamicFrequecyList;
		}

		vm.getPaySubElementUnitListBySubPayElementID = function (subPayElementID) {
			var _dynamicPaySubElementUnitinActive = [];
			for (var x = 0; x < vm.PaySubElementUnitInActive.length; x++) {
				if (subPayElementID == vm.PaySubElementUnitInActive[x].UnitCategory || vm.PaySubElementUnitInActive[x].id == 0) {
					_dynamicPaySubElementUnitinActive.push(vm.PaySubElementUnitInActive[x]);
				}
			}
			return _dynamicPaySubElementUnitinActive;
		}

		vm.filterData = function (item) {
			if (item.IsDeleted == true) {
				return false;
			}

			if (vm.showALLRecords == true) {
				return true;
			} else {
				if (item.Active == false) {
					return false;
				}
			}
			return true;
		}

		//show all button
		vm.chkShowAll = function () {
			vm.showALLRecords = !vm.showALLRecords;
			$timeout(function () {
				//refresh tabs
				vm.CostCenterTabs = vm.getTabsByDeptDesc(vm.ContractPayElements, vm.operationmode.load);
			}, 10);
		}

		vm.inactivePayElementRecord = function (item) {
			item.Active = !item.Active;

			$timeout(function () {
				//refresh tabs 
				vm.CostCenterTabs = vm.getTabsByDeptDesc(vm.ContractPayElements, vm.operationmode.load);
			}, 10);
		}

		//toggle root expand/collapsible icon
		vm.toogleExpandAndCloseAll = function () {
			//toggle display
			vm.expandCollapsibleExtraPayElements = !vm.expandCollapsibleExtraPayElements;

			var _listCPE = vm.ContractPayElements;
			if (_listCPE != null) {
				for (var i = 0; i < _listCPE.length; i++) {
					_listCPE[i].expand = vm.expandCollapsibleExtraPayElements;
				}
				vm.ContractPayElements = _listCPE;
			}

			localStorage.setItem("expandCollapsibleExtraPayElements", vm.expandCollapsibleExtraPayElements);
		}

		//toggle expand/collapsible icon on record level
		vm.toggleExpandAndCloseExtraPayElements = function (item) {
			item.expand = !item.expand;
		}

		vm.deletePayElement = function (item) {
			if (confirm('Are you sure you want to delete this payelement?')) {
				//clear all error messages
				provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);

				var _listCPE = vm.ContractPayElements;

				for (var i = 0; i < _listCPE.length; i++) {
					if (_listCPE[i].Control.UniquePERow.id == item.Control.UniquePERow.id) {

						if (_listCPE[i].status == vm.recordstatus.new) {
							//newly added records, need not be deleted from ui
							_listCPE.splice(i, 1);
							//
						} else {
							_listCPE[i].IsDeleted = true;
						}
						break;
					}
				}

				//prepare the model
				vm.preparePayElementModel(_listCPE, vm.operationmode.delete);



				//update tabs
			}
		}

		vm.onError = function (jqXHR) {
			//if user session is invalid then redirect to sessiontimeout page
			provHelper.redirectIfSessionTimeout(jqXHR);

			//unblock the ui
			$timeout(function () { vm.imLoading = false; }, 10);

			//4. unblock ui
			$.unblockUI();
			//5. handle errors in ui 

			provHelper.handleServerError(jqXHR, vm.Control.PnlContractPayElementsMessage.id);
		}

		vm.initializeProvCompFields = function () {
			//init and clear data
			vm.clearFormData();

			$timeout(function () { vm.setupdatepickers(); }, 100);
		}

		vm.clearFormData = function () {
			//get current tab configuration from parent controller
			var _currentTab = $scope.$parent.tab;

			vm.currentTab = _currentTab;
			//field control configuration
			var fieldConfig = {
				SeqProvId: "",
				SeqCompContractId: "",
				PnlAddNewPayElementsMessage: {
					id: "PnlAddNewPayElementsMessage"
				},
				PnlContractPayElementsMessage: {
					id: "PnlContractPayElementsMessage"
				}, btnAddExtraPayElements: { id: "btnAddExtraPayElements" },
				//SearchPayElementId: {
				//	id: "SearchPayElementId",
				//	settings: {
				//		//selectionLimit: 10 
				//	}
				//},
				CostCenter: {
					id: "ddlPECostCenter", hidden: false, disabled: false, settings: {
						checkBoxes: false,
						showUncheckAll: false,
						selectionLimit: 1,
					}
					, defaulttext: { buttonDefaultText: 'Search for Cost Center...' }
				}
			}

			var _prefixId = 'payElements';
			//append id with tabId to make it dynamic
			for (var prop in fieldConfig) {
				if (fieldConfig[prop].id != undefined && fieldConfig[prop].id != "") {
					fieldConfig[prop].id = _prefixId + '_' + fieldConfig[prop].id + '_' + _currentTab.Id;
				}
			}

			//append id with tabId to make display settings unique dynamic 
			//assign controls config
			vm.Control = fieldConfig;
		}

		vm.resetFormErrors = function (item) {
			if (item != null && item != undefined) {
				item.IsValidRow = true;

				//set row validation to true & clear all error messages
				if (item.Control != undefined) {
					for (var prop in item.Control) {
						if (item.Control[prop] != undefined) {
							if (item.Control[prop].IsValid != undefined)
								item.Control[prop].IsValid = true;
							if (item.Control[prop].ErrorMessage != undefined)
								item.Control[prop].ErrorMessage = "";
							if (item.Control[prop].DetailMessage != undefined)
								item.Control[prop].DetailMessage = "";
						}
					}
				}
			}
			return item;
		}

		//rows configuration
		vm.getDynamicControlIdConfigBySeqRowId = function (SeqRowId) {
			var _prefixId = UtilService.getGuid();
			//field control configuration
			var fieldConfig = {
				txtHomeCostCenter: { id: "txtHomeCostCenter", IsValid: true, ErrorMessage: '' },
				lblExpand: { id: "lblExpand" },
				txtContractPaymentStartDate: { id: "txtContractPaymentStartDate", IsValid: true, ErrorMessage: '' },
				txtContractPaymentEndDate: { id: "txtContractPaymentEndDate", IsValid: true, ErrorMessage: '' },
				ddlPayElement: { id: "ddlPayElement", hidden: false, disabled: false },
				lnkPayElementDelete: { id: "lnkPayElementDelete" },
				lblPayElementName: { id: "lblPayElementName" },
				ddlPayElementType: { id: "ddlPayelementType", IsValid: true, ErrorMessage: '' },
				ddlPayFrequency: { id: "ddlPayFrequency", IsValid: true, ErrorMessage: '' },
				ddlUnitorPayFrequency: { id: "ddlUnitorPayFrequency", IsValid: true, ErrorMessage: '' },
				txtAdjustedAnnualAmount: { id: "txtAdjustedAnnualAmount", placeholder: "TBD      ", IsValid: true, ErrorMessage: '' },
				ddlsubUnit: { id: "ddlsubUnit", IsValid: true, ErrorMessage: '' },
				txtMaxThresholdUnits: { id: "txtMaxThresholdUnits", IsValid: true, ErrorMessage: '' },
				txtMaxThresholdAmounts: { id: "txtMaxThresholdAmounts", IsValid: true, ErrorMessage: '' },
				ddlThresholdFrequency: { id: "ddlThresholdFrequencyId", IsValid: true, ErrorMessage: '' },
				txtGLAccountNo: { id: "txtGLAccountNo", IsValid: true, ErrorMessage: '' },

				chkActive: { id: "chkActive", IsValid: true, ErrorMessage: '' },
				SeqRowId: SeqRowId,
				UniquePERow: {
					id: "UniquePERow"
				}
			}


			//append id with tabId to make it dynamic
			for (var prop in fieldConfig) {
				if (fieldConfig[prop].id != undefined && fieldConfig[prop].id != "") {
					fieldConfig[prop].id = _prefixId + '_' + fieldConfig[prop].id + '_' + vm.currentTab.Id;
				}
			}
			return fieldConfig;
		}

		vm.setupdatepickers = function () {
			$('.paydate-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleDatePicker
			}).on("change", handleDatePicker).blur(handleDatePicker)

			$('.contractpe-datepicker', $("#" + vm.currentTab.Id)).datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleDatePicker,
				beforeShow: function (input, inst) {
					if (vm.physicianContractDetails.AllowPayElementsDatesoutsideContractDates == 0) {
						return {
							minDate: vm.physicianContractDetails.StartDate,
							maxDate: vm.physicianContractDetails.EndDate
						};
					}
				}
			}).on("change", handleDatePicker).blur(handleDatePicker)


			function handleDatePicker() {
				var txtId = $(this).attr('id');
				var txtValue = $(this).val();

				if (UtilService.isValidDate(txtValue)) {
					txtValue = moment(txtValue).format('L');
				}

				var _isTextBoxFound = false;

				var _listCPE = vm.ContractPayElements;
				if (_listCPE != null) {
					for (var i = 0; i < _listCPE.length; i++) {
						if (_isTextBoxFound) { break; }

						var item = _listCPE[i];
						//update records only if they were not modified
						if (txtId == item.Control.txtContractPaymentStartDate.id) {
							_isTextBoxFound = true;
							item.StartDate = txtValue;
						}
						else if (txtId == item.Control.txtContractPaymentEndDate.id) {
							_isTextBoxFound = true;
							item.EndDate = txtValue;
						} else {
							//check textbox id in custom columns 
							if (item.CustomColumnConfigurationByPayElement != null) {
								for (var j = 0; j < item.CustomColumnConfigurationByPayElement.length; j++) {
									var col = item.CustomColumnConfigurationByPayElement[j];
									var customcolControlId = item.Control.UniquePERow.id + '_' + col.PayElementColumnConfigID;
									if (txtId == customcolControlId) {
										col.PayElementColumnValue = txtValue;

										//assign custom column date values
										item.CustomColumnConfigurationByPayElement[j] = col;
										_isTextBoxFound = true;
										break;
									}
								}
							}
						}

						//check if textbox value manually changed 
						item = vm.isPayElementsDateManuallyChanged(item);

						//validate row
						if (_isTextBoxFound) {
							vm.validateRowByItem(item);
						}

						//re-assign
						_listCPE[i] = item;
					}

					//clear all error messages
					UtilService.clearNotificationsById(vm.Control.PnlContractPayElementsMessage.id);
				}

				$timeout(function () {
					vm.ContractPayElements = _listCPE;
				}, 10);
			}

			//input
			//$('.paydate-datepicker', $("#" + vm.currentTab.Id)).on("blur", validateForm);

			//$('.pay-elements>input', $("#" + vm.currentTab.Id)).on("blur", validateForm);
			$('input', $('.pay-elements', $("#" + vm.currentTab.Id))).on("blur", validateFormForTextBoxControls);

			//select 
			$('SELECT', $('.pay-elements', $("#" + vm.currentTab.Id))).on("change", validateFormForDropdownControls);

			function validateFormForTextBoxControls() {
				var $ctrlobj = $(this);
				$timeout(function () {
					if ($ctrlobj.attr('class') != undefined && !($ctrlobj.attr('class').indexOf('datepicker') != -1)) {
						vm.validateRowByControl($ctrlobj);
					}
				}, 100);

				//clear error message
				UtilService.clearNotificationsById(vm.Control.PnlContractPayElementsMessage.id);
			}

			function validateFormForDropdownControls() {
				var $ctrlobj = $(this);

				$timeout(function () {
					//ignore ddlUnitorPayFrequency as this has got onchange event already associated
					if ($ctrlobj.attr('id') != undefined && !($ctrlobj.attr('id').indexOf('ddlUnitorPayFrequency') != -1)) {
						vm.validateRowByControl($ctrlobj);
					}
				}, 100);

				//clear error message 
				UtilService.clearNotificationsById(vm.Control.PnlContractPayElementsMessage.id);
			}
		}

		/* auto complete: provider search */
		vm.setupAutoCompletion = function () {
			//set up auto complete  
			var userInfo = UtilService.getCurrentUserInfo();
			$('.autosuggestCustom.WS', $("#" + vm.currentTab.Id)).autocomplete({
				source: function (request, response) {
					if (request.term.length >= 1) {
						var query = {
							searchParams: $.trim(request.term),
							currentRoleName: userInfo.CurrentUserRole
						};

						//clear all error messages
						provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);

						//get the data
						provService.providerSearch(query).then(onSuccess, function errorCallback(err) {
							// called if any error occurs 
							response([{ label: JSON.stringify(err), val: -1 }]);
						});

						function onSuccess(result) {
							//process the response
							if (result == null || result.length == 0 || result.ProviderSearchList == null
								|| result.ProviderSearchList == undefined || result.ProviderSearchList.length == 0) {
								response([{ label: 'No results found.', val: -1 }]);
							}
							else {
								response($.map(result.ProviderSearchList, function (item) {
									return {
										label: item.ProviderName,//item.split('©')[0],
										val: item.ProviderId,//item.split('©')[1],
										providerid: item.ProviderId//item.substring(item.indexOf(item.split('©')[2]))
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
					var $textbox = $(this);
					// remove loading image from search box
					$textbox.attr('title', data.item.label).removeClass("ui-autocomplete-loading");
					var seqcoldata = $textbox.attr('data').split("_");
					var _rank = parseInt(seqcoldata[0]);
					var _phyContractPEConfigValueId = parseInt(seqcoldata[1]);

					var seqAutoSuggestSelPhysicialId = "";

					if (data.item.val == -1) {
						$textbox.focus();
						$timeout(function () {
							$textbox.val("");
						}, 10);

					} else {

						//extract provider Id from label 
						seqAutoSuggestSelPhysicialId = data.item.val;
						var ProviderName = data.item.label;
						//if this is provider search   
						$textbox.val(ProviderName);
					}

					var _listCPE = vm.ContractPayElements;
					for (var i = 0; i < _listCPE.length; i++) {
						if (_listCPE[i].Rank == _rank) {
							if (_listCPE[i].CustomColumnConfigurationByPayElement != null) {
								for (var j = 0; j < _listCPE[i].CustomColumnConfigurationByPayElement.length; j++) {
									if (_listCPE[i].CustomColumnConfigurationByPayElement[j].PhyContractPEConfigValueId == _phyContractPEConfigValueId) {
										_listCPE[i].CustomColumnConfigurationByPayElement[j].CustomColumnDropDownValueId = seqAutoSuggestSelPhysicialId;
										break;
									}
								}
							}
						}
					}
					vm.ContractPayElements = _listCPE;
					$scope.$apply();
					return;
				},
				minLength: 1
			});
		}

		vm.costcenterChanged = function () {
			$timeout(function () {
				if (vm.newSelectedPayElmntModel != null && vm.newSelectedPayElmntModel.length > 0) {
					//clear all notifications
					provHelper.hideAllNotifications();
				}
				vm.checkDuplicatePayElements();
				vm.setPanelById(vm.SelectedCostCenterId);
			}, 10);
		}

		vm.multiSelectPayElementChange = function () {
			if (parseInt(vm.SelectedCostCenterId) > 0) {
				//clear all notifications
				provHelper.hideAllNotifications();
			}
			vm.checkDuplicatePayElements();
		}

		//check duplicate elements before adding
		vm.checkDuplicatePayElements = function () {
			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.PnlAddNewPayElementsMessage.id);

			var _newPayElmntModelList = vm.newSelectedPayElmntModel;
			//var _existingPayElmnts = vm.ContractPayElements; 
			var _newPayElmnts = [];
			for (var i = 0; i < _newPayElmntModelList.length; i++) {
				_newPayElmnts.push(_newPayElmntModelList[i].id);
			}

			//check duplicate elements 
			var sbError = [];

			if (_newPayElmnts.length > 0) {
				var _cpeList = vm.ContractPayElements == null ? [] : vm.ContractPayElements;
				var AllowToGroupContractPayElementsBasedOnCostCenter = $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter;

				for (var y = 0; y < _newPayElmnts.length; y++) {
					for (var x = 0; x < _cpeList.length; x++) {
						if (_cpeList[x].IsDeleted != true && _newPayElmnts[y] == _cpeList[x].OrgCompModelPayelementId && _cpeList[x].IsAllowDuplicatePayelement == false) {
							if (AllowToGroupContractPayElementsBasedOnCostCenter) {
								if (parseInt(_cpeList[x].DeptId) == parseInt(vm.SelectedCostCenterId)) {
									sbError.push(_cpeList[x].PayElementDesc);
									break;
								}
							} else {
								sbError.push(_cpeList[x].PayElementDesc);
								break;
							}
						}
					}
				}

				if (sbError.length > 0) {
					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: 'Selected Pay Element ' + sbError.join(",") + (sbError.length == 0 ? ' is' : ' are') + ' not allowed for Duplication, Please configure in Pay Element Master.'
					}

					if (sbError.length > 1) {
						msgobj.Message = "Selected Pay Elements '" + sbError.join(", ") + "' are"
					} else {
						msgobj.Message = "Selected Pay Element '" + sbError.join() + "' is"
					}
					var suffix = ' not allowed for Duplication, Please configure in Pay Element Master.';
					var prefix = '';

					if (AllowToGroupContractPayElementsBasedOnCostCenter) {
						prefix = "In " + UtilService.getDropdownTextById(vm.CostCenterMasterList, parseInt(vm.SelectedCostCenterId), '') + "- "
					}

					msgobj.Message = prefix + msgobj.Message + suffix;

					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.PnlAddNewPayElementsMessage.id);
				}
			}

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorMessage: sbError.length > 0 ? sbError.join() : ''
				, newPayElmnts: _newPayElmnts
			}
		}

		//REST call AddNewPayElementsToExistingContractPayElements
		vm.btnAddNewPayElements = function () {
			$timeout(function () { vm.addNewPayElements() }, 10);
		}
		vm.addNewPayElements = function () {
			if (($scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter == true && parseInt(vm.SelectedCostCenterId) == 0)
				|| vm.newSelectedPayElmntModel == null || vm.newSelectedPayElmntModel.length == 0) {
				return;
			}

			//clear all error messages
			provHelper.hideAllNotifications();

			//get form status of contract form from vm.btnGetFormStatusOfContractInfo
			vm.contractformstatusInfo = null;

			$('#btnGetContractStatusInfo' + vm.currentTab.Id).click();

			var statusInfo = vm.contractformstatusInfo;

			//do not proceed further if contract form status is invalid
			if (!statusInfo.IsValid) { //scroll to top to focus user on error msg
				$timeout(function () { window.scrollTo({ top: 40, behavior: 'smooth' }); }, 200);
				return;
			}

			//checkDuplicatePayElements based on IsAllowDuplicatePayelement flag
			var status = vm.checkDuplicatePayElements()

			//prevent adding duplicate elements 
			if (status.IsValid == false) { return; }

			var _newPayElmnts = status.newPayElmnts;
			if (_newPayElmnts.length == 0) { return; }

			//1.prepare model 
			//get user info
			var userInfo = UtilService.getCurrentUserInfo();

			var query = {
				startDate: vm.physicianContractDetails.StartDate,
				endDate: vm.physicianContractDetails.EndDate,
				roleCode: userInfo.CurrentUserRoleCode,
				contractId: vm.physicianContractDetails.ContractId,
				orgCompensationModelId: vm.physicianContractDetails.CompensationModelId,
				physicianId: vm.physicianContractDetails.PhysicianId,
				fiscalYear: $scope.$parent.$parent.ms.Prov.MasterContractDetails.SelectedYear,
				orgCompModelSpecialtyID: vm.physicianContractDetails.CompModelSpecialtyId,
				orgCompModelPayelementId: _newPayElmnts.join() //comma seperated 
			};

			if (parseInt(vm.SelectedCostCenterId) > 0) {
				query.departmentId = parseInt(vm.SelectedCostCenterId);
			}


			//2.block UI 
			var msg = "Processing...";
			UtilService.blockUIWithText(msg);



			$timeout(function () {
				//3. make service call
				provService.addNewPayElementsToExistingContractPayElements(query).then(onSuccess, onError);
			}, 100);

			function onSuccess(response) {
				$.unblockUI();

				//pending
				//4.handle response
				if (response.NotificationMessages == null) {
					var contractdata = vm.physicianContractDetails;
					var startDate = contractdata.StartDate;
					var endDate = contractdata.EndDate;

					//append the newly added model  
					var _listCPE = vm.ContractPayElements == null ? [] : vm.ContractPayElements;
					var idx = _listCPE.length;

					for (var i = 0; i < response.NewPayElements.length; i++) {
						var item = response.NewPayElements[i];
						item.status = vm.recordstatus.new;

						//add uniqueRowId and control config
						item.Control = vm.getDynamicControlIdConfigBySeqRowId(idx + i);

						//populate prorate value
						item = vm.setDefaultRateOrAmount(item);

						//update start and end date
						item.StartDate = startDate;
						item.EndDate = endDate

						_listCPE.push(item);
					}

					//prepare the model
					vm.preparePayElementModel(_listCPE, vm.operationmode.add);


					//reset multi drop down selection only when it is successfully added
					vm.newSelectedPayElmntModel = [];

				} else {
					UtilService.manageUserFriendlyNotifications(response, vm.Control.PnlContractPayElementsMessage.id);
				}
			}

			//on error
			function onError(jqXHR) {
				//unblockui
				$.unblockUI();
				vm.imLoading = false;

				provHelper.handleServerError(jqXHR, vm.Control.PnlContractPayElementsMessage.id);
			}

			return;
		}

		vm.getPayElementDataForSaving = function (sourcetype) {
			//clear selected pay elements
			vm.newSelectedPayElmntModel = [];

			var _isValid = true;
			var _ContractPayElements = [];
			var _ContractPayElementCustomColumns = [];
			var _deletedIds = [];

			//clear all error messages
			provHelper.hideAllNotifications(vm.Control.PnlContractPayElementsMessage.id);

			//ex: extension methods  
			if (vm.ContractPayElements != null) {

				//this is where validation happens for the pay elements grid data validate data


				//user actions for sending data to server
				if (UtilService.isEqual(sourcetype, provService.contractActionType.Save)
					|| UtilService.isEqual(sourcetype, provHelper.contractPESource.AmendRenewalPayElements)
					|| UtilService.isEqual(sourcetype, provService.contractActionType.Amend)
					|| UtilService.isEqual(sourcetype, provService.contractActionType.Renewal)
					|| UtilService.isEqual(sourcetype, provService.contractActionType.Transition)
					|| UtilService.isEqual(sourcetype, provService.contractActionType.End)) {
					_isValid = vm.validatePayElementModel(sourcetype);
				}

				//continue preparing model for posting data
				var RowId = 0;
				for (var i = 0; i < vm.ContractPayElements.length; i++) {
					var row = vm.ContractPayElements[i];
					//tbd: for the original deleted records: how is it handled in server? IsDeleted:true has this value 
					//imp:skip if the records added newly but not selected as active 
					if (row.status == vm.recordstatus.original || (row.status == vm.recordstatus.new && row.Active == true)) {

						if (row.IsDeleted) {
							//fill all the deleted payelement Ids and skip adding it them to the model
							_deletedIds.push(row.ContractPaySubElementID);

						} else {
							//increment the id
							RowId = RowId + 1;

							var pemodel = vm.getPayElementModelForSaving(row, RowId, sourcetype);

							//custom fields
							if (UtilService.isEqual(sourcetype, provService.contractActionType.Save)
								|| UtilService.isEqual(sourcetype, provService.contractActionType.Renewal)
								|| UtilService.isEqual(sourcetype, provService.contractActionType.Transition)
								|| UtilService.isEqual(sourcetype, provService.contractActionType.End)) {
								if (row.CustomColumnConfigurationByPayElement != null) {
									for (var j = 0; j < row.CustomColumnConfigurationByPayElement.length; j++) {
										var col = row.CustomColumnConfigurationByPayElement[j];
										_ContractPayElementCustomColumns.push(vm.getCustomColumnConfigurationByPayElementModelForSaving(row, col, RowId, sourcetype));
									}
								}
							}
							else {
								//pay element model is different for other than save
								var _customcoldata = [];
								if (row.CustomColumnConfigurationByPayElement != null) {
									for (var j = 0; j < row.CustomColumnConfigurationByPayElement.length; j++) {
										var col = row.CustomColumnConfigurationByPayElement[j];
										_customcoldata.push(vm.getCustomColumnConfigurationByPayElementModelForSaving(row, col, RowId, sourcetype));
									}
								}
								//assign model
								pemodel.CustomColumnConfigurationByPayElement = _customcoldata.length > 0 ? _customcoldata : null;
							}
							//add the payelement model
							_ContractPayElements.push(pemodel);
						}
					}
				}
			}

			return {
				IsValidPayElementsForm: _isValid,
				ContractPayElements: _ContractPayElements.length > 0 ? _ContractPayElements : null,
				ContractPayElementCustomColumns: _ContractPayElementCustomColumns.length > 0 ? _ContractPayElementCustomColumns : null,
				DeletedPayElementIds: _deletedIds.length > 0 ? _deletedIds.toString() : "",
				ShowAll: vm.showALLRecords// bool
			};
		}

		vm.getPayElementModelForSaving = function (row, RowId, sourcetype) {
			var userInfo = UtilService.getCurrentUserInfo();

			var model = {
				UniquePERowId: row.Control.UniquePERow.id,//local variable
				status: row.status, //local variable for ui
				AllowToGroupContractPayElementsBasedOnCostCenter: $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter,
				//SeqRowId: row.Control.SeqRowId,//local variable
				ContractPaySubElementID: row.ContractPaySubElementID,//3863,
				ContractId: vm.currentTab.ContractId,// 1391,
				OrgCompensationModelId: vm.currentTab.CompensationModelId,//476, int?
				OrgCompModelPayelementId: row.OrgCompModelPayelementId,// 2405,int?
				IsAmended: UtilService.isEqual(row.IsAmended, "TRUE") ? true : false, //false,bool? //to be overridden
				RefContractPaySubElementID: row.RefContractPaySubElementID,//0, int 
				Active: row.Active,//true,bool? //set active to false if it's deleted
				CreatedBy: userInfo.UserID,//row.CreatedBy,//"e82f5a9f-6183-4d97-9b01-0d20e9e95c87",
				//ui fields
				StartDate: row.StartDate,//"1/1/2020 12:00:00 AM",DateTime?
				EndDate: row.EndDate,//"12/31/2020 12:00:00 AM",DateTime?
				PayElementDesc: UtilService.getDefaultValueIfItsNull(row.PayElementDesc, ""),//"string", 
				PaymentTypeId: row.PaymentTypeId,//1,
				PaymentTypeName: UtilService.getDropdownTextById(row.PaymentTypeList, row.PaymentTypeId, ''),
				PayFrequency: row.PayFrequency,//5,
				PayFrequencyName: UtilService.getDropdownTextById(row.PayFrequencyList, row.PayFrequency, ''),//"string", 
				AdjustedAnnualAmount: UtilService.getDefaultValueIfItsNull(row.AdjustedAnnualAmount, 0),//  0 : row.AdjustedAnnualAmount.toFixed(5)),//0.00, modified value 
				OrigProratedAmount: UtilService.getDefaultValueIfItsNull(row.AdjustedAnnualAmount, 0),// row.OrigProratedAmount,//decimal? 
				SubPayElementID: row.SubPayElementID,//1,
				SubElementName: UtilService.getDropdownTextById(row.PaySubPayElementUnit, row.SubPayElementID),//"string"
				PayUnit: row.PayUnit,//0,
				PayUnitName: row.PayUnit > 0 ? UtilService.getDropdownTextById(row.PaySubElementUnitInActive, row.PayUnit, '') : '',
				ThresholdUnits: row.ThresholdUnits,//10,decimal?
				ThresholdAmount: row.ThresholdAmount,//3.0,decimal?
				ThresholdFrequencyId: UtilService.getDefaultValueIfItsNull(row.ThresholdFrequencyId, 0),//int 0 
				GLAccNo: row.GLAccNo,//"456",
				HomeCostCenter: UtilService.getDefaultValueIfItsNull(row.CostCenter, ""),//string, "879" 
				CostCenter: UtilService.getDefaultValueIfItsNull(row.CostCenter, ""),//string, "879" //ammend
				//IsSelected: false,//bool? 
				RowId: RowId,
				DeptId: UtilService.getDefaultValueIfItsNull(row.DeptId, 0),//int
				DeptDesc: UtilService.getDefaultValueIfItsNull(row.DeptDesc, ''),
				StartDtManuallyChanged: UtilService.getDefaultValueIfItsNull(row.StartDtManuallyChanged, false),//bool
				EndDtManuallyChanged: UtilService.getDefaultValueIfItsNull(row.EndDtManuallyChanged, false)//bool
			}

			if ($('#' + row.Control.txtAdjustedAnnualAmount.id).css('display') == 'none') {
				model.AdjustedAnnualAmount = 0;//  0 : row.AdjustedAnnualAmount.toFixed(5)),//0.00, modified value 
				model.OrigProratedAmount = 0;// row.OrigProratedAmount,//decimal? 
			}
			if ($('#' + row.Control.ddlsubUnit.id).css('display') == 'none') {
				model.PayUnit = 0; //int
				model.PayUnitName = ''; //string
			}

			if ($('#' + row.Control.txtMaxThresholdUnits.id).css('display') == 'none') {
				model.ThresholdUnits = null;//10,decimal?
			}

			if ($('#' + row.Control.txtMaxThresholdAmounts.id).css('display') == 'none') {
				model.ThresholdAmount = null;//3.0,decimal? 
			}

			if ($('#' + row.Control.ddlThresholdFrequency.id).css('display') == 'none') {
				model.ThresholdFrequencyId = 0;//10,int
			}

			//renewal
			if (UtilService.isEqual(provService.contractActionType.Renewal, sourcetype)) {
				//*important update is selected to true
				model.IsSelected = true; //bool 
			}

			//for AmendRenewalPayElements, amend
			if (UtilService.isEqual(provHelper.contractPESource.AmendRenewalPayElements, sourcetype)
				|| UtilService.isEqual(provService.contractActionType.Amend, sourcetype)) {
				model.IsExtendOrRenewal = row.IsExtendOrRenewal;
				model.IsAmend = row.IsAmend;
				model.IsAllowDuplicatePayelement = row.IsAllowDuplicatePayelement;
				model.IsShowPayElementNotFullYear = row.IsShowPayElementNotFullYear;
			}

			//below extra data for only for amend
			if (UtilService.isEqual(provService.contractActionType.Amend, sourcetype)) {
				model.IncrementalAmount = UtilService.getDefaultValueIfItsNull(row.IncrementalAmount, 0);//0
				model.MainPayElementId = UtilService.getDefaultValueIfItsNull(row.MainPayElementId, 0);////0  
				model.BaseComp = UtilService.getDefaultValueIfItsNull(row.BaseComp, 0);//0,
				model.BaseCompPayPercentage = UtilService.getDefaultValueIfItsNull(row.BaseCompPayPercentage, 0);//0,
				model.BonusPayYear = UtilService.getDefaultValueIfItsNull(row.BonusPayYear, 0);//  0,
				model.CollectionPayPercentage = UtilService.getDefaultValueIfItsNull(row.CollectionPayPercentage, 0);//0,
				model.CompSpePayElementId = UtilService.getDefaultValueIfItsNull(row.CompSpePayElementId, 0);//0,
				model.IncrementMode = UtilService.getDefaultValueIfItsNull(row.IncrementMode, 0);//0,
				model.IsActiveEditable = UtilService.getDefaultValueIfItsNull(row.IsActiveEditable, false);//false,  
				model.IsCollapseExtraConfigAttrs = UtilService.getDefaultValueIfItsNull(row.IsCollapseExtraConfigAttrs, false);//true 
				model.IsContractChange = UtilService.getDefaultValueIfItsNull(row.IsContractChange, 0);
				model.IsDeletable = UtilService.getDefaultValueIfItsNull(row.IsDeletable, false);//true,
				model.MarketPriceIndexPercentage = UtilService.getDefaultValueIfItsNull(row.MarketPriceIndexPercentage, 0);//  0,
				model.PartAPercentage = UtilService.getDefaultValueIfItsNull(row.PartAPercentage, 0);//0,
				model.PartBPercentage = UtilService.getDefaultValueIfItsNull(row.PartBPercentage, 0);//0, 

				//Pending:Amend & Save request: what is this PayElementId? is it same as SubPayElementID in Save request & also PayRate
				model.PayElementId = UtilService.getDefaultValueIfItsNull(row.PayElementId, 0);//0,  
				model.PayRate = UtilService.getDefaultValueIfItsNull(row.PayRate, 0);//0,
				model.RatePerWRVU = UtilService.getDefaultValueIfItsNull(row.RatePerWRVU, 0);//0, 
				model.ThresholdCollections = UtilService.getDefaultValueIfItsNull(row.ThresholdCollections, 0);//0,
				model.ThresholdWRVUs = UtilService.getDefaultValueIfItsNull(row.ThresholdWRVUs, 0);//0,
				model.WRVUPayPercentage = UtilService.getDefaultValueIfItsNull(row.WRVUPayPercentage, 0);//0,
				model.YearlyIncrementPercentage = UtilService.getDefaultValueIfItsNull(row.YearlyIncrementPercentage, 0);//0
			}
			return model;
		}

		vm.getCustomColumnConfigurationByPayElementModelForSaving = function (row, col, RowId, sourcetype) {
			//extra column configuration
			var _PayElementColumnValue = "";
			if (col.CustomColumnControlCode == "DD") {
				//for dropdowns
				if (col.CustomColumnTextBoxValue != null) {
					_PayElementColumnValue = col.CustomColumnDropDownValueId + ',' + col.CustomColumnTextBoxValue;
				} else {
					_PayElementColumnValue = UtilService.getDefaultValueIfItsNull(col.CustomColumnDropDownValueId, '0');
				}

				//clear textbox value if it's dropdown value is not selected
				if (col.CustomColumnTextBoxValue != null && parseInt(col.CustomColumnDropDownValueId) == 0) {
					_PayElementColumnValue = "0"
					col.CustomColumnTextBoxValue = "";
				}
			} else {
				_PayElementColumnValue = col.PayElementColumnValue;
			}

			var model = {
				UniquePERowId: row.Control.UniquePERow.id,//local variable
				status: row.status, //local variable for ui
				AllowToGroupContractPayElementsBasedOnCostCenter: $scope.$parent.ms.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter,
				SeqRowId: row.Control.SeqRowId,//local variable
				ContractPaySubElementID: row.ContractPaySubElementID,// 3863,int?   
				ContractId: vm.currentTab.ContractId,//1391,int? 
				DeptId: UtilService.getDefaultValueIfItsNull(row.DeptId, 0),//int
				PhysicianId: vm.physicianContractDetails.PhysicianId,// 1235,int? 
				PayElementColumnConfigID: col.PayElementColumnConfigID,// 257,int?  
				PayElementColumnValue: UtilService.getDefaultValueIfItsNull(_PayElementColumnValue, ""),//'221,test',string //DD, 
				CustomColumnDropDownValueId: UtilService.getDefaultValueIfItsNull(col.CustomColumnDropDownValueId, 0),//int
				CustomColumnTextBoxValue: UtilService.getDefaultValueIfItsNull(col.CustomColumnTextBoxValue, ''),//string
				PhyContractPEConfigValueId: col.PhyContractPEConfigValueId,// 1011,int?  
				RefPhyContractPEConfigValueId: col.RefPhyContractPEConfigValueId,// 0,int? 
				OneTimeFixedPayElementRenewal: col.OneTimeFixedPayElementRenewal,// 0, int 
				CustomColumnControlCode: UtilService.getDefaultValueIfItsNull(col.CustomColumnControlCode, ""),// null, string
				LookupDetailValue: UtilService.getDefaultValueIfItsNull(col.LookupDetailValue, ""),// null,string
				LookupDetailCode: UtilService.getDefaultValueIfItsNull(col.LookupDetailCode, ""),// null, string
				RowId: RowId // 1 int
			}

			if (UtilService.isEqual(provService.contractActionType.Amend, sourcetype)) {
				model.CustomColumnDropDownValues = col.CustomColumnDropDownValues;
			}

			return model;
		}

		vm.onPageLoad = function () {
			//initialize field configuration
			vm.initializeProvCompFields();
		}

		//send this pemodel to populate pay elemnts based on Amend/Renewal for which validation is not required  
		vm.getPayElementDataByActionType = function (actionType) {
			var data = {};
			data.tab = vm.currentTab;
			data.source = actionType;

			if (actionType == provHelper.contractPESource.AmendRenewalPayElements) {
				//for Renewal, Amend 
				data.model = vm.getPayElementDataForSaving(actionType);

			} else if (actionType == provService.contractActionType.Save) {
				data.model = vm.getPayElementDataForSaving(actionType);
			} else {
				//Renewal,Transition,End  
				data.model = vm.getPayElementDataForSaving(actionType);
			}

			//pass data to contract controller  
			sharedService.broadcastPayElementEventInProvContractControl(data);
		}


		$scope.$on('broadcastClearFormErrors', function () {
			//clear error messages if any 
			vm.PayElementErrorMessageList = [];
			vm.PayElementServerErrorMessageList = [];

			var _listCPE = vm.ContractPayElements;

			if (_listCPE != null && _listCPE.length > 0) {

				for (var j = 0; j < _listCPE.length; j++) {
					var item = _listCPE[j];
					//_listCPE[j].IsValidRow = true;
					//reset server error
					_listCPE[j].IsServerError = false;

					//reset form errors
					vm.resetFormErrors(item);

					_listCPE[j] = item;
					//_listCPE[j].ErrorMessage = "";
					//_listCPE[j].DetailMessage = "";
				}

				//re-assign
				vm.ContractPayElements = _listCPE;

				if (vm.CostCenterTabs != null && vm.CostCenterTabs.length > 0) {
					for (var i = 0; i < vm.CostCenterTabs.length; i++) {
						vm.CostCenterTabs[i].IsError = false;
					}
				}

				//inform main tab
				var _isInvalidTabData = false;
				$scope.$parent.ms.updateCurrentTabValidationStatus(vm.currentTab.Id, _isInvalidTabData);
			}
		});


		$scope.$on('broadcastHandleResponseChildControl', function () {
			var response = sharedService.getbroadcastdata();

			if (response.response != undefined) { response = response.response; }
			//display error message
			//cpe.Control.PnlContractPayElementsMessage.id
			if (response != null && response.TabId != null && response.TabId == vm.currentTab.Id) {
				var msgobj = {
					MessageType: response.MessageType,
					Message: response.ContractPayElementsMessage
				}

				if (response.MessageType == UtilService.MessageType.Success) {
					//success reload data
					//reload content
					vm.imLoading = true;
					vm.refreshEntirePayElementsSection();
				}
				else {

					//update tab validation status
					var _isInvalidTabData = true;
					$scope.$parent.ms.updateCurrentTabValidationStatus(vm.currentTab.Id, _isInvalidTabData);

					//pay element error message
					if (msgobj.Message != null) {
						try {


							var lines = msgobj.Message.split('<br/>');
							var _arr = [];

							jQuery.each(lines, function (k, v) {
								var row = v.split('|');
								if (row != undefined && row.length > 1) {
									_arr.push({ id: row[0], desc: row[1], order: k });
								} else if (row.length == 1 && row[0] != "") {
									_arr.push({ id: null, desc: row[0], order: k });
								}
							});

							if (_arr.length > 0) {
								var tabNames = [];
								var _msgs = [];
								var _prefix = 'PERowId:';

								var _listCPE = vm.ContractPayElements;

								//update error messages
								vm.PayElementServerErrorMessageList = [];

								for (var i = 0; i < _arr.length; i++) {
									var _rowerrmsg = _arr[i].desc.split(',');
									var _rowerrdetailmsg = '';
									if (_rowerrmsg != undefined && _rowerrmsg.length > 1) {
										_rowerrdetailmsg = _rowerrmsg[1];
									} else if (_rowerrmsg.length == 1 && _rowerrmsg[0] != "") {
										_rowerrdetailmsg = _rowerrmsg[0];
									}

									_msgs.push(_arr[i].desc);
									var rowid = _arr[i].id.replace(_prefix, '');


									for (var j = 0; j < _listCPE.length; j++) {
										var item = _listCPE[j];
										if (item.Control.UniquePERow.id == rowid) {
											item.IsValidRow = false;
											item.IsServerError = true;

											item.ErrorMessage = _rowerrdetailmsg;
											item.DetailMessage = _rowerrdetailmsg;



											//update pe error messages, 
											var errarray = angular.copy(vm.PayElementServerErrorMessageList);
											vm.displayPayElementErrorMessages(item, errarray);
											vm.PayElementServerErrorMessageList = angular.copy(errarray);
											//list of tab groupIds
											tabNames.push(item.DeptDesc);
											break;
										}
									}
								}

								//redirect to the first tab on any error
								if (tabNames != null && tabNames.length > 0) {
									tabNames.sort();
									var firstTabName = '';
									//.IsError
									if (tabNames.length > 0) {
										firstTabName = tabNames[0];
									}

									for (var i = 0; i < vm.CostCenterTabs.length; i++) {
										if (vm.CostCenterTabs[i].Name == firstTabName) {
											vm.CostCenterTabs[i].IsActive = true;
										} else {
											vm.CostCenterTabs[i].IsActive = false;
										}

										//display exclamation-triangle 
										if ($.inArray(vm.CostCenterTabs[i].Name, tabNames) != -1) {
											vm.CostCenterTabs[i].IsError = false;
										} else {
											vm.CostCenterTabs[i].IsError = false;
										}
									}
								}

								//re assign updated list
								$timeout(function () { vm.ContractPayElements = _listCPE; }, 10);
								msgobj.Message = _msgs.join(" <br />");
							}
						} catch (e) { }

						//UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.PnlContractPayElementsMessage.id);
					}
				}

			}
		});

		//onPageLoad
		$(document).ready(function () {

			vm.onPageLoad();
		});
	});
})(); 