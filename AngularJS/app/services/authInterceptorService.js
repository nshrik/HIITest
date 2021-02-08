'use strict';
(function () {
    app.factory('authInterceptorService', ['localStorageService', '$q', function (localStorageService, $q) {

        var authInterceptorServiceFactory = {};

        var _request = function (config) {

            config.headers = config.headers || {};
			 
            var authData = localStorageService.get('authorizationData');
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
            } else {
                //TODO
                //$rootScope.$broadcast('handleSessionlogout');
                //$rootScope.$broadcast({
                //    401: AUTH_EVENTS.notAuthenticated,
                //    403: AUTH_EVENTS.notAuthorized,
                //    419: AUTH_EVENTS.sessionTimeout,
                //    440: AUTH_EVENTS.sessionTimeout
                //});
            }
            return config;
        }


        var _responseError = function (rejection) {
            //if (rejection.status === 400) {
            //    if (rejection.data != undefined && rejection.data.message != undefined && rejection.data.message.length > 0) {
            //        setTimeout(function () {
            //            postDataObj.blockUI(false);
            //            alert(rejection.data.message);
            //        }, 1000);
            //    } else {
            //        return $q.reject(rejection);
            //    }
            //}
            //else if (rejection.status === 401) {
            //    try {
            //        var forcelogout = (rejection.statusText == "Unauthorized" || rejection.data.message == "Authorization has been denied for this request."); 
            //        var authData = localStorageService.get('authorizationData');
            //        setTimeout(function () {
            //            if (!forcelogout && authData) {
            //                $("#btnChecksession").click();
            //            }
            //            else {
            //                $("#btnlogOut").click();
            //            }
            //        }, 1000);
            //        postDataObj.blockUI(false);
            //    } catch (e) { postDataObj.blockUI(false);}
            //}

			if (rejection.status === 401) { 
				//Authorization has been denied for this request
				window.location = '../SessionTime.aspx'; 
			}

            if (rejection.status === 500) {

                //var _timeDelay = 5000;
                //if (timeDelay != undefined) {
                //    _timeDelay = timeDelay;
                //}
                //var toastSettings = $mdToast.simple()
                //                    .content(rejection.message)
                //                    .position("center")
                //                     .hideDelay(_timeDelay);
                //// show previously created toast
                //$mdToast.show(toastSettings);

                //setTimeout(function () {
                //    postDataObj.blockUI(false);
                //}, _timeDelay);

                //_displayErrorMessage(rejection);
                //utilService.displayErrorMessage(rejection);
                //return;
                //var authService = $injector.get('authService');
                //var authData = localStorageService.get('authorizationData');

                //if (authData) {
                //    if (authData.useRefreshTokens) {
                //        $state.go('refresh');
                //        return $q.reject(rejection);
                //    }
                //}
                //authService.logOut();
                //$state.go('login');
                // $rootScope.$broadcast('handleSessionlogout');
            }
            //return $q.reject(rejection);
        }

        authInterceptorServiceFactory.request = _request;
        authInterceptorServiceFactory.responseError = _responseError;

        return authInterceptorServiceFactory;
    }]);
})();