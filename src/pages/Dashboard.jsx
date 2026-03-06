import React, { useState, useEffect } from 'react';
import { PlayCircle, Trash2, Edit, Loader2, X } from 'lucide-react';
import { db } from "../firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

const Dashboard = () => {
    const [myVideos, setMyVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Categories for Tabs
            const catQ = query(collection(db, "categories"), orderBy("order", "asc"));
            const catSnapshot = await getDocs(catQ);
            const catList = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(catList);

            // Fetch Videos
            const vidQ = query(collection(db, "videos"), orderBy("createdAt", "desc"));
            const vidSnapshot = await getDocs(vidQ);
            const vidList = vidSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMyVideos(vidList);

        } catch (error) {
            console.error("Error fetching data: ", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    const handleEditClick = (video) => {
        setEditingVideo({ ...video });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const videoRef = doc(db, "videos", editingVideo.id);
            const { id, ...updateData } = editingVideo;
            await updateDoc(videoRef, updateData);

            setMyVideos(myVideos.map(v => v.id === id ? editingVideo : v));
            setIsEditModalOpen(false);
            alert("수정되었습니다.");
        } catch (error) {
            console.error("Error updating video: ", error);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    const filteredVideos = selectedCategory === 'all'
        ? myVideos
        : myVideos.filter(video => video.categoryId === selectedCategory);

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Video Dashboard</h1>

            {/* Category Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '2rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <button
                    onClick={() => setSelectedCategory('all')}
                    style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '2rem',
                        border: 'none',
                        background: selectedCategory === 'all' ? '#6366f1' : 'white',
                        color: selectedCategory === 'all' ? 'white' : '#64748b',
                        cursor: 'pointer',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                    }}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: selectedCategory === cat.id ? '#6366f1' : 'white',
                            color: selectedCategory === cat.id ? 'white' : '#64748b',
                            cursor: 'pointer',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={48} color="#6366f1" />
                </div>
            ) : filteredVideos.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#64748b' }}>이 카테고리에 등록된 영상이 없습니다.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                        {video.title}
                                    </h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        background: '#f1f5f9',
                                        padding: '2px 8px',
                                        borderRadius: '1rem',
                                        color: '#64748b',
                                        marginLeft: '0.5rem'
                                    }}>
                                        {categories.find(c => c.id === video.categoryId)?.name || 'Uncategorized'}
                                    </span>
                                </div>
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
                                    <button
                                        onClick={() => handleEditClick(video)}
                                        style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: 'white', cursor: 'pointer' }}
                                    >
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

            {/* Edit Modal */}
            {isEditModalOpen && editingVideo && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1.5rem' }}>영상 정보 수정</h2>
                        <form onSubmit={handleUpdate} className="upload-form">
                            <div className="form-group">
                                <label>YouTube Link</label>
                                <input
                                    type="text"
                                    value={editingVideo.url}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={editingVideo.categoryId}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, categoryId: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%' }}
                                    required
                                >
                                    <option value="" disabled>분류 선택</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="4"
                                    value={editingVideo.description}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn" style={{ marginTop: '1rem' }}>저장하기</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
