// DOM elements
const activeToolEl = document?.getElementById("active-tool");
const brushColorBtn = document?.getElementById("brush-color");
const brushIcon = document?.getElementById("brush");
const brushSize = document?.getElementById("brush-size");
const brushSlider = document?.getElementById("brush-slider");
const bucketColorBtn = document?.getElementById("bucket-color");
const eraser = document?.getElementById("eraser");
const clearCanvasBtn = document?.getElementById("clear-canvas");
const saveStorageBtn = document?.getElementById("save-storage");
const loadStorageBtn = document?.getElementById("load-storage");
const clearStorageBtn = document?.getElementById("clear-storage");
const downloadBtn = document?.getElementById("download");
const body = document?.body;

// Create canvas
const canvas = document?.createElement("canvas");
const context = canvas.getContext("2d");
canvas.id = "canvas";

// Global Variables
const DELAY_MS = 2000;
let brushCurrentSize = 10;
let bucketColor = "#ffffff";
let brushCurrentColor = "#000000";
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];

// Brush size
const displayBrushSize = function () {
  // Show size
  brushSize.textContent = brushCurrentSize;
  // Add 0 before if it's one digit
  if (brushCurrentSize < 10) brushSize.textContent = `0${brushCurrentSize}`;
};

// Set brush size
brushSlider.addEventListener("change", () => {
  // Take the value form the slider
  brushCurrentSize = brushSlider.value;
  //
  displayBrushSize();
});

// Set brush color
brushColorBtn.addEventListener("change", () => {
  // Disable the eraser
  isEraser = false;
  // Take the color from the color picker
  brushCurrentColor = brushColorBtn.value;
});

// Set background color
bucketColorBtn.addEventListener("change", () => {
  // Take the color from the color picker
  bucketColor = bucketColorBtn.value;
  // Fill the canvas with the new bucket color
  createCanvas();
  restoreCanvas();
});

// Eraser
eraser.addEventListener("click", () => {
  // Enable the eraser
  isEraser = true;
  // Change brush and eraser icon's color
  brushIcon.style.color = "white";
  eraser.style.color = "black";
  // Show the eraser as active tool
  activeToolEl.textContent = "Eraser";
  // Set the eraser color to be the same with the background color
  brushCurrentColor = bucketColor;
  // Set the default size to 50, move the slider and display the value
  brushCurrentSize = 50;
  brushSlider.value = 50;
  displayBrushSize();
});

// Switch back to brush
function switchToBrush() {
  // Disable the eraser
  isEraser = false;
  // Change brush and eraser icon's color
  brushIcon.style.color = "black";
  eraser.style.color = "white";
  // Show the brush as active tool
  activeToolEl.textContent = "Brush";
  // Set the brush color to color picker
  brushCurrentColor = brushColorBtn.value;
  // Set slider and size to default and diplay it
  brushSlider.value = 10;
  brushCurrentSize = 10;
  displayBrushSize();
}

// Event listener
brushIcon.addEventListener("click", switchToBrush);

// Switch to brush, with delay
const delaySwitchToBrush = function (ms) {
  setTimeout(switchToBrush, ms);
};

// Create canvas
const createCanvas = function () {
  // Set the dimensions as big as the window, minus the instrument bar
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 50;
  // Create a rectangle background tacking the whole width and height and fill it with the color from picker
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  // Append the canvas to the body
  body.appendChild(canvas);
  // When the canvas is created, the brush is the initial selected tool
  switchToBrush();
};

// Clear canvas
clearCanvasBtn.addEventListener("click", () => {
  //
  createCanvas();
  // Clear the drawing
  drawnArray = [];
  // Show message
  activeToolEl.textContent = "Canvas Cleared";
  // Switch to brush, with delay
  delaySwitchToBrush(DELAY_MS);
});

// Draw what is stored in drawn array
const restoreCanvas = function () {
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
};

// Store drawn lines in array
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

// Get mouse position
const getMousePosition = function (event) {
  // Get the dom rect of the canvas, to use the left and top info
  const boundaries = canvas.getBoundingClientRect();
  // Get the coordinates of the mouse click by subtracting the boundaries from the total X and Y position of the window
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
};

// Mouse clicked
canvas.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  // Get the mouse coordinates in an object
  const currentPosition = getMousePosition(event);
  // Use coordinates to intialize draw
  context.beginPath();
  context.moveTo(currentPosition.x, currentPosition.y);
  // Set line width to brush size
  context.lineWidth = brushCurrentSize;
  // Set line end to round
  context.lineCap = "round";
  // Set line color to brush color
  context.strokeStyle = brushCurrentColor;
});

// Mouse move
canvas.addEventListener("mousemove", (event) => {
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
      brushCurrentSize,
      brushCurrentColor,
      isEraser
    );
  } else {
    // Store undefined when mouse is not clicked
    storeDrawn(undefined);
  }
});

// Mouse unclicked
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// Save to local storage
saveStorageBtn.addEventListener("click", () => {
  // Store the array in local storage (as string)
  localStorage.setItem("savedCanvas", JSON.stringify(drawnArray));
  // Show confirmation
  activeToolEl.textContent = "Canvas Saved";
  // Switch to brush, with delay
  delaySwitchToBrush(DELAY_MS);
});

// Load from local storage
loadStorageBtn.addEventListener("click", () => {
  // Check if there's any drawing saved
  if (localStorage.getItem("savedCanvas")) {
    // Load the local storage to drawn array
    drawnArray = JSON.parse(localStorage.savedCanvas);
    // Draw what is stored in array
    restoreCanvas();
    // Show confirmation
    activeToolEl.textContent = "Canvas Loaded";
    // Switch to brush, with delay
    delaySwitchToBrush(DELAY_MS);
  } else {
    // Show error if there's no drawing
    activeToolEl.textContent = "Canvas not found";
    // Switch to brush, with delay
    delaySwitchToBrush(DELAY_MS);
  }
});

// Clear local storage
clearStorageBtn.addEventListener("click", () => {
  // Remove drawing from local storage
  localStorage.removeItem("savedCanvas");
  // Show confirmation message
  activeToolEl.textContent = "Local Storage Cleared";
  // Switch to brush, with delay
  delaySwitchToBrush(DELAY_MS);
});

// Download image
downloadBtn.addEventListener("click", () => {
  // Set file type and quality
  downloadBtn.href = canvas.toDataURL("image/jpeg", 1);
  // Set file name
  downloadBtn.download = "paint-file.jpeg";
  // Show confirmation message
  activeToolEl.textContent = "Image File Saved";
  // witch to brush, with delay
  delaySwitchToBrush(DELAY_MS);
});

// Initialization
createCanvas();
