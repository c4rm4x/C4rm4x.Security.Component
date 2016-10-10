'use strict';

angular.module('angular-login-fbLoginConstants', [])
	.constant('LoginStatus', {
		OK: 0,
		NotAuthorized: -1,
		NotLoggedIn: -2,
		Unknown: -3,
		Unexpected : -4
	});