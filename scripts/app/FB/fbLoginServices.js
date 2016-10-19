'use strict';

var fbLoginServices = angular.module('angular-login-fbLoginServices', [
	'angular-login-loginServices']);

fbLoginServices.service('fbLoginConfig', ['loginConfig', function(loginConfig) {

	this.configuration = {
		appId: 'appId',
		channelUrl: 'app/channel.html',
		logoutUrl: '/logout'
	};

	this.setConfiguration = function(newConfig) {
		this.configuration.appId = newConfig.appId || '';
		this.configuration.channelUrl = newConfig.channelUrl || '';
		this.configuration.logoutUrl = newConfig.logoutUrl || '';		
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
		return loginAuth.getClaimValue('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri') || '';
	}

	this.hasClaim = function(claimType, claimValue) {
		return loginAuth.hasClaim(claimType, claimValue);
	};	
}]);

fbLoginServices.service('fbLoginEventAggregator', [function() {

	var subscribers = {};

	this.subscribe = function(type, callback) {
		if (!subscribers[type])
			subscribers[type] = [callback];
		else
			subscribers[type].push(callback);
	};

	this.publish = function(type, args) {
		if (!subscribers[type]) return;

		angular.forEach(subscribers[type], function(subscriber) {
			subscriber(args);
		});
	};

}]);

fbLoginServices.service('fbLoginEventHandler', ['fbLoginAuth', 'fbLoginConfig', 'fbLoginEventAggregator', 'loginToken', 
	function(Auth, Config, EventAggregator, Token) {
	
	this.init = function() {
		var ERROR = 'error',
			OK = 'ok';

		function handleSuccess(authResponse) {	

			function retrieveToken(authResponse) {
				Token.retrieveToken(authResponse.userID, authResponse.accessToken)
					.then(function(token) {
						Auth.loggedIn(token);
					})
					.then(function() {
						EventAggregator.publish(OK, authResponse);
					})
					.catch(function(error) {
						EventAggregator.publish(ERROR, error);
					});
			};

			retrieveToken(authResponse);		
		};

		function statusChangeCallback(response) {
			if (response.status === 'connected' && response.authResponse) {
				handleSuccess(response.authResponse);				
			} else {
				EventAggregator.publish(ERROR, response.status);
			}
		};

		FB.init({
			appId: Config.getConfiguration().appId,
			channelUrl: Config.getConfiguration().channelUrl,
			status: true,
			cookie: true,
			xfbml: true
		});

		FB.Event.subscribe('auth.statusChange', function(response) {
			statusChangeCallback(response);
		});

		return this;
	};

	function op(type, handler) {
		EventAggregator.subscribe(type, handler);
		return this;
	};

	this.onSuccess = function(handler) {
		return on(OK, handler);
	};

	this.onFailure = function(handler) {
		return on(ERROR, handler);
	};

}]);