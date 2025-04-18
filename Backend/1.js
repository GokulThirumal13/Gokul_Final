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
const ELEVENLABS = 'sk_41ccf69ab0683460123d1ad257d623831bfdcb52a10b18c8';
const LLAMAMODEL = 'llama-3.1-8b-instant';
const groq = new Groq({ apiKey: GROQ });
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
app.post('/generate-story', async (req, res) => {
    let { prompt, category, lang, voiceId } = req.body;

    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        const fullPrompt = `Write a children's story in ${lang}. Category: ${category}. Prompt: ${prompt}`;
        console.log("Full prompt:", fullPrompt);

        const story = await getLlamaResponse(fullPrompt, lang);
        if (!story) return res.status(500).json({ error: 'Failed to generate story' });

        const audioFilename = `audio_${Date.now()}.mp3`;
        const audioUrl = await convertTextToSpeech(story, audioFilename, voiceId);
        if (!audioUrl) return res.status(500).json({ error: 'Failed to generate audio' });

        const imageUrl = await generateImageFromText(prompt); 
        res.json({ story, audioUrl, imageUrl });

    } catch (error) {
        console.error('Error in /generate-story:', error);
        res.status(500).json({ error: error.message });
    }
});


async function getLlamaResponse(prompt, lang = 'English') {
    try {
        const systemPrompt = `
You are a creative AI storyteller. Only respond in ${lang.toUpperCase()}.
Do not include any English words unless absolutely necessary.
If the user requests a specific number of words or lines, you must strictly follow it.
Return your response strictly as a valid JSON object like this: { "story": "..." }.
Do not use markdown, code blocks, or any formatting symbols like \`\`\`.
Only respond with a clean JSON object and valid escaped characters.
`;

let wordLimit = null;
let lineLimit = null;


const wordMatch = prompt.match(/(\d+)\s*words?/i);
const lineMatch = prompt.match(/(\d+)\s*lines?/i);

if (wordMatch) wordLimit = parseInt(wordMatch[1]);
if (lineMatch) lineLimit = parseInt(lineMatch[1]);

let constraints = '';
if (wordLimit) constraints += ` Limit the response strictly to ${wordLimit} words.`;
if (lineLimit) constraints += ` Limit the story strictly to ${lineLimit} lines.`;

const userPrompt = `${prompt}. Please write this story in pure ${lang}. Do not use English.${constraints}`;


        const response = await groq.chat.completions.create({
            model: LLAMAMODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.5,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" }
        });

        let responseData = response.choices[0]?.message?.content;

        console.log("LLM raw response:", responseData);

        if (!responseData) {
            console.error("Empty response from Groq API:", response);
            return null;
        }

        const jsonMatch = responseData.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            console.error("Failed to extract JSON from response:", responseData);
            return null;
        }

        try {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.story || null;
        } catch (err) {
            console.error("Failed to parse JSON:", err, "\nRaw response:", responseData);
            return null;
        }

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
            body: JSON.stringify({
                text,
                voice_settings: {
                    speed: 0.9 
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const filePath = path.join(audioDir, filename);
        fs.writeFileSync(filePath, Buffer.from(audioBuffer));

        return `http://192.168.1.27:3000/audio/${filename}`;
    } catch (error) {
        console.error('Error in convertTextToSpeech:', error);
        return null;
    }
}


const CLIPDROP_API_KEY = 'a800c3b0d40cd376f7ff7f0d487920bffb436746407dd3eec8bd9c51991834e88697e0157848d48c4dd5ecdc667dbe5f';
const imageDir = path.join(__dirname, 'images');
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir);
async function generateImageFromText(promptText) {
    try {
        const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
            method: 'POST',
            headers: {
                'x-api-key': CLIPDROP_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: promptText })
        });

        if (!response.ok) {
            throw new Error(`Image generation failed: ${response.statusText}`);
        }

        const buffer = await response.buffer();
        const filename = `image_${Date.now()}.jpg`;
        const filePath = path.join(imageDir, filename);
        fs.writeFileSync(filePath, buffer);

        return `http://192.168.1.27:3000/images/${filename}`;
    } catch (err) {
        console.error("Image generation error:", err);
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
    console.log("Available ElevenLabs voices:", data.voices);
})
.catch(err => console.error(err));

const PORT = 3000;
app.use('/images', express.static(path.join(__dirname, 'images')));
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
