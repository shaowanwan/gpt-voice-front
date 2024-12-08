'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

export default function Chat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'What can I help you?' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const audioRef = useRef(null);
    const [audioLoading, setAudioLoading] = useState(false);
    const [currentAudioPath, setCurrentAudioPath] = useState(null);
    const API_BASE_URL = 'http://192.168.2.110:5001';

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
            console.error('音频播放失败:', err);
        } finally {
            setAudioLoading(false);
        }
    };

    // 监听音频错误
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleError = (e) => {
                console.error('音频错误:', e);
                setAudioLoading(false);
            };

            audio.addEventListener('error', handleError);
            return () => audio.removeEventListener('error', handleError);
        }
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        // 添加用户消息到聊天记录
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/gpt`, {
                prompt: newMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n'),
            });

            // 添加助手消息到聊天记录
            const assistantMessage = {
                role: 'assistant',
                content: res.data.response,
                audioPath: res.data.audio_path
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
                content: '请求失败，请检查后端是否正常运行。'
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
        <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
            <h1>GPT 实时聊天</h1>
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
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                {msg.role === 'user' ? '用户' : 'GPT'}
                            </div>
                            <div style={{ wordBreak: 'break-word' }}>{msg.content}</div>
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
                                    {audioLoading && currentAudioPath === msg.audioPath ? '加载中...' : '播放音频'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息... (按Enter发送)"
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
                    {loading ? '发送中...' : '发送'}
                </button>
            </div>
            <audio
                ref={audioRef}
                style={{ display: 'none' }}
                controls
                preload="auto"
            />
        </div>
    );
}