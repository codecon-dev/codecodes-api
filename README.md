# 📟 Code-Codes - API

[![Build - Deploy](https://github.com/codecon-dev/codecodes-api/actions/workflows/main.yml/badge.svg)](https://github.com/codecon-dev/codecodes-api/actions/workflows/main.yml)
[![https://img.shields.io/badge/made%20with-express-blue](https://img.shields.io/badge/made%20with-express-blue)](https://expressjs.com/)

This is the API version of the CodeCodes gamification Discord Bot.

You can check the available routes and methods by accessing /docs in the API URL (which is secret for now).

## Setup

- Have Node.js v18.17.1 or later installed (nvm is recommended)
- Have Yarn installed (`npm -g i yarn`)
- Clone the repository
- Copy the `.env.example` file to `.env` and fill in the necessary environment variables (or request them from someone)
- Run `yarn` to install the dependencies
- Import `insomnia.json` into Insomnia / Postman / Thunder Client (VSCode)

## Running

- Run `yarn dev` to start the development server
- Optionally, you can run `yarn test` to run tests
- For production, you can run `yarn build` and then `yarn start`
- Once the server is running, you can access the API documentation at `http://localhost:8080/docs`
