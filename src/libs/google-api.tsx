import jwt_decode from 'jwt-decode';

const SRC_GSI_CLIENT = 'https://accounts.google.com/gsi/client';
const SRC_GAPI_CLIENT = 'https://apis.google.com/js/api.js';
const CLIENT_ID = '346528863504-v1dbcc72bordt67kh10fmmi66uqo6tv7.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAlEePAH2FvVrauSWO1vV1dj5dqgXQuHbg';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SHEET_ID = '18szWoTN940LrwUmRw3PSlUeD-EK7tVwsA026u7Z7sQE'; // should be rather provided outside

// const self = {
//     tokenClient: { callback: (resp: any) => { } },
//     user: {},
//     onLoginCallback: () => { }
// };

const self: {
    tokenClient: any,
    user: any,
    onLoginCallback: () => void
} = {
    tokenClient: { callback: (resp: any) => { } },
    user: {},
    onLoginCallback: () => { }
};

const _loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
});

const _initGsi = async (buttonContainer: HTMLElement | null) => {
    try {
        await _loadScript(SRC_GSI_CLIENT);
        self.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: () => { }
        });
        // google.accounts.id.initialize({
        //     client_id: CLIENT_ID,
        //     callback: (response) => {
        //         const user = jwt_decode<any>(response.credential);
        //         _user = user;
        //         _onLoginCallback(user);
        //     },
        // });
        // google.accounts.id.renderButton(buttonContainer, {
        //     type: 'standard',
        //     theme: 'outline',
        //     size: 'large'
        // });
        return google;
    } catch (error) {
        console.error(error);
    }
}

const _initGapi = async () => {
    try {
        await _loadScript(SRC_GAPI_CLIENT)
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
        });
        return gapi;
    } catch (error) {
        console.error(error);
    }
}

const googleapi = {

    init: (buttonContainer: HTMLElement | null) => Promise.all([_initGsi(buttonContainer), _initGapi()]),

    destory: () => [SRC_GSI_CLIENT, SRC_GAPI_CLIENT]
        .map(src => document.querySelector(`script[src="${src}"]`))
        .filter(tag => tag)
        .forEach(tag => document.removeChild(tag!)),

    // setOnLoginCallback: (onLogin: ((user: any) => void)) => {
    //     _onLoginCallback = onLogin;
    // },

    setOnLoginCallback: (onLogin: ((user: any) => void)) => {
        self.tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            // document.getElementById('signout_button').style.visibility = 'visible';
            // document.getElementById('authorize_button').innerText = 'Refresh';
            // await listMajors();
        };
    },

    authenticate: (onLogin: ((user: any) => void)) => {
        self.tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            // document.getElementById('signout_button').style.visibility = 'visible';
            // document.getElementById('authorize_button').innerText = 'Refresh';
            await googleapi.listMajors();
            onLogin(gapi.client.getToken());
        };
        if (gapi && gapi.client && gapi.client.getToken()) {
            console.log('prompt: ');
            // Skip display of account chooser and consent dialog for an existing session.
            self.tokenClient.requestAccessToken({ prompt: '' });
        } else {
            console.log('prompt: consent');
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            self.tokenClient.requestAccessToken({ prompt: 'consent' });
        }
    },

    isAuthenticated: () => !!self.user,

    getUser: () => self.user,

    listMajors: async () => {
        let response;
        try {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: '2023-02',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [
                        ['a', 'b', 'c']
                    ]
                },
            })
            response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: '2023-02!A1:Z1000',
            });
        } catch (err) {
            // document.getElementById('content').innerText = err.message;
            return;
        }
        const range = response.result;
        if (!range || !range.values || range.values.length == 0) {
            // document.getElementById('content').innerText = 'No values found.';
            return;
        }
        // Flatten to string to display
        const output = range.values.reduce((str: any, row: any[]) => `${str}${row[0]}, ${row[4]}\n`, 'Name, Major:\n');
        console.log(output)
        // document.getElementById('content').innerText = output;
    }
}

export default googleapi;

