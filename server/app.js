const express = require('express');
const Tesseract = require('tesseract.js');
const bodyParser = require('body-parser');
const multer = require('multer');
const OpenAI = require('openai');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { google } = require("googleapis");
const keys = require('./credentials.json');

dotenv.config();

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Define a route to handle file upload and perform OCR
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Perform OCR using Tesseract to extract text from the image
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng', {
            tessjs_create_pdf: '1',
            pdf_name: 'output',
        });

        console.log('Text extracted:', text);

        // Make a POST request to the /process route with the extracted text as input
        const processResponse = await fetch('http://localhost:3000/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text }) // Pass the extracted text as input
        });

        if (!processResponse.ok) {
            throw new Error('Error processing text');
        }

        // Assuming response from /process route is JSON
        const responseData = await processResponse.json();
        console.log('Response from /process route:', responseData);

        // Respond to the client with the processed result
        res.json({ success: true, result: responseData });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image' });
    }
});

// Define a route to handle processing of the uploaded text
app.post('/process', async (req, res) => {

    try {
        console.log(req.body.text)
        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
        });

        // Process the uploaded text using OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "system",
                    "content": "task:parse into JSON format: companyName, roleName, jobDesc"
                },
                {
                    "role": "user",
                    "content": req.body.text // Assuming you're sending the user input as 'text' in the request body
                }
            ],
            temperature: 0,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        // Convert response to JSON string
        const text = JSON.stringify(response);
        const processResponse = await fetch('http://localhost:3000/sheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text }) // Pass the extracted text as input
        });
        
    } catch (error) {
        console.error('Error processing chat completion:', error);
        res.status(500).json({ error: 'Error processing chat completion' });
    }
});

app.post("/sheets", async (req, res) => {
    try {
        const data = JSON.parse(req.body.text)
        const content = JSON.parse(data.choices[0].message.content);
        const companyName = content.companyName
        const roleName = content.roleName
        const jobDesc = content.jobDesc

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
        const sheetName = req.body.sheetName || metaData.data.sheets[0].properties.title;

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${sheetName}!A:B`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[companyName, roleName, jobDesc]],
            },
        });

        res.send(metaData);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
