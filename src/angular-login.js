'use strict';

var loginControllers = angular.module('angular-login-loginControllers', ['angular-login-loginServices']);

loginControllers.controller('loginSignoutCtrl', ['$scope', 'loginAuth', '$location', 'loginConfig',
	function($scope, Auth, $location, Config) {

		$scope.logout = function() {
			Auth.loggedOut();
			$location.path(Config.getConfiguration().pathToLogin);
		};
}]);

loginControllers.controller('loginSigninCtrl', ['$scope', 'loginAuth', 'loginToken', 'loginRedirectToAttemptUrl',
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
'use strict';

var loginDirectives = angular.module('angular-login-loginDirectives', []);

loginDirectives.directive('loginwelcomeUser', [function() {
	return {		
		restrict: 'E',
		template: '<div ng-show=\'auth.isLoggedIn()\'><p ng-controller=\'loginSignoutCtrl\'>Hello {{auth.getUsername()}} (<a href=\'javascript:void(0)\' ng-click=\'logout()\'>Logout</a>)</p></div>'
	};
}]);
'use strict';

var loginMain = angular.module('angular-login-loginMain', [
	'angular-login-loginControllers',
	'angular-login-loginServices',
	'angular-login-loginDirectives' ]);
'use strict';

var loginServices = angular.module('angular-login-loginServices', ['ngStorage', 'angular-jwt']);

loginServices.service('loginConfig', [function() {

	this.configuration = {
		tokenApiUrlEndPoint: 'http://localhost:8080/api/token',
		pathToLogin: '/login'
	};

	this.setConfiguration = function(newConfig) {
		this.configuration.tokenApiUrlEndPoint = newConfig.tokenApiUrlEndPoint || '';
		this.configuration.pathToLogin = newConfig.pathToLogin || '';
	};

	this.getConfiguration = function() {
		return this.configuration;
	};

}]);


loginServices.service('loginStorage', ['$sessionStorage', function($sessionStorage) {
	
	this.getToken = function () {
		return $sessionStorage.token || '';
	};

	this.setToken = function (token) {
		$sessionStorage.token = token;
	};

	this.removeToken = function () {
		if ($sessionStorage.token)
			delete $sessionStorage.token;
	};

}]);

loginServices.service('loginToken', ['$http', '$q', 'loginConfig', function($http, $q, Config){
	
	this.retrieveToken = function(username, pass) {
		var deferred = $q.defer();

		$http
			.post(Config.getConfiguration().tokenApiUrlEndPoint, { userIdentifier: username, secret: pass})
			.then(function(response) {
				deferred.resolve(response.data.token);
			})
			.catch (function() {
				deferred.reject('');
			});

		return deferred.promise;
	};

}]);

loginServices.service('loginRedirectToAttemptUrl', ['$location', 'loginConfig', 
	function($location, Config){

	this.redirectToUrlAfterLogin = {url: '/'};

	this.redirect = function (){
		$location.path(this.redirectToUrlAfterLogin.url);
	};

	this.saveUrl = function() {
		if (Config.getConfiguration().pathToLogin.toLowerCase() != $location.path().toLowerCase())
			this.redirectToUrlAfterLogin.url = $location.path();
	};
	
}]);

loginServices.service('loginAuth', ['loginStorage', 'jwtHelper', function(Storage, jwtHelper) {

	this.isLoggedIn = function() {
		return !!Storage.getToken();
	};

	this.loggedIn = function(token) {
		Storage.setToken(token);
	};

	this.loggedOut = function() {
		Storage.removeToken();
	};

	this.getUsername = function() {
		if (!this.isLoggedIn())
			return undefined;

		return jwtHelper
			.decodeToken(Storage.getToken()).unique_name;
	};

	this.hasClaim = function(claimType, claimValue) {
		if (!this.isLoggedIn())
			return false;

		var payload = jwtHelper
			.decodeToken(Storage.getToken());

		var value = payload[claimType] || {};

		if (Array.isArray(value))
			return value.indexOf(claimValue) >= 0;
		else
			return value === claimValue;
	};

}]);

loginServices.service('loginRequestInterceptor', ['loginStorage', '$q', '$location', 'loginConfig', 'loginRedirectToAttemptUrl',
	function(Storage, $q, $location, Config, RedirectToAttemptUrl){
	
	this.request = function(config) {
		var token = Storage.getToken();

		config.headers = config.headers || {};		

		if (token)
			config.headers.Authorization = token;		

		return config;
	};

	this.responseError = function(response) {
		if (response.status == 401) {
			RedirectToAttemptUrl.saveUrl();
			$location.path(Config.getConfiguration().pathToLogin);
		}

		return $q.reject(response);
	};

}]);

