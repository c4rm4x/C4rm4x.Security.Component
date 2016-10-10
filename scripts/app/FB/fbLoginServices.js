'use strict';

var fbLoginServices = angular.module('angular-login-fbLoginServices', [
	'angular-login-loginServices',
	'angular-login-fbLoginConstants']);

fbLoginServices.service('fbLoginConfig', ['loginConfig', function(loginConfig) {

	this.configuration = {
		appId: 'appId',
		channelUrl: 'app/channel.html'
	};

	this.setConfiguration = function(newConfig) {
		this.configuration.appId = newConfig.appId || '';
		this.configuration.channelUrl = newConfig.channelUrl || '';
		loginConfig.setConfiguration(newConfig);
	};

	this.getConfiguration = function() {
		return angular.merge({}, this.configuration, loginConfig.getConfiguration());
	};
}]);

fbLoginServices.service('fbLoginAuth', ['loginAuth', 
	function(loginAuth) {

	this.isLoggedIn = function() {
		return loginAuth.isLoggedIn();
	};

	this.loggedIn = function(token) {
		loginAuth.loggedIn(token);
	};

	this.logOut = function() {
		loginAuth.loggedOut();
	};

	this.getUsername = function() {
		return loginAuth.getUsername();		
	};

	this.getPicture = function() {
		return loginAuth.getClaimValue('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri');
	}

	this.hasClaim = function(claimType, claimValue) {
		return loginAuth.hasClaim(claimType, claimValue);
	};	
}]);

fbLoginServices.service('fbLoginEventHandler', ['fbLoginAuth', 'fbLoginConfig', 'loginToken', 'LoginStatus', '$q',
	function(Auth, Config, Token, Status, $q) {
	
	this.init = function() {
		var deferred = $q.defer();

		function handleSuccess(authResponse) {	

			function retrieveToken(authResponse) {
				Token.retrieveToken(authResponse.userID, authResponse.accessToken)
					.then(function(token) {
						Auth.loggedIn(token);
					})
					.then(function() {
						deferred.resolve(Status.OK);
					})
					.catch(function(error) {
						if (error.code && error.code === 'AUTH_001')
							deferred.reject(Status.Unknown);
						else
							deferred.reject(Status.Unexpected);
					});
			};

			if (Auth.isLoggedIn()) deferred.resolve(Status.OK);
			else retrieveToken(authResponse);		
		};

		function statusChangeCallback(response) {
			if (response.status === 'connected' && response.authResponse) {
				handleSuccess(response.authResponse);				
			} else if (response.status === 'not_authorized'){
				deferred.reject(Status.NotAuthorized);
			} else {				
				FB.Event.subscribe('auth.statusChange', function(response) {
					statusChangeCallback(response);
				});
			}
		};

		FB.init({
			appId: Config.appId,
			channelUrl: Config.channelUrl,
			status: true,
			cookie: true,
			xfbml: true
		});

		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});

		return deferred.promise;
	};

}]);