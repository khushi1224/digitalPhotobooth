import { useRef, useEffect } from "react";
import Button from './components/ui/Button';
import { fabric } from "fabric";
import html2canvas from "html2canvas";

export default function CollageMaker({ images, onSave }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (images.length > 0) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#fff",
      });
      
      images.forEach((image, index) => {
        fabric.Image.fromURL(image, (img) => {
          img.set({
            left: (index % 2) * 400 + 50,
            top: Math.floor(index / 2) * 300 + 50,
            scaleX: 0.4,
            scaleY: 0.4,
          });
          canvas.add(img);
        });
      });
    }
  }, [images]);

  const downloadCollage = async () => {
    const canvasElement = canvasRef.current;
    const dataUrl = await html2canvas(canvasElement).then((canvas) => canvas.toDataURL("image/png"));
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "collage.png";
    link.click();
  };

  const printCollage = () => {
    const canvasElement = canvasRef.current;
    html2canvas(canvasElement).then((canvas) => {
      const dataUrl = canvas.toDataURL("image/png");
      const newWindow = window.open("", "_blank");
      newWindow.document.write('<img src="' + dataUrl + '" onload="window.print();window.close();" />');
      newWindow.document.close();
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <canvas ref={canvasRef} className="border rounded-lg shadow-lg" />
      <Button onClick={() => onSave(canvasRef.current.toDataURL())}>
        Save Collage
      </Button>
      <Button onClick={downloadCollage}>Download Collage</Button>
      <Button onClick={printCollage}>Print Collage</Button>
    </div>
  );
}