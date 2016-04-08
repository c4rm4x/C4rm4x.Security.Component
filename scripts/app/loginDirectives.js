'use strict';

var loginDirectives = angular.module('angular-login-loginDirectives', []);

loginDirectives.directive('loginwelcomeUser', [function() {
	return {		
		restrict: 'E',
		template: '<div ng-show=\'auth.isLoggedIn()\'><p ng-controller=\'loginSignoutCtrl\'>Hello {{auth.getUsername()}} (<a href=\'javascript:void(0)\' ng-click=\'logout()\'>Logout</a>)</p></div>'
	};
}]);