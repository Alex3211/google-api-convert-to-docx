# google-api-convert-to-docx
multiple support converting (pdf, html, epub...) to docx with google api (gdrive -> gdoc)

# How to use
`npm i` then `npm run dev`  
  
set up google account https://developers.google.com/drive/api/quickstart/nodejs?hl=fr  
set up google credentials in src/GoogleAuthentication  
Add folder ID in .env  

# Useful doc

-- NODEJS --
https://github.com/googleapis/google-api-nodejs-client
  
-- DOCS --  
https://developers.google.com/docs/api/how-tos/overview?hl=fr  
https://googleapis.dev/nodejs/googleapis/130.0.0/docs/index.html  
  
-- DRIVE --  
https://developers.google.com/drive/api/guides/about-sdk?hl=fr  
  
-- EXAMPLES --
https://github.com/safirmotiwala/google-drive-api-doc-to-pdf-nodejs
  
# Endpoint

| TYPE   | ENDPOINT                            | DESCRIPTION         | BODY                                                                    |
| ------ | ----------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| GET    | `/`  | index.html example page | try it yourself                                                     |
| POST   | `/`  | Convert file to docx | formData {file, options }                                                     |

mimeType -> https://developers.google.com/drive/api/guides/ref-export-formats?hl=fr
to customize request use https://developers.google.com/docs/api/reference/rest/v1/documents/request?hl=fr

# Usage example


This api use `multipart/form-data`

```js
  var formData = new FormData();
  formData.append("file", new File([file], 'filename.' + file.name.split('.').pop(), { type: file.type }));
  formData.append("options", JSON.stringify({
    documentRequest: {
      // DO NOT PUT EMPTY PROPERTIES LIKE THIS
      //     BUT writeControl EXIST, YOU CAN SEE MORE HERE IN THE DOC
      //     https://developers.google.com/docs/api/reference/rest/v1/documents/batchUpdate
      // writeControl: {
      //   requiredRevisionId: "",
      //   targetRevisionId: ""
      // },
      requests: [{
        updateSectionStyle: {
          sectionStyle: {
            marginLeft: { unit: 'PT', magnitude: 0 },
            marginRight: { unit: 'PT', magnitude: 0 },
            marginTop: { unit: 'PT', magnitude: 0 },
            marginBottom: { unit: 'PT', magnitude: 0 }
          },
          fields: 'marginLeft,marginRight,marginTop,marginBottom'
        }
      }],
    }
  }))
  const result = axios.post('http://localhost:3333', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'blob'
  })
```