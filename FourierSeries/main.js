const range = 1.2;
const coefficients = [];
let terms = [];
let scalingFactor;

let t = 0;

const numOfTerms = 30; // Actual number of terms is 2 * numOfterms + 1;

let trailX = [];
let trailY = [];

let fileData;
let coords = [];

function preload() {
	fileData = loadStrings("coords.txt");
}

function setup() {
	createCanvas(720, 720);
	ellipseMode(RADIUS);

	for (let i = 0; i < fileData.length; i++) {
		const splitted = fileData[i].split(' ');
		const num = {
			real: float(splitted[0]),
			imaginary: float(splitted[1]),
		}
		if (!isNaN(num.real))
			coords.push(num);
	}

	scalingFactor = width / (2 * range);

	// Calculate coefficients.
	for (let n = -numOfTerms; n <= numOfTerms; n++) {
		//coefficients.push(coefficient(x => new Complex(x, Math.sin(x * TAU * 3)), n));
		const func = x => new Complex(coords[round(x * (coords.length - 1))].real, coords[round(x * (coords.length - 1))].imaginary);
		coefficients.push(coefficient(func, n));
	}
}

function draw() {
	background(51);

	// Calculate each term of the sequence.
	// Tn = e ^ (tau * i * n * t) * Cn
	for (let n = 0; n < coefficients.length; n++) {
		const exponential = Complex.exp(new Complex(0, TAU * (n - numOfTerms) * t));
		terms[n] = {
			val: Complex.mult(exponential, coefficients[n]),
			freq: n - numOfTerms
		};
	}

	terms.sort((a, b) => (Math.abs(a.freq) > Math.abs(b.freq)) ? 1 : -1);

	// Draw real and imaginary axis.
	strokeWeight(1);
	stroke(255);
	line(0, height / 2, width, height / 2);
	line(width / 2, 0, width / 2, height);

	// Mouse coordinates.
	stroke(0);
	fill(255);
	text(canvasToX(mouseX).toFixed(2) + ' ' + canvasToY(mouseY).toFixed(2), mouseX, mouseY);

	// Draw circles and vectors.
	let sum = new Complex();
	let lastSum = new Complex();

	for (let n = 0; n < terms.length; n++) {
		lastSum = sum.copy();
		sum.add(terms[n].val);

		stroke(255, 0, 0, 100);
		line(xToCanvas(lastSum.real), yToCanvas(lastSum.imaginary), xToCanvas(sum.real), yToCanvas(sum.imaginary));

		noFill();
		stroke(255, 255, 255, 100);
		ellipse(xToCanvas(lastSum.real), yToCanvas(lastSum.imaginary), terms[n].val.getMagnitude() * scalingFactor);

		noStroke();
		fill(0, 0, 0, 100);
		ellipse(xToCanvas(sum.real), yToCanvas(sum.imaginary), min(terms[n].val.getMagnitude() / range * 12.2 + 1, 8));
	}

	// Draw trail.
	if (t <= 1.1 && t > 0) {
		trailX.unshift(sum.real);
		trailY.unshift(sum.imaginary);
		// trailY.unshift(0);
	}

	noFill();
	stroke(255, 255, 0);
	beginShape();
	for (let i = trailX.length - 1; i >= 0; i--) {
		// vertex(xToCanvas(trailX[i]), (trailY[i]) + height / 2);
		vertex(xToCanvas(trailX[i]), yToCanvas(trailY[i]));
		// trailY[i]++;
	}
	endShape();

	if (frameRate() !== 0) {
		t += 1 / (frameRate() * 10);
	}
}

function canvasToX(coord) {
	return map(coord, 0, width, -range, range);
}

function canvasToY(coord) {
	return map(coord, 0, height, range, -range);
}

function xToCanvas(x) {
	return map(x, -range, range, 0, width);
}

function yToCanvas(y) {
	return map(y, -range, range, height, 0);
}

function stepFunction(n) {
	if (n === 0 || n % 2 === 0) return new Complex();
	return new Complex(0, -2 / (n * PI));
}

function coefficient(func, n) {
	const newFunc = k => Complex.mult(func(k), Complex.exp(new Complex(0, -TAU * k * n)));
	return integral(newFunc, 0, 1, 1e4);
}

function integral2(func, xMin, xMax, stepSize) {
	const result = new Complex();
	for (let i = 0; i < (xMax - xMin) / stepSize; i++) {
		result.add(func(i * stepSize + xMin).mult(stepSize));
	}
	return result;
}

function integral(func, xMin, xMax, quantity) {
	const result = new Complex();
	const stepSize = (xMax - xMin) / quantity;
	for (let i = 0; i < quantity; i++) {
		result.add(func(i * stepSize + xMin).mult(stepSize));
	}
	return result;
}
