'use strict';

describe('Login controllers', function() {

	beforeEach(module('loginControllers'));

	describe('SignoutCtrl', function() {
		var scope;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();

			$controller('SignoutCtrl', {$scope:scope});
		}));

		describe('logout', function() {
			var $location, pathToLogin,
				spyAuth;

			beforeEach(inject(function(_$location_, Auth, Config) {
				$location = _$location_;
				pathToLogin = Config.getConfiguration().pathToLogin;
				spyAuth = spyOn(Auth, 'loggedOut');

				scope.logout();
			}));

			it('should invoke method loggedOut from Auth', function() {
				expect(spyAuth).toHaveBeenCalled();
			});

			it('should set location path to pathToLogin', function() {
				expect($location.path()).toBe(pathToLogin);
			});
		});
	});

	describe('SigninCtrl', function() {
		var scope;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();

			$controller('SigninCtrl', {$scope: scope});
		}));

		it('should set error as empty string', function() {
			expect(scope.error).toBe('');
		});		

		it('should set credentials username as empty string', function() {
			expect(scope.credentials.username).toBe('');
		});

		it('should set credentials pass as empty string', function() {
			expect(scope.credentials.pass).toBe('');
		});

		describe('login', function() {
			var deferred,
				spyAuth, spyToken, spyRedirectToAttemptUrl;

			beforeEach(inject(function($q, Auth, Token, RedirectToAttemptUrl) {
				deferred = $q.defer();
				spyAuth = spyOn(Auth, 'loggedIn');
				spyToken = spyOn(Token, 'retrieveToken');
				spyRedirectToAttemptUrl = spyOn(RedirectToAttemptUrl, 'redirect');

				scope.credentials.username = 'anyUsername';
				scope.credentials.pass = 'anyPass';

				spyToken.and.returnValue(deferred.promise);

				scope.login();
			}));

			it('should call retrieveToken method from Token with credentials', function() {
				expect(spyToken)
					.toHaveBeenCalledWith(scope.credentials.username, scope.credentials.pass);
			});

			it('should set error as \'Username/password combination provided is incorrect\' when fails', function() {
				deferred.reject('anyError');
				scope.$apply();
				expect(scope.error).toBe('Username/password combination provided is incorrect');
			});

			it('should invoke method loggedIn from Auth with token when success', function() {
				deferred.resolve('anyToken');
				scope.$apply();
				expect(spyAuth).toHaveBeenCalledWith('anyToken');
			});

			it('should clean error when success', function() {
				deferred.resolve();
				scope.$apply();
				expect(scope.error).toBe('');
			});

			it('should invoke method redirect from RedirectToAttemptUrl', function() {
				deferred.resolve();
				scope.$apply();
				expect(spyRedirectToAttemptUrl).toHaveBeenCalled();
			});
		});
	});
});