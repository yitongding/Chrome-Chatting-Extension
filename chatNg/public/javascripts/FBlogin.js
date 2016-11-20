angular.module('chatApp').run(['$rootScope', '$window', 'srvAuth',
function($rootScope, $window, sAuth) {

  $rootScope.user = {};

  $window.fbAsyncInit = function() {
    FB.init({
      appId: '{your-app-id}',
      status: true,
      cookie: true,
      xfbml: true,
      version: 'v2.4'
    });
  };

  sAuth.watchAuthenticationStatusChange();

};

(function(d) {
  // load the Facebook javascript SDK

  var js,
    id = 'facebook-jssdk',
    ref = d.getElementsByTagName('script')[0];

  if (d.getElementById(id)) {
    return;
  }

  js = d.createElement('script');
  js.id = id;
  js.async = true;
  js.src = "//connect.facebook.net/en_US/sdk.js";

  ref.parentNode.insertBefore(js, ref);

}(document));

]);