idea:
=====
Simple & mobile friendly webapp for memorizing and keeping track anything:
* create unordered lists
* every list can be viewed as a list or as a set of cards presented to you in random order
* every card can have some data on one side and some data on the other side (so that you can get a card, try to remember and then flip it over and check if you remembered correctly)

usage:
======
I would create lists for:
* marketing keywords with russian translations and examples (public)
* startup ideas (private)
* crazy words for barinstorms (secret)
* questions to myself worth asking regularly (public)
* my heroes (public)
* favorite quotes (public)
...

logic:
======
* everything is a list (e.g. the list of you lists is also a list) - the same template called "list" is used to render a list.
* every list can be:
** viewed as a list
** viewed as cards
** forked (current user gets a copy of the list and can now modify it)
* every item can be:
** simple card (name and definition)
** card with sublists (name, definition and a sublist of examples)
** link (link to another list or an outbound link)
* users can suggest items to be added to lists (and list ownerd can approve, edit or disapprove)

data structure:
===============
* users (Meteor.users)
* list {}
** _id
** metadata {} (all the stuff like owner, moderators, openness(private, secret, public), parentCard etc. goes here)
** name
** descritption (optional)
** cards [] (array of cards. each card is an abject. each card has to have at least "_id" and "name" properties

key variables indicating app state and key behavior:
====================================================
* currentList - the _.id of the active list. there is ALWAYS a an active list
* currentCard - the _.id of the active card in this list
* currentView - "list", "cards" (or something else later?)

todo:
=====
* create the base list template: iterating through list items & top sticky menu with:
** list.name
** fork button (for signed in)
** favorite (for signed in)
** suggest button (?) (for signed in)
** search this list(?)
** search all public lists

