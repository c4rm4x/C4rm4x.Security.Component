'use strict';

var loginServices = angular.module('loginServices', ['ngStorage', 'angular-jwt']);

loginServices.service('Config', [function() {

	this.configuration = {
		tokenApiUrlEndPoint: 'http://localhost:8080/api/token',
		pathToLogin: '/login'
	};

	this.setConfiguration = function(tokenApiUrlEndPoint, pathToLogin) {
		this.configuration.tokenApiUrlEndPoint = tokenApiUrlEndPoint;
		this.configuration.pathToLogin = pathToLogin;
	};

	this.getConfiguration = function() {
		return this.configuration;
	};

}]);


loginServices.service('Storage', ['$sessionStorage', function($sessionStorage) {
	
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

loginServices.service('Token', ['$http', '$q', 'Config', function($http, $q, Config){
	
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

loginServices.service('RedirectToAttemptUrl', ['$location', 'Config', 
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

loginServices.service('Auth', ['Storage', 'jwtHelper', function(Storage, jwtHelper) {

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

}]);

loginServices.service('RequestInterceptor', ['Storage', '$q', '$location', 'Config', 'RedirectToAttemptUrl',
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

