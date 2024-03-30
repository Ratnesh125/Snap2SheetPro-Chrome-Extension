const express = require('express');
const Tesseract = require('tesseract.js');
const multer = require('multer');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const { google } = require("googleapis");

dotenv.config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_CRED = process.env.GOOGLE_CRED;
const keys = JSON.parse(GOOGLE_CRED);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("API working")
})

app.post('/upload', upload.single('image'), async (req, res) => {
    
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
    const response = await openAIResponse(text)
    const sheetsResponse = await sheets(response);
    
    res.send(sheetsResponse);
});

async function sheets(response) {
    try {
        const message = response.choices[0].message.content;
        const content = JSON.parse(message);
        const companyName = content.companyName || "null";
        const roleName = content.roleName || "null";
        const jobDesc = content.jobDesc || "null";

        const auth = new google.auth.GoogleAuth({
            credentials: keys,
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        // Instance of Google Sheets API
        const googleSheets = google.sheets({ version: "v4", auth });

        const spreadsheetId = "1067rvJJMeJdsycy7qUZ3hCZowJnnjGTCF2xCRDHLC6s";

        const metaData = await googleSheets.spreadsheets.get({
            spreadsheetId,
        });

        // Write row(s) to spreadsheet
        const sheetName = metaData.data.sheets[0].properties.title;

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:B`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[companyName, roleName, jobDesc]],
            },
        });

        return "Data appended successfully to Google Sheets.";
    } catch (error) {
        console.error("Error occurred while appending data to Google Sheets:", error);
        return "Failed to append data to Google Sheets.";
    }
}

async function openAIResponse(text) {
    try {
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": "task:parse into JSON format: companyName, roleName, jobDesc"
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            temperature: 0,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        return response;
    } catch (error) {
        console.error("Error occurred while communicating with OpenAI:", error);
        return null;
    }
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
