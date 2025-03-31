const express=require('express');
const cors=require('cors');
const fetch=require('node-fetch');
const fs=require('fs');
const path=require('path');
const app=express()
app.use(cors());
app.use(express.json());

PORT=3002;

const api='sk_be5d9504c3b834491da23d73aa3a797172da568129abe043';
const id='21m00Tcm4TlvDq8ikWAM'

async function convertTextToSpeech(text) {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': api
            },
            body: JSON.stringify({
                text: text,
                model_id: "Eleven Multilingual v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8
                }
            })
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }
        const filePath = path.join(__dirname, 'output.mp3');
        const buffer = await response.buffer();
        fs.writeFileSync(filePath, buffer);

        return `http://localhost:3002/output.mp3`;
    } catch (error) {
        console.error("Error in ElevenLabs TTS:", error);
        return null;
    }
}
module.exports={convertTextToSpeech};