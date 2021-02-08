"use strict";
(function () {
    app.factory('shareableService', function ( UtilService) {
        var service = {};
        service.data = null;

        //This service will provides the provider search
        service.providerSearch = function (model) {
			return UtilService.getSynchronousData("api/Contract/ProviderSearch", model);
        };

        return service;
    });
})();