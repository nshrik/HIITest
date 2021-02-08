"use strict";
(function () {
	/*Dashboard services*/
	app.factory('dashboardService', function (UtilService, dashboardHelper) {

		var service = {};
		//This service will provides the Years List Filter
		service.getYearsList = function (model) {
			return UtilService.getAsyncData("api/Filter/Year", model);
		};

		//This service will provides the Regions List Filter
		service.getRegionsList = function (model) {
			return UtilService.getAsyncData("api/Filter/Region", model);
		};

		//This service will provides the Locations List Filter
		service.getLocationsList = function (model) {
			return UtilService.getAsyncData("api/Filter/Location", model);
		};

		//This service will provides the Departments List Filter
		service.getDepartmentsList = function (model) {
			return UtilService.getAsyncData("api/Filter/CostCenter", model);
		};

		//This service will provides the CompModels List Filter
		service.getCompModelsList = function (model) {
			return UtilService.getAsyncData("api/Filter/CompensationModel", model);
		};

		//This service will provides the Specialty Groups List Filter
		service.getSpecialtyGroupsList = function (model) {
			return UtilService.getAsyncData("api/Filter/SpecialtyGroup", model);
		};

		//This service will provides the Specialties List Filter
		service.getSpecialtiesList = function (model) {
			return UtilService.getAsyncData("api/Filter/Specialty", model);
		};

		//This service will provides the Directors List Filter
		service.getDirectorsList = function (model) {
			return UtilService.getAsyncData("api/Filter/Director", model);
		};


		//This service will provides the WidgetList Data For User
		service.getWidgetList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/WidgetList", model);
		};

		//This service will provides the BulletinList Widget Data
		service.getBulletinList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/BulletinMessages", model);
		};



		//This service will provides the InterfaceStatistics Widget Data
		service.getProviderBreakdownByCompModelList = function (model) {
            return UtilService.getAsyncData("api/Dashboard/ProviderBreakDownByCompModelForWeb", model);
		};

		//This service will provides the AlertNotificationDropdown Widget Data
		service.getAlertNotificationTypesList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/AlertNotificationTypes", model);
		};

		//This service will provides the AlertNotificationDropdown Widget Data
		service.getAlertNotificationDaysList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/AlertNotificationDays", model);
		};

		
		//This service will provides the AlertNotification Widget Data
        service.getNotificationLegendList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/AlertWidgetLegend", model);
		};

		//This service will provides the HiringStatusOnBoardingInProgress Widget Data
		service.getHiringStatusOnBoardingInProgressList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/HiringStatusOnBoardingInProgress", model);
		};

		//This service will provides the HiringStatusOnBoardingOnHold Widget Data
		service.getHiringStatusOnBoardingOnHoldList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/HiringStatusOnBoardingOnHold", model);
		};

		//This service will provides the ProviderCountBreakDownByOnBoardingStages Widget Data
		service.getProviderCountBreakDownByOnBoardingStagesList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderCountBreakDownByOnBoardingStages", model);
		};  

		//This service will provides the PayApprovalPending Widget Data
		service.getPayApprovalPendingList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/PayApprovalPending", model);
		}; 

		//This service will provides the PhysicianwRVUs - Last 12 months Widget Data
		service.getPhysicianwRVUsList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/PhysicianwRVUsForWeb", model);
		};

		//This service will provides the ZerowRVUsMonthWiseComparison Widget Data
		service.getZerowRVUsMonthWiseComparisonList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ZerowRVUsMonthWiseComparison", model);
		};

		//This service will provides the WorkRVUsProductivityStatsBySpecialty Widget Data
		service.getWorkRVUsProductivityStatsBySpecialtyList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/WorkRVUsProductivityStatsBySpecialty", model);
		}; 

		//This service will provides the WorkRVUsProductivityStatsByRegion Widget Data
		service.getWorkRVUsProductivityStatsByRegionList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/WorkRVUsProductivityStatsByRegion", model);
		};  

		//This service will provides the QualityMetrics Widget Data
		service.getQualityMetricsList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/QualityMetrics", model);
		};  

		//This service will provides the PayelementActualPerformance Widget Data
		service.getPayelementActualPerformanceList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/PayelementActualPerformance", model);
		};

		//This service will provides the ProviderScoreCard Widget Data
		service.getProviderScoreCardList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderScoreCard", model);
		};

		//This service will provides the ProviderScoreCardYear Widget Data
		service.getProviderScoreCardYearList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderScoreCardYear", model);
		};

		//This service will provides the ProviderScoreCardMonth Widget Data
		service.getProviderScoreCardMonthList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderScoreCardMonth", model);
		};

		//This service will provides the OpenCharts Widget Data
		service.getOpenChartsList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/OpenCharts", model);
		}; 

		//This service will provides the ProviderBreakDownBySpecialtyPopup Widget Data
		service.getProviderBreakDownBySpecialtyPopupList = function (model) {
            return UtilService.getAsyncData("api/Dashboard/ProviderBreakDownBySpecialtyWebPopup", model);
		};

		//This service will provides the YtdcmeBalanceByConsumedPopup Widget Data
		service.getYtdcmeBalanceByConsumedPopupList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/YtdcmeBalanceByConsumedPopup", model);
		};

		//This service will provides the YtdptoBalanceByConsumedPopup Widget Data
		service.getYtdptoBalanceByConsumedPopupList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/YtdptoBalanceByConsumedPopup", model);
		};

		//This service will provides the ProviderScoreCardDetails Widget Data
		service.getProviderScoreCardDetailsList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderScoreCardDetails", model);
		};

		//This service will provides the ProviderBreakDownByCostcenter Widget Data
		service.getProviderBreakDownByCostcenterList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderBreakDownByCostcenter", model);
		};

		//This service will provides the ProviderBreakDownByCostcenterPopup Widget Data
		service.getProviderBreakDownByCostcenterPopupList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderBreakDownByCostcenterPopup", model);
		};

		//This service will provides the DownloadProviderBreakDownBySpecialty Widget Data
		service.getDownloadProviderBreakDownBySpecialtyList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/DownloadProviderBreakDownBySpecialty", model);
		};

		//This service will provides the DownloadZerowRVUsMonthWiseComparison Widget Data
		service.getDownloadZerowRVUsMonthWiseComparisonList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/DownloadZerowRVUsMonthWiseComparison", model);
		};

		//This service will provides the DownloadAlerNotificationtWidget Widget Data
		service.getDownloadAlerNotificationtWidgetList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/DownloadAlerNotificationtWidget", model);
		};

		service.loadDataByWidget = function (model, apiMethodName) { 
			return UtilService.getSynchronousData("api/Dashboard/" + apiMethodName, model); 
		};

		//This service will save the Filters Data
		service.saveFilterList = function (model) {
			return UtilService.postData("api/Filter", model);
		}


		service.getVerifyingPerformance = function (model) {
			//return UtilService.getAsyncData("api/Dashboard/VerifyingPerformance", model);
			return null
		}  
		 

		//This service will provides the LastPayPeriodProcessedPopup Widget Data
		service.getLastPayPeriodProcessedPopupList = function (model) {
            return UtilService.getAsyncData("api/Dashboard/LastPayPeriodProcessedWebPopUp", model);
		};

		//This service will provides the LastPayPeriodProcessedPopup Data
		service.getProviderMultiProfilesList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/ProviderMultiProfiles", model);
		};

		//This service will provides the LoggedInUserDashboard Data
		service.getLoggedInUserDashboardList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/LoggedInUserDashboard", model);
		};

		//This service will provides the WidgetsByDashBoardDetailsId Data
		service.getWidgetsByDashBoardDetailsByIdList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/WidgetsByDashBoardDetailsId", model);
		};

		//This service will set the DisablePhysicianAlert Data
		service.SetDisablePhysicianAlert = function (model) {
			return UtilService.putData("api/Dashboard/DisablePhysicianAlert", model);
		};

		//This service will provides the DashboardFilterAccess Data
		service.getDashboardFilterAccessList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/DashboardFilterAccess", model);
		}; 

		//This service will provides the PayelementActualPerformance Widget Data
		service.getPayelementActualPerformanceList = function (model) {
			return UtilService.getAsyncData("api/Dashboard/PayelementActualPerformance", model);
        }; 

        //This service will provides the UpdateDashboardProviders Widget Data
        service.getUpdateDashboardProvidersList = function (model) {
            return UtilService.getAsyncData("api/Dashboard/UpdateDashboardProviders", model);
        }; 

        //This service will provides the BenchMarkingDataByGeneralSettings Data
        service.getBenchMarkDataByGeneralSettings = function (model) {
            return UtilService.getSynchronousData("api/Dashboard/HideBenchMarkingDataByGeneralSettings", model);
        };

		return service;
	});
})();