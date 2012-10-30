Lists = new Meteor.Collection("lists");
Session.set("list", {name: "loading..."});

/*initial startup configuration*/
  Meteor.startup(function () {
    Session.set("view", "list");
    Session.set("state", "base");
    Session.set("list", {name: "loading..."});
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
      }
    }
    Session.set("user", Meteor.user());
    if(!Session.get("list")._id) { //if we're just loading the app and current list is not set yet
      goToMyLists();
    }
  });
  
  Meteor.autosubscribe(function() { //keeping the current list up to date.
    Meteor.subscribe("currentList", Session.get("list")); //will this cause infinite loop? thank Yoda, no!
    //console.log(Session.get("list"));
    if(Session.get("list")._id) {
      Session.set("list", Lists.findOne(Session.get("list")._id));
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
    if(details.parent != Meteor.userId()) //unless we are generating a new myListsList for a fresh user
      updateMyListsList();
      Meteor.flush();
    if(details.goToNewList) {
      //console.log('going to new list');
      Session.set("list", Lists.findOne(newListId)); //making the list that we just created active
      Session.set("view", "list");
    }
    Session.set("state", "base");
    return newListId;
  };
  
  function createNewItem(details) { //creating new item in the current list
    details._id = Meteor.uuid(); //assigning newly created item
    if(!details.type)
      details.type = "card";
    if(!details.sublists)
      details.sublists = [];
    if(!details.status)
      details.status = "approved"; //FIX! we might need to have a function here to determine whether I'm the owner or moderator of the lsit I'm trying to modify. or we can do it elsewhere
    Lists.update({_id: Session.get("list")._id},{$push: {items: details}});
    Session.set("card", details);//setting selected card to newly created one
    //console.log("new item created!");
    return details._id; //returning the _id of the newly created item
  };
  
  function updateMyListsList() {
    var myListsItems = [];
    Lists.find({createdBy: Meteor.userId(), parent: {$ne: Meteor.userId()}}).forEach(function(usersList){
      myListsItems.push({
        name: usersList.name,
        description: usersList._id, //because we're reusing description field to store URLs or IDs for internal things if type="link"
        type: "link",
        picUrl: usersList.picUrl,
        status: "approved",
        sublists: [],
      });
    });
    Lists.update({parent: Meteor.userId()},{$set: {items: myListsItems}});//update myListsList items. FIX! we actually need to iterate through them and turn them into proper cards (with type etc.)
  };
  
  function goToMyLists() { //go to user's myLists
    if(Meteor.userLoaded())
      Session.set("list", Lists.findOne({ownedBy: Meteor.userId(), parent: Meteor.userId()}));
    Session.set("view", "list");
    Session.set("state", "base");
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
    'click #viewMyLists' : function() {
      goToMyLists();
    },
    'click #searchThisList' : function() {
      Session.set("state", "searchingThisList");
    },
    'click #searchAllPublicLists' : function() {
      Session.set("state", "searchingAllPublicLists");
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
      if(!newListName || newListName == "") { //FIX more sophisticated input validation here
        alert("please type in a valid name!");
      } else { //name is valid. go ahead and create a list
        createNewList({
          name: newListName,
          description: newListDescription,
          goToNewList: true,
        });
      }
    },
  });
  
  Template.search.events = ({
    'click #searchButton' : function() {
      alert('not ready yet!');
      Session.set("state", "base");
    },
    'click #cancelButton' : function() {
      Session.set("state", "base");
    },
  });
  
  Template.list.myListsList = function() {
    return (Session.get("list").parent == Meteor.userId()); //true if this current list is myListsList
  };
  
  Template.list.events = ({
    'click #createNewList' : function() {
      Session.set("state", "creatingNewList");
    },
    'click #addOne' : function() {
      $("#addOneForm").toggle();
      $("#newItemName").focus();
    },
    'click #addOneButton' : function() {
      var newItemName = $("#newItemName").val();
      if(!newItemName || newItemName == "") {
        alert("please enter a valid item name");
      } else {
        createNewItem({name: newItemName});
      }
    },
  });
  
  Template.item.events = ({
    'click' : function() {
      if(this.type == "link") {
        Session.set("list", Lists.findOne(this.description)); //FIX - process normal URLs as well!
      } else {
        alert("not a link!") //FIX
      }
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
