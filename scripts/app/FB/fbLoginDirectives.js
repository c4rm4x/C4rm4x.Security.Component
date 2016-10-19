'use strict';

var fbLoginDirectives = angular.module('angular-login-fbLoginDirectives', []);

fbLoginDirectives.directive('fbLoginWelcomeUser', ['$window', 'fbLoginConfig', 'fbLoginAuth',
	function($window, Config, Auth)  {
		return {		
			restrict: 'E',
			link: function($scope) {

				$scope.onlogout = function() {
					Auth.logOut();
					$window.location = Config.getConfiguration().logoutUrl;
				};

				$scope.onlogin = function() {
					FB.login();
				};
			},		
			template: '<div ng-hide=\'auth.isLoggedIn()\'><button ng-click=\'onlogin()\' class=\'loginBtn loginBtn--facebook\'>Login with Facebook</button></div><div ng-show=\'auth.isLoggedIn()\'><div><img ng-src=\'{{auth.getPicture()}}\'><span>{{auth.getUsername()}}</span></div> (<a href=\'javascript:void(0)\' ng-click=\'onlogout()\'>Logout</a>)</div>'
		};
	}]);