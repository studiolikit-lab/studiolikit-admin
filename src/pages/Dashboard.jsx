import React from 'react';
import { PlayCircle, Trash2, Edit } from 'lucide-react';

const Dashboard = () => {
    // Mock data for UI demonstration
    const mockVideos = [
        { id: 1, title: 'Sample Video 1', description: 'This is a description', url: 'https://youtube.com/...', thumbnail: 'https://via.placeholder.com/150' },
        { id: 2, title: 'Sample Video 2', description: 'Another cool video', url: 'https://youtube.com/...', thumbnail: 'https://via.placeholder.com/150' },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Video Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {mockVideos.map((video) => (
                    <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        <div style={{ padding: '1.25rem' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>{video.title}</h3>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>{video.description}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="submit-btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <PlayCircle size={16} /> Link
                                </button>
                                <button style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer' }}>
                                    <Edit size={16} />
                                </button>
                                <button style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', color: '#ef4444' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
