import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrush,
  faFillDrip,
  faEraser,
  faUndoAlt,
  faDownload,
  faUpload,
  faTrashAlt,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

const Toolbar = () => {
  const canvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState("Brush");
  const [brushSize, setBrushSize] = useState(10);
  const [bucketColor, setBucketColor] = useState("#ffffff");
  const [isEraser, setIsEraser] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [drawnArray, setDrawnArray] = useState([]);

  useEffect(() => {
    const canvas = document.createElement("canvas"); // Create the canvas element
    canvas.id = "canvas";
    const context = canvas.getContext("2d"); // Get the canvas context
    canvasRef.current = { canvas, context }; // Attach the canvas element and context to the ref
  }, []);

  const switchToBrush = useCallback(() => {
    setActiveTool("Brush");
    setBrushColor(brushColor); // Set brush color to current color
    setBrushSize(brushSize); // Set brush size to current size
  }, [brushColor, brushSize]);

  const handleEraser = () => {
    setIsEraser(true);
    setActiveTool("Eraser");
    setBrushColor(bucketColor);
    setBrushSize(50);
  };

  const createCanvas = useCallback(() => {
    const { canvas, context } = canvasRef.current;
    if (canvas && context) {
      // Set the dimensions as big as the window, minus the instrument bar
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 50;

      // Create a rectangle background taking the whole width and height and fill it with the color from picker
      context.fillStyle = bucketColor;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Append the canvas to the body
      document.body.appendChild(canvas);
    }
  }, [bucketColor]);

  const restoreCanvas = useCallback(() => {
    const { context } = canvasRef.current;
    if (context) {
      console.log("LOOP", context);
      for (let i = 1; i < drawnArray.length; i++) {
        // Initiate path
        context.beginPath();
        // Use coordinates from array to draw path
        context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
        context.lineTo(drawnArray[i].x, drawnArray[i].y);
        context.stroke();
        // Use line width from array to draw same size
        context.lineWidth = drawnArray[i].size;
        // Use a round line ending
        context.lineCap = "round";
        // Use the color from array or erase using the color from background
        drawnArray[i].eraser
          ? (context.strokeStyle = bucketColor)
          : (context.strokeStyle = drawnArray[i].color);
      }
    }
  }, [bucketColor, drawnArray]);

  console.log("RESTORE ARRAY", drawnArray);
  useEffect(() => {
    createCanvas();
  }, [createCanvas]);

  useEffect(() => {
    const { canvas, context } = canvasRef.current;
    let isMouseDown = false;
    const storeDrawn = function (x, y, size, color, erase) {
      // Create line object
      const line = {
        x,
        y,
        size,
        color,
        erase,
      };
      // Push object to array
      drawnArray.push(line);
    };

    const getMousePosition = (event) => {
      // Get the dom rect of the canvas, to use the left and top info
      const boundaries = canvas.getBoundingClientRect();
      // Get the coordinates of the mouse click by subtracting the boundaries from the total X and Y position of the window
      return {
        x: event.clientX - boundaries.left,
        y: event.clientY - boundaries.top,
      };
    };
    const handleMouseDown = (event) => {
      const context = canvas.getContext("2d");
      isMouseDown = true;

      // Get the mouse coordinates in an object
      const currentPosition = getMousePosition(event);
      // Use coordinates to intialize draw
      context.beginPath();
      context.moveTo(currentPosition.x, currentPosition.y);
      // Set line width to brush size
      context.lineWidth = brushSize;
      // Set line end to round
      context.lineCap = "round";
      // Set line color to brush color
      context.strokeStyle = brushColor;
    };

    // Mouse move
    const handleMouseMove = (event) => {
      if (isMouseDown) {
        // Get the mouse coordinates in an object
        const currentPosition = getMousePosition(event);
        // Draw
        context.lineTo(currentPosition.x, currentPosition.y);
        context.stroke();
        // Store the drawing in object and push to array
        storeDrawn(
          currentPosition.x,
          currentPosition.y,
          brushSize,
          brushColor,
          isEraser
        );
      } else {
        // Store undefined when mouse is not clicked
        storeDrawn(undefined);
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [brushColor, brushSize, drawnArray, isEraser]);

  const handleBrushSizeChange = (event) => {
    setBrushSize(event.target.value);
  };

  const handleBrushColorChange = (event) => {
    setBrushColor(event.target.value);
    setIsEraser(false);
  };

  const handleBucketColorChange = (event) => {
    setBucketColor(event.target.value);
    createCanvas();
    restoreCanvas();
  };

  const handleClearCanvas = () => {
    createCanvas();
    setDrawnArray([]);
    setActiveTool("Canvas Cleared");
    setTimeout(() => setActiveTool("Brush"), 2000);
  };

  const handleSaveStorage = () => {
    localStorage.setItem("savedCanvas", JSON.stringify(drawnArray));
    setActiveTool("Canvas Saved");
    setTimeout(() => setActiveTool("Brush"), 2000);
  };

  const handleLoadStorage = () => {
    if (localStorage.getItem("savedCanvas")) {
      setDrawnArray(JSON.parse(localStorage.getItem("savedCanvas")));
      setActiveTool("Canvas Loaded");
      setTimeout(() => setActiveTool("Brush"), 2000);
    } else {
      setActiveTool("Canvas not found");
      setTimeout(() => setActiveTool("Brush"), 2000);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem("savedCanvas");
    setActiveTool("Local Storage Cleared");
    setTimeout(() => setActiveTool("Brush"), 2000);
  };

  const handleDownload = () => {
    const { canvas } = canvasRef.current;
    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/jpeg", 1);
    downloadLink.download = "paint-file.jpeg";
    downloadLink.click();
    setActiveTool("Image File Saved");
    setTimeout(() => setActiveTool("Brush"), 2000);
  };

  return (
    <div className="top-bar">
      {/* Active Tool */}
      <div className="active-tool">
        <span id="active-tool" title="Active Tool">
          {activeTool}
        </span>
      </div>
      {/* Brush */}
      <div className="brush tool">
        <FontAwesomeIcon
          onClick={switchToBrush}
          className="fas"
          icon={faBrush}
          id="brush"
          title="Brush"
        />
        <input
          value={brushColor}
          data-jscolor={{
            preset: "dark",
            closeButton: true,
            closeText: "OK",
          }}
          className="jscolor color-input"
          id="brush-color"
          onChange={handleBrushColorChange}
        />
        <span className="size" id="brush-size" title="Brush Size">
          {brushSize}
        </span>
        <input
          type="range"
          min="1"
          max="50"
          value={brushSize}
          className="slider"
          id="brush-slider"
          onChange={handleBrushSizeChange}
        />
      </div>
      {/* Bucket */}
      <div className="bucket tool">
        <FontAwesomeIcon
          className="fas"
          icon={faFillDrip}
          title="Background Color"
        />
        <input
          value={bucketColor}
          data-jscolor={{
            preset: "dark",
            closeButton: true,
            closeText: "OK",
          }}
          className="jscolor color-input"
          id="bucket-color"
          onChange={handleBucketColorChange}
        />
      </div>
      {/* Eraser */}
      <div className="tool" onClick={handleEraser}>
        <FontAwesomeIcon
          className="fas"
          icon={faEraser}
          id="eraser"
          title="Eraser"
        />
      </div>
      {/* Clear Canvas */}
      <div className="tool" onClick={handleClearCanvas}>
        <FontAwesomeIcon
          className="fas"
          icon={faUndoAlt}
          id="clear-canvas"
          title="Clear"
        />
      </div>
      {/* Save Local Storage */}
      <div className="tool" onClick={handleSaveStorage}>
        <FontAwesomeIcon
          className="fas"
          icon={faDownload}
          id="save-storage"
          title="Save Local Storage"
        />
      </div>
      {/* Load Local Storage */}
      <div className="tool" onClick={handleLoadStorage}>
        <FontAwesomeIcon
          className="fas"
          icon={faUpload}
          id="load-storage"
          title="Load Local Storage"
        />
      </div>
      {/* Clear Local Storage */}
      <div className="tool" onClick={handleClearStorage}>
        <FontAwesomeIcon
          className="fas fa-trash-alt"
          icon={faTrashAlt}
          id="clear-storage"
          title="Clear Local Storage"
        />
      </div>
      {/* Download Image */}
      <div className="tool" onClick={handleDownload}>
        <a id="download">
          <FontAwesomeIcon
            className="fas"
            icon={faSave}
            title="Save Image File"
          />
        </a>
      </div>
    </div>
  );
};

export default Toolbar;
