'use strict';

describe('FB Login services', function() {

	beforeEach(module('angular-login-fbLoginServices'));

	describe('fbLoginConfig', function() {
		var service;

		beforeEach(inject(function(fbLoginConfig) {
			service = fbLoginConfig;
		}));

		describe('getConfiguration', function() {
			var getConfiguration;

			beforeEach(inject(function(loginConfig) {
				getConfiguration = spyOn(loginConfig, 'getConfiguration');
			}));

			it('should invoke getConfiguration from loginConfig', function() {
				service.getConfiguration();
				expect(getConfiguration).toHaveBeenCalled();
			});			

			it('should return a configuration with a not empty appId property', function() {
				expect(service.getConfiguration().appId).not.toBe('');
			});

			it('should return a configuration with a not empty channelUrl property', function() {
				expect(service.getConfiguration().channelUrl).not.toBe('');
			});

			it('should return a configuration with a not empty logoutUrl property', function() {
				expect(service.getConfiguration().logoutUrl).not.toBe('');
			});

			it('should return a configuration with a not empty successUrl property', function() {
				expect(service.getConfiguration().successUrl).not.toBe('');
			});

			it('should return a configuration with all the properties from loginConfig configuration', function() {
				var actual,
					expectation = {
						firstProperty: 'anyFirstProperty',
						secondProperty: 'anySecondProperty'
					};

				getConfiguration.and.returnValue(expectation);

				for (var property in expectation) {
					expect(service.getConfiguration()[property]).toBe(expectation[property]);
				};
			});
		});

		describe('setConfiguration', function() {
			var setConfiguration,
				newConfig = {
					appId: 'new_app_id',
					channelUrl: 'new_channel_url',
					logoutUrl: 'new_logout_url'
				};

			beforeEach(inject(function(loginConfig) {
				setConfiguration = spyOn(loginConfig, 'setConfiguration');

				service.setConfiguration(newConfig);
			}));

			it('should set configuration appId property with new value', function() {
				expect(service.getConfiguration().appId).toBe(newConfig.appId);				
			});

			it('should set configuration channelUrl property with new value', function() {
				expect(service.getConfiguration().channelUrl).toBe(newConfig.channelUrl);				
			});

			it('should set configuration logoutUrl property with new value', function() {
				expect(service.getConfiguration().logoutUrl).toBe(newConfig.logoutUrl);				
			});

			it('should invoke setConfiguration from loginAuth with the config', function() {
				expect(setConfiguration).toHaveBeenCalledWith(newConfig);
			});
		});
	});	

	describe('fbLoginAuth', function() {
		var service;

		beforeEach(inject(function(fbLoginAuth) {
			service = fbLoginAuth;
		}));

		describe('isLoggedIn', function() {
			var isLoggedIn;

			beforeEach(inject(function(loginAuth) {
				isLoggedIn = spyOn(loginAuth, 'isLoggedIn');
			}));

			it('should invoke isLoggedIn from loginAuth', function() {
				service.isLoggedIn();				
				expect(isLoggedIn).toHaveBeenCalled();
			});

			it('should return true when isLoggedIn from loginAuth returns true', function() {
				isLoggedIn.and.returnValue(true);
				expect(service.isLoggedIn()).toBe(true);
			});

			it('should return false when isLoggedIn from loginAuth returns false', function() {
				isLoggedIn.and.returnValue(false);
				expect(service.isLoggedIn()).toBe(false);
			});
		});

		describe('loggedIn', function() {
			var loggedIn;

			beforeEach(inject(function(loginAuth) {
				loggedIn = spyOn(loginAuth, 'loggedIn');
			}));

			it('should invoke loggedIn from loginAuth with given token', function() {
				var token = 'anyToken';

				service.loggedIn(token);
				expect(loggedIn).toHaveBeenCalledWith(token);
			});		
		});

		describe('logOut', function() {
			var loggedOut;

			beforeEach(inject(function(loginAuth) {				
				loggedOut = spyOn(loginAuth, 'loggedOut');						
			}));

			it('should invoke loggedOut from loginAuth', function() {				
				service.logOut();
				expect(loggedOut).toHaveBeenCalled();
			});
		});

		describe('getUsername', function() {
			var getUsername;

			beforeEach(inject(function(loginAuth) {
				getUsername = spyOn(loginAuth, 'getUsername');
			}));

			it('should invoke getUsername from loginAuth', function() {
				service.getUsername();
				expect(getUsername).toHaveBeenCalled();
			});

			it('should return the username returned by loginAuth', function() {
				var username = 'anyUsername';

				getUsername.and.returnValue(username);				
				expect(service.getUsername()).toBe(username);
			});
		});

		describe('getPicture', function() {
			var getClaimValue;

			beforeEach(inject(function(loginAuth) {
				getClaimValue = spyOn(loginAuth, 'getClaimValue');
			}));

			it('should invoke getClaimValue from loginAuth with URI claim', function() {
				service.getPicture();
				expect(getClaimValue).toHaveBeenCalledWith('http://schemas.xmlsoap.org/ws/2005/05/identity/claims/uri');
			});

			it('should return the value returned by loginAuth', function() {
				var picture = 'anyPicture';

				getClaimValue.and.returnValue(picture);
				expect(service.getPicture()).toBe(picture);
			});

			it('should return emtpy string when the value returned by loginAuth is undefined', function() {
				getClaimValue.and.returnValue();
				expect(service.getPicture()).toBe('');
			});
		});

		describe('hasClaim', function() {
			var hasClaim;

			beforeEach(inject(function(loginAuth) {
				hasClaim = spyOn(loginAuth, 'hasClaim');
			}));

			it('should invoke hasClaim from loginAuth with claimType and claimValue', function() {
				var claimType = 'anyClaimType',
					claimValue = 'claimValue';

				service.hasClaim(claimType, claimValue);
				expect(hasClaim).toHaveBeenCalledWith(claimType, claimValue);
			});

			it('should return true when hasClaim from loginAuth returns true', function() {
				hasClaim.and.returnValue(true);
				expect(service.hasClaim('anyClaimType', 'anyClaimValue')).toBe(true);
			});

			it('should return false when hasClaim from loginAuth returns false', function() {
				hasClaim.and.returnValue(false);
				expect(service.hasClaim('anyClaimType', 'anyClaimValue')).toBe(false);
			});
		});
	});

});