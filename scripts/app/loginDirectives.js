'use strict';

var loginDirectives = angular.module('loginDirectives', []);

loginDirectives.directive('welcomeUser', [function() {
	return {		
		restrict: 'E',
		templateUrl: 'partials/welcomeUser.html'
	};
}]);