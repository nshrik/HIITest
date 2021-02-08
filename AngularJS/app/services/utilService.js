"use strict";
(function () {
	app.factory('UtilService', function ($http, $q, ngAuthSettings, superCache, localStorageService) {  
		var service = {
			isAPIURLValid: null,
			baseUrl: ngAuthSettings.apiServiceBaseUri,
			enmCache: {
				CompModelsByRegion: 'CompModelsByRegion'
				, specialities: 'Specialties'
				, payElements: 'PayElements'
				, payElementType: 'PayElementType'
				, compensationModel: 'CompensationModel'
				, costcenter: 'CostCenter'
				, FTEData: 'FTEData'
				, displaySettings: 'displaySettings'
				, contractChanges: 'contractChanges'
				//region,LocationsByRegionId,CostcentersByLocationId are used in prov contract screen
				, Regions: 'Regions'
				, LocationsByRegionId: 'LocationsByRegionId'
				, CostcentersByLocationId: 'CostcentersByLocationId'
			},
			datatype: {
				string: "string"
				, number: "number"
				, boolean: "boolean"
			},
			message: { error: 'Excuse our mess! We are experiencing technical difficulties with our page right now. We are working hard to fix it.' },
			MessageType: { Validation: 'Validation', Success: 'Success', PopUp: 'PopUp' },
			HTTPMethod: { Get: 'GET', Put: 'PUT', Post: 'POST', Delete: 'DELETE' },
			Org: [{ id: 'T-Health', label: 'Texas Health' }, { id: 'TH', label: 'Team Health' }]
		}

		service.checkIfAPIURLIsEmpty = function (methodName, model) {
			if (service.isAPIURLValid == null && (ngAuthSettings.apiServiceBaseUri == undefined || ngAuthSettings.apiServiceBaseUri == "" || ngAuthSettings.apiServiceBaseUri == "NoBaseUrlFound")) {
				alert('Missing ContractOrDashboardBaseAPIURL key in web.config')
				service.isAPIURLValid = false;
			} else {
				service.isAPIURLValid = true; 
			}
		}

		service.getAsyncData = function (methodName, model) {
			var defer = $q.defer();
			$http({
				//cache: expCache, //the cache prop can be true to use the default, or you can pass one 
				url: ngAuthSettings.apiServiceBaseUri + methodName,
				method: 'GET',
				async: true,
				params: model,
			}).then(function successCallback(response) {
				defer.resolve(response);
			}, function errorCallback(err) {
				// called asynchronously if an error occurs
				// or server returns response with an error status. 
				defer.reject(err);
			});
			return defer.promise;
		}

		service.getSynchronousData = function (methodName, model) {
			return service.makeServerCallByType(ngAuthSettings.apiServiceBaseUri, methodName, model, service.HTTPMethod.Get);
		}

		service.putData = function (methodName, model) {
			return service.makeServerCallByType(ngAuthSettings.apiServiceBaseUri, methodName, JSON.stringify(model), service.HTTPMethod.Put);
		}

		service.postData = function (methodName, model) {
			return service.makeServerCallByType(ngAuthSettings.apiServiceBaseUri, methodName, JSON.stringify(model), service.HTTPMethod.Post);
		}

		//custom url
		service.postDataByUrlAndMethodName = function (url, methodName, model) {
			return service.makeServerCallByType(url, methodName, JSON.stringify(model), service.HTTPMethod.Post);
		}

		service.deleteData = function (methodName, model) {
			return service.makeServerCallByType(ngAuthSettings.apiServiceBaseUri, methodName, JSON.stringify(model), service.HTTPMethod.Delete);
		}

		service.makeServerCallByType = function (baseUrl, methodName, model, httpMethod) {
			//check if api url has any value in web.config or not
			service.checkIfAPIURLIsEmpty();

			// perform some asynchronous operation, resolve or reject the promise when appropriate.
			var defer = $q.defer(); 
			$.ajax({
				type: httpMethod,
				url: baseUrl + methodName,
				data: model,
				beforeSend: function () {
					//service.hideAllNotifications();
				},
				cache: false,
				timeout: 10 * 60 * 1000, //10*60*1000=10mins:  1h= 1 * 60 * 60 * 1000 is the worst expected case
				async: true,
				contentType: "application/json",
				Accept: "application/json",
				dataType: "json",
				success: function (result, textStatus, jqXHR) {
					if (jqXHR.status !== 200) {
						defer.reject(jqXHR);
					} else {
						//console.log(result);
						defer.resolve(result);
					}
				},
				failure: function (err) {
					// called asynchronously if an error occurs
					// or server returns response with an error status. 
					console.log('Err:', JSON.stringify(err));
					defer.reject(err);
				},
				error: function (err) {
					// called asynchronously if an error occurs
					// or server returns response with an error status. 
					console.log('Err:', JSON.stringify(err));
					defer.reject(err);
				}
			});
			return defer.promise;
		}

		//extension methods
		String.prototype.convert = function (datatype, defaultValue, precision) {
			//UtilService.datatype.number,boolean,string
			return service.convertDataByDatatype(this, datatype, defaultValue, precision);
		}

		Boolean.prototype.convert = function (datatype, defaultValue, precision) {
			return service.convertDataByDatatype(this, datatype, defaultValue, precision);
		}

		Number.prototype.convert = function (datatype, defaultValue, precision) {
			return service.convertDataByDatatype(this, datatype, defaultValue, precision);
		}

		service.convertDataByDatatype = function (value, datatype, defaultvalue, precision) {
			try {
				if (datatype == service.datatype.string) {
					return convertToString(value, defaultvalue);
				}
				else if (datatype == service.datatype.boolean) {
					return convertToBool(value, defaultvalue);;
				}
				else if (datatype == service.datatype.number) {
					return convertToNumber(value, precision, defaultvalue);
				}
			} catch (e) {
				console.log('Exception:conversion error:datatype:' + datatype + ';value:', value);
				return value;
			}


			function convertToString(value, defaultValue) {
				if (value != undefined && value != null) {
					return (value + '').trim();
				} else if (defaultValue != undefined) {
					//return default value 
					return defaultValue;
				} else {
					return value;
				}
			}

			function convertToBool(value, defaultValue) {
				if (value == true || value == "true" || value == "TRUE" || value == "1") {
					return true;
				}
				else if (value == false || value == "false" || value == "FALSE" || value == "0") {
					return false;
				}
				else if (defaultValue != undefined) {
					//return default value
					return defaultValue;
				} else {
					//return whatever the value is
					return value;
				}
			}

			function convertToNumber(value, precision, defaultValue) {
				try { value = parseFloat(value); } catch (e) { }

				if (!isNaN(value) && value != undefined && value != null && value != "") {
					if (precision == undefined) { precision = 0; }
					return value.toFixed(precision);
				} else if (defaultValue != undefined) {
					//return default value 
					return defaultValue;
				} else {
					return value;
				}
			}
		}

		service.postDataByUrlAndMethodNameAsJsonString = function (url, methodName, model) {

			var defer = $q.defer();
			$.ajax({
				contentType: "application/json; charset=utf-8",
				url: url + methodName,
				data: "{'dataQuery':'" + JSON.stringify(model) + "'}",
				dataType: "json",
				type: "POST",
				success: function (response) {
					defer.resolve(response);
					console.log(response)
				},
				error: function (err) {
					console.log(err)
					// called asynchronously if an error occurs
					// or server returns response with an error status. 
					defer.reject(err);
				}
			});
			return defer.promise;
		}



		service.manageUserFriendlyNotifications = function (response, divid) {
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
			$("#" + divid).html("").append(
				$('<div>').prop({
					innerHTML: response.Message,
					className: _class
				}));
		}

		service.getCurrentUserInfo = function () {
			//ensure user role info added in code behind of your current page
			//replace single with double quote and then parse user, role info data
			return JSON.parse('{ ' + $("input[name$='hdnCurrentUserInfo']").val().replace(/'/g, '"') + ' }');
		}

		//below method to be used exclusively in contract
		service.hideAllNotifications = function (divid) {
			if (divid == undefined) {
				$('div[custom-class="notification"]').html("").attr('class', '');
			} else {
				service.clearNotificationsById(divid);
			}
		}

		service.clearNotificationsById = function (divid) {
			if (divid != undefined) {
				$('#' + divid).html("").attr('class', '');
			}
		}

		service.blockUIWithText = function (msg) {
			jQuery.blockUI({
				message: "<div style='float:left;margin-top:4px;'><img  src='../Content/themes/base/images/busy.gif' /></div><div style='float:left;top:10px;'>"
					+ "<span style='margin-left:4px;padding-right:6px;color: #003E7E;font-size: 18px;font-family: CentGoth, Century Gothic, Arial, Helvetica, Sans-Serif;'> " +
					msg + " </span></div>"
				/* , overlayCSS: { backgroundColor: '#FFF', opacity: 1.8, cursor: 'progress' }*/
				, css: {
					padding: 42, margin: 0, width: '20%', top: '40%', left: '36%', textAlign: 'center', color: '#000',
					border: '10px solid #003E7E',
					'border-bottom-left-radius': '16px',
					'border-top-right-radius': '16px',
					'-moz-border-radius-bottomleft': '16px',
					'-moz-border-radius-topright': '16px',
					'-webkit-border-bottom-left-radius': '50px',
					'-webkit-border-top-right-radius': '50px',
					margin: "0 0 20px 0;"
					, backgroundColor: '#FFF'
					, cursor: 'progress'
				}
			});
		};
		service.blockUI = function () {

			jQuery.blockUI({
				message: "", overlayCSS: { backgroundColor: '#FFF', opacity: 0, cursor: 'progress' }
			});
		}

		service.blockUIWithNoProgress = function () {

			jQuery.blockUI({
				message: "", overlayCSS: { backgroundColor: '#FFF', opacity: 0, cursor: 'pointer' }
			});
		}

		service.getDataFromLocalStorage = function (prop) {
			var _value = null;
			if (typeof (Storage) !== "undefined" && localStorage.hasOwnProperty(prop)) {
				// Code for localStorage/sessionStorage.
				_value = localStorage.getItem(prop);
			} else {
				// Sorry! No Web Storage support.. 
			}
			return _value;
		}

		service.isEqual = function (str1, str2) {
			try {
				if (str1 == null && str2 == null) { return true; }
				if (str1 == undefined && str2 == undefined) { return true; }

				return str1.toUpperCase() === str2.toUpperCase();
			} catch (e) {
				return false;
			}

		}

		service.getDefaultValueIfItsNull = function (value, defaultValue) {
			if (value == undefined || value == null || value == "") {
				return defaultValue;
			} else {
				return value;
			}
		}

		service.isEmpty = function (value) {
			if (value == undefined || value == null || value == "") {
				return true;
			} else {
				return false;
			}
		}

		service.getSelectedDropdownModelByValue = function (_list, value) {
			var selModel = [];
			if (_list != null && _list.length > 0 && value != null && value != undefined) {
				for (var i = 0; i < _list.length; i++) {
					if (parseInt(_list[i].id) == parseInt(value)) {
						selModel.push(_list[i]);
						break;
					}
				}
			}
			return selModel;
		}

		//getSelectedModelForMultiDropdownList 
		service.getSelectedModelForMultiDropdownList = function (_list) {
			if (_list == null) { _list = [] }

			var _selCompModelValue = [];
			for (var i = 0; i < _list.length; i++) {
				//remove pending delete delete delete remove remove
				if (_list[i].IsSelected) {
					//disable the selected option cannot be unselected and add display order
					//_list[i].disabled = true;
					_list[i].order = i;
					_selCompModelValue.push(_list[i]);
				} else {
					_list[i].order = i;
				}
			}

			return {
				list: _list, selectedValueModel: _selCompModelValue
			};
		}

		service.getSelectedDropdownListValue = function (_list, _defaultValue) {
			var _selval = (_defaultValue != undefined ? _defaultValue : null);
			if (_list != null) {
				for (var i = 0; i < _list.length; i++) {
					if (_list[i].IsSelected == true) {
						_selval = _list[i].id;
						break;
					}
				}
			}
			return _selval;
		}

		service.setDropdownListValue = function (list, value) {
			if (list != null) {
				for (var i = 0; i < list.length; i++) {
					if (list[i].id == value) {
						list[i].IsSelected = true;
					} else {
						list[i].IsSelected = false;
					}
				}
			}
			return list;
		}

		service.getSelectedDropdownListValuesByProp = function (_list, prop, _defaultValue) {
			var _selval = (_defaultValue != undefined ? _defaultValue : []);
			if (_list != null) {
				for (var i = 0; i < _list.length; i++) {
					if (_list[i].IsSelected == true) {
						_selval = _list[i][prop];
					}
				}
			}
			return _selval;
		}

		service.getCustomSelectedDropdownListValuesByProp = function (_list, prop) {
			if (_list != null) {
				return _list.filter(function (e) {
					return e[prop];
				});
			}
			return [];
		}

		service.getListValuesByPropVal = function (_list, prop, val) {
			if (_list != null) {
				return _list.filter(function (e) {

					return e[prop] == val;
				});
			}
			return [];
		}

		//getText(in uppercase) ById from a list
		service.getDropdownTextInUpperCaseById = function (list, id, defvalue) {
			return service.getDropdownTextById(list, id, defvalue).toUpperCase();
		}

		service.checkIfValuePresentinList = function (list, id) {
			var isfound = false;
			try {
				var _text = "";

				if (list != null && list.length > 0) {
					_text = $(list).map(function (i, v) {
						if (v.id == id) {
							return v.label;
						}
					}).get();

					if (_text.length > 0) {
						isfound = true;
						_text = _text[0];
					}
				}
				return isfound;
			} catch (e) {
				return isfound;
			}
		}
		//getTextById from a list 
		service.getDropdownTextById = function (list, id, defvalue) {
			try {
				var _text = "";
				var isfound = false;
				if (list != null && list.length > 0) {
					_text = $(list).map(function (i, v) {
						if (v.id == id) {
							return v.label;
						}

					}).get();

					if (_text.length > 0) {
						_text = _text[0];
						isfound = true;
					}
					else {
						if (defvalue != undefined) {
							//get default value
							return defvalue;
						}
					}
				}
				if (isfound) {
					return _text;
				} else {
					if (defvalue != undefined) {
						//get default value
						return defvalue;
					}
					return "";
				}
			} catch (e) {
				return "";
			}
		}

		service.getGuid = function () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}

		service.getSortedListValuesBySingleProp = function (_list, prop) {
			if (_list != null) {
				return _list.sort((a, b) => (a[prop] > b[prop]) ? 1 : -1)
			}
		}

		service.getSortedListValuesByDoubleProp = function (_list, prop1, prop2) {
			if (_list != null) {
				return _list.sort((a, b) => (a[prop1] > b[prop1]) ? 1 : (a[prop1] === b[prop1]) ? ((a.prop2 > b.prop2) ? 1 : -1) : -1)
			}
		}

		service.getIdFromJSON = function (_list, prop) {
			var _val = '';
			if (_list != null && _list.length > 0) {

				for (var i = 0; i < _list.length; i++) {
					_val += _list[i][prop] + ',';
				}
				return service.removeLastChar(_val, ',');
			}
			return _val;
		}

		// Defining function to get unique values from an array 
		service.getUnique = function (array) {
			var uniqueArray = [];

			// Loop through array values
			for (var i = 0; i < array.length; i++) {
				if (uniqueArray.indexOf(array[i]) === -1) {
					uniqueArray.push(array[i]);
				}
			}
			return uniqueArray;
		}

		service.removeLastChar = function (value, char) {
			var lastChar = value.slice(-1);
			if (lastChar == char) {
				value = value.slice(0, -1);
			}
			return value;
		}

		service.addUniqueRowIdTotheList = function (_arr) {
			if (_arr != null) {
				var idx = 1;
				for (var i = 0; i < _arr.length; i++) {
					_arr[i].UniqueRowID = idx;
					idx++;
				}
			}
			return _arr;
		}

		// Accepts the array and key 
		service.groupBy = function (array, key) {
			// Return the end result
			return array.reduce((result, currentValue) => {
				// If an array already present for key, push it to the array. Else create an array and push the object
				(result[currentValue[key]] = result[currentValue[key]] || []).push(
					currentValue
				);
				// Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
				return result;
			}, {}); // empty object is the initial value for result object

		}

		service.resetOverlappingRangeFlag = function (arr) {
			if (arr != null && arr != undefined) {
				for (var i = 0; i < arr.length; i++) {
					arr[i].IsRowValid = true;
					arr[i].IsOverlappingRange = false;
					arr[i].IsOverlappingRangeValue = false;
				}
			}
			return arr;
		}

		service.latestRecordAFromSortedArray = function (sortedArray) {
			var selItem = null;
			for (var i = sortedArray.length - 1; i >= 0; i--) {
				selItem = sortedArray[i];
				break;
			}
			return selItem;
		}

		service.validateOverlappingRange = function (model, arrayList, subcategoryPropName) {

			//start validating contract start & end dates
			var sbError = [];
			var errorControlIds = [];

			var _bypassSubCat = false;
			if (model[subcategoryPropName] == undefined) {
				_bypassSubCat = true;
			}

			//1.take all the records except the one selected
			var _arr = [];
			for (var i = 0; i < arrayList.length; i++) {
				if (arrayList[i].UniqueRowID != model.UniqueRowID) {
					_arr.push(arrayList[i]);
				}
			}

			//2.Sort the data by Start Date
			var sortedArray = [];
			if (_arr.length > 0) {
				sortedArray = _arr.sort((a, b) => moment(b.StartDate) - moment(a.StartDate));
			} else {
				sortedArray = _arr;
			}

			//3.validate the data and update the dataset 
			var IsOverlappingRange = false;


			for (var i = 0; i < sortedArray.length; i++) {

				if (_bypassSubCat || model[subcategoryPropName] == sortedArray[i][subcategoryPropName]) {
					//check if dates are overlaped
					var statusInfo = service.isDateOverlapping(model.StartDate, model.EndDate, sortedArray[i].StartDate, sortedArray[i].EndDate, subcategoryPropName);

					if (statusInfo.IsInvalid) {
						IsOverlappingRange = true;
						sbError.push(statusInfo.ErrorMessage.toString());
						sortedArray[i].IsOverlappingRange = statusInfo.IsInvalid;
						sortedArray[i].DetailMessage = statusInfo.ErrorMessage;
						break;
					}
				}
			}


			if (sbError.length == 0) {
				sortedArray.push(model);

				sortedArray = sortedArray.sort((a, b) => moment(a.StartDate) - moment(b.StartDate));


				//update the date range if it's end date is empty and no overlapping range errors  
				if (!IsOverlappingRange) {
					for (var i = 0; i < sortedArray.length; i++) {
						if (_bypassSubCat || model[subcategoryPropName] == sortedArray[i][subcategoryPropName]) {
							if (service.getDefaultValueIfItsNull(sortedArray[i].EndDate, '') == '') {
								if ((sortedArray.length - 1) > i) {
									var ProposedEndDate = '';
									if (moment(sortedArray[i + 1].StartDate).isAfter(moment(sortedArray[i].StartDate))) {
										ProposedEndDate = moment(sortedArray[i + 1].StartDate).subtract(1, 'days').format('L');
									} else {
										ProposedEndDate = moment(sortedArray[i - 1].StartDate).add(1, 'days').format('L');
									}

									//assign end date dynamically
									sortedArray[i].EndDate = ProposedEndDate;
								}
							}
						}
					}
				}
			}


			//vm.hdnConsiderFTESum
			//var ConsiderFTESum = vm.hdnConsiderFTESum.toLowerCase() === 'Yes'.toLowerCase() ? 1 : 0;
			//If hdnConsiderFTESum is Yes, we have to check the sum = 1
			//If hdnConsiderFTESum is No, we have to check the sum can cross 1

			////Pending
			//if (ConsiderFTESum == 0) {
			//    // sum is not considered

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, DetailMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, UpdatedDataset: sortedArray
			}
		}

		service.isDateOverlapping = function (inputStrt, inputEnd, start, end, subcategoryPropName) {
			var sbError = [];

			inputStrt = service.getDefaultValueIfItsNull(inputStrt, '');
			inputEnd = service.getDefaultValueIfItsNull(inputEnd, '');
			start = service.getDefaultValueIfItsNull(start, '');
			end = service.getDefaultValueIfItsNull(end, '');



			//get the end date if it's empty
			if (end == "") {
				if (moment(inputStrt).isAfter(moment(start))) {
					end = moment(inputStrt).subtract(1, 'days').format('L');
				} else if (moment(start).isAfter(moment(inputStrt))) {
					end = moment(inputStrt).add(1, 'days').format('L');
				}

				//if end date is after start date
				if (moment(start).isAfter(moment(end))) {
					end = '12/31/2099';
				}
				else if (moment(start).isSame(moment(end))) {
					end = moment(end).add(0, 'days').format('L');
				}
			}

			var startrange = moment(inputStrt).isBetween(moment(start), moment(end));
			var endrange = moment(inputEnd).isBetween(moment(start), moment(end));




			//check if selected date is already exists
			if ((startrange || moment(inputStrt).isSame(moment(start))
				|| moment(inputStrt).isSame(moment(end)))
				|| (endrange || moment(inputEnd).isSame(moment(start))
					|| moment(inputEnd).isSame(moment(end)))) {
				sbError.push("Overlapping ranges.");
			}

			if (moment(inputStrt).isBefore(moment(start))) {
				if (moment(inputEnd).isAfter(moment(end))) {
					sbError.push("Overlapping ranges.");
				}
			}

			//for fte categories; end date should be greater than start date  
			if (moment(inputStrt).isSame(moment(start))
				|| moment(inputStrt).isSame(moment(start).add(1, 'days'))) {
				sbError.push("Please Select Start Date greater than." + moment(start).add(1, 'days').format('L'));
			}

			return {
				IsInvalid: sbError.length > 0 ? true : false
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
			}
		}

		service.isValidDate = function (txtDate) {
			try {
				var currVal = txtDate;
				if (currVal == '')
					return false;

				var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/; //Declare Regex
				var dtArray = currVal.match(rxDatePattern); // is format OK?

				if (dtArray == null)
					return false;

				//Checks for mm/dd/yyyy format.
				var dtMonth = dtArray[1];
				var dtDay = dtArray[3];
				var dtYear = dtArray[5];

				if (dtMonth < 1 || dtMonth > 12)
					return false;
				else if (dtDay < 1 || dtDay > 31)
					return false;
				else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
					return false;
				else if (dtMonth == 2) {
					var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
					if (dtDay > 29 || (dtDay == 29 && !isleap))
						return false;
				}
				return true;
			} catch (e) {
				return false;
			}
		}

		service.getUserRolesList = function () {
			var _role = [{ Text: "Contract Approver" }
				, { Text: "CompensationAdministrator" }
				, { Text: "Comp Approver" }
				, { Text: "Organization Admin" }
			];
			return _role;
		}


		return service;
	});
})();
