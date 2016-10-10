'use strict';

var fbLoginDirectives = angular.module('angular-login-fbLoginDirectives', []);

fbLoginDirectives.directive('fbLoginWelcomeUser', [function() {
	return {		
		restrict: 'E',
		template: '<div ng-show=\'auth.isLoggedIn()\'><div><img ng-src=\'{{auth.getPicture()}}\'><span>{{auth.getUsername()}}</span></div> (<a href=\'javascript:void(0)\' ng-click=\'auth.logOut()\'>Logout</a>)</div>'
	};
}]);