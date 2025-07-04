import "@testing-library/jest-dom";
import "jest-canvas-mock";

if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}

if (typeof TextDecoder === "undefined") {
  global.TextDecoder = require("util").TextDecoder;
}

jest.mock('./src/config', () => ({
  VITE_API: 'http://mock-api:3000/api/auth/notes',
}));