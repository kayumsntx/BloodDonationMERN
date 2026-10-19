import React from 'react';
import './DevCredit.css';

// Developer Contact & Social Links
// Note: Website link can be updated here in the future
export const DEV_CONFIG = {
    name: 'ASMA Computer and IT Solutions',
    website: '#', // Update with actual website URL when available
    linkedin: 'https://www.linkedin.com/company/itasma',
    facebook: 'https://www.facebook.com/asmatechsolutions'
};

const DevCredit = ({ variant = 'default', showTitle = true }) => {
    return (
        <div className={`dev-credit-container dev-credit-${variant}`}>
            {showTitle && <span className="dev-credit-title">Developed By</span>}
            <a
                href={DEV_CONFIG.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="dev-credit-company"
            >
                {DEV_CONFIG.name}
            </a>
            <div className="dev-credit-socials">
                <a
                    href={DEV_CONFIG.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-social-btn dev-social-web"
                    title="Website (Coming Soon)"
                    aria-label="Website"
                    onClick={(e) => {
                        if (DEV_CONFIG.website === '#') {
                            e.preventDefault();
                            window.open(DEV_CONFIG.facebook, '_blank');
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>Website</span>
                </a>
                <a
                    href={DEV_CONFIG.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-social-btn dev-social-linkedin"
                    title="LinkedIn"
                    aria-label="LinkedIn"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>LinkedIn</span>
                </a>
                <a
                    href={DEV_CONFIG.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-social-btn dev-social-fb"
                    title="FaceBook"
                    aria-label="FaceBook"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>FaceBook</span>
                </a>
            </div>
        </div>
    );
};

export default DevCredit;
