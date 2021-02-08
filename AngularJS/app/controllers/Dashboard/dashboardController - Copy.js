//app.
"use strict";
app.controller('dashboardController', function ($rootScope, $scope, $q, $interval, uiGridExporterConstants, authService, UtilService, dashboardHelper, dashboardService, shareableService, modal) {


	var vm = this;
	//vm.startTime = Date.now();
	//vm.endTime = Date.now();
	//vm.executionTimeDifference;
	vm.testMessage = "this is a test message";
	//vm.modalHeading = "new title 1";
	vm.screenLoading = false;
	var myModal = new modal();
	vm.UserDetail = { orgAdm: 'ORGADM', compadm: 'COMPADM', PHYSICIAN: 'PHYSICN' };

	//vm.multipleProfileOptions = [{ name: "Provider1", payrollid: 101 },
	//{ name: "Provider2", payrollid: 102 },
	//{ name: "Provider3", payrollid: 103 },
	//{ name: "Provider4", payrollid: 104 }];

	const enumWidget = dashboardHelper.enumWidget;


	vm.selectedFilters = {
		YearID: 0,
		searchProviderId: 0,
		searchContractId: 0,
		searchDeptId: 0,
		searchLocationId: 0,
		searchPositionId: 0,
		searchCompensationModelId: 0,
		searchCompModelSpecialtyId: 0,
		searchFiltersDisabled: false,
		searchProviderIdForExtraDBFilters: 0,
	};

	vm.pageSettings = {
		selectedWidgets: []
	};

	vm.BulletinMessages = { id: 'BulletinMessage' };

	vm.InterfaceStatistics = {
		WidgetName: enumWidget.INTSTS, id: 'InterfaceStatistics', apiMethodName: 'InterfaceStatistics'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.INTSTS)
	};
	vm.NegativeProductivityTwoQuarters = {
		WidgetName: enumWidget.NEGPRODTWOQUARTERS, id: 'NegativeProductivityTwoConsecutiveQuarters'
		, apiMethodName: 'NegativeProductivityFortwoConcecutiveQuarters'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.NEGPRODTWOQUARTERS)
	};
	vm.ContractExpiryAndRenewal = {
		WidgetName: enumWidget.CONTRACTEXPIRY, id: 'ContractExpiryRenewal'
		, apiMethodName: 'ProviderContractExpiryAndRenewalForWeb'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.CONTRACTEXPIRY)
	};
	vm.PendingApprovals = {
		WidgetName: enumWidget.PendingApprovalsWidget, id: 'PendingApprovals'
		, apiMethodName: 'PendingApproval'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.PendingApprovalsWidget)
	};
	vm.FteDiscrepancy = {
		WidgetName: enumWidget.FTEWIDGET, id: 'FTEDiscrepancyWidget'
		, apiMethodName: 'FteDiscrepancy'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.FTEWIDGET)
	};
	vm.ProviderBreakDownBySpecialty = {
		WidgetName: enumWidget.SPLBRKDOWN, id: 'ProviderBreakdownbySpecialty', apiMethodName: 'ProviderBreakDownBySpecialtyForWeb'
		, nodatamsg: dashboardHelper.provnodataMessage
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.SPLBRKDOWN)
	};
	vm.ProviderExpirationDetails = {
		WidgetName: enumWidget.PHYSEXPDET, id: 'ExpirationDetails', apiMethodName: 'ProviderExpirationDetails'
		//, gridOptions: dashboardHelper.getGridConfig("",false)
		//, gridOptions: dashboardHelper.getGridConfig("", false)
		, gridOptions: dashboardHelper.getGridObject(enumWidget.PHYSEXPDET)
	};

	vm.LastPayPeriodProcessed = {
		WidgetName: enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE, id: 'divLastPayPeriodProcessed'
		, apiMethodName: 'LastPayPeriodProcessedForWeb'
		, nodatamsg: dashboardHelper.provnodataMessage
		, gridOptions: dashboardHelper.getGridObject(enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE)
	};
	vm.LastPayPeriodInboundReceived = {
		WidgetName: enumWidget.LastPayPeriodInboundReceived, id: 'divLastPayPeriodInboundReceived'
		, apiMethodName: 'LastPayPeriodInboundReceived' //update
		, clearDataBeforeLoading: true
		, nodatamsg: dashboardHelper.provnodataMessage
		, gridOptions: dashboardHelper.getGridObject(enumWidget.LastPayPeriodInboundReceived)
	};

	vm.gridOperation = {
		isHeader: function (val) {
			return UtilService.isEqual(val, 'header');
		}, isFooter: function (val) {
			return UtilService.isEqual(val, 'footer');
		}
	};

	vm.WRVUsProductivityStatsByLocation = {
		WidgetName: enumWidget.WRVUPRODLOC, id: 'wRVUsProductivityStatsByLocation'
		, apiMethodName: 'WorkRVUsProductivityStatsByLocation'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.WRVUPRODLOC)
	};

	vm.LevelsOfExperience = {
		WidgetName: enumWidget.LEVELSOFEXPERIENCE, id: 'LevelsOfExperienceWidget'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.LEVELSOFEXPERIENCE)

		, apiMethodName: 'LevelsOfExperienceWidget'
		, LevelsOfExperienceDays: [{ Days: '30' }, { Days: '60' }, { Days: '90' }]
		, modelDays: '30'
		, onLevelExpDaysChange: function () {
			console.log("LevelsOfExperience.onLevelExpDaysChange triggered");

			var item = vm.LevelsOfExperience;
			//reset only the input values that changes, rest values will be there as is
			item.query.month = vm.LevelsOfExperience.modelDays;
			vm.loadDataByWidget(item);
		}
	};

	vm.CMEBalance = {
		WidgetName: enumWidget.CMEWIDGET, id: 'CMEBalanceWidget', apiMethodName: 'YtdcmeBalanceForWeb'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.CMEWIDGET)
	};

	vm.YTDPTOBalance = {
		WidgetName: enumWidget.PTOWIDGET, id: 'YTDPTOBalanceWidget', apiMethodName: 'YTDPTOBalanceForWeb'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.PTOWIDGET)
	};

	vm.LOARecordsHRInterface = {
		WidgetName: enumWidget.LOAWIDGET, id: 'LOARecordsHRFile', apiMethodName: 'LoaFromHRInterfaceWidget'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.LOAWIDGET)
	};

	vm.BudgetsActuals = {
		WidgetName: enumWidget.BudgetActuals, id: 'BudgetsActuals', apiMethodName: 'BudgetActuals'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.BudgetActuals)
	};

	vm.wRVUsVariance = {
		WidgetName: enumWidget.ZEROWRVUS, id: 'wRVUsVariance', apiMethodName: 'ZerowRVUsMonthWiseComparisonForWeb'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.ZEROWRVUS)

		//This is is used to call after clicked and un-clicked of checkbox in wRVUsVariance Widget and pass the click event also.
		, wRVUsVariance_IncludeAdj_Checked: function () {
			var item = vm.wRVUsVariance;
			item.query.includeAdjustments = item.checked == true ? 1 : 0;
			vm.loadDataByWidget(item);
		}
	};

	vm.MasterContractExpiry = {
		WidgetName: enumWidget.MASTERCONTRACTEXPIRATION, id: 'MasterContractExpiry', apiMethodName: 'MasterContractExpiry'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.MASTERCONTRACTEXPIRATION)
	};

	vm.PayApprovalsPendingIncentives = {
		WidgetName: enumWidget.PAYAPPROVALSPENDINGINCENTIVES, id: 'PayApprovalsPendingIncentives', apiMethodName: 'PayApprovalPending'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.PAYAPPROVALSPENDINGINCENTIVES)
	};

	vm.HospitalistShiftTarget = {
		WidgetName: enumWidget.HOSPITALISTSHIFTTARGET, id: 'HospitalistShiftTarget', apiMethodName: 'HospitalistShiftTargetAlert'
		//, gridOptions: dashboardHelper.getGridConfig()
		, gridOptions: dashboardHelper.getGridObject(enumWidget.HOSPITALISTSHIFTTARGET)
	};

	vm.YTDShiftSummary = { WidgetName: enumWidget.YTDShiftSummary, id: 'YTDShiftSummary', apiMethodName: 'YTDShiftSummary' };

	vm.wRVUAnalysisPast12Months = {
		WidgetName: enumWidget.wRVUAnalysis, id: 'wRVUAnalysisPast12Months'
		, apiMethodName: 'WorkRVUAnalysisSummaryForWeb'
		, nodatamsg: dashboardHelper.provnodataMessage
	};

	vm.AlertNotifications = {
		WidgetName: enumWidget.TERMINATIONALERTS,
		id: 'AlertNotification',
		apiMethodName: 'AlertWidgetForWeb',
		modelNotificationDays: '30'
		, modelNotificationTypes: 'All'
		, onAlertDaysChange: function () {
			//console.log("AlertNotifications.onAlertDaysChange triggered")

			var item = vm.AlertNotifications;
			//reset only the input values that changes, rest values will be there as is
			item.query.alertNotificationTypeID = vm.AlertNotifications.modelNotificationTypes == 'All' ? '' : vm.AlertNotifications.modelNotificationTypes;
			item.query.days = vm.AlertNotifications.modelNotificationDays == 'All' ? '' : vm.AlertNotifications.modelNotificationDays;

			vm.loadDataByWidget(item);
		}
		, gridOptions: dashboardHelper.getGridObject(enumWidget.TERMINATIONALERTS)

	};

	vm.TerminationProvidersDetails = {
		WidgetName: enumWidget.TERMINATIONPROVIDERS,
		id: 'divTerminationProvidersDetails',
		apiMethodName: 'TerminationProviders',
		clearDataBeforeLoading: true,
		gridOptions: dashboardHelper.getGridObject(enumWidget.TERMINATIONPROVIDERS),
		showdiablechecked: false,
		showDisableClick: function () {
			var item = vm.TerminationProvidersDetails;

			setTimeout(function () {
				item.loading = true;
				item.gridOptions.data = [];
			}, 10);

			setTimeout(function () {
				//reset only the input values that changes, rest values will be there as is
				item.query.retValue = 0;

				item.query.isDisableTerminationAlert = vm.TerminationProvidersDetails.showdiablechecked;
				item.query.physicianId = vm.selectedFilters.searchProviderId;
				item.query.isTerminationProvider = false;

				vm.loadDataByWidget(item);
			}, 20);
		},
		isAlertPhy_Checked: function ($event, accept, row) {
			if ($event !== undefined) {
				var checkbox = $event.target;
				var item = vm.TerminationProvidersDetails;

				//reset only the input values that changes, rest values will be there as is
				item.query.retValue = 1;

				item.query.isDisableTerminationAlert = vm.TerminationProvidersDetails.showdiablechecked;
				item.query.searchPhysicianId = vm.selectedFilters.searchProviderId;
				item.query.physicianId = row.entity.PhysicianId;
				item.query.isTerminationProvider = checkbox.checked;

				//now remove row from grid when checkbox is checked but Show Disable is unchecked
				if (!vm.TerminationProvidersDetails.showdiablechecked) {
					if (checkbox.checked) {
						var _data = item.gridOptions.data;
						for (var i = 0; i < _data.length; i++) {
							if (_data[i].PhysicianId == row.entity.PhysicianId) {
								item.gridOptions.data.splice(i, 1);
								break;
							}
						}

						//uncheck all check boxes
						setTimeout(function () {
							$('input[custom-class="' + enumWidget.TERMINATIONPROVIDERS + '-PhysicianName-checkbox"]').prop("checked", false);
						}, 10);
					}
				}

				//after reset reload data on success call back
				vm.loadDataByWidgetWithCallBack(item, item.successCallBack);
			}
		},
		successCallBack: function (response) {
			var item = vm.TerminationProvidersDetails;

			//reset all the parameters
			item.query.searchPhysicianId = vm.selectedFilters.searchProviderId;
			item.query.physicianId = 0;
			item.query.retValue = 0;
			item.query.isTerminationProvider = false;

		}
	};

	vm.wRVUsProductivityStatsBySpecialty = {
		list: [],
		gridOptions: dashboardHelper.getGridObject(enumWidget.WRVUPRODSPL)

	};

	vm.ProviderBreakdownByCompModel = { WidgetName: enumWidget.COMPMDLBRKDOWN, id: 'ProviderBreakdownByCompModel' };

	vm.PayElementsActualPerformance = {};

	vm.PhysicianwRVUs = {
		WidgetName: enumWidget.PhysicianwRVUs, id: 'PhysicianwRVUs',
		showLineChart: false
	};

	vm.PTOLTS = {
		WidgetName: enumWidget.PTOLTS, id: 'divPTOLTS', apiMethodName: 'PTOLTS'
		, gridOptions: dashboardHelper.getGridObject(enumWidget.PTOLTS)
		, modelPTOLTS: 0
		, PTOLTSOptions: [{ id: 0, Option: 'PTO' }, { id: 1, Option: 'LTS' }]
		, onPTOLTSChange: function () {
			console.log("PTOLTS.onPTOLTSChange triggered");

			var item = vm.PTOLTS;
			//reset only the input values that changes, rest values will be there as is
			item.query.reportType = vm.PTOLTS.modelPTOLTS == 0 ? vm.PTOLTS.PTOLTSOptions[0].Option : vm.PTOLTS.PTOLTSOptions[1].Option;
			vm.loadDataByWidget(item);
		}
	};

	vm.OveragePaymentAlert = {
		WidgetName: enumWidget.OveragePaymentAlert, id: 'divOveragePaymentAlert', apiMethodName: 'OveragePaymentAlert'
		, gridOptions: dashboardHelper.getGridObject(enumWidget.OveragePaymentAlert)
		, selectedPayPeriodType: 2
		, PayPeriodOptions: [{ id: 1, Option: 'Processed Pay Period' }, { id: 2, Option: 'To Be Processed Pay Period' }]
		, onChange: function () {
			var item = vm.OveragePaymentAlert;
			//reset only the input values that changes, rest values will be there as is
			item.query.payPeriodType = vm.OveragePaymentAlert.selectedPayPeriodType;
			vm.loadDataByWidget(item);
		}
	};




	//vm.PopupData = [];
	//vm.PopupData.gridOptions = {
	//    enableGridMenu: true,
	//    enableSorting: true,
	//    exporterMenuCsv: false,
	//    enableColumnMenus: false,
	//    paginationPageSizes: [10, 25, 50, 100, 250, 500],
	//    paginationPageSize: 10
	//};

	//Modal Popup dynamic data
	$rootScope.gridOptions = {
		enableGridMenu: false,
		enableSorting: false,
		exporterMenuCsv: false,
		enableColumnMenus: false,
		paginationPageSizes: [10, 25, 50, 100],
		paginationPageSize: 10
	};

	//Filter Model variables
	vm.MultiProfilesFilter = {
		enableProfileModal: false,
		Profiles: null,
		settings: {
			checkBoxes: true,
			selectionLimit: 1,
			scrollable: true,
			showUncheckAll: false,
			scrollableHeight: '300px',
			displayProp: 'ProviderName',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].ProviderName;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		}
	};


	vm.yearsFilter = {
		settings: {
			checkBoxes: true,
			selectionLimit: 1,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'Year',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].Year;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		texts: { buttonDefaultText: 'Select Years' },
		events: {
			onSelectionChanged: function () {
				vm.selectedFilters.YearID = UtilService.getIdFromJSON(vm.yearsFilter.model, "YearID");
			}
		}
	};

	vm.regionFilter = {
		settings: {
			checkBoxes: true,
			showCheckAll: true,
			showUncheckAll: true,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'RegionDesc',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].RegionDesc;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		events: {
			onSelectionChanged: function () {

				//console.log("Fired from Region Dropdown on selected index change")
				vm.selectedFilters.regionIDs = UtilService.getIdFromJSON(vm.regionFilter.model, "RegionId");
				vm.GetLocationFilterList().then(vm.GetDepartmentFilterList);
			}
			//onItemSelect: function () {
			//    
			//    //console.log("Fired from Region Dropdown on selected index change")
			//    vm.selectedFilters.regionIDs = UtilService.getIdFromJSON(vm.regionFilter.model, "RegionId");
			//    vm.GetLocationFilterList().then(vm.GetDepartmentFilterList);
			//},
			//onItemDeselect: function () {
			//    
			//    //console.log("Fired from Region Dropdown on selected index change")
			//    vm.selectedFilters.regionIDs = UtilService.getIdFromJSON(vm.regionFilter.model, "RegionId");
			//    vm.GetLocationFilterList().then(vm.GetDepartmentFilterList);
			//},
			//onDeselectAll: function () {
			//    
			//    vm.selectedFilters.regionIDs = "";
			//    vm.selectedFilters.locationIDs = "";
			//    vm.GetLocationFilterList().then(vm.GetDepartmentFilterList).then(() => {
			//        vm.locationFilter.model = "";
			//        vm.departmentFilter.model = "";
			//    });
			//}
		},
		texts: { buttonDefaultText: 'Select Region' },
	};

	vm.locationFilter = {
		settings: {
			checkBoxes: true,
			showCheckAll: true,
			showUncheckAll: true,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'LocationDesc',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].LocationDesc;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		events: {
			onSelectionChanged: function () {

				//console.log("Fired from Location Dropdown on selected index change")
				vm.selectedFilters.locationIDs = UtilService.getIdFromJSON(vm.locationFilter.model, "LocationId");
				vm.GetDepartmentFilterList();
			}
			//onDeselectAll: function () {
			//    vm.selectedFilters.locationIDs = "";
			//    vm.GetDepartmentFilterList().then("");
			//}
		},
		texts: { buttonDefaultText: 'Select Location' }
	};

	vm.departmentFilter = {
		settings: {
			checkBoxes: true,
			showCheckAll: true,
			showUncheckAll: true,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'CostCenterDesc',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].CostCenterDesc;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		texts: { buttonDefaultText: 'Select Cost Center' }
	};

	vm.compModelFilter = {
		settings: {
			checkBoxes: true,
			showCheckAll: true,
			showUncheckAll: true,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'CompensationModel',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].CompensationModel;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		texts: { buttonDefaultText: 'Select Comp Model' }
	};

	vm.specialtyGroupFilter = {
		settings: {
			checkBoxes: true,
			showCheckAll: true,
			showUncheckAll: true,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'SpecialtyGroupName',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].SpecialityDesc;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		texts: { buttonDefaultText: 'Select Specialty Group' }
	};

	vm.specialtyFilter = {
		settings: {
			checkBoxes: true,
			showCheckAll: true,
			showUncheckAll: true,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'SpecialityDesc',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].SpecialityDesc;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		texts: { buttonDefaultText: 'Select Specialty' }
	};

	vm.directorFilter = {
		settings: {
			checkBoxes: true,
			selectionLimit: 1,
			scrollable: true,
			scrollableHeight: '300px',
			displayProp: 'UserName',
			keyboardControls: true,
			clearSearchOnClose: true,
			smartButtonTextProvider(selectionArray) {
				if (selectionArray.length === 1) {
					return selectionArray[0].UserName;
				}
				else {
					return selectionArray.length + ' Selected';
				}
			}
		},
		texts: { buttonDefaultText: 'Select Director' }
	};


	vm.GetYearsFilterList = async function () {

		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getYearsList(query).then(function (response) {
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				vm.yearsFilter.options = response.data.YearResultInfo;
				vm.yearsFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.yearsFilter.options, 'IsSelected');

				vm.selectedFilters.YearID = UtilService.getIdFromJSON(vm.yearsFilter.model, "YearID");
			}
			else {
				//pending in case of no data returned
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetYearsFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
		});
	}

	vm.GetRegionFilterList = async function () {
		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode,
			currentUserRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole
		};

		var deferred = $q.defer();
		//3. make service call
		dashboardService.getRegionsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.RegionResult[0].RegionDesc === 'Select all')
					response.data.RegionResult.splice(0, 1);
				vm.regionFilter.options = response.data.RegionResult;

				vm.regionFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.regionFilter.options, 'IsSelected');
				vm.selectedFilters.regionIDs = UtilService.getIdFromJSON(vm.regionFilter.model, "RegionId");
				deferred.resolve(vm.selectedFilters.regionIDs);
			}
			else {
				//pending in case of no data returned
				deferred.reject("error", response);
			}

			//4.Unblock UI


		}, function (error) {
			console.log("Error in GetRegionFilterList", error);
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		});
		return deferred.promise;
	}

	vm.GetLocationFilterList = async function () {

		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode,
			regionIds: vm.selectedFilters.regionIDs
		};

		var deferred = $q.defer();
		//3. make service call
		dashboardService.getLocationsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.LocationResult[0].LocationDesc === 'Select all')
					response.data.LocationResult.splice(0, 1);
				vm.locationFilter.options = response.data.LocationResult;
				if (vm.selectedFilters.regionIDs)
					vm.locationFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.locationFilter.options, 'IsSelected');
				else
					vm.locationFilter.model = [];
				vm.selectedFilters.locationIDs = UtilService.getIdFromJSON(vm.locationFilter.model, "LocationId");
				deferred.resolve(response);
			}
			else {
				//pending in case of no data returned
				deferred.reject("error", response);
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetLocationFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
			deferred.reject(error);
		});
		return deferred.promise;
	}

	vm.GetDepartmentFilterList = async function () {

		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode,
			regionIds: vm.selectedFilters.regionIDs,
			locationIds: vm.selectedFilters.locationIDs
		};

		var deferred = $q.defer();
		//3. make service call
		dashboardService.getDepartmentsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.CostCenterResult[0].CostCenterDesc === 'Select all')
					response.data.CostCenterResult.splice(0, 1);
				vm.departmentFilter.options = response.data.CostCenterResult;
				if (vm.selectedFilters.locationIDs)
					vm.departmentFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.departmentFilter.options, 'IsSelected');
				else
					vm.departmentFilter.model = [];
				deferred.resolve(response);
			}
			else {
				//pending in case of no data returned
				deferred.reject("error", response);
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetDepartmentFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
			deferred.reject(error);
		});
		return deferred.promise;
	}

	vm.GetCompModelFilterList = async function () {
		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getCompModelsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.CompensationModelResult[0].CompensationModel === 'Select all')
					response.data.CompensationModelResult.splice(0, 1);
				vm.compModelFilter.options = response.data.CompensationModelResult;
				vm.compModelFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.compModelFilter.options, 'IsSelected');
			}
			else {
				//pending in case of no data returned
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetCompModelFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
		});
	}

	vm.GetSpecialtyGroupFilterList = async function () {
		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getSpecialtyGroupsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.SpecialtyGroupResult[0].SpecialtyGroupName === 'Select all')
					response.data.SpecialtyGroupResult.splice(0, 1);
				vm.specialtyGroupFilter.options = response.data.SpecialtyGroupResult;
				vm.specialtyGroupFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.specialtyGroupFilter.options, 'IsSelected');
			}
			else {
				//pending in case of no data returned
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetSpecialtyGroupFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
		});
	}

	vm.GetSpecialtyFilterList = async function () {
		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getSpecialtiesList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.SpecialtyResult[0].SpecialityDesc === 'Select all')
					response.data.SpecialtyResult.splice(0, 1);
				vm.specialtyFilter.options = response.data.SpecialtyResult;
				vm.specialtyFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.specialtyFilter.options, 'IsSelected');
			}
			else {
				//pending in case of no data returned
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetSpecialtyFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
		});
	}

	vm.GetDirectorsFilterList = async function () {
		//1.Show Loading screen

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getDirectorsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.DirectorResult[0].UserName === 'Select all')
					response.data.DirectorResult.splice(0, 1);
				vm.directorFilter.options = response.data.DirectorResult;
				vm.directorFilter.model = UtilService.getCustomSelectedDropdownListValuesByProp(vm.directorFilter.options, 'IsSelected');
			}
			else {
				//pending in case of no data returned
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetDirectorsFilterList", error)
			//5. unblock ui
			//6. handle errors in ui
		});
	}

	/* auto complete: provider search */
	vm.providerAutoCompletion = function () {
		//set up auto complete
		$(".autosuggest").autocomplete({
			source: function (request, response) {
				if (request.term.length >= 1) {
					var query = {
						searchParams: $.trim(request.term),
						currentRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					//get the data
					shareableService.providerSearch(query).then(providerSearchCallback, function errorCallback(err) {
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
				//// capture provider Id and reset textbox title
				////extract provider Id from label 
				vm.selectedFilters.searchProviderId = data.item.val;
				vm.selectedFilters.searchFiltersDisabled = true;
				//send Provider ID for DB Filters for extra settings
				vm.selectedFilters.searchProviderIdForExtraDBFilters = data.item.val;
				vm.getProviderRolesAndInitWidgets();
			},
			minLength: 1
		});

		$(".autosuggest").on("input propertychange", function () {
			if (!this.value) {
				//console.log("changed to : ", this.value);
				vm.selectedFilters.searchProviderId = 0;

				vm.selectedFilters.searchFiltersDisabled = false;
				//reset the Provider ID for DB Filters for extra settings
				vm.selectedFilters.searchProviderIdForExtraDBFilters = 0;
				vm.getProviderRolesAndInitWidgets();
			}
		});
	}


	vm.saveFilters = function () {
		//console.log("saveFilters called");
		vm.screenLoading = true;
		//1.Show Loading screen

		//2.prepare model
		var query = {
			"ProviderId": 0,
			"RegionIds": vm.selectedFilters.regionIDs,
			"LocationIds": vm.selectedFilters.locationIDs,
			"CostCenterIds": UtilService.getIdFromJSON(vm.departmentFilter.model, "CostCenterId"),
			"CompensationModelIds": UtilService.getIdFromJSON(vm.compModelFilter.model, "CompensationModelId"),
			"SpecialityGroupIds": UtilService.getIdFromJSON(vm.specialtyGroupFilter.model, "SpecialtyGroupId"),
			"SpecialtyIds": UtilService.getIdFromJSON(vm.specialtyFilter.model, "SpecialityId"),
			"Year": vm.selectedFilters.YearID, //UtilService.getIdFromJSON(vm.yearsFilter.model, "YearID"),
			"DirectorId": UtilService.getIdFromJSON(vm.directorFilter.model, "DirectorId"),
			"CurrentUserRoleCode": vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};
		//3. make service call
		dashboardService.saveFilterList(query).then(function (response) {
			if (response != null && response != undefined && response.MessageType.toLowerCase() === "Success".toLowerCase()) {
				//alert(response.data.Message)
				//vm.topFilterMessage = 'Data saved successfully';
				//$("#topFilterMessage").modal();
				vm.initWidgets();
			}
			else {
				//pending in case of no data returned
				//alert("Error saving the data")
				vm.topFilterMessage = 'Error saving the data';
				$("#topFilterMessage").modal();
			}

			//4.Unblock UI

		}
			//, function (error) {
			////console.log("Error in saveFilters", error)
			////5. unblock ui
			//    //6. handle errors in ui
			//}
		).catch(error => {
			//Error message handling for all then functions
			console.log("Error in saveFilters", error)
			//deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
			vm.screenLoading = false;
		});
	}

	vm.GetBulletinWidget = async function () {
		//1.Show Loading screen
		vm.BulletinMessages.loading = true;

		//2.prepare model
		var query = {
			providerId: vm.selectedFilters.searchProviderId,
			regionId: vm.selectedFilters.regionIDs,
			locationId: vm.selectedFilters.locationIDs,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getBulletinList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				vm.BulletinMessages.data = response.data.BulletInMessagesList;
			}
			else {
				//In case of no data returned
				vm.BulletinMessages.data = null;
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetBulletinWidget", error)
			//5. unblock ui
			//6. handle errors in ui
		}).catch(function () {
		}).finally(function () {
			vm.BulletinMessages.loading = false;
		});
	}

	vm.loadDataByWidget = function (source, successCallBack, errorCallBack) {
		//1.Show Loading screen
		source.loading = true;

		var item = dashboardHelper.getWidgetObject(vm, source);


		item.HeaderName = item.widget.WidgetName;

		//set file name
		if (item.gridOptions != undefined) {
			//item.gridOptions.exporterPdfFilename = item.HeaderName + '.pdf';
			item.gridOptions.exporterPdfFilename = item.HeaderName + '.pdf';

			if (item.HeaderName != undefined && item.HeaderName != null) {
				item.gridOptions.exporterExcelSheetName = item.HeaderName.replace(/[^a-zA-Z0-9]/g, '');
				item.gridOptions.exporterExcelFilename = item.HeaderName.replace(/[^a-zA-Z0-9]/g, '') + '.xlsx';
			}

			//update header name and pay period  
			if (item.gridOptions.exporterPdfHeader && item.gridOptions.exporterPdfHeader.columns && item.gridOptions.exporterPdfHeader.columns != null && item.gridOptions.exporterPdfHeader.columns.length > 0) {
				item.gridOptions.exporterPdfHeader.columns[0].text = item.HeaderName;
			}

			if (item.clearDataBeforeLoading && item.gridOptions.data != undefined)
				item.gridOptions.data = [];
		}

		var $widgetdiv = $("#" + item.id);

		if ($widgetdiv != null) {
			var width = vm.SetWidgetDimentions(item.widget.HorizantalSpot, 4);
			var height = vm.SetWidgetDimentions(item.widget.VerticalSpot, 6);
			var Xaxis = vm.SetWidgetDimentions(item.widget.DataXaxis, 1);
			var Yaxis = vm.SetWidgetDimentions(item.widget.DataYaxis, 6);

			$widgetdiv.attr({
				'data-gs-x': Xaxis,
				'data-gs-y': Yaxis,
				'data-gs-width': width,
				'data-gs-height': height
			}).show();
		}

		//2.prepare model
		var query = item.query;

		//clear any error messages
		dashboardHelper.clearNotificationsByDiv($widgetdiv);
		//3. make service call
		dashboardService.loadDataByWidget(query, item.apiMethodName).then(function (response) {
			//item.loading = false;
			//handle response
			dashboardHelper.handleResponseByWidget(response, vm, item);

			//set data
			dashboardHelper.setWidgetData(vm, item);

			if (successCallBack != undefined) {
				successCallBack(response);
			}
		}, function (jqXHR) {
			//item.loading = false;
			item.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }

			//set data
			dashboardHelper.setWidgetData(vm, item);

			//log error
			dashboardHelper.handleServerError(jqXHR, $widgetdiv, item.nodatamsg);

			if (errorCallBack != undefined) {
				errorCallBack(jqXHR);
			}
		}).finally(function () {
			item.loading = false;
		});
	}

	vm.loadDataByWidgetWithCallBack = function (source, successCallBack, errorCallBack) {
		//source.loading = true;

		var item = dashboardHelper.getWidgetObject(vm, source);

		var $widgetdiv = $("#" + item.id);

		//2.prepare model
		var query = item.query;

		//clear any error messages
		dashboardHelper.clearNotificationsByDiv($widgetdiv);
		//3. make service call
		dashboardService.loadDataByWidget(query, item.apiMethodName).then(function (response) {

			if (successCallBack != undefined) {
				successCallBack(response);
			}
		}, function (jqXHR) {
			//item.loading = false;
			//item.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }

			//set data
			//dashboardHelper.setWidgetData(vm, item);

			//log error
			//dashboardHelper.handleServerError(jqXHR, $widgetdiv, item.nodatamsg); 
		}).finally(function () {
			//item.loading = false;
		});
	}

	vm.GetAlertNotificationTypesValues = async function () {

		var query = {};
		//make service call
		dashboardService.getAlertNotificationTypesList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				vm.AlertNotifications.NotificationTypes = response.data.NotificationTypes;
			}
			else {
				//In case of no data returned
			}
		}, function (error) {
			console.log("Error in GetAlertNotificationDropdownValues", error)
			//6. handle errors in ui
		});
	}

	vm.GetAlertNotificationDaysValues = async function () {

		var query = {};
		//make service call
		dashboardService.getAlertNotificationDaysList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				//var map = new Map(response);
				vm.AlertNotifications.NotificationDays = response.data;
			}
			else {
				//In case of no data returned
			}
		}, function (error) {
			console.log("Error in GetAlertNotificationDropdownValues", error)
			//6. handle errors in ui
		});
	}

	vm.GetNotificationLegendValues = async function () {
		if (!vm.NotificationLegend || vm.NotificationLegend == null || vm.NotificationLegend == undefined || vm.NotificationLegend.length < 1) {
			var query = {};
			//make service call
			dashboardService.getNotificationLegendList(query).then(function (response) {

				if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {

					//var map = new Map(response);
					vm.NotificationLegend = response.data.alertWidgeLegendResults;
				}
				else {
					//In case of no data returned
				}
			}, function (error) {
				console.log("Error in GetNotificationLegendValues", error)
				//6. handle errors in ui
			});
		}
	}

	vm.GetHideBenchmarkingDataValue = function (item) {
		var query = {
			roleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};
		var HideBenchmarkingData = false;
		//make service call
		dashboardService.getBenchMarkDataByGeneralSettings(query).then(function (response) {
			if (response != null && response != undefined) {
				if (response.toLowerCase() == 'true'.toLowerCase()) {
					HideBenchmarkingData = true;
				}
			}
			item.HideBenchmarkingData = HideBenchmarkingData;
			vm.loadDataByWidget(item);
		}, function (jqXHR) {
			item.HideBenchmarkingData = HideBenchmarkingData;

			//Ignore exception and continue
			vm.loadDataByWidget(item);
			////log error
			dashboardHelper.handleServerError(jqXHR, "abc", item.nodatamsg);
		});
	}

	vm.GetwRVUsProductivityStatsBySpecialtyWidget = async function () {
		//1.Show Loading screen
		vm.wRVUsProductivityStatsBySpecialty.loading = true;

		//get Link enabled status
		var myElement = vm.pageSettings.selectedWidgets.find((element) => element.WidgetCode === enumWidget.WRVUPRODSPL);

		//2.prepare model
		var query = {
			providerId: vm.selectedFilters.searchProviderId,
			year: vm.selectedFilters.YearID,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getWorkRVUsProductivityStatsBySpecialtyList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				vm.wRVUsProductivityStatsBySpecialty.LastMonthwRVUUploaded = response.data.HeaderDetails.HeaderName;
				//vm.wRVUsProductivityStatsBySpecialty.gridOptions.headerTemplate = ''

				//if (response.data.HeaderDetails.HeaderDetails.length < 10) {
				//    vm.wRVUsProductivityStatsBySpecialty.gridOptions.enableHorizontalScrollbar = 0;
				//    vm.wRVUsProductivityStatsBySpecialty.gridOptions.enableVerticalScrollbar = 0;
				//}
				vm.wRVUsProductivityStatsBySpecialty.gridOptions = {
					columnDefs: [
						{
							field: 'Specialty', displayName: response.data.HeaderColumns[0].ColumnName, enableColumnMenu: false, headerCellClass: 'txt-left-align', headerTooltip: true,
							cellTemplate: '<div title="{{row.entity.Specialty}}" class="ui-grid-cell-contents txt-left-align"><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.wRVUsProductivitySpecialty_click(row)">{{row.entity.Specialty}}</a></div>',
							footerCellTemplate: '<div class="ui-grid-cell-contents text-right">Total: </div>'
						},
						{
							field: 'YTDwRVU', displayName: response.data.HeaderColumns[1].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', enableColumnMenu: false, headerTooltip: true, cellTooltip: true,
							footerCellTemplate: '<div class="ui-grid-cell-contents" style="">' + response.data.HeaderDetails.TotalYTDwRVUs + '</div>'
						},
						{
							field: 'TargetwRVU', displayName: response.data.HeaderColumns[2].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', enableColumnMenu: false, headerTooltip: true, cellTooltip: true,
							footerCellTemplate: '<div class="ui-grid-cell-contents" style="">' + response.data.HeaderDetails.TotalTargetwRVUs + '</div>'
						},
						{ field: 'Variance', displayName: response.data.HeaderColumns[3].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
					],
					data: response.data.HeaderDetails.HeaderDetails
				};
			}
			else {
				//In case of no data returned
				vm.wRVUsProductivityStatsBySpecialty.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }
			}

			//4.Unblock UI

		}, function (error) {
			console.log("Error in GetwRVUsProductivityStatsBySpecialtyWidget", error)
			//5. unblock ui
			//6. handle errors in ui
		}).catch(function () {
		}).finally(function () {
			vm.wRVUsProductivityStatsBySpecialty.loading = false;
		});
	}

	vm.GetProviderBreakdownByCompModelWidget = async function () {

		//1.Show Loading screen
		vm.ProviderBreakdownByCompModel.loading = true;
		//2.prepare model
		var query = {
			providerId: vm.selectedFilters.searchProviderId,
			year: vm.selectedFilters.YearID,
			currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID,
			contractId: vm.selectedFilters.searchContractId,
			deptId: vm.selectedFilters.searchDeptId,
			locationId: vm.selectedFilters.searchLocationId,
			positionId: vm.selectedFilters.searchPositionId,
			compensationModelId: vm.selectedFilters.searchCompensationModelId,
			compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode

		};
		//3. make service call
		dashboardService.getProviderBreakdownByCompModelList(query).then(function (response) {

			vm.ProviderBreakdownByCompModel.loading = false;
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "" &&
				response.data.HeaderDetails && response.data.HeaderDetails != null && response.data.HeaderDetails != undefined && response.data.HeaderDetails.length > 0) {

				//Pie chart
				var dataSource = response.data.HeaderDetails;
				var ProviderTotal = dataSource != undefined ? dataSource[0].TotalCount : 0;

				vm.initializeProviderBreakdownByCompModelChart(dataSource, "Provider Total: " + ProviderTotal);

			}
			//else if (response == null || response == undefined || response.data == '' || response.status == 204) {
			//    //In case of no data returned 
			//    vm.initializeProviderBreakdownByCompModelChart(null, "Provider Total: 0");
			//}
			else {
				//In case of no data returned 
				//error in fetching data
				vm.initializeProviderBreakdownByCompModelChart(null, "Provider Total: 0");
			}

			//4.Unblock UI

		}, function (error) {
			vm.ProviderBreakdownByCompModel.loading = false;
			vm.initializeProviderBreakdownByCompModelChart(null, "Provider Total: 0");
			console.log("Error in GetProviderBreakdownByCompModelWidget", error)
			//5. unblock ui
			//6. handle errors in ui
		}).catch(function () {
		}).finally(function () {
			vm.ProviderBreakdownByCompModel.loading = false;
		});
	}

	vm.initializeProviderBreakdownByCompModelChart = function (dataSource, title) {

		$("#ProviderBreakdownByCompModelChart").dxPieChart({
			palette: "bright",
			dataSource: dataSource,
			title: title,
			margin: {
				bottom: 2
			},
			legend: {
				position: "outside", // or "inside"
				horizontalAlignment: "right", // or "left" | "right"
				verticalAlignment: "top", // or "bottom",
			},
			animation: {
				enabled: false
			},
			//"export": {
			//    enabled: true
			//},
			resolveLabelOverlapping: "shift",
			tooltip: {
				enabled: true,
				customizeTooltip: function (arg) {
					return {
						text: arg.valueText
					};
				}
			},
			loadingIndicator: {
				enabled: true
			},
			series: {
				argumentField: 'CompensationModel',
				valueField: 'CompensationModelCount',
				label: {
					format: {
						type: "decimal"
					},
					visible: true,
					connector: { visible: true },
					wordWrap: 'normal',
					textOverflow: 'none',
					customizeText: function (arg) {
						//return arg.argumentText + " (" + arg.percentText + ")";
						return arg.percentText;
					}
				}
			}
		});
	}

	vm.GetPhysicianwRVUsWidget = async function () {
		//1.Show Loading screen
		vm.PhysicianwRVUs.loading = true;
		vm.PhysicianwRVUs.showLineChart = false;
		//2.prepare model
		var query = {
			includeAdjustments: vm.PhysicianwRVUs.checked == true ? true : false,
			providerId: vm.selectedFilters.searchProviderId,
			contractId: vm.selectedFilters.searchContractId,
			deptId: vm.selectedFilters.searchDeptId,
			locationId: vm.selectedFilters.searchLocationId,
			positionId: vm.selectedFilters.searchPositionId,
			compensationModelId: vm.selectedFilters.searchCompensationModelId,
			compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getPhysicianwRVUsList(query).then(function (response) {

			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				var dataSourceBar = null;
				if (response.data.ProviderWorkRVUByMonthDetails && response.data.ProviderWorkRVUByMonthDetails.providerWorkRVUByMonthColumnSeries) {
					dataSourceBar = response.data.ProviderWorkRVUByMonthDetails.providerWorkRVUByMonthColumnSeries;
				}

				var dataSourceLine = null;
				if (response.data.ProviderWorkRVUByMonthDetails && response.data.ProviderWorkRVUByMonthDetails.providerWorkRVUByMonthLineSeries) {
					dataSourceLine = response.data.ProviderWorkRVUByMonthDetails.providerWorkRVUByMonthLineSeries;
					vm.PhysicianwRVUs.showLineChart = true;
				}

				vm.initializePhysicianwRVUsBarChart(dataSourceBar);
				vm.initializePhysicianwRVUsLineChart(dataSourceLine);
			}
			else {
				//In case of no data returned
				vm.initializePhysicianwRVUsBarChart(null);
				vm.initializePhysicianwRVUsLineChart(null);
			}

			//4.Unblock UI

		}, function (error) {
			vm.initializePhysicianwRVUsBarChart(null);
			vm.initializePhysicianwRVUsLineChart(null);
			console.log("Error in GetPhysicianwRVUsWidget", error)
			//5. unblock ui
			//6. handle errors in ui
		}).catch(function () {
		}).finally(function () {
			vm.PhysicianwRVUs.loading = false;
		})
	}


	vm.initializePhysicianwRVUsBarChart = function (dataSource) {
		//console.log(dataSource);
		$("#PhysicianwRVUsChart1").dxChart({

			dataSource: dataSource,
			series: {
				argumentField: "MonthYear",
				valueField: "wRVUs0",
				name: "My monthly RVU's",
				type: "bar",
				color: '#ffaa66'
			},
			legend: {
				//verticalAlignment: "top",
				//horizontalAlignment: "right"
				position: "outside", // or "inside"
				horizontalAlignment: "center", // or "left" | "right"
				verticalAlignment: "top" // or "bottom"
			},
			tooltip: {
				enabled: true,
				contentTemplate: function (info, container) {
					var contentItems = ["<div class='YourActualMonthwRVU-tooltip'>",
						"<div class='YourActualMonthwRVU'><span class='caption'>Your actual month wRVU's</span>: </div>",
						"<div class='YourwrvuCount'><span class='caption'>Count</span>: </div>",
						"<div class='YourwrvuFTE'><span class='caption'>FTE</span>: </div>",
						"<div class='Yourwrvu50thPercentile'><span class='caption'>50th percentile</span>: </div>",
						"</div>"];

					var content = $(contentItems.join(""));

					content.find(".YourActualMonthwRVU").append(document.createTextNode(info.argumentText));
					content.find(".YourwrvuCount").append(document.createTextNode(info.value));
					content.find(".YourwrvuFTE").append(document.createTextNode(info.point.data.FTEByMonth0));
					content.find(".Yourwrvu50thPercentile").append(document.createTextNode(info.point.data.fiftythPercentile0));

					content.appendTo(container);
				}
			},
			//"export": {
			//    enabled: true
			//},
			argumentAxis: { // or valueAxis
				label: {
					overlappingBehavior: "rotate",
					rotationAngle: 45
				}
			},

			commonAxisSettings: {
				grid: {
					visible: true
				}
			},
			margin: {
				bottom: 20
			},
			//title: "Your monthly RVU's"

		});
	}

	vm.initializePhysicianwRVUsLineChart = function (dataSource) {
		//console.log(dataSource);
		$("#PhysicianwRVUsChart2").dxChart({
			palette: "bright",
			dataSource: dataSource,
			series: {
				argumentField: "monthyear",
				valueField: "wRVUs",
				name: "Previous year actual monthwise RVU's",
				type: "spline",
				color: '#565077'
			},
			legend: {
				//verticalAlignment: "top",
				//horizontalAlignment: "right"
				position: "outside", // or "inside"
				horizontalAlignment: "center", // or "left" | "right"
				verticalAlignment: "top" // or "bottom"
			},
			tooltip: {
				enabled: true,
				contentTemplate: function (info, container) {
					var contentItems = ["<div class='YourActualMonthwRVU-tooltip'>",
						"<div class='YourActualMonthwRVU'><span class='caption'>Your previous year actual month wRVU's</span>: </div>",
						"<div class='YourwrvuCount'><span class='caption'>Count</span>: </div>",
						"<div class='YourwrvuFTE'><span class='caption'>FTE</span>: </div>",
						"</div>"];

					var content = $(contentItems.join(""));

					content.find(".YourActualMonthwRVU").append(document.createTextNode(info.argumentText));
					content.find(".YourwrvuCount").append(document.createTextNode(info.value));
					content.find(".YourwrvuFTE").append(document.createTextNode(info.point.data.FTEByMonth));

					content.appendTo(container);
				}
			},
			//"export": {
			//    enabled: true
			//},
			argumentAxis: {
				tickInterval: 1,
				//label: {
				//    format: {
				//        type: "decimal"
				//    }
				//},
				//allowDecimals: false,
				//axisDivisionFactor: 60
			},
			commonAxisSettings: {
				grid: {
					visible: true
				}
			},
			margin: {
				bottom: 20
			},
			//title: "Previous year actual monthwise RVU's"

		});
	}

	//This code is for the Dashboard widget laoding - End 

	//This is is used to call after clicked and un-clicked of checkbox and pass the click event also.
	vm.IsAlertPhy_Checked = function ($event, accept, row) {
		if ($event !== undefined) {
			var checkbox = $event.target;
			if (checkbox.checked) {
				vm.screenLoading = true;
				var ok = window.confirm('Are you sure you want to disable alert for this Provider?');
				if (ok) {
					//TODO: if click on OK button.
					console.log('IsAlertPhy_Checked ok');

					//load data from API
					var query = {
						providerId: row.entity.ContractPhysicianId
					};

					dashboardService.SetDisablePhysicianAlert(query).then(function (response) {
						if (response != null && response != undefined) {

							if (response.MessageType == 'Success') {
								//Success
								alert("Request Success : " + response.Message);
								//remove the check box
								row.entity.IsChkBox = false;
							} else {
								//Fail
								alert("Request failed, please try again : " + response.Message);
								console.log("Request failed : " + response.Message);
							}
						}
						else {
							//actions if no data
							//Fail
							console.log("Request failed : response null : " + response);
						}
					}).catch(function (error) {
						console.log("Error in IsAlertPhy_Checked", error)
					}).finally(function () {
						//close the loading message when data is present or null
						vm.screenLoading = false;
					});

				} else {
					//TODO: if click on cancel button.
					console.log('IsAlertPhy_Checked else');
					//close the loading message when data is present or null
					vm.screenLoading = false;
				}
			}
			//unchecked
			else {

			}
		}
	}

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.alertNotification_click = function (row) {
		vm.screenLoading = true;

		var CategoryId = row.entity.CategoryId;
		var IsPhysician = row.entity.IsPhysician;
		var PostBackUrl = "";
		var success = false;

		if (CategoryId == 7 || CategoryId == 8 || CategoryId == 11) {
			if (IsPhysician) {
				PostBackUrl = "Physician/ManagePhysicians.aspx";

				var model = {
					'EhdnPhysicianAlert': row.entity.ContractPhysicianId + '',
					'DRedirect': "Yes" //DRedirect
				}
				//set session before a url is opened
				UtilService.postDataByUrlAndMethodNameAsJsonString("dashboard.aspx", "/SetAlertNotificationVariables", model).then(function (response) {
					success = response.d;
					if (success) {
						//open url
						window.location = PostBackUrl;
					}

				}, function (err) {
					//ignore
				});
			}
			else {

				PostBackUrl = "Physician/ManageProviderExclusionList.aspx";
				var model = {
					'EhdnExcluddedProviderID': row.entity.ContractPhysicianId + '',
					'DRedirect': "Yes" //DRedirect
				}

				//set session before a url is opened
				UtilService.postDataByUrlAndMethodNameAsJsonString("dashboard.aspx", "/SetAlertNotificationVariables", model).then(function (response) {

					success = response.d;

					if (success) {
						//open url
						window.location = PostBackUrl;
					}

				}, function (err) {
					//ignore
				});

			}
		}
		else if (CategoryId == 5) {
			PostBackUrl = "DataManagement/CPTImportForPhysicians.aspx";
			window.location = PostBackUrl;
		}
		else {

			var NavigateToContractPage = $("input[name$='hdnNavigateToNewContractPage']").val();
			if (NavigateToContractPage.toLowerCase() == 'yes' || NavigateToContractPage.toLowerCase() == 'true' || NavigateToContractPage.toLowerCase() == '1') {
				PostBackUrl = "Physician/AngPhyContract.aspx";
			}
			else {
				PostBackUrl = "Physician/AddOrEditPhysicianContract.aspx";
			}
			var ContractStartDate = row.entity.ContractStartDate;

			var model = {
				'EhdnPhysicianAlert': row.entity.ContractPhysicianId + '', //hdnContractPhysicianId
				'EhdnMasterContractAlert': row.entity.MasterContractId + '', //hdnMasterContractID
				'EhdnfldContractId': row.entity.Contractid + '', //hdnContractID
				'EhdnfldCompensationModelId': row.entity.CompensationModelId + '', //hdnCompensationModelId
				'EhdnfldContractStartDate': ContractStartDate + '', //hdnContractStartDate
				'EhdnDept': row.entity.DeptId + '', //hdnDeptId
				'EhdnSpecialty': row.entity.CompModelSpecialtyId + '', //hdnCompModelSpecialtyId
				'EhdnCategoryId': CategoryId + '', //CategoryId
				'EhdnContractStartDate': moment(ContractStartDate).year() + '', //hdnfldContractStartDate Year
				'DRedirect': "Yes" //DRedirect
			}

			//set session before a url is opened
			UtilService.postDataByUrlAndMethodNameAsJsonString("dashboard.aspx", "/SetAlertNotificationVariables", model).then(function (response) {

				success = response.d;

				if (success) {
					//open url
					window.location = PostBackUrl;
				}

			}, function (err) {
				//ignore
			});
		}
		vm.screenLoading = false;
	};

	////Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	//vm.ytdLink_click = function (row) {
	//    vm.screenLoading = true;


	//    vm.screenLoading = false;
	//};  

	//This is used to call after clicked and un-clicked of checkbox and pass the click event also.
	vm.PhysicianwRVUs_IncludeAdj_Checked = function () {
		//console.log("PhysicianwRVUs_IncludeAdj_Checked checked");
		vm.GetPhysicianwRVUsWidget();
	}

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.NegativeProductivity_click = function (row) {
		vm.screenLoading = true;
		var ProviderId = row.entity.PhysicianId; //'1091';
		var Year = row.entity.YearNo;
		var Month = row.entity.MonthNo; //'9';

		//var model = "{'ProviderId':'" + ProviderId + "', 'Year':'" + Year + "', 'Month':'" + Month + "'}";
		var model = {
			'ProviderId': ProviderId + '',
			'Year': Year + '',
			'Month': Month
		}

		//set session before a url is opened
		UtilService.postDataByUrlAndMethodName("dashboard.aspx", "/SetMonthWiseReportsVariables", model).then(response => {

			//open url
			window.location = 'Report/MonthWiseReport.aspx';
		}, function (err) {
			//ignore
		});
		vm.screenLoading = false;
	};

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.ContractExpiryAndRenewal_click = function (row) {
		vm.screenLoading = true;

		var model = {
			'PhysicianId': row.entity.PhysicianId,
			'MasterContractId': row.entity.MasterContractID,
			'CompensationModelId': 0, //row.entity.CompensationModelId,
			'DeptId': 0, //row.entity.DeptId,
			'SpecialtyId': 0 //row.entity.SpecialtyId
			//Physname as Provider
		}

		//set session before a url is opened
		UtilService.postDataByUrlAndMethodName("dashboard.aspx", "/SetContractExpiryVariables", model).then(() => {
			var PostBackUrl = "";
			//open url
			var NavigateToContractPage = $("input[name$='hdnNavigateToNewContractPage']").val();
			if (NavigateToContractPage.toLowerCase() == 'yes' || NavigateToContractPage.toLowerCase() == 'true' || NavigateToContractPage.toLowerCase() == '1') {
				PostBackUrl = "Physician/AngPhyContract.aspx";
			}
			else {
				PostBackUrl = "Physician/AddOrEditPhysicianContract.aspx";
			}
			window.location = PostBackUrl;
		}, function (err) {
			//ignore
		});

		vm.screenLoading = false;
	};

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.wRVUsProductivitySpecialty_click = function (row) {
		vm.screenLoading = true;
		var ParameterValue = row.entity.Id;
		var Year = row.entity.FiscalYear;

		var ProviderId;
		if (vm.selectedFilters.searchProviderId && vm.selectedFilters.searchProviderId != null && vm.selectedFilters.searchProviderId != undefined && vm.selectedFilters.searchProviderId != "") {
			ProviderId = vm.selectedFilters.searchProviderId;
		}
		else {
			ProviderId = 0;
		}

		var model = '?Dt=S&ParameterValue=' + ParameterValue + '&YearNo=' + Year + "&PId=" + ProviderId;

		//Navigate to url with Query String
		window.location = 'Report/ProductivityActualWrvus.aspx' + model;

		//Response.Redirect("?Dt=S&ParameterValue=" + Convert.ToString(Value) + "&YearNo=" + Convert.ToString(YearNo) + 
		//"&PId=" + ((!String.IsNullOrEmpty(hdnPhysicianId.Value)) ? Convert.ToString(hdnPhysicianId.Value) : "0"));
		vm.screenLoading = false;
	};

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.ProviderBreakDown_Specialty_click = function (row) {
		//console.log("clicked ProviderBreakDown_Specialty_click", row);

		vm.screenLoading = true;

		//Set title
		$rootScope.modalTitle = 'Provider Breakdown by Specialty Details';
		$rootScope.gridOptions.data = []

		//load data from API
		var query = {
			specialtyGroupId: row.entity.SpecialtyGroupId, //input is specialtyID, API column name is given as SpecialtyGroupId
			year: vm.selectedFilters.YearID,
			providerId: vm.selectedFilters.searchProviderId, //1295,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getProviderBreakDownBySpecialtyPopupList(query).then(function (response) {
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				//if (response.data.HeaderDetails.length < 10) {
				//    $rootScope.gridOptions.enableHorizontalScrollbar = 0;
				//    $rootScope.gridOptions.enableVerticalScrollbar = 0;
				//}
				$rootScope.gridOptions = {
					columnDefs: [
						{ field: 'SNo', displayName: response.data.HeaderColumns[0].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false, width: '5%' },
						{ field: 'Provider', displayName: response.data.HeaderColumns[1].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false, width: '25%' },
						{ field: 'PayrollIDForWeb', displayName: response.data.HeaderColumns[2].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'EMRID', displayName: response.data.HeaderColumns[5].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'PositionLevel', displayName: response.data.HeaderColumns[6].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'ProviderTitle', displayName: response.data.HeaderColumns[7].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'CompensationModel', displayName: response.data.HeaderColumns[3].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'Specialty', displayName: response.data.HeaderColumns[4].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'CurrentFTE', displayName: response.data.HeaderColumns[8].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
					],
					data: response.data.HeaderDetails.HeaderDetails
				};
			}
			else {
				//In case of no data returned
				$rootScope.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }
			}
		}).catch(function (error) {
			console.log("Error in ProviderBreakDown_Specialty_click", error)
		}).finally(function () {
			//Open Modal if data is present or null
			vm.screenLoading = false;
			myModal.open();
		});
	};

	////Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	//vm.ProviderBreakDown_Count_click = function (row) {
	//    vm.screenLoading = true;
	//    console.log("" + ProviderBreakDown_Count_click);

	//    vm.screenLoading = false;
	//};

	////Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	//vm.ProviderBreakDown_FTE_click = function (row) {
	//    vm.screenLoading = true;
	//    console.log("" + ProviderBreakDown_FTE_click);


	//    vm.screenLoading = false;
	//};

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.WRVUsProductivityByLocation_click = function (row) {
		vm.screenLoading = true;
		var ParameterValue = row.entity.Id;
		var Year = row.entity.FiscalYear;

		var ProviderId;
		if (vm.selectedFilters.searchProviderId && vm.selectedFilters.searchProviderId != null && vm.selectedFilters.searchProviderId != undefined && vm.selectedFilters.searchProviderId != "") {
			ProviderId = vm.selectedFilters.searchProviderId;
		}
		else {
			ProviderId = 0;
		}

		var model = '?Dt=L&ParameterValue=' + ParameterValue + '&YearNo=' + Year + "&PId=" + ProviderId;

		//Navigate to url with Query String
		window.location = 'Report/ProductivityActualWrvus.aspx' + model;

		//Response.Redirect("~/Report/ProductivityActualWrvus.aspx?Dt=L&ParameterValue=" + Convert.ToString(Value) + "&YearNo=" + 
		//Convert.ToString(YearNo) + "&PId=" + ((!String.IsNullOrEmpty(hdnPhysicianId.Value)) ? Convert.ToString(hdnPhysicianId.Value) : "0"));

		vm.screenLoading = false;
	};

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.YtdcmeBalance_click = function (row) {

		vm.screenLoading = true;

		//Set title
		$rootScope.modalTitle = 'Provider CME Amount';
		$rootScope.gridOptions.data = []

		//load data from API
		var query = {
			currentUserRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole,
			providerId: row.entity.ProviderId, //1295,
			year: vm.selectedFilters.YearID //2020
		};

		//3. make service call
		dashboardService.getYtdcmeBalanceByConsumedPopupList(query).then(function (response) {
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				//if (response.data.HeaderDetails.HeaderDetails.length < 10) {
				//    $rootScope.gridOptions.enableHorizontalScrollbar = 0;
				//    $rootScope.gridOptions.enableVerticalScrollbar = 0;
				//}
				$rootScope.gridOptions = {
					columnDefs: [
						{ field: 'ServiceDate', displayName: response.data.HeaderColumns[0].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'PayelementDescription', displayName: response.data.HeaderColumns[1].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'CMEAmount', displayName: response.data.HeaderColumns[2].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'Comments', displayName: response.data.HeaderColumns[3].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
					],
					data: response.data.HeaderDetails.HeaderDetails
				};
			}
			else {
				//In case of no data returned
				$rootScope.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }
			}
		}).catch(function (error) {
			console.log("Error in YtdcmeBalance_click", error)
		}).finally(function () {
			//Open Modal if data is present or null
			vm.screenLoading = false;
			myModal.open();

		});

	};

	//Parameters accepted //grid, row, col, rowRenderIndex, colRenderIndex
	vm.YtdptoBalance_click = function (row) {

		vm.screenLoading = true;

		//Set title
		$rootScope.modalTitle = 'Provider PTO Amount';
		$rootScope.gridOptions.data = []

		//load data from API
		var query = {
			currentUserRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole,
			providerId: row.entity.ProviderId, //1295,
			year: vm.selectedFilters.YearID //2020
		};

		//3. make service call
		dashboardService.getYtdptoBalanceByConsumedPopupList(query).then(function (response) {
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				if (response.data.ProviderPTOBalanceByConsumedDetails.ProviderYTDPTOBalanceList.length < 10) {
					$rootScope.gridOptions.enableHorizontalScrollbar = 0;
					$rootScope.gridOptions.enableVerticalScrollbar = 0;
				}
				$rootScope.gridOptions = {
					columnDefs: [
						{ field: 'ServiceDate', displayName: response.data.ProviderPTOBalanceByConsumedWidgetHeaderColumnsInfo[0].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'PTOHours', displayName: response.data.ProviderPTOBalanceByConsumedWidgetHeaderColumnsInfo[1].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
					],
					data: response.data.ProviderPTOBalanceByConsumedDetails.ProviderYTDPTOBalanceList
				};
			}
			else {
				//In case of no data returned
				$rootScope.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }
			}
		}).catch(function (error) {
			console.log("Error in YtdptoBalance_click", error)
		}).finally(function () {
			//Open Modal if data is present or null
			vm.screenLoading = false;
			myModal.open();

		});

	};

	vm.LastPayPeriodProcessed_click = function (row) {

		vm.screenLoading = true;

		//Set title
		$rootScope.modalTitle = 'Last Pay Period Processed Details';
		$rootScope.gridOptions.data = []

		//load data from API
		var query = {

			ProviderId: vm.selectedFilters.searchProviderId,
			DeptId: vm.selectedFilters.searchDeptId,
			LocationId: vm.selectedFilters.searchLocationId,
			PositionId: vm.selectedFilters.searchPositionId,
			CompModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
			payElementId: row.entity.PayElementId,
			contractId: row.entity.ContractId,
			orgCompModelId: row.entity.OrgCompModelID,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		//3. make service call
		dashboardService.getLastPayPeriodProcessedPopupList(query).then(function (response) {
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				//if (response.data.HeaderDetails.length < 10) {
				//    $rootScope.gridOptions.enableHorizontalScrollbar = 0;
				//    $rootScope.gridOptions.enableVerticalScrollbar = 0;
				//}
				$rootScope.gridOptions = {
					paginationPageSizes: [10, 25, 50, 100, 250, 500],
					paginationPageSize: 10,
					columnDefs: [
						{ field: 'PayElement', displayName: response.data.HeaderColumns[0].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'Amount', displayName: response.data.HeaderColumns[1].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'Rate', displayName: response.data.HeaderColumns[2].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'Units', displayName: response.data.HeaderColumns[3].ColumnName, headerCellClass: 'txt-right-align', cellClass: 'txt-right-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'ServiceDate', displayName: response.data.HeaderColumns[4].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
						{ field: 'SendToPayrollOrAPStr', displayName: response.data.HeaderColumns[5].ColumnName, headerCellClass: 'txt-left-align', cellClass: 'txt-left-align', cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
					],
					data: response.data.HeaderDetails
				};
			}
			else {
				//In case of no data returned
				$rootScope.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }
			}
		}).catch(function (error) {
			console.log("Error in LastPayPeriodProcessed_click", error)
		}).finally(function () {
			//Open Modal if data is present or null
			vm.screenLoading = false;
			myModal.open();

		});

	};


	vm.PendingApprovals_click = function (row) {
		vm.screenLoading = true;
		var PayElementId = row.entity.PayElementId;

		//var model = "{'PayElementId':'" + PayElementId + "'}";
		var model = {
			'PayElementId': PayElementId + ''
		}

		//set session before a url is opened
		UtilService.postDataByUrlAndMethodName("dashboard.aspx", "/SetPendingApprovalsVariables", model).then(() => {

			//open url
			window.location = 'Payment/PhysicianPayRequestApproval.aspx';
		}, function (err) {
			//ignore
		});

		vm.screenLoading = false;
	};


	vm.UserProfile_changed = async function (row) {
		vm.screenLoading = true;
		//var r = row + '';
		//var model = "{'PhysicianId':'" + row + "'}";
		var model = {
			'PhysicianId': row.PhysicianId + ''
		}
		vm.setProviderSearchParameters(row);

		//set session before a url is opened
		UtilService.postDataByUrlAndMethodName("dashboard.aspx", "/SetUserProfileVariables", model).then(
			vm.getLoggedInUserDashboardList).then(vm.getWidgetsByDashBoardDetailsList).then(vm.initWidgets)
			.catch(() => {
				//Error message handling for all then functions
			}).finally(() => {
				//final execute method
				vm.screenLoading = false;
			});
	}

	vm.UserDashboard_click = function (row, index) {

		vm.screenLoading = true;
		vm.pageSettings.LoggedInUserDashboardModal = row;
		vm.pageSettings.SelectedTab = index;
		vm.getWidgetsByDashBoardDetailsList().then(vm.initWidgets)
			.catch(error => {
				//Error message handling for all then functions
				console.log(error);
			}).finally(() => {
				//final execute method
				vm.screenLoading = false;
			});
	}

	//Control Events end here

	//Modal dialogue start here

	////set CME Balance modal pop ups dynamically 
	//vm.setupPopUpDialog = function () {
	//    $('#YtdcmeBalanceModal').dialog({
	//        resizable: false,
	//        autoOpen: false,
	//        modal: true,
	//        width: 1000,
	//        height: 500,
	//        closeOnEscape: false,
	//        show: {
	//            effect: "blind",
	//            duration: 500
	//        },
	//        hide: {
	//            effect: "blind",
	//            duration: 500
	//        }
	//        , open: function () {
	//            //vm.PopupData.gridOptions = vm.PopupData.gridOptions;
	//            //$scope.$apply();
	//        },
	//        close: function () {
	//        }
	//    });

	//}

	//Modal dialogue start here

	//initialize your page widget functions
	vm.resetDashboardWidgets = async function () {

		$('#' + vm.AlertNotifications.id).hide();
		$('#' + vm.TerminationProvidersDetails.id).hide();
		$('#' + vm.BulletinMessages.id).hide();
		$('#' + vm.CMEBalance.id).hide();
		$('#' + vm.ContractExpiryAndRenewal.id).hide();
		$('#' + vm.ProviderExpirationDetails.id).hide();
		$('#' + vm.FteDiscrepancy.id).hide();
		$('#' + vm.InterfaceStatistics.id).hide();
		$('#' + vm.LastPayPeriodProcessed.id).hide();
		$('#' + vm.LastPayPeriodInboundReceived.id).hide();
		$('#' + vm.NegativeProductivityTwoQuarters.id).hide();
		$('#' + vm.LOARecordsHRInterface.id).hide();
		$('#' + vm.LevelsOfExperience.id).hide();
		$('#' + vm.ProviderBreakDownBySpecialty.id).hide();
		$('#' + vm.YTDPTOBalance.id).hide();
		$('#' + vm.PendingApprovals.id).hide();
		$('#' + vm.ProviderBreakdownByCompModel.id).hide();
		$('#' + vm.wRVUsVariance.id).hide();
		$('#' + vm.PayApprovalsPendingIncentives.id).hide();
		$('#' + vm.wRVUAnalysisPast12Months.id).hide();
		$('#' + vm.PhysicianwRVUs.id).hide();
		$('#' + vm.YTDShiftSummary.id).hide();
		$('#' + vm.HospitalistShiftTarget.id).hide();
		$('#' + vm.PTOLTS.id).hide();
		$('#' + vm.OveragePaymentAlert.id).hide();

		//Not used as of now
		//$('#wRVUsProductivityStatsByLocation').hide();
		//$('#wRVUsProductivityStatsBySpecialty').hide();
		//$('#BudgetsActuals').hide();
		//$('#MasterContractExpiry').hide();


		var stacks = $(".grid-stack");
		stacks.each(function () {
			var grid = $(this).data("gridstack");

			if (typeof grid !== "undefined") {
				//console.log('grid defined');
			}
			else {
				var options = { float: true };
				$('.grid-stack').gridstack(options);
			}
		});

		$('.grid-stack').css('height', '800px');//reset place holder
		//var options = { verticalMargin: 10, float: false };
		//$('.grid-stack').gridstack(options);

		//var stacks = $(".grid-stack");
		//stacks.each(function () {
		//    var grid = $(this).data("gridstack");
		//    if (typeof grid !== "undefined") {
		//        grid.destroy(false);
		//    }

		//    //use regex to remove the multiple classnames
		//    $(this).removeClass(function (index, className) {
		//        return (className.match(/(^|\s)grid-stack-instance-\S+/g) || []).join(" ");
		//    });
		//    //$(this).find(".ui-resizable-handle").remove();
		//});

		//var options = { verticalMargin: 10, float: false };
		//$('.grid-stack').gridstack(options);
	}

	vm.SetWidgetDimentions = function (value, multiplier) {
		return value * multiplier;
	}

	vm.initWidgets = async function () {
		vm.resetDashboardWidgets();
		var isProviderActive = false;

		//if Login user is Physician or Admin Searches for Provider
		if (vm.selectedFilters.searchProviderId && vm.selectedFilters.searchProviderId != null && vm.selectedFilters.searchProviderId != undefined && vm.selectedFilters.searchProviderId != "") {
			isProviderActive = true;
		}

		//if Org Admin 
		//Org admin specific funtion
		//console.log(vm.pageSettings.selectedWidgets)
		for (var i = 0; i < vm.pageSettings.selectedWidgets.length; i++) {
			//console.log(vm.pageSettings.selectedWidgets[i].WidgetCode);
			var widget = vm.pageSettings.selectedWidgets[i];

			var width = vm.SetWidgetDimentions(widget.HorizantalSpot, 4);
			var height = vm.SetWidgetDimentions(widget.VerticalSpot, 6);
			var Xaxis = vm.SetWidgetDimentions(widget.DataXaxis, 1);
			var Yaxis = vm.SetWidgetDimentions(widget.DataYaxis, 6);

			var $widgetdiv = null;
			var item = null;

			switch (widget.WidgetCode.trim()) {
				case enumWidget.TERMINATIONALERTS:
					//8. Alert Notifications Widget 
					item = vm.AlertNotifications;
					item.widget = widget;
					//2.prepare model
					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						alertNotificationTypeID: vm.AlertNotifications.modelNotificationTypes == 'All' ? '' : vm.AlertNotifications.modelNotificationTypes,
						days: vm.AlertNotifications.modelNotificationDays == 'All' ? '' : vm.AlertNotifications.modelNotificationDays,
						currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.TERMINATIONPROVIDERS:
					item = vm.TerminationProvidersDetails;
					item.widget = widget;

					item.showdiablechecked = false;
					//2.prepare model
					item.query = {
						roleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode,
						searchPhysicianId: vm.selectedFilters.searchProviderId,
						isDisableTerminationAlert: item.showdiablechecked,
						retValue: 0,
						isTerminationProvider: false
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.BULLETIN:
					//13.Bulletin Message
					vm.BulletinMessages.HeaderName = widget.WidgetName;
					//$widgetdiv = $('#BulletinMessage');
					$widgetdiv = $('#' + vm.BulletinMessages.id);
					vm.GetBulletinWidget();
					break;
				case enumWidget.CMEWIDGET:
					//10. CME Balance Widget 
					item = vm.CMEBalance;
					item.widget = widget;
					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						contractId: vm.selectedFilters.searchContractId,
						deptId: vm.selectedFilters.searchDeptId,
						locationId: vm.selectedFilters.searchLocationId,
						positionId: vm.selectedFilters.searchPositionId,
						compensationModelId: vm.selectedFilters.searchCompensationModelId,
						compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
						pageNo: 1,
						pageSize: 1000,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.CONTRACTEXPIRY:
					//1. Contractual Expiration
					item = vm.ContractExpiryAndRenewal;
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						contractId: vm.selectedFilters.searchContractId,
						deptId: vm.selectedFilters.searchDeptId,
						locationId: vm.selectedFilters.searchLocationId,
						positionId: vm.selectedFilters.searchPositionId,
						compensationModelId: vm.selectedFilters.searchCompensationModelId,
						compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
						pageNo: 1,
						pageSize: 1000,
						currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					}

					vm.loadDataByWidget(item);
					break;
				case enumWidget.PHYSEXPDET:
					item = vm.ProviderExpirationDetails;
					item.widget = widget;

					item.query = {
						providerId: vm.selectedFilters.searchProviderId,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.FTEWIDGET:
					//14. FTE Discrepancy Widget   
					item = vm.FteDiscrepancy;
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						pageNo: 1,
						pageSize: 1000,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.INTSTS:
					//7.Interface Statistics 
					item = vm.InterfaceStatistics;
					item.query = { currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode }

					item.widget = widget;
					vm.loadDataByWidget(item);
					break;
				case enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE:
					//2. Last Pay period Processed
					item = vm.LastPayPeriodProcessed;
					item.PayPeriodName = "";
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						contractId: vm.selectedFilters.searchContractId,
						deptId: vm.selectedFilters.searchDeptId,
						locationId: vm.selectedFilters.searchLocationId,
						positionId: vm.selectedFilters.searchPositionId,
						compensationModelId: vm.selectedFilters.searchCompensationModelId,
						compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.LastPayPeriodInboundReceived:
					item = vm.LastPayPeriodInboundReceived;
					item.PayPeriodName = "";
					item.widget = widget;

					item.query = {
						providerId: vm.selectedFilters.searchProviderId,
						roleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;

				case enumWidget.LEVELSOFEXPERIENCE:
					//16.Levels of Experience
					item = vm.LevelsOfExperience;
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						month: vm.LevelsOfExperience.modelDays,
						currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.LOAWIDGET:
					//15.LOA Record Widget   
					item = vm.LOARecordsHRInterface;
					item.widget = widget;

					item.query = {
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.NEGPRODTWOQUARTERS:
					//9.Negative Productivity for two Consecutive Quarters 
					item = vm.NegativeProductivityTwoQuarters;
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					}

					vm.loadDataByWidget(item);
					break;
				case enumWidget.WRVUPRODLOC:
					//vm.WRVUsProductivityStatsByLocation.HeaderName = widget.WidgetName
					//item = vm.WRVUsProductivityStatsByLocation;
					//item.widget = widget;

					//item.query = { 
					//	providerId: vm.selectedFilters.searchProviderId,
					//	year: vm.selectedFilters.YearID,
					//	currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					//};
					//vm.loadDataByWidget(item);  
					break;
				case enumWidget.WRVUPRODSPL:
					//vm.wRVUsProductivityStatsBySpecialty.HeaderName = widget.WidgetName
					//$("#wRVUsProductivityStatsBySpecialty").attr({
					//    'data-gs-x': Xaxis,
					//    'data-gs-y': Yaxis,
					//    //'data-gs-min-width': 4,
					//    //'data-gs-min-height': 6,
					//    'data-gs-width': width,
					//    'data-gs-height': height
					//    

					//}).show();

					//vm.GetwRVUsProductivityStatsBySpecialtyWidget();
					break;
				case enumWidget.SPLBRKDOWN:
					//5. Physician Breakdown By Specialty  
					item = vm.ProviderBreakDownBySpecialty;
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					vm.loadDataByWidget(item);
					break;
				case enumWidget.PTOWIDGET:
					//11.PTO Balance Widget  
					item = vm.YTDPTOBalance;
					item.widget = widget;

					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						contractId: vm.selectedFilters.searchContractId,
						deptId: vm.selectedFilters.searchDeptId,
						locationId: vm.selectedFilters.searchLocationId,
						positionId: vm.selectedFilters.searchPositionId,
						compensationModelId: vm.selectedFilters.searchCompensationModelId,
						compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
						pageNo: 1,
						pageSize: 1000,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};
					vm.loadDataByWidget(item);
					break;
				case enumWidget.PendingApprovalsWidget:
					//21. Pending Approvals Widget  
					item = vm.PendingApprovals;
					item.widget = widget;
					item.query = { currentRoleId: vm.hdnCurrent.UserInfo.CurrentRoleID };

					vm.loadDataByWidget(item);
					break;
				case enumWidget.COMPMDLBRKDOWN:
					//4. Physician Breakdown By Compensation Model
					vm.ProviderBreakdownByCompModel.HeaderName = widget.WidgetName

					$widgetdiv = $("#" + vm.ProviderBreakdownByCompModel.id);

					//Chart widget 
					vm.GetProviderBreakdownByCompModelWidget();
					break;
				case enumWidget.PAYAPPROVALSPENDINGINCENTIVES:
					//3.Pay Approval Pending 
					item = vm.PayApprovalsPendingIncentives;
					item.widget = widget;
					item.query = {
						providerId: vm.selectedFilters.searchProviderId,
						year: vm.selectedFilters.YearID,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};
					vm.loadDataByWidget(item);
					break;
				case enumWidget.MASTERCONTRACTEXPIRATION:
					//item = vm.MasterContractExpiry;
					//item.widget = widget;
					//item.query = {
					//	currentRoleId: vm.hdnCurrent.UserInfo.CurrentRoleID,
					//	currentRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole,
					//	year: vm.selectedFilters.YearID,
					//	providerId: vm.selectedFilters.searchProviderId,
					//	pageNo: 1,
					//	pageSize: 1000
					//};

					//vm.loadDataByWidget(item);
					break;
				//case enumWidget.PHYSQUALITY:
				//    //$("#").addClass("order-" + widget.DisplayOrder);
				//    //$('#').show();

				//    break;
				case enumWidget.wRVUAnalysis:
					//18.wRVUs Analysis - Last 12 Months
					vm.wRVUAnalysisPast12Months.HeaderName = widget.WidgetName;

					if (isProviderActive) {
						item = vm.wRVUAnalysisPast12Months;
						item.widget = widget;

						item.query = {
							providerId: vm.selectedFilters.searchProviderId,
							contractId: vm.selectedFilters.searchContractId,
							deptId: vm.selectedFilters.searchDeptId,
							locationId: vm.selectedFilters.searchLocationId,
							positionId: vm.selectedFilters.searchPositionId,
							compensationModelId: vm.selectedFilters.searchCompensationModelId,
							compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
							currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
						};

						//Get the General setting value and assign the value
						vm.GetHideBenchmarkingDataValue(item);

					}
					break;
				case enumWidget.PhysicianwRVUs:
					//17.wRVUs Summary Widget
					vm.PhysicianwRVUs.HeaderName = widget.WidgetName;
					vm.PhysicianwRVUs.checked = true;
					if (isProviderActive) {
						$widgetdiv = $("#" + vm.PhysicianwRVUs.id);
						vm.GetPhysicianwRVUsWidget();
					}
					break;
				case enumWidget.ZEROWRVUS:
					//6. Zero wRVUs/wRVUs Variance 
					vm.wRVUsVariance.checked = true;
					item = vm.wRVUsVariance;
					item.widget = widget;

					item.Variance = 0;
					item.query = {
						includeAdjustments: vm.wRVUsVariance.checked == true ? 1 : 0,
						providerId: vm.selectedFilters.searchProviderId,
						year: vm.selectedFilters.YearID,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};
					vm.loadDataByWidget(item);
					break;
				case enumWidget.YTDShiftSummary:
					//19. YTD Shift Summary
					item = vm.YTDShiftSummary;
					item.widget = widget;

					item.query = {
						//Need to verify the input parameters for api 
						providerId: vm.selectedFilters.searchProviderId,
						contractId: vm.selectedFilters.searchContractId,
						deptId: vm.selectedFilters.searchDeptId,
						locationId: vm.selectedFilters.searchLocationId,
						positionId: vm.selectedFilters.searchPositionId,
						compensationModelId: vm.selectedFilters.searchCompensationModelId,
						compModelSpecialtyId: vm.selectedFilters.searchCompModelSpecialtyId,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};
					vm.loadDataByWidget(item);
					break;
				case enumWidget.HOSPITALISTSHIFTTARGET:
					//20. Hospitalist Shift Target Alert 
					item = vm.HospitalistShiftTarget;
					item.widget = widget;
					item.query = {
						year: vm.selectedFilters.YearID,
						providerId: vm.selectedFilters.searchProviderId,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode,

					};
					vm.loadDataByWidget(item);
					break;
				case enumWidget.BudgetActuals:
					//item = vm.BudgetsActuals;
					//item.widget = widget;
					//item.query = {
					//	providerId: vm.selectedFilters.searchProviderId,
					//	currentRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole,
					//	year: vm.selectedFilters.YearID };

					//vm.loadDataByWidget(item); 
					break;
				case enumWidget.PTOLTS:
					//PTOLTS
					item = vm.PTOLTS;

					item.query = {
						//Need to verify the input parameters for api 
						ProviderId: vm.selectedFilters.searchProviderId,
						currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID,
						year: vm.selectedFilters.YearID,
						//pageNo: 1,
						//pageSize: 1000,
						reportType: vm.PTOLTS.modelPTOLTS == 0 ? vm.PTOLTS.PTOLTSOptions[0].Option : vm.PTOLTS.PTOLTSOptions[1].Option,
						currentUserRoleName: vm.hdnCurrent.UserInfo.CurrentUserRole,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					};

					item.widget = widget;
					vm.loadDataByWidget(item);
					break;
				case enumWidget.OveragePaymentAlert:
					//OveragePayment
					item = vm.OveragePaymentAlert;

					item.query = {
						providerId: vm.selectedFilters.searchProviderId,
						currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID,
						year: vm.selectedFilters.YearID,
						pageNo: 1,
						pageSize: 1000,
						selectedPayPeriodType: vm.OveragePaymentAlert.selectedPayPeriodType == 0 ? vm.OveragePaymentAlert.PayPeriodOptions[0].id : vm.OveragePaymentAlert.PayPeriodOptions[1].id,
						currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
					}

					item.widget = widget;
					vm.loadDataByWidget(item);
					break;

				default:
					break;
			}
			////End of switch case


			if ($widgetdiv != null) {
				$widgetdiv.attr({
					'data-gs-x': Xaxis,
					'data-gs-y': Yaxis,
					'data-gs-width': width,
					'data-gs-height': height
				}).show();
			}
		}

		vm.GetNotificationLegendValues();

		//if (!vm.AlertNotifications.NotificationLegend) {
		//    vm.GetAlertNotificationLegendValues();
		//}

		////Initialize the modal dialogue
		//setTimeout(function () { vm.setupPopUpDialog(); }, 100);

		//setTimeout(function () {
		//	var options = {
		//verticalMargin: 10
		//		//staticGrid: true,
		//              //cellHeight: 80,
		//              float: true
		//          };

		//	$('.grid-stack').gridstack(options);
		//          var grid = $('.grid-stack').data('gridstack');

		//          var grid1 = $('.grid-stack');
		//	var newHeight = grid.container[0].scrollHeight;
		//	if (newHeight > 0)
		//		$('.grid-stack').css('height', newHeight);
		//	//set grid as static
		//          grid.setStatic(true);
		//          $('.grid-stack').attr('data-gs-current-height','10000');
		//          $('.grid-stack').gridstack(options);
		//}, 1000);

		var options = { verticalMargin: 10, float: true };
		$('.grid-stack').gridstack(options);
		var grid = $('.grid-stack').data('gridstack');
		grid.setStatic(true);
		var newHeight = grid.container[0].scrollHeight;
		if (newHeight > 0)
			$('.grid-stack').css('height', newHeight + 50);



		//setTimeout(function () {
		//    $('#defaultOpen-0').click();
		// }, 2000);


		//vm.resizeGrid();


		//grid.resize(
		//    $('.grid-stack-item')[0],
		//    $($('.grid-stack-item')[0]).attr('data-gs-width'),
		//    Math.ceil(($('.grid-stack-item-content')[0].scrollHeight + $('.grid-stack').data('gridstack').opts.verticalMargin) / ($('.grid-stack').data('gridstack').cellHeight() + $('.grid-stack').data('gridstack').opts.verticalMargin))
		//);


		//var newHeight = grid.container[0].scrollHeight;
		//if (newHeight > 0) { $('.grid-stack').css('height', newHeight + 100); }
		////alert(grid.container.height())
		//grid.setStatic(true);

		//$('.grid-stack').data('gs-current-height', '70');
		//$('.grid-stack').attr('data-gs-current-height', '76');
		//$('.grid-stack').attr({ 'data-gs-current-height': '69' });

	}

	vm.getProviderRolesAndInitWidgets = async function () {
		vm.MultiProfilesFilter.Profiles = null;
		vm.getProviderMultiProfilesList().then(response => {

			vm.MultiProfilesFilter.Profiles = response;
			if (vm.MultiProfilesFilter.Profiles.length > 1) {
				vm.MultiProfilesFilter.enableProfileModal = true;
				$("#divSwitchUserProfile").modal("show");
			}
			else {
				vm.MultiProfilesFilter.enableProfileModal = false;
				$("#divSwitchUserProfile").modal("hide");
			}

			//alert(response[0].ProviderName);
			vm.getUpdateDashboardProvidersList().then(vm.initWidgets);
			//vm.initWidgets();

		}).catch(() => {
			//Error message handling for all then functions
		}).finally(() => {
			//final execute method
		})
	}


	//initialize your page widget one time load functions/settings
	vm.onPageLoadSettings = async function () {

		vm.providerAutoCompletion();

		await Promise.all([vm.GetYearsFilterList(),
		vm.GetCompModelFilterList(),
		vm.GetSpecialtyGroupFilterList(),
		vm.GetSpecialtyFilterList()])

		//get filter access
		//vm.getDashboardFilterSettings().then(() => {
		//    if (vm.pageSettings.LoggedInUserFilterSettings.IsRegion)
		//        vm.GetRegionFilterList();
		//    if (vm.pageSettings.LoggedInUserFilterSettings.IsLocation)
		//        vm.GetLocationFilterList();
		//    if (vm.pageSettings.LoggedInUserFilterSettings.IsCostCenter)
		//        vm.GetDepartmentFilterList();
		//});

		vm.getDashboardFilterSettings().then(() => {
			if (vm.pageSettings.LoggedInUserFilterSettings.IsRegion) {
				vm.GetRegionFilterList().then(() => {
					if (vm.pageSettings.LoggedInUserFilterSettings.IsLocation) {
						vm.GetLocationFilterList().then(() => {
							if (vm.pageSettings.LoggedInUserFilterSettings.IsCostCenter) {
								vm.GetDepartmentFilterList();
							}
						})
					}
				})
			}
		});

		if (vm.CurrentUserInfo == vm.UserDetail.orgAdm)
			vm.GetDirectorsFilterList();
	}

	//invoke your page filter settings
	vm.getDashboardFilterSettings = async function () {

		//2.prepare model
		var query = {
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		var deferred = $q.defer();

		//3. make service call
		dashboardService.getDashboardFilterAccessList(query).then(function (response) {

			//console.log(response)
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				vm.pageSettings.LoggedInUserFilterSettings = response.data;

				deferred.resolve(vm.pageSettings.LoggedInUserFilterSettings);
			}
			else if (response == null || response == undefined || response.data == '' || response.status == 204) {
				//pending in case of no data returned
				deferred.resolve(response);
			}
			else {
				//pending in case of no data returned
				deferred.reject("error", response);
			}

		}, function (error) {
			console.log("Error in getDashboardFilterSettings", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).catch(error => {
			//Error message handling for all then functions
			console.log("Error in getDashboardFilterSettings", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
		});
		return deferred.promise;

	}

	//get your widgets
	vm.getWidgetList = async function () {
		//console.log('getWidgetList')
		//Calling the function to load the data on pageload
		vm.hdnCurrent = {
			UserInfo: {}
		};

		//fill current user data &
		//replace single with double quote and then parse user, role info data
		vm.hdnCurrent.UserInfo = JSON.parse('{ ' + $("input[name$='hdnCurrentUserInfo']").val().replace(/'/g, '"') + ' }');
		//development
		//console.log(vm.hdnCurrent.UserInfo)

		//2.prepare model
		var query = {
			roleId: vm.hdnCurrent.UserInfo.CurrentRoleID
		};

		var deferred = $q.defer();

		//3. make service call
		dashboardService.getWidgetList(query).then(function (response) {
			//console.log(response)
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				var sortedWidgetList = UtilService.getSortedListValuesByDoubleProp(response.data.widgetlist, 'WidgetOrder', 'WidgetName');
				vm.selectedWidgets = sortedWidgetList;
				deferred.resolve(vm.selectedWidgets);

			}
			else if (response == null || response == undefined || response.data == '' || response.status == 204) {
				//pending in case of no data returned
				deferred.resolve(response);
			}
			else {
				//pending in case of no data returned
				deferred.reject("error", response)
			}

		}, function (error) {
			console.log("Error in getWidgetList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).catch(error => {
			//Error message handling for all then functions
			console.log("Error in getWidgetList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
		});
		return deferred.promise;
	}

	vm.getUpdateDashboardProvidersList = async function () {
		//Only for search provider ID from Admin login
		//2.prepare model
		var query = {
			providerId: vm.selectedFilters.searchProviderIdForExtraDBFilters,
			currentRoleID: vm.hdnCurrent.UserInfo.CurrentRoleID
		};

		var deferred = $q.defer();

		//3. make service call
		dashboardService.getUpdateDashboardProvidersList(query).then(function (response) {

			//console.log(response)
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				//success
				deferred.resolve(response);
			}
			else {
				//pending in case of no data returned
				deferred.reject("error", response)
			}

		}, function (error) {
			console.log("Error in getUpdateDashboardProvidersList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).catch(error => {
			//Error message handling for all then functions
			console.log("Error in getUpdateDashboardProvidersList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
		});
		return deferred.promise;
	}

	vm.getProviderMultiProfilesList = async function () {

		//2.prepare model
		var query = {
			providerId: vm.hdnCurrent.UserInfo.CurrentUserRoleCode == vm.UserDetail.PHYSICIAN ? 0 : vm.selectedFilters.searchProviderId,
			currentUserRoleCode: vm.hdnCurrent.UserInfo.CurrentUserRoleCode
		};

		var deferred = $q.defer();

		//3. make service call
		dashboardService.getProviderMultiProfilesList(query).then(function (response) {
			var ProvMultiProfiles;

			//console.log(response)
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				//vm.pageSettings.ProviderMultiProfiles = response.data.HeaderDetails;
				vm.MultiProfilesFilter.options = response.data.HeaderDetails;
				//show the provider radio buttons
				if (vm.CurrentUserInfo == vm.UserDetail.PHYSICIAN) {
					$('#CurrentUserMultiProfiles').show();
				}
				if (vm.MultiProfilesFilter.options && vm.MultiProfilesFilter.options.length > 0) {
					//select the value from other page
					vm.MultiProfilesFilter.adminModel = vm.MultiProfilesFilter.options[0].ID;
					//select the value based on the profile (replace the index value)
					ProvMultiProfiles = vm.MultiProfilesFilter.options[0];
				}
				vm.setProviderSearchParameters(ProvMultiProfiles);

				deferred.resolve(vm.MultiProfilesFilter.options);
			}
			else if (response == null || response == undefined || response.data == '' || response.status == 204) {
				$('#CurrentUserMultiProfiles').hide();
				vm.setProviderSearchParameters(ProvMultiProfiles);
				//pending in case of no data returned
				deferred.resolve(response);
			}
			else {
				$('#CurrentUserMultiProfiles').hide();
				//pending in case of no data returned
				deferred.reject("error", response)
			}

		}, function (error) {
			console.log("Error in getProviderMultiProfilesList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).catch(error => {
			//Error message handling for all then functions
			console.log("Error in getProviderMultiProfilesList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
		});
		return deferred.promise;
	}

	vm.getLoggedInUserDashboardList = async function () {

		//2.prepare model
		var query = {
			roleId: vm.hdnCurrent.UserInfo.CurrentRoleID,
			providerId: vm.MultiProfilesFilter.PhysicianId == undefined ? '0' : vm.MultiProfilesFilter.PhysicianId, //taking Multiple profile variable to differenciate the admin provider search and provider login
			deptId: vm.selectedFilters.searchDeptId
		};

		var deferred = $q.defer();

		//3. make service call
		dashboardService.getLoggedInUserDashboardList(query).then(function (response) {

			vm.pageSettings.LoggedInUserDashboardList = null;
			//console.log(response)
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				vm.pageSettings.LoggedInUserDashboardList = response.data.LoggedInUserDashboardResult;
				console.log(vm.pageSettings.LoggedInUserDashboardList);

				//Select the first tab by default if there are multiple dashboards assigned to the user
				//if (!vm.pageSettings.LoggedInUserDashboardModal) {
				vm.pageSettings.SelectedTab = 0;
				//}

				if (vm.pageSettings.LoggedInUserDashboardList && vm.pageSettings.LoggedInUserDashboardList.length > 0) {
					vm.pageSettings.LoggedInUserDashboardModal = vm.pageSettings.LoggedInUserDashboardList[0].DashboardDetailsId;
				}

				$('#CurrentUserDashboard').show();
				deferred.resolve(vm.pageSettings.LoggedInUserDashboardList);
			}
			else if (response == null || response == undefined || response.data == '' || response.status == 204) {
				$('#CurrentUserDashboard').hide();
				//pending in case of no data returned
				deferred.resolve(response);
			}
			else {
				$('#CurrentUserDashboard').hide();
				//pending in case of no data returned
				deferred.reject("error", response);
			}

		}, function (error) {
			console.log("Error in getLoggedInUserDashboardList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).catch(error => {
			//Error message handling for all then functions
			console.log("Error in getLoggedInUserDashboardList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
		});
		return deferred.promise;
	}

	vm.getWidgetsByDashBoardDetailsList = async function () {

		//2.prepare model
		var query = {
			dashboardDetailsId: vm.pageSettings.LoggedInUserDashboardModal
		};
		console.log(vm.pageSettings.LoggedInUserDashboardModal);
		var deferred = $q.defer();

		//3. make service call
		dashboardService.getWidgetsByDashBoardDetailsByIdList(query).then(function (response) {

			//console.log(response);
			if (response != null && response != undefined && response.status == 200 && response.data && response.data != null && response.data != "") {
				$('#userExceptions').html("");
				//$('#userExceptions').hide();
				$('.alert-danger').hide();
				var sortedWidgetList = UtilService.getSortedListValuesByDoubleProp(response.data.WidgetsByDashBoardDetailsIdResult, 'DisplayOrder', 'WidgetName');
				vm.pageSettings.selectedWidgets = sortedWidgetList;
				deferred.resolve(vm.pageSettings.selectedWidgets);

			}
			else if (response == null || response == undefined || response.data == '' || response.status == 204) {
				vm.pageSettings.selectedWidgets = response;
				$('#userExceptions').html("no widgets are configured for this user dashboard. Please contact admin.");
				//$('#userExceptions').show();
				$('.alert-danger').show();
				vm.screenLoading = false;

				//pending in case of no data returned
				deferred.resolve(vm.pageSettings.selectedWidgets);
			}
			else {
				//In case of no data returned
				$('#userExceptions').html("error while loading data, please reload the page.");
				//$('#userExceptions').show();
				$('.alert-danger').show();
				deferred.reject("error", response);
			}

		}, function (error) {
			console.log("Error in getWidgetsByDashBoardDetailsList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).catch(error => {
			//Error message handling for all then functions
			console.log("Error in getWidgetsByDashBoardDetailsList", error)
			deferred.reject(error);
			//5. unblock ui
			//6. handle errors in ui
		}).finally(finalMsg => {
			//final execute method
		});
		return deferred.promise;
	}

	vm.setProviderSearchParameters = async function (ProvProfile) {

		if (vm.CurrentUserInfo == vm.UserDetail.PHYSICIAN) {
			vm.MultiProfilesFilter.PhysicianId = (ProvProfile == undefined || ProvProfile.PhysicianId == undefined) ? 0 : ProvProfile.PhysicianId;
			vm.selectedFilters.searchProviderId = vm.MultiProfilesFilter.PhysicianId == undefined ? 0 : vm.MultiProfilesFilter.PhysicianId;
		}

		vm.MultiProfilesFilter.contractId = (ProvProfile == undefined || ProvProfile.ContractId == undefined) ? 0 : ProvProfile.ContractId;
		vm.MultiProfilesFilter.deptId = (ProvProfile == undefined || ProvProfile.DeptId == undefined) ? 0 : ProvProfile.DeptId;
		vm.MultiProfilesFilter.locationId = (ProvProfile == undefined || ProvProfile.LocationId == undefined) ? 0 : ProvProfile.LocationId;
		vm.MultiProfilesFilter.positionId = (ProvProfile == undefined || ProvProfile.PositionId == undefined) ? 0 : ProvProfile.PositionId;
		vm.MultiProfilesFilter.CompensationModelId = (ProvProfile == undefined || ProvProfile.CompensationModelId == undefined) ? 0 : ProvProfile.CompensationModelId;
		vm.MultiProfilesFilter.CompModelSpecialtyId = (ProvProfile == undefined || ProvProfile.CompModelSpecialtyId == undefined) ? 0 : ProvProfile.CompModelSpecialtyId;

		//set provider is for provider login
		vm.selectedFilters.searchContractId = vm.MultiProfilesFilter.contractId == undefined ? 0 : vm.MultiProfilesFilter.contractId;
		vm.selectedFilters.searchDeptId = vm.MultiProfilesFilter.deptId == undefined ? 0 : vm.MultiProfilesFilter.deptId;
		vm.selectedFilters.searchLocationId = vm.MultiProfilesFilter.locationId == undefined ? 0 : vm.MultiProfilesFilter.locationId;
		vm.selectedFilters.searchPositionId = vm.MultiProfilesFilter.positionId == undefined ? 0 : vm.MultiProfilesFilter.positionId;
		vm.selectedFilters.searchCompensationModelId = vm.MultiProfilesFilter.CompensationModelId == undefined ? 0 : vm.MultiProfilesFilter.CompensationModelId;
		vm.selectedFilters.searchCompModelSpecialtyId = vm.MultiProfilesFilter.CompModelSpecialtyId == undefined ? 0 : vm.MultiProfilesFilter.CompModelSpecialtyId;

	}

	vm.switchProfile = function (item) {
		//setTimeout(function () { alert('Switch Profile to : ' + item.ProviderName); }, 100);
		vm.screenLoading = true;
		vm.setProviderSearchParameters(item);
		//vm.initWidgets();
		vm.getLoggedInUserDashboardList().then(vm.getWidgetsByDashBoardDetailsList).then(vm.initWidgets)
			.catch(() => {
				//Error message handling for all then functions
			}).finally(() => {
				//final execute method
				vm.screenLoading = false;
			});

		$("#divSwitchUserProfile").modal("hide");
	}

	////invoke your page functions
	//vm.onPageLoad = async function () {
	//    vm.initWidgets();
	//    vm.onPageLoadSettings();
	//}

	//invoke your page settings
	vm.onPageInitSettings = async function () {

		//console.log('onPageSettings')
		//await vm.getWidgetList();
		//await vm.onPageLoadSettings();
		//old method
		//await Promise.all([vm.getWidgetList(), vm.onPageLoadSettings()])
		//loading based on new settings
		//Calling the function to load the data on pageload
		vm.hdnCurrent = {
			UserInfo: {}
		};

		//fill current user data &
		//replace single with double quote and then parse user, role info data

		vm.hdnCurrent.UserInfo = JSON.parse('{ ' + $("input[name$='hdnCurrentUserInfo']").val().replace(/'/g, '"') + ' }');
		vm.CurrentUserInfo = vm.hdnCurrent.UserInfo.CurrentUserRoleCode;
		if (vm.CurrentUserInfo == vm.UserDetail.PHYSICIAN) { //'PHYSICN') {

			$('#filternav').hide();

			vm.getProviderMultiProfilesList().then(vm.getLoggedInUserDashboardList).then(vm.getWidgetsByDashBoardDetailsList).then(vm.initWidgets)
				.catch(error => {
					//Error message handling for all then functions
				}).finally(() => {
					//final execute method

				})
		}
		else {
			//Reset Provider ID in the additional DB Filters
			vm.selectedFilters.searchProviderIdForExtraFilters = 0;
			await Promise.all([vm.getUpdateDashboardProvidersList(), vm.getLoggedInUserDashboardList(), vm.onPageLoadSettings()])
				.then(vm.getWidgetsByDashBoardDetailsList)
				.then(vm.initWidgets).catch(error => {
					//Error message handling for all then functions
				}).finally(() => {
					//final execute method

				})
		}
	}



	//onPageLoad
	$(document).ready(function () {


		vm.screenLoading = true;
		//check if token present   
		var userInfo = UtilService.getCurrentUserInfo();
		console.log(userInfo);
		authService.setToken(userInfo.APIToken);

		vm.onPageInitSettings().catch(error => {
			//Error message handling for all then functions
		}).finally(() => {
			//final execute method
			vm.screenLoading = false;
		})

	});

	//$(document).ready(function () {

	//    //Toggle event for the ToggleButton

	//    //$('.form-check-input').on('change', function () {
	//    //    console.log('Yaay, I was changed');
	//    //});



	//    //Toggle fullscreen
	//    $(".togglepanel").click(function (e) {
	//        vm.screenLoading = true;
	//        e.preventDefault();

	//        var $this = $(this);
	//        if ($this.children('i').hasClass('glyphicon-resize-full')) {
	//            $this.children('i').removeClass('glyphicon-resize-full');
	//            $this.children('i').addClass('glyphicon-resize-small');
	//        }
	//        else if ($this.children('i').hasClass('glyphicon-resize-small')) {
	//            $this.children('i').removeClass('glyphicon-resize-small');
	//            $this.children('i').addClass('glyphicon-resize-full');
	//        }
	//        $(this).closest('.panel').toggleClass('panel-fullscreen');

	//        vm.screenLoading = false;

	//        //angular.element(document.getElementsByClassName('grid')[0]).css('width', '100% !important');

	//        //var gridelement = $this.parents('.panel-default').find(".grid")[0];

	//        //setTimeout(function () {
	//        //    //alert("Hello");
	//        //    //$($(this).parents('.panel-default').find(".grid")[0]).css('width', '100%');
	//        //    //$($(this).parents('.panel-default').find("#gridAlertNotification")).css('width', '100%');

	//        //    //angular.element(document.getElementsByClassName('grid')[0]).css('width', 'auto');

	//        //    angular.element(document.getElementsByClassName('grid')[0]).css('width', '100% !important');

	//        ////    angular.element(document.getElementsByClassName('ui-grid-viewport')[0]).css('width', '100% !important');

	//        ////    angular.element(document.getElementsByClassName('ui-grid-header-canvas')[0]).css('width', '100% !important');
	//        ////    angular.element(document.getElementsByClassName('ng-isolate-scope')[0]).css('width', '100% !important');
	//        ////    angular.element(document.getElementsByClassName('ui-grid-canvas')[0]).css('width', '100% !important');


	//        //    //angular.element(document.getElementsByClassName('ui-grid-canvas')[0]).css('width', '100%');
	//        //}, 1000);
	//    });
	//});

});


//Just for Testing, used in POC TestAngular.aspx page
app.controller('TestCtrl', ['$http', '$timeout', '$scope', '$log', function ($http, $timeout, $scope, $log) {

	var vm = this;
	vm.testMessage = "just a test message";

	//Test gridstack
	$scope.widgets = [{ x: 0, y: 0, width: 1, height: 1 }, { x: 0, y: 0, width: 3, height: 1 }];

	$scope.options = {
		cellHeight: 200,
		verticalMargin: 10
	};

	var populationData = [{
		arg: 1950,
		val: 2525778669
	}, {
		arg: 1960,
		val: 3026002942
	}, {
		arg: 1970,
		val: 3691172616
	}, {
		arg: 1980,
		val: 4449048798
	}, {
		arg: 1990,
		val: 5320816667
	}, {
		arg: 2000,
		val: 6127700428
	}, {
		arg: 2010,
		val: 6916183482
	}];

	vm.chartOptions = {
		dataSource: populationData,
		legend: {
			visible: false
		},
		series: {
			type: "bar"
		},
		argumentAxis: {
			tickInterval: 10,
			label: {
				format: {
					type: "decimal"
				}
			}
		},
		title: "World Population by Decade"
	};

}]);

