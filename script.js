const LEGO_IN_ROW = 48;
const COLORS = new Map([
	["red", [255,0,0]],
	["green", [0,255,0]],
	["blue", [0,0,255]],
	["black", [0,0,0]]
]);

// Datas found here -> https://lego.fandom.com/wiki/Colour_Palette
// Key -> legoColorId / Value -> rgbArray
const LEGO_COLORS = new Map([
	[194, [156,146,145]],
	[1,   [255,255,255]],
	[199, [76,81,86]],
	[26,  [0,0,0]],
	[5,   [217,187,123]],
	[192, [91,28,12]],
	[21,  [255,0,0]],
	[24,  [255,255,0]],
	[23,  [0,0,255]],
	[106, [255,102,0]],
	[28,  [0,153,0]],
	[154, [128,8,27]],
	[119, [149,185,11]],
	[191, [244,155,0]],
	[324, [160,110,185]],
	[138, [141,116,82]],
	[322, [104,195,226]]
]);

// Datas found here -> http://brickarchitect.com/2018/lego_colors/
const LEGO_COLORS_NAME = new Map([
	[194, "Medium Stone Grey"],
	[1,   "White"],
	[199, "Dark Stone Grey"],
	[26,  "Black"],
	[5,   "Brick Yellow"],
	[192, "Reddish Brown"],
	[21,  "Bright Red"],
	[24,  "Bright Yellow"],
	[23,  "Bright Blue"],
	[106, "Bright Orange"],
	[28,  "Dark Green"],
	[154, "Dark Red"],
	[119, "Bright Yellowwish Green"],
	[191, "Flame Yellowwish Orange"],
	[324, "Medium Lavender"],
	[138, "Sand Yellow"],
	[322, "Medium Azur"]
]);

var input = document.getElementById("file");

// Create canvas to work
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.setAttribute("id", "imgInCanvas");


// Main function
window.onload = function() {
	input.addEventListener('change', async function(e) {

		// Array with average color from areas in selected img
		const IMG_COLORS_ARRAY = await handleFiles(input.files);

		// Create GridColor object
		var img = new GridColor(IMG_COLORS_ARRAY);
		
		// Insert in DOM a svg representation from the given array
		document.body.appendChild(representDatas(600, IMG_COLORS_ARRAY));

	}, false)
}


/*
*
* CridColor object constructor
*
*/
var GridColor = function(array) {
	this.datas = array;
	this.showDatas = function() {
		console.log(this.datas);
	};
};


function processDatas(datas) {
	var explodedImg = new GridColor(datas);
	explodedImg.showDatas();
}


// Create Promise with the datas from img
function handleFiles(files) {
	let reader = new FileReader();
	reader.readAsDataURL(files[0]);

	// Create Promise 
	return new Promise(resolve => {
		reader.onload = function () {
			const img = new Image();
			img.src = reader.result;

			img.onload = function () {
			    let context = canvas.getContext('2d');
			  	let imgWdt = img.width;
				let imgHgt = img.height;
				
				// Fix canvas size
				canvas.width  = imgWdt;
				canvas.height = imgHgt;

			    context.drawImage(img, 0, 0);

			    // Value of the Promise
			    resolve(getContextDatas(context));
			}
		}
	});
}



// Return array with average colors [Order: top left to bottom right]
function getContextDatas(context) {
	var legoWdt = canvas.width / LEGO_IN_ROW;
	var legoHgt = legoWdt;
	var legoInColumn = Math.trunc(canvas.height / legoHgt);

	let colorsGrid = [];
	let cropBeginTop  = 0;
	let cropBeginLeft;
	let cropDatas;

	// Parse all row from the canvas
	for (let row = 0; row < legoInColumn; row++) {
		colorsGrid[row] = [];
		cropBeginLeft = 0;
		// Parse all column in row from the canvas
		for (let col = 0; col < LEGO_IN_ROW; col++) {
			cropDatas = context.getImageData(cropBeginLeft, cropBeginTop, legoWdt, legoHgt);
			
			// Add average color from the area in colorsGrid
			let averageColorZone = averageColor(cropDatas.data);
			let nearestLegoColor = nearestColor(LEGO_COLORS, averageColorZone);
			colorsGrid[row][col] = nearestLegoColor;
		
			// Go to the next column	
			cropBeginLeft += legoWdt;
		}
		cropBeginTop += legoHgt; // Go to the next row
	}
	return colorsGrid;
}


// Return the average color from canvas zone's datas
function averageColor(datas) {
	let totalColorCount = 0,
		rgba = [0,0,0,0];

		i = -4; // Will be increment by 4 in the while loop
		blockSize = 5, // only visit every 5 pixels
		length = datas.length;

	while ( (i += blockSize * 4) < length ) {
        rgba[0] += datas[i];
        rgba[1] += datas[i + 1];
        rgba[2] += datas[i + 2];
        rgba[3] += datas[i + 3];
        totalColorCount++;
    }

    // Calculate the average color
    rgba[0] = Math.trunc(rgba[0] / totalColorCount);
    rgba[1] = Math.trunc(rgba[1] / totalColorCount);
    rgba[2] = Math.trunc(rgba[2] / totalColorCount);
    rgba[3] = Math.trunc(rgba[3] / totalColorCount);

    return rgba;
}


// Return the nearest defined color from a given rgba color
function nearestColor(givenColors, rgbArray) {
	// Initialize a to big dispertion index
	const COLOR_NAME_INDEX = 0;
	const DISPERTION_VALUE_INDEX = 1;
	let nearestColor = ["notARealColor", 600];

	// Calcul all the dispertion index for each colors
	for (let key of givenColors.keys()) {
		let dispersionValue = 0;
 
		for (let i = 0; i < rgbArray.length - 1; i++) {
			dispersionValue += Math.abs(rgbArray[i] - givenColors.get(key)[i]);
		}

		if(dispersionValue < nearestColor[DISPERTION_VALUE_INDEX]) {
			nearestColor = [key, dispersionValue]
		};
	}
	return nearestColor[COLOR_NAME_INDEX];
}


// Return a svg representation from an array
function representDatas(svgWdth, datasArray) {
	var rowNumber = datasArray.length;
	var colNumber = datasArray[0].length;

	var rectWdt = Math.trunc(svgWdth / colNumber);
	var rectHgt = rectWdt;

	var svgHgt = rowNumber * rectHgt;

	// Coordinate y for the svg's element 
	let y = 0;

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWdth);
    svg.setAttribute("height", svgHgt);

    let svgNS = svg.namespaceURI;
    let rect = document.createElementNS(svgNS,'rect');

	// Parse all rows from the array
	for (let i = 0; i < rowNumber; i++) {
		// Coordinate x for the svg's element
		let x = 0;
    	let g = document.createElementNS(svgNS,'g');
    	g.setAttribute("transform", "translate(0," + Math.trunc(i * rectHgt) + ")");
		
		// Parse all columns from the array
		for (let j = 0; j < colNumber; j++) {
			let legoColor = LEGO_COLORS.get(datasArray[i][j]);
			let colorR = legoColor[0],
				colorG = legoColor[1],
				colorB = legoColor[2];
			let color = "rgb(" + colorR + "," + colorG + "," + colorB + ")";

			let rect = document.createElementNS(svgNS,'rect');
			rect.setAttribute("width", rectWdt);
    		rect.setAttribute("height", rectHgt);
    		rect.setAttribute("x", Math.trunc(j * rectWdt));
    		rect.setAttribute("fill", color);
    		g.appendChild(rect);
		}
		svg.appendChild(g);
	}
	return svg;
}