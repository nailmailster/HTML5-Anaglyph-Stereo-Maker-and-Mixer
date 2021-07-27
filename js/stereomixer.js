var source1, source2;
var image = new Image();
var image2 = new Image();

var canvas1 = document.getElementById("canvas1");
var context1 = canvas1.getContext("2d");
var originalWidth1, originalHeight1;
var width1, height1, ratio1;
var imageData1, data1;

var layer1 = document.getElementById("layer1");
var layer1 = canvas1.getContext("2d");

var canvas2 = document.getElementById("canvas2");
var context2 = canvas2.getContext("2d");
var originalWidth2, originalHeight2;
var width2, height2, ratio2;
var imageData2, data2;

var canvasColor1 = document.getElementById("canvasColor1");
var contextColor1 = canvasColor1.getContext("2d");
var widthColor1, heightColor1;
var imageDataColor1, dataColor1;
var rotationLeft, scaleLeft;

var canvasColor2 = document.getElementById("canvasColor2");
var contextColor2 = canvasColor2.getContext("2d");
var widthColor2, heightColor2;
var imageDataColor2, dataColor2;
var xRight, yRight;

var canvasBlend = document.getElementById("canvasBlend");
var contextBlend = canvasBlend.getContext("2d");
var widthBlend, heightBlend;
var imageDataBlend, dataBlend;

var cPoints1 = new Array();
var cPoints2 = new Array();

var zCanvas = document.getElementById("zoomCanvas");
var zCtx = zCanvas.getContext("2d");
var zCanvas2 = document.getElementById("zoomCanvas2");
var zCtx2 = zCanvas2.getContext("2d");

var cpCanvas = document.getElementById("cpCanvas1");
var cpCtx = cpCanvas.getContext("2d");
var cpCanvas2 = document.getElementById("cpCanvas2");
var cpCtx2 = cpCanvas2.getContext("2d");

var cpRadius = 0;

var KEY = {
	ESC: 27,
	CTRL: 17,
	UP: 87,		//38,
	DOWN: 83,	//40,
	LEFT: 65,	//37,
	RIGHT: 68,	//39,
	PGUP: 188,	//33,
	PGDN: 190,	//34,
	ADD: 90,	//107,
	SUB: 88,	//109
	M: 77,
	C: 67
};
var pressedKeys = [];
var timer;

var firstLoad = true;

var enlarged = false;

function file1Select(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		if (!f.type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();

		reader.onload = (function(theFile) {
			return function(e) {
				source1 = e.target.result;
				loadImage1();
				firstLoad = false;
			};
		})(f);

		reader.readAsDataURL(f);
	}
}

function file2Select(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		if (!f.type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();

		reader.onload = (function(theFile) {
			return function(e) {
				source2 = e.target.result;
				loadImage2();
				firstLoad = false;
			};
		})(f);

		reader.readAsDataURL(f);
	}
}

function loadImage1() {
	image.src = source1;
}

function loadImage2() {
	image2.src = source2;
}

image.onload = function() {
	originalWidth1 = this.width;
	originalHeight1 = this.height;
	ratio1 = originalWidth1 / originalHeight1;
	if (ratio1 > 1) {
		width1 = 320;
		height1 = Math.round(width1 / ratio1);
	}
	else {
		height1 = 320;
		width1 = Math.round(height1 * ratio1);
	}
	$("#canvas1").css("width", width1);
	$("#canvas1").css("height", height1);
	$("#layers1").css("width", 320);
	$("#layers1").css("height", height1);
	canvas1.width = width1;
	canvas1.height = height1;
	$("#cpCanvas1").css("width", width1);
	$("#cpCanvas1").css("height", height1);
	$("#cpCanvas1").css("left", 320 - width1);
	cpCanvas.width = width1;
	cpCanvas.height = height1;
	context1.drawImage(this, 0, 0, width1, height1);
	
	imageData1 = context1.getImageData(0, 0, width1, height1);
	data1 = imageData1.data;

	if (!firstLoad) {
		cPoints1.length = 0;
		cPoints2.length = 0;
	}

	setColor1();
	drawAnaglyph();
};

image2.onload = function() {
	originalWidth2 = this.width;
	originalHeight2 = this.height;
	ratio2 = originalWidth2 / originalHeight2;
	if (ratio2 > 1) {
		width2 = 320;
		height2 = Math.round(width2 / ratio2);
	}
	else {
		height2 = 320;
		width2 = Math.round(height2 * ratio2);
	}
	$("#canvas2").css("width", width2);
	$("#canvas2").css("height", height2);
	$("#layers2").css("width", 320);
	$("#layers2").css("height", height2);
	canvas2.width = width2;
	canvas2.height = height2;
	$("#cpCanvas2").css("width", width2);
	$("#cpCanvas2").css("height", height2);
	cpCanvas2.width = width2;
	cpCanvas2.height = height2;
	context2.drawImage(this, 0, 0, width2, height2);
	
	imageData2 = context2.getImageData(0, 0, width2, height2);
	data2 = imageData2.data;
	
	setColor2();
	drawAnaglyph();

	if (firstLoad) {
		cPoints1.push({ "x": 62, "y": 238, });
		cPoints1.push({ "x": 312, "y": 178, });
		cPoints2.push({ "x": 45, "y": 236, });
		cPoints2.push({ "x": 290, "y": 176, });
		xRight = 17.2;
		yRight = 2;
/*		cPoints1.push({ "x": 109, "y": 195, });
		cPoints1.push({ "x": 215, "y": 201, });
		cPoints2.push({ "x": 82, "y": 195, });
		cPoints2.push({ "x": 192, "y": 199, });
		xRight = 27;
		yRight = 4;*/
	}

	drawBlend();

	if (firstLoad) {
		showFullSize();
		firstLoad = false;
	}
};

function drawAnaglyph() {
	if (imageData1 == undefined || imageData2 == undefined) {
		return;
	}
	xRight = 0;
	yRight = 0;
	rotationLeft = 0.0;
	scaleLeft = 1.0;
	setBlend();
	//timer = setInterval(keycheckloop, 30);
	setInterval(keycheckloop, 30);
	$(document).keydown(function(e) {
		pressedKeys[e.which] = true;
	});
	$(document).keyup(function(e) {
		pressedKeys[e.which] = false;
	});
}

function setColor1() {
	widthColor1 = width1;
	heightColor1 = height1;
	$("#canvasColor1").css("width", widthColor1);
	$("#canvasColor1").css("height", heightColor1);
	canvasColor1.width = widthColor1;
	canvasColor1.height = heightColor1;
	
	contextColor1.putImageData(imageData1, 0, 0);
	imageDataColor1 = contextColor1.getImageData(0, 0, widthColor1, heightColor1);
	dataColor1 = imageDataColor1.data;

	for (var x = 0; x < widthColor1; x++) {
		for (var y = 0; y < heightColor1; y++) {
			dataColor1[y * (widthColor1 * 4) + (x * 4) + 1] = 0;
			dataColor1[y * (widthColor1 * 4) + (x * 4) + 2] = 0;
		}
	}
	contextColor1.putImageData(imageDataColor1, 0, 0);
}

function setColor2() {
	widthColor2 = width2;
	heightColor2 = height2;
	$("#canvasColor2").css("width", widthColor2);
	$("#canvasColor2").css("height", heightColor2);
	canvasColor2.width = widthColor2;
	canvasColor2.height = heightColor2;
	
	contextColor2.putImageData(imageData2, 0, 0);
	imageDataColor2 = contextColor2.getImageData(0, 0, widthColor2, heightColor2);
	dataColor2 = imageDataColor2.data;

	for (var x = 0; x < widthColor2; x++) {
		for (var y = 0; y < heightColor2; y++) {
			dataColor2[y * (widthColor2 * 4) + (x * 4)] = 0;
		}
	}
	contextColor2.putImageData(imageDataColor2, 0, 0);
}

function setBlend() {
	widthBlend = 453;
	heightBlend = 453;
	$("#canvasBlend").css("width", 453);
	$("#canvasBlend").css("height", 453);

	canvasBlend.width = widthBlend;
	canvasBlend.height = heightBlend;

	xRight = 0;
	yRight = 0;
	scaleLeft = 1.0;
	
	drawBlend();
}

function showFullSize() {
	var canvasFull = document.getElementById("canvasFull");
	var contextFull = canvasFull.getContext("2d");
	var widthFull = originalWidth1;
	var heightFull = originalHeight1;
	canvasFull.width = widthFull;
	canvasFull.height = heightFull;
	k = widthFull / width1;
	$("#canvasFull").css("width", widthFull);
	$("#canvasFull").css("height", heightFull);

	var canvasFull1 = document.getElementById("canvasFull1");
	var contextFull1 = canvasFull1.getContext("2d");
	var widthFull1 = originalWidth1;
	var heightFull1 = originalHeight1;
	canvasFull1.width = widthFull1;
	canvasFull1.height = heightFull1;

	contextFull1.drawImage(image, 0, 0, widthFull1, heightFull1);
	var imageDataFull1 = contextFull1.getImageData(0, 0, widthFull1, heightFull1);
	var dataFull1 = imageDataFull1.data;
//	for (var x = 0; x < widthFull1; x++) {
//		for (var y = 0; y < heightFull1; y++) {
//			dataFull1[y * (widthFull1 * 4) + (x * 4) + 1] = 0;
//			dataFull1[y * (widthFull1 * 4) + (x * 4) + 2] = 0;
//		}
//	}
	contextFull1.putImageData(imageDataFull1, 0, 0);

	var canvasFull2 = document.getElementById("canvasFull2");
	var contextFull2 = canvasFull2.getContext("2d");
	var widthFull2 = originalWidth2;
	var heightFull2 = originalHeight2;
	canvasFull2.width = widthFull2;
	canvasFull2.height = heightFull2;

	contextFull2.drawImage(image2, 0, 0, widthFull2, heightFull2);
	var imageDataFull2 = contextFull2.getImageData(0, 0, widthFull2, heightFull2);
	var dataFull2 = imageDataFull2.data;
//	for (var x = 0; x < widthFull2; x++) {
//		for (var y = 0; y < heightFull2; y++) {
//			dataFull2[y * (widthFull2 * 4) + (x * 4)] = 0;
//		}
//	}
	contextFull2.putImageData(imageDataFull2, 0, 0);
	
//	contextFull.save();
//	contextFull.translate(widthFull / 2, heightFull / 2);
//	contextFull.rotate(rotationLeft);
//	contextFull.scale(scaleLeft, scaleLeft);
//	contextFull.drawImage(canvasFull1, 0, 0, widthFull1, heightFull1, -widthFull1 / 2, -heightFull1 / 2, widthFull1, heightFull1);
//	contextFull.restore();
	contextFull.save();
	contextFull.translate(widthFull / 2, heightFull / 2);
	contextFull.globalCompositeOperation = "lighter";
	contextFull.drawImage(canvasFull2, 0, 0, widthFull2, heightFull2, xRight * k - widthFull2 / 2, yRight * k - heightFull2 / 2, widthFull2, heightFull2);
	contextFull.restore();

	var imgWidth = widthFull1;
	var imgHeight = heightFull1;
	if (imgWidth > originalWidth1) {
		imgWidth = originalWidth1;
		imgHeight = originalHeight1;
	}

/*	var fontSize = Math.round(imgWidth / 100);
	if (fontSize < 12) fontSize = 12;
	var textX = Math.round(imgWidth / 2);
	var textY = Math.round(imgHeight / 15);
	contextFull.font = "" + fontSize + "pt 'Orbitron'";
	contextFull.fillStyle = "cyan";
	contextFull.textAlign = "center";
	contextFull.textBaseline = "top";
	contextFull.fillText("mixed with www.stereomixer.hostzi.com", textX, textY);
	contextFull.fillText("mixed with www.stereomixer.hostzi.com", textX - 1, textY - 1);
	contextFull.fillText("mixed with www.stereomixer.hostzi.com", textX - 2, textY - 2);
	contextFull.fillStyle = "red";
	contextFull.fillText("mixed with www.stereomixer.hostzi.com", textX - 2, textY - 2);*/

	var img = canvasFull.toDataURL("image/jpeg");
	$("#fullImage").attr("src", img);

	if (widthFull < $(document).width()) {
		$("#fullImage").css("width", widthFull1);
		$("#fullImage").css("height", heightFull1);
		$("#fullImage").css("cursor", "default");
	}
	else {
		$("#fullImage").css("width", "100%");
		$("#fullImage").css("height", "auto");
		$("#fullImage").css("cursor", "url(images/zoomin.png), pointer");
		document.getElementById('fullImage').addEventListener('click', fullImageClick, false);
	}

	$("#fullImage").css("display", "block");
}

function fullImageClick() {
	if (!enlarged) {
		var widthFull1 = originalWidth1;
		var heightFull1 = originalHeight1;
		$("#fullImage").css("width", widthFull1);
		$("#fullImage").css("height", heightFull1);
		$("#fullImage").css("cursor", "url(images/zoomout.png), pointer");
		enlarged = true;
	} else {
		$("#fullImage").css("width", "100%");
		$("#fullImage").css("height", "auto");
		$("#fullImage").css("cursor", "url(images/zoomin.png), pointer");
		enlarged = false;
	}
}

function drawBlend() {
	canvasBlend.width = widthBlend;

	if (xRight < (width2 / 2 - widthBlend / 2 - 300)) {
		xRight = width2 / 2 - widthBlend / 2 - 300;
	}
	if (yRight < (height2 / 2 - heightBlend / 2 - 300)) {
		yRight = height2 / 2 - heightBlend / 2 - 300;
	}
	contextBlend.save();
	contextBlend.translate(widthBlend / 2, heightBlend / 2);
	contextBlend.rotate(rotationLeft);
	contextBlend.scale(scaleLeft, scaleLeft);
	contextBlend.drawImage(canvasColor1, 0, 0, width1, height1, -width1 / 2, -height1 / 2, width1, height1);
	contextBlend.restore();
	contextBlend.translate(widthBlend / 2, heightBlend / 2);
	contextBlend.globalCompositeOperation = "lighter";
	contextBlend.drawImage(canvasColor2, 0, 0, width2, height2, xRight - width2 / 2, yRight - height2 / 2, width2, height2);
}

function keycheckloop() {
	var pressed = false;
	if (pressedKeys[KEY.ESC]) {
		location.reload(true);
	}
	if (pressedKeys[KEY.UP]) {
		yRight -= 0.5;
		pressed = true;
	}
	if (pressedKeys[KEY.DOWN]) {
		yRight += 0.5;
		pressed = true;
	}
	if (pressedKeys[KEY.LEFT]) {
		xRight -= 0.5;
		pressed = true;
	}
	if (pressedKeys[KEY.RIGHT]) {
		xRight += 0.5;
		pressed = true;
	}
	if (pressedKeys[KEY.PGUP]) {
		rotationLeft -= 0.005;
		pressed = true;
	}
	if (pressedKeys[KEY.PGDN]) {
		rotationLeft += 0.005;
		pressed = true;
	}
	if (pressedKeys[KEY.ADD]) {
		scaleLeft += 0.005;
		pressed = true;
	}
	if (pressedKeys[KEY.SUB]) {
		scaleLeft -= 0.005;
		pressed = true;
	}
	if (pressed) {
		cPoints1.length = 0;
		cPoints2.length = 0;
		cpRadius = 0;
		drawBlend();
	}
}

$("#layers1").mousemove(function(e) {
	if (imageData1 == undefined || imageData2 == undefined) {
		return;
	}
	if (cPoints1.length != cPoints2.length) {
		return;
	}
	if (pressedKeys[KEY.CTRL] || pressedKeys[KEY.C]) {
		var w = 100;
		var h = 100;

		var mouseX = e.pageX - this.offsetLeft - (320 - width1);
		var mouseY = e.pageY - this.offsetTop;
		$("#zoomCanvas").css("left", mouseX + (320 - width1) - 50);
		$("#zoomCanvas").css("top", mouseY - 50);
		$("#zoomCanvas").css("display", "block");

		zCanvas.width = 100;
		zCanvas.height = 100;

		var k = originalWidth1 / width1;
		var sourceX = Math.round(mouseX * k) - 50;
		var sourceY = Math.round(mouseY * k) - 50;
		var deltaX = 0, deltaY = 0;
		if (sourceX < 0) {
			deltaX = sourceX * -1;
		}
		else if ((sourceX + 100) >= originalWidth1) {
			w -= (sourceX + 100) - originalWidth1;
		}
		if (sourceY < 0) {
			deltaY = sourceY * -1;
		}
		else if ((sourceY + 100) >= originalHeight1) {
			h -= (sourceY + 100) - originalHeight1;
		}
		zCtx.drawImage(image, sourceX + deltaX, sourceY + deltaY, w - deltaX, h - deltaY, 0 + deltaX, 0 + deltaY, w - deltaX, h - deltaY);
	}
	else {
		$("#zoomCanvas").css("display", "none");
	}
});

$("#layers2").mousemove(function(e) {
	if (imageData1 == undefined || imageData2 == undefined) {
		return;
	}
	if (cPoints1.length == cPoints2.length) {
		return;
	}
	if (cPoints2.length > 1) {
		return;
	}
	if (pressedKeys[KEY.CTRL] || pressedKeys[KEY.C]) {
		var w = 100;
		var h = 100;

		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		$("#zoomCanvas2").css("left", mouseX - 50);
		$("#zoomCanvas2").css("top", mouseY - 50);
		$("#zoomCanvas2").css("display", "block");

		zCanvas2.width = 100;
		zCanvas2.height = 100;

		var k = originalWidth2 / width2;
		var sourceX = Math.round(mouseX * k) - 50;
		var sourceY = Math.round(mouseY * k) - 50;
		var deltaX = 0, deltaY = 0;
		if (sourceX < 0) {
			deltaX = sourceX * -1;
		}
		else if ((sourceX + 100) >= originalWidth2) {
			w -= (sourceX + 100) - originalWidth2;
		}
		if (sourceY < 0) {
			deltaY = sourceY * -1;
		}
		else if ((sourceY + 100) >= originalHeight2) {
			h -= (sourceY + 100) - originalHeight2;
		}
		zCtx2.drawImage(image2, sourceX + deltaX, sourceY + deltaY, w - deltaX, h - deltaY, 0 + deltaX, 0 + deltaY, w - deltaX, h - deltaY);
	}
	else {
		$("#zoomCanvas2").css("display", "none");
	}
});

$("#layers1").mousedown(function(e) {
	if (imageData1 == undefined || imageData2 == undefined) {
		return;
	}
	if (cPoints1.length != cPoints2.length) {
		return;
	}
	if (cPoints1.length > 1) {
		cPoints1.length = 0;
		cPoints2.length = 0;
	}
	var mouseX = e.pageX - this.offsetLeft - (320 - width1);
	var mouseY = e.pageY - this.offsetTop;
	cPoints1.push({ "x": mouseX, "y": mouseY, });
	$("#zoomCanvas").css("display", "none");
});

$("#layers2").mousedown(function(e) {
	if (imageData1 == undefined || imageData2 == undefined) {
		return;
	}
	if (cPoints1.length == cPoints2.length) {
		return;
	}
	if (cPoints2.length > 1) {
		return;
	}
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;
	cPoints2.push({ "x": mouseX, "y": mouseY, });

	var leftStartX = cPoints1[0].x;
	var leftStartY = cPoints1[0].y;
	var rightStartX = cPoints2[0].x;
	var rightStartY = cPoints2[0].y;
	
	if (cPoints1.length == 1) {
		xRight = leftStartX - rightStartX + (width2 - width1) / 2;
		yRight = leftStartY - rightStartY + (height2 - height1) / 2;
		rotationLeft = 0.0;
		scaleLeft = 1;
	}
	else {
		var leftEndX = cPoints1[1].x;
		var leftEndY = cPoints1[1].y;
		var rightEndX = cPoints2[1].x;
		var rightEndY = cPoints2[1].y;

		var vLeft = {
			x: leftEndX - leftStartX,
			y: leftEndY - leftStartY
		};
		var length1 = Math.sqrt(Math.pow(vLeft.x, 2) + Math.pow(vLeft.y, 2));
		vLeft.x /= length1;
		vLeft.y /= length1;

		var vRight = {
			x: rightEndX - rightStartX,
			y: rightEndY - rightStartY
		};
		var length2 = Math.sqrt(Math.pow(vRight.x, 2) + Math.pow(vRight.y, 2));
		vRight.x /= length2;
		vRight.y /= length2;
		
		var cos = vLeft.x * vRight.x + vLeft.y * vRight.y;
		rotationLeft = Math.acos(cos);

		if (vLeft.y > vRight.y || vLeft.x < 0) {
			rotationLeft = Math.PI * 2 - rotationLeft;
		}

/*
		if (vLeft.x > 0 && vLeft.y < 0 && vRight.x < 0 && vRight.y < 0) {
			rotationLeft = -rotationLeft;
		}
		else if (vLeft.x > 0 && vLeft.y > 0 && vRight.x < 0 && vRight.y > 0) {
			rotationLeft = Math.PI * 2 - rotationLeft;
		}
*/
		if (vLeft.x < 0 && vLeft.y > 0 && vRight.x < 0 && vRight.y > 0 && vLeft.x > vRight.x) {
			rotationLeft = Math.PI * 2 - rotationLeft;
		}
		else if (vLeft.x < 0 && vLeft.y < 0 && vRight.x > 0 && vRight.y < 0 && vLeft.x < vRight.x) {
			rotationLeft = Math.PI * 2 - rotationLeft;
		}

		scaleLeft = length2 / length1;

		cos = Math.cos(rotationLeft);
		var sin = Math.sin(rotationLeft);
		var x = width1 / 2 - leftStartX;
		var y = height1 / 2 - leftStartY;
		
		var newX = (x * cos - y * sin) * scaleLeft;
		var newY = (y * cos + x * sin) * scaleLeft;

		xRight += x - newX;
		yRight += y - newY;
		
/*		console.log("x = " + x);
		console.log("y = " + y);
		console.log("newX = " + newX);
		console.log("newY = " + newY);
		console.log("angle = " + rotationLeft);*/
	}
	$("#zoomCanvas2").css("display", "none");
	drawBlend();
});

function cpNextFrame() {
	cpRadius += 3;
	
	if (cpRadius > 25) {
		cpRadius = 0;
	}
	cpCtx.beginPath();
	cpCtx.clearRect(0, 0, cpCtx.canvas.width, cpCtx.canvas.height);
	if (cPoints1.length > 0) {
		cpCtx.strokeStyle = "red";
		cpCtx.lineWidth = 2;
		cpCtx.arc(cPoints1[0].x, cPoints1[0].y, cpRadius, 0, Math.PI * 2, true);
		cpCtx.stroke();
	}
	cpCtx2.beginPath();
	cpCtx2.clearRect(0, 0, cpCtx.canvas.width, cpCtx.canvas.height);
	if (cPoints2.length > 0) {
		cpCtx2.strokeStyle = "red";
		cpCtx2.lineWidth = 2;
		cpCtx2.arc(cPoints2[0].x, cPoints2[0].y, cpRadius, 0, Math.PI * 2, true);
		cpCtx2.stroke();
	}
	if (cPoints1.length > 1) {
		cpCtx.beginPath();
		cpCtx.strokeStyle = "cyan";
		cpCtx.lineWidth = 2;
		cpCtx.arc(cPoints1[1].x, cPoints1[1].y, cpRadius, 0, Math.PI * 2, true);
		cpCtx.stroke();
	}
	if (cPoints2.length > 1) {
		cpCtx2.beginPath();
		cpCtx2.strokeStyle = "cyan";
		cpCtx2.lineWidth = 2;
		cpCtx2.arc(cPoints2[1].x, cPoints2[1].y, cpRadius, 0, Math.PI * 2, true);
		cpCtx2.stroke();
	}
}

$(function() {
	firstLoad = true;
	enlarged = false;

	document.getElementById('file1').addEventListener('change', file1Select, false);
	document.getElementById('file2').addEventListener('change', file2Select, false);
	
	document.getElementById('file1').focus();

	width1 = 320;
	height1 = 240;
	$("#canvas1").css("width", width1);
	$("#canvas1").css("height", height1);
	canvas1.width = width1;
	canvas1.height = height1;

	width2 = 320;
	height2 = 240;
	$("#canvas2").css("width", width2);
	$("#canvas2").css("height", height2);
	canvas2.width = width2;
	canvas2.height = height2;

	widthBlend = 320;
	heightBlend = 240;
	$("#canvasBlend").css("width", widthBlend);
	$("#canvasBlend").css("height", heightBlend);
	canvasBlend.width = widthBlend;
	canvasBlend.height = heightBlend;

	image.src = "images/sl.jpg";
	image2.src = "images/sr.jpg";

	cpRadius = 0;
	setInterval(cpNextFrame, 100);
});
