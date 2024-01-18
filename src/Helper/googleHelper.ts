import fs from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
const fsp = fs.promises;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fsp.readFile(TOKEN_PATH);
    const credentials = JSON.parse(<any>content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: JSONClient | null) {
  const content = await fsp.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(<any>content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client?.credentials.refresh_token,
  });
  await fsp.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize(file: string) {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = <JSONClient>await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return { client, file };
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
async function Startup(auth: any, file: string) {
  const docs = google.docs({ version: 'v1', auth });
  // const body = fs.createReadStream('index.html');
  const drive = google.drive({
    version: 'v3',
    auth: auth
  });

  // todo -> GUID
  const creation = await drive.files.create({
    requestBody: {
      name: 'testDoc',
      mimeType: 'application/vnd.google-apps.document'
    },
    media: {
      mimeType: 'text/html',
      body: file
    }
  });
  console.log('CREATED GDRIVE')
  console.log(creation.data)

  // Mandatory because update trigger the conversion at google
  const update = await drive.files.update(
    {// @ts-ignore
      fileId: creation.data.id,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileExtension: ".docx"
    });
  // console.log(update)
  console.log('UPDATE')

  const data = await drive.files.export(
    {// @ts-ignore
      fileId: creation.data.id,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    { responseType: 'blob' }
  )
  const buffer = Buffer.from(
    // @ts-ignore
    await data.data.arrayBuffer()
  )
  // await fsp.writeFile(process.cwd() + '/testDoc.docx', buffer);
  console.log('SAVED LOCALLY')

  await drive.files.delete(
    { // @ts-ignore
      fileId: creation.data.id,
    }
  )
  console.log('DELETED GDRIVE')
  return buffer;
}


export const ConvertHtmlToDocx = async (file: string) => await authorize(file).then((e) => Startup(e, file)).catch(console.error);