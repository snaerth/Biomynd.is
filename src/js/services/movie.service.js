(function () {
	'use strict';

	angular
		.module('movieService')
		.service('movieservice', movieservice);

	movieservice.$inject = ['$http', '$q'];

	function movieservice($http, $q) {
		return {
			setMovie: setMovie,
			getMovie: getMovie
		};

		var movie;
		function setMovie(movie) {
			self.movie = movie;
		};

		function getMovie() {
			return self.movie;
		};
	};
} ());