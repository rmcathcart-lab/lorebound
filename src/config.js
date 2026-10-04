/* Deployment settings. `backend` is the Apps Script web-app URL of the teacher's Lorebound Ledger (see backend/Code.gs). Leave empty to play offline. */
var LORE_CONFIG = {
  backend: 'https://script.google.com/macros/s/AKfycbzrbCgf_67q8TvU42eqYb8DEzhpZmC83OmNfv91rX-yDSkYRJ-9uxiP4QnDEfu3kiQg4Q/exec',
  // the web app is open to Anyone (it runs as the teacher, writes to the teacher's sheet, and only accepts the class codes listed in the ledger)
  backendNeedsLogin: false, schoolName: 'Rocky View Schools'
};
