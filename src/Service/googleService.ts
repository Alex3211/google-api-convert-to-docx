import fs from 'fs';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { docs_v1, google } from 'googleapis';
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';
const fsp = fs.promises;
import crypto from 'crypto';

/*
--- MORE INFO HERE ---
-- DOCS --
https://developers.google.com/docs/api/how-tos/overview?hl=fr

-- DRIVE --
https://developers.google.com/drive/api/guides/about-sdk?hl=fr
https://developers.google.com/drive/api/quickstart/nodejs?hl=fr
*/

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd() + '/src/GoogleAuthentication', 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd() + '/src/GoogleAuthentication', 'credentials.json');

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



// @ts-ignore
async function SetUpDocumentRequests(docId, Docs: docs_v1.Docs, documentRequests: docs_v1.Schema$BatchUpdateDocumentRequest) {
  console.dir(documentRequests)
  const sectionNumber = 1; // 1 is the first section.

  // @ts-ignore
  const obj = (await Docs.documents.get({ documentId: docId, fields: "body(content(sectionBreak,startIndex,endIndex))" })).data.body.content;
  // @ts-ignore
  const section = obj[sectionNumber - 1];
  if (!section) {
    throw new Error(`No section of ${sectionNumber} is not found.`);
  }
  const { startIndex, endIndex } = section;
  if (documentRequests.requests?.length) documentRequests.requests = documentRequests.requests.map(req => {
    // @ts-ignore
    req.updateSectionStyle?.range = { startIndex: startIndex || 0, endIndex };
    return req;
  });
  await Docs.documents.batchUpdate({ documentId: docId, requestBody: documentRequests }, docId);
}

/**
 * Prints the title of a sample doc:
 * https://docs.google.com/document/d/195j9eDD3ccgjQRttHhJPymLJUCOUjs-jmwTrekvdjFE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth 2.0 client.
 */
async function Startup(auth: any, file: string, documentRequests: docs_v1.Schema$BatchUpdateDocumentRequest) {
  const docs = google.docs({ version: 'v1', auth });
  const drive = google.drive({
    version: 'v3',
    auth: auth
  });

  const creation = await drive.files.create({
    requestBody: {
      parents: [`${process.env.FOLDER_ID}`],
      name: crypto.randomBytes(3 * 4).toString('base64'),
      mimeType: 'application/vnd.google-apps.document'
    },
    media: {
      mimeType: 'text/html',
      body: file
    }
  });
  console.log('CREATED GDRIVE')
  if (documentRequests !== undefined) await SetUpDocumentRequests(creation.data.id, docs, documentRequests);

  // Mandatory because update trigger the conversion at google
  const update = await drive.files.update(
    {// @ts-ignore
      fileId: creation.data.id,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileExtension: ".docx"
    });
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

  await fsp.writeFile(process.cwd() + '/archive/last-document.docx', buffer); // DEBUG
  console.log('SAVED LOCALLY')

  await drive.files.delete(
    { // @ts-ignore
      fileId: creation.data.id,
    }
  )
  console.log('DELETED GDRIVE')
  return buffer;
}

export const ConvertHtmlToDocx =
  async (file: string, documentRequests: docs_v1.Schema$BatchUpdateDocumentRequest) =>
    await authorize(file)
      .then(
        (e) => Startup(e, file, documentRequests)
      ).catch(console.error);