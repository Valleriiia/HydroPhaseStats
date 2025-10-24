module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    "services/pdfService.js",
  "services/pngService.js",
  "controllers/uploadController.js",
  "controllers/analysisController.js"
  ]
};
