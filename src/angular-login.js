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
'use strict';

var fbLoginMain = angular.module('angular-login-fbLoginMain', [
	'angular-login-fbLoginServices',
	'angular-login-fbLoginDirectives' ]);
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
			RedirectToAttemptUrl.saveUrl();
			$location.path(Config.getConfiguration().pathToLogin);
		}

		return $q.reject(response);
	};

}]);

