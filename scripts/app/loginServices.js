'use strict';

var loginServices = angular.module('angular-login-loginServices', [
	'ngStorage', 
	'angular-jwt',
	'ngCookies']);

loginServices.service('loginConfig', [function() {

	this.configuration = {
		tokenApiUrlEndPoint: 'http://localhost:8080/api/token',
		pathToLogin: '/login',
		cookies: {			
			name: 'auth',
			ttl: 1
		}
	};

	this.setConfiguration = function(newConfig) {
		this.configuration.tokenApiUrlEndPoint = newConfig.tokenApiUrlEndPoint || '';
		this.configuration.pathToLogin = newConfig.pathToLogin || '';
		this.configuration.cookies = newConfig.cookies;
	};

	this.getConfiguration = function() {
		return this.configuration;
	};

}]);


loginServices.service('loginStorage', ['$sessionStorage', '$cookies', 'loginConfig',
	function($sessionStorage, $cookies, Config) {	
	
	this.getToken = function () {
		var token = $sessionStorage.token;

		if (!token && Config.getConfiguration().cookies) {
			token = $cookies.get(Config.getConfiguration().cookies.name);

			if (token)
				$sessionStorage.token = token;
		}

		return token || '';
	};

	this.setToken = function (token) {
		$sessionStorage.token = token;

		if (Config.getConfiguration().cookies) {
			var expireDate = new Date();
			expireDate.setTime(expireDate.getTime() + ((Config.getConfiguration().cookies.ttl || 1)*60*60*1000)); 

			$cookies.put(Config.getConfiguration().cookies.name, token, {
				expires: expireDate
			});
		}
	};

	this.removeToken = function () {
		if ($sessionStorage.token)
			delete $sessionStorage.token;

		if (Config.getConfiguration().cookies && $cookies.get(Config.getConfiguration().cookies.name))
			$cookies.remove(Config.getConfiguration().cookies.name);
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
			.catch (function(error) {
				deferred.reject(error.data);
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

	this.getClaimValue = function(claimType) {
		if (!this.isLoggedIn()) return;

		var payload = jwtHelper
			.decodeToken(Storage.getToken());

		return payload[claimType];
	};

	this.hasClaim = function(claimType, claimValue) {
		var value = this.getClaimValue(claimType);

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
	        Storage.removeToken();
			RedirectToAttemptUrl.saveUrl();
			$location.path(Config.getConfiguration().pathToLogin);
		}

		return $q.reject(response);
	};

}]);

