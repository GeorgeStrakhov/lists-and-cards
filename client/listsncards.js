Lists = new Meteor.Collection("lists");

/*initial startup configuration*/
  Meteor.startup(function () {
    Session.set("view", "list");
    Session.set("state", "base");
  });
/*end of startup configuration*/

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
  Meteor.autosubscribe(function () { //keep user in sync
    Meteor.subscribe("currentUser", Meteor.user());
    Session.set("user", Meteor.user());
    if(Session.get("user") && Session.get("user")._id && Meteor.userLoaded()) { //we have a valid signed in user
      var myListsList = Lists.findOne({ownedBy: Meteor.userId(), parent: Meteor.userId()});
      //console.log(myListsList);
      if(!myListsList) { //the user doesn't have a myListsList yet - it's a fresh user and we need to create the default list for him/her
        createNewList({
          name: Meteor.user().profile.name + "'s lists",
          parent: Meteor.userId(),
          goToNewList: true,
        });
        console.log('fresh user!');
      } else {
        Session.set("list", myListsList);
      }
    } else { //we don't have a signed in user or somebody just signed out or logged in as anonymous
      Session.set("list", {name: "loading..."}); //FIX this - show loading only if we're loading & show the list of public lists otherwise
    }
  });

/*end of reactive helper functions*/

/*globally accessible helper functions*/
  function createNewList(details) { //creating new list (empty or forking)
    var items = [];
    if(details.items)//we're forking from a list that has items
      items = details.items;
    var newListId = Lists.insert({
      name: details.name,
      description: details.description,
      createdBy: Meteor.userId(),
      ownedBy: Meteor.userId(),
      moderators: [],
      contributors: [Meteor.userId()],
      parent: details.parent,
      picUrl: details.picUrl,
      forkedFrom: details.forkedFrom,
      privacy: "open",
      suggestionsAllowed: true,
      items: items
    });
    if(details.goToNewList) {
      Session.set("list", Lists.findOne(newListId)); //making the list that we just created active
      Session.set("view", "list");
    }
    return newListId;
  };
/*end of globally accessible helper functions*/

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
      newListName = $("#newListName").val();
      newListDescription = $("#newListDescription").val();
      if(!newListName || newListName == "") {
        alert("please type in a name!");
      } else { //name is valid. go ahead and create a list
        var newListId = Lists.insert({
          name: newListName,
          description: newListDescription,
          createdBy: Meteor.userId(),
          ownedBy: Meteor.userId(),
          moderators: [],
          contributors: [Meteor.userId()],
          privacy: "open",
          suggestionsAllowed: true,
          items: []
        });
        Session.set("list", Lists.findOne(newListId)); //making the list that we just created active
        Session.set("view", "list");
      }
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
