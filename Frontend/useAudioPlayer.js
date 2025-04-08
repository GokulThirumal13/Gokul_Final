
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

export default function useAudioPlayer() {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const toggleAudio = async (audioUrl) => {
        try {
            if (sound && currentAudio === audioUrl) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
                return;
            }

            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    newSound.unloadAsync();
                }
            });

            setSound(newSound);
            setIsPlaying(true);
            setCurrentAudio(audioUrl);
        } catch (error) {
            console.error("Audio error:", error);
        }
    };

    return {
        isPlaying,
        currentAudio,
        toggleAudio,
    };
}
