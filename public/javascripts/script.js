const { JSDOM } = require("jsdom");
const { window } = new JSDOM();
const { document } = window;

// Make GSAP use the jsdom window and document
global.window = window;
global.document = document;

// Now you can use GSAP
const gsap = require("gsap");
