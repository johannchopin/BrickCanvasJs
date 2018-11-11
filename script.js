const LEGO_IN_ROW = 48;
var input = document.getElementById("file");
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.setAttribute("id", "imgInCanvas");


// Main function
window.onload = function() {
	input.addEventListener('change', async function(e) {

		// Array with average color from areas in selected img
		const IMG_COLORS_ARRAY = await handleFiles(input.files);

		console.log(IMG_COLORS_ARRAY);
	}, false)
}


/*
*
* CridColor object constructor
*
*/
var GridColor = function(array) {
	this.datas = array;
};
GridColor.prototype.showDatas = function() {
	console.log(this.datas);
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
			colorsGrid[row][col] = averageColor(cropDatas.data);
		
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
		rgb = {r:0, g:0, b:0},
		i = -4; // Will be increment by 4 in the while loop
		blockSize = 5, // only visit every 5 pixels
		length = datas.length;

	while ( (i += blockSize * 4) < length ) {
        rgb.r += datas[i];
        rgb.g += datas[i + 1];
        rgb.b += datas[i + 2];
        totalColorCount++;
    }

    // Calculate the average color
    rgb.r = Math.trunc(rgb.r / totalColorCount);
    rgb.g = Math.trunc(rgb.g / totalColorCount);
    rgb.b = Math.trunc(rgb.b / totalColorCount);

    return rgb;
}