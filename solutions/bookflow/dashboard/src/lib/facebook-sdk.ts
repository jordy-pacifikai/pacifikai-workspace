/**
 * Facebook Login SDK — lazy loader + OAuth helper.
 * Loads the JS SDK on demand and exposes a login popup.
 */

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options?: { scope?: string; auth_type?: string; return_scopes?: boolean },
      ) => void;
      getLoginStatus: (callback: (response: FacebookLoginResponse) => void) => void;
    };
  }
}

interface FacebookLoginResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    grantedScopes?: string;
  };
}

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';
const FB_VERSION = 'v22.0';

let sdkReady: Promise<void> | null = null;

/**
 * Load the Facebook JS SDK (idempotent).
 */
export function loadFacebookSDK(): Promise<void> {
  if (sdkReady) return sdkReady;

  sdkReady = new Promise<void>((resolve) => {
    // Already loaded and initialized
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = () => {
      window.FB!.init({
        appId: FB_APP_ID,
        cookie: true,
        xfbml: false,
        version: FB_VERSION,
      });
      resolve();
    };

    // Inject SDK script (only once)
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = `https://connect.facebook.net/fr_FR/sdk.js`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        sdkReady = null;
        resolve(); // resolve anyway so the error surfaces at FB.login
      };
      document.head.appendChild(script);
    } else {
      // Script tag exists but SDK not ready yet — wait for fbAsyncInit
      // If FB loaded but fbAsyncInit was already called, init manually
      const checkInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkInterval);
          window.FB.init({
            appId: FB_APP_ID,
            cookie: true,
            xfbml: false,
            version: FB_VERSION,
          });
          resolve();
        }
      }, 100);
      // Timeout after 10s
      setTimeout(() => {
        clearInterval(checkInterval);
        sdkReady = null;
        resolve();
      }, 10000);
    }
  });

  return sdkReady;
}

/**
 * Launch Facebook Login popup and return the short-lived user access token.
 * The server will exchange this for a permanent Page Access Token.
 */
export async function loginWithFacebook(): Promise<{
  accessToken: string;
  userID: string;
}> {
  await loadFacebookSDK();

  if (!window.FB) {
    throw new Error(
      'Le SDK Facebook n\'a pas pu se charger. Désactive le bloqueur de pubs / Brave Shield pour ce site, puis réessaie.',
    );
  }

  return new Promise((resolve, reject) => {
    window.FB!.login(
      (response) => {
        if (response.status === 'connected' && response.authResponse) {
          resolve({
            accessToken: response.authResponse.accessToken,
            userID: response.authResponse.userID,
          });
        } else {
          reject(new Error('Facebook login cancelled or failed'));
        }
      },
      {
        scope: [
          'pages_show_list',
          'pages_manage_metadata',
          'pages_messaging',
          'instagram_manage_messages',
          'public_profile',
        ].join(','),
        auth_type: 'rerequest',
        return_scopes: true,
      },
    );
  });
}
