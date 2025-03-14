/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = 'CLIENT_ID';
const API_KEY = 'API_KEY';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function enableButtons() {
  if (gisInited) {
    document.getElementById('auth').hidden = false;
  }
}

/**
* Callback after api.js is loaded.
*/
async function gapiLoaded() {
  await gapi.load('client', initializeGapiClient);
}

/**
* Callback after the API client is loaded. Loads the
* discovery doc to initialize the API.
*/
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
}

/**
* Callback after Google Identity Services are loaded.
*/
function gisAgendamentoLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    callback: '', // defined later
  });
  gisInited = true;
  enableButtons();
}

/**
* Callback after Google Identity Services are loaded.
*/
function gisPainelLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
    callback: '', // defined later
  });
  gisInited = true;
  enableButtons();
}

/**
*  Sign in the user upon button click.
*/
function handleAuthorize(resolve, reject, onLogin){
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      reject(resp);
    }
    
    onLogin();
    
    window.localStorage.setItem("agendamentos_access_token", gapi.client.getToken().access_token);
    resolve();
  };
  
  tokenClient.error_callback = async (err) => {
    reject(err);
  }
  
  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick(painel) {
  const token = gapi.client.getToken();
  if (token !== null) {
    localStorage.removeItem("agendamentos_access_token");
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('signout_button').hidden = true;
    document.getElementById('authorize_button').hidden = false;
    if (painel) document.getElementById("paginaPainel").hidden = true;
    if (!painel) document.getElementById("content").hidden = true;
  }
}
