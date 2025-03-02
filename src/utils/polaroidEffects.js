import { Circle, Path, Rect, Image } from 'fabric';

export const addFilmSprockets = (frame) => {
  const sprocketSize = 10;
  const sprocketCount = 8;
  
  for (let i = 0; i < sprocketCount; i++) {
    const topSprocket = new Circle({
      radius: sprocketSize/2,
      fill: 'black',
      left: i * (frame.width/sprocketCount),
      top: -sprocketSize
    });
    
    const bottomSprocket = new Circle({
      radius: sprocketSize/2,
      fill: 'black',
      left: i * (frame.width/sprocketCount),
      top: frame.height
    });
    
    frame.add(topSprocket, bottomSprocket);
  }
};

export const addScrapbookElements = (frame) => {
  // Add decorative corners
  const cornerSize = 30;
  const corners = [
    { x: 0, y: 0, rotation: 0 },
    { x: frame.width, y: 0, rotation: 90 },
    { x: frame.width, y: frame.height, rotation: 180 },
    { x: 0, y: frame.height, rotation: 270 }
  ];

  corners.forEach(corner => {
    const decorativeCorner = new Path('M 0 0 L 30 0 L 30 5 L 5 5 L 5 30 L 0 30 Z', {
      fill: 'rgba(255,255,255,0.5)',
      stroke: '#ffb6c1',
      strokeWidth: 1,
      left: corner.x,
      top: corner.y,
      angle: corner.rotation
    });
    frame.add(decorativeCorner);
  });
};

export const addTapeEffect = (frame) => {
  const tapeWidth = 40;
  const tapeHeight = 30;
  
  const tape = new Rect({
    width: tapeWidth,
    height: tapeHeight,
    fill: 'rgba(255,255,255,0.5)',
    opacity: 0.5,
    angle: (Math.random() - 0.5) * 20,
    left: frame.width/2 - tapeWidth/2,
    top: -tapeHeight/2
  });
  
  frame.add(tape);
};

export const addVintageEffect = (frame, img) => {
  img.filters.push(
    new Image.filters.Sepia(),
    new Image.filters.Brightness({ brightness: 0.1 })
  );
  img.applyFilters();
}; 