import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import Button from './ui/Button';

const Camera = ({ onPhotoCapture }) => {
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onPhotoCapture(imageSrc);
      setIsCameraActive(false); // Turn off camera after capture
    }
  }, [onPhotoCapture]);

  const retake = () => {
    setIsCameraActive(true);
  };

  return (
    <div className="camera-container">
      {isCameraActive ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={800}
            height={600}
            videoConstraints={{
              width: 800,
              height: 600,
              facingMode: "user"
            }}
          />
          <div className="camera-controls">
            <Button onClick={capture}>Take Photo</Button>
          </div>
        </>
      ) : (
        <Button onClick={retake}>Retake Photo</Button>
      )}
    </div>
  );
};

export default Camera;
