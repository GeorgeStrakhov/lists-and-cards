if (Meteor.isClient) {

  /*initial startup configuration*/
  Meteor.startup(function () {
    Session.set("view", "list");
    Session.set("list", {name: "your lists", description: "olala", items: [{name: "1"}, {name: "2"}]});
  });
  /*end of startup*/

  /*globally accessible app state values. can be seen from any template*/
  Handlebars.registerHelper("user", function(){ //current user
    return Session.get("user");
  });
  
  Handlebars.registerHelper("list", function() { //current list - always set!
    return Session.get("list");
  });
  
  Handlebars.registerHelper("card", function() { //current card - always set!
    return Session.get("card");
  });
  
  Handlebars.registerHelper("view", function(view) { //current view: list or cards always set!
    return Session.get("view") == view;
  });
  
  Handlebars.registerHelper("state", function(state) { //current app state e.g. "creatingNewList" etc. used to show modals etc.
    return Session.get("state") == state;
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
    'click #createNewList' : function() {
      Session.set("state", "creatingNewList");
    },
    'click #viewAsCards' : function() {
      Session.set("view", "cards");
    },
    'click #viewAsList' : function() {
      Session.set("view", "list");
    },
  });
  
  Template.welcome.events = ({
    'click #explorePublicLists' : function() {
      Session.set("user", {});
    },
  });
  
  Template.createNewList.events = ({
    'click #cancelButton' : function() {
      Session.set("state", "base");
    },
    'click #createNewListButton' : function() {
      alert("can't create a new list yet!");
      //FIX create list here var newListId = Lists.insert({???});
      //FIX Session.set("list", Lists.findOne(newListId)); //make new list active 
      Session.set("state", "base");
    },
  });
  
  Template.card.events = ({
    'click' : function() {
      $("#theCard").flip({
        direction: "rl",
        content: "helloWorld!", //FIX - put in the data here
        color: "#F5F5F5",
      });
    }
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
