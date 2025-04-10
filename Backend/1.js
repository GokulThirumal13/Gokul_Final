const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ = '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';
const ELEVENLABS = 'sk_1f4681f57de90c6cc6cc95f1bb9420241d409c7b50efacdb';
const LLAMAMODEL = 'llama-3.1-8b-instant';

const groq = new Groq({ apiKey: GROQ });
const audioDir = path.join(__dirname, 'audio');

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);


app.post('/generate-story', async (req, res) => {
    const { prompt, category } = req.body;
    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const voiceId = req.body.voiceId ;


    try {
        const story = await getLlamaResponse(prompt);
        if (!story) {
            return res.status(500).json({ error: 'Failed to generate story' });
        }

        const audioFilename = `audio_${Date.now()}.mp3`;
        const audioUrl = await convertTextToSpeech(story, audioFilename, voiceId);
        if (!audioUrl) {
            return res.status(500).json({ error: 'Failed to generate audio' });
        }

        res.json({ story, audioUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

async function getLlamaResponse(prompt) {
    try {
        const response = await groq.chat.completions.create({
            model: LLAMAMODEL,
            messages: [
                { role: "system", content: "You're an AI story teller. Response should be in JSON format: { \"story\": \"\" }" },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" }
        });

        const responseData = response.choices[0]?.message?.content;
        if (!responseData) {
            console.error("Empty response from Groq API:", response);
            return null;
        }
        const Response = JSON.parse(responseData);
        return Response.story || null;
    } catch (error) {
        console.error("Error in getLlamaResponse:", error);
        return null;
    }
}

async function convertTextToSpeech(text, filename, voiceId) {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS,
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const filePath = path.join(audioDir, filename);
        fs.writeFileSync(filePath, Buffer.from(audioBuffer));

        return `http://192.168.1.26:3000/audio/${filename}`;
    } catch (error) {
        console.error('Error in convertTextToSpeech:', error);
        return null;
    }
}

app.get('/audio/:filename', (req, res) => {
    const filePath = path.join(audioDir, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Audio file not found" });
    }

    res.sendFile(filePath);
});



const ELEVENLABS_API_KEY = ELEVENLABS;

fetch('https://api.elevenlabs.io/v1/voices', {
    method: 'GET',
    headers: {
        'xi-api-key': ELEVENLABS_API_KEY
    }
})
.then(res => res.json())
.then(data => {
    console.log(data.voices); 
})
.catch(err => console.error(err));


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
