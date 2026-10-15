import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './Donors.css';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorList = () => {
    const navigate = useNavigate();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        bloodGroup: 'All',
        district: ''
    });

    useEffect(() => {
        loadDonors();
    }, []);

    const loadDonors = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setDonors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDonors = donors.filter(d => {
        if (filters.bloodGroup !== 'All' && d.bloodGroup !== filters.bloodGroup) return false;
        if (filters.district && 
            !d.district?.toLowerCase().includes(filters.district.toLowerCase())) return false;
        return true;
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleContact = (donor) => {
        toast.success(`Opening chat with ${donor.name}...`);
        navigate('/dashboard/chat');
    };

    const isEligible = (lastDonationDate) => {
        if (!lastDonationDate) return true;
        const days = (new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24);
        return days >= 90;
    };

    return (
        <div className="donors-container">
            <div className="donors-header">
                <h2>👥 Find Donors ({filteredDonors.length})</h2>
            </div>

            <div className="donor-filters">
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
                    placeholder="🔍 Search by district..."
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                    Loading donors...
                </div>
            ) : filteredDonors.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">🔍</div>
                    <h3>No donors found</h3>
                    <p>Try a different filter</p>
                </div>
            ) : (
                <div className="donor-grid">
                    {filteredDonors.map(donor => {
                        const avatar = donor.profilePic ||
                            `https://ui-avatars.com/api/?name=${donor.name}&background=dc3545&color=fff&size=100`;
                        const eligible = isEligible(donor.lastDonationDate);

                        return (
                            <div className="donor-card" key={donor._id}>
                                <img src={avatar} alt={donor.name} />
                                <div className="name">{donor.name}</div>
                                <div className="blood-group">🩸 {donor.bloodGroup}</div>
                                <div className="info">📍 {donor.district}</div>
                                <div className="info">📞 {donor.phoneNumber}</div>

                                <span className={`available-badge ${eligible ? 'available' : 'unavailable'}`}>
                                    {eligible ? '✅ Eligible to Donate' : '⏳ Not Eligible Yet'}
                                </span>

                                <div className="stats">
                                    <div>
                                        <div className="num">{donor.totalDonations || 0}</div>
                                        <div className="label">Donations</div>
                                    </div>
                                    <div>
                                        <div className="num">{donor.age || '—'}</div>
                                        <div className="label">Age</div>
                                    </div>
                                </div>

                                <button 
                                    className="btn-contact"
                                    onClick={() => handleContact(donor)}
                                >
                                    💬 Contact
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DonorList;
