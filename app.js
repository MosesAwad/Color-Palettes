const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
let initialColors;

/*
========================================================================================
									INITIALIZERS
========================================================================================
*/
function randomColors() {
	initialColors = [];
	colorDivs.forEach((div, index) => {
	  const hexText = div.children[0];
	  const randomColor = generateHex();
	  initialColors.push(randomColor.hex());
  
	  div.style.backgroundColor = randomColor;
	  hexText.innerText = randomColor;
  
	  adjustContrast(randomColor, hexText);
  
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

  colorizeSliders(newColor, hue, bright, sat);
}

/*
========================================================================================
									INVOCATIONS
========================================================================================
*/
randomColors();
