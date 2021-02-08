"use strict";
(function () {
    app.factory('shareableService', function ( UtilService) {
        var service = {};
        service.data = null;

        //This service will provides the provider search
        service.providerSearch = function (model) {
            return UtilService.getAsyncData("api/Filter/ProviderSearch", model);
        };

        return service;
    });
})();