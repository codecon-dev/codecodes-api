# 📟 Code-Codes - API

[![Build - Deploy](https://github.com/codecon-dev/codecodes-api/actions/workflows/main.yml/badge.svg)](https://github.com/codecon-dev/codecodes-api/actions/workflows/main.yml)
[![https://img.shields.io/badge/made%20with-express-blue](https://img.shields.io/badge/made%20with-express-blue)](https://expressjs.com/)

This is the API version of the CodeCodes gamification Discord Bot.  
This doc shall be improved someday

## Routes

All routes require a `x-apikey` as header

### /token/claim [POST]
Body:
```
{
  "code": "CODECON21",
  "id": "mark@email.com",
  "tag": "Mark Kop"
}
```

