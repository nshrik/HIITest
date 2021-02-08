var app = angular.module('ngApp', ['ngSanitize', 'angularjs-dropdown-multiselect', 'LocalStorageModule', 'ngMask', 'ui.grid', 'ui.grid.grouping', 'ui.grid.expandable', 'ui.grid.edit', 'ui.grid.exporter', 'ui.grid.selection', 'ui.grid.autoResize', 'ui.grid.pagination', 'gridstack-angular', 'dx']);


var baseTemplateUrl = document.location.hostname;
//var serviceBase = "https://heisenberg2.biz/HIIWebAPI/";//tb moved to webconfig 

app.factory('focus', function ($timeout, $window) {
	return function (id) {
		// timeout makes sure that it is invoked after any other event has been triggered.
		// e.g. click events that need to run before the focus or
		// inputs elements that are in a disabled state but are enabled when those events
		// are triggered.
		setTimeout(function () {
			var element = $window.document.getElementById(id);
			if (element)
				element.focus();
		}, 250);
	};
});
///*
//This directive allows us to pass a function in on an enter key to do what we want.
// */
app.directive('ngEnter', function () {
	return function (scope, element, attrs) {
		element.bind("keydown keypress", function (event) {
			if (event.which === 13) {
				scope.$apply(function () {
					scope.$eval(attrs.ngEnter);
				});

				event.preventDefault();
			}
		});
	};
});

app.directive('ngConfirmClick', [
	function () {
		return {
			link: function (scope, element, attr) {
				var msg = attr.ngConfirmClick || "Are you sure?";
				var clickAction = attr.confirmedClick;
				element.bind('click', function (event) {
					if (window.confirm(msg)) {
						scope.$eval(clickAction)
					}
				});
			}
		};
	}])


app.filter("jsDate", function () {
	return function (x) {
		if (x != null && x != undefined)
			return new Date(parseInt(x.substr(6)));
		else
			return "";
	};
});
app.filter('dateFormat', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null || input == 'till now') { return ""; }

		var _date = $filter('date')(new Date(input), 'MMM dd yyyy');

		return _date.toUpperCase();

	};
});
app.filter('dateFormat1', function ($filter) {
	return function (input) {
		try {
			if (input == undefined || input == "" || input == null || input == 'till now') { return ""; }

			var _date = $filter('date')(new Date(input), 'MM/dd/yyyy');

			return moment(_date.toUpperCase()).format("MM/DD/YYYY");
		} catch (e) {
			return "";
		}
	};
});
app.filter('dateFormat2', function ($filter) {
	return function (input) {
		try {
			if (input == undefined || input == "" || input == null || input == 'till now') { return ""; }

			var _date = $filter('date')(new Date(input), 'MM/dd/yyyy');

			return moment(_date.toUpperCase()).format("M/D/YY");
		} catch (e) {
			return "";
		}
	};
});
app.filter('dateFormat3', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null || input == 'till now') { return ""; }

		var _date = $filter('date')(new Date(input), 'MM/dd/yyyy');

		return moment(_date.toUpperCase()).format("M/D");

	};
});
app.filter('timeago', function ($filter) {
	return function (input) {
		if (input == undefined || input == null || input == 'till now') { return ""; }
		return moment(new Date(input)).fromNow();

	};
});

app.filter('utctimeago', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null || input == 'till now') { return ""; }

		var _date = $filter('date')(new Date(input),
			'MM/dd/yyyy HH:mm:ss')
		return moment.utc(_date).local().fromNow();

	};
});

app.filter('utctime', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null || input == 'till now') { return ""; }

		var _date = $filter('date')(new Date(input),
			'MM/dd/yyyy HH:mm:ss')
		return moment.utc(_date).local().format('M/D/YYYY h:mm:ss A');

	};
});

app.filter('time', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null) { return ""; }

		var _date = $filter('date')(new Date(input), 'HH:mm:ss');

		return _date.toUpperCase();

	};
});
app.filter('datetime', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null) { return ""; }

		var _date = $filter('date')(new Date(input),
			'MMM dd yyyy - HH:mm:ss');

		return _date.toUpperCase();

	};
});
app.filter('datetime1', function ($filter) {
	return function (input) {
		if (input == undefined || input == "" || input == null) { return ""; }

		var _date = $filter('date')(new Date(input),
			'MM dd yyyy - HH:mm:ss');

		return _date.toUpperCase();

	};
});
app.directive('customzdatetime', function () {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, element, attrs, ngModelCtrl) {
			element.datepicker({
				changeYear: 'true',
				changeMonth: 'true',
				yearRange: '-20:+20',
				onSelect: handleDatePicker
			}).blur(handleDatePicker);
			function handleDatePicker() {
				ngModelCtrl.$setViewValue($(this).val());
				scope.$apply();
			}
		}
	};
});
app.directive('amount', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attrs, ngModel) {
			attrs.$set('ngTrim', "false");
			//var max_chars = parseInt(element.attr('maxlength'));  
			var maxCharslength = parseInt(element.attr('max-length'));


			var displayformatter = function (str, isNum) {
				if (str != null && str != undefined && (str + '').indexOf('.') != -1) {
					var checkstr = (str + '').split('.');
					if (parseInt(checkstr[1]) > 0) {
						str = str.replace(/,/g, '');
						str = String(Number(str || 0) / (isNum ? 1 : 100));
						str = (str == '0' ? '0.0' : str).split('.');
						str[1] = str[1] || '0';
						return str[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + '.' + (str[1].length == 1 ? str[1] + '0' : str[1]);
					} else {
						return (checkstr[0] + '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
					}
				} else {
					return (str + '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
				}
			}

			var formatter = function (str, isNum) {
				if (str != null && str != undefined && (str + '').indexOf('.') != -1) {
					return (str + '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
				} else {
					return (str + '').replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
				}
			}

			var updateView = function (val) {
				scope.$applyAsync(function () {
					ngModel.$setViewValue(val || '');
					ngModel.$render();
				});
			}
			var parseNumber = function (val) {
				var maxlength = maxCharslength;
				if (val != undefined && val != null) {


					var regExpr = /[^0-9,.]/g;
					//val.replace(regExpr, "")
					if (regExpr.test((val + ''))) {
						val = (val + '').replace(regExpr, "")
						updateView(val);
					}

					if ((val + '').indexOf('.') != -1) {
						var checkstr = (val + '').split('.');
						if (checkstr.length > 2) {
							//check if two decimals
							val = checkstr[0] + "." + (checkstr[1] != '' ? checkstr[1] : '');
							updateView(val);
						}
						else if (checkstr[1].length > 2) {
							//prevent if decimal precision is > 2 
							val = ngModel.$modelValue;
						}
						else if (checkstr[0].replace(/[^0-9]/g, '').length > maxlength) {
							//prevent if decimal precision is > 2 
							val = ngModel.$modelValue;
						}
						else if (parseInt(checkstr[1]) > 0) {
							if (checkstr[1].replace(/[^0-9]/g, '').length > 2) {
								//prevent if decimal precision is > 2 
								val = ngModel.$modelValue;
							}
						}

						maxlength = maxCharslength + 3;

					} else {
						maxlength = maxCharslength;
					}

					var tempval = (val + '').replace(/[^0-9]/g, '');

					if (tempval.length > maxlength) {
						val = ngModel.$modelValue;
					}
				}

				var modelString = formatter(ngModel.$modelValue, true);
				var sign = {
					pos: /[+]/.test(val),
					neg: /[-]/.test(val)
				}
				sign.has = sign.pos || sign.neg;
				sign.both = sign.pos && sign.neg;

				if (!val || sign.has && val.length == 1 || ngModel.$modelValue && Number(val) === 0) {
					var newVal = (!val || ngModel.$modelValue && Number() === 0 ? '' : val);
					if (ngModel.$modelValue !== newVal)
						updateView(newVal);

					return '';
				}
				else {
					var valString = String(val || '');
					var newSign = (sign.both && ngModel.$modelValue >= 0 || !sign.both && sign.neg ? '-' : '');

					var tempNewValForView = valString;
					var newVal = valString.replace(/[^0-9]/g, '');
					if (valString != null && valString != undefined && (valString + '').indexOf('.') != -1) {
						var checkstr = valString.split('.');
						if (checkstr[1].length >= 1) {
							tempNewValForView = valString;
						}
					}

					if (tempNewValForView != null && tempNewValForView != undefined)
						tempNewValForView = tempNewValForView.replace(/,/g, '')

					var viewVal = newSign + formatter(angular.copy(tempNewValForView));

					if (modelString !== valString)
						updateView(viewVal);

					var modelVal = valString.replace(/,/g, '');
					if (modelVal != null && modelVal != undefined && modelVal.indexOf('.') != -1) {
						var checkstr = (modelVal + '').split('.');
						if (checkstr[1].length == 1) {
							return (Number(newSign + newVal) / 10) || 0;
						} else if (checkstr[1].length > 1) {
							return (Number(newSign + newVal) / 100) || 0;
						} else {
							return (Number(newSign + newVal)) || 0;
						}
					} else {
						return (Number(newSign + newVal)) || 0;
					}
				}
			}
			var formatNumber = function (val) {
				if (val == null) { return val; }

				if (val) {
					var str = String(val).split('.');
					str[1] = str[1] || '0';
					val = str[0] + '.' + (str[1].length == 1 ? str[1] + '0' : str[1]);
				}
				var modelString = displayformatter(val, true);
				return modelString;
			}

			ngModel.$parsers.push(parseNumber);
			ngModel.$formatters.push(formatNumber);

			//element.bind('keypress', function (event) {
			//	setTimeout(function () {
			//		var modelvalue = element.val();
			//		if (max_chars != undefined && max_chars != null && modelvalue != null) {
			//			modelvalue = modelvalue.replace(/[\,\r]/gm, "");
			//			if ((modelvalue + '').length >= max_chars) {
			//				event.preventDefault();
			//			}
			//		}
			//	}, 5);
			//});

			//element.on('paste', function (event) {
			//	setTimeout(function () {
			//		var modelvalue = element.val();
			//		if (max_chars != undefined && max_chars != null && modelvalue != null) {
			//			modelvalue = modelvalue.replace(/[\,\r]/gm, "");
			//			if ((modelvalue + '').length >= max_chars) {
			//				element.val(null);
			//				event.preventDefault();
			//			}
			//		}
			//	}, 5);
			//});
		}
	};
});
//validNumber:accepts 2 decimal places
app.directive('validNumber', function () {
	return {
		require: '?ngModel',
		link: function (scope, element, attrs, ngModelCtrl) {
			if (!ngModelCtrl) {
				return;
			}

			ngModelCtrl.$parsers.push(function (val) {
				if (angular.isUndefined(val)) {
					var val = '';
				}

				var clean = val.replace(/[^-0-9\.]/g, '');
				var negativeCheck = clean.split('-');
				var decimalCheck = clean.split('.');
				if (!angular.isUndefined(negativeCheck[1])) {
					negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
					clean = negativeCheck[0] + '-' + negativeCheck[1];
					if (negativeCheck[0].length > 0) {
						clean = negativeCheck[0];
					}

				}

				var decimalSlice = 2;
				try { if (ngModelCtrl.$$attr.decimal != undefined) decimalSlice = parseInt(ngModelCtrl.$$attr.decimal) } catch (e) { }

				if (!angular.isUndefined(decimalCheck[1])) {
					decimalCheck[1] = decimalCheck[1].slice(0, decimalSlice);
					clean = decimalCheck[0] + '.' + decimalCheck[1];
				}

				if (val !== clean) {
					ngModelCtrl.$setViewValue(clean);
					ngModelCtrl.$render();
				}
				return clean;
			});

			element.bind('keypress', function (event) {
				if (event.keyCode === 32) {
					event.preventDefault();
				}
			});
		}
	};
});
//isNumber wont accept decimals
app.directive('isNumber', function () {
	return {
		restrict: 'A',
		link: function (scope, elm, attrs, ctrl) {
			elm.on('keydown', function (event) {
				if (event.which == 64 || event.which == 16) {
					// to allow numbers  
					return false;
				} else if (event.which >= 48 && event.which <= 57) {
					// to allow numbers  
					return true;
				} else if (event.which >= 96 && event.which <= 105) {
					// to allow numpad number  
					return true;
				} else if ([8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
					// to allow backspace, tab, enter, escape, arrows  
					return true;
				} else {
					event.preventDefault();
					// to stop others  
					return false;
				}
			});
		}
	}
});
app.directive('defaultplaceholder', ['$interval', function ($interval) {
	return {
		restrict: 'A',
		link(scope, element, attrs) {
			$interval(function () {
				//console.log(JSON.stringify(attrs))
				element.attr('placeholder', 'TBD      ');
			}, 1000);
		}
	}
}])
app.config(function ($httpProvider) {
	$httpProvider.interceptors.push('authInterceptorService');
});

app.constant('ngAuthSettings', {
	apiServiceBaseUri: $("input[name$='hdnContractOrDashboardBaseAPIURL']").val(),
	clientId: 'ngHIIApp',
	baseTemplateUrl: baseTemplateUrl,
	pageTitle: ""
});

app.constant('AUTH_EVENTS', {
	loginSuccess: 'auth-login-success',
	loginFailed: 'auth-login-failed',
	logoutSuccess: 'auth-logout-success',
	sessionTimeout: 'auth-session-timeout',
	notAuthenticated: 'auth-not-authenticated',
	notAuthorized: 'auth-not-authorized'
})

app.factory('superCache', ['$cacheFactory', function ($cacheFactory) {
	return $cacheFactory('super-cache');
}]);


app.factory('modal', ['$compile', '$rootScope', function ($compile, $rootScope) {
	return function () {

		var elm;
		var modal = {
			open: function () {

				var html = '<div class="modal modal-overlay" ng-style="modalStyle"><div class="modal-dialog modal-xl"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="popupModalLabel">{{modalTitle}}</h5><button type="button" class="close" ng-click="close()"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div id="grid1" ui-grid="gridOptions" ui-grid-pagination ui-grid-exporter ui-grid-auto-resize class="grid"><div class="grid-nodata-overlay" ng-hide="gridOptions.data.length"><div class="nodata-msg"><span>Data not found</span></div></div></div></div><div class="modal-footer"><button id="buttonClose" class="btn btn-primary" ng-click="close()">Close</button></div></div></div></div>';
				elm = angular.element(html);
				angular.element(document.body).prepend(elm);

				$rootScope.close = function () {
					modal.close();
				};

				$rootScope.modalStyle = { "display": "block" };

				$compile(elm)($rootScope);
			},
			close: function () {
				if (elm) {
					elm.remove();
				}
			}
		};

		return modal;
	};
}]);

app.config(['$provide', function ($provide) {
	$provide.decorator("$exceptionHandler", ['$delegate', '$injector', function ($delegate, $injector) {
		return function (exception, cause) {
			var exceptionsToIgnore = ['Possibly unhandled rejection: backdrop click', 'Possibly unhandled rejection: canceled', 'Possibly unhandled rejection: cancel', 'Possibly unhandled rejection: escape key press']
			if (exceptionsToIgnore.indexOf(exception) >= 0) {
				return;
			}
			$delegate(exception, cause);
		};
	}]);
}]);
