import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import './Posts.css';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = ['All', 'Normal', 'Urgent', 'Emergency'];
const SORT_OPTIONS = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'urgent', label: 'Urgent First' },
    { value: 'oldest', label: 'Oldest First' }
];

const Feed = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        bloodGroup: 'All',
        district: '',
        urgency: 'All',
        sort: 'recent'
    });

    const loadRequests = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.bloodGroup !== 'All') params.append('bloodGroup', filters.bloodGroup);
            if (filters.district) params.append('district', filters.district);
            if (filters.urgency !== 'All') params.append('urgency', filters.urgency);

            const { data } = await api.get(`/requests?${params.toString()}`);
            setRequests(data);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadRequests, 300);
        return () => clearTimeout(timer);
    }, [filters.bloodGroup, filters.district, filters.urgency]);

    const sortedRequests = [...requests].sort((a, b) => {
        if (filters.sort === 'urgent') {
            const order = { Emergency: 0, Urgent: 1, Normal: 2 };
            const diff = (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
            if (diff !== 0) return diff;
        }
        if (filters.sort === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="posts-container">
            <div className="posts-header">
                <h2>📋 Blood Requests</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    ➕ New Request
                </button>
            </div>

            <div className="filters">
                <select name="bloodGroup" value={filters.bloodGroup} onChange={handleFilterChange}>
                    {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>
                            {bg === 'All' ? 'All Blood Groups' : bg}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="district"
                    value={filters.district}
                    onChange={handleFilterChange}
                    placeholder="🔍 Search district..."
                />

                <select name="urgency" value={filters.urgency} onChange={handleFilterChange}>
                    {URGENCIES.map(u => (
                        <option key={u} value={u}>
                            {u === 'All' ? 'All Urgency' : u}
                        </option>
                    ))}
                </select>

                <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                    {SORT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="empty-state">
                    <div className="icon">⏳</div>
                    <p>Loading requests...</p>
                </div>
            ) : sortedRequests.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📭</div>
                    <h3>No blood requests found</h3>
                    <p>Try changing your filters or create a new request</p>
                </div>
            ) : (
                sortedRequests.map(req => (
                    <PostCard key={req._id} request={req} onHelp={loadRequests} />
                ))
            )}

            {showModal && (
                <CreatePost
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        loadRequests();
                    }}
                />
            )}
        </div>
    );
};

export default Feed;
