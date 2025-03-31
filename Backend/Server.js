const express = require('express');
const cors = require('cors');
const path = require('path');
const { getLlamaResponse } = require('./1');
const { convertTextToSpeech } = require('./Elevenlabs');

const app = express();
app.use(cors());
app.use(express.json());
app.post('/generate-story', async (req, res) => {
    const{prompt}=req.body;
    if (!prompt||prompt.trim()==='') {
        return res.status(400).json({ error:'Prompt is required' });
    }
    try {
        const story = await getLlamaResponse(prompt);
        if (!story) {
            return res.status(500).json({ error: 'Failed to generate story' });
        }

        const audio = await convertTextToSpeech(story);
        if (!audio) {
            return res.status(500).json({ error: 'Failed to generate audio' });
        }

        res.json({ story, audio });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.use('/output.mp3', express.static(path.join(__dirname, 'output.mp3')));

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});