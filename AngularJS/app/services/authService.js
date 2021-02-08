"use strict";
(function () {
	//app.factory('authService', function ($http, $q, localStorageService, ngAuthSettings) {
    app.factory('authService', function (localStorageService) {
		//var serviceBase = ngAuthSettings.apiServiceBaseUri;
		var service = {};

		var _authentication = {
			isAuth: false,
        };

        service.setToken = function (token) {
            var _apitoken = '';

            if (token != undefined && token != null) {
                _apitoken = token.replace('bearer ', '');
            }
            //clear local values
            service.clearAuthorizationData();
            localStorageService.set('authorizationData', {
                token: _apitoken
                , useRefreshTokens: true
            });
            _authentication.isAuth = true;

            //set token
            $.ajaxSetup({
                headers: {
                    'Authorization': "Bearer " + _apitoken
                }
            });
        };

        service.clearAuthorizationData = function () {
            localStorageService.remove('authorizationData');
            _authentication.isAuth = false;
            _authentication.useRefreshTokens = false;
        };


		////getactivetoken will go off as token get set initially on login
		//var _getActiveToken = function (model) {
		//	var defer = $q.defer();

		//	//1.prepare data
		//	var postdata = "grant_type=password&Userid=" + model.Userid + "&Password=" + model.Password + "&OrgCode=" + model.OrgCode;

		//	//2.make a service call
		//	$http.post(serviceBase + 'tokenforWeb', postdata, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function successCallback(response) {
		//		//3.fill data
		//		_fillAuthorizationData(response);

		//		//3. fill data
		//		defer.resolve(response);

		//	}, function errorCallback(err) {
		//		// called asynchronously if an error occurs
		//		// or server returns response with an error status.
		//		service.clearAuthorizationData();
		//		defer.reject(err);
		//	});
		//	return defer.promise;
		//};


		//service.checkAuthToken = function (orgcode) {
		//	var defer = $q.defer();
		//	if (orgcode == undefined) {
		//		console.log('pass org code from UtilService.Org list to fetch desired token for the specific organization');
		//		orgcode = 'T-Health';
		//	}
		//	//pending 
		//	var authData = localStorageService.get('authorizationData');

		//	if (authData != undefined && authData != null) {
		//		//token already exists
		//		console.log('Bearer ' + authData.token);
		//		defer.resolve('token found');

		//		//set token
		//		$.ajaxSetup({
		//			headers: {
		//				'Authorization': "Bearer " + authData.token
		//			}
		//		});

		//	} else {
		//		//the below code will go off as token get set initially on login
		//		console.log('trying to get a new token for ' + orgcode);
		//		//TH,T-Health
		//		var loginData = { Userid: 'compadmin', Password: 'Victory@123', OrgCode: (orgcode == undefined ? 'T-Health' : orgcode), useRefreshTokens: true }

		//		_getActiveToken(loginData).then(function (response) {
		//			if (_authentication.isAuth) {
		//				//token successfully set
		//				defer.resolve(response);
		//			} else {
		//				defer.reject('Could not generate token ' + orgcode);
		//				console.log('token not found' + orgcode);
		//			}
		//		}, function (err) {
		//			// Unblock the user interface 
		//			defer.reject(err);
		//		});
		//	}
		//	return defer.promise;
		//}

		////pending: refresh token, invoking from master page where user session is getting reset
		//service.refreshToken = function () {
		//	var defer = $q.defer();

		//	var authData = localStorageService.get('authorizationData');

		//	if (authData) {

		//		if (authData.useRefreshTokens) {
		//			//1.prepare data
		//			var postdata = "grant_type=refresh_token&refresh_token=" + authData.refreshToken;

		//			//2.make a service call
		//			$http.post(serviceBase + 'tokenforWeb', postdata, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).then(function successCallback(response) {

		//				//3.fill data
		//				_fillAuthorizationData(response);
		//				defer.resolve(response);

		//			}, function errorCallback(err) {
		//				// called asynchronously if an error occurs
		//				// or server returns response with an error status.
		//				service.clearAuthorizationData();
		//				defer.reject(err);
		//			});
		//		}
		//	}
		//	return defer.promise;
		//};

        ////3.process the response
		//var _fillAuthorizationData = function (response) {
		//	//clear local values
		//	service.clearAuthorizationData();

		//	if (response != undefined && response.data != undefined) { response = response.data };

		//	if (response.error_description != undefined && response.error_description == "Success") {
		//		localStorageService.set('authorizationData', {
		//			token: response.access_token, refreshToken: response.refresh_token
		//			, issued: response['.issued']
		//			, expires: response['.expires']
		//			, expires_in: response.expires_in
		//			, error_description: response.error_description
		//			, useRefreshTokens: true
		//		});
		//		_authentication.isAuth = true;

		//		//set token
		//		$.ajaxSetup({
		//			headers: {
		//				'Authorization': "Bearer " + response.access_token
		//			}
		//		});
		//	}
		//}
		
		return service;
	});
})();