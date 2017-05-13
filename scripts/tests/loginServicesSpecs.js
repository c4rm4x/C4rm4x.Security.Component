'use strict';

describe('Login services', function() {

	beforeEach(module('angular-login-loginServices'));

	describe('loginConfig', function() {
		var service;

		beforeEach(inject(function(loginConfig) {
			service = loginConfig;
		}));

		describe('getConfiguration', function() {

			it('should return not null configuration', function() {
				expect(service.getConfiguration()).not.toBe(null);
			});

			it('should return a configuration with a not empty tokenApiUrlEndPoint property', function() {
				expect(service.getConfiguration().tokenApiUrlEndPoint).not.toBe('');
			});

			it('should return a configuration with a not empty pathToLogin property', function() {
				expect(service.getConfiguration().pathToLogin).not.toBe('');
			});

			it('should return a configuration with a non null cookies property', function() {
				expect(service.getConfiguration().cookies).not.toBe(null);
			});

			it('should return a configuration with cookies name property set as auth', function() {
				expect(service.getConfiguration().cookies.name).toBe('auth');
			});

			it('should return a configuration with cookies ttl property as 1', function() {
				expect(service.getConfiguration().cookies.ttl).toBe(1);
			});
		});

		describe('setConfiguration', function() {
			var newConfig = {
				tokenApiUrlEndPoint: 'new_token_api_url_end_point',
				pathToLogin: 'new_path_to_login',
				cookies: {
					name: 'new_cookie_name',
					ttl: 24
				}
			};

			beforeEach(function() {
				service.setConfiguration(newConfig);
			});

			it('should set configuration tokenApiUrlEndPoint property with new value', function() {
				expect(service.getConfiguration().tokenApiUrlEndPoint).toBe(newConfig.tokenApiUrlEndPoint);
			});

			it('should set configuration pathToLogin property with new value', function() {
				expect(service.getConfiguration().pathToLogin).toBe(newConfig.pathToLogin);
			});

			it('should set configuraton cookies property with new cookie configuration', function() {
				expect(service.getConfiguration().cookies).toEqual(newConfig.cookies);
			});
		});
	});

	describe('loginStorage', function() {
		var service, config, $sessionStorage, $cookies;

		beforeEach(inject(function(loginStorage, loginConfig, _$sessionStorage_, _$cookies_) {
			service = loginStorage;
			config = loginConfig.getConfiguration().cookies;
			$sessionStorage = _$sessionStorage_;
			$cookies = _$cookies_;

			if ($sessionStorage.token)
				delete $sessionStorage.token;	

			if ($cookies.get(config.name))
				$cookies.remove(config.name);
		}));	

		describe('getToken', function() {

			it('should return empty string when token property from $sessionStorage is undefined', function() {
				expect(service.getToken()).toBe('');
			});

			it('should return token property value from $sessionStorage when is defined', function() {
				$sessionStorage.token = 'anyToken';

				expect(service.getToken()).toBe('anyToken');
			});	

			it('should return token property from $cookies when token property from $sessionStorage is undefined but cookie is not', function() {
				$cookies.put(config.name, 'anyTokenAlt');

				expect(service.getToken()).toBe('anyTokenAlt');
			});	
		});

		describe('setToken', function() {

			it('should set new token as token property @ $sessionStorage', function() {
				service.setToken('newToken');

				expect($sessionStorage.token).toBe('newToken');
			});

			it('should set new token @cookies', function() {
				service.setToken('newToken');

				expect($cookies.get(config.name)).toBe('newToken');
			});
		});

		describe('removeToken', function() {

			it ('should remove the token property @ $sessionStorage', function() {
				$sessionStorage.token = 'anyToken';

				service.removeToken();

				expect($sessionStorage.token).toBe(undefined);
			});
		});
	});	

	describe('loginToken', function() {
		var service, $http, tokenApiEndPoint;

		beforeEach(inject(function(loginToken, $httpBackend, loginConfig) {
			service = loginToken;
			$http = $httpBackend;
			tokenApiEndPoint = loginConfig.getConfiguration().tokenApiUrlEndPoint;
		}));

		describe('retrieveToken', function() {

			it('should return token when success', function() {
				$http
					.expectPOST(tokenApiEndPoint, { userIdentifier: 'anyUser', secret: 'anySecret'})
					.respond(200, {token: 'newToken'});
				service
					.retrieveToken('anyUser', 'anySecret')
					.then(function(response) {
						expect(response).toBe('newToken');
					});
				$http.flush();
			});

			it('should return empty token when fails', function() {
				$http
					.expectPOST(tokenApiEndPoint, { userIdentifier: 'anyUser', secret: 'anySecret'})
					.respond(500, {message: 'nope'});
				service
					.retrieveToken('anyUser', 'anySecret')
					.catch(function(response) {
						expect(response.message).toBe('nope');
					});
				$http.flush();
			});
		});
	});

	describe('loginRedirectToAttemptUrl', function() {
		var service, $location, pathToLogin;

		beforeEach(inject(function(loginRedirectToAttemptUrl, _$location_, loginConfig) {
			service = loginRedirectToAttemptUrl;
			$location = _$location_;
			pathToLogin = loginConfig.getConfiguration().pathToLogin;
		}));

		it('should set redirectToUrlAfterLogin url as \'/\'', function() {
			expect(service.redirectToUrlAfterLogin.url).toBe('/');
		});

		describe('saveUrl', function() {
			var spyLocation;

			beforeEach(function() {
				spyLocation = spyOn($location, 'path');
			});

			it('should not alter redirectToUrlAfterLogin url when $location.path() is pathToLogin', function() {
				spyLocation.and.returnValue(pathToLogin);
				service.saveUrl();
				expect(service.redirectToUrlAfterLogin.url).toBe('/');
			});	

			it('should alter redirectToUrlAfterLogin url with $location.path() when this is not pathToLogin', function() {
				spyLocation.and.returnValue('/other.url');
				service.saveUrl();
				expect(service.redirectToUrlAfterLogin.url).toBe('/other.url');
			});
		});

		describe('redirect', function() {

			it('should redirect to redirectToUrlAfterLogin url', function() {
				service.redirect();
				expect($location.path()).toBe(service.redirectToUrlAfterLogin.url);
			});
		});
	});

	describe('loginAuth', function() {
		var service;

		beforeEach(inject(function(loginAuth) {
			service = loginAuth;
		}));

		describe('isLoggedIn', function() {
			var spyStorage;

			beforeEach(inject(function(loginStorage) {
				spyStorage = spyOn(loginStorage, 'getToken');
			}));

			it('should invoke method getToken from Storage', function() {
				service.isLoggedIn();
				expect(spyStorage).toHaveBeenCalled();
			});

			it('should return false when getToken from Storage returns falsy',  function() {
				spyStorage.and.returnValue(undefined);
				expect(service.isLoggedIn()).toBe(false);
			});

			it('should return true when getToken from Storage returns a token',  function() {
				spyStorage.and.returnValue('anyToken');
				expect(service.isLoggedIn()).toBe(true);
			});
		});

		describe('getUsername', function() {
			var spyStorage, spyJwtHelper;

			beforeEach(inject(function(loginStorage, jwtHelper) {
				spyStorage = spyOn(loginStorage, 'getToken');
				spyJwtHelper = spyOn(jwtHelper, 'decodeToken');	

				spyJwtHelper.and.returnValue({unique_name: 'anyName'});			
			}));

			it('should invoke method getToken from Storage', function() {
				service.getUsername();
				expect(spyStorage).toHaveBeenCalled();
			});

			it('should return undefined when getToken from Storage returns falsy',  function() {
				spyStorage.and.returnValue(undefined);
				expect(service.getUsername()).toBe(undefined);
			});

			it('should invoke method decodeToken from jwtHelper with token returned by getToken from Storage', function() {
				spyStorage.and.returnValue('anyToken');
				service.getUsername();
				expect(spyJwtHelper).toHaveBeenCalledWith('anyToken');
			});

			it('should return tokens unique_name when getToken from Storage returns a token',  function() {
				spyStorage.and.returnValue('anyToken');
				expect(service.getUsername()).toBe('anyName');
			});
		});

		describe('hasClaim', function() {
			var spyStorage, spyJwtHelper;

			beforeEach(inject(function(loginStorage, jwtHelper) {
				spyStorage = spyOn(loginStorage, 'getToken');
				spyJwtHelper = spyOn(jwtHelper, 'decodeToken');	

				spyJwtHelper.and.returnValue({
					role: 'anyRole',
					permissions: [
						'canRead',
						'canWrite'					 
					]
				});			
			}));

			it('should invoke method getToken from Storage', function() {
				service.hasClaim('anyClaimType', 'anyClaimValue');
				expect(spyStorage).toHaveBeenCalled();
			});

			it('should return false when getToken from Storage returns falsy',  function() {
				spyStorage.and.returnValue(undefined);
				expect(service.hasClaim('anyClaimType', 'anyClaimValue')).toBe(false);
			});

			it('should invoke method decodeToken from jwtHelper with token returned by getToken from Storage', function() {
				spyStorage.and.returnValue('anyToken');
				service.hasClaim('anyClaimType', 'anyClaimValue');
				expect(spyJwtHelper).toHaveBeenCalledWith('anyToken');
			});

			describe('with existing token', function() {

				beforeEach(function() {
					spyStorage.and.returnValue('anyToken');					
				});

				it('should return false when the claim required does not exist', function() {
					expect(service.hasClaim('anyClaimType', 'anyClaimValue')).toBe(false);
				});

				it('should return true when the claim required is an existing simple value', function() {
					expect(service.hasClaim('role', 'anyRole')).toBe(true);
				});

				it('should return false when the claim required is not contained in the array', function() {
					expect(service.hasClaim('permissions', 'anyPermission')).toBe(false);
				});

				it('should return true when the claim required is contained in the array', function() {
					expect(service.hasClaim('permissions', 'canRead')).toBe(true);
				});
			});
		});

		describe('loggedOut', function() {
			var spyStorage;

			beforeEach(inject(function(loginStorage) {
				spyStorage = spyOn(loginStorage, 'removeToken');

				service.loggedOut();
			}));

			it('should invoke removeToken method from Storage', function() {
				expect(spyStorage).toHaveBeenCalled();
			})
		});

		describe('loggedIn', function() {
			var spyStorage;

			beforeEach(inject(function(loginStorage) {
				spyStorage = spyOn(loginStorage, 'setToken');

				service.loggedIn('anyToken');
			}));

			it('should invoke setToken method from Storage with token passed as argument', function() {
				expect(spyStorage).toHaveBeenCalledWith('anyToken');
			});
		});
	});

	describe('loginRequestInterceptor', function() {
		var service;

		beforeEach(inject(function(loginRequestInterceptor) {
			service = loginRequestInterceptor;
		}));

		describe('request', function() {
			var storageSpy, 
				config = {};

			beforeEach(inject(function(loginStorage) {
				storageSpy = spyOn(loginStorage, 'getToken');

				storageSpy.and.returnValue('anyToken');

				service.request(config);
			}));

			it('should check storage to retrieve token', function() {
				expect(storageSpy).toHaveBeenCalled();
			});

			it('should add \'Authorization\' header with the token', function() {
				expect(config.headers.Authorization).toBe('anyToken');
			});
		});

		describe('responseError', function() {
		    var $location, pathToLogin,
                spyRemoveToken,
				spyRedirectToAttemptUrl;

			beforeEach(inject(function(_$location_, loginConfig, loginStorage, loginRedirectToAttemptUrl) {
				$location = _$location_;
				pathToLogin = loginConfig.getConfiguration().pathToLogin;

				spyRemoveToken = spyOn(loginStorage, 'removeToken');
				spyRedirectToAttemptUrl = spyOn(loginRedirectToAttemptUrl, 'saveUrl');
			}));

			it('should invoke removeToken from Storage when error code is 401', function () {
			    service.responseError({ 'status': 401 });
			    expect(spyRemoveToken).toHaveBeenCalled();
			});

			it('should invoke saveUrl method from RedirectToAttemptUrl when error code is 401', function() {
				service.responseError({'status': 401});
				expect(spyRedirectToAttemptUrl).toHaveBeenCalled();
			});

			it('should set location path to pathToLogin when error code is 401', function(){
				service.responseError({'status': 401});
				expect($location.path()).toBe(pathToLogin);
			});

			it('should not set location path to pathToLogin when error code is not 401', function() {
				service.responseError({'status': 505});
				expect($location.path()).not.toBe(pathToLogin);
			});
		});
	});
});