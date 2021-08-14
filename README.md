# 📟 Code-Codes - API

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

