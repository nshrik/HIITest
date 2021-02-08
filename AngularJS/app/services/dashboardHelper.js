"use strict";
(function () {
	/*dashboard helperclass*/
	app.factory('dashboardHelper', function ($q, UtilService, uiGridExporterConstants) {

		var service = {
			MessageType: UtilService.MessageType,
			enumWidget: {
				TERMINATIONALERTS: 'TERMINATIONALERTS'
				, BULLETIN: 'BULLETIN'
				, CMEWIDGET: 'CMEWIDGET'
				, CONTRACTEXPIRY: 'CONTRACTEXPIRY'
				, PHYSEXPDET: 'PHYSEXPDET'
				, FTEWIDGET: 'FTEWIDGET'
				, INTSTS: 'INTSTS'
				, LASTPROCESSEDPAYPPAMOUNTBYPE: 'LASTPROCESSEDPAYPPAMOUNTBYPE'
				, LEVELSOFEXPERIENCE: 'LEVELSOFEXPERIENCE'
				, LOAWIDGET: 'LOAWIDGET'
				, MASTERCONTRACTEXPIRATION: 'MASTERCONTRACTEXPIRATION'
				, NEGPRODTWOQUARTERS: 'NEGPRODTWOQUARTERS'
				, PAYAPPROVALSPENDINGINCENTIVES: 'PAYAPPROVALSPENDINGINCENTIVES'
				, PendingApprovalsWidget: 'PendingApprovalsWidget'
				, COMPMDLBRKDOWN: 'COMPMDLBRKDOWN'
				, SPLBRKDOWN: 'SPLBRKDOWN'
				, PTOWIDGET: 'PTOWIDGET'
				, PHYSQUALITY: 'PHYSQUALITY'
				, wRVUAnalysis: 'wRVUAnalysis'
				, WRVUPRODLOC: 'WRVUPRODLOC'
				, WRVUPRODSPL: 'WRVUPRODSPL'
				, PhysicianwRVUs: 'PhysicianwRVUs'
				, ZEROWRVUS: 'ZEROWRVUS'
				, YTDShiftSummary: 'YTDShiftSummary'
				, HOSPITALISTSHIFTTARGET: 'HOSPITALISTSHIFTTARGET'
				, BudgetActuals: 'BudgetActuals'
				, PTOLTS: 'PTOLTS'
				, OveragePaymentAlert: 'OVERAGEPAYMENTALERT'
				, LastPayPeriodInboundReceived: 'LASTPAYPERIODINBOUNDRECEIVED'
				, TERMINATIONPROVIDERS: 'TERMINATIONPROVIDERS'
			}, emptyWidgetErrorMessage: 'Data not found for selected search criteria'
			, provnodataMessage: 'No data to display, Please save the search criteria or search for a provider'
			, uigridalign: { left: 'txt-left-align', right: 'txt-right-align' }
		}

		service.getGridObject = function (item) {
			var customObject = {};
			customObject.options = {
				varEnableGridMenu: true, varEnableSorting: true, varExporterMenuCsv: false, varEnableColumnMenus: false,
				varExporterMenuVisibleData: false, varGridMenuShowHideColumns: false, showColumnFooter: false, showGridFooter: false
			}
			customObject.HeaderText = 'Default Name';
			if (item != undefined) {
				var enumWidget = service.enumWidget;

				customObject.options.enumWidget = item;

				switch (item.trim()) {
					//case enumWidget.TERMINATIONALERTS:
					//	break;
					//case enumWidget.BULLETIN:
					//	break;
					//case enumWidget.CMEWIDGET:
					//	break;
					//case enumWidget.CONTRACTEXPIRY:
					//	break;
					case enumWidget.PHYSEXPDET:
						customObject.options.varEnableGridMenu = false;
						customObject.options.varEnableSorting = false;
						break;
					//case enumWidget.FTEWIDGET:
					//	break;
					//case enumWidget.INTSTS:
					//	break; 
					//case enumWidget.LEVELSOFEXPERIENCE:
					//	break;
					//case enumWidget.LOAWIDGET:
					//	break;
					//case enumWidget.NEGPRODTWOQUARTERS:
					//	break;
					case enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE:
						customObject.options.showColumnFooter = true;
						break;
					case enumWidget.LastPayPeriodInboundReceived:
						customObject.options.varEnableGridMenu = true;
						break;
					case enumWidget.WRVUPRODLOC:
					case enumWidget.WRVUPRODSPL:
					case enumWidget.SPLBRKDOWN:
						customObject.options.showColumnFooter = true;
						//customObject.options.showGridFooter = true;
						break;
					//case enumWidget.PTOWIDGET:
					//	break;
					//case enumWidget.PendingApprovalsWidget:
					//	//customObject.HeaderText = 'Default Name1';
					//	break;
					//case enumWidget.COMPMDLBRKDOWN:
					//	break;
					//case enumWidget.PAYAPPROVALSPENDINGINCENTIVES:
					//	break;
					//case enumWidget.MASTERCONTRACTEXPIRATION:
					//	break;
					//case enumWidget.wRVUAnalysis:
					//	break;
					//case enumWidget.PhysicianwRVUs:
					//	break;
					//case enumWidget.ZEROWRVUS:
					//	break;
					//case enumWidget.YTDShiftSummary:
					//	break;
					//case enumWidget.HOSPITALISTSHIFTTARGET:
					//	break;
					//case enumWidget.BudgetActuals:
					//	break; 
					default:
						break;
				}
			}

			return service.getGridConfig(customObject);
		}

		service.getDevExpressGridConfig = function (item, data, cols) {
			var dataGrid = $("#" + item.gridContainerId, $('#' + item.id)).dxDataGrid({
				dataSource: (data != undefined ? data : []),
				allowColumnReordering: true,
				showBorders: true,
				grouping: {
					autoExpandAll: true,
				},
				searchPanel: {
					visible: true
				},
				paging: {
					pageSize: 10
				},
				groupPanel: {
					visible: true
				},
				columns: (cols != undefined ? cols : []),
			}).dxDataGrid("instance");

			item.dataGrid = dataGrid;

			return dataGrid;
		}

		service.getGridConfig = function (customObject) {
			var gridApi;
			var formatters = {};

			var gridOptions = {
				showColumnFooter: customObject.options.showColumnFooter,
				enableGridMenu: customObject.options.varEnableGridMenu,
				enableSorting: customObject.options.varEnableSorting,
				exporterMenuCsv: customObject.options.varExporterMenuCsv,
				enableColumnMenus: customObject.options.varEnableColumnMenus,
				exporterMenuVisibleData: customObject.options.varExporterMenuVisibleData,
				gridMenuShowHideColumns: customObject.options.varGridMenuShowHideColumns,
				showColumnFooter: customObject.options.showColumnFooter,
				paginationPageSizes: [10, 25, 50, 100, 250],
				paginationPageSize: 10,
				widgetName: customObject.options.enumWidget,
				columnDefs: customObject.options.columnDefs != undefined ? customObject.options.columnDefs : [],
				onRegisterApi: function (_gridApi) {
					gridApi = _gridApi;
				},
				exporterMenuPdf: false,
				exporterMenuExcel: false,
				gridMenuCustomItems: [{
					title: 'Export as PDF',
					order: 201,
					action: function () {
						gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
					}
				},
				{
					title: 'Export as Excel',
					order: 300,
					action: function () {
						gridApi.exporter.excelExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
					}
				}],

				exporterPdfHeader: {
					columns: [
						{
							margin: [50, 10, 0, 0],
							//text: customObject.HeaderText,
							style: 'headerStyle',
							alignment: 'left'
						},
					]
				},
				exporterPdfDefaultStyle: { fontSize: 9 },
				exporterPdfTableStyle: { margin: [10, 50, 40, 60] },
				exporterPdfTableHeaderStyle: { fontSize: 12, bold: true },
				exporterPdfCustomFormatter: function (docDefinition) {
					docDefinition.styles.headerStyle = { fontSize: 22, bold: true };
					docDefinition.styles.footerStyle = { fontSize: 10, bold: true };
					return docDefinition;
				},
				//exporterExcelCustomFormatters: function (grid, workbook, docDefinition) {
				//	var stylesheet = workbook.getStyleSheet();
				//	var stdStyle = stylesheet.createFontStyle({
				//		size: 9, fontName: 'Calibri'
				//	});
				//	var boldStyle = stylesheet.createFontStyle({
				//		size: 9, fontName: 'Calibri', bold: true
				//	});
				//	var aFormatDefn = {
				//		"font": boldStyle.id,
				//		"alignment": { "wrapText": true }
				//	};
				//	var formatter = stylesheet.createFormat(aFormatDefn);
				//	// save the formatter
				//	formatters['bold'] = formatter;
				//	var dateFormatter = stylesheet.createSimpleFormatter('date');
				//	formatters['date'] = dateFormatter;

				//	aFormatDefn = {
				//		"font": stdStyle.id,
				//		"fill": { "type": "pattern", "patternType": "solid", "fgColor": "FFFFC7CE" },
				//		"alignment": { "wrapText": true }
				//	};
				//	var singleDefn = {
				//		font: stdStyle.id,
				//		format: '#,##0.0'
				//	};
				//	formatter = stylesheet.createFormat(aFormatDefn);
				//	// save the formatter
				//	formatters['red'] = formatter;

				//	Object.assign(docDefinition.styles, formatters);

				//	return docDefinition;
				//},
				//exporterFieldFormatCallback: function (grid, row, gridCol, cellValue) {
				//	// set metadata on export data to set format id. See exportExcelHeader config above for example of creating
				//	// a formatter and obtaining the id

				//	var formatterId = null;
				//	if (gridCol.field === 'Provider' && cellValue && cellValue.startsWith('N')) {
				//		formatterId = formatters['red'].id;
				//	}

				//	if (gridCol.field === 'updatedDate') {
				//		formatterId = formatters['date'].id;
				//	}

				//	if (formatterId) {
				//		return { metadata: { style: formatterId } };
				//	} else {
				//		return null;
				//	}
				//},
				exporterFieldCallback: function (grid, row, col, value) {
					try {
						if (value != null) {
							value = value.replace(/<br\s*[\/]?>/gi, " \n");
						}
					} catch (e) {//ignore 
					}
					return value;
				},
				exporterExcelHeader: function (grid, workbook, sheet, docDefinition) {
					//// this can be defined outside this method
					//var headername = grid.options.exporterExcelFilename.replace('.xlsx', '');

					//var stylesheet = workbook.getStyleSheet();
					//var aFormatDefn = {
					//	"font": { "size": 12, "fontName": "Calibri", "bold": true },
					//	//"alignment": { "wrapText": true }
					//};
					//var formatterId = stylesheet.createFormat(aFormatDefn);

					//// excel cells start with A1 which is upper left corner
					//sheet.mergeCells('B1', 'C1'); 
					//var cols = [];
					//// push empty data
					//cols.push({ value: '' });
					//// push data in B1 cell with metadata formatter 
					//cols.push({ value: headername, metadata: { style: formatterId.id } });
					//sheet.data.push(cols);
				},
			}
			return gridOptions;
		}

		service.cellTemplateLastPayPeriod = function cellTemplateLastPayPeriod(IsEnablelink) {

			return '<div title="{{row.entity.CompModelPayElement}}" class="txt-left-align ui-grid-cell-contents">' +
				'<div ng-if="row.entity.PhysicianId != null && row.entity.PhysicianId > 0">' +
				'<a href="#" ng-class="{disabled:' + IsEnablelink + '}" ' +
				'ng-click="grid.appScope.ctrl.LastPayPeriodProcessed_click(row);$event.preventDefault();">{{row.entity.CompModelPayElement}}</a></div>' +
				'<div ng-if="row.entity.PhysicianId == null || row.entity.PhysicianId == 0">{{row.entity.CompModelPayElement}}</div>' +
				'</div >';
		}

		//handle response
		service.handleResponseByWidget = function (response, vm, item) {

			var enumWidget = service.enumWidget;

			var myElement = null;
			var noDataFound = false;

			try {
				myElement = vm.pageSettings.selectedWidgets.find((element) => element.WidgetCode === item.widget.WidgetCode.trim());
			} catch (e) {
				//ignore 
			}

			if (response == null || response == undefined) {
				noDataFound = true;
				//In case of no data returned

			} else {
				if (noDataFound == false) {
					var align = service.uigridalign;
					noDataFound = true;
					switch (item.widget.WidgetCode.trim()) {
						case enumWidget.PendingApprovalsWidget:
							noDataFound = false;
							item.gridOptions = {
								columnDefs: [
									{ field: 'PayElement', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{
										field: 'PendingCount', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, headerTooltip: true,
										cellTemplate: '<div title="{{row.entity.PendingCount}}" class="ui-grid-cell-contents ' + align.right + '"><a  ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.PendingApprovals_click(row)">{{row.entity.PendingCount}}</a></div>',
									}
								],
								data: response.HeaderDetails
							};
							break;
						case enumWidget.INTSTS:
							noDataFound = false;
							item.gridOptions = {
								columnDefs: [
									{ field: 'InterfaceDescription', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false, },
									{ field: 'ProcessedDateAndTimeCST', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[1].ColumnName, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};
							break;
						case enumWidget.NEGPRODTWOQUARTERS:
							noDataFound = false;
							item.gridOptions = {
								columnDefs: [
									{
										field: 'ProviderName', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, enableColumnMenu: false, headerTooltip: true,
										//cellTemplate: '<div class="ui-grid-cell-contents"><a  ng-disabled="' + isDisabled + '" ng-click="isDisabled || grid.appScope.ctrl.NegativeProductivity_click(row);$event.preventDefault();">{{row.entity.ProviderName}}</a></div>'
										cellTemplate: '<div title="{{row.entity.ProviderName}}" class="txt-left-align ui-grid-cell-contents"><a ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.NegativeProductivity_click(row);$event.preventDefault();">{{row.entity.ProviderName}}</a></div>'
									},
									{ field: 'PayrollId', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'CompensationModel', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'PreviousQuarter', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false, enableSorting: false },
									{ field: 'LatestQuarter', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false, enableSorting: false }
								],
								data: response.HeaderDetails
							}
							break;
						case enumWidget.CONTRACTEXPIRY:
							noDataFound = false;
							item.gridOptions = {
								columnDefs: [
									{
										field: 'Provider', displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false, headerCellClass: align.left, headerTooltip: true,
										cellTemplate: '<div title="{{row.entity.Provider}}" class="ui-grid-cell-contents txt-left-align"><a ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.ContractExpiryAndRenewal_click(row)">{{row.entity.Provider}}</a></div>'
									},
									{ field: 'PayRollId', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{
										field: 'ExpiryDate', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, enableColumnMenu: false, cellTooltip: true, headerTooltip: true,
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return row.entity.ApplyColour + ' txt-left-align' }
									},
									{ field: 'CompensationModel', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};
							break;
						case enumWidget.FTEWIDGET:
							if (vm.CurrentUserInfo == vm.UserDetail.PHYSICIAN) {
								item.gridOptions = {
									columnDefs: [
										{ field: 'TotalContractualFTE', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'FTEPerHRFile', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
									]
								};
							}
							else {
								item.gridOptions = {
									columnDefs: [
										{ field: 'PayrollId', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'ProviderName', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'TotalContractualFTE', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'FTEPerHRFile', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
									]
								};
							}
							item.gridOptions.data = response.HeaderDetails;
							noDataFound = false;
							break;
						case enumWidget.SPLBRKDOWN:
							item.gridOptions = {
								columnDefs: [
									{
										field: 'Specialty', displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false, headerCellClass: align.left, headerTooltip: true,
										cellTemplate: '<div title="{{row.entity.Specialty}}" class="ui-grid-cell-contents txt-left-align"><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.ProviderBreakDown_Specialty_click(row)">{{row.entity.Specialty}}</a></div>',
										footerCellTemplate: '<div class="ui-grid-cell-contents font-weight-bold"> Total Providers: ' + response.HeaderDetails.TotalProviders + '</div>'
									},
									{
										field: 'Count', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, headerTooltip: true, cellTooltip: true,
										footerCellTemplate: '<div class="ui-grid-cell-contents font-weight-bold"> Specialty Total: ' + response.HeaderDetails.TotalSpecialty + '</div>'
									},
									{
										field: 'CurrentClinicalFTE', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, headerTooltip: true, cellTooltip: true,
										footerCellTemplate: '<div class="ui-grid-cell-contents font-weight-bold"> Total Clinical FTE: ' + response.HeaderDetails.TotalClinicalFTE + '</div>'
									},
								],
								data: response.HeaderDetails.HeaderDetails
							};
							noDataFound = false;
							break;
						case enumWidget.PHYSEXPDET:
							item.gridOptions = {
								columnDefs: [
									{ field: 'Datetype', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false, headerCellTemplate: '<div></div>' },
									{
										field: 'DateStr', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, enableColumnMenu: false, cellTooltip: true, headerTooltip: true, headerCellTemplate: '<div></div>',
										cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return row.entity.ApplyColour + ' txt-left-align' }
									}
								],
								data: response.HeaderDetails
							};
							noDataFound = false;
							break;
						case enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE:
							item.gridOptions = {
								columnDefs: [
									{
										field: 'CompModelPayElement', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, enableColumnMenu: false, headerTooltip: true,
										cellTemplate: service.cellTemplateLastPayPeriod(!myElement.IsEnableHyperlinks),
										footerCellTemplate: '<div class="ui-grid-cell-contents text-left font-weight-bold">Total: </div>'
									},
									{ field: 'Units', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'Rate', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{
										field: 'Amount', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, cellTooltip: true, headerTooltip: true,
										footerCellTemplate: '<div class="ui-grid-cell-contents text-right font-weight-bold" style="">' + response.HeaderDetails.TotalAmount + '</div>'
									},
									{
										field: 'YTDEarnings', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, cellTooltip: true, headerTooltip: true,
										footerCellTemplate: '<div class="ui-grid-cell-contents text-right font-weight-bold" style="">' + response.HeaderDetails.TotalYTDEarnings + '</div>'
									}
								],
								data: response.HeaderDetails.HeaderDetails
							};
							noDataFound = false;
							item.PayPeriodName = ": " + response.HeaderDetails.HeaderName;
							break;
						case enumWidget.LastPayPeriodInboundReceived:
							if (response.HeaderColumns != null && response.HeaderDetails && response.HeaderColumns != null && response.HeaderColumns.length > 0) {
								var _data = response.HeaderDetails.PayPeriodInboundList;

								if (_data != null) {

									item.gridOptions = {
										columnDefs: [
											{
												field: 'PayElementDesc', displayName: response.HeaderColumns[0].ColumnName, minWidth: 250, headerCellClass: align.left, enableSorting: false, enableColumnMenu: false, headerTooltip: true
												, cellTemplate: '<div class="ui-grid-cell-contents ' + align.left + '" title="{{row.entity.PayElementDesc}}">'
													+ '<b ng-show="row.entity.Source!=null">{{row.entity.PayElementDesc}}</b>'
													+ '<span ng-show="row.entity.Source==null">&nbsp;&nbsp;&nbsp;{{row.entity.PayElementDesc}}</span></div>'
											},
											{ field: 'Units', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, enableSorting: false, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{ field: 'Rate', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, enableSorting: false, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{
												field: 'Amount', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, enableSorting: false, enableColumnMenu: false, cellTooltip: true, headerTooltip: true
												, cellTemplate: '<div class="ui-grid-cell-contents ' + align.right + '" >'
													+ '<b ng-show="grid.appScope.ctrl.gridOperation.isFooter(row.entity.Source)">{{row.entity.Amount}}</b>'
													+ '<span ng-show="row.entity.Source==null">{{row.entity.Amount}}</span></div>'
											},
											{
												field: 'YTDEarnings', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.right, cellClass: align.right, enableSorting: false, enableColumnMenu: false, cellTooltip: true, headerTooltip: true
												, cellTemplate: '<div class="ui-grid-cell-contents ' + align.right + '" >'
													+ '<b ng-show="grid.appScope.ctrl.gridOperation.isFooter(row.entity.Source)">{{row.entity.YTDEarnings}}</b>'
													+ '<span ng-show="row.entity.Source==null">{{row.entity.YTDEarnings}}</span></div>'
											}
										],
										data: _data
									};

									item.PayPeriodName = (response.HeaderDetails.HeaderName != null ? ": " + response.HeaderDetails.HeaderName : "");

									noDataFound = false;
								}
							}
							break;
						case enumWidget.WRVUPRODLOC:
							item.LastMonthwRVUUploaded = response.HeaderDetails.HeaderName;
							item.gridOptions = {
								columnDefs: [
									{
										field: 'Location', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, enableColumnMenu: false, headerTooltip: true,
										cellTemplate: '<div title="{{row.entity.Location}}" class="ui-grid-cell-contents txt-left-align"><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.WRVUsProductivityByLocation_click(row)">{{row.entity.Location}}</a></div>',
										footerCellTemplate: '<div class="ui-grid-cell-contents text-right font-weight-bold">Total: </div>'
									},
									{
										field: 'YTDwRVU', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, cellTooltip: true, headerTooltip: true,
										footerCellTemplate: '<div class="ui-grid-cell-contents font-weight-bold" style="">' + response.HeaderDetails.TotalYTDwRVUs + '</div>'
									},
									{
										field: 'TargetwRVU', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, enableColumnMenu: false, cellTooltip: true, headerTooltip: true,
										footerCellTemplate: '<div class="ui-grid-cell-contents font-weight-bold" style="">' + response.HeaderDetails.TotalTargetwRVUs + '</div>'
									},
									{ field: 'Variance', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails.HeaderDetails
							};
							noDataFound = false;
							break;
						case enumWidget.LEVELSOFEXPERIENCE:
							item.gridOptions = {
								columnDefs: [
									{ field: 'PayRollID', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'ProviderName', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'ContractDates', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'Experience', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'PreviousExperience', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'NewExperience', displayName: response.HeaderColumns[5].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};
							noDataFound = false;
							break;
						case enumWidget.CMEWIDGET:
							item.YTDCMEBalanceTitleDate = response.HeaderDetails.YTDCMEBalanceTitleDate == undefined ? moment().format('L') : response.HeaderDetails.YTDCMEBalanceTitleDate;

							if (response.HeaderColumns != null && response.HeaderDetails && response.HeaderDetails != null && response.HeaderDetails.TotalNoOfRecords > 0) {
								if (vm.CurrentUserInfo == vm.UserDetail.PHYSICIAN) {//'PHYSICN') {
									item.gridOptions = {
										columnDefs: [
											{ field: 'Eligible', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{
												field: 'Consumed', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, enableColumnMenu: false, headerTooltip: true,
												cellTemplate: '<div title="{{row.entity.Consumed}}" class="ui-grid-cell-contents txt-right-align"><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.YtdcmeBalance_click(row);$event.preventDefault();">{{row.entity.Consumed}}</a></div>'
											},
											{ field: 'TotalFTE', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{ field: 'Balance', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }

										]
									};
								}
								else {
									item.gridOptions = {
										columnDefs: [
											{ field: 'Provider', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{ field: 'PayrollID', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{ field: 'Eligible', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{
												field: 'Consumed', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, enableColumnMenu: false, headerTooltip: true,
												cellTemplate: '<div title="{{row.entity.Consumed}}" class="ui-grid-cell-contents txt-right-align"><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.YtdcmeBalance_click(row);$event.preventDefault();">{{row.entity.Consumed}}</a></div>'
											},
											{ field: 'TotalFTE', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
											{ field: 'Balance', displayName: response.HeaderColumns[5].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }

										]
									};
								}
								item.gridOptions.data = response.HeaderDetails.HeaderDetails;

								noDataFound = false;
							}
							//item.gridOptions.data = response.HeaderDetails.HeaderDetails;
							break;
						case enumWidget.PTOWIDGET:

							item.YTDPTOBalanceTitleDate = response.HeaderDetails.YTDPTOBalanceTitleDate == undefined ? moment().format('L') : response.HeaderDetails.YTDPTOBalanceTitleDate
							if (response.HeaderColumns != null && response.HeaderDetails && response.HeaderDetails != null && response.HeaderDetails.TotalNoOfRecords > 0) {
								item.gridOptions = {
									columnDefs: [
										{
											field: 'Provider', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.right, enableColumnMenu: false, headerTooltip: true,
											cellTemplate: '<div title="{{row.entity.Provider}}" class="ui-grid-cell-contents txt-right-align"><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.YtdptoBalance_click(row);$event.preventDefault();">{{row.entity.Provider}}</a></div>'
										},
										{ field: 'PayrollId', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'PTOATOEligible', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'PTOATOConsumed', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'PTOATOBalance', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'EIBEligible', displayName: response.HeaderColumns[5].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'EIBConsumed', displayName: response.HeaderColumns[6].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'EIBBalance', displayName: response.HeaderColumns[7].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
									],
									data: response.HeaderDetails.HeaderDetails
								};

								noDataFound = false;
							}
							break;
						case enumWidget.LOAWIDGET:
							item.gridOptions = {
								columnDefs: [
									{ field: 'PayrollId', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'ProviderName', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'LOADuration', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'NoOfDays', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'CreatedDate', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};

							noDataFound = false;
							break;
						case enumWidget.BudgetActuals:
							item.gridOptions = {
								columnDefs: [
									{ field: 'ProviderName', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'ClinicalFTE', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'wRVUS', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'BudgetwRVUs', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'Variance', displayName: response.HeaderColumns[4].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'FYTDwRVUs', displayName: response.HeaderColumns[5].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'FYTDBudgetwRVUs', displayName: response.HeaderColumns[6].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'FiscalVariance', displayName: response.HeaderColumns[7].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};

							noDataFound = false;
							break;
						case enumWidget.ZEROWRVUS:

							item.SubHeaderName = response.HeaderDetails.HeaderName;
							item.Variance = response.HeaderDetails.Variance;
							if (response.HeaderColumns != null && response.HeaderDetails && response.HeaderDetails != null && response.HeaderDetails.HeaderDetails && response.HeaderDetails.HeaderDetails != null && response.HeaderDetails.HeaderDetails.length > 0) {

								item.gridOptions = {
									columnDefs: [
										{ field: 'Provider', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'PayrollProviderID', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'LatestMonthwRVUs', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'Last3MonthswRVUsAvg', displayName: response.HeaderColumns[3].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
										{ field: 'variance', displayName: response.HeaderColumns[4].ColumnName, cellTooltip: true, headerCellClass: align.right, cellClass: align.right, headerTooltip: true, enableColumnMenu: false }
									],
									data: response.HeaderDetails.HeaderDetails
								};

								noDataFound = false;
							}
							break;
						case enumWidget.MASTERCONTRACTEXPIRATION:
							item.gridOptions = {
								columnDefs: [
									{ field: 'ProviderName', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'ProviderId', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'ExpiryDate', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};

							noDataFound = false;
							break;
						case enumWidget.PAYAPPROVALSPENDINGINCENTIVES:
							item.gridOptions = {
								columnDefs: [
									{ field: 'Description', displayName: response.HeaderColumns[0].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'Amount', displayName: response.HeaderColumns[1].ColumnName, headerCellClass: align.right, cellClass: align.right, cellTooltip: true, headerTooltip: true, enableColumnMenu: false },
									{ field: 'Status', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, cellClass: align.left, cellTooltip: true, headerTooltip: true, enableColumnMenu: false }
								],
								data: response.HeaderDetails
							};

							noDataFound = false;
							break;
						case enumWidget.HOSPITALISTSHIFTTARGET:
							item.gridOptions = {
								//            columnDefs: [
								//                { field: 'Provider', displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false },
								//                { field: 'PayrollProviderID', displayName: response.HeaderColumns[1].ColumnName, enableColumnMenu: false },
								//                { field: 'LatestMonthwRVUs', displayName: response.HeaderColumns[2].ColumnName, enableColumnMenu: false },
								//                { field: 'Last3MonthswRVUsAvg', displayName: response.HeaderColumns[3].ColumnName, enableColumnMenu: false },
								//                { field: 'variance', displayName: response.HeaderColumns[4].ColumnName, enableColumnMenu: false }
								//            ],
								data: response.HeaderDetails
							};

							noDataFound = false;
							break;
						case enumWidget.wRVUAnalysis:
							var hdrCols = response.HeaderColumns;
							var hdrDetails = response.HeaderDetails;

							var completeInfo = [];

							completeInfo.push({ Header: { Name: hdrCols[0].ColumnName, Value: hdrDetails["Specialty"] }, Details: hdrCols[0], ColumnOrder: hdrCols[0].ColumnOrder });                               //Specialty
							completeInfo.push({ Header: { Name: hdrCols[1].ColumnName, Value: hdrDetails["MonthlywRVUsRolling12MonthAvg"] }, Details: hdrCols[1], ColumnOrder: hdrCols[1].ColumnOrder });           //Monthly wRVUs,Rolling 12 Month Avg
							completeInfo.push({ Header: { Name: hdrCols[2].ColumnName, Value: hdrDetails["Rolling12MonthwRVUTotal"] }, Details: hdrCols[2], ColumnOrder: hdrCols[2].ColumnOrder });                 //Rolling 12 Month wRVU Total
							completeInfo.push({ Header: { Name: hdrCols[3].ColumnName, Value: hdrDetails["ContractDuration"] }, Details: hdrCols[3], ColumnOrder: hdrCols[3].ColumnOrder });                        //Contract Duration
							completeInfo.push({ Header: { Name: hdrCols[4].ColumnName, Value: hdrDetails["GuaranteedEndDate"] }, Details: hdrCols[4], ColumnOrder: hdrCols[4].ColumnOrder });
							completeInfo.push({ Header: { Name: hdrCols[5].ColumnName, Value: hdrDetails["wRVUsContractYTDTotal"] }, Details: hdrCols[5], ColumnOrder: hdrCols[5].ColumnOrder });                   //Guaranteed End Date
							completeInfo.push({ Header: { Name: hdrCols[6].ColumnName, Value: hdrDetails["AvgClinicalFTEPast12Months"] }, Details: hdrCols[6], ColumnOrder: hdrCols[6].ColumnOrder });              //Avg. Clinical FTE Past 12 Months
							completeInfo.push({ Header: { Name: hdrCols[7].ColumnName, Value: hdrDetails["wRVUsTotalAdjustedto1FTEand12months"] }, Details: hdrCols[7], ColumnOrder: hdrCols[7].ColumnOrder });     //wRVUs Total Adjusted to 1 FTE and 12 months

							if (!item.HideBenchmarkingData) {
								completeInfo.push({ Header: { Name: hdrCols[8].ColumnName, Value: hdrDetails["CurrentProductivityPercentile"] }, Details: hdrCols[8], ColumnOrder: hdrCols[8].ColumnOrder });           //Current Productivity Percentile
								completeInfo.push({ Header: { Name: hdrCols[9].ColumnName, Value: hdrDetails["AvgPercentileforProvidersinSameSpecialty"] }, Details: hdrCols[9], ColumnOrder: hdrCols[9].ColumnOrder });//Avg. Percentile for Providers in Same Specialty
								completeInfo.push({ Header: { Name: hdrCols[10].ColumnName, Value: hdrDetails["%AboveorBelow"] }, Details: hdrCols[10], ColumnOrder: hdrCols[10].ColumnOrder });                        //% Above or Below
							}
							completeInfo.push({ Header: { Name: hdrCols[11].ColumnName, Value: hdrDetails["AvgwRVUsforProvidersinSameSpecialty"] }, Details: hdrCols[11], ColumnOrder: hdrCols[11].ColumnOrder });  //Avg. wRVUs for Providers in Same Specialty

							//sort the data based on column order
							completeInfo.sort((a, b) => (a.ColumnOrder > b.ColumnOrder) ? 1 : ((b.ColumnOrder > a.ColumnOrder) ? -1 : 0));

							//assign the info   
							item.gridOptions = completeInfo;

							noDataFound = false;
							break;
						case enumWidget.YTDShiftSummary:
							//response was not handled 

							noDataFound = false;
							break;
						case enumWidget.TERMINATIONALERTS:
							//if (response.data.HeaderDetails.length < 10) {
							//    vm.AlertNotifications.gridOptions.enableHorizontalScrollbar = 0;
							//    vm.AlertNotifications.gridOptions.enableVerticalScrollbar = 0;
							//}
							if (response.HeaderColumns != null && response.HeaderDetails && response.HeaderDetails != null && response.HeaderDetails.length > 0) {

								item.gridOptions = {
									columnDefs: [
										{
											field: 'Category', displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false, headerCellClass: align.left, headerTooltip: true, cellTooltip: true,
											cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return row.entity.Color + ' txt-left-align' }
										},
										{
											field: 'Name', displayName: response.HeaderColumns[1].ColumnName, enableColumnMenu: false, headerCellClass: align.left, headerTooltip: true,
											cellTemplate: '<div title="{{row.entity.Name}}" class="ui-grid-cell-contents txt-left-align"><input ng-click="grid.appScope.ctrl.IsAlertPhy_Checked($event, IsAccepted, row)" type="checkbox" ng-show="row.entity.IsChkBox" name="Name" value="Name" /><a href="#" ng-class="{disabled:' + !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.alertNotification_click(row)">{{row.entity.Name}}</a></div>'
										},
										{
											field: 'Details', displayName: response.HeaderColumns[2].ColumnName, headerCellClass: align.left, cellClass: align.left, enableColumnMenu: false, headerTooltip: true,
											cellTemplate: '<div title="{{row.entity.Details}}" ng-bind-html="row.entity[col.field]"></div>'
										}
									],
									data: response.HeaderDetails
								};
								noDataFound = false;
							}
							break;

						case enumWidget.TERMINATIONPROVIDERS:
							if (response.HeaderColumns != null && response.HeaderDetails && response.HeaderDetails != null && response.HeaderDetails.length > 0) {

								var tinypaddingleft = 'grid-col-paddingleft-tiny';
								item.gridOptions = {
									columnDefs: [
										{
											field: 'PayrollID', displayName: response.HeaderColumns[0].ColumnName, maxWidth: 120, enableColumnMenu: false, headerCellClass: align.left, headerTooltip: true, cellTooltip: true
											//, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return row.entity.Colour + ' ' + align.left }
										},
										{
											field: 'PhysicianName', displayName: response.HeaderColumns[1].ColumnName, enableColumnMenu: false, headerCellClass: align.left + ' ' + tinypaddingleft, headerTooltip: true
											, cellTemplate: '<div title="{{row.entity.PhysicianName}}" class="ui-grid-cell-contents ' + align.left + '"><input style="margin-top:3px"'
												+ 'ng-click="grid.appScope.ctrl.TerminationProvidersDetails.isAlertPhy_Checked($event, IsAccepted, row)" type="checkbox" ng-checked="{{row.entity.DisableTerminationAlert}}" custom-class="' + item.widget.WidgetCode + '-PhysicianName-checkbox" name="{{row.entity.PhysicianId}}-TERMINATIONPROVIDERS" />'
												//+ '<a href="#" ng-class="{disabled:'
												//+ !myElement.IsEnableHyperlinks + '}" ng-click="grid.appScope.ctrl.TerminationProvidersDetails.isAlertPhy_Checked(row)">{{row.entity.PhysicianName}}</a></div>'
												//+ (item.showdiablechecked ? '<span class="' + tinypaddingleft + '"></span>' : '')
												+ '<label style="margin-top:-2px">{{row.entity.PhysicianName}}</label></div>'
										},
										{
											field: 'TerminationDate', displayName: response.HeaderColumns[2].ColumnName, maxWidth: 118, headerCellClass: align.left, cellClass: align.left, enableColumnMenu: false, headerTooltip: true
											, cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) { return row.entity.Colour + ' ' + align.left }
										}
									],
									data: response.HeaderDetails
								};
								noDataFound = false;
							}
							break;
						case enumWidget.PTOLTS:
							if (response.HeaderDetails != null && response.HeaderDetails != undefined && response.HeaderDetails.length > 0) {
								if (vm.CurrentUserInfo == vm.UserDetail.PHYSICIAN) {//'PHYSICN') {
									item.gridOptions = {
										columnDefs: [
											{ field: 'PlanHours', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[2].ColumnName, enableColumnMenu: false },
											{ field: 'CFBalance', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[3].ColumnName, enableColumnMenu: false },
											{ field: 'AnniversaryDate', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[4].ColumnName, enableColumnMenu: false },
											{ field: 'HoursUsed', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[5].ColumnName, enableColumnMenu: false },
											{ field: 'Balance', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[6].ColumnName, enableColumnMenu: false }
										]
									}
								}
								else {
									item.gridOptions = {
										columnDefs: [
											{ field: 'PayrollID', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false, },
											{ field: 'Provider', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[1].ColumnName, enableColumnMenu: false },
											{ field: 'PlanHours', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[2].ColumnName, enableColumnMenu: false },
											{ field: 'CFBalance', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[3].ColumnName, enableColumnMenu: false },
											{ field: 'AnniversaryDate', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[4].ColumnName, enableColumnMenu: false },
											{ field: 'HoursUsed', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[5].ColumnName, enableColumnMenu: false },
											{ field: 'Balance', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[6].ColumnName, enableColumnMenu: false }
										]
									}
								}
								item.gridOptions.data = response.HeaderDetails;
								noDataFound = false;
							}
							break;
						case enumWidget.OveragePaymentAlert:
							if (response.HeaderDetails != null && response.HeaderDetails != undefined && response.HeaderDetails.length > 0) {

								item.gridOptions = {
									columnDefs: [
										{ field: 'PayrollID', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[0].ColumnName, enableColumnMenu: false, },
										{ field: 'Provider', cellClass: align.left, headerCellClass: align.left, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[1].ColumnName, enableColumnMenu: false },
										{ field: 'ContractedHours', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[2].ColumnName, enableColumnMenu: false },
										{ field: 'ActualHours', cellClass: align.right, headerCellClass: align.right, cellTooltip: true, headerTooltip: true, displayName: response.HeaderColumns[3].ColumnName, enableColumnMenu: false }
									],
									data: response.HeaderDetails
								};
								noDataFound = false;
							}
							break;

						//End of Switch case
					}
				}

				if (noDataFound) {
					//In case of no data returned
					item.gridOptions = { columnDefs: [], data: [], enableHorizontalScrollbar: 0, enableVerticalScrollbar: 0 }

					//display empty message
					service.displayEmptyMessage($("#" + item.id));

					switch (item.widget.WidgetCode.trim()) {
						case enumWidget.CMEWIDGET:

							item.YTDCMEBalanceTitleDate = (response.HeaderDetails && response.HeaderDetails.YTDCMEBalanceTitleDate) == undefined ? moment().format('L') : response.HeaderDetails.YTDCMEBalanceTitleDate;
							break;
						case enumWidget.PTOWIDGET:
							item.YTDPTOBalanceTitleDate = (response.HeaderDetails && response.HeaderDetails.YTDPTOBalanceTitleDate) == undefined ? moment().format('L') : response.HeaderDetails.YTDPTOBalanceTitleDate
							break;
						case enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE:
						case enumWidget.LastPayPeriodInboundReceived:
							item.PayPeriodName = "";
							break;
					}
				}

				try {
					//set export alignment formatting
					if (item.gridOptions.columnDefs != undefined && item.gridOptions.columnDefs.length > 0) {
						for (var i = 0; i < item.gridOptions.columnDefs.length; i++) {
							var exportalign = (item.gridOptions.columnDefs[i].cellClass == align.right ? 'right' : 'left');
							item.gridOptions.columnDefs[i].exporterPdfAlign = exportalign;
							item.gridOptions.columnDefs[i].exporterExcelAlign = exportalign;
						}
					}
				} catch (e) {
					//ignore as this is just an extra feature
				}
			}
		}

		service.getWidgetObject = function (vm, item) {
			var enumWidget = service.enumWidget;

			switch (item.widget.WidgetCode.trim()) {
				case enumWidget.TERMINATIONALERTS:
					//8. Alert Notifications Widget 
					item = vm.AlertNotifications;
					break;
				case enumWidget.TERMINATIONPROVIDERS:
					item = vm.TerminationProvidersDetails;
					break;
				case enumWidget.BULLETIN:
					break;
				case enumWidget.CMEWIDGET:
					//10. CME Balance Widget 
					item = vm.CMEBalance;
					break;
				case enumWidget.CONTRACTEXPIRY:
					//1. Contractual Expiration
					item = vm.ContractExpiryAndRenewal;

					break;
				case enumWidget.PHYSEXPDET:
					item = vm.ProviderExpirationDetails;
					break;
				case enumWidget.FTEWIDGET:
					//14. FTE Discrepancy Widget   
					item = vm.FteDiscrepancy;
					break;
				case enumWidget.INTSTS:
					//7.Interface Statistics 
					item = vm.InterfaceStatistics;
					break;
				case enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE:
					//2. Last Pay period Processed
					item = vm.LastPayPeriodProcessed;
					break;
				case enumWidget.LastPayPeriodInboundReceived:
					item = vm.LastPayPeriodInboundReceived;
					break;
				case enumWidget.LEVELSOFEXPERIENCE:
					//16.Levels of Experience
					item = vm.LevelsOfExperience;
					break;
				case enumWidget.LOAWIDGET:
					//15.LOA Record Widget   
					item = vm.LOARecordsHRInterface;
					break;
				case enumWidget.NEGPRODTWOQUARTERS:
					//9.Negative Productivity for two Consecutive Quarters 
					item = vm.NegativeProductivityTwoQuarters;
					break;
				case enumWidget.WRVUPRODLOC:
					break;
				case enumWidget.WRVUPRODSPL:
					break;
				case enumWidget.SPLBRKDOWN:
					//5. Physician Breakdown By Specialty  
					item = vm.ProviderBreakDownBySpecialty;
					break;
				case enumWidget.PTOWIDGET:
					//11.PTO Balance Widget  
					item = vm.YTDPTOBalance;
					break;
				case enumWidget.PendingApprovalsWidget:
					//21. Pending Approvals Widget  
					item = vm.PendingApprovals;
					break;
				case enumWidget.COMPMDLBRKDOWN:
					break;
				case enumWidget.PAYAPPROVALSPENDINGINCENTIVES:
					//3.Pay Approval Pending 
					item = vm.PayApprovalsPendingIncentives;
					break;
				case enumWidget.MASTERCONTRACTEXPIRATION:
					break;
				//case enumWidget.PHYSQUALITY:
				//    //$("#").addClass("order-" + widget.DisplayOrder);
				//    //$('#').show();

				//    break;
				case enumWidget.wRVUAnalysis:
					item = vm.wRVUAnalysisPast12Months;
					break;
				case enumWidget.PhysicianwRVUs:
					break;
				case enumWidget.ZEROWRVUS:
					//6. Zero wRVUs/wRVUs Variance 
					item = vm.wRVUsVariance;
					break;
				case enumWidget.YTDShiftSummary:
					//19. YTD Shift Summary
					item = vm.YTDShiftSummary;
					break;
				case enumWidget.HOSPITALISTSHIFTTARGET:
					//20. Hospitalist Shift Target Alert 
					item = vm.HospitalistShiftTarget;
					break;
				case enumWidget.BudgetActuals:
					break;
				case enumWidget.PTOLTS:
					//PTOLTS
					item = vm.PTOLTS;
					break;
				case enumWidget.OveragePaymentAlert:
					//OveragePayment
					item = vm.OveragePaymentAlert;
					break;
			}
			return item;
		}

		service.setWidgetData = function (vm, item) {
			var enumWidget = service.enumWidget;

			switch (item.widget.WidgetCode.trim()) {
				case enumWidget.TERMINATIONALERTS:
					//8. Alert Notifications Widget 
					vm.AlertNotifications = item;
					vm.GetAlertNotificationTypesValues();
					vm.GetAlertNotificationDaysValues();
					break;
				case enumWidget.TERMINATIONPROVIDERS:
					vm.TerminationProvidersDetails = item;
					vm.GetAlertNotificationTypesValues();
					break;
				case enumWidget.BULLETIN:
					break;
				case enumWidget.CMEWIDGET:
					//10. CME Balance Widget 
					vm.CMEBalance = item;
					break;
				case enumWidget.CONTRACTEXPIRY:
					//1. Contractual Expiration
					vm.ContractExpiryAndRenewal = item;

					break;
				case enumWidget.PHYSEXPDET:
					vm.ProviderExpirationDetails = item;
					break;
				case enumWidget.FTEWIDGET:
					//14. FTE Discrepancy Widget   
					vm.FteDiscrepancy = item;;
					break;
				case enumWidget.INTSTS:
					//7.Interface Statistics 
					vm.InterfaceStatistics = item;
					break;
				case enumWidget.LASTPROCESSEDPAYPPAMOUNTBYPE:
					//2. Last Pay period Processed
					vm.LastPayPeriodProcessed = item;
					break;
				case enumWidget.LastPayPeriodInboundReceived:
					vm.LastPayPeriodInboundReceived = item;
					break;
				case enumWidget.LEVELSOFEXPERIENCE:
					//16.Levels of Experience
					vm.LevelsOfExperience = item;
					break;
				case enumWidget.LOAWIDGET:
					//15.LOA Record Widget   
					vm.LOARecordsHRInterface = item;
					break;
				case enumWidget.NEGPRODTWOQUARTERS:
					//9.Negative Productivity for two Consecutive Quarters 
					vm.NegativeProductivityTwoQuarters = item;
					break;
				case enumWidget.WRVUPRODLOC:
					break;
				case enumWidget.WRVUPRODSPL:
					break;
				case enumWidget.SPLBRKDOWN:
					//5. Physician Breakdown By Specialty  
					vm.ProviderBreakDownBySpecialty = item;
					break;
				case enumWidget.PTOWIDGET:
					//11.PTO Balance Widget  
					vm.YTDPTOBalance = item;
					break;
				case enumWidget.PendingApprovalsWidget:
					//21. Pending Approvals Widget  
					vm.PendingApprovals = item;
					break;
				case enumWidget.COMPMDLBRKDOWN:
					break;
				case enumWidget.PAYAPPROVALSPENDINGINCENTIVES:
					//3.Pay Approval Pending 
					vm.PayApprovalsPendingIncentives = item;
					break;
				case enumWidget.MASTERCONTRACTEXPIRATION:
					break;
				//case enumWidget.PHYSQUALITY:
				//    //$("#").addClass("order-" + widget.DisplayOrder);
				//    //$('#').show();

				//    break;
				case enumWidget.wRVUAnalysis:
					vm.wRVUAnalysisPast12Months = item;
					break;
				case enumWidget.PhysicianwRVUs:
					break;
				case enumWidget.ZEROWRVUS:
					//6. Zero wRVUs/wRVUs Variance 
					vm.wRVUsVariance = item;
					break;
				case enumWidget.YTDShiftSummary:
					//19. YTD Shift Summary
					vm.YTDShiftSummary = item;
					break;
				case enumWidget.HOSPITALISTSHIFTTARGET:
					//20. Hospitalist Shift Target Alert 
					vm.HospitalistShiftTarget = item;
					break;
				case enumWidget.BudgetActuals:
					break;
				case enumWidget.PTOLTS:
					//PTOLTS
					vm.PTOLTS = item;
					break;
				case enumWidget.OveragePaymentAlert:
					//OveragePayment
					vm.OveragePaymentAlert = item;
					break;
			}
		}

		service.displayPopup = function () {
			//create dynamic modal
			var title = 'test'
			var message = 'My Test message';

			var newDiv = $(document.createElement('div'));

			newDiv.dialog({
				title: title,
				autoOpen: true,
				modal: true,
				closeOnEscape: true,
				open: function () {
					$(this).html(message);
				},
				close: function () {

				},
				show: {
					effect: "blind",
					duration: 100
				},
				hide: {
					effect: "explode",
					duration: 500
				}
			});
		}

		service.displayEmptyMessage = function ($divid, custommessage) {
			$('div[custom-class="notification"]', $divid).html("").append($('<div>').prop({
				innerHTML: '<span>' + (custommessage != undefined ? custommessage : service.emptyWidgetErrorMessage) + '</span>'
				, className: 'nodata-msg'
			}));
		}

		service.handleServerError = function (jqXHR, $divid, custommessage) {
			//5. handle errors in ui 
			try {
				var _errorObj = null;
				try {
					_errorObj = jqXHR;
				} catch (e) {
				}

				//204:no content
				if (_errorObj.status == 204) {
					service.displayEmptyMessage($divid, custommessage);
				} else {
					var response = {
						MessageType: UtilService.MessageType.Validation,
						Message: jqXHR.responseText
					}
					service.manageUserFriendlyNotifications(response, $divid);
				}
			} catch (e) {
				var response = {
					MessageType: UtilService.MessageType.Validation,
					Message: 'Err:' + JSON.stringify(jqXHR)
				}
				service.manageUserFriendlyNotifications(response, $divid);

				try { $exceptionHandler(e); } catch (e1) { }
			}
		}

		service.manageUserFriendlyNotifications = function (response, $divid) {
			if (response.NotificationMessages != undefined) {
				response = response.NotificationMessages
			}

			//check if notification data is present
			if (response == undefined || response.MessageType == undefined || response.Message == undefined) { return; }

			var _class = "error";
			switch (response.MessageType.toUpperCase()) {
				case service.MessageType.Validation.toUpperCase():
					_class = "error";
					break;
				case service.MessageType.Success.toUpperCase():
					_class = "success";
					break;
				//case "BLUE":
				//	_class = "info";
				//	break;
				//case "MAROON":
				//	_class = "warning";
				//	break;
				default:
					_class = "error";
					break;
			}
			//remove if any class and add the current one
			$('div[custom-class="notification"]', $divid).html("").append(
				$('<div>').prop({
					innerHTML: response.Message,
					className: _class
				}));
		}

		service.clearNotificationsByDiv = function ($divid) {
			$('div[custom-class="notification"]', $divid).html("")
		}

		return service;
	});
})();