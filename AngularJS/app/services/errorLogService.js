"use strict";
(function () {
	app.factory("stacktraceService",
		function () {
			// "printStackTrace" is a global object.
			return ({
				print: printStackTrace
			});
		}
	);

	// By default, AngularJS will catch errors and log them to
	// the Console. We want to keep that behavior; however, we
	// want to intercept it so that we can also log the errors
	// to the server for later analysis.
	app.provider("$exceptionHandler", {
		$get: function (errorLogService) {
			return (errorLogService);
		}
	}
	);

	//try { ... } catch (e) { $exceptionHandler(e); }
	// The error log service is our wrapper around the core error
	// handling ability of AngularJS. Notice that we pass off to
	// the native "$log" method and then handle our additional
	// server-side logging.
	app.factory("errorLogService", function ($log, $window, stacktraceService, $injector, ngAuthSettings) {
		// I log the given error to the remote server.
		function log(exception, cause) {
			// Pass off the error to the default error handler
			// on the AngualrJS logger. This will output the
			// error to the console (and let the application
			// keep running normally for the user).
			$log.error.apply($log, arguments);

			// Now, we need to try and log the error the server.
			// --
			// NOTE: In production, I have some debouncing
			// logic here to prevent the same client from
			// logging the same error over and over again! All
			// that would do is add noise to the log.
			try {
				var errorMessage = exception.toString();
				var stackTrace = stacktraceService.print({ e: exception });

				var localStorageService = $injector.get('localStorageService');
				var authData = localStorageService.get('authorizationData');
				if (authData) {
					var authorization = 'Bearer ' + authData.token;

					var hdnIsAppInDebugMode = $("input[name$='hdnIsAppInDebugMode']").val();

					if (hdnIsAppInDebugMode != undefined && (hdnIsAppInDebugMode == "False" || hdnIsAppInDebugMode == "false")) {
						// Log the JavaScript error to the server.
						// --
						// NOTE: In this demo, the POST URL doesn't
						// exists and will simply return a 404.
						$.ajax({
							type: "POST",
							url: ngAuthSettings.apiServiceBaseUri + 'api/Contract/ExceptionLog',
							contentType: "application/json",
							data: angular.toJson({
								source: 'PC.Web:',
								IsAppInDebugMode: (hdnIsAppInDebugMode != undefined && (hdnIsAppInDebugMode == "False" || hdnIsAppInDebugMode == "false")) == true ? true : false,
								message: errorMessage,
								StackTrace: (stackTrace != undefined && stackTrace != null ? stackTrace.join("\n") : ""),
								targetSite: $window.location.href,
								cause: (cause || "")
							}),
							headers: {
								'Authorization': authorization
							}
						});
					} else {
						console.log('Ignored logging this exception as this page is not running in release mode');
						console.log(angular.toJson({
							source: 'PC.Web:',
							message: errorMessage,
							StackTrace: (stackTrace != undefined && stackTrace != null ? stackTrace.join("\n") : ""),
							targetSite: $window.location.href,
							cause: (cause || "")
						}));
					}
				}

			} catch (loggingError) {

				// For Developers - log the log-failure.
				$log.warn("Error logging failed");
				$log.log(loggingError);

			}
		}
		// Return the logging function.
		return (log);
	});
})();