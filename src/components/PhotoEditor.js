import React, { useRef, useEffect, useState } from 'react';
import { Canvas, Image as FabricImage, filters } from 'fabric';
import Button from './ui/Button';
import Select from './ui/Select';

const PhotoEditor = ({ image, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [fabricImage, setFabricImage] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('none');

  useEffect(() => {
    const newCanvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
    });

    // Create new image object from data URL
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const fabricImg = new FabricImage(img, {
        scaleX: Math.min(800 / img.width, 1),
        scaleY: Math.min(600 / img.height, 1),
      });

      // Center the image
      fabricImg.set({
        left: (800 - fabricImg.width * fabricImg.scaleX) / 2,
        top: (600 - fabricImg.height * fabricImg.scaleY) / 2,
      });

      newCanvas.add(fabricImg);
      newCanvas.setActiveObject(fabricImg);
      newCanvas.renderAll();
      
      setCanvas(newCanvas);
      setFabricImage(fabricImg);
    };

    return () => {
      newCanvas.dispose();
    };
  }, [image]);

  const applyFilter = (filterType) => {
    if (!fabricImage) return;

    // Clear existing filters
    fabricImage.filters = [];

    switch (filterType) {
      case 'grayscale':
        fabricImage.filters.push(new filters.Grayscale());
        break;
      case 'sepia':
        fabricImage.filters.push(new filters.Sepia());
        break;
      case 'invert':
        fabricImage.filters.push(new filters.Invert());
        break;
      default:
        break;
    }

    fabricImage.applyFilters();
    canvas.renderAll();
    setCurrentFilter(filterType);
  };

  const handleSave = () => {
    if (canvas) {
      const dataUrl = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.8,
        width: canvas.width,
        height: canvas.height
      });
      onSave(dataUrl);
    }
  };

  return (
    <div className="photo-editor">
      <div className="editor-controls">
        <Select 
          value={currentFilter}
          onValueChange={applyFilter}
        >
          <option value="none">No Filter</option>
          <option value="grayscale">Grayscale</option>
          <option value="sepia">Sepia</option>
          <option value="invert">Invert</option>
        </Select>
        <Button onClick={handleSave}>Save Photo</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PhotoEditor;
