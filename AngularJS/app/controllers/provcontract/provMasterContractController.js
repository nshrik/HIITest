//parent controller
//var app = angular.module('ngApp', []);
"use strict";
(function () {
	app.controller('provMasterContractController', function ($scope, $exceptionHandler, authService, provHelper, UtilService, provService, sharedService, ngAuthSettings, focus, localStorageService, $timeout) {
		var vm = this;
		vm.dateformat = 'MM/DD/YYYY';
		//multi select drop-down settings
		vm.MultiComplModel = {
			settings: {
				//selectionLimit: 10
			}
		}

		vm.getOtherPageParamsModel = function () {
			return {
				SelectedMasterContractId: null,
				CompModelID: null,
				DeptID: null,
				SpecialtyID: null
			}
		}

		vm.clearEntireForm = function () {
			//clear all error messages
			provHelper.hideAllNotifications();
			vm.IsProviderDetailsVisible = false;
			vm.Prov.MasterContractDetails.SelectedMasterContractId = 0;

			$("input[name$='hdnPhysicianId']").val('');
			$("input[name$='hdnOtherPageParams']").val('')
			$timeout(function () { focus(vm.Control.ProvSearch.id); }, 200);
		}

		vm.initializeProviderMasterContractFields = function () {

			/* recent searches */
			vm.recentSearchList = [];

			//current page, user info
			vm.hdnCurrent = {
				PhysicianId: ""
			};

			//current user roles list for debug purpose
			vm.CurrentUserRoles = UtilService.getUserRolesList();

			//to be moved contract controller 
			vm.PhysicianContractTabs = [];

			vm.tabstatus = { new: "new", original: "original" }
			vm.operationmode = { load: "load", add: "add", edit: "edit", view: "view", delete: 'delete' }

			vm.IsProviderDetailsVisible = false;

			//init and clear data
			vm.initializeControls();
			vm.ProvOriginal = {}

			//visible save button
			$timeout(function () {
				$(".master-savebuttons-section").css('visibility', 'visible');
			}, 800);

			//load regions
			vm.loadRegionMasterList();

			$timeout(function () { vm.setupDatePickers(); vm.setupPopUpDialog(); }, 100);

		}

		/* auto complete: provider search */
		vm.setupAutoCompletion = function () {
			var userInfo = UtilService.getCurrentUserInfo();

			//set up auto complete
			$(".autosuggest").autocomplete({
				source: function (request, response) {
					if (request.term.length >= 1) {
						var query = {
							searchParams: $.trim(request.term),
							currentRoleName: userInfo.CurrentUserRole
						};

						//clear all error messages
						provHelper.hideAllNotifications();
						//get the data
						provService.providerSearch(query).then(providerSearchCallback, function errorCallback(err) {
							err = 'No results found.';
							// called if any error occurs 
							response([{ label: JSON.stringify(err), val: -1 }]);
						});

						function providerSearchCallback(result) {
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

					// remove loading image from search box
					$(this).attr('title', data.item.label).removeClass("ui-autocomplete-loading");

					if (data.item.val == -1) {
						$(this).focus();
						return;
					}

					//if this is provider search 
					if ($(this).attr("id") == vm.Control.ProvSearch.id || $(this).attr("name") == vm.Control.ProvSearch.id) {
						// capture provider Id and reset textbox title
						var PhysicianID = data.item.val;
						var ProviderName = data.item.label;

						//extract prov name from Name+[payrollID]
						var provName = ProviderName.substr(0, ProviderName.indexOf('['));

						//extract provider Id from label 

						$('input[name="' + $(this).attr("id") + '"]').val(ProviderName);

						//save the search list   
						vm.manageRecentSearchList(PhysicianID, ProviderName);

						//reloadEntireProviderData
						vm.reloadEntireProviderData(PhysicianID, provName);
					}
				},
				minLength: 1
			});
		}

		vm.reloadEntireProviderData = function (PhysicianID, provName) {
			//remove other page parameters
			vm.OtherPageParams = vm.getOtherPageParamsModel();

			vm.getMasterContractDetails(PhysicianID, provName);
		}

		vm.initializeControls = function () {
			//pending
			var fieldConfig = {
				PhysicianID: "", Id: "",
				pnlMasterContractValidationMessage: { id: "pnlMasterContractValidationMessage" },
				ProvSearch: { id: "txtProviderName", value: "", hidden: false, disabled: false },
				MasterContract: { id: "ddlMasterContract", list: [], selvalue: "", hidden: false, disabled: false, class: "" },
				btnAddMasterContract: { id: "btnAddMasterContract" },
				btnAddCompModel: { id: "btnAddCompModel" },
				FiscalYear: { id: "ddlFiscalYear", list: [], selvalue: "", hidden: false, disabled: false, class: "" },
				popupLinkCompModel: { id: "popupLinkCompModel" },
				pnlValidationCompModel: { id: "pnlValidationCompModel" },
				ddlMasterRegion: { id: "ddlMasterRegion" },
				CompModel: {
					id: "ddlCompensationModels", list: [], selvalue: "", hidden: false, disabled: false
					, selectAllModel: []
				},
				IsMasterContractActive: { id: "CheckBoxActive", value: false, hidden: false, disabled: false },
				MasterContractStartDate: { id: "txtMasterContractStartDate", value: "", hidden: false, disabled: false },
				MasterContractEndDate: { id: "txtMasterContractEndDate", value: "", hidden: false, disabled: false },
				TerminationDate: { id: "txtTerminationDate", value: "", hidden: false, disabled: false },
				ProviderFTE: { id: "txtProviderFTE", value: "", hidden: false, disabled: false, maxlength: 3 },
				TermNoticeDays: { id: "txtTermNoticeDays", value: "", hidden: false, disabled: false, maxlength: 3 },
				GuaranteedEndDate: { id: "txtGuaranteedEndDate", value: "", hidden: false, disabled: false },
				IsEverGreenContract: { id: "chkEverGreenContract", value: false, hidden: false, disabled: false },
				AutoRenewTerm: { id: "ddlAutoRenewTerm", list: [], selvalue: "", hidden: false, disabled: false },
				NoPenalityNoticeDays: { id: "txtNoPenalityNoticeDays", value: "", hidden: false, disabled: false, maxlength: 3 },
				PositionDesc: { id: "", value: "", hidden: false, disabled: false },
				PayrollID: { id: "", value: "", hidden: false, disabled: false },
				pnlUploadDisplayMsg: { id: "pnlUploadDisplayMsg" },
				fuDocument: { id: "fuDocument" },
				txtFileDescription: { id: "txtFileDescription" }
			}

			var _prefixId = 'MasterContract';
			//append id with tabId to make it dynamic
			for (var prop in fieldConfig) {
				if (fieldConfig[prop].id != undefined && fieldConfig[prop].id != "") {
					fieldConfig[prop].id = _prefixId + '_' + fieldConfig[prop].id;
				}
			}
			vm.Control = fieldConfig;
		}

		vm.addNewMasterContract = function () {
			if (confirm('Are you sure, you want to create new Master contract?')) {
				//clear documents if any
				$("#" + vm.Control.fuDocument.id).val(null);

				//clear all error messages
				provHelper.hideAllNotifications();

				vm.PhysicianContractTabs = [];

				//master contract details
				vm.resetMasterContractModel();

				vm.populateCurrentYearsBasedOnStartAndEndDates();

				$timeout(function () {
					focus(vm.Control.MasterContractStartDate.id);
				}, 800);

			}
		}

		vm.resetMasterContractModel = function () {
			vm.Prov.MasterContractDetails = {
				SelectedMasterContractId: 0,//local variable
				SelectedYear: 0,//local variable
				MasterContractID: 0,
				MasterContractStartDate: null,
				MasterContractEndDate: null,
				IsEvergreenPhysician: true,
				NoPenalityNoticeDays: null,
				TerminationNoticeDays: null,
				IsActive: true,
				AutoRenewTermId: 0,
				MaxCompensationAmount: null,
				GuaranteedEndDate: null,
				PhysicianFTE: 0.0,
				ContractExhibitDocuments: null
			}
		}

		vm.populateCurrentYearsBasedOnStartAndEndDates = function () {
			if (vm.Prov.MasterContractDetails.SelectedMasterContractId == 0) {
				var _yearsList = null;
				var _selYear = 0;

				var strtdate = vm.Prov.MasterContractDetails.MasterContractStartDate;
				var enddate = vm.Prov.MasterContractDetails.MasterContractEndDate;

				if (UtilService.isValidDate(strtdate) && UtilService.isValidDate(enddate)) {


					var start = moment(strtdate, "MM/DD/YYYY");
					var end = moment(enddate, "MM/DD/YYYY");

					var yearsDiff = moment(end).year() - moment(start).year();
					var listOfYears = [];

					_yearsList = [];
					for (var i = 0; i < yearsDiff + 1; i++) {
						listOfYears.push(moment(start).year() + i);
						_yearsList.push({ id: moment(start).year() + i, label: (moment(start).year() + i) + '', IsSelected: false });
					}

					//set the nearest fiscal year if it's not within the list
					var currentyear = moment().year();


					if (listOfYears.length > 0) {
						if (listOfYears.length > 1) {
							if ($.inArray(currentyear, listOfYears) > -1) {
								_selYear = currentyear;
							} else {
								if (currentyear > listOfYears[listOfYears.length - 1]) {
									_selYear = listOfYears[listOfYears.length - 1];
								} else {
									_selYear = listOfYears[0];
								}
							}
						} else {
							_selYear = listOfYears[0];
						}
					}
				}

				$timeout(function () {
					vm.Prov.Year = _yearsList;
					vm.Prov.MasterContractDetails.SelectedYear = _selYear;
				}, 10)
			}
		}

		//REST call ContractDetailsByAddingCompModel
		vm.addNewCompModelTab = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			var _newCompModelList = vm.newSelectedCompensationModel;
			var _existingCompTabs = vm.PhysicianContractTabs;

			var _newCompModels = [];
			//add a new tab, check existing tab  
			for (var i = 0; i < _newCompModelList.length; i++) {
				var _isItemFound = false;
				if (_existingCompTabs.length > 0) {
					for (var j = 0; j < _existingCompTabs.length; j++) {
						if (_newCompModelList[i].id == _existingCompTabs[j].CompensationModelId) {
							//tab found
							_isItemFound = true;
							//check if selected tab already exists
							if (_existingCompTabs[j].Status == vm.tabstatus.original) {
								//alert('To be worked in detail when existing compensation model is added:' + _newCompModelList[i].label);
								_newCompModels.push(_newCompModelList[i].id);
							}
							else if (_existingCompTabs[j].Status == vm.tabstatus.new) {
								//just ignore
							}
							break;
						}
					}

					//add 
					if (!_isItemFound) {
						//need to pass compensation model Id something like this '472|#|1286'
						_newCompModels.push(_newCompModelList[i].id);
					}
				}
				else {
					_newCompModels.push(_newCompModelList[i].id);
				}
			}

			if (_newCompModels.length == 0) { return; }



			var userInfo = UtilService.getCurrentUserInfo();
			//1.prepare model
			var query = {
				providerId: vm.PhysicianDetails.PhysicianID
				, masterContractID: vm.Prov.MasterContractDetails.SelectedMasterContractId
				, year: vm.Prov.MasterContractDetails.SelectedYear
				, compensationModels: _newCompModels.join() //comma seperated
				, currentRoleID: userInfo.CurrentRoleID
				, currentRoleName: userInfo.CurrentUserRole
				//, isShowOriginal
				//, loadPreview 
			};

			//2.block UI 
			//var msg = "Validating...";
			UtilService.blockUI();

			$timeout(function () { vm.imCompModelLoading = true; $scope.$apply(); }, 10);

			//3. make service call 
			$timeout(function () { provService.contractDetailsByAddingCompModel(query).then(onSuccess, onError); }, 100);

			function onSuccess(response) {
				vm.imCompModelLoading = false;

				//4.handle response
				if (response.NotificationMessages == null) {

					//var _isTabsExistingBefore = (vm.PhysicianContractTabs.length > 0 ? true : false);

					//update ConCurrencyModifiedDate to current datetime 
					if (response != undefined) {
						response.Prov = vm.Prov;

						if (response.physicianContractDetails != null) {
							for (var i = 0; i < response.physicianContractDetails.length; i++) {
								response.physicianContractDetails[i].ConCurrencyModifiedDate = moment().format("YYYY-MM-DDTHH:mm:ss.ss");
							}
						}
					}

					//fill the list of tabs from the response
					var _listOfSelTabs = vm.getTabsConfigFromServerResonse(response);

					//get tabs
					var _newCompTabs = vm.getCompTabs(_listOfSelTabs);

					//send it to server
					for (var i = 0; i < _newCompTabs.length; i++) {
						//********** imp imp imp. we're going to make asynchronous calls, hence set IsDataLoaded= true not load data again for this tab
						vm.PhysicianContractTabs.push(_newCompTabs[i]);
					}

					//********** imp imp imp. uncomment below code to load data asynchronously
					//if you're removing below code then remove above code IsDataLoaded =true as well  
					$timeout(function () {
						//select and load the first new tab content by default
						if (_newCompTabs.length > 0)
							vm.loadPanelData(_newCompTabs[0]);

						//for (var i = 0; i < _newCompTabs.length; i++) {
						//	loadDataAysnchronously(_newCompTabs[i]);
						//}

						//function loadDataAysnchronously(tab) {
						//	$timeout(function () {
						//		vm.loadPanelData(tab);
						//		//vm.loadPhysicianContract(tab, tab.Value);
						//	}, 10);
						//} 
					}, 100);

					$.unblockUI();

					//reset multi drop down selection only when it is successfully added
					vm.newSelectedCompensationModel = [];

					//close popup
					vm.closePopup(vm.Control.popupLinkCompModel.id)

				} else {
					$.unblockUI();
					UtilService.manageUserFriendlyNotifications(response, vm.Control.pnlValidationCompModel.id);
				}
			}

			function onError(jqXHR) {
				//4. unblock ui
				$.unblockUI();
				vm.imCompModelLoading = false;
				//5. handle errors in ui  
				provHelper.handleServerError(jqXHR, vm.Control.pnlValidationCompModel.id);
			}
		}
		vm.goBack = function () {
			window.location.href = 'PhysicianContractMasterDetails.aspx';
		}

		vm.forceRefresh = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			vm.refreshButton();
		}

		vm.refreshButton = function () {
			try {
				//clear documents if any
				$("#" + vm.Control.fuDocument.id).val(null);

				//1.block UI
				UtilService.blockUIWithText("Please wait while processing your request...");

				//UtilService.blockUI();

				//vm.getMasterContractDetails(vm.PhysicianDetails.PhysicianID, vm.PhysicianDetails.ProviderName);

				//select master contract id and reset year
				//vm.Prov.MasterContractDetails.SelectedMasterContractId = masterContrId;
				//vm.Prov.MasterContractDetails.SelectedYear = 0;

				$timeout(function () { vm.reloadMasterContractDetailsById(); }, 10);

				//vm.onFiscalYearChange(vm.Prov.MasterContractDetails.SelectedYear);
				//vm.getMasterContractDetailsById(vm.Prov.MasterContractDetails.SelectedMasterContractId);
			} catch (e) {
				$.unblockUI();
			}
		}

		vm.onFiscalYearChange = function (_selYr) {
			//clear all error messages
			provHelper.hideAllNotifications();

			if (!parseInt(vm.Prov.MasterContractDetails.SelectedMasterContractId) > 0) {
				vm.Prov.MasterContractDetails.SelectedYear = _selYr;
			} else {

				//1.block UI
				UtilService.blockUIWithText("Please wait while processing your request...");

				//refresh comp models list and then load it's content
				//REST call:construct tabs dynamically and load first selected comp contract details
				vm.PhysicianContractTabs = [];
				//$timeout(function () {
				//	$scope.$apply();
				//}, 10);

				$timeout(function () {
					vm.Prov.MasterContractDetails.SelectedYear = _selYr;
					vm.loadPhysicianContract();
				}, 10);
			}

			return false;
		}

		vm.PhysicianDetails = {};
		//REST call getMasterContractDetails
		vm.getMasterContractDetails = function (PhysicianID, ProviderName) {
			//clear all error messages
			provHelper.hideAllNotifications();


			//blockUI
			//$timeout(function () {
			vm.IsProviderDetailsVisible = true;
			vm.PhysicianContractTabs = [];
			vm.masterContractimLoading = true;
			//$scope.$apply();
			//}, 50);

			var userInfo = UtilService.getCurrentUserInfo();

			//1.prepare model
			var query = {
				roleCode: userInfo.CurrentUserRoleCode,
				roleName: userInfo.CurrentUserRole,
				roleId: userInfo.CurrentRoleID,
				physicianId: PhysicianID
			};

			//add other page query string params 

			if (vm.OtherPageParams != null && vm.OtherPageParams != undefined && vm.OtherPageParams.SelectedMasterContractId != null && parseInt(vm.OtherPageParams.SelectedMasterContractId) > 0) {
				query.masterContractId = vm.OtherPageParams.SelectedMasterContractId;
				query.compModelId = vm.OtherPageParams.CompModelID;
				query.departMentId = vm.OtherPageParams.DeptID;
				query.specialtyId = vm.OtherPageParams.SpecialtyID;
			} else {
				vm.OtherPageParams = vm.getOtherPageParamsModel();
			}

			$timeout(function () {
				//2.block UI
				//var msg = (ProviderName != null && ProviderName != undefined) ? ProviderName : "please wait while loading...";
				//UtilService.blockUI();
				UtilService.blockUIWithText("Please wait while processing your request...");


				//3. make service call
				provService.getMasterContractDetails(query).then(masterContractDetailsSuccessCallback, vm.onError);

				function masterContractDetailsSuccessCallback(provobj) {
					//4. unblock ui
					//$.unblockUI();

					try {
						//5. process the response    
						if (provobj != null && provobj.PhysicianDetails != null) {
							vm.masterContractimLoading = false;
							//display provider details section
							vm.IsProviderDetailsVisible = true;

							//assign the provider model
							vm.Prov = provobj;

							vm.PhysicianDetails = vm.Prov.PhysicianDetails[0];

							//set alow to Group Contract PayElements Based On CostCenter, this value is being set from parent controller 
							if (vm.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter == undefined) {
								vm.PhysicianDetails.AllowToGroupContractPayElementsBasedOnCostCenter = false;
							}

							//Check Termination Date
							vm.PhysicianDetails.IsTerminated = false;
							vm.PhysicianDetails.TerminationDateVisible = false;
							if (vm.PhysicianDetails.TerminationDate != null) {
								//check if terminate date is greater than current date 
								if (moment().isAfter(vm.PhysicianDetails.TerminationDate)) {
									vm.PhysicianDetails.IsTerminated = true;
									vm.PhysicianDetails.TerminationDateVisible = true;
								}
							}

							vm.newSelectedCompensationModel = [];
							//initialize master contract details to assign year
							//select year 
							vm.resetMasterContractModel();

							//set selected mastercontractId & year
							vm.Prov.MasterContractDetails.SelectedMasterContractId = UtilService.getSelectedDropdownListValue(vm.Prov.PhysicianContractMaster, 0);

							//year
							var selectedYear = UtilService.getSelectedDropdownListValue(vm.Prov.Year, 0);

							if (vm.Prov.Year != null && vm.Prov.Year.length == 1) {
								selectedYear = vm.Prov.Year[0].id;
							}

							vm.Prov.MasterContractDetails.SelectedYear = selectedYear;

							if (vm.Prov.MasterContractDetails.SelectedMasterContractId > 0) {

								var selCompId = null;
								//if (vm.OtherPageParams.SelectedMasterContractId != null) {
								//	selCompId= vm.OtherPageParams.CompModelID;
								//}
								//REST call:construct tabs dynamically and load first selected comp contract details 
								$timeout(function () { vm.loadPhysicianContract(null, selCompId); }, 10);


								//REST call:get selected master contract details - asynchronously 
								$timeout(function () {
									var userInfo = UtilService.getCurrentUserInfo();

									//1.prepare model
									var query = {
										currentRoleId: userInfo.CurrentRoleID,
										physicianId: vm.PhysicianDetails.PhysicianID,
										masterContractId: vm.Prov.MasterContractDetails.SelectedMasterContractId //UtilService.getSelectedDropdownListValue(vm.Prov.PhysicianContractMaster)
									};

									//2.block UI
									//var ProviderName = vm.PhysicianDetails.ProviderName;
									//var msg = (ProviderName != null && ProviderName != undefined) ? ProviderName : "";
									//UtilService.blockUI(msg); 
									//3. make service call
									provService.getMasterContractDetailsByMasterContractId(query).then(function (response) {
										//4. process response and then unblock ui 
										if (response != null) {

											//vm.Prov.MasterContractDetails = response;  
											vm.Prov.MasterContractDetails.MasterContractStartDate = response.MasterContractStartDate;
											vm.Prov.MasterContractDetails.MasterContractEndDate = response.MasterContractEndDate;
											vm.Prov.MasterContractDetails.IsEvergreenPhysician = response.IsEvergreenPhysician;
											vm.Prov.MasterContractDetails.NoPenalityNoticeDays = response.NoPenalityNoticeDays;
											vm.Prov.MasterContractDetails.TerminationNoticeDays = response.TerminationNoticeDays;
											vm.Prov.MasterContractDetails.IsActive = response.IsActive;
											vm.Prov.MasterContractDetails.AutoRenewTermId = response.AutoRenewTermId;
											vm.Prov.MasterContractDetails.MaxCompensationAmount = response.MaxCompensationAmount;
											vm.Prov.MasterContractDetails.GuaranteedEndDate = response.GuaranteedEndDate;
											vm.Prov.MasterContractDetails.PhysicianFTE = response.PhysicianFTE;
											vm.Prov.MasterContractDetails.ContractExhibitDocuments = response.ContractExhibitDocuments;

											//never assign selected master contract Id from here
											//vm.Prov.MasterContractDetails.MasterContractID = response.MasterContractID;
											//vm.Prov.MasterContractDetails.SelectedMasterContractId = UtilService.getSelectedDropdownListValue(vm.Prov.PhysicianContractMaster, 0);  

											//when master contract dropdown is changed then fill the fiscal years and select default fiscal year 
											//save the search list   
											vm.manageRecentSearchList(vm.PhysicianDetails.PhysicianID, vm.PhysicianDetails.ProviderName);
										}
										else {
											//pending in case of no data returned
											vm.resetMasterContractModel();
										}
									}, vm.onError);

								}, 300);
							} else {
								$.unblockUI();
							}

							return;
						}
					} catch (e) {
						$.unblockUI();
					}
				}

			}, 100);

			return false;
		}



		//REST :CompModelsByRegion
		vm.loadCompModelsByRegionId = function () {
			//clear all notifications
			provHelper.hideAllNotifications();
			if (vm.SelectedRegionId > 0) {
				var userInfo = UtilService.getCurrentUserInfo();

				var cacheConfig = {
					enmkey: UtilService.enmCache.CompModelsByRegion,
					cacheKey: UtilService.enmCache.CompModelsByRegion + '_' + vm.SelectedRegionId,
					model: {
						regionId: vm.SelectedRegionId,
						roleCode: userInfo.CurrentUserRoleCode
					}
				}

				var _list = [];
				provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {

					if (response != null) {
						_list = response.CompensationModel;
					}

					vm.newSelectedCompensationModel = [];
					vm.CompensationModel = _list;

				}, function (jqXHR) {
					//log the exception
					try { $exceptionHandler(jqXHR); } catch (e1) { }

					vm.newSelectedCompensationModel = [];
					vm.CompensationModel = _list;
				});
			} else {
				//region Id not selected
				vm.newSelectedCompensationModel = [];
				vm.CompensationModel = _list;
			}
		}

		//REST:RegionMasterList
		vm.loadRegionMasterList = function () {
			var userInfo = UtilService.getCurrentUserInfo();

			var cacheConfig = {
				enmkey: UtilService.enmCache.Regions,
				cacheKey: UtilService.enmCache.Regions,
				model: { roleCode: userInfo.CurrentUserRoleCode }
			}

			var _list = [];
			//get RegionMasterList
			provService.getMasterDataByKey(userInfo, cacheConfig.enmkey, cacheConfig.cacheKey, cacheConfig.model).then(function (response) {
				try {
					if (response != null) {
						_list = response.regions;
					}
					//assign set the region id if it has got already
					vm.RegionMasterList = _list;

				} catch (err) { console.log(JSON.stringify(err)); }
			}, function (jqXHR) {
				//log the exception
				try { $exceptionHandler(jqXHR); } catch (e1) { }
				//assign set the region id if it has got already
				vm.RegionMasterList = _list;
				vm.SelectedRegionId = 0;
			});
		}

		vm.addNewContract = function (popupid) {
			//clear error message
			UtilService.clearNotificationsById(vm.Control.pnlMasterContractValidationMessage.id);

			//start validating form partially
			var statusInfo = vm.validateEntireFormData(null, 1);
			if (statusInfo.IsValid) {
				vm.openPopup(popupid);
			}
		}

		vm.openPopup = function (popupid) {
			return provHelper.openPopup(popupid);
		}

		vm.closePopup = function (popupid) {
			return provHelper.closePopup(popupid);
		}

		vm.setupPopUpDialog = function () {
			$('#' + vm.Control.popupLinkCompModel.id).dialog({
				autoOpen: false,
				modal: true,
				width: 550,
				height: 240,
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
				, open: function () {
					//clear all notifications
					provHelper.hideAllNotifications();
					vm.imCompModelLoading = false;

					//dispay default region Id o popup open
					vm.SelectedRegionId = vm.PhysicianDetails.RegionId;
					$timeout(function () { vm.loadCompModelsByRegionId() }, 10);

					//adjust region popup height: make overflow visible to display multi-select dropdown values to be shown outside of the modal
					//$($('.ui-dialog,.ui-dialog-content'), $(this)).css({ 'overflow': 'visible' });
				},
				close: function () {
					//vm.SelectedRegionId = 0; 
					vm.newSelectedCompensationModel = [];
					vm.imCompModelLoading = false;
				}
			});
		}

		vm.getMasterContractDetailsById = function (masterContrId) {
			//if (masterContrId != 0) {
			//reset other page params
			//vm.OtherPageParams = vm.getOtherPageParamsModel(); 

			//reset master contract model
			vm.resetMasterContractModel();

			//select master contract id and reset year
			vm.Prov.MasterContractDetails.SelectedMasterContractId = masterContrId;
			vm.Prov.MasterContractDetails.SelectedYear = 0;
			vm.Prov.Year = null;

			//1.block UI
			UtilService.blockUIWithText("Please wait while processing your request...");

			$timeout(function () { vm.reloadMasterContractDetailsById(); }, 10);
			//}  
		}

		//REST: call getMasterContractDetailsById
		vm.reloadMasterContractDetailsById = function () {
			//clear years and load it again

			var userInfo = UtilService.getCurrentUserInfo();

			//1.prepare model
			var query = {
				currentRoleId: userInfo.CurrentRoleID,
				physicianId: vm.PhysicianDetails.PhysicianID,
				masterContractId: vm.Prov.MasterContractDetails.SelectedMasterContractId
			};

			//3. make service call
			provService.getMasterContractDetailsByMasterContractId(query).then(onSuccessCallback, vm.onError);

			function onSuccessCallback(response) {
				//4. process response and then unblock ui 
				if (response != null) {
					//update master dropdown description if it's greater than 0
					var mastercontractId = vm.Prov.MasterContractDetails.SelectedMasterContractId;

					if (vm.Prov.PhysicianContractMaster != null && mastercontractId > 0) {
						var _isPrevSelectedMasterContractIdFound = false;
						for (var i = 0; i < vm.Prov.PhysicianContractMaster.length; i++) {
							if (vm.Prov.PhysicianContractMaster[i].id == mastercontractId) {
								if (response.MasterContractStartDate != null && response.MasterContractStartDate != undefined) {
									vm.Prov.PhysicianContractMaster[i].label = response.MasterContractStartDate + "-" + response.MasterContractEndDate;
									_isPrevSelectedMasterContractIdFound = true;
								}
								break;
							}
						}

						//previously selected master id is not found, hence reload provider entire data 
						if (_isPrevSelectedMasterContractIdFound == false) {
							//reset:imp imp imp selected fiscal year to zero as master contract Id not found
							vm.Prov.MasterContractDetails.SelectedYear = 0;
							//rest selected master Contract params to null and then reload it again
							$timeout(function () { vm.reloadEntireProviderData(vm.PhysicianDetails.PhysicianID, ""); }, 10);
							return;
						}
					}

					vm.Prov.MasterContractDetails.MasterContractStartDate = response.MasterContractStartDate;
					vm.Prov.MasterContractDetails.MasterContractEndDate = response.MasterContractEndDate;
					vm.Prov.MasterContractDetails.IsEvergreenPhysician = response.IsEvergreenPhysician;
					vm.Prov.MasterContractDetails.NoPenalityNoticeDays = response.NoPenalityNoticeDays;
					vm.Prov.MasterContractDetails.TerminationNoticeDays = response.TerminationNoticeDays;
					vm.Prov.MasterContractDetails.IsActive = response.IsActive;
					vm.Prov.MasterContractDetails.AutoRenewTermId = response.AutoRenewTermId;
					vm.Prov.MasterContractDetails.MaxCompensationAmount = response.MaxCompensationAmount;
					vm.Prov.MasterContractDetails.GuaranteedEndDate = response.GuaranteedEndDate;
					vm.Prov.MasterContractDetails.PhysicianFTE = response.PhysicianFTE;
					vm.Prov.MasterContractDetails.ContractExhibitDocuments = response.ContractExhibitDocuments;

					//never assign selected master contract Id from here
					//vm.Prov.MasterContractDetails.MasterContractID = response.MasterContractID;
					//vm.Prov.MasterContractDetails.SelectedMasterContractId = UtilService.getSelectedDropdownListValue(vm.Prov.PhysicianContractMaster, 0);  

					//when master contract dropdown is changed then fill the fiscal years and select default fiscal year

					//ensure the below code should not get called when provider is selected from provider search list as we are already consructing dynamic tabs   

					//if selected year is NOT Greater than zero
					//assign selected yearlist and year 

					vm.Prov.Year = response.Year;

					//check if previously seleted fiscal year already present in the list or not 
					var _isPrevSelectedYearFound = false;
					if (vm.Prov.Year != null && vm.Prov.Year.length > 0) {
						for (var i = 0; i < vm.Prov.Year.length; i++) {

							if (parseInt(vm.Prov.MasterContractDetails.SelectedYear) == parseInt(vm.Prov.Year[i].id)) {
								_isPrevSelectedYearFound = true;
								break;
							}
						}

						if (!_isPrevSelectedYearFound) {
							var selectedYear = UtilService.getSelectedDropdownListValue(vm.Prov.Year, 0);
							if (vm.Prov.Year != null && vm.Prov.Year.length == 1) {
								selectedYear = vm.Prov.Year[0].id;
							}
							vm.Prov.MasterContractDetails.SelectedYear = selectedYear;
						}
					} else {
						vm.Prov.MasterContractDetails.SelectedYear = 0;
					}
					//construct tabs dynamically
					//REST call:construct tabs dynamically and load first selected comp contract details
					vm.PhysicianContractTabs = [];
					//$timeout(function () {
					//	vm.PhysicianContractTabs = vm.getCompTabs(vm.CompensationModel);
					//	$timeout(function () { vm.setActiveTabByIndex(0); }, 1000);
					//}, 600);
					// call LoadPhysicianContractDetails
					if (vm.Prov.MasterContractDetails.SelectedMasterContractId > 0) {
						vm.loadPhysicianContract();
					} else {
						//4. unblock ui
						$.unblockUI();
					}

					//save the search list   
					vm.manageRecentSearchList(vm.PhysicianDetails.PhysicianID, vm.PhysicianDetails.ProviderName);
				}
				else {
					//4. unblock ui
					$.unblockUI();
					//pending in case of no data returned
					vm.resetMasterContractModel();
				}
			}


			//clear tabs if selected value is not zero
			//vm.getMasterContractDetailsByMasterContractId(masterContrId, false);

		}

		//REST:whenever master contract dropdown is changed
		vm.getMasterContractDetailsByMasterContractId = function (masterContrId, bypass) {

			var userInfo = UtilService.getCurrentUserInfo();

			//1.prepare model
			var query = {
				currentRoleId: userInfo.CurrentRoleID,
				physicianId: vm.PhysicianDetails.PhysicianID,
				masterContractId: masterContrId //UtilService.getSelectedDropdownListValue(vm.Prov.PhysicianContractMaster)
			};

			//2.block UI
			//var ProviderName = vm.PhysicianDetails.ProviderName;
			//var msg = (ProviderName != null && ProviderName != undefined) ? ProviderName : "";
			//UtilService.blockUI(msg); 
			//3. make service call
			provService.getMasterContractDetailsByMasterContractId(query).then(onSuccessCallback, vm.onError);

			function onSuccessCallback(response) {
				//4. process response and then unblock ui 
				if (response != null) {

					console.log(response);

					//vm.Prov.MasterContractDetails = response; 
					vm.Prov.MasterContractDetails.MasterContractStartDate = response.MasterContractStartDate;
					vm.Prov.MasterContractDetails.MasterContractEndDate = response.MasterContractEndDate;
					vm.Prov.MasterContractDetails.IsEvergreenPhysician = response.IsEvergreenPhysician;
					vm.Prov.MasterContractDetails.NoPenalityNoticeDays = response.NoPenalityNoticeDays;
					vm.Prov.MasterContractDetails.TerminationNoticeDays = response.TerminationNoticeDays;
					vm.Prov.MasterContractDetails.IsActive = response.IsActive;
					vm.Prov.MasterContractDetails.AutoRenewTermId = response.AutoRenewTermId;
					vm.Prov.MasterContractDetails.MaxCompensationAmount = response.MaxCompensationAmount;
					vm.Prov.MasterContractDetails.GuaranteedEndDate = response.GuaranteedEndDate;
					vm.Prov.MasterContractDetails.PhysicianFTE = response.PhysicianFTE;
					vm.Prov.MasterContractDetails.ContractExhibitDocuments = response.ContractExhibitDocuments;

					//never assign selected master contract Id from here
					//vm.Prov.MasterContractDetails.MasterContractID = response.MasterContractID;
					//vm.Prov.MasterContractDetails.SelectedMasterContractId = UtilService.getSelectedDropdownListValue(vm.Prov.PhysicianContractMaster, 0);  

					//when master contract dropdown is changed then fill the fiscal years and select default fiscal year
					if (!bypass) {
						//ensure the below code should not get called when provider is selected from provider search list as we are already consructing dynamic tabs 

						vm.Prov.Year = response.Year;
						vm.Prov.MasterContractDetails.SelectedYear = UtilService.getSelectedDropdownListValue(response.Year, 0);


						//construct tabs dynamically
						//REST call:construct tabs dynamically and load first selected comp contract details
						vm.PhysicianContractTabs = [];
						//$timeout(function () {
						//	vm.PhysicianContractTabs = vm.getCompTabs(vm.CompensationModel);
						//	$timeout(function () { vm.setActiveTabByIndex(0); }, 1000);
						//}, 600);
						// call LoadPhysicianContractDetails

						vm.loadPhysicianContract();
					}
					//save the search list   
					vm.manageRecentSearchList(vm.PhysicianDetails.PhysicianID, vm.PhysicianDetails.ProviderName);
				}
				else {
					//pending in case of no data returned
					vm.resetMasterContractModel();
				}
			}
		}

		vm.loadDataByTab = function (tab) {
			if (tab.IsDataLoaded == undefined || !tab.IsDataLoaded) {
				//clear all error messages
				provHelper.hideAllNotifications();
			}

			vm.loadPanelData(tab); 
		}

		vm.loadPanelData = function (tab) {
			if (tab.IsDataLoaded == undefined || !tab.IsDataLoaded) {
				////2.block UI
				//var msg = (tab != null && tab.Name != undefined) ? tab.Name : ""; 
				UtilService.blockUI();
				//pending
				//_listOfSelTabs = vm.PhysicianContractTabs;
				vm.managepanel(tab);

				$timeout(function () { vm.loadPhysicianContract(tab, tab.Value); }, 500);
			} else {
				vm.managepanel(tab);
			}
		}

		vm.onError = function (jqXHR) {
			//if user session is invalid then redirect to sessiontimeout page
			provHelper.redirectIfSessionTimeout(jqXHR);

			//4. unblock ui
			$.unblockUI();

			try {
				//5. handle errors in ui   
				provHelper.handleServerError(jqXHR, vm.Control.pnlMasterContractValidationMessage.id);
			} catch (e) {
				alert(JSON.stringify(jqXHR));
			}
		}

		//this method is invoked when Provider Search, Master Contract Dropdown, FiscalYear is changed
		vm.loadPhysicianContract = function (tab, selCompId) {
			////clear all error messages
			//provHelper.hideAllNotifications();
			var userInfo = UtilService.getCurrentUserInfo();

			//1.prepare model
			var query = {
				providerId: vm.PhysicianDetails.PhysicianID
				, masterContractID: vm.Prov.MasterContractDetails.SelectedMasterContractId
				, year: vm.Prov.MasterContractDetails.SelectedYear
				//, compensationModels: '' + tab.Value //pending comp model Id
				, currentRoleID: userInfo.CurrentRoleID
				, currentRoleName: userInfo.CurrentUserRole
				//, isShowOriginal
				//, loadPreview 
			};

			//add if compensation model id is found.
			if (selCompId != undefined && selCompId != null) {
				query.compensationModels = selCompId;
			}

			//3. make service call
			provService.loadPhysicianContract(query).then(loadPhysicianContractSuccessCallback, vm.onError);


			//4. load PayElements data if tab is not null
			if (tab != null) sharedService.broadcast_loadContractPayElementDetailsByProvider({ tab: tab });

			//success callback
			function loadPhysicianContractSuccessCallback(response) {
				if (response != null && response.physicianContractDetails != null) {
					//5. process the response
					//assign the model   
					var _listOfSelTabs = [];
					if (selCompId == null) {
						//control enters here only when enitre tabs data to be destroyed and to load first data
						////construct tabs dynamically - fill the list of tabs from the response
						_listOfSelTabs = vm.getTabsConfigFromServerResonse(response);
						//get tabs
						var _tabsList = vm.getCompTabs(_listOfSelTabs);
						_tabsList[0].IsDataLoaded = true;
						//reassign
						tab = _tabsList[0];

						//assign new tabs and load it's content
						$timeout(function () {
							vm.PhysicianContractTabs = _tabsList;

							//wait for a moment while dom gets updated with the tabs
							$timeout(function () {
								loadTabContent(response, selCompId, tab);
							}, 100);

						}, 10);

					} else {
						_listOfSelTabs = vm.PhysicianContractTabs;
						for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
							if (tab.Value == vm.PhysicianContractTabs[i].Value) {
								vm.PhysicianContractTabs[i].IsDataLoaded = true;
								break;
							}
						}

						loadTabContent(response, selCompId, tab);
					}

					$.unblockUI();

				} else {
					//pending pending clear data
					//4. unblock ui
					$.unblockUI();

				}
			}
		}

		function loadTabContent(response, selCompId, tab) {
			if (selCompId == null) {
				vm.managepanel(tab);

				//invoke payelements asynchronously
				$timeout(function () { sharedService.broadcast_loadContractPayElementDetailsByProvider({ tab: tab }); }, 100);
			}

			////save original values for further use
			//vm.ProvOriginal = angular.copy(vm.Prov); 
			$timeout(function () {
				//6.update tab contents
				//wait for a half sec while tabs are getting constrcuted
				for (var i = 0; i < response.physicianContractDetails.length; i++) {
					//take first tab data only and then ignore rest tab data
					//ContractCompmodelId
					if (tab.Value == response.physicianContractDetails[i].ContractCompmodelId) {
						sharedService.broadcast_loadPhysicianContract({ tab: tab, physicianContractDetails: response.physicianContractDetails[i], response: response });
						break;
					}
				}
				//4. unblock ui 
			}, 50);
		}


		vm.manageRecentSearchList = function (id, name) {
			var isfound = false
			var arr = vm.recentSearchList;
			if (arr.length > 0) {
				//check if item already exists
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].PhysicianID == id) {
						isfound = true;
						break;
					}
				}
			}

			if (!isfound) {
				arr.push({ SortOrder: arr.length, PhysicianID: id, ProviderName: name });
			}


			//reverse array 
			//arr.reverse();

			arr.sort(function (a, b) {
				var a1 = a.SortOrder, b1 = b.SortOrder;
				if (a1 == b1) return 0;
				return b1 > a1 ? 1 : -1;
			});

			//limt recent search list to 6
			if (arr.length > 6) {
				arr = arr.slice(0, 6);
			}

			//assign it to the list
			vm.recentSearchList = arr;
		}

		/* close event on change provider */
		vm.chooseAnotherProvider = function () {
			//clear previously selected provider details data  
			vm.IsProviderDetailsVisible = false;
			//remove last character and focus 
			$timeout(function () {
				$scope.$apply(function () {
					$("#" + vm.Control.ProvSearch.id).val("").focus();
				});
			}, 200)
			return false;
		}

		vm.managepanel = function (tab) {
			for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
				if (vm.PhysicianContractTabs[i].Id == tab.Id) {
					//load/refresh respective  content
					vm.PhysicianContractTabs[i].IsActive = true;
				}
				else {
					vm.PhysicianContractTabs[i].IsActive = false;
				}
			}
		}

		vm.navigateTabById = function (id) {
			for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
				if (vm.PhysicianContractTabs[i].Id == id) {
					//load/refresh respective  content
					vm.PhysicianContractTabs[i].IsActive = true;
				}
				else {
					vm.PhysicianContractTabs[i].IsActive = false;
				}
			}
		}

		//discard tab
		vm.discardTab = function (tab) {
			if (confirm('Are you sure, you want to Discard ' + tab.Name + '?')) {
				var sel_value = tab.Value;
				var _findIdx = null;
				for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
					if (sel_value == vm.PhysicianContractTabs[i].Value) {
						_findIdx = i;
						break;
					}
				}

				if (_findIdx != null) {
					vm.PhysicianContractTabs.splice(_findIdx, 1);
					_findIdx = _findIdx > 0 ? _findIdx - 1 : 0
					var tab = vm.PhysicianContractTabs[_findIdx];
					//show previous panel and load data
					vm.managepanel(tab);

					if (tab != undefined)
						$timeout(function () { vm.loadPhysicianContract(tab, tab.Value); }, 10);
				}
			}
		}

		vm.getTabsConfigFromServerResonse = function (response) {
			var _listOfSelTabs = [];
			if (response != undefined && response.physicianContractDetails != undefined) {
				for (var i = 0; i < response.physicianContractDetails.length; i++) {
					_listOfSelTabs.push({
						ContractId: response.physicianContractDetails[i].ContractId
						, CompensationModelId: response.physicianContractDetails[i].CompensationModelId
						, CompensationModelName: response.physicianContractDetails[i].CompensationModelName
						, ContractCompmodelId: response.physicianContractDetails[i].ContractCompmodelId
						, OtherInfo: response.physicianContractDetails[i]
						, response: response
						, Status: (response.physicianContractDetails[i].ContractId > 0 ? vm.tabstatus.original : vm.tabstatus.new)
						, IsDataLoaded: false // vm.tabstatus.original
					})
				}
			}
			return _listOfSelTabs;
		}
		//construct tabs dynamically based on selected compensation model
		vm.getCompTabs = function (selectedcompcontractmodels) {
			//extract selected text and values from a selected compmodel and construct tabs dynamically
			var _comptabs = [];

			var _prefix = vm.PhysicianDetails.PhysicianID;

			for (var i = 0; i < selectedcompcontractmodels.length; i++) {
				_comptabs.push({
					Id: _prefix + '-' + UtilService.getGuid() + '-' + selectedcompcontractmodels[i].ContractId
					, Name: vm.getCompleteCompModelName(selectedcompcontractmodels[i].OtherInfo)
					, Value: selectedcompcontractmodels[i].ContractCompmodelId
					, ContractId: selectedcompcontractmodels[i].ContractId
					, CompensationModelId: selectedcompcontractmodels[i].CompensationModelId
					, Status: selectedcompcontractmodels[i].Status
					//, MasterContractDetails: vm.Prov.MasterContractDetails //master controller fields data
					, AllowToGroupContractPayElementsBasedOnCostCenter: vm.Prov.AllowToGroupContractPayElementsBasedOnCostCenter
					, Prov: vm.Prov
					, PhysicianDetails: vm.PhysicianDetails
					, OtherInfo: selectedcompcontractmodels[i].OtherInfo //contract controller fields data
					, response: selectedcompcontractmodels[i].response
				});
			}
			return _comptabs;
		}

		//getCompleteCompModelName
		vm.getCompleteCompModelName = function (contract) {
			var name = '';
			try {
				var locName = contract.LocationDesc;
				var regionDesc = contract.RegionDesc;
				name = (regionDesc == null || regionDesc == '' ? '' : regionDesc + '-') + (locName == null || locName == '' ? '' : locName + '-') + contract.CompensationModel;
			} catch (e) {
				name = 'Missing';
			}
			return name;
		}

		vm.updateCompModelTabNameByLocationAndCostCenter = function (tab, regionDesc, locName) {
			for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
				if (vm.PhysicianContractTabs[i].Id == tab.Id) {
					vm.PhysicianContractTabs[i].Name = (regionDesc == null || regionDesc == '' ? '' : regionDesc + '-')
						+ (locName == null || locName == '' ? '' : locName + '-') + tab.OtherInfo.CompensationModel;
					break;
				}
			}
		}

		vm.setActiveTabByIndex = function (idx) {

			$timeout(function () {
				vm.loadPhysicianContract(idx);
			}, 100);
		}

		vm.getDropdownTextById = function (list, selvalue, defValue) {
			return UtilService.getDropdownTextById(list, selvalue, defValue);
		}

		//added below method for ui purpose
		vm.checkArrayAndGetDropdownTextById = function (list, selvalue, defValue) {
			if (list != undefined) {
				return UtilService.getDropdownTextById(list, selvalue, defValue)
			} else {
				return "";
			}
		}

		vm.setupDatePickers = function () {
			$('.mastercontract-datepicker').datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleDatePicker
			}).on("change", handleDatePicker);

			$('.guaranteedendDate-datepicker').datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleDatePicker,
				beforeShow: function (input, inst) {
					return {
						minDate: vm.Prov.MasterContractDetails.MasterContractStartDate,
						maxDate: vm.Prov.MasterContractDetails.MasterContractEndDate
					};
				}
			}).on("change", handleDatePicker);

			function handleDatePicker() {
				var txtId = $(this).attr('id');
				var txtValue = $(this).val(); 
				 
  				if (UtilService.isValidDate(txtValue)) {
					txtValue = moment(txtValue).format('L');
				}

				switch (txtId) {
					case vm.Control.MasterContractStartDate.id:
						vm.Prov.MasterContractDetails.MasterContractStartDate = txtValue;
						break;
					case vm.Control.MasterContractEndDate.id:
						vm.Prov.MasterContractDetails.MasterContractEndDate = txtValue;
						break;
					case vm.Control.GuaranteedEndDate.id:
						vm.Prov.MasterContractDetails.GuaranteedEndDate = txtValue;
						break;
				}

				//clear error message
				UtilService.clearNotificationsById(vm.Control.pnlMasterContractValidationMessage.id);

				//validate form
				var statusInfo = vm.validateEntireFormData(null, 1);

				vm.populateCurrentYearsBasedOnStartAndEndDates();
			}
		}

		vm.onPageLoad = function () {

			//initialize field configuration
			vm.initializeProviderMasterContractFields();

			//display content
			$(".box-content").css("visibility", "visible");
			//cache:provider master data asynchronusly

			var userInfo = UtilService.getCurrentUserInfo();

			provService.cacheMasterData(userInfo);

			//setup auto completion
			vm.setupAutoCompletion();
			//fill current user data
			vm.hdnCurrent.PhysicianId = $("input[name$='hdnPhysicianId']").val();

			// termination date:1126,1155;
			//vm.hdnCurrent.PhysicianId = 44453; //44454;// 1523;//1524,1125;1524
			if (vm.hdnCurrent.PhysicianId != "") {
				var otherParams = null;
				try {
					otherParams = JSON.parse('{ ' + $("input[name$='hdnOtherPageParams']").val().replace(/'/g, '"') + ' }')
				} catch (e) {
					otherParams = null;
				}

				//set other params
				if (otherParams != null) {
					//getOtherPageParamsModel
					vm.OtherPageParams = vm.getOtherPageParamsModel();

					vm.OtherPageParams.SelectedMasterContractId = otherParams.MasterContractID;
					vm.OtherPageParams.CompModelID = otherParams.CompModelID;
					vm.OtherPageParams.DeptID = otherParams.DeptID;
					vm.OtherPageParams.SpecialtyID = otherParams.SpecialtyID;
				}
				//load content 
				$timeout(function () { vm.getMasterContractDetails(vm.hdnCurrent.PhysicianId, null); }, 400);

			} else {

				//added below code for debug & development mode
				////remove remove remove start  

				//if (1 != 1) {
				//	vm.Prov.PhysicianID = "1125";
				//	vm.Prov.ProviderName = "App monthly, Fullcontract [PRL104]";
				//} else {
				//	vm.Prov.PhysicianID = "1105";
				//	vm.Prov.ProviderName = "Alex, Morgan [9515995118]";
				$timeout(function () { focus(vm.Control.ProvSearch.id); }, 400);
			}
			//pending - compensation models and display the first tab by default on page load
			//vm.setActiveTabByIndex(0);
		}

		/*upload file start*/
		//file upload 
		$scope.uploadDocumentById = function (item) {
			//clear all messages
			provHelper.hideAllNotifications();
			//assign doc ids here  
			vm.Prov.MasterContractDetails.DocId = item.id;
			vm.Prov.MasterContractDetails.DocBytes = null;

			var fileName = item.files[0].name;
			// Allowing file type
			//application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel
			var allowedExtensions = /(\.doc|\.docx|\.odt|\.pdf|\.xls|\.xlsx|\.rtf|\.wps|\.wks|\.wpd)$/i;

			if (!allowedExtensions.exec(fileName)) {

				var msgobj = {
					MessageType: UtilService.MessageType.Validation,
					Message: 'Invalid file type'
				}
				UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlUploadDisplayMsg.id);

				$("#" + vm.Control.fuDocument.id).val(null);
				return false;
			}

			var itemExists = UtilService.getListValuesByPropVal(vm.Prov.MasterContractDetails.ContractExhibitDocuments, 'OriginalFileName', fileName);
			if (itemExists.length) {
				var conf = confirm("A file already exists with this name, do you want to upload document with same name?");
				if (!conf) {
					//clear file from the control
					document.getElementById(vm.Prov.MasterContractDetails.DocId).value = null;
					return;
				}
			}

			getAsText(item.files[0]);

			function getAsText(readFile) {
				var reader = new FileReader();
				reader.readAsDataURL(readFile);
				reader.onload = loaded;
				return reader;
			}
			function loaded(e) {
				vm.Prov.MasterContractDetails.DocBytes = e.target.result;
			}
		}

		//clear all error messages
		vm.hideAllNotifications = function () {
			provHelper.hideAllNotifications();
		}
		//upload document
		vm.uploadFile = function () {
			//clear all error messages
			provHelper.hideAllNotifications();

			if (vm.Prov.MasterContractDetails.DocBytes == null) { return; }

			var _file = document.getElementById(vm.Prov.MasterContractDetails.DocId);
			var _filedesc = vm.Prov.MasterContractDetails.DocDescription;
			_filedesc = _filedesc != null ? $.trim(_filedesc) : '';

			//pending validation: 
			//1. accept: application / pdf, application / msword, application / vnd.openxmlformats - officedocument.wordprocessingml.document
			//,  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms - excel
			//2. file description name  
			if (_file != null) {
				//1.check file size 
				var fizesize = UtilService.convertDataByDatatype($("input[name$='hdnUploadFileSize']").val(), UtilService.datatype.number, 0);

				if (!(_file.files[0].size <= fizesize)) {
					var size = (fizesize / 1024 / 1024).toFixed(0);

					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: 'Please choose a file less than ' + size + 'MB.'
					}
					return UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlUploadDisplayMsg.id);
				}

				//2.check duplicate file description
				var duplicateFileDesc = "";
				if (vm.Prov.MasterContractDetails.ContractExhibitDocuments != null) {
					var docs = vm.Prov.MasterContractDetails.ContractExhibitDocuments;
					for (var i = 0; i < docs.length; i++) {
						if (_filedesc != null && _filedesc != "" && UtilService.isEqual(_filedesc, docs[i].Description)) {
							duplicateFileDesc = _filedesc;
							break;
						}
					}
				}

				if (duplicateFileDesc.length > 0) {
					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: 'Description ' + duplicateFileDesc + ' already in use.'
					}
					try {
						focus(vm.Control.txtFileDescription.id);
					} catch (e) { }
					return UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlUploadDisplayMsg.id);
				}

				//3. prepare data and post it to server
				var formData = new window.FormData();
				formData.append("File", _file.files[0]);
				formData.append("Type", 'contract-exhibit-docs');
				formData.append("MasterContractID", vm.Prov.MasterContractDetails.SelectedMasterContractId);
				formData.append("DocDescription", vm.Prov.MasterContractDetails.DocDescription);


				//2.block UI 
				var msg = "Uploading...";
				UtilService.blockUIWithText(msg);

				provService.uploadDocument("../UserControls", "/Upload.ashx", formData).then(function (response) {
					if (response.length > 0) {
						$.unblockUI();

						//clear values
						vm.Prov.MasterContractDetails.DocDescription = "";
						//clear file from the control
						document.getElementById(vm.Prov.MasterContractDetails.DocId).value = null;
						var result = response.split("~");

						if (result != undefined && result.length > 0 && result[0] == 'error') {
							var msgobj = {
								MessageType: UtilService.MessageType.Validation,
								Message: result[1]
							}

							UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlUploadDisplayMsg.id);
						} else {

							var user = UtilService.getCurrentUserInfo();

							if (!vm.Prov.MasterContractDetails.ContractExhibitDocuments) {
								vm.Prov.MasterContractDetails.ContractExhibitDocuments = []
							}

							vm.Prov.MasterContractDetails.ContractExhibitDocuments.push({
								ContractDocID: 0,
								MasterContractId: vm.Prov.MasterContractDetails.SelectedMasterContractId,
								CreatedBy: user.UserID,
								CreatedDate: moment().format('L'),
								Description: _filedesc,
								FilePath: result[4], //_fileLoc, //"D:\H2Builds\TeamHealth\Contract_Agreements",
								InternalFileName: result[3],
								IsActive: true,
								IsEditMode: false,
								LastUpdatedDate: moment().format('L'),
								ModifiedBy: user.UserName,
								OriginalFileName: result[0],
								RowIndex: 0
							});
						}
						//handle response and display errors if any: add to current list if success
					}
				}, function (jqXHR) {
					$.unblockUI();
					provHelper.handleServerError(jqXHR, vm.Control.pnlUploadDisplayMsg.id);
				});

			}
			//}, 100);//find a way to replace the timeout TODO
		}

		//download document
		vm.downloadDocById = function (item) {
			//clear all error messages
			provHelper.hideAllNotifications();

			var urlToDownload = "../UserControls/Download.ashx?" + "internalFileName=" + item.InternalFileName + "&originalFileName=" + item.OriginalFileName;

			window.open(urlToDownload, '_blank');

			//delete file from location
			$timeout(function () {
				var formData = new window.FormData();
				//formData.append("Type", 'D');
				formData.append("internalFileName", item.InternalFileName);
				formData.append("originalFileName", item.OriginalFileName);

				provService.deleteDocument("../UserControls", "/Delete.ashx", formData).then(function (response) {
					if (response == 'true') {
						console.log('done');
					}
					else {
						console.log('false');
					}
				}, function (jqXHR) {
					//log the exception
					try { $exceptionHandler(jqXHR); } catch (e1) { }

					//handle error response
					//console.log('error in downloadDocById', jqXHR)
					//var msgobj = {
					//	MessageType: UtilService.MessageType.Validation,
					//	Message: 'Err:' + JSON.stringify(jqXHR)
					//}
					//UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlUploadDisplayMsg.id);
				});
			}, 3000);

		}

		//delete document by Id
		vm.deleteDocById = function (item, index) {
			//clear all error messages
			provHelper.hideAllNotifications();
			$timeout(function () {

				//Delete from the grid array
				if (index > -1) {
					vm.Prov.MasterContractDetails.ContractExhibitDocuments.splice(index, 1);
				}

			}, 10);

		}

		vm.clearExistingContract = function (e) {
			return false;
		}

		//Page entrance: initPage is a initial method of the page 
		vm.initPage = function () { 
			console.log('enetered');
			ngAuthSettings.apiServiceBaseUri = $("input[name$='hdnContractOrDashboardBaseAPIURL']").val();
			console.log($("input[name$='hdnContractOrDashboardBaseAPIURL']").val());


			$("#wrapper").css('display', 'none');

			var userInfo = UtilService.getCurrentUserInfo();
			authService.setToken(userInfo.APIToken);

			var pageRequestedMode = UtilService.convertDataByDatatype($("input[name$='hdnPageRequestedMode']").val(), UtilService.datatype.number, null);

			//check if page requested mode is 0
			if (pageRequestedMode != null && pageRequestedMode == 0) {
				//header
				$(".body-content").css('margin-top', '0px');
				//footer
				$("#topHeader,.header_center,.my-menu,.Copy").css('display', 'none');
				$("#wrapper").css('display', 'block');


				vm.HasWriteAccess = false;
				//invoke your page functions
				vm.onPageLoad();
				//display provider search control once page is loaded
				$timeout(function () { $("#divProviderSearch").css('visibility', 'visible'); }, 1000);
			} else {
				$("#wrapper").css('display', 'block');

				//1.prepare model
				var query = {
					pageURL: '/Physician/AngPhyContract.aspx'
					, currentRoleID: userInfo.CurrentRoleID
				};

				provService.checkWriteAccess(query).then(function (response) {
					//response.HasWriteAccess
					vm.HasWriteAccess = response.HasWriteAccess;

					//invoke your page functions
					vm.onPageLoad();

					//display provider search control once page is loaded
					$timeout(function () { $("#divProviderSearch").css('visibility', 'visible'); }, 1000);
				}, vm.onError);
			}
		};

		$scope.$on('broadcastClearFormErrors', function () {
			//clear error messages if any   
			var _isInvalidTabData = false;
			vm.updateCurrentTabValidationStatus(null, _isInvalidTabData);
		});

		vm.updateCurrentTabValidationStatus = function (tabId, isInValid) {
			if (vm.PhysicianContractTabs != null && vm.PhysicianContractTabs.length > 0) {
				for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
					if (tabId == null) {
						vm.PhysicianContractTabs[i].IsError = false;
					} else {
						if (vm.PhysicianContractTabs[i].Id == tabId) {
							//load/refresh respective  content
							vm.PhysicianContractTabs[i].IsError = isInValid;
							break;
						}
					}
				}
			}
		}

		vm.highlightAndfocusOnErrorControl = function (det, item) {
			provHelper.highlightAndfocusOnErrorControl(det, item);
		}

		vm.focusOnFirstErroControl = function (item) {
			//var title = item.PayElementDesc + ' - Validation Error';
			//var message = item.DetailMessage;
			//provHelper.displayValidationInfo(title, message, item); 
			provHelper.focusOnFirstErroControl(item);
		}

		vm.validationInfoTitle = function (item) {
			var message = 'Validation Error';
			try { message = item.DetailMessage.replace(/<br\s*\/?>/mg, "\n"); } catch (e) { }
			return message;
		}

		//validate master contract form info
		vm.validateEntireFormData = function (model, stepsOfValidations) {
			//check if contract start and end dates are valid
			if (stepsOfValidations == undefined) {
				stepsOfValidations = 2;
			}
			var PhysicianContractData = [];
			//start validating contract start & end dates
			var sbError = [];
			var errorControlIds = [];
			var isEntireFormValid = true;

			var ContStartDt = vm.Prov.MasterContractDetails.MasterContractStartDate;
			var ContEndDt = vm.Prov.MasterContractDetails.MasterContractEndDate;

			if (UtilService.isValidDate(ContStartDt) && UtilService.isValidDate(ContEndDt)) {
				if (moment(ContStartDt).isSameOrAfter(moment(ContEndDt))) {
					errorControlIds.push(vm.Control.MasterContractStartDate.id);
					vm.Control.MasterContractStartDate.IsValid = false;
					vm.Control.MasterContractStartDate.ErrorDesc = "Please Enter Master Contract Start Date Less than Master End Date.";
					sbError.push(vm.Control.MasterContractStartDate.ErrorDesc);
				}

				//check start date againsit with hire date condition
				//var hireDate = provHelper.isDateGreaterThanHireDate(vm.PhysicianDetails, ContStartDt);
				//if (!hireDate.IsValid) {
				//	errorControlIds.push(vm.Control.MasterContractStartDate.id);
				//	vm.Control.MasterContractStartDate.IsValid = false;
				//	vm.Control.MasterContractStartDate.ErrorDesc = "Provider '" + vm.PhysicianDetails.ProviderName + "' master contract "+ hireDate.ErrorMessage;
				//	sbError.push(vm.Control.MasterContractStartDate.ErrorDesc);
				//}  

				//guarenteed date
				var GuaranteedDt = vm.Prov.MasterContractDetails.GuaranteedEndDate;

				if (GuaranteedDt != null && GuaranteedDt != "" && !UtilService.isValidDate(GuaranteedDt)) {
					errorControlIds.push(vm.Control.GuaranteedEndDate.id);
					vm.Control.GuaranteedEndDate.IsValid = false;
					vm.Control.GuaranteedEndDate.ErrorDesc = "Please Enter Valid Guaranteed Date.";
					sbError.push(vm.Control.GuaranteedEndDate.ErrorDesc);
				}

				if (vm.PhysicianDetails.TerminationDateVisible && vm.Prov.MasterContractDetails.TerminationDate != null
					&& vm.Prov.MasterContractDetails.TerminationDate != "" && UtilService.isValidDate(vm.Prov.MasterContractDetails.TerminationDate)) {
					if (moment(ContEndDt).isAfter(moment(vm.Prov.MasterContractDetails.TerminationDate))) {
						errorControlIds.push(vm.Control.MasterContractEndDate.id);
						vm.Control.MasterContractEndDate.IsValid = false;
						vm.Control.MasterContractEndDate.ErrorDesc = "Please Enter Master Contract End Date Less than Provider Termination Date.";
						sbError.push(vm.Control.MasterContractEndDate.ErrorDesc);
					}
				}
				//"There is already a comp model with the same cost center associated. Do you want to continue?"
				//sb.AppendFormat("Mark Complete cannot be set for the Provider \"{0}\" as he is not hired yet .<br/>", ContractSaveOrUpdateQuery.PhysicianContractMaster.Provider);

				//sb.AppendFormat("Provider \"{0}\" contract start date should be greater than or equals to hire date [" + item.HireDate + "].<br/>", ContractSaveOrUpdateQuery.PhysicianContractMaster.Provider);
				//sb.AppendFormat("Mark Complete cannot be set for the Provider \"{0}\" as he is not hired yet .<br/>", ContractSaveOrUpdateQuery.PhysicianContractMaster.Provider); 

			} else {

				if (!UtilService.isValidDate(ContStartDt)) {
					errorControlIds.push(vm.Control.MasterContractStartDate.id);
					vm.Control.MasterContractStartDate.IsValid = false;
					vm.Control.MasterContractStartDate.ErrorDesc = (UtilService.isEmpty(ContStartDt) == true ? "Please Enter Master Contract Start Date." : "Please Enter Valid Master Contract Start Date.");
					sbError.push(vm.Control.MasterContractStartDate.ErrorDesc);
				}

				//validation for End Date
				if (!UtilService.isValidDate(ContEndDt)) {
					errorControlIds.push(vm.Control.MasterContractEndDate.id);
					vm.Control.MasterContractEndDate.IsValid = false;
					vm.Control.MasterContractEndDate.ErrorDesc = (UtilService.isEmpty(ContEndDt) == true ? "Please Enter Master Contract End Date." : "Please Enter Valid Master Contract End Date.");
					sbError.push(vm.Control.MasterContractEndDate.ErrorDesc);
				}
			}

			//stepsOfValidations:2 validate only when it is for saving:validate Region, Location, Cost Center
			if (stepsOfValidations >= 2) {
				//if there are no other errors
				if (sbError.length == 0) {
					var _tabId = null;
					//messageDetailsResult.Message = "There is already a comp model with the same cost center associated. Do you want to continue?";
					//Are you sure you want to Mark Complete ?

					//sb.AppendFormat("Mark Complete cannot be set for the Provider \"{0}\" as he is not hired yet .<br/>", ContractSaveOrUpdateQuery.PhysicianContractMaster.Provider);
					//check if there are any other errors in the other controllers, if yes, then navigate to the section
					if (model != null && model.PhysicianContract != null) {
						var _IsValidContractForm = true;
						var _IsValidMiscProfileForm = true;
						var _IsValidPayElementsForm = true;

						for (var i = 0; i < model.PhysicianContract.length; i++) {
							var contract = model.PhysicianContract[i];

							if (contract.IsSelected) {
								if (contract.IsValidContractForm == false || contract.IsValidMiscProfileForm == false || contract.IsValidPayElementsForm == false) {
									_IsValidContractForm = contract.IsValidContractForm;
									_IsValidMiscProfileForm = contract.IsValidMiscProfileForm;
									_IsValidPayElementsForm = contract.IsValidPayElementsForm;

									isEntireFormValid = false;
									_tabId = contract.TabId;
									break;
								}

								//ask for any confirmations 
								var _isMarkCompletedConfirmation = false;
								if (isEntireFormValid) {
									if (contract.MarkCompleteVisible && contract.MarkCompleteEnabled && contract.IsMarkCompleted && !contract.MarkcompleteForSave) {
										if (confirm("Are you sure you want to Mark Complete?") || _isMarkCompletedConfirmation) {
											contract.MarkcompleteForSave = true;
											_isMarkCompletedConfirmation = true;
										} else {
											isEntireFormValid = false;
											_tabId = contract.TabId;
											break;
										}
									}
								}
							}

							//fill contract and pay elements data
							PhysicianContractData.push(contract);
						}


					}

					//if user is terminated and enitre form is valid:take user confirmation to proceed further
					if (isEntireFormValid) {
						if (vm.PhysicianDetails.IsTerminated) {
							if (confirm("Physician is in Inactive status, Do you want to continue?")) {
								//proceed further 
							} else {
								//stop
								isEntireFormValid = false;
							}
						}
					}


					//there are some errors, just navigate to that error tab 
					if (!isEntireFormValid) {
						vm.navigateTabById(_tabId);

						if (_IsValidContractForm == false) {
							//scroll to top to focus user on error msg
							//$timeout(function () { window.scrollTo({ top: 40, behavior: 'smooth' }); }, 200);
						} else if (_IsValidMiscProfileForm == false) {
							//scroll to top to focus user on error msg
							$timeout(function () { window.scrollTo({ top: 60, behavior: 'smooth' }); }, 200);
						} else if (_IsValidPayElementsForm == false) {
							//scroll to top to focus user on error msg
							$timeout(function () { window.scrollTo({ top: document.body.scrollHeight - 5, behavior: 'smooth' }); }, 200);
						}
						else {
							//scroll to top to focus user on error msg
							$timeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 200);
						}
					}
				}
			}

			//display error message  
			try {
				if (sbError.length > 0) {

					//clear documents if any
					$("#" + vm.Control.fuDocument.id).val(null);

					var msgobj = {
						MessageType: UtilService.MessageType.Validation,
						Message: sbError.join("<br>")
					}
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlMasterContractValidationMessage.id);
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
				IsValid: sbError.length > 0 || !isEntireFormValid ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, PhysicianContract: PhysicianContractData
			}
		}

		vm.getMasterModelForSaving = function () {
			//get user info
			var userInfo = UtilService.getCurrentUserInfo();

			//extract prov name
			var provName = vm.PhysicianDetails.ProviderName;
			provName = provName.substr(0, provName.indexOf('['));

			//update prov master contract description
			var mastercontractdesc = moment(vm.Prov.MasterContractDetails.MasterContractStartDate).format(vm.dateformat)
				+ '-' + moment(vm.Prov.MasterContractDetails.MasterContractEndDate).format(vm.dateformat);

			var model = {
				CurrentRoleId: userInfo.CurrentRoleID,// "0522eb4c-7225-418d-9645-e185747d175e"
				PhysicianID: vm.PhysicianDetails.PhysicianID, //1235
				PhysicianContractMaster: {
					MasterContractID: vm.Prov.MasterContractDetails.SelectedMasterContractId, //int 606
					SelectedFiscalYear: vm.Prov.MasterContractDetails.SelectedYear, //int 606
					Provider: provName, //string
					Description: mastercontractdesc, //string "07/01/2009-07/05/2023",
					MasterContractStartDate: UtilService.getDefaultValueIfItsNull(vm.Prov.MasterContractDetails.MasterContractStartDate, ""),//string "7/1/2009",
					MasterContractEndDate: UtilService.getDefaultValueIfItsNull(vm.Prov.MasterContractDetails.MasterContractEndDate, ""),//"7/5/2023",
					TerminationDate: (vm.Prov.MasterContractDetails.TerminationDate != undefined ? vm.Prov.MasterContractDetails.TerminationDate : null),//DateTime? "2020-10-06T09:57:06.517Z",//revisit:1
					PhysicianFTE: vm.Prov.MasterContractDetails.PhysicianFTE + '',//string "0.00",
					AutoRenewTermId: vm.Prov.MasterContractDetails.AutoRenewTermId,//int 0,
					IsEvergreenPhysician: vm.Prov.MasterContractDetails.IsEvergreenPhysician,// bool true,
					IsActive: vm.Prov.MasterContractDetails.IsActive,//bool true,
					CreatedBy: userInfo.UserID,//string "e82f5a9f-6183-4d97-9b01-0d20e9e95c87",
					TerminationNoticeDays: vm.Prov.MasterContractDetails.TerminationNoticeDays,//int? ull,
					NoPenalityNoticeDays: vm.Prov.MasterContractDetails.NoPenalityNoticeDays,//int?  null,
					MaxCompensationAmount: vm.Prov.MasterContractDetails.MaxCompensationAmount,//decimal? null,
					GuaranteedEndDate: UtilService.getDefaultValueIfItsNull(vm.Prov.MasterContractDetails.GuaranteedEndDate, ""),//string null,
					PayrollId: vm.PhysicianDetails.PayrollID, //string 
					TerminationDateVisible: vm.PhysicianDetails.TerminationDateVisible//bool 
				}
			}

			//documents
			var _ContractExhibitDocuments = [];
			if (vm.Prov.MasterContractDetails.ContractExhibitDocuments != null) {
				for (var i = 0; i < vm.Prov.MasterContractDetails.ContractExhibitDocuments.length; i++) {
					var doc = vm.Prov.MasterContractDetails.ContractExhibitDocuments[i];
					_ContractExhibitDocuments.push({
						ContractDocID: doc.ContractDocID,//int
						MasterContractId: vm.Prov.MasterContractDetails.SelectedMasterContractId, //int 
						OriginalFileName: doc.OriginalFileName,//string
						InternalFileName: doc.InternalFileName,//string "f335603c-cc43-453e-8b4a-025cae02c6e2",
						FilePath: doc.FilePath,// string "D:\\Projects\\H2\\HII-Generic\\GenericVersion14.0-Parent\\PC.Web\\Contract_Agreements",
						CreatedDate: doc.CreatedDate,//string "10/8/2020",
						CreatedBy: doc.CreatedBy,//Guid "e82f5a9f-6183-4d97-9b01-0d20e9e95c87", 
						IsActive: doc.IsActive,//bool true,
						Description: doc.Description//string "PayElements"
					})
				}
			}

			//assign contract exhibit documents
			model.ContractExhibitDocuments = (_ContractExhibitDocuments.length > 0 ? _ContractExhibitDocuments : null);

			return model;
		}

		// saving data starts 
		//get child control data in parent controller
		// contractActionTypes: Approve: "Approve", Reject: "Reject", Discard: "Discard", SendToApproval: "SendToApproval"
		$scope.$on('broadcastcontractEventInParentControl', function () {
			var data = sharedService.getbroadcastdata();
			if (provService.contractActionType.Save == data.actionType) {
				//just return for later saving purpose 
				return vm.PhysicianContractData.push(data.model);
			} else if (provService.contractActionType.SendToApproval == data.actionType) {
				return vm.saveAllContracts(data.actionType, data);
			}
		});

		vm.doNothing = function () {
			return false;
		}

		vm.saveConfirmation = function () {
			if (confirm('Are you sure you want to save?')) {
				vm.saveAllContracts('SAVE');
			}
		}
		//local variables
		vm.PhysicianContractData = [];

		//save all contracts, sendtoapproval
		vm.saveAllContracts = function (type, othermodel) {
			//clear all error messages
			provHelper.hideAllNotifications();

			//block UI 
			UtilService.blockUIWithText("Please wait while processing your request...");

			for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
				vm.PhysicianContractTabs[i].IsError = false;
			}

			$timeout(function () {
				vm.PhysicianContractData = [];
				//get data from different tabs 
				// loop through the tab list and 
				var _contractTabs = vm.PhysicianContractTabs;
				for (var i = 0; i < _contractTabs.length; i++) {
					vm.PhysicianContractTabs[i].ServerValidation = '';
					//orgder of triggerring events is imp.

					//we need to send entire tabs data for sendtoapproval, Save actions
					if (type == provService.contractActionType.SendToApproval &&
						othermodel != undefined && othermodel.tab.Id != undefined && othermodel.tab.Id == vm.PhysicianContractTabs[i].Id) {
						vm.PhysicianContractData.push(othermodel.model);
					} else {
						//broadcastcontractEventInParentControl gets the data from child controllers in PhysicianContractData 
						$('#btnSaveContract' + _contractTabs[i].Id).click();
					}
				}

				//2.vm.performContractActionByType will be called back from child controller  
				var model = vm.getMasterModelForSaving(type, othermodel);

				//assign all tabs data  
				model.PhysicianContract = vm.PhysicianContractData;

				//clear temp variable data
				vm.PhysicianContractData = [];

				//start validating whole form
				var statusInfo = vm.validateEntireFormData(model);
				//clear temp variable 
				if (statusInfo.IsValid) {
					//assign all tabs data 
					model.PhysicianContract = statusInfo.PhysicianContract;
					//just for console
					console.log('Action:' + type);

					console.log(JSON.stringify(model, (k, v) => v === undefined ? 'undefined-->check this out??' : v));
					console.log(JSON.stringify(model));

					provService.performContractActionByType(model, type).then(function (response) {
						vm.handleAllTabsResponse(response, type);
					}, vm.onSaveErrorCallback);
				} else {
					//unblockui
					$.unblockUI();
				}
			}, 10);
		}

		vm.checkAndSetMasterContractId = function (response) {
			//update prov master contract description
			var mastercontractdesc = "";
			if (vm.Prov.MasterContractDetails.SelectedMasterContractId == 0) {
				mastercontractdesc = moment(vm.Prov.MasterContractDetails.MasterContractStartDate).format(vm.dateformat)
					+ '-' + moment(vm.Prov.MasterContractDetails.MasterContractEndDate).format(vm.dateformat);

				//add description to the master dropdown
				var _arr = vm.Prov.PhysicianContractMaster;
				for (var i = 0; i < _arr.length; i++) {
					_arr[i].IsSelected = false;
				}

				_arr.push({ id: response.MasterContractId, label: mastercontractdesc, IsSelected: true });

				vm.Prov.PhysicianContractMaster = _arr;

				//set new master contract Id
				vm.Prov.MasterContractDetails.SelectedMasterContractId = response.MasterContractId;

				//reset fiscal year
				vm.Prov.MasterContractDetails.SelectedYear = null;
			}
		}
		//handle success
		vm.handleAllTabsResponse = function (response, type) {

			//scroll to top to focus user on error msg
			$timeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 200);

			if (response != undefined && response.data != undefined) { response = response.data; }
			//4.handle response   

			//error message
			var MasterContractMessage = null;
			var MessageType = null;

			//when NotificationMessages = null then there validation errors
			if (response.NotificationMessages != null) {
				//success  
				//display userfriendly error message  
				$timeout(function () { UtilService.manageUserFriendlyNotifications(response, vm.Control.pnlMasterContractValidationMessage.id); }, 1100);



				//unblock ui while loading other data 
				$.unblockUI();

				//set if there is a new master contract id
				vm.checkAndSetMasterContractId(response);

				//unblock ui while loading other data
				$timeout(function () { vm.refreshButton(); }, 10);

				//if (vm.Prov.MasterContractDetails.SelectedMasterContractId == 0) {
				//	//set if there is a new master contract id
				//	vm.checkAndSetMasterContractId(response);

				//	//unblock ui while loading other data
				//	$timeout(function () { vm.refreshButton(); }, 10);
				//} else {
				//	//clear all tabs and reload content again 
				//	////unccomment later start
				//	for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
				//		//refresh selected tab content
				//		if (vm.PhysicianContractTabs[i].IsActive == true) {
				//			//pass this message to respective child controls and show them accordingly by tabid  
				//			//assign action type
				//			if (response.NotificationMessages != null && response.NotificationMessages != undefined) {
				//				response.NotificationMessages.actionType = type
				//				response.NotificationMessages.TabId = vm.PhysicianContractTabs[i].Id;
				//			}

				//			//pass response to child control
				//			sharedService.broadcastHandleResponseChildControl({ response: response.NotificationMessages });
				//		}

				//		//set all other tabs data load status to false
				//		vm.PhysicianContractTabs[i].IsDataLoaded = false;
				//	}
				//	//unccomment later end

				//	//REST call:get selected master contract details - asynchronously 
				//	$timeout(function () { vm.getMasterContractDetailsByMasterContractId(vm.Prov.MasterContractDetails.SelectedMasterContractId, true); }, 600);
				//}

			} else {
				var selectedTab = null;
				for (var x = 0; x < vm.PhysicianContractTabs.length; x++) {
					if (vm.PhysicianContractTabs[x].IsActive == true) {
						//vm.PhysicianContractTabs[i].IsActive) {
						selectedTab = vm.PhysicianContractTabs[x];
						break;
					}
				}


				var ContractNotificationMessages = response.ContractNotificationMessages;
				if (ContractNotificationMessages == null) {
					$.unblockUI();
					return;
				}

				if (ContractNotificationMessages != null) {
					for (var i = 0; i < ContractNotificationMessages.length; i++) {
						var _contractObj = ContractNotificationMessages[i];
						if (i == 0) {
							MasterContractMessage = _contractObj.MasterContractMessage;
							MessageType = _contractObj.MessageType;
						}

						//update tab status class
						//if (response.TabId != null) 

						if (_contractObj != null && _contractObj != undefined) {
							_contractObj.actionType = type;
						}

						var ispopupFound = UtilService.isEqual(_contractObj.MessageType, UtilService.MessageType.PopUp);

						var isDataAlreadyLoadedForErrorTab = null;
						//override the tab id with currently active tab in case of any popups
						var errorTab = null;
						for (var x = 0; x < vm.PhysicianContractTabs.length; x++) {
							if (_contractObj.TabId == vm.PhysicianContractTabs[x].Id) {
								//vm.PhysicianContractTabs[i].IsActive) {
								isDataAlreadyLoadedForErrorTab = vm.PhysicianContractTabs[x].IsDataLoaded;

								isDataAlreadyLoadedForErrorTab = isDataAlreadyLoadedForErrorTab == undefined ? false : isDataAlreadyLoadedForErrorTab;
								errorTab = vm.PhysicianContractTabs[x];
								break;
							}
						}

						if (ispopupFound) {
							var customerrormessage = null;
							if (isDataAlreadyLoadedForErrorTab != null && !isDataAlreadyLoadedForErrorTab) {
								//unblock ui 
								$.unblockUI();
								//pass this message to respective child controls and show them accordingly by tabid  
								if (_contractObj.Message.indexOf("There is already a comp model with the same cost center associated.") > -1) {
									$timeout(function () { vm.loadPanelData(errorTab); }, 10);

									customerrormessage = 'As there is already a comp model with the same cost center associated with other unreviewed data. We want you to review ' + errorTab.Name + ' info and resubmit the form again.';
									var custommsgobj = {
										MessageType: 'Validation',
										Message: customerrormessage
									}
									$timeout(function () {
										UtilService.manageUserFriendlyNotifications(custommsgobj, vm.Control.pnlMasterContractValidationMessage.id);
									}, 1000);

									alert(customerrormessage);
								} else {
									//Are you sure you want to Mark Complete? 
									$timeout(function () { vm.loadPanelData(errorTab); }, 10);

									customerrormessage = 'Plese review ' + errorTab.Name + ' and submit the form again. As you want to Mark Complete for the unreviewed comp. model data ' + errorTab.Name;

									if (MasterContractMessage == null) {
										//Validation
										var custommsgobj = {
											MessageType: 'Validation',
											Message: customerrormessage
										}

										$timeout(function () {
											UtilService.manageUserFriendlyNotifications(custommsgobj, vm.Control.pnlMasterContractValidationMessage.id);
										}, 1000);
									}

									alert(customerrormessage);
								}
							}
							else {
								//unblock ui 
								$.unblockUI();
								//pass this message to respective child controls and show them accordingly by tabid 
								sharedService.broadcastHandleResponseChildControl({ response: _contractObj });
							}
						}
						else {
							if (isDataAlreadyLoadedForErrorTab != null && !isDataAlreadyLoadedForErrorTab) {
								//unblock ui 
								$.unblockUI();

								//load panel data
								$timeout(function () { vm.loadPanelData(errorTab); }, 10);

								//pass this message to respective child controls and show them accordingly by tabid 
								$timeout(function () { sharedService.broadcastHandleResponseChildControl({ response: _contractObj }); }, 2500);
							}
							else {
								//unblock ui 
								$.unblockUI();
								//pass this message to respective child controls and show them accordingly by tabid 
								sharedService.broadcastHandleResponseChildControl({ response: _contractObj });
							}
						}
					}
				}
			}

			if (MasterContractMessage != null) {
				//Validation
				var msgobj = {
					MessageType: MessageType,
					Message: MasterContractMessage
				}


				$timeout(function () {
					UtilService.manageUserFriendlyNotifications(msgobj, vm.Control.pnlMasterContractValidationMessage.id);
				}, 800);
			}

			//navgate to the first error tab id
			$timeout(function () { vm.navigateToFirstErrorTabPostData(); }, 500);

		}

		vm.navigateToFirstErrorTabPostData = function () {
			var firstErrorTabId = null;
			for (var i = 0; i < vm.PhysicianContractTabs.length; i++) {
				if (vm.PhysicianContractTabs[i].IsError) {
					firstErrorTabId = vm.PhysicianContractTabs[i].Id;
					break;
				}
			}

			if (firstErrorTabId != null) {
				vm.navigateTabById(firstErrorTabId);
			}
		}

		vm.onSaveErrorCallback = function (jqXHR) {
			//4. unblock ui
			$.unblockUI();

			//scroll to top to focus user on error msg
			$timeout(function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 200);

			//5. handle errors in ui 
			provHelper.handleServerError(jqXHR, vm.Control.pnlMasterContractValidationMessage.id);
		}

	});
})();
