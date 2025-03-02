import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  useEffect(() => {
    // Add animation for decorative elements
    const decorElements = document.querySelectorAll('.decorative-element');
    decorElements.forEach(elem => {
      // Random animation duration
      const duration = 3 + Math.random() * 4;
      elem.style.animationDuration = `${duration}s`;
    });
  }, []);

  return (
    <div className="welcome-page">
      {/* Add decorative elements */}
      <div className="decorative-element sparkle sparkle-1"></div>
      <div className="decorative-element sparkle sparkle-2"></div>
      <div className="decorative-element sparkle sparkle-3"></div>
      <div className="decorative-element heart heart-1"></div>
      <div className="decorative-element heart heart-2"></div>
      
      <div className="welcome-container">
        <h1 className="welcome-title">Digital Photo Booth</h1>
        <div className="polaroid-frame">
          <div className="camera-icon"></div>
          <p className="welcome-message">
            Create your memories!!
          </p>
        </div>
        <Link to="/camera" className="start-button">
          Start Taking Photos
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage; 