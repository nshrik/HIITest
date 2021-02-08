"use strict";
(function () {
	/*Provider helper class*/
	app.factory('provHelper', function ($q, UtilService, superCache, sharedService) {

		var service = {
			contractPESource: {
				RegionLocationId: "RegionLocationId", LocationId: 'LocationId', ContractDate: 'ContractDate', AmendContractPayElements: 'AmendContractPayElements'
				, validateContractInfo: 'validateContractInfo', SendPayElementsToContract: 'SendPayElementsToContract'
				, AmendRenewalPayElements: 'AMENDRENEWALPAYELEMENTS', PayElements: 'PayElements'
			}
			, recordstatus: {
				new: "new", modified: "modified", original: "original"
			}
		}

		service.getMisCProfileDataOnSelectedRow = function (txtid, txtValue, lookupType, profSettings) {
			var lookupIdx = null;
			var detRowIdx = null;
			var propName = '';

			var isControlFound = false;
			var prof = [];
			var totaldetrows = null;
			var det = null;
			if (profSettings != null) {
				for (var i = 0; i < profSettings.length; i++) {

					if (totaldetrows != null) { break; }

					prof = profSettings[i];
					//check the lookup type
					if (lookupType == prof.LookupType) {
						var _rows = prof.displaySettingsIndetails;

						for (var j = 0; j < _rows.length; j++) {
							var _row = _rows[j];
							if (txtid == _row.Control.StartDate.id) {
								det = _row;
								det.StartDate = txtValue;
								propName = 'StartDate';
							}
							else if (txtid == _row.Control.EndDate.id) {
								det = _row;
								det.EndDate = txtValue;
								propName = 'EndDate';
							}

							if (det != null) {
								isControlFound = true;
								_rows[j] = det;
								totaldetrows = _rows;
								lookupIdx = i;
								detRowIdx = j;
								break;
							}
						}

						if (!isControlFound) {
							lookupIdx = i;
							totaldetrows = _rows;
							break;
						}
					}
				}
			}

			var _activerecords = [];
			if (totaldetrows != null) {
				for (var i = 0; i < totaldetrows.length; i++) {
					if (totaldetrows[i].IsDeleted != true) {
						_activerecords.push(totaldetrows[i]);
					}
				}
			}


			return {
				lookupIdx: lookupIdx,
				detRowIdx: detRowIdx,
				prof: prof,
				totaldetrows: totaldetrows,
				activerecords: _activerecords,
				det: det,
				propName: propName
			}
		}

		service.checkIsDateOverlappingRange = function (validatedActiverecords, totalrows, prof, physicianContractDetails) {
			var statusInfo = service.validateMiscProfData(validatedActiverecords, prof, physicianContractDetails);
			//statusInfo.IsValid
			//statusInfo.ErrorControlIds
			//statusInfo.ErrorMessage

			//update records with the appropriate status
			var validatedActiverecords = statusInfo.validatedRecords;

			var sbError = [];
			var errorControlIds = [];
			if (statusInfo.IsValid == false) {
				// form is invalid
				sbError.push(statusInfo.ErrorMessage);
				errorControlIds.push(statusInfo.ErrorControlIds);

				//add the deleted records
				for (var i = 0; i < totalrows.length; i++) {
					if (totalrows[i].IsDeleted == true) {
						validatedActiverecords.push(totalrows[i]);
					}
				}
			}
			else {
				var isValidForm = true;
				var updatedDataSet = [];
				for (var i = 0; i < validatedActiverecords.length; i++) {
					//3.validateOverlappingRange
					statusInfo = UtilService.validateOverlappingRange(validatedActiverecords[i], validatedActiverecords);

					//push the selected model
					updatedDataSet.push(validatedActiverecords[i]);

					//validatedActiverecords[i].IsValid = statusInfo.IsValid;
					validatedActiverecords[i].ErrorMessage = statusInfo.ErrorMessage;
					validatedActiverecords[i].DetailMessage = statusInfo.DetailMessage;


					//is data valid
					if (!statusInfo.IsValid) {
						isValidForm = false;

						if (sbError.length == 0) {
							sbError.push(statusInfo.ErrorMessage);
						}
					}
				}


				//add the deleted records
				for (var i = 0; i < totalrows.length; i++) {
					if (totalrows[i].IsDeleted == true) {
						updatedDataSet.push(totalrows[i]);
					}
				}

				validatedActiverecords = updatedDataSet;
			}

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, DetailMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, validatedRecords: validatedActiverecords
			}
		}

		service.validateMiscProfData = function (activerecords, prof, physicianContractDetails) {
			var _validatedRecords = [];
			var sbError = [];
			var errorControlIds = [];

			var totalActiveRecords = activerecords.length;
			for (var i = 0; i < activerecords.length; i++) {

				var prevRow = null;
				if (i > 0) {
					prevRow = activerecords[i - 1];
				}
				//1. validate each row
				var statusInfo = service.validateMiscProfRow(activerecords[i], prevRow, i, totalActiveRecords, prof, physicianContractDetails);



				if (statusInfo.IsValid == false) {
					sbError.push(statusInfo.ErrorMessage);
					errorControlIds.push(statusInfo.ErrorControlIds);
				}

				//2.update model
				_validatedRecords.push(statusInfo.item);
			}

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, validatedRecords: _validatedRecords
			}
		}

		service.validateMiscProfRow = function (item, prevRow, currentidx, totalRecords, prof, physicianContractDetails) {
			//start validating contract start & end dates
			var sbError = [];
			var errorControlIds = [];

			var index = currentidx + 1;
			var suffix = ' for Row ' + index + '.';

			var isMarCompletedAndMandatory = (physicianContractDetails.IsMarkCompleted && prof.IsMandatory);

			//check if end date is not empty
			if (isMarCompletedAndMandatory || (item.StartDate != null && item.StartDate != "")) {
				//StartDate
				if (!UtilService.isValidDate(item.StartDate)) {
					errorControlIds.push(item.Control.StartDate.id);
					item.Control.StartDate.IsValid = false;
					item.Control.StartDate.ErrorDesc = "Please select Start Date";
					sbError.push(item.Control.StartDate.ErrorDesc);
				}
			}

			//EndDate :last record end date can be empty
			var isEndDateRequired = false;
			if ((currentidx != (totalRecords - 1))) {
				isEndDateRequired = true;
			}

			if (isEndDateRequired) {
				if (!UtilService.isValidDate(item.EndDate)) {
					errorControlIds.push(item.Control.EndDate.id);
					item.Control.EndDate.IsValid = false;
					item.Control.EndDate.ErrorDesc = "Please Enter Valid End Date";
					sbError.push(item.Control.EndDate.ErrorDesc);
				}
			}

			//check if end date is not empty
			if (item.EndDate != null && item.EndDate != "") {
				//check valid end date
				if (!UtilService.isValidDate(item.EndDate)) {
					errorControlIds.push(item.Control.EndDate.id);
					item.Control.EndDate.IsValid = false;
					item.Control.EndDate.ErrorDesc = "Please Enter Valid End Date";
					sbError.push(item.Control.EndDate.ErrorDesc);
				}
				else if (UtilService.isValidDate(item.StartDate) && UtilService.isValidDate(item.EndDate)) {
					if (moment(item.StartDate).isSameOrAfter(moment(item.EndDate))) {
						errorControlIds.push(item.Control.EndDate.id);
						item.Control.EndDate.IsValid = false;
						item.Control.EndDate.ErrorDesc = "Please select End Date greater than Start Date";
						sbError.push(item.Control.EndDate.ErrorDesc);
					}
				}
			}

			//SourcePKID
			if (isMarCompletedAndMandatory && (item.SourcePKID == null || item.SourcePKID < 0)) {
				errorControlIds.push(item.Control.ddlSourcePKID.id);
				item.Control.ddlSourcePKID.IsValid = false;
				item.Control.ddlSourcePKID.ErrorDesc = "Please select Source";
				sbError.push(item.Control.ddlSourcePKID.ErrorDesc);
			}

			if (sbError.length == 0) {
				if (prevRow != null) {
					var nextDate = moment(prevRow.EndDate).add(1, 'days');

					if (nextDate.isValid() && !moment(item.StartDate).isSame(moment(nextDate))) {
						errorControlIds.push(item.Control.StartDate.id);
						item.Control.StartDate.IsValid = false;
						item.Control.StartDate.ErrorDesc = "Start Date should Start with " + moment(nextDate).format('L');
						sbError.push(item.Control.StartDate.ErrorDesc);
					}
				}
			}


			item.IsRowValid = sbError.length > 0 ? false : true;
			item.ErrorControlIds = errorControlIds;
			item.ErrorMessage = sbError.length > 0 ? sbError.join(suffix + "<br>") + suffix : '';
			item.DetailMessage = sbError.length > 0 ? sbError.join("<br>") : '';

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorControlIds: errorControlIds
				, ErrorMessage: sbError.length > 0 ? sbError.join(suffix + "<br>") + suffix : ''
				, DetailMessage: sbError.length > 0 ? sbError.join("<br>") : ''
				, item: item
			}
		}

		service.highlightAndfocusOnErrorControl = function (det, item) {
			try {
				UtilService.blockUIWithNoProgress();

				var _isExactControlToBeFocusedFound = false;
				var ctrId = null;

				if (det != undefined && det != null && det.id != null) {
					ctrId = det.id;
					_isExactControlToBeFocusedFound = true;
				} else if (item != undefined && item != null && item.Control != null) {
					//check for any random control in the item. control list
					for (var prop in item.Control) {
						if (item.Control[prop].id != undefined && item.Control[prop].id != "") {
							ctrId = item.Control[prop].id;
							break;
						}
					}
				}

				if (ctrId != null) {
					//tr
					var $nearbytr = $("#" + ctrId).closest('tr');

					//$([document.documentElement, document.body]).animate({
					//	scrollTop: $nearbytr.offset().top
					//}, 0);

					//window.scrollTo({ top: $nearbytr.offset() }); 

					var trbgcolor = $nearbytr.css("background");

					//highlight tr
					$nearbytr.css("background", "#ddeedd");

					var ctrlclass = $("#" + ctrId).attr('class');

					//apply border color  
					$("#" + ctrId).removeClass('onError').focus();

					//revert css and unblockui
					setTimeout(function () {
						$nearbytr.css({ 'background': trbgcolor });

						if (_isExactControlToBeFocusedFound) {
							$("#" + ctrId).attr('class', ctrlclass).focus();
						} else {
							$("#" + ctrId).attr('class', ctrlclass).blur();
						}
						//unblock ui
						$.unblockUI();
					}, 700);
				} else {
					$.unblockUI();
				}
			} catch (e) {
				//unblock ui
				$.unblockUI();
			}
		}

		service.focusOnFirstErroControl = function (item) {
			try {
				UtilService.blockUIWithNoProgress();
				if (item != undefined && item != null && item.ErrorControlIds != null) {
					//var bordercolor = $("#" + item.ErrorControlIds[0]).css('border-color');

					var ctrlclass = $("#" + item.ErrorControlIds[0]).attr('class');
					//apply border color
					$("#" + item.ErrorControlIds[0]).removeClass('onError').focus();

					//revert border color
					setTimeout(function () {
						$("#" + item.ErrorControlIds[0]).attr('class', ctrlclass).focus();
						$.unblockUI();
					}, 300);
				}
			} catch (e) { $.unblockUI(); }
		}

		service.focusOnAllErroControls = function (item) {
			try {
				if (item != undefined && item != null && item.ErrorControlIds != null) {
					var bordercolor = $("#" + item.ErrorControlIds[0]).css('border-color');

					//aply border color
					$("#" + item.ErrorControlIds[0]).focus().css('border-color', 'red');

					//revert border color
					setTimeout(function () {
						$("#" + item.ErrorControlIds[0]).focus().css('border-color', bordercolor);
					}, 800);
				}
			} catch (e) { }
		}

		service.displayValidationInfo = function (title, message, item) {
			//create dynamic modal
			var newDiv = $(document.createElement('div'));

			var bordercolor = null;
			try {
				bordercolor = $("#" + item.ErrorControlIds[0]).css('border-color');
			} catch (e) {

			}

			newDiv.dialog({
				title: title,
				autoOpen: true,
				modal: true,
				closeOnEscape: true,
				open: function () {
					$(this).html(message);

					//apply border color to the control
					try {
						if (item != undefined && item != null && item.ErrorControlIds != null) {
							$("#" + item.ErrorControlIds[0]).css('border-color', 'orange');
						}
					} catch (e) { }
				},
				close: function () {
					try {
						if (item != undefined && item != null && item.ErrorControlIds != null) {
							$("#" + item.ErrorControlIds[0]).focus()
							setTimeout(function () {
								$("#" + item.ErrorControlIds[0]).focus().css('border-color', bordercolor);
							}, 300);
						}
					} catch (e) { }
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

			//focus  
			//setTimeout(function () {
			//	focus(item.errorControlIds[0]);
			//}, 100);
		}

		service.isDateGreaterThanHireDate = function (PhysicianDetails, StartDate) {
			var sbError = [];

			if (PhysicianDetails != null && PhysicianDetails != undefined) {
				if (UtilService.isValidDate(PhysicianDetails.HireDate) && UtilService.isValidDate(StartDate)) {
					if (moment(PhysicianDetails.HireDate).isAfter(moment(StartDate)))
						sbError.push("start date should be greater than or equals to hire date [" + PhysicianDetails.HireDate + "].");
				}
			}

			return {
				IsValid: sbError.length > 0 ? false : true
				, ErrorMessage: sbError.length > 0 ? sbError.join("<br>") : ''
			}
		}

		service.openPopup = function (popupid) {
			$('#' + popupid).dialog("open");
			return false;
		}

		service.closePopup = function (popupid) {
			$('#' + popupid).dialog("close");
			return false;
		}

		//below method to be used exclusively in contract
		service.hideAllNotifications = function (divid) {
			if (divid == undefined) {
				$('div[custom-class="notification"]').html("").attr('class', '');
				sharedService.broadcastClearFormErrors();
			} else {
				service.clearNotificationsById(divid);
			}
		}

		service.clearNotificationsById = function (divid) {
			if (divid != undefined) {
				$('#' + divid).html("").attr('class', '');
			}
		}

		service.redirectIfSessionTimeout = function (jqXHR) {
			try {
				var _errorObj = JSON.parse(jqXHR);
				if (_errorObj.status == 401) {
					//Authorization has been denied for this request
					window.location = '../SessionTime.aspx';
				}
			} catch (e) {
				//ignore 
			}
		}

		service.handleServerError = function (jqXHR, divid) {
			//5. handle errors in ui  
			try {
				var _errorObj = null;
				try {
					_errorObj = jqXHR;
					if (_errorObj.status == 204) {
						//response.Message = 'No results found.';
					}
				} catch (e) {

				}

				if (_errorObj.status == 204) {
					//clear all messages 
					service.hideAllNotifications();
				} else {
					var response = {
						MessageType: UtilService.MessageType.Validation,
						Message: jqXHR.responseText
					}
					UtilService.manageUserFriendlyNotifications(response, divid);
				}
			} catch (e) {
				var response = {
					MessageType: UtilService.MessageType.Validation,
					Message: 'Err:' + JSON.stringify(jqXHR)
				}
				UtilService.manageUserFriendlyNotifications(response, divid);

				try { $exceptionHandler(e); } catch (e1) { }
			}
		}

		return service;
	});
})();