(function () {
	'use strict';

	angular
		.module('httpRequest')
		.service('httpservice', httpservice);

	httpservice.$inject = ['$http', '$q'];

	function httpservice($http, $q) {
		return {
			getJson: getJson
		}

		function getJson(url, token) {
			var headers;
			if (token) {
				headers = { 'Content-Type': 'application/json', 'x-access-token': token };
			} else {
				headers = { 'Content-Type': 'application/json' };
			}
			var deferred = $q.defer();

			var options = {
				method: 'GET',
				url: url,
				cache: false
			};

			if (headers) {
				options.headers = headers;
			}

			$http(options)
				.success(function (data, status, headers, config) {
					deferred.resolve(data);
				})
				.error(function (data, status, headers, config) {
					deferred.reject(data);
				});
			return deferred.promise;
		};
	};
} ());