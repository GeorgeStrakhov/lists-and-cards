Lists = new Meteor.Collection("lists");
Session.set("list", {name: "loading..."});

/*initial startup configuration*/
  Meteor.startup(function () {
    //console.log(Session);
    if(!Session.get("view"))
      Session.set("view", "list");
    if(!Session.get("state"))
      Session.set("state", "base");
    if(!Session.get("list"))
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
      //if(!(Session.get("card")))
      if(Lists.findOne(Session.get("list")._id).items[0]) { //selecting the first card of the newly selected list
        Session.set("card", Lists.findOne(Session.get("list")._id).items[0]);
      } else {
        Session.set("card", {name: "no cards yet..."});
      }
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
  
  function goToCard(whichCard) { //whichCard can be "next", "prev" or "rand"
    console.log(whichCard);
    var newCard = {name: "sorry, there are no cards on this list"};
    var cards = Lists.findOne(Session.get("list")._id).items;
    //console.log(cards);
    if (whichCard == "rand") {
      Session.set("card", cards[Math.floor(Math.random() * cards.length)]);
      return;
    }
    if (whichCard == "next")
      var changer = 1;
    if (whichCard == "prev")
      var changer = -1;
    for (i=0; i<cards.length; i++) {
      if(cards[i]._id == Session.get("card")._id) {        
        if(i == (cards.length-1) && whichCard == "next") {
          newCard = cards[0];
        } else if(i == 0 && whichCard == "prev") {
          newCard = cards[cards.length-1];
        } else {
          newCard = cards[i+changer];
        }
      }
    }
    Session.set("card", newCard);
  }
  
/*end of globally accessible helper functions*/

/*template specific behavior*/
  Template.navigation.myListsList = function() {
    return (Session.get("list").parent == Meteor.userId() && Session.get("view") == "list"); //true if this current list is myListsList and we are in the list mode
  };

  Template.navigation.events = ({
    'click #logInOut' : function() {
      Meteor.logout();
    },
    'click #homeButton' : function() {
      goToMyLists();
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
      var newItemDescription = $("#newItemDescription").val();
      if(!newItemName || newItemName == "") {
        alert("please enter a valid item name");
      } else {
        createNewItem({name: newItemName, description: newItemDescription});
      }
    },
  });
  
  Template.item.events = ({
    'click' : function() {
      if(this.type == "link") {
        Session.set("list", Lists.findOne(this.description)); //FIX - process normal URLs as well!
      }
      if (this.type == "card") {
        Session.set("card", this);
        Session.set("view", "cards");
      }
    },
  });

  Template.card.events = ({
    'click #flipCard' : function() {
      var otherSide = "nothing here yet";
      if($("#theCard").html() == Session.get("card").description) {
        otherSide = Session.get("card").name;
      } else {
        otherSide = Session.get("card").description;
      }
      $("#theCard").flip({
        direction: "rl",
        content: otherSide,
        color: "#F5F5F5",
      });
    },
    'click #prevCard' : function() {
      goToCard("prev");
    },
    'click #nextCard' : function() {
      goToCard("next");
    },
  });
/*end of template specific behavior*/
