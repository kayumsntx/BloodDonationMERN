import React from 'react';
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
                    <span className="dev-tag">Developed By</span>
                    <h4 className="dev-name">ASMA Computer and IT Solutions</h4>
                    <div className="dev-details">
                        <span className="dev-item">
                            <span className="item-icon">📍</span> Savar, Dhaka-1344
                        </span>
                        <span className="dev-item">
                            <span className="item-icon">📞</span> +88 xxxxxxxxxxxxxx
                        </span>
                    </div>
                </div>
            </div>

            <div className="footer-copyright">
                <p>&copy; {new Date().getFullYear()} Blood Donation MERN. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
