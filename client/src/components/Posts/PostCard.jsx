import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PostCard = ({ request, onHelp }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwnRequest = request.requester?._id === user?._id;

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleHelp = async () => {
        if (isOwnRequest) {
            toast.error("You can't help with your own request");
            return;
        }

        try {
            // Mark self as donor
            await api.put(`/requests/${request._id}`, {
                donor: user._id
            });
            toast.success('You offered to help! Opening chat...');
            onHelp?.();
            navigate('/dashboard/chat');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to help');
        }
    };

    const handleChat = () => {
        if (isOwnRequest) {
            toast.error("This is your own request");
            return;
        }
        navigate('/dashboard/chat');
    };

    const avatarUrl = request.requester?.profilePic ||
        `https://ui-avatars.com/api/?name=${request.requester?.name}&background=dc3545&color=fff&size=60`;

    const urgencyClass = request.urgency?.toLowerCase() || 'normal';

    return (
        <div className={`post-card ${urgencyClass}`}>
            <div className="post-header">
                <div className="post-user">
                    <img src={avatarUrl} alt={request.requester?.name} />
                    <div className="post-user-info">
                        <div className="name">{request.requester?.name}</div>
                        <div className="time">🕐 {timeAgo(request.createdAt)}</div>
                    </div>
                </div>
                <span className={`urgency-badge ${urgencyClass}`}>
                    {request.urgency === 'Emergency' ? '🚨 ' : ''}
                    {request.urgency}
                </span>
            </div>

            <div className="post-body">
                <span className="post-blood-group">🩸 {request.bloodGroup}</span>
                <div className="post-details">
                    <span>🏥 {request.hospital}</span>
                    <span>📍 {request.district}</span>
                    <span>💉 {request.quantity} unit(s)</span>
                    {request.description && <span>📝 {request.description}</span>}
                </div>
            </div>

            {!isOwnRequest && request.status === 'Open' && (
                <div className="post-actions">
                    <button className="btn-help" onClick={handleHelp}>
                        🤝 I Can Help
                    </button>
                    <button className="btn-chat" onClick={handleChat}>
                        💬 Chat
                    </button>
                </div>
            )}

            {isOwnRequest && (
                <div className="post-actions">
                    <span style={{ color: '#999', fontSize: '0.85em' }}>
                        ℹ️ This is your own request
                    </span>
                </div>
            )}
        </div>
    );
};

export default PostCard;
