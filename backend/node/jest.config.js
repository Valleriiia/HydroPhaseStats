module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    "controllers/*.js",
    "services/*.js",
    "middleware/*.js",
    "!**/node_modules/**"
  ]
};
