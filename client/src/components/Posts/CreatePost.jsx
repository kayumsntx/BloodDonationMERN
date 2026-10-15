import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Posts.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = ['Normal', 'Urgent', 'Emergency'];

const CreatePost = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        bloodGroup: 'A+',
        quantity: 1,
        hospital: '',
        district: '',
        urgency: 'Normal',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/requests', formData);
            toast.success('Blood request posted! 🩸');
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>🩸 Create Blood Request</h3>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Blood Group Needed</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                            {BLOOD_GROUPS.map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Quantity (units)</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            max="20"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Hospital Name</label>
                        <input
                            type="text"
                            name="hospital"
                            value={formData.hospital}
                            onChange={handleChange}
                            placeholder="e.g. Dhaka Medical College"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>District / City</label>
                        <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder="e.g. Dhaka"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Urgency Level</label>
                        <select name="urgency" value={formData.urgency} onChange={handleChange}>
                            {URGENCIES.map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Additional Details (optional)</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Any other information..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
