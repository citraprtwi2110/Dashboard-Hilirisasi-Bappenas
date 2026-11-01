import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { RespondentEntry } from './fgdAhp';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If reloaded and user is signed in, we can either re-prompt or notify
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh token akses Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface BackupResult {
  fileId: string;
  name: string;
  webViewLink?: string;
  timestamp: string;
  totalEntries: number;
}

/**
 * Uploads or updates a backup JSON file directly to the user's Google Drive.
 */
export async function backupResponsesToDrive(
  entries: RespondentEntry[],
  userEmail?: string
): Promise<BackupResult> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum masuk dengan akun Google. Silakan masuk terlebih dahulu.');
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Backup_AHP_Hilirisasi_${dateStr}.json`;

  const backupPayload = {
    appName: 'Dasbor AHP Hilirisasi Industri',
    backupEmail: userEmail || auth.currentUser?.email || 'cpcitper@gmail.com',
    backupTime: new Date().toISOString(),
    backupTimeFormatted: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    totalRespondents: entries.length,
    description: 'Cadangan data jawaban kuesioner AHP Hilirisasi 11 Komoditas Strategis Indonesia',
    entries: entries
  };

  const fileContent = JSON.stringify(backupPayload, null, 2);
  const metadata = {
    name: fileName,
    description: `Cadangan data Dasbor AHP Hilirisasi (${entries.length} responden) per ${new Date().toLocaleString('id-ID')}`,
    mimeType: 'application/json'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Drive upload failed:', errorText);
    throw new Error(`Gagal mencadangkan ke Google Drive: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    fileId: result.id,
    name: result.name || fileName,
    webViewLink: result.webViewLink,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    totalEntries: entries.length
  };
}
