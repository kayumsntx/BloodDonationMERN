import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import EligibilityBadge from '../Common/EligibilityBadge';
import CountdownTimer from '../Common/CountdownTimer';
import './Donors.css';

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorList = () => {
    const navigate = useNavigate();
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        bloodGroup: 'All',
        district: '',
        eligibleOnly: false,
        sortBy: 'eligible'
    });

    useEffect(() => {
        const timer = setTimeout(loadDonors, 400);
        return () => clearTimeout(timer);
    }, [filters.bloodGroup, filters.district, filters.eligibleOnly]);

    const loadDonors = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.bloodGroup !== 'All') params.append('bloodGroup', filters.bloodGroup);
            if (filters.district) params.append('district', filters.district);
            if (filters.eligibleOnly) params.append('eligibleOnly', 'true');

            const { data } = await api.get(`/users/donors/search?${params.toString()}`);
            setDonors(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFilters({ ...filters, [e.target.name]: value });
    };

    const handleContact = (donor) => {
        if (!donor.eligibility?.eligible) {
            toast.error(
                `${donor.name} can donate in ${donor.eligibility?.daysRemaining || 0} day(s)`,
                { icon: '⏳' }
            );
            return;
        }
        toast.success(`Opening chat with ${donor.name}...`);
        navigate('/dashboard/chat');
    };

    // Client-side sort
    const sortedDonors = [...donors].sort((a, b) => {
        if (filters.sortBy === 'eligible') {
            if (a.eligibility?.eligible !== b.eligibility?.eligible) {
                return (b.eligibility?.eligible ? 1 : 0) - (a.eligibility?.eligible ? 1 : 0);
            }
            return (b.totalDonations || 0) - (a.totalDonations || 0);
        }
        if (filters.sortBy === 'donations') {
            return (b.totalDonations || 0) - (a.totalDonations || 0);
        }
        if (filters.sortBy === 'name') {
            return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
    });

    const eligibleCount = donors.filter(d => d.eligibility?.eligible).length;

    return (
        <div className="donors-container">
            <div className="donors-header">
                <h2>👥 Find Donors ({donors.length})</h2>
                <div style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginTop: 10
                }}>
                    <span style={{
                        fontSize: '0.85em',
                        padding: '5px 12px',
                        background: '#d4edda',
                        color: '#155724',
                        borderRadius: 15,
                        fontWeight: 600
                    }}>
                        ✅ {eligibleCount} eligible now
                    </span>
                    <span style={{
                        fontSize: '0.85em',
                        padding: '5px 12px',
                        background: '#fff3cd',
                        color: '#856404',
                        borderRadius: 15,
                        fontWeight: 600
                    }}>
                        ⏳ {donors.length - eligibleCount} waiting
                    </span>
                </div>
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
                    placeholder="🔍 Search district..."
                />

                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                    <option value="eligible">Sort: Eligible First</option>
                    <option value="donations">Sort: Most Donations</option>
                    <option value="name">Sort: Name (A-Z)</option>
                </select>

                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    background: filters.eligibleOnly ? '#d4edda' : '#f8f9fa',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    fontWeight: 500,
                    border: filters.eligibleOnly ? '2px solid #28a745' : '2px solid transparent'
                }}>
                    <input
                        type="checkbox"
                        name="eligibleOnly"
                        checked={filters.eligibleOnly}
                        onChange={handleFilterChange}
                        style={{ accentColor: '#dc3545' }}
                    />
                    ✅ Eligible Only
                </label>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                    Loading donors...
                </div>
            ) : sortedDonors.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">🔍</div>
                    <h3>No donors found</h3>
                    <p>Try a different filter</p>
                </div>
            ) : (
                <div className="donor-grid">
                    {sortedDonors.map(donor => {
                        const avatar = donor.profilePic ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(donor.name)}&background=dc3545&color=fff&size=100`;
                        const isEligible = donor.eligibility?.eligible;

                        return (
                            <div
                                className="donor-card"
                                key={donor._id}
                                style={{
                                    opacity: isEligible ? 1 : 0.85,
                                    borderTopColor: isEligible ? '#28a745' : '#ffc107'
                                }}
                            >
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img src={avatar} alt={donor.name} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 5,
                                        right: 5,
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        background: isEligible ? '#28a745' : '#ffc107',
                                        border: '3px solid white'
                                    }} />
                                </div>

                                <div className="name">{donor.name}</div>
                                <div className="blood-group">🩸 {donor.bloodGroup}</div>
                                <div className="info">📍 {donor.district}</div>
                                <div className="info">📞 {donor.phoneNumber}</div>

                                <div style={{ marginTop: 10 }}>
                                    <EligibilityBadge eligibility={donor.eligibility} />
                                </div>

                                {!isEligible && donor.eligibility?.nextEligibleDate && (
                                    <div style={{ marginTop: 8 }}>
                                        <CountdownTimer
                                            targetDate={donor.eligibility.nextEligibleDate}
                                            compact
                                        />
                                    </div>
                                )}

                                <div className="stats">
                                    <div>
                                        <div className="num">{donor.totalDonations || 0}</div>
                                        <div className="label">Donations</div>
                                    </div>
                                    <div>
                                        <div className="num">{donor.age || '—'}</div>
                                        <div className="label">Age</div>
                                    </div>
                                    <div>
                                        <div className="num">
                                            {donor.badge === 'Platinum' ? '💎' :
                                             donor.badge === 'Gold' ? '🥇' :
                                             donor.badge === 'Silver' ? '🥈' :
                                             donor.badge === 'Bronze' ? '🥉' : '—'}
                                        </div>
                                        <div className="label">Badge</div>
                                    </div>
                                </div>

                                <button
                                    className="btn-contact"
                                    onClick={() => handleContact(donor)}
                                    style={{
                                        background: isEligible ? '#28a745' : '#6c757d',
                                        cursor: isEligible ? 'pointer' : 'not-allowed'
                                    }}
                                    disabled={!isEligible}
                                >
                                    {isEligible ? '💬 Contact' : '⏳ Not Available'}
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
