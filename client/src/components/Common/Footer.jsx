import React from 'react';
import DevCredit from './DevCredit';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-left">
                    <div className="footer-brand">
                        <span className="brand-icon">🩸</span>
                        <span className="brand-title">Blood Donation MERN</span>
                    </div>
                    <p className="footer-desc">
                        A real-time platform connecting voluntary blood donors with patients in urgent need.
                    </p>
                </div>

                <div className="footer-divider" />

                <div className="footer-dev-card">
                    <DevCredit variant="footer" />
                </div>
            </div>

            <div className="footer-copyright">
                <p>&copy; {new Date().getFullYear()} Blood Donation MERN. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
