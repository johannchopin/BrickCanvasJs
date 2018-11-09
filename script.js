var legoInRow = 48;


// Start the process
window.onload = function() {
	input.addEventListener('change', function(e) {
		handleFiles(input.files);
	}, false)
}

var input = document.getElementById("file");
var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.setAttribute("id", "imgInCanvas");



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

function handleFiles(files) {
	let reader = new FileReader();

	reader.onload = function () {
		const img = new Image();
		img.onload = function () {
		    let context = canvas.getContext('2d');
		  	let imgWdt = img.width;
			let imgHgt = img.height;
			
			// Fix canvas size
			canvas.width  = imgWdt;
			canvas.height = imgHgt;

		    context.drawImage(img, 0, 0);

		    processDatas(getContextDatas(context));
		}
		img.src = reader.result;
	}
	reader.readAsDataURL(files[0]);
}



// Return array with average colors [Order: top left to bottom right]
function getContextDatas(context) {
	var legoWdt = canvas.width / legoInRow;
	var legoHgt = legoWdt;
	var legoInColumn = Math.trunc(canvas.height / legoHgt);

	var colorsGrid = [];
	let cropBeginTop  = 0;
	let cropBeginLeft;
	let cropDatas;

	// Parse all row from the canvas
	for (let row = 0; row < legoInColumn; row++) {
		colorsGrid[row] = [];
		cropBeginLeft = 0;
		// Parse all column in row from the canvas
		for (let col = 0; col < legoInRow; col++) {
			cropDatas = context.getImageData(cropBeginLeft, cropBeginTop, legoWdt, legoHgt);
			colorsGrid[row][col] = averageColor(cropDatas.data);
			cropBeginLeft += legoWdt; // Go to the next column
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

    // Calc the average
    rgb.r = Math.trunc(rgb.r / totalColorCount);
    rgb.g = Math.trunc(rgb.g / totalColorCount);
    rgb.b = Math.trunc(rgb.b / totalColorCount);

    return rgb;
}