const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const copyContainer = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const lockButtons = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

/*
========================================================================================
									INITIALIZERS
========================================================================================
*/
function randomColors() {
  initialColors = []; // must empty out initial colors everytime generateBtn is clicked
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    }
    initialColors.push(randomColor.hex());
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    adjustContrast(randomColor, hexText);
    adjustContrast(randomColor, adjustButtons[index]);
    adjustContrast(randomColor, lockButtons[index]);

    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    colorizeSliders(randomColor, hue, brightness, saturation);
  });
  updateValues();
  console.log(initialColors);
}

/*
========================================================================================
									LISTENERS
========================================================================================
*/
sliders.forEach((slide) => {
  slide.addEventListener("input", hslControls);
});

currentHexes.forEach((colorText) => {
  colorText.addEventListener("click", () => {
    copyToClipboard(colorText);
  });
});

copyContainer.addEventListener("transitionend", () => {
  copyContainer.classList.remove("active");
  const copyPopup = copyContainer.children[0];
  copyPopup.classList.remove("active");
});

adjustButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    colorDivs[index].classList.toggle("locked");
    button.children[0].classList.toggle("fa-lock");
    button.children[0].classList.toggle("fa-lock-open");
  });
});

generateBtn.addEventListener("click", randomColors);

/*
========================================================================================
										UTILS
========================================================================================
*/
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function adjustContrast(color, text) {
  const brightness = chroma(color).luminance();
  if (brightness > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

/*
	Make the slider values that appear on the screen when the user first hits the 
	page represent the actual color that was randomly generated.
*/
function updateValues() {
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const index = slider.getAttribute("data-hue");
      const hueValue = chroma(initialColors[index]).hsl()[0]; //.hsl() returns an arr; ind[0]=hue, ind[1]=sat, ind[2]=bright
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const index = slider.getAttribute("data-bright");
      const brightValue = chroma(initialColors[index]).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const index = slider.getAttribute("data-sat");
      const satValue = chroma(initialColors[index]).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function colorizeSliders(color, hue, brightness, saturation) {
  //Scale Saturation
  const noSatColor = color.set("hsl.s", 0);
  const fullSatColor = color.set("hsl.s", 1);
  const scaleSatFunc = chroma.scale([noSatColor, color, fullSatColor]);

  //Scale Brightness/Luminance
  const brightnessOriginal = color.set("hsl.l", 0.5);

  //Update Input Slider Background Color
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSatFunc(
    0
  )}, ${scaleSatFunc(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, black, ${brightnessOriginal}, white)`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

/*
========================================================================================
									CALLBACKS
========================================================================================
*/
function hslControls(e) {
  const index =
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const bright = sliders[1];
  const sat = sliders[2];

  //   const currentColor = colorDivs[index].querySelector("h2").innerText;
  const currentColor = initialColors[index];
  let newColor = chroma(currentColor)
    .set("hsl.h", hue.value)
    .set("hsl.s", sat.value)
    .set("hsl.l", bright.value);

  colorDivs[index].style.backgroundColor = newColor.hex();
  colorDivs[index].querySelector("h2").innerText = newColor.hex();

  adjustContrast(newColor.hex(), colorDivs[index].querySelector("h2"));
  adjustContrast(newColor.hex(), adjustButtons[index]);
  adjustContrast(newColor.hex(), lockButtons[index]);

  colorizeSliders(newColor, hue, bright, sat);
}

function copyToClipboard(colorText) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = colorText.innerText;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  copyContainer.classList.add("active");
  const copyPopup = copyContainer.children[0];
  copyPopup.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

/*
========================================================================================
									LOCAL STORAGE SECTION
========================================================================================
*/
const saveButton = document.querySelector(".save");
const saveContainer = document.querySelector(".save-container");
const savePopup = document.querySelector(".save-popup");
const closeSaveButton = document.querySelector(".close-save");
const submitSaveButton = document.querySelector(".submit-save");
const saveInput = document.querySelector(".save-name");
const libraryContainer = document.querySelector(".library-container");
const libraryPopup = document.querySelector(".library-popup");
const libraryButton = document.querySelector(".library");
const closeLibraryButton = document.querySelector(".close-library");

saveButton.addEventListener("click", () => {
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
});

closeSaveButton.addEventListener("click", () => {
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
});

submitSaveButton.addEventListener("click", savePalettes);

libraryButton.addEventListener("click", () => {
  libraryContainer.classList.add("active");
  libraryPopup.classList.add("active");
});

closeLibraryButton.addEventListener("click", () => {
  libraryContainer.classList.remove("active");
  libraryPopup.classList.remove("active");
});

function savePalettes(e) {
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");

  // Define Object Properties
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  localPalettes = localStorage.getItem("palettes");
  const localPalettesLength =
    localPalettes !== null ? JSON.parse(localPalettes).length : 0;
  let paletteIndex = localPalettesLength;
  console.log(paletteIndex);

  // Generate Object
  const paletteObject = {
    name: name,
    colors: colors,
    paletteIndex: paletteIndex,
  };

  generatePaletteEntries(paletteObject);

  // Push to Local Storage
  saveToLocalStorage(paletteObject);
  saveInput.value = "";
}

function saveToLocalStorage(paletteObject) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObject);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem("palettes") !== null) {
    const localPalettes = JSON.parse(localStorage.getItem("palettes"));
    localPalettes.forEach((paletteObject) => {
      generatePaletteEntries(paletteObject);
    });
  }
}

// Generate Palette Sub-Container for Library Popup Container
function generatePaletteEntries(paletteObject) {
  // Generate Library Entry for Current Palette
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");

  const title = document.createElement("h4");
  title.innerText = paletteObject.name;

  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObject.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteButton = document.createElement("button");
  paletteButton.classList.add("pick-palette-btn");
  paletteButton.classList.add(paletteObject.paletteIndex);
  paletteButton.innerText = "Select";

  // Note 1
  paletteButton.addEventListener("click", () => {
    initialColors = [];
    const colors = paletteObject.colors;
    colors.forEach((color) => {
      initialColors.push(color);
    });
    colorDivs.forEach((colorDiv, index) => {
      colorDiv.style.background = colors[index];
      colorDiv.children[0].innerText = colors[index];
      const sliders = colorDiv.querySelectorAll(".sliders input");
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];
      colorizeSliders(chroma(colors[index]), hue, brightness, saturation);
    });
    updateValues();
  });

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteButton);

  libraryPopup.appendChild(palette);
}

/*
========================================================================================
									INVOCATIONS
========================================================================================
*/
getLocal();
randomColors();

/*
  NOTES

  Note 1
    
    On paletteButton's, we can't do the traditional: 
      const paletteButton = document.querySelectorAll(".pick-palette-btn");
    and then a forEach loop to attach a click eventListener on all of them at once. That is because paletteButton 
    along with the whole custom-palette div are dynamically generated. Hence, the best way is to add the evenListener 
    each time we create them (aka inside the savePalettes() function).

*/
