if (Meteor.isClient) {

  /*globally accessible app state values. can be seen from any template*/
  Handlebars.registerHelper("user", function(){ //current user
    return Session.get("user");
  });
  
  Handlebars.registerHelper("list", function() { //current list
    return Session.get("list");
  });
  /*end of globally accessible state balues*/
  
  /*reactive helper functions*/
  Meteor.autosubscribe(function () {
    Meteor.subscribe("currentUser", Meteor.user());
    Session.set("user", Meteor.user());
  });
  
  /*end of reactive helper functions*/
  
  /*template specific behavior*/
  Template.navigation.events = ({
    'click #logInOut' : function() {
      Meteor.logout();
    },
  });
  
  Template.welcome.events = ({
    'click #explorePublicLists' : function() {
      $('#welcomeScreen').hide();
      Session.set("user", {});
    },
  });
  /*end of template specific behavior*/

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Accounts.loginServiceConfiguration.insert({
      service: "facebook",
      clientId: "479239908764045",
      secret: "c0804627fc8c8df52a0a4e5b399dccab"
    });
  });
}