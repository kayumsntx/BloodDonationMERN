import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import CreateArticleModal from './CreateArticleModal';
import ArticleDetailModal from './ArticleDetailModal';
import { useAuth } from '../../context/AuthContext';
import './Blog.css';

const CATEGORIES = [
    'All',
    'Blood Donation',
    'Health & Medical',
    'Stories & Experiences',
    'Donor Guidelines',
    'Nutrition & Lifestyle',
    'General'
];

const BlogList = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activePostId, setActivePostId] = useState(null);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== 'All') params.append('category', selectedCategory);
            if (searchQuery.trim()) params.append('search', searchQuery.trim());
            if (sortBy) params.append('sort', sortBy);

            const { data } = await api.get(`/posts?${params.toString()}`);
            setPosts(data || []);
        } catch (error) {
            console.error('Failed to load articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadPosts, 250);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery, sortBy]);

    return (
        <div className="blog-container">
            {/* Header */}
            <div className="blog-header">
                <div className="blog-header-title">
                    <h2>📚 Community Articles & Medical Health Hub</h2>
                    <p>
                        Discover expert doctor guides, blood donor experiences, and essential health insights.
                    </p>
                </div>
                {user && (
                    <button
                        type="button"
                        className="btn-write-article"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <span>✍️</span>
                        <span>Write Article</span>
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="blog-controls">
                {/* Category Chips */}
                <div className="blog-categories">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Search and Sort */}
                <div className="blog-search-sort">
                    <input
                        type="text"
                        placeholder="Search articles by title, content, or #tag..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="blog-search-input"
                    />

                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="blog-sort-select"
                    >
                        <option value="recent">🕒 Most Recent</option>
                        <option value="rating">⭐ Highest Rated</option>
                        <option value="popular">👁️ Most Viewed</option>
                        <option value="oldest">⌛ Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Articles List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    Loading community articles...
                </div>
            ) : posts.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'white',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    color: '#64748b'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📖</div>
                    <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>No articles found</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        {searchQuery || selectedCategory !== 'All'
                            ? 'Try clearing your search query or choosing another category.'
                            : 'Be the first to share an article with our community!'}
                    </p>
                </div>
            ) : (
                <div className="articles-grid">
                    {posts.map(post => {
                        const author = post.author || {};
                        const avatarUrl = author.profilePic ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name || 'Author')}&background=dc3545&color=fff`;

                        return (
                            <div key={post._id} className="article-card">
                                {/* Cover Image */}
                                {post.coverImage ? (
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="article-card-cover"
                                        onClick={() => setActivePostId(post._id)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ) : (
                                    <div
                                        className="article-card-placeholder"
                                        onClick={() => setActivePostId(post._id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        🩸
                                    </div>
                                )}

                                <div className="article-card-body">
                                    {/* Meta tags */}
                                    <div className="article-card-meta">
                                        <span className="category-tag">{post.category}</span>
                                        {post.isDoctorPost && (
                                            <span className="credibility-tag" title="Verified Medical Advice">
                                                <span>🩺</span>
                                                <span>{post.credibilityBadge || 'Doctor Verified'}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3
                                        className="article-card-title"
                                        onClick={() => setActivePostId(post._id)}
                                    >
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="article-card-excerpt">
                                        {post.excerpt || post.content.substring(0, 140) + '...'}
                                    </p>

                                    {/* Footer */}
                                    <div className="article-card-footer">
                                        <div className="author-chip">
                                            <img src={avatarUrl} alt={author.name} />
                                            <div>
                                                <div className="author-chip-name">{author.name}</div>
                                                <div className="author-chip-role">
                                                    {post.authorRole === 'doctor' ? '🩺 Doctor' : post.authorRole}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="article-stats">
                                            <span title="Average Rating">
                                                ⭐ {post.averageRating > 0 ? post.averageRating : '—'}
                                            </span>
                                            <span title="Comments">
                                                💬 {(post.comments || []).length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Article Modal */}
            {showCreateModal && (
                <CreateArticleModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => loadPosts()}
                />
            )}

            {/* Article Detail & Interaction Modal */}
            {activePostId && (
                <ArticleDetailModal
                    postId={activePostId}
                    onClose={() => setActivePostId(null)}
                    onPostUpdated={() => loadPosts()}
                />
            )}
        </div>
    );
};

export default BlogList;
