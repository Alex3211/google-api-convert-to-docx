# google-api-html-to-docx
html to docx convert with google api (gdrive -> gdoc)

# How to use
`npm i` then `npm run dev`  
  
set up google account https://developers.google.com/drive/api/quickstart/nodejs?hl=fr  
set up google credentials in src/GoogleAuthentication  
Add folder ID in .env  

# Useful doc

-- DOCS --  
https://developers.google.com/docs/api/how-tos/overview?hl=fr  
https://googleapis.dev/nodejs/googleapis/130.0.0/docs/index.html  
  
-- DRIVE --  
https://developers.google.com/drive/api/guides/about-sdk?hl=fr  
  
  

| TYPE   | ENDPOINT                            | DESCRIPTION         | BODY                                                                    |
| ------ | ----------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| GET    | `/`  | index.html example page | none                                                     |
| POST   | `/`  | Convert html to docx | {html : string, documentRequest :}                                                     |

to customize request use https://developers.google.com/docs/api/reference/rest/v1/documents/request?hl=fr

# Usage example


This api use `application/x-www-form-urlencoded`

```js
const result = await axios.post(
  'http://localhost:3333',
  {
    html,
    documentRequest: {
      // DO NOT PUT EMPTY PROPERTIES LIKE THIS
      // BUT writeControl EXIST, YOU CAN SEE MORE HERE IN THE DOC
      // https://developers.google.com/docs/api/reference/rest/v1/documents/batchUpdate
      // writeControl: {
      //   requiredRevisionId: "",
      //   targetRevisionId: ""
      // }
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
  },
  {
    // ONLY ON application/x-www-form-urlencoded, FOR THE MOMENT
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    responseType: 'blob'
  }
)
```