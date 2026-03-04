import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// 1. 유튜브 URL에서 ID 추출하는 함수
const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// 2. 데이터 저장 함수
const saveVideo = async (url, title, description, customThumb) => {
    const videoId = getYoutubeId(url);

    if (!videoId) {
        alert("올바른 유튜브 주소를 입력해주세요!");
        return;
    }

    try {
        await addDoc(collection(db, "videos"), {
            url: url,
            youtubeId: videoId,
            title: title || "제목 없음",
            description: description || "",
            // 수동 썸네일이 없으면 유튜브 기본 고화질 썸네일 사용
            thumbnailUrl: customThumb || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            createdAt: serverTimestamp(),
        });
        alert("성공적으로 등록되었습니다!");
    } catch (e) {
        console.error("Error adding document: ", e);
    }
};


const UploadPage = () => {
    const [formData, setFormData] = useState({
        url: '',
        description: '',
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submit:', { ...formData, thumbnail });
        // Firebase logic will be added here
        saveVideo(formData.url, formData.title, formData.description, preview);
        alert('Submit clicked! Firebase integration coming soon.');
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Upload New Video</h1>
            <div className="card">
                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>YouTube Link</label>
                        <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            rows="4"
                            placeholder="Tell about this video..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Thumbnail Image</label>
                        <div
                            style={{
                                border: '2px dashed #e2e8f0',
                                borderRadius: '0.5rem',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            {preview ? (
                                <div style={{ position: 'relative' }}>
                                    <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '0.5rem' }} />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreview(null);
                                            setThumbnail(null);
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            padding: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                                    <p style={{ color: '#64748b' }}>Click or drag thumbnail here</p>
                                </>
                            )}
                            <input
                                id="fileInput"
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">Upload Video</button>
                </form>
            </div>
        </div>
    );
};

export default UploadPage;
