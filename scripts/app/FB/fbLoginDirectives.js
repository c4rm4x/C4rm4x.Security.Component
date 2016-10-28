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
			template: '<div ng-hide=\'auth.isLoggedIn()\'><button ng-click=\'onlogin()\' class=\'loginBtn loginBtn--facebook\'>Login with Facebook</button></div><div ng-show=\'auth.isLoggedIn()\'><img width=\'25px\' height=\'25px\' ng-src=\'{{auth.getPicture()}}\'><span style=\'margin: 5px; font-size: 12px; font-weight: bold; color: white;\'>{{auth.getUsername()}}</span><div class=\'btn-group\'><button type=\'button\' class=\'btn btn-xs btn-primary dropdown-toggle dropdown-toggle-split\' data-toggle=\'dropdown\' aria-haspopup=\'true\' aria-expanded=\'false\'><span class=\'caret\'></span></button><ul class=\'dropdown-menu\'><li><a class=\'dropdown-item\' href=\'#\' ng-click=\'onlogout()\'>Log out</a></li></ul></div></div></div>'
		};
	}]);