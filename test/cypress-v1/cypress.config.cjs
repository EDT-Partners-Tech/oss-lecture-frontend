const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080/login', // Replace with your application URL
    projectId: 'dqqw7q',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    video: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    env: {
      CYPRESS_LOGIN_URL: 'http://localhost:8080/login',
      CYPRESS_VALID_EMAIL: 'gpereira+2@edtpartners.com',
      CYPRESS_VALID_PASSWORD: 'Q1w2e3r4!',
    },
    supportFile: 'cypress/support/e2e.ts',
    // Additional configuration options can be added here
  },
})


