import express from 'express'
import token from '../controllers/token'
import { validateApiKey } from '../middewares/validateApiKey'

const router = express.Router()
router.post('/claim', validateApiKey, token.claim)

export default router