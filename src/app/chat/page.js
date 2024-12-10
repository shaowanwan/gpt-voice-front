'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [speaker, setSpeaker] = useState(0);
    const [emotion, setEmotion] = useState('Neutral');
    const audioRef = useRef(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [currentAudioPath, setCurrentAudioPath] = useState(null);
    const API_BASE_URL = 'https://gptvoice.model1235.com';

    // 说话人选项
    const speakers = [
        { id: 0, name: 'Geralt' },
        { id: 1, name: 'Cirilla'},
        { id: 2, name: 'Vesemir' },
        { id: 3, name: 'Emhyr' },
    ];

    const playAudio = async (audioPath) => {
        if (!audioPath) return;

        try {
            setAudioLoading(true);
            setCurrentAudioPath(audioPath);

            // 创建完整的音频URL
            const fullAudioUrl = `${API_BASE_URL}/audio/${audioPath}`;

            if (audioRef.current) {
                audioRef.current.src = fullAudioUrl;

                // 等待音频加载完成
                await audioRef.current.load();

                // 播放音频
                const playPromise = audioRef.current.play();
                if (playPromise) {
                    await playPromise;
                }
            }
        } catch (err) {
            console.error('Play audio failed:', err);
        } finally {
            setAudioLoading(false);
        }
    };

    // 监听音频错误
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleError = (e) => {
                console.error('Audio error:', e);
                setAudioLoading(false);
            };

            audio.addEventListener('error', handleError);
            return () => audio.removeEventListener('error', handleError);
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const currentSpeakerName = speakers[Number(speaker)].name;

        // 添加用户消息到聊天记录
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/gpt`, {
                prompt: newMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n'),
                speaker: speaker,
                emotion: emotion
            });

            // 添加助手消息到聊天记录，包含当前的说话人名字
            const assistantMessage = {
                role: 'assistant',
                content: res.data.response,
                audioPath: res.data.audio_path,
                speakerName: currentSpeakerName  // 保存当前的说话人名字
            };
            setMessages([...newMessages, assistantMessage]);

            // 播放音频
            if (res.data.audio_path) {
                await playAudio(res.data.audio_path);
            }

        } catch (err) {
            console.error('Error:', err);
            const errorMessage = {
                role: 'assistant',
                content: 'Fail',
                speakerName: currentSpeakerName
            };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto'}}>
            <div style={{
                marginBottom: '24px',
                padding: '24px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: '#2c3e50',
                    borderBottom: '2px solid #3498db',
                    paddingBottom: '8px'
                }}>Emotional ChatBot</h2>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#34495e',
                    marginBottom: '16px',
                    fontStyle: 'italic'
                }}>A Constructive Approach in Video Games</p>

                <ul style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '16px 0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    {['Liang Shaowan', 'Xie Yinzhi', 'Yi Sheng', 'Lu Jing', 'Shen Phillip'].map(name => (
                        <li style={{
                            padding: '4px 12px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '16px',
                            color: '#1976d2',
                            fontSize: '0.95rem'
                        }}>{name}</li>
                    ))}
                </ul>

                <div style={{
                    marginTop: '16px',
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e3e3e3'
                }}>
                    <strong style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#2c3e50',
                        fontSize: '1.1rem'
                    }}>Description:</strong>
                    <p style={{
                        lineHeight: '1.6',
                        color: '#34495e',
                        fontSize: '0.95rem'
                    }}>This project enables users to type text, which is analyzed by an emotion detection model to identify one of five emotions: Angry, Happy, Sad, Neutral, or Surprise. Based on the detected emotion, a TTS system generates an emotionally aligned voice response. Users can also select from multiple speakers, each with distinct voices and tones, for a personalized, engaging experience. Perfect for gaming, virtual assistants, and storytelling applications.</p>
                </div>
            </div>

            {/* 控制面板 */}
            <div style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                display: 'flex',
                gap: '20px'
            }}>
                <div>
                    <label style={{marginRight: '10px'}}>Speaker：</label>
                    <select
                        value={speaker}
                        onChange={(e) => setSpeaker(Number(e.target.value))}
                        style={{
                            padding: '5px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    >
                        {speakers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div
                style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '20px',
                    height: '500px',
                    overflowY: 'auto',
                    marginBottom: '20px',
                    backgroundColor: '#f8f9fa',
                }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '15px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '70%',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: msg.role === 'user' ? '#007bff' : '#ffffff',
                                color: msg.role === 'user' ? '#fff' : '#000',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            }}
                        >
                            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>
                                {msg.role === 'user' ? 'User' : msg.speakerName}
                            </div>
                            <div style={{wordBreak: 'break-word'}}>{msg.content}</div>
                            {msg.audioPath && (
                                <button
                                    onClick={() => playAudio(msg.audioPath)}
                                    disabled={audioLoading && currentAudioPath === msg.audioPath}
                                    style={{
                                        marginTop: '8px',
                                        padding: '4px 8px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: msg.role === 'user' ? '#fff' : '#007bff',
                                        opacity: audioLoading && currentAudioPath === msg.audioPath ? 0.6 : 1,
                                    }}
                                >
                                    {audioLoading && currentAudioPath === msg.audioPath ? 'Loading...' : 'Play'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type... (Press Enter To Send)"
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                    }}
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: loading ? '#ccc' : '#007bff',
                        color: '#fff',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        transition: 'background-color 0.3s',
                    }}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
            <audio
                ref={audioRef}
                style={{display: 'none'}}
                controls
                preload="auto"
            />
        </div>
    );
}