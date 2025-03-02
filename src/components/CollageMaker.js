import React, { useRef, useEffect, useState } from 'react';
import { 
  Canvas, 
  Image as FabricImage, 
  Text, 
  Group, 
  Rect, 
  filters, 
  Gradient 
} from 'fabric';
import Button from './ui/Button';
import Select from './ui/Select';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import html2canvas from 'html2canvas';
import { 
  addFilmSprockets, 
  addScrapbookElements, 
  addTapeEffect, 
  addVintageEffect 
} from '../utils/polaroidEffects';
import './CollageMaker.css';

const TEMPLATES = {
  VERTICAL_STRIP: {
    name: '📸 Classic Vertical Strip',
    maxPhotos: 4,
    layout: (width, height, images) => {
      const photoHeight = height / 4;
      return images.map((_, i) => ({
        x: 50,
        y: i * (photoHeight + 20) + 30,
        width: width - 100,
        height: photoHeight - 40,
        rotation: 0,
        caption: true
      }));
    }
  },
  FILM_STRIP: {
    name: '🎬 Horizontal Film Strip',
    maxPhotos: 5,
    layout: (width, height, images) => {
      const photoWidth = width / images.length;
      return images.map((_, i) => ({
        x: i * (photoWidth + 10) + 20,
        y: 50,
        width: photoWidth - 20,
        height: height - 100,
        rotation: 0,
        filmStyle: true
      }));
    }
  },
  HEART_CLUSTER: {
    name: '💖 Heart Cluster',
    maxPhotos: 6,
    layout: (width, height, images) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 3;
      return images.map((_, i) => {
        const angle = (i / images.length) * 2 * Math.PI;
        const heartX = centerX + radius * Math.cos(angle) * (1 - Math.sin(angle) * 0.5);
        const heartY = centerY + radius * Math.sin(angle);
        return {
          x: heartX - 100,
          y: heartY - 100,
          width: 200,
          height: 200,
          rotation: (angle * 180 / Math.PI) + 45,
          scrapbook: true
        };
      });
    }
  },
  SCATTERED: {
    name: '📝 Scrapbook Style',
    maxPhotos: 6,
    layout: (width, height, images) => {
      return images.map((_, i) => ({
        x: 50 + Math.random() * (width - 300),
        y: 50 + Math.random() * (height - 300),
        width: 250,
        height: 300,
        rotation: (Math.random() - 0.5) * 30,
        scrapbook: true,
        tape: true
      }));
    }
  },
  RETRO_GRID: {
    name: '📊 Retro Grid',
    maxPhotos: 9,
    layout: (width, height, images) => {
      const cols = Math.ceil(Math.sqrt(images.length));
      const rows = Math.ceil(images.length / cols);
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      return images.map((_, i) => ({
        x: (i % cols) * cellWidth + 20,
        y: Math.floor(i / cols) * cellHeight + 20,
        width: cellWidth - 40,
        height: cellHeight - 40,
        rotation: 0,
        vintage: true
      }));
    }
  }
};

// Predefined filters
const FILTERS = {
  VINTAGE: [
    { filter: 'sepia', options: {} },
    { filter: 'brightness', options: { brightness: 0.1 } },
    { filter: 'contrast', options: { contrast: 1.2 } }
  ],
  RETRO: [
    { filter: 'grayscale', options: {} },
    { filter: 'brightness', options: { brightness: 0.15 } }
  ],
  SUMMER: [
    { filter: 'brightness', options: { brightness: 0.15 } },
    { filter: 'saturation', options: { saturation: 0.5 } }
  ],
  DRAMATIC: [
    { filter: 'contrast', options: { contrast: 1.4 } },
    { filter: 'saturation', options: { saturation: -0.2 } }
  ]
};

// Emoji stickers instead of image files
const STICKERS = [
  { emoji: '❤️', name: 'Heart' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '🌟', name: 'Sparkle' },
  { emoji: '🎨', name: 'Art' },
  { emoji: '✨', name: 'Sparkles' },
  { emoji: '💫', name: 'Stars' },
  { emoji: '🌈', name: 'Rainbow' },
  { emoji: '💝', name: 'Heart with Ribbon' }
];

const CUTE_STICKERS = [
  { emoji: '🎀', name: 'Pink Bow' },
  { emoji: '💖', name: 'Sparkling Heart' },
  { emoji: '🌸', name: 'Cherry Blossom' },
  { emoji: '✨', name: 'Sparkles' },
  { emoji: '💝', name: 'Heart with Ribbon' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🌟', name: 'Glowing Star' },
  { emoji: '💫', name: 'Dizzy Star' }
];

const LAYOUTS = {
  HEART: 'Heart Layout 💖',
  FLOWER: 'Flower Layout 🌸',
  BUTTERFLY: 'Butterfly Layout 🦋',
  POLAROID: 'Polaroid Stack 📸'
};

const CollageMaker = ({ images = [] }) => {
  const [loadedImages, setLoadedImages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [textSize, setTextSize] = useState(20);
  const [textFont, setTextFont] = useState('Arial');
  const [isAddingText, setIsAddingText] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [emojis, setEmojis] = useState([]);
  const [imageAdjustments, setImageAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });
  const canvasRef = useRef(null);
  const [draggableElements, setDraggableElements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedLayout, setSelectedLayout] = useState('twoPhotos');

  // Extended template styles
  const templates = {
    classic: {
      name: "Classic Polaroid",
      padding: 20,
      bottomPadding: 60,
      backgroundColor: '#ffffff',
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 10,
      rotation: 0,
      layout: 'grid'
    },
    vintage: {
      name: "Vintage",
      padding: 25,
      bottomPadding: 70,
      backgroundColor: '#f4e4bc',
      shadowColor: 'rgba(0,0,0,0.2)',
      shadowBlur: 8,
      rotation: [-3, 3],
      layout: 'grid',
      filter: 'sepia'
    },
    modern: {
      name: "Modern Black",
      padding: 10,
      bottomPadding: 40,
      backgroundColor: '#000000',
      shadowColor: 'rgba(255,255,255,0.2)',
      shadowBlur: 5,
      layout: 'grid',
      borderColor: '#ffffff'
    },
    instant: {
      name: "Instant Camera",
      padding: 15,
      bottomPadding: 80,
      backgroundColor: '#ffffff',
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 12,
      rotation: [-2, 2],
      layout: 'stack',
      borderWidth: 30
    },
    minimalist: {
      name: "Minimalist",
      padding: 8,
      bottomPadding: 30,
      backgroundColor: '#f8f8f8',
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 3,
      layout: 'grid',
      borderColor: '#eaeaea'
    },
    retro: {
      name: "Retro",
      padding: 20,
      bottomPadding: 60,
      backgroundColor: '#ff9eaa',
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 8,
      rotation: [-4, 4],
      layout: 'scattered',
      filter: 'contrast(1.1) brightness(1.1)'
    },
    filmstrip: {
      name: "Film Strip",
      padding: 15,
      bottomPadding: 40,
      backgroundColor: '#ffffff',
      shadowColor: 'rgba(0,0,0,0.25)',
      shadowBlur: 6,
      layout: 'strip',
      borderColor: '#000000',
      holes: true
    },
    scrapbook: {
      name: "Scrapbook",
      padding: 15,
      bottomPadding: 50,
      backgroundColor: '#ffffff',
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 10,
      rotation: [-8, 8],
      layout: 'scattered',
      tape: true
    }
  };

  // Common emojis
  const commonEmojis = ['😊', '❤️', '🌟', '🎉', '✨', '🎈', '🎁', '💕', '🌸', '🍀'];

  // Extended emoji categories
  const emojiCategories = {
    smileys: ['😊', '😂', '🥰', '😎', '🤗', '😍', '🥳', '😇', '🤩', '😋'],
    hearts: ['❤️', '💖', '💕', '💝', '💓', '💗', '💘', '💞', '💟', '♥️'],
    nature: ['🌸', '🌺', '🌼', '🌻', '🍀', '🌹', '🌷', '🌱', '🌿', '🍃'],
    celebration: ['🎉', '🎈', '🎊', '🎁', '🎂', '🎆', '🎇', '✨', '⭐', '🌟'],
    misc: ['💫', '🦋', '🌈', '☀️', '⚡', '💥', '🌙', '⭐', '🔥', '💫']
  };

  // Font options
  const fontOptions = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Comic Sans MS',
    'Impact'
  ];

  // Layout configurations based on number of images
  const layoutConfigs = {
    1: {
      getPosition: (index, canvasWidth, canvasHeight) => ({
        x: canvasWidth * 0.1,
        y: canvasHeight * 0.1,
        width: canvasWidth * 0.8,
        height: canvasHeight * 0.8
      })
    },
    2: {
      getPosition: (index, canvasWidth, canvasHeight) => {
        // Horizontal layout for 2 images
        const width = canvasWidth * 0.45; // 45% of canvas width
        const height = canvasHeight * 0.8; // 80% of canvas height
        const gap = canvasWidth * 0.05;    // 5% gap
        const x = index === 0 ? gap : canvasWidth - width - gap;
        const y = canvasHeight * 0.1;      // 10% from top
        return { x, y, width, height };
      }
    },
    3: {
      getPosition: (index, canvasWidth, canvasHeight) => {
        if (index === 0) {
          // First image takes up left half
          return {
            x: canvasWidth * 0.05,
            y: canvasHeight * 0.1,
            width: canvasWidth * 0.45,
            height: canvasHeight * 0.8
          };
        } else {
          // Other two images stack on right
          return {
            x: canvasWidth * 0.55,
            y: index === 1 ? canvasHeight * 0.1 : canvasHeight * 0.5,
            width: canvasWidth * 0.4,
            height: canvasHeight * 0.37
          };
        }
      }
    },
    4: {
      getPosition: (index, canvasWidth, canvasHeight) => {
        // Grid layout for 4 images
        const width = canvasWidth * 0.45;
        const height = canvasHeight * 0.45;
        const gap = canvasWidth * 0.05;
        const x = index % 2 === 0 ? gap : canvasWidth - width - gap;
        const y = index < 2 ? gap : canvasHeight - height - gap;
        return { x, y, width, height };
      }
    }
  };

  // Calculate canvas height based on number of images
  const getCanvasHeight = (numImages) => {
    if (numImages < 2) return 800; // Default height for 0-1 images
    const baseHeight = 300; // Height for each photo section
    const padding = 40;     // Padding between photos
    return (baseHeight * numImages) + (padding * (numImages - 1)) + 80;
  };

  const layoutStyles = {
    twoPhotos: {
      name: "2 Photos",
      getLayout: (canvasWidth, canvasHeight) => ({
        width: canvasWidth * 0.35,
        height: canvasHeight,
        positions: [
          {
            x: canvasWidth * 0.325,
            y: 40,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 380,
            width: canvasWidth * 0.35,
            height: 300
          }
        ]
      })
    },
    threePhotos: {
      name: "3 Photos",
      getLayout: (canvasWidth, canvasHeight) => ({
        width: canvasWidth * 0.35,
        height: canvasHeight,
        positions: [
          {
            x: canvasWidth * 0.325,
            y: 40,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 380,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 720,
            width: canvasWidth * 0.35,
            height: 300
          }
        ]
      })
    },
    fourPhotos: {
      name: "4 Photos",
      getLayout: (canvasWidth, canvasHeight) => ({
        width: canvasWidth * 0.35,
        height: canvasHeight,
        positions: [
          {
            x: canvasWidth * 0.325,
            y: 40,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 380,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 720,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 1060,
            width: canvasWidth * 0.35,
            height: 300
          }
        ]
      })
    },
    fivePhotos: {
      name: "5 Photos",
      getLayout: (canvasWidth, canvasHeight) => ({
        width: canvasWidth * 0.35,
        height: canvasHeight,
        positions: [
          {
            x: canvasWidth * 0.325,
            y: 40,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 380,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 720,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 1060,
            width: canvasWidth * 0.35,
            height: 300
          },
          {
            x: canvasWidth * 0.325,
            y: 1400,
            width: canvasWidth * 0.35,
            height: 300
          }
        ]
      })
    }
  };

  useEffect(() => {
    const loadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    const loadAllImages = async () => {
      const loaded = await Promise.all(
        images.map(img => loadImage(img))
      );
      setLoadedImages(loaded);
    };

    if (images.length > 0) {
      loadAllImages();
    }
  }, [images]);

  // Update useEffect to handle image count
  useEffect(() => {
    const numPhotos = loadedImages.length;
    
    // Set appropriate layout based on number of photos
    if (numPhotos === 2) {
      setSelectedLayout('twoPhotos');
    } else if (numPhotos === 3) {
      setSelectedLayout('threePhotos');
    } else if (numPhotos === 4) {
      setSelectedLayout('fourPhotos');
    } else if (numPhotos === 5) {
      setSelectedLayout('fivePhotos');
    }

    // Adjust canvas height
    if (canvasRef.current) {
      canvasRef.current.height = getCanvasHeight(numPhotos);
    }

    // Trigger redraw
    drawCollage();
  }, [loadedImages]);

  // Add dependency to useEffect for redrawing when layout changes
  useEffect(() => {
    drawCollage();
  }, [selectedLayout, selectedTemplate, draggableElements]);

  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing element
    const clickedElement = draggableElements.find(element => {
      const elementX = element.x;
      const elementY = element.y;
      // Approximate click area
      return (x >= elementX - 20 && x <= elementX + 40 &&
              y >= elementY - 20 && y <= elementY + 40);
    });

    if (clickedElement) {
      setIsDragging(true);
      setDraggedElement(clickedElement);
      setDragOffset({
        x: x - clickedElement.x,
        y: y - clickedElement.y
      });
    } else if (isAddingText && text) {
      // Add new text
      const newElement = {
        id: Date.now(),
        type: 'text',
        content: text,
        x: x,
        y: y,
        color: textColor,
        fontSize: textSize,
        font: textFont
      };
      setDraggableElements([...draggableElements, newElement]);
      setText('');
      setIsAddingText(false);
    } else if (selectedEmoji) {
      // Add new emoji
      const newElement = {
        id: Date.now(),
        type: 'emoji',
        content: selectedEmoji,
        x: x,
        y: y,
        fontSize: 24
      };
      setDraggableElements([...draggableElements, newElement]);
      setSelectedEmoji('');
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging && draggedElement) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setDraggableElements(elements =>
        elements.map(el =>
          el.id === draggedElement.id
            ? { ...el, x, y }
            : el
        )
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  const drawElements = (ctx) => {
    draggableElements.forEach(element => {
      ctx.save();
      if (element.type === 'text') {
        ctx.font = `${element.fontSize}px ${element.font}`;
        ctx.fillStyle = element.color;
        ctx.fillText(element.content, element.x, element.y);
      } else if (element.type === 'emoji') {
        ctx.font = `${element.fontSize}px Arial`;
        ctx.fillText(element.content, element.x, element.y);
      }
      ctx.restore();
    });
  };

  const drawCollage = () => {
    if (!canvasRef.current || loadedImages.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const style = templates[selectedTemplate];

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const layout = layoutStyles[selectedLayout];
      if (!layout) {
        console.error('No layout found for:', selectedLayout);
        return;
      }

      const stripLayout = layout.getLayout(canvas.width, canvas.height);
      
      // Draw white background strip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(
        stripLayout.positions[0].x - 10,
        0,
        stripLayout.width + 20,
        canvas.height
      );

      // Draw only the number of images we have
      loadedImages.forEach((img, index) => {
        if (index < stripLayout.positions.length) {
          const pos = stripLayout.positions[index];
          drawTemplate(ctx, img, pos.x, pos.y, pos.width, pos.height, style);
        }
      });

      // Draw draggable elements
      drawElements(ctx);
    } catch (error) {
      console.error('Error drawing collage:', error);
    }
  };

  const drawTemplate = (ctx, img, x, y, width, height, style) => {
    ctx.save();
    
    // Apply template-specific transformations
    if (style.layout === 'scattered') {
      const rotation = Array.isArray(style.rotation) 
        ? Math.random() * (style.rotation[1] - style.rotation[0]) + style.rotation[0]
        : style.rotation;
      
      ctx.translate(x + width/2, y + height/2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-(x + width/2), -(y + height/2));
    }

    // Draw frame
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = style.shadowBlur;
    ctx.fillStyle = style.backgroundColor;

    // Adjust padding based on frame size
    const paddingX = width * 0.05;
    const paddingY = height * 0.05;
    const bottomPadding = height * 0.15;

    ctx.fillRect(x, y, width, height + bottomPadding);

    // Draw border if specified
    if (style.borderColor) {
      ctx.strokeStyle = style.borderColor;
      ctx.lineWidth = Math.min(width, height) * 0.01;
      ctx.strokeRect(x, y, width, height + bottomPadding);
    }

    // Apply image filters
    if (style.filter) {
      ctx.filter = style.filter;
    }

    // Draw the image with adjusted padding
    const imageWidth = width - (paddingX * 2);
    const imageHeight = height - (paddingY * 2);
    
    // Maintain aspect ratio
    const imgAspect = img.width / img.height;
    const frameAspect = imageWidth / imageHeight;
    
    let drawWidth = imageWidth;
    let drawHeight = imageHeight;
    let drawX = x + paddingX;
    let drawY = y + paddingY;

    if (imgAspect > frameAspect) {
      // Image is wider than frame
      drawHeight = drawWidth / imgAspect;
      drawY += (imageHeight - drawHeight) / 2;
    } else {
      // Image is taller than frame
      drawWidth = drawHeight * imgAspect;
      drawX += (imageWidth - drawWidth) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    ctx.restore();
  };

  const getStripDimensions = (layout) => {
    const stripLayout = layout.getLayout(canvasRef.current.width, canvasRef.current.height);
    return {
      x: stripLayout.positions[0].x - 10, // Include the padding
      y: 0,
      width: stripLayout.width + 20,      // Include the padding
      height: canvasRef.current.height
    };
  };

  const cropCanvas = () => {
    const layout = layoutStyles[selectedLayout];
    if (!layout) return null;

    // Create a temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const stripDimensions = getStripDimensions(layout);
    
    // Set the temp canvas size to the strip dimensions
    tempCanvas.width = stripDimensions.width;
    tempCanvas.height = stripDimensions.height;
    
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw only the strip portion onto the temp canvas
    tempCtx.drawImage(
      canvasRef.current,
      stripDimensions.x,
      stripDimensions.y,
      stripDimensions.width,
      stripDimensions.height,
      0,
      0,
      stripDimensions.width,
      stripDimensions.height
    );
    
    return tempCanvas;
  };

  const downloadCollage = () => {
    const croppedCanvas = cropCanvas();
    if (!croppedCanvas) return;

    const link = document.createElement('a');
    link.download = 'photo-strip.png';
    link.href = croppedCanvas.toDataURL('image/png');
    link.click();
  };

  const printCollage = () => {
    const croppedCanvas = cropCanvas();
    if (!croppedCanvas) return;

    const dataUrl = croppedCanvas.toDataURL('image/png');
    
    // Calculate dimensions in inches (assuming 96 DPI)
    const widthInInches = croppedCanvas.width / 96;
    const heightInInches = croppedCanvas.height / 96;
    
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: white;
            }
            .print-container {
              width: ${widthInInches}in;
              height: ${heightInInches}in;
            }
            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            @media print {
              @page {
                size: ${widthInInches + 0.5}in ${heightInInches + 0.5}in;
                margin: 0.25in;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .print-container {
                width: ${widthInInches}in;
                height: ${heightInInches}in;
                position: relative;
              }
              img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <img src="${dataUrl}" />
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 250);
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(windowContent);
    printWindow.document.close();
  };

  const applyImageAdjustments = (ctx, image) => {
    ctx.filter = `
      brightness(${imageAdjustments.brightness}%)
      contrast(${imageAdjustments.contrast}%)
      saturate(${imageAdjustments.saturation}%)
      blur(${imageAdjustments.blur}px)
    `;
  };

  const handleImageAdjustment = (type, value) => {
    setImageAdjustments(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleTextStyleChange = (property, value) => {
    switch(property) {
      case 'color':
        setTextColor(value);
        break;
      case 'size':
        setTextSize(value);
        break;
      case 'font':
        setTextFont(value);
        break;
      default:
        break;
    }
  };

  return (
    <div className="collage-maker-container">
      <div className="controls-panel">
        <div className="layout-info">
          {loadedImages.length < 2 ? (
            <p>Add at least 2 photos to create a photo strip</p>
          ) : (
            <p>Photo strip with {loadedImages.length} photos</p>
          )}
        </div>
        
        <div className="template-selector">
          <h3>Choose Template</h3>
          <div className="template-buttons">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={selectedTemplate === key ? 'active' : ''}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        <div className="layout-selector">
          <h3>Choose Layout</h3>
          <div className="layout-buttons">
            {Object.entries(layoutStyles).map(([key, layout]) => (
              <button
                key={key}
                onClick={() => setSelectedLayout(key)}
                className={selectedLayout === key ? 'active' : ''}
              >
                {layout.name}
              </button>
            ))}
          </div>
        </div>

        <div className="image-adjustments">
          <h3>Image Adjustments</h3>
          <div className="adjustment-slider">
            <label>Brightness</label>
            <input
              type="range"
              min="0"
              max="200"
              value={imageAdjustments.brightness}
              onChange={(e) => handleImageAdjustment('brightness', e.target.value)}
            />
          </div>
          <div className="adjustment-slider">
            <label>Contrast</label>
            <input
              type="range"
              min="0"
              max="200"
              value={imageAdjustments.contrast}
              onChange={(e) => handleImageAdjustment('contrast', e.target.value)}
            />
          </div>
          <div className="adjustment-slider">
            <label>Saturation</label>
            <input
              type="range"
              min="0"
              max="200"
              value={imageAdjustments.saturation}
              onChange={(e) => handleImageAdjustment('saturation', e.target.value)}
            />
          </div>
          <div className="adjustment-slider">
            <label>Blur</label>
            <input
              type="range"
              min="0"
              max="10"
              value={imageAdjustments.blur}
              onChange={(e) => handleImageAdjustment('blur', e.target.value)}
            />
          </div>
        </div>

        <div className="text-controls">
          <h3>Add Text</h3>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
          />
          <div className="text-style-controls">
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleTextStyleChange('color', e.target.value)}
              title="Choose text color"
            />
            <select
              value={textFont}
              onChange={(e) => handleTextStyleChange('font', e.target.value)}
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
            <input
              type="number"
              min="12"
              max="72"
              value={textSize}
              onChange={(e) => handleTextStyleChange('size', e.target.value)}
              title="Font size"
            />
          </div>
          <button
            onClick={() => setIsAddingText(true)}
            className={isAddingText ? 'active' : ''}
          >
            Place Text
          </button>
        </div>

        <div className="emoji-controls">
          <h3>Add Emoji</h3>
          <div className="emoji-categories">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="emoji-category">
                <h4>{category}</h4>
                <div className="emoji-grid">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={selectedEmoji === emoji ? 'active' : ''}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="export-controls">
          <button 
            onClick={downloadCollage} 
            className="download-btn"
            title="Download photo strip"
          >
            Download Strip
          </button>
          <button 
            onClick={printCollage} 
            className="print-btn"
            title="Print photo strip"
          >
            Print Strip
          </button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={getCanvasHeight(loadedImages.length)}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            cursor: isDragging ? 'grabbing' : 
                   (isAddingText || selectedEmoji) ? 'crosshair' : 'default'
          }}
        />
      </div>
    </div>
  );
};

export default CollageMaker;
