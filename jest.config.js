/* eslint linebreak-style: ["error", "windows"] */
process.env.REGION = 'us-west-2';
process.env.SCRECRT_KEY_NAME = 'CUSTOM_KEY';
module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageReporters: [
    'text-summary',
    'json',
    'html',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.aws-sam/'],
};