idea:
=====
Simple & mobile friendly webapp for listing anything and flicking through it. Useful for memorizing, brainstorming and more.
You can: 
* create unordered lists
* every list can be viewed as a list or as a set of cards presented to you in random order
* every card can have some data on one side and some data on the other side (so that you can get a card, try to remember and then flip it over and check if you remembered correctly)

In the future adding a "karma" component to it could be interesting, so that from a community standpoint it works more like StackExchange or Quora.
Monetization opportunities:
* paying other people to create / fill in cards for you (mechanical turk / task rabbit style)
* ordering printed versions of your lists as *beautiful* flashcards (moo.com style)
* custom app packaging for corporate flashcards (flashcard-exchange style, but smarter with PhoneGap)
* what else?

usage:
======
I would personally create lists for:
* marketing keywords with russian translations and examples (public)
* startup ideas (private)
* crazy words for barinstorms (secret)
* questions to myself worth asking regularly (public)
* my heroes (public)
* favorite quotes (public)
...

logic:
======
# everything is a list (e.g. the list of you lists is also a list) - the same template called "list" is used to render a list.
# every list can be:
  * viewed as a list
  * viewed as cards
  * forked (current user gets a copy of the list and can now modify it)
# every item can be:
  * simple card (name and definition)
  * card with sublists (name, definition and a sublist of examples)
  * link (link to another list or an outbound link)
# users can suggest items to be added to lists (and list ownerd can approve, edit or disapprove)

data structure:
===============
# users(Meteor.user()) or {}
# list {}
  * _id
  * name
  * description
  * picUrl (if any)
  * parent (if it's a sublist - id of the parentList or if it's a user's default "myLists" list - Meteor.userId())
  * createdBy (userId() of the creator)
  * ownedBy (userId() of the owner)
  * moderators (array with userIds of moderators)
  * contributors (array with userIds of contributors)
  * forkedFrom (_id of the list this list was forked from (if any))
  * privacy ("open", "secret", "private")
  * suggestionsAllowed (true/false)
  * items (array of item objects)
# item {}
  * _id
  * name
  * description
  * picUrl (if any)
  * status ("suggested", "approved", "flagged")
  * sublists (array of ._ids of sublists like "examples" etc.)
  

key session variables indicating app state and key behavior:
====================================================
* user - the active user object. can be {}
* list - the active list object. there is ALWAYS a an active list
* card - the _.id of the active card in this list
* view - "list", "cards" (or something else later?)
* state - "addingNewList", "addingNewItem" etc. used to show modals and manage other behavior (?)

Menu items: (most open in modals)
=================================
* create new list
* fork button (for signed in)
* favorite (for signed in)
* suggest button (?) (for signed in)
* search this list(?)
* search all public lists
* search my lists (for signed in - searching through my and favorited)
* if signed in and it's my list: list settings (rename, openness, delete etc.)

todo:
=====
* on new user login -> create a default list "UserName's Lists" for him/her
* backbone router for history and url handling
