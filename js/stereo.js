var KEY = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	PGUP: 33,
	PGDN: 34,
	ADD: 107,
	SUB: 109
}
var stereo = {};
stereo.pressedKeys = [];

$(function() {
	document.getElementById('left-file').addEventListener('change', handleLeftFileSelect, false);
	document.getElementById('right-file').addEventListener('change', handleRightFileSelect, false);

	stereo.leftCanvas = document.getElementById("left-canvas");
	stereo.leftContext = stereo.leftCanvas.getContext("2d");
	stereo.rightCanvas = document.getElementById("right-canvas");
	stereo.rightContext = stereo.rightCanvas.getContext("2d");

	stereo.rightResultCanvas = document.getElementById("right-result-canvas");
	stereo.rightResultContext = stereo.rightResultCanvas.getContext("2d");
	stereo.leftResultCanvas = document.getElementById("left-result-canvas");
	stereo.leftResultContext = stereo.leftResultCanvas.getContext("2d");
	
	stereo.leftScale = 1;
	stereo.rightScale = 1;

	stereo.leftDestWidth = 0;
	stereo.leftDestHeight = 0;
	stereo.rightDestWidth = 0;
	stereo.rightDestHeight = 0;

	stereo.maxWidth = 0;
	stereo.maxHeight = 0;

	stereo.rotationLeft = 0;
	stereo.scaleLeft = 1.0;

	stereo.redTop = 0;
	stereo.redLeft = 0;
});

function loadLeftImage() {
	//	загрузка оригинального изображения для левого глаза
	stereo.leftImage = new Image();
	stereo.leftImage.onload = function() {
		while (!stereo.leftImage.complete) ;
		//	зафиксируем оригинальные ширину и высоту изображения
		stereo.leftSourceWidth = this.width;
		stereo.leftSourceHeight = this.height;
		//	для ландшафтного изображения зададим ширину отображения в 320 пикселей
		if (stereo.leftSourceWidth >= stereo.leftSourceHeight) {
			stereo.leftDestWidth = 320;
			stereo.leftScale = stereo.leftSourceWidth / 320;
			stereo.leftDestHeight = Math.round(stereo.leftSourceHeight / stereo.leftScale);
		}
		//	для портретного изображения зададим высоту отображения в 320 пикселей
		else {
			stereo.leftDestHeight = 320;
			stereo.leftScale = stereo.leftSourceHeight / 320;
			stereo.leftDestWidth = Math.round(stereo.leftSourceWidth / stereo.leftScale);
		}
		//	изменим размер канвы под габариты отображения
		stereo.leftCanvas.width = stereo.leftDestWidth;
		stereo.leftCanvas.height = stereo.leftDestHeight;
		stereo.leftDestX = 0;
		stereo.leftDestY = 0;
		stereo.leftContext.drawImage(stereo.leftImage, stereo.leftDestX, stereo.leftDestY, stereo.leftDestWidth, stereo.leftDestHeight);

		stereo.leftImageData = stereo.leftContext.getImageData(0, 0, stereo.leftDestWidth, stereo.leftDestHeight);
		stereo.leftData = stereo.leftImageData.data;

		stereo.rightResultCanvas.width = stereo.leftDestWidth;
		stereo.rightResultCanvas.height = stereo.leftDestHeight;
		stereo.rightResultContext.drawImage(stereo.leftImage, stereo.leftDestX, stereo.leftDestY, stereo.leftDestWidth, stereo.leftDestHeight);
		stereo.rightResultImageData = stereo.rightResultContext.getImageData(0, 0, stereo.leftDestWidth, stereo.leftDestHeight);
		stereo.rightResultData = stereo.rightResultImageData.data;

		drawAnaglyph();
	}
	stereo.leftImage.src = stereo.leftSource;
}

function loadRightImage() {
	//	загрузка оригинального изображения для левого глаза
	stereo.rightImage = new Image();
	stereo.rightImage.onload = function() {
		while (!stereo.rightImage.complete) ;
		//	зафиксируем оригинальные ширину и высоту изображения
		stereo.rightSourceWidth = this.width;
		stereo.rightSourceHeight = this.height;
		//	для ландшафтного изображения зададим ширину отображения в 320 пикселей
		if (stereo.rightSourceWidth >= stereo.rightSourceHeight) {
			stereo.rightDestWidth = 320;
			stereo.rightScale = stereo.rightSourceWidth / 320;
			stereo.rightDestHeight = Math.round(stereo.rightSourceHeight / stereo.rightScale);
		}
		//	для портретного изображения зададим высоту отображения в 320 пикселей
		else {
			stereo.rightDestHeight = 320;
			stereo.rightScale = stereo.rightSourceHeight / 320;
			stereo.rightDestWidth = Math.round(stereo.rightSourceWidth / stereo.rightScale);
		}
		//	изменим размер канвы под габариты отображения
		stereo.rightCanvas.width = stereo.rightDestWidth;
		stereo.rightCanvas.height = stereo.rightDestHeight;
		stereo.rightDestX = 0;
		stereo.rightDestY = 0;
		stereo.rightContext.drawImage(stereo.rightImage, stereo.rightDestX, stereo.rightDestY, stereo.rightDestWidth, stereo.rightDestHeight);

		stereo.rightImageData = stereo.rightContext.getImageData(0, 0, stereo.rightDestWidth, stereo.rightDestHeight);
		stereo.rightData = stereo.rightImageData.data;

		stereo.leftResultCanvas.width = stereo.leftDestWidth;
		stereo.leftResultCanvas.height = stereo.leftDestHeight;
		stereo.leftResultContext.drawImage(stereo.rightImage, stereo.leftDestX, stereo.leftDestY, stereo.leftDestWidth, stereo.leftDestHeight);
		stereo.leftResultImageData = stereo.leftResultContext.getImageData(0, 0, stereo.leftDestWidth, stereo.leftDestHeight);
		stereo.leftResultData = stereo.leftResultImageData.data;

		drawAnaglyph();
	}
	stereo.rightImage.src = stereo.rightSource;
}

function handleLeftFileSelect(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		if (!f.type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();

		reader.onload = (function(theFile) {
			return function(e) {
				stereo.leftSource = e.target.result;
				loadLeftImage();
			};
		})(f);

		reader.readAsDataURL(f);
	}
}

function handleRightFileSelect(evt) {
	var files = evt.target.files;

	for (var i = 0, f; f = files[i]; i++) {
		if (!f.type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();

		reader.onload = (function(theFile) {
			return function(e) {
				stereo.rightSource = e.target.result;
				loadRightImage();
			};
		})(f);

		reader.readAsDataURL(f);
	}
}

function keycheckloop() {
	var pressed = false;
	if (stereo.pressedKeys[KEY.UP]) {
		stereo.redTop -= 1;
		console.log(stereo.redTop);
		$("#red-canvas").css("top", "" + stereo.redTop + "px");
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.DOWN]) {
		stereo.redTop += 1;
		$("#red-canvas").css("top", "" + stereo.redTop + "px");
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.LEFT]) {
		stereo.redLeft -= 1;
		$("#red-canvas").css("left", "" + stereo.redLeft + "px");
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.RIGHT]) {
		stereo.redLeft += 1;
		$("#red-canvas").css("left", "" + stereo.redLeft + "px");
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.PGUP]) {
		stereo.rotationLeft -= 0.5;
		$("#red-canvas").css({
			"-moz-transform": "rotate(" + stereo.rotationLeft + "deg)" + " scale(" + stereo.scaleLeft + ")",
			"transform": "rotate(" + stereo.rotationLeft + "deg)" + " scale(" + stereo.scaleLeft + ")",
			"-webkit-transform": "rotate(" + stereo.rotationLeft + "deg)" + " scale(" + stereo.scaleLeft + ")"
		});
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.PGDN]) {
		stereo.rotationLeft += 0.5;
		$("#red-canvas").css({
			"-moz-transform": "rotate(" + stereo.rotationLeft + "deg)" + " scale(" + stereo.scaleLeft + ")",
			"transform": "rotate(" + stereo.rotationLeft + "deg)" + " scale(" + stereo.scaleLeft + ")",
			"-webkit-transform": "rotate(" + stereo.rotationLeft + "deg)" + " scale(" + stereo.scaleLeft + ")"
		});
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.ADD]) {
		stereo.scaleLeft += 0.005;
		$("#red-canvas").css({
			"-moz-transform": "scale(" + stereo.scaleLeft + ")" + " rotate(" + stereo.rotationLeft + "deg)",
			"transform": "scale(" + stereo.scaleLeft + ")" + " rotate(" + stereo.rotationLeft + "deg)",
			"-webkit-transform":  "scale(" + stereo.scaleLeft + ")" + " rotate(" + stereo.rotationLeft + "deg)"
		});
		pressed = true;
	}
	if (stereo.pressedKeys[KEY.SUB]) {
		stereo.scaleLeft -= 0.005;
		$("#red-canvas").css({
			"-moz-transform":  "scale(" + stereo.scaleLeft + ")" + " rotate(" + stereo.rotationLeft + "deg)",
			"-webkit-transform":  "scale(" + stereo.scaleLeft + ")" + " rotate(" + stereo.rotationLeft + "deg)"
		});
		pressed = true;
	}
	if (pressed) {
		for (var x = 0; x < stereo.redCanvas.width; x++) {
			for (var y = 0; y < stereo.redCanvas.height; y++) {
				if (((x + stereo.redLeft) > stereo.cyanLeft) && ((x + stereo.redLeft) < (stereo.cyanLeft + stereo.cyanCanvas.width))
					&& ((y + stereo.redTop) > stereo.cyanTop) && ((y + stereo.redTop) < (stereo.cyanTop + stereo.cyanCanvas.height)))
				{
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4] = stereo.rightResultData[y * (stereo.redCanvas.width * 4) + x * 4];
//					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 1] = stereo.rightData[(y + stereo.redTop) * (stereo.redCanvas.width * 4) + (x + stereo.redLeft) * 4 + 1];
//					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 2] = stereo.rightData[(y + stereo.redTop) * (stereo.redCanvas.width * 4) + (x + stereo.redLeft) * 4 + 2];;
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 1] = stereo.leftResultData[(y + stereo.redTop) * (stereo.redCanvas.width * 4) + (x + stereo.redLeft) * 4 + 1];
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 2] = stereo.leftResultData[(y + stereo.redTop) * (stereo.redCanvas.width * 4) + (x + stereo.redLeft) * 4 + 2];;
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 3] = 255;
				}
				else
				{
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4] = stereo.rightResultData[y * (stereo.redCanvas.width * 4) + x * 4];
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 1] = 0;
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 2] = 0;
					stereo.rightData[y * (stereo.redCanvas.width * 4) + x * 4 + 3] = 255;
				}
			}
		}
		stereo.redContext.putImageData(stereo.rightImageData, stereo.rightDestX, stereo.rightDestY);
	}
}

function drawAnaglyph() {
	if (stereo.leftImage == undefined || stereo.rightImage == undefined) {
		$("#left-plus-right").css({
			"visibility": "hidden"
		});
		return;
	}

	stereo.timer = setInterval(keycheckloop, 30);
	
	$(document).keydown(function(e) {
		stereo.pressedKeys[e.which] = true;
	});
	$(document).keyup(function(e) {
		stereo.pressedKeys[e.which] = false;
	});

	if (stereo.leftDestWidth > stereo.rightDestWidth) {
		stereo.maxWidth = stereo.leftDestWidth;
	} else {
		stereo.maxWidth = stereo.rightDestWidth;
	}
	if (stereo.leftDestHeight > stereo.rightDestHeight) {
		stereo.maxHeight = stereo.leftDestHeight;
	} else {
		stereo.maxHeight = stereo.rightDestHeight;
	}

	var top = 55 + stereo.maxHeight;
	$("#left-plus-right").css("top", top);

	$("#right-result-canvas").css("width", stereo.leftDestWidth);
	$("#right-result-canvas").css("height", stereo.leftDestHeight);
	stereo.rightResultCanvas = document.getElementById("right-result-canvas");
	stereo.rightResultContext = stereo.rightResultCanvas.getContext("2d");
	stereo.rightResultContext.putImageData(stereo.leftImageData, stereo.leftDestX, stereo.leftDestY);

	$("#left-result-canvas").css("width", stereo.leftDestWidth);
	$("#left-result-canvas").css("height", stereo.leftDestHeight);
	stereo.leftResultCanvas = document.getElementById("left-result-canvas");
	stereo.leftResultContext = stereo.leftResultCanvas.getContext("2d");
	stereo.leftResultContext.putImageData(stereo.rightImageData, stereo.leftDestX, stereo.leftDestY);

	$("#red-canvas").css("width", stereo.leftDestWidth);
	$("#red-canvas").css("height", stereo.leftDestHeight);
	stereo.redCanvas = document.getElementById("red-canvas");
	stereo.redContext = stereo.redCanvas.getContext("2d");
	stereo.redCanvas.width = stereo.leftDestWidth;
	stereo.redCanvas.height = stereo.leftDestHeight;

	for (var i = 0; i < stereo.leftData.length; i += 4) {
//		stereo.leftData[i] += (0.5 + 0.16) * stereo.leftData[i];
		stereo.leftData[i + 1] = 0;
		stereo.leftData[i + 2] = 0;
		stereo.leftData[i + 3] = 127;
	}
	stereo.redContext.putImageData(stereo.leftImageData, stereo.leftDestX, stereo.leftDestY);

	$("#cyan-canvas").css("width", stereo.rightDestWidth);
	$("#cyan-canvas").css("height", stereo.rightDestHeight);
	stereo.cyanCanvas = document.getElementById("cyan-canvas");
	stereo.cyanContext = stereo.cyanCanvas.getContext("2d");
	stereo.cyanCanvas.width = stereo.rightDestWidth;
	stereo.cyanCanvas.height = stereo.rightDestHeight;

	for (var i = 0; i < stereo.rightData.length; i += 4) {
//		stereo.rightData[i + 1] += 0.34 * stereo.rightData[i + 1];
//		stereo.rightData[i + 2] += 0.34 * stereo.rightData[i + 2];
		stereo.rightData[i] = 0;
//		stereo.rightData[i + 3] = 127;
	}
	stereo.cyanContext.putImageData(stereo.rightImageData, stereo.rightDestX, stereo.rightDestY);
	
	stereo.redLeft = parseInt($("#red-canvas").css("left"));
	stereo.redTop = parseInt($("#red-canvas").css("top"));
	stereo.cyanLeft = parseInt($("#cyan-canvas").css("left"));
	stereo.cyanTop = parseInt($("#cyan-canvas").css("top"));
	
//	stereo.interImageData
	
	$("#left-plus-right").css("visibility", "visible");
}
