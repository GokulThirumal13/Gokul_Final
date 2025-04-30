const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mqtt=require('mqtt');
const mqttClient=mqtt.connect('mqtt://broker.emqx.io');
const app = express();
app.use(cors());
app.use(express.json());

const ngrok_url=process.env.ngrok_url||'https://gar-on-midge.ngrok-free.app'
const GROQ = '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';
const ELEVENLABS = 'sk_519502be5bf2b52e8d2e6fdea46d676c02a656084df82c2b';
const LLAMAMODEL = 'llama-3.1-8b-instant';
const groq = new Groq({ apiKey: GROQ });
mqttClient.on('connect',()=>{
    console.log('Connected to MQTT broker');
})

const audioDir = path.join(__dirname, 'audio');
const imageDir = path.join(__dirname, 'images');
const uploadsDir = path.join(__dirname, 'uploads');

[audioDir, imageDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `speech_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

function getAudioUrl(filename){
    return `${ngrok_url}/audio/${filename}`;
}

function getImageUrl(filename){
    return `${ngrok_url}/images/${filename}`;
}

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }
        const filePath = req.file.path;
        console.log(`Processing audio file at ${filePath}`);
        const fileStream = fs.createReadStream(filePath);
        const transcription = await groq.audio.transcriptions.create({
            file: fileStream,
            model: "whisper-large-v3",
            temperature: 0.5,
            response_format: "verbose_json"
        });
        
        fs.unlinkSync(filePath);
        
        res.json({ 
            success: true, 
            text: transcription.text 
        });
    } catch (error) {
        console.error('Error in transcription:', error);
        res.status(500).json({ 
            error: 'Transcription failed', 
            details: error.message 
        });
    }
});

let lastStory='No story generated yet';
let lastAudioUrl='';

app.post('/generate-story', async (req, res) => {
    let { prompt, category, lang, voiceId, userType } = req.body;
    const age = userType === 'adult' ? 30 : parseInt(req.body.age) || 8; 
    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        console.log(`Generating story for ${userType} (age: ${age}), category: ${category}, language: ${lang}`);
        
        const story = await getLlamaResponse(prompt, lang, age, category);
        if (!story) return res.status(500).json({ error: 'Failed to generate story' });
    
        const audioFilename = `audio_${Date.now()}.mp3`;
        const audioUrl = await convertTextToSpeech(story, audioFilename, voiceId);
        if (!audioUrl) return res.status(500).json({ error: 'Failed to generate audio' });
        const imageUrl = await generateImageFromText(prompt);
        mqttClient.publish('soundbox/commands', story);
        mqttClient.publish('soundbox/status', 'Story sent successfully');
        mqttClient.publish('soundbox/audio', JSON.stringify({
            url: audioUrl,
            imageUrl: imageUrl,
            category: category,
        }));
        lastStory=story;
        lastAudioUrl=audioUrl;
        res.json({ story, audioUrl, imageUrl });
    } catch (error) {
        console.error('Error in /generate-story:', error);
        res.status(500).json({ error: error.message });
    }
});
app.get('/',(req,res)=>{
    const audioPlayer = lastAudioUrl ? `<audio controls><source src="${lastAudioUrl}" type="audio/mp3">Your browser does not support the audio element.</audio>` : '';
    res.send(`
        <h2>API Server is running!</h2>
        <p><strong>Last generated story:</strong></p>
        <p>${lastStory}</p>
        ${audioPlayer}
    `);
})


async function getLlamaResponse(prompt, lang = 'English', age = 8, category = '') {
    try {
        const audienceType = age > 15 ? "young adult" : "children's";
        const systemPrompt = `
You are a creative AI storyteller who writes ${audienceType} stories. Only respond in ${lang.toUpperCase()}.
Do not include any English words unless absolutely necessary.
${age > 15 ? "For young adult audiences, you can include more complex themes, emotions, and challenges appropriate for teens and young adults." : "Keep the content appropriate for children, focusing on simple lessons, wonder, and positive messages."}
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
        const userPrompt = `Category: ${category}. ${prompt}. Please write this story in pure ${lang}. Do not use English.${constraints}`;
        console.log("Sending prompt to LLM:", userPrompt);
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
        try {
            const parsed = JSON.parse(responseData);
            return parsed.story || null;
        } catch (err) {
            console.warn("Direct JSON parse failed, trying to extract JSON:", err);   
            const jsonMatch = responseData.match(/{[\s\S]*}/);
            if (jsonMatch) {
                try {
                    const extracted = JSON.parse(jsonMatch[0]);
                    return extracted.story || null;
                } catch (extractErr) {
                    console.error("Failed to parse extracted JSON:", extractErr);
                   
                    return responseData.replace(/^```json|```$/g, '').trim();
                }
            }
            return responseData;
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
                    speed: 1.0 
                }
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const audioBuffer = await response.arrayBuffer();
        const filePath = path.join(audioDir, filename);
        fs.writeFileSync(filePath, Buffer.from(audioBuffer));
        return getAudioUrl(filename);
    } catch (error) {
        console.error('Error in convertTextToSpeech:', error);
        return null;
    }
}
const CLIPDROP_API_KEY = 'a800c3b0d40cd376f7ff7f0d487920bffb436746407dd3eec8bd9c51991834e88697e0157848d48c4dd5ecdc667dbe5f';
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

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `image_${Date.now()}.jpg`;
        const filePath = path.join(imageDir, filename);
        fs.writeFileSync(filePath, buffer);

        return getImageUrl(filename);
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

app.get('/images/:filename', (req, res) => {
    const filePath = path.join(imageDir, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Image file not found" });
    }

    res.sendFile(filePath);
});

const PORT = process.env.PORT||8084;
app.use('/images', express.static(path.join(__dirname, 'images')));
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Public URL: ${ngrok_url}`);
});