import { useEffect, useRef, useState } from 'react'
import jwt_decode from 'jwt-decode';

const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
});

const SRC_GSI_CLIENT = 'https://accounts.google.com/gsi/client';
const SRC_GAPI_CLIENT = 'https://apis.google.com/js/api.js';
const CLIENT_ID = '346528863504-v1dbcc72bordt67kh10fmmi66uqo6tv7.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAlEePAH2FvVrauSWO1vV1dj5dqgXQuHbg';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const SHEET_ID = '18szWoTN940LrwUmRw3PSlUeD-EK7tVwsA026u7Z7sQE';



/*global google*/
const GoogleAuth = ({ onLogin, onLogout }: any) => {

    const [user, setUser] = useState(null);
    const googleButton = useRef(null);

    const initGsi = async () => {
        try {
            await loadScript(SRC_GSI_CLIENT);
            google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: (response) => {
                    console.log("Encoded JWT ID token: " + response.credential);
                    const token = jwt_decode<any>(response.credential);
                    setUser(token);
                    onLogin(token);
                },
            });
            google.accounts.id.renderButton(googleButton.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large'
            });
        } catch (error) {
            console.error(error);
        }
    }

    const initGapi = async () => {
        try {
            await loadScript(SRC_GAPI_CLIENT)
            gapi.load('client', async () => {
                await gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
            });
        } catch (error) {
            console.error(error);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { Promise.all([initGsi(), initGapi()]); }, []);

    // return () => [SRC_GSI_CLIENT, SRC_GAPI_CLIENT]
    // .map(src => document.querySelector(`script[src="${src}"]`))
    // .filter(tag => tag)
    // .forEach(tag => document.removeChild(tag!));

    return (
        <>
            <div ref={googleButton} hidden={!!user}></div>
            {user && <button onClick={() => { setUser(null); onLogout() }}>Logout</button>}
        </>
    );
}

export default GoogleAuth