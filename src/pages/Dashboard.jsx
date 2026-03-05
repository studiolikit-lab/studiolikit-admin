import React, { useState, useEffect } from 'react';
import { PlayCircle, Trash2, Edit, Loader2 } from 'lucide-react';
import { db } from "../firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";

const Dashboard = () => {
    const [myVideos, setMyVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const videoList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMyVideos(videoList);
        } catch (error) {
            console.error("Error fetching videos: ", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("정말로 이 영상을 삭제하시겠습니까?")) {
            try {
                await deleteDoc(doc(db, "videos", id));
                setMyVideos(myVideos.filter(video => video.id !== id));
                alert("삭제되었습니다.");
            } catch (error) {
                console.error("Error deleting video: ", error);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Video Dashboard</h1>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={48} color="#6366f1" />
                </div>
            ) : myVideos.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#64748b' }}>등록된 영상이 없습니다. 영상을 먼저 업로드해 주세요!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {myVideos.map((video) => (
                        <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '1.25rem' }}>
                                <h3 style={{ marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {video.title}
                                </h3>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.875rem',
                                    marginBottom: '1rem',
                                    height: '2.5rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {video.description}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="submit-btn"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                                    >
                                        <PlayCircle size={16} /> Link
                                    </a>
                                    <button style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer' }}>
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(video.id)}
                                        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer', color: '#ef4444' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
