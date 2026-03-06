import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, orderBy, writeBatch } from "firebase/firestore";
import { Plus, Trash2, Edit2, Check, X, Loader2, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ cat, editingId, editValue, setEditValue, saveEdit, cancelEdit, startEdit, handleDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: cat.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        borderBottom: '1px solid #f1f5f9',
        backgroundColor: isDragging ? '#f8fafc' : 'white',
        zIndex: isDragging ? 2 : 1,
        position: 'relative'
    };

    return (
        <tr ref={setNodeRef} style={style}>
            <td style={{ padding: '1rem', width: '40px' }}>
                <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                    <GripVertical size={18} color="#94a3b8" />
                </div>
            </td>
            <td style={{ padding: '1rem', width: '80px', color: '#6366f1', fontWeight: 'bold' }}>
                {cat.order + 1}
            </td>
            <td style={{ padding: '1rem' }}>
                {editingId === cat.id ? (
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{ padding: '0.4rem', width: '100%' }}
                        autoFocus
                    />
                ) : (
                    cat.name
                )}
            </td>
            <td style={{ padding: '1rem', textAlign: 'right' }}>
                {editingId === cat.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => saveEdit(cat.id)} style={{ color: '#10b981', border: 'none', background: 'none', cursor: 'pointer' }}>
                            <Check size={20} />
                        </button>
                        <button onClick={cancelEdit} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => startEdit(cat)} style={{ color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>
                            <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "categories"), orderBy("order", "asc"));
            const snapshot = await getDocs(q);
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Re-order if some items don't have order field
            const sanitizedList = list.map((item, index) => ({
                ...item,
                order: item.order !== undefined ? item.order : index
            })).sort((a, b) => a.order - b.order);

            setCategories(sanitizedList);
        } catch (error) {
            console.error(error);
            alert("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;
        try {
            const nextOrder = categories.length > 0
                ? Math.max(...categories.map(c => c.order || 0)) + 1
                : 0;

            await addDoc(collection(db, "categories"), {
                name: newCategory.trim(),
                order: nextOrder,
                createdAt: new Date()
            });
            setNewCategory('');
            fetchCategories();
        } catch (error) {
            console.error(error);
            alert("Failed to add category");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("이 카테고리를 삭제하시겠습니까? 관련 영상들의 카테고리 연결이 해제됩니다.")) return;
        try {
            await deleteDoc(doc(db, "categories", id));
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat.id);
        setEditValue(cat.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const saveEdit = async (id) => {
        if (!editValue.trim()) return;
        try {
            await updateDoc(doc(db, "categories", id), {
                name: editValue.trim()
            });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((i) => i.id === active.id);
            const newIndex = categories.findIndex((i) => i.id === over.id);

            const newArray = arrayMove(categories, oldIndex, newIndex);

            // Optimistic UI update
            const updatedArray = newArray.map((cat, index) => ({ ...cat, order: index }));
            setCategories(updatedArray);

            // Update order in Firestore
            try {
                const batch = writeBatch(db);
                updatedArray.forEach((cat) => {
                    const catRef = doc(db, "categories", cat.id);
                    batch.update(catRef, { order: cat.order });
                });
                await batch.commit();
            } catch (error) {
                console.error("Failed to update order:", error);
                alert("순서 저장에 실패했습니다.");
                fetchCategories(); // Revert
            }
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>카테고리 관리 (노출 순서 설정)</h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                왼쪽의 핸들 아이콘을 드래그하여 순서를 변경할 수 있습니다. 상단에 있을수록 사용자 화면에서 앞에 노출됩니다.
            </p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <input
                            type="text"
                            placeholder="새 카테고리 이름 입력 (예: 스케치, 인터뷰)"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="submit-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>
                        <Plus size={20} />
                    </button>
                </form>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loader2 className="animate-spin" size={32} />
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                <th style={{ padding: '1rem', width: '40px' }}></th>
                                <th style={{ padding: '1rem', width: '80px' }}>순서</th>
                                <th style={{ padding: '1rem' }}>카테고리명</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={categories.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {categories.map(cat => (
                                        <SortableItem
                                            key={cat.id}
                                            cat={cat}
                                            editingId={editingId}
                                            editValue={editValue}
                                            setEditValue={setEditValue}
                                            saveEdit={saveEdit}
                                            cancelEdit={cancelEdit}
                                            startEdit={startEdit}
                                            handleDelete={handleDelete}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                                        등록된 카테고리가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
