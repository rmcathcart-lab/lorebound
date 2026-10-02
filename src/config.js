/* Deployment settings. `backend` is the Apps Script web-app URL of the teacher's Lorebound Ledger (see backend/Code.gs). Leave empty to play offline. */
var LORE_CONFIG = {
  backend: 'https://script.google.com/a/macros/rvschools.ab.ca/s/AKfycbzrbCgf_67q8TvU42eqYb8DEzhpZmC83OmNfv91rX-yDSkYRJ-9uxiP4QnDEfu3kiQg4Q/exec',
  // the ledger is restricted to the school's Google Workspace: the browser must be signed in to a school Google account
  backendNeedsLogin: true, schoolName: 'Rocky View Schools'
};
