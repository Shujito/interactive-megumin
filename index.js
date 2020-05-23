// game logic starts here
function main() {
	// query for the canvas
	let canvas = document.querySelector('canvas');
	// 2d context is used for drawing stuff
	let ctx = canvas.getContext('2d');
	// these are the bounds of the canvas (position relative to the <body> and it's size)
	let bounds = canvas.getBoundingClientRect();
	// aka pixel density (e.g. macbooks have a dpr of 2)
	let devicePixelRatio = window.devicePixelRatio;
	// new canvas measurements
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
	canvas.width = bounds.width * devicePixelRatio;
	canvas.height = bounds.height * devicePixelRatio;
	// here be graphic layers, do query every time
	let layers = {
		body: () => document.querySelector('#body'),
		hat: () => document.querySelector('#hat'),
		panties: () => document.querySelector('#panties'),
		choker: () => document.querySelector('#choker'),
		gloves: () => document.querySelector('#gloves'),
		dress: () => document.querySelector('#dress'),
		cloak: () => document.querySelector(layers.dress.hidden ? '#cloak2' : '#cloak1'),
		socks: () => document.querySelector('#socks'),
		goo: () => document.querySelector('#goo'),
	}
	// call this to update the scene
	function update() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for (let layer in layers) {
			if (!layers[layer].hidden) {
				ctx.globalCompositeOperation = layer === 'goo' ? 'multiply' : 'source-over'
				let image = layers[layer]();
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
			}
		}
	}
	// draw right now!
	requestAnimationFrame(update);
	// create an offscreen canvas to detect
	// transparency whenever something
	// is clicked/touched
	let offScreenCanvas = document.createElement('canvas');
	offScreenCanvas.width = canvas.width;
	offScreenCanvas.height = canvas.height;
	let offScreenCanvas2D = offScreenCanvas.getContext("2d")
	// canvas' click event
	canvas.onclick = e => {
		// query bounds every time
		let newBounds = canvas.getBoundingClientRect();
		// calculate positions
		let xPos = (e.clientX - newBounds.left) * devicePixelRatio;
		let yPos = (e.clientY - newBounds.top) * devicePixelRatio;
		// whether anything was hit
		let something = false;
		// iterate individual images
		for (let layer of Object.keys(layers).reverse()) {
			// don't detect the body tho,
			// or it'll disappear when touched
			// ( floating clothes haha )
			if (layer === 'body') continue;
			// get the image now
			let image = layers[layer]();
			// wipe the offscreen canvas
			offScreenCanvas2D.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);
			// put the image there
			offScreenCanvas2D.drawImage(image, 0, 0, image.width, image.height);
			// find the pixel where the image was touched
			let imageData = offScreenCanvas2D.getImageData(xPos, yPos, 1, 1).data;
			// if the pixel is half transparent then hide it
			let visible = [...imageData][3] >= 128;
			// hide if visible, ignore if already hidden
			if (visible && !layers[layer].hidden) {
				layers[layer].hidden = something = true;
				break;
			}
		}
		// nothing was touched, show everything
		if (!something) {
			for (let layer in layers) {
				layers[layer].hidden = false;
			}
		}
		// draw here!
		requestAnimationFrame(update);
	};
}