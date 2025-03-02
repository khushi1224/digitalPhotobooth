import React, { useRef, useState, useEffect } from 'react';
import './CameraPage.css';

// Import sticker images
import heartSvg from '../assets/stickers/heart.svg';
import starSvg from '../assets/stickers/star.svg';
import crownSvg from '../assets/stickers/crown.svg';
import rainbowSvg from '../assets/stickers/rainbow.svg';
import sunglassesSvg from '../assets/stickers/sunglasses.svg';
import kittyIconSvg from '../assets/kitty-icon.svg';
import bowSvg from '../assets/stickers/bow.svg';
import bubbleSvg from '../assets/stickers/bubble.svg';
import pawPrintSvg from '../assets/pawPrint.svg';
import kittyEarsSvg from '../assets/stickers/kittyEars.svg';

const FILTERS = {
  none: 'none',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  vintage: 'sepia(50%) contrast(120%) brightness(90%)',
  warm: 'saturate(150%) hue-rotate(10deg) brightness(110%)',
  cool: 'saturate(120%) hue-rotate(-10deg) brightness(105%)',
  pastel: 'brightness(110%) contrast(90%) saturate(150%)',
  dreamy: 'brightness(110%) contrast(90%) saturate(130%) blur(0.5px)',
  glitter: 'brightness(120%) contrast(110%) saturate(150%)',
  bubblegum: 'hue-rotate(340deg) saturate(170%) brightness(110%)'
};

const FRAMES = {
  none: 'none',
  thin: '5px solid #ffcce6',
  thick: '15px solid #ffcce6',
  hearts: '15px solid #ffcce6',
  stars: '15px solid #d4af37',
  bubbles: '15px solid #cc99ff',
  glitter: '15px solid #ff99cc',
  kitty: '15px solid #ff66b2'
};

const STICKERS = {
  heart: heartSvg,
  star: starSvg,
  crown: crownSvg,
  rainbow: rainbowSvg,
  sunglasses: sunglassesSvg,
  kitty: kittyIconSvg,
  bow: bowSvg,
  bubble: bubbleSvg
};

const CameraPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(3);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSticker, setDraggedSticker] = useState(null);
  const [customText, setCustomText] = useState('');
  const [texts, setTexts] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#ff69b4');
  const [textSize, setTextSize] = useState(24);
  const [textStyle, setTextStyle] = useState('normal');
  const [isRotating, setIsRotating] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [startDistance, setStartDistance] = useState(0);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [creatingStrip, setCreatingStrip] = useState(false);
  const stripCanvasRef = useRef(null);
  const MAX_PHOTOS = 5;
  const [stripPreviewMode, setStripPreviewMode] = useState(false);
  const [stripColor, setStripColor] = useState('#ffcce6');
  const [stripDesign, setStripDesign] = useState('classic');
  const [timerEnabled, setTimerEnabled] = useState(false);

  // Define strip design options
  const STRIP_DESIGNS = {
    classic: {
      borderWidth: 20,
      borderColor: '#ffcce6',
      background: stripColor,
      spacing: 10,
      shadow: '0 0 30px rgba(255, 153, 204, 0.5)'
    },
    kitty: {
      borderWidth: 30,
      borderColor: '#ff99cc',
      background: stripColor,
      spacing: 15,
      pattern: 'kitty',
      shadow: '0 0 20px rgba(255, 102, 178, 0.6)'
    },
    bubbly: {
      borderWidth: 20,
      borderColor: '#cc99ff',
      background: stripColor,
      spacing: 10,
      pattern: 'bubbles',
      shadow: '0 0 40px rgba(204, 153, 255, 0.7)'
    },
    pastel: {
      borderWidth: 25,
      borderColor: '#ffccff',
      background: stripColor,
      spacing: 15,
      pattern: 'pastel',
      shadow: '0 0 25px rgba(255, 204, 255, 0.5)'
    },
    glitter: {
      borderWidth: 15,
      borderColor: '#ff66b2',
      background: stripColor,
      spacing: 10,
      pattern: 'glitter',
      shadow: '0 0 35px rgba(255, 102, 178, 0.6)'
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            facingMode: 'user'
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startTimer = () => {
    if (timerEnabled) {
      setIsTimerActive(true);
      setTimer(timerDuration);
      
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            takePhoto();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      // Take photo immediately if timer is disabled
      takePhoto();
    }
  };

  const addSticker = (type) => {
    setStickers([...stickers, {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      scale: 1,
      rotation: 0
    }]);
  };

  const addText = () => {
    if (customText.trim()) {
      setTexts([...texts, {
        id: Date.now(),
        text: customText,
        x: 100,
        y: 100,
        color: selectedColor,
        size: textSize,
        style: textStyle,
        rotation: 0
      }]);
      setCustomText('');
    }
  };

  const handleMouseDown = (e, item, action = 'move') => {
    e.stopPropagation();
    
    if (action === 'move') {
      setIsDragging(true);
      setDraggedSticker(item);
    } else if (action === 'rotate') {
      setIsRotating(true);
      setDraggedSticker(item);
      
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(
        e.clientY - centerY,
        e.clientX - centerX
      ) * 180 / Math.PI;
      
      setStartAngle(angle - (item.rotation || 0));
    } else if (action === 'scale') {
      setIsScaling(true);
      setDraggedSticker(item);
      
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + 
        Math.pow(e.clientY - centerY, 2)
      );
      
      setStartDistance(distance / (item.scale || 1));
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedSticker) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (draggedSticker.text !== undefined) {
        setTexts(texts.map(t => 
          t.id === draggedSticker.id ? { ...t, x, y } : t
        ));
      } else {
        setStickers(stickers.map(s => 
          s.id === draggedSticker.id ? { ...s, x, y } : s
        ));
      }
    } else if (isRotating && draggedSticker) {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(
        e.clientY - centerY,
        e.clientX - centerX
      ) * 180 / Math.PI;
      
      const newRotation = angle - startAngle;
      
      if (draggedSticker.text !== undefined) {
        setTexts(texts.map(t => 
          t.id === draggedSticker.id ? { ...t, rotation: newRotation } : t
        ));
      } else {
        setStickers(stickers.map(s => 
          s.id === draggedSticker.id ? { ...s, rotation: newRotation } : s
        ));
      }
    } else if (isScaling && draggedSticker) {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + 
        Math.pow(e.clientY - centerY, 2)
      );
      
      const newScale = Math.max(0.5, Math.min(3, distance / startDistance));
      
      if (draggedSticker.text !== undefined) {
        setTexts(texts.map(t => 
          t.id === draggedSticker.id ? { ...t, size: newScale * 24 } : t
        ));
      } else {
        setStickers(stickers.map(s => 
          s.id === draggedSticker.id ? { ...s, scale: newScale } : s
        ));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsRotating(false);
    setIsScaling(false);
    setDraggedSticker(null);
  };

  const removeItem = (item) => {
    if (item.text !== undefined) {
      setTexts(texts.filter(t => t.id !== item.id));
    } else {
      setStickers(stickers.filter(s => s.id !== item.id));
    }
  };

  const takePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply selected filter
    context.filter = FILTERS[selectedFilter];
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Draw stickers and text
    stickers.forEach(sticker => {
      const img = new Image();
      img.src = STICKERS[sticker.type];
      context.save();
      context.translate(sticker.x, sticker.y);
      context.rotate(sticker.rotation * Math.PI / 180);
      context.scale(sticker.scale, sticker.scale);
      context.drawImage(img, -img.width / 2, -img.height / 2);
      context.restore();
    });

    texts.forEach(textItem => {
      context.save();
      context.translate(textItem.x, textItem.y);
      context.rotate(textItem.rotation * Math.PI / 180);
      context.font = `${textItem.style === 'italic' ? 'italic ' : ''}${textItem.style === 'bold' ? 'bold ' : ''}${textItem.size}px 'Pacifico', cursive`;
      context.fillStyle = textItem.color;
      context.textAlign = 'center';
      context.fillText(textItem.text, 0, 0);
      context.restore();
    });

    // Save the photo data
    const photoData = canvas.toDataURL('image/png');
    setCapturedPhotos([...capturedPhotos, photoData]);
    
    setIsTakingPhoto(true);
    setIsTimerActive(false);
    setShowPhotoOptions(true);
  };

  const retakePhoto = () => {
    setIsTakingPhoto(false);
    setSelectedFilter('none');
  };

  const downloadPhoto = () => {
    const link = document.createElement('a');
    link.download = 'photo-booth-picture.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleContinueTakingPhotos = () => {
    setIsTakingPhoto(false);
    setShowPhotoOptions(false);
  };

  const createPhotoStrip = () => {
    setCreatingStrip(true);
    setStripPreviewMode(true);
    
    setTimeout(() => {
      if (stripCanvasRef.current) {
        renderPhotoStrip();
      }
    }, 100);
  };

  const renderPhotoStrip = () => {
    const stripCanvas = stripCanvasRef.current;
    if (!stripCanvas) return;
    
    const ctx = stripCanvas.getContext('2d');
    
    // Determine strip layout based on number of photos
    let layout;
    const photoCount = capturedPhotos.length;
    
    if (photoCount === 1) {
      layout = 'single';
    } else if (photoCount === 2) {
      layout = 'double';
    } else if (photoCount === 3) {
      layout = 'triple';
    } else if (photoCount === 4) {
      layout = 'quad';
    } else {
      layout = 'five';
    }
    
    // Set canvas dimensions
    if (layout === 'single' || layout === 'double') {
      stripCanvas.width = 400;
      stripCanvas.height = 1000;
    } else if (layout === 'triple') {
      stripCanvas.width = 400;
      stripCanvas.height = 800;
    } else {
      stripCanvas.width = 600;
      stripCanvas.height = 800;
    }
    
    // Fill with background color
    ctx.fillStyle = stripColor;
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
    
    // Draw photos based on layout
    const photos = capturedPhotos.slice(0, MAX_PHOTOS);
    const spacing = 10;
    
    // Helper function to apply design to a photo
    const applyDesign = (photoX, photoY, photoWidth, photoHeight) => {
      if (stripDesign === 'simpleFrame') {
        // Simple white border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
      } 
      else if (stripDesign === 'coloredFrame') {
        // Colored frame
        let frameColor;
        switch(Math.floor(Math.random() * 4)) {
          case 0: frameColor = '#ff66b2'; break; // Pink
          case 1: frameColor = '#66b2ff'; break; // Blue
          case 2: frameColor = '#b266ff'; break; // Purple
          case 3: frameColor = '#ffb266'; break; // Orange
        }
        
        ctx.strokeStyle = frameColor;
        ctx.lineWidth = 8;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
      }
      else if (stripDesign === 'rainbowFrame') {
        // Gradient frame
        const gradient = ctx.createLinearGradient(
          photoX, photoY, 
          photoX + photoWidth, photoY + photoHeight
        );
        gradient.addColorStop(0, '#ff99cc');
        gradient.addColorStop(0.5, '#cc99ff');
        gradient.addColorStop(1, '#99ccff');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
      }
      else if (stripDesign === 'cornerDecor') {
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        // Draw stars in corners
        const drawStar = (x, y, size) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.beginPath();
          
          for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, 0 - size);
            ctx.rotate(Math.PI / 5);
            ctx.lineTo(0, 0 - size/2.5);
          }
          
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
          ctx.fill();
          ctx.restore();
        };
        
        // Draw stars in each corner
        const margin = 15;
        const starSize = 10;
        drawStar(photoX + margin, photoY + margin, starSize);
        drawStar(photoX + photoWidth - margin, photoY + margin, starSize);
        drawStar(photoX + margin, photoY + photoHeight - margin, starSize);
        drawStar(photoX + photoWidth - margin, photoY + photoHeight - margin, starSize);
      }
      else if (stripDesign === 'softGlow') {
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        // Add light leak in one corner
        const leakX = photoX + photoWidth * 0.8;
        const leakY = photoY + photoHeight * 0.2;
        const leakSize = Math.min(photoWidth, photoHeight) * 0.6;
        
        const gradient = ctx.createRadialGradient(
          leakX, leakY, 0,
          leakX, leakY, leakSize
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(leakX, leakY, leakSize, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      else if (stripDesign === 'timeStamp') {
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        // Add date stamp in corner
        const today = new Date();
        const dateStr = today.toLocaleDateString();
        ctx.font = '12px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(dateStr, photoX + photoWidth - 70, photoY + photoHeight - 10);
      }
      else if (stripDesign === 'loveNote') {
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        // Add "I love u" text in corner
        ctx.font = '14px cursive';
        ctx.fillStyle = '#ff1493';
        ctx.fillText('I love u', photoX + 15, photoY + 25);
      }
      else if (stripDesign === 'gentleHearts') {
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        // Draw better hearts
        const drawBetterHeart = (x, y, size) => {
          const width = size;
          const height = size;
          
          ctx.save();
          ctx.translate(x, y);
          
          // Create a more defined heart shape
          ctx.beginPath();
          ctx.moveTo(0, height/4);
          
          // Left curve
          ctx.bezierCurveTo(
            -width/2, -height/10,  // control point 1
            -width/2, -height/2,   // control point 2
            0, -height/2           // end point
          );
          
          // Right curve
          ctx.bezierCurveTo(
            width/2, -height/2,    // control point 1
            width/2, -height/10,   // control point 2
            0, height/4            // end point
          );
          
          // Create gradient fill for a more 3D look
          const gradient = ctx.createRadialGradient(
            0, -height/8, 0,
            0, -height/8, width
          );
          gradient.addColorStop(0, '#ff99cc');
          gradient.addColorStop(0.7, '#ff3385');
          gradient.addColorStop(1, '#ff0066');
          
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Add a subtle highlight
          ctx.beginPath();
          ctx.ellipse(-width/4, -height/4, width/6, height/8, Math.PI/4, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
          
          ctx.restore();
        };
        
        // Add hearts around the photo - more strategically placed
        // Top left
        drawBetterHeart(photoX + photoWidth * 0.15, photoY + photoHeight * 0.15, 15);
        
        // Top right
        drawBetterHeart(photoX + photoWidth * 0.85, photoY + photoHeight * 0.15, 20);
        
        // Bottom left
        drawBetterHeart(photoX + photoWidth * 0.15, photoY + photoHeight * 0.85, 20);
        
        // Bottom right
        drawBetterHeart(photoX + photoWidth * 0.85, photoY + photoHeight * 0.85, 15);
        
        // Random smaller hearts
        for (let i = 0; i < 6; i++) {
          const heartX = photoX + Math.random() * photoWidth;
          const heartY = photoY + Math.random() * photoHeight;
          const heartSize = 8 + Math.random() * 6;
          drawBetterHeart(heartX, heartY, heartSize);
        }
      }
      else if (stripDesign === 'softVignette') {
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        
        // Add soft vignette effect
        const centerX = photoX + photoWidth/2;
        const centerY = photoY + photoHeight/2;
        const radius = Math.max(photoWidth, photoHeight) * 0.7;
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, radius * 0.5,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        ctx.beginPath();
        ctx.rect(photoX, photoY, photoWidth, photoHeight);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      else {
        // Default to simple white border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
      }
    };
    
    // Draw photos with designs based on layout
    if (layout === 'single') {
      const img = new Image();
      img.onload = () => {
        const photoX = spacing;
        const photoY = spacing;
        const photoWidth = stripCanvas.width - spacing * 2;
        const photoHeight = stripCanvas.height - spacing * 2;
        
        // Draw the photo
        ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
        
        // Apply design
        applyDesign(photoX, photoY, photoWidth, photoHeight);
      };
      img.src = photos[0];
    } 
    else if (layout === 'double') {
      photos.forEach((photo, index) => {
        const img = new Image();
        img.onload = () => {
          const height = (stripCanvas.height - spacing * 3) / 2;
          let photoX, photoY, photoWidth, photoHeight;
          
          if (index === 0) {
            photoX = spacing;
            photoY = spacing;
            photoWidth = stripCanvas.width - spacing * 2;
            photoHeight = height;
          } else {
            photoX = spacing;
            photoY = spacing * 2 + height;
            photoWidth = stripCanvas.width - spacing * 2;
            photoHeight = height;
          }
          
          // Draw the photo
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
          
          // Apply design
          applyDesign(photoX, photoY, photoWidth, photoHeight);
        };
        img.src = photo;
      });
    }
    else if (layout === 'triple') {
      photos.forEach((photo, index) => {
        const img = new Image();
        img.onload = () => {
          const height = (stripCanvas.height - spacing * 4) / 3;
          const photoX = spacing;
          const photoY = index * (height + spacing) + spacing;
          const photoWidth = stripCanvas.width - spacing * 2;
          const photoHeight = height;
          
          // Draw the photo
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
          
          // Apply design
          applyDesign(photoX, photoY, photoWidth, photoHeight);
        };
        img.src = photo;
      });
    }
    else if (layout === 'quad') {
      // Four photos in a 2x2 grid with minimal spacing
      const photoSize = (stripCanvas.width - spacing * 3) / 2;
      
      photos.forEach((photo, index) => {
        const img = new Image();
        img.onload = () => {
          const row = Math.floor(index / 2);
          const col = index % 2;
          const photoX = col * (photoSize + spacing) + spacing;
          const photoY = row * (photoSize + spacing) + spacing;
          
          // Draw the photo
          ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
          
          // Apply design
          applyDesign(photoX, photoY, photoSize, photoSize);
        };
        img.src = photo;
      });
    }
    else if (layout === 'five') {
      // Five photos in a grid pattern like the new screenshot
      // Two large photos on left, three smaller ones stacked on right
      
      // Set dimensions for the strip canvas
      stripCanvas.width = 600;
      stripCanvas.height = 600;
      
      // Fill with background color
      ctx.fillStyle = stripColor;
      ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
      
      // Define photo positions and sizes
      const positions = [
        // Top left large photo
        {
          x: 0,
          y: 0,
          width: stripCanvas.width / 2,
          height: stripCanvas.height / 2
        },
        // Bottom left large photo
        {
          x: 0,
          y: stripCanvas.height / 2,
          width: stripCanvas.width / 2,
          height: stripCanvas.height / 2
        },
        // Top right photo
        {
          x: stripCanvas.width / 2,
          y: 0,
          width: stripCanvas.width / 2,
          height: stripCanvas.height / 3
        },
        // Middle right photo
        {
          x: stripCanvas.width / 2,
          y: stripCanvas.height / 3,
          width: stripCanvas.width / 2,
          height: stripCanvas.height / 3
        },
        // Bottom right photo
        {
          x: stripCanvas.width / 2,
          y: (stripCanvas.height / 3) * 2,
          width: stripCanvas.width / 2,
          height: stripCanvas.height / 3
        }
      ];
      
      // Draw each photo
      photos.forEach((photo, index) => {
        if (index >= positions.length) return;
        
        const img = new Image();
        img.onload = () => {
          const pos = positions[index];
          
          // Draw the photo
          ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);
          
          // Apply design
          applyDesign(pos.x, pos.y, pos.width, pos.height);
        };
        img.src = photo;
      });
    }
  };

  const downloadStrip = () => {
    const link = document.createElement('a');
    link.download = 'photo-booth-strip.png';
    link.href = stripCanvasRef.current.toDataURL('image/png');
    link.click();
    
    // Reset after download
    setTimeout(() => {
      resetPhotoProcess();
    }, 500);
  };

  const resetPhotoProcess = () => {
    setCapturedPhotos([]);
    setCreatingStrip(false);
    setStripPreviewMode(false);
    setIsTakingPhoto(false);
    setShowPhotoOptions(false);
  };

  useEffect(() => {
    if (stripPreviewMode && stripCanvasRef.current) {
      renderPhotoStrip();
    }
  }, [stripColor, stripDesign, stripPreviewMode]);

  return (
    <div className="camera-page">
      <div className="layout-container">
        <div className="camera-frame" style={{ border: FRAMES[selectedFrame] }}>
          <div className="camera-container"
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseUp}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="camera-video"
              style={{ filter: FILTERS[selectedFilter] }}
            />
            <canvas 
              ref={canvasRef} 
              className={`photo-canvas ${isTakingPhoto ? 'show' : ''}`} 
            />
            
            {isFlashActive && <div className="flash-effect"></div>}
            
            {isTimerActive && timer > 0 && (
              <div className="timer-overlay">
                <div className="timer-circle">
                  <span className="timer-number">{timer}</span>
                </div>
              </div>
            )}

            {/* Stickers and Text Overlays */}
            {!isTakingPhoto && (
              <>
                {stickers.map(sticker => (
                  <div
                    key={sticker.id}
                    className="sticker-container"
                    style={{
                      left: sticker.x,
                      top: sticker.y,
                      transform: `rotate(${sticker.rotation}deg)`
                    }}
                  >
                    <img
                      src={STICKERS[sticker.type]}
                      className="sticker"
                      style={{
                        transform: `scale(${sticker.scale})`
                      }}
                      onMouseDown={(e) => handleMouseDown(e, sticker)}
                    />
                    <div className="sticker-controls">
                      <button 
                        className="sticker-control rotate"
                        onMouseDown={(e) => handleMouseDown(e, sticker, 'rotate')}
                      >
                        ↻
                      </button>
                      <button 
                        className="sticker-control scale"
                        onMouseDown={(e) => handleMouseDown(e, sticker, 'scale')}
                      >
                        ⤢
                      </button>
                      <button 
                        className="sticker-control remove"
                        onClick={() => removeItem(sticker)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {texts.map(textItem => (
                  <div
                    key={textItem.id}
                    className="text-container"
                    style={{
                      left: textItem.x,
                      top: textItem.y,
                      transform: `rotate(${textItem.rotation}deg)`
                    }}
                  >
                    <div
                      className="text-overlay"
                      style={{
                        color: textItem.color,
                        fontSize: `${textItem.size}px`,
                        fontStyle: textItem.style === 'italic' ? 'italic' : 'normal',
                        fontWeight: textItem.style === 'bold' ? 'bold' : 'normal',
                        textDecoration: textItem.style === 'underline' ? 'underline' : 'none',
                        textShadow: textItem.style === 'shadow' ? '2px 2px 4px rgba(0,0,0,0.5)' : 'none'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, textItem)}
                    >
                      {textItem.text}
                    </div>
                    <div className="sticker-controls">
                      <button 
                        className="sticker-control rotate"
                        onMouseDown={(e) => handleMouseDown(e, textItem, 'rotate')}
                      >
                        ↻
                      </button>
                      <button 
                        className="sticker-control scale"
                        onMouseDown={(e) => handleMouseDown(e, textItem, 'scale')}
                      >
                        ⤢
                      </button>
                      <button 
                        className="sticker-control remove"
                        onClick={() => removeItem(textItem)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          <div className="camera-controls">
            {!isTimerActive && !isTakingPhoto && (
              <button 
                onClick={startTimer} 
                className="capture-button"
              >
                <div className="button-inner">
                  <div className="button-circle"></div>
                </div>
              </button>
            )}
            
            {isTakingPhoto && showPhotoOptions && (
              <div className="photo-options">
                <p className="photo-count">Photo {capturedPhotos.length} of {MAX_PHOTOS}</p>
                <div className="option-buttons">
                  <button 
                    onClick={handleContinueTakingPhotos} 
                    className="option-button continue"
                  >
                    Take Another Photo
                  </button>
                  {capturedPhotos.length >= 2 && (
                    <button 
                      onClick={createPhotoStrip} 
                      className="option-button strip"
                    >
                      Create Photo Strip
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="side-panel">
          <div className="panel-section">
            <h3>Filters</h3>
            <div className="filter-options">
              {Object.keys(FILTERS).map(filter => (
                <button
                  key={filter}
                  className={`filter-button ${selectedFilter === filter ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="panel-section">
            <h3>Frames</h3>
            <div className="frame-options">
              {Object.keys(FRAMES).map(frame => (
                <button
                  key={frame}
                  className={`frame-button ${selectedFrame === frame ? 'active' : ''}`}
                  onClick={() => setSelectedFrame(frame)}
                >
                  {frame.charAt(0).toUpperCase() + frame.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="panel-section">
            <h3>Stickers</h3>
            <div className="sticker-options">
              {Object.keys(STICKERS).map(sticker => (
                <button
                  key={sticker}
                  className="sticker-button"
                  onClick={() => addSticker(sticker)}
                >
                  <img src={STICKERS[sticker]} alt={sticker} className="sticker-preview" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="panel-section">
            <h3>Add Text</h3>
            <div className="text-options">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter text..."
              />
              
              <div className="text-controls-row">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
                
                <select 
                  value={textStyle} 
                  onChange={(e) => setTextStyle(e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="italic">Italic</option>
                  <option value="underline">Underline</option>
                  <option value="shadow">Shadow</option>
                </select>
              </div>
              
              <button onClick={addText}>Add Text</button>
            </div>
          </div>
          
          <div className="panel-section">
            <h3>Timer</h3>
            <div className="timer-options">
              <div className="timer-toggle">
                <label className="toggle-label">
                  <input 
                    type="checkbox" 
                    checked={timerEnabled}
                    onChange={() => setTimerEnabled(!timerEnabled)}
                  />
                  <span className="toggle-text">Enable Timer</span>
                </label>
              </div>
              
              {timerEnabled && (
                <select 
                  value={timerDuration} 
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                >
                  <option value="3">3 seconds</option>
                  <option value="5">5 seconds</option>
                  <option value="10">10 seconds</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={`strip-container ${creatingStrip ? 'active' : ''}`}>
        <canvas 
          ref={stripCanvasRef}
          className={`strip-canvas ${stripPreviewMode ? 'show' : ''}`}
          style={{ display: creatingStrip ? 'block' : 'none' }}
        />
        
        {stripPreviewMode && (
          <div className="strip-preview-controls">
            <h3>Customize Your Photo Strip</h3>
            
            <div className="control-group">
              <label>Background Color</label>
              <input 
                type="color" 
                value={stripColor} 
                onChange={(e) => setStripColor(e.target.value)} 
              />
            </div>
            
            <div className="customize-section">
              <h3 className="customize-heading">Design Style</h3>
              <div className="design-grid">
                <button 
                  className={`design-option ${stripDesign === 'simpleFrame' ? 'active' : ''}`}
                  onClick={() => setStripDesign('simpleFrame')}
                  style={{
                    background: 'linear-gradient(to bottom, #ffffff, #f0f0f0)',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: '#333',
                    boxShadow: stripDesign === 'simpleFrame' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'simpleFrame' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Classic
                </button>
                <button 
                  className={`design-option ${stripDesign === 'coloredFrame' ? 'active' : ''}`}
                  onClick={() => setStripDesign('coloredFrame')}
                  style={{
                    background: 'linear-gradient(to bottom, #ffb6c1, #ff69b4)',
                    border: '2px solid #ff69b4',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: 'white',
                    boxShadow: stripDesign === 'coloredFrame' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'coloredFrame' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Color Frame
                </button>
                <button 
                  className={`design-option ${stripDesign === 'rainbowFrame' ? 'active' : ''}`}
                  onClick={() => setStripDesign('rainbowFrame')}
                  style={{
                    background: 'linear-gradient(to right, #ff9999, #ffcc99, #ffff99, #99ff99, #99ccff, #cc99ff)',
                    border: '2px solid #cc99ff',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: '#333',
                    boxShadow: stripDesign === 'rainbowFrame' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'rainbowFrame' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Rainbow
                </button>
                <button 
                  className={`design-option ${stripDesign === 'cornerDecor' ? 'active' : ''}`}
                  onClick={() => setStripDesign('cornerDecor')}
                  style={{
                    background: 'linear-gradient(to bottom, #fffacd, #ffd700)',
                    border: '2px solid #ffd700',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: '#333',
                    boxShadow: stripDesign === 'cornerDecor' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'cornerDecor' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Corner Stars
                </button>
                <button 
                  className={`design-option ${stripDesign === 'softGlow' ? 'active' : ''}`}
                  onClick={() => setStripDesign('softGlow')}
                  style={{
                    background: 'linear-gradient(to bottom, #e6e6fa, #b0c4de)',
                    border: '2px solid #b0c4de',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: '#333',
                    boxShadow: stripDesign === 'softGlow' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'softGlow' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Soft Glow
                </button>
                <button 
                  className={`design-option ${stripDesign === 'timeStamp' ? 'active' : ''}`}
                  onClick={() => setStripDesign('timeStamp')}
                  style={{
                    background: 'linear-gradient(to bottom, #f0f8ff, #87cefa)',
                    border: '2px solid #87cefa',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: '#333',
                    boxShadow: stripDesign === 'timeStamp' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'timeStamp' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Date Stamp
                </button>
                <button 
                  className={`design-option ${stripDesign === 'loveNote' ? 'active' : ''}`}
                  onClick={() => setStripDesign('loveNote')}
                  style={{
                    background: 'linear-gradient(to bottom, #fff0f5, #db7093)',
                    border: '2px solid #db7093',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: 'white',
                    boxShadow: stripDesign === 'loveNote' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'loveNote' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Love Note
                </button>
                <button 
                  className={`design-option ${stripDesign === 'gentleHearts' ? 'active' : ''}`}
                  onClick={() => setStripDesign('gentleHearts')}
                  style={{
                    background: 'linear-gradient(to bottom, #ffe4e1, #ff69b4)',
                    border: '2px solid #ff69b4',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: 'white',
                    boxShadow: stripDesign === 'gentleHearts' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'gentleHearts' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Hearts
                </button>
                <button 
                  className={`design-option ${stripDesign === 'softVignette' ? 'active' : ''}`}
                  onClick={() => setStripDesign('softVignette')}
                  style={{
                    background: 'linear-gradient(to bottom, #dcdcdc, #696969)',
                    border: '2px solid #696969',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '4px',
                    fontFamily: 'cursive',
                    color: 'white',
                    boxShadow: stripDesign === 'softVignette' ? '0 0 8px rgba(255, 105, 180, 0.6)' : 'none',
                    transform: stripDesign === 'softVignette' ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Vignette
                </button>
              </div>
            </div>
            
            <div className="preview-buttons">
              <button 
                onClick={downloadStrip}
                className="preview-button download"
              >
                Download
              </button>
              <button 
                onClick={resetPhotoProcess}
                className="preview-button cancel"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraPage; 