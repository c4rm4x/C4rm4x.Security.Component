'use strict';

var loginControllers = angular.module('loginControllers', ['loginServices']);

loginControllers.controller('SignoutCtrl', ['$scope', 'Auth', '$location', 'Config',
	function($scope, Auth, $location, Config) {

		$scope.logout = function() {
			Auth.loggedOut();
			$location.path(Config.getConfiguration().pathToLogin);
		};
}]);

loginControllers.controller('SigninCtrl', ['$scope', 'Auth', 'Token', 'RedirectToAttemptUrl',
	function($scope, Auth, Token, RedirectToAttemptUrl) {
	
		$scope.error = '';

		$scope.credentials = {
			username: '',
			pass: ''
		};

		$scope.login = function() {
			var setError = function(error) {
				$scope.error = error;
			};

			Token
				.retrieveToken($scope.credentials.username, $scope.credentials.pass)
				.then(function(token) {
					Auth.loggedIn(token);
				})
				.then(function() {
					setError('');				
				})
				.then(function() {
					RedirectToAttemptUrl.redirect();
				})
				.catch(function() {
					setError('Username/password combination provided is incorrect');
				});
	};
}]);