require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs').promises
const path = require('path')
const { Schema, model } = mongoose

// Define schemas
const UserSchema = new Schema({
  userId: String,
  tag: String,
  username: String,
  score: Number,
  tokens: Array,
  softDeleted: Boolean
})

const TokenSchema = new Schema({
  code: String,
  description: String,
  value: Number,
  decreaseValue: Number,
  minimumValue: Number,
  totalClaims: Number,
  remainingClaims: Number,
  claimedBy: Array,
  createdBy: String,
  createdAt: String,
  expireAt: String
})

// Define models
const UserModel = model('User', UserSchema)
const TokenModel = model('Token', TokenSchema)

// List of target users
const targetUsers = []

// Flag to determine whether to delete the tokens
const shouldDeleteTokens = false // Set this to true if you want to delete the tokens

async function connectToDatabase() {
  const mongoAddress = `${process.env.MONGODB_URI}?retryWrites=true&w=majority`
  await mongoose.connect(mongoAddress, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
}

async function getExclusiveTokens() {
  try {
    await connectToDatabase()

    const targetDate = new Date('2024-09-06T16:00:00.000Z')

    // Get all tokens
    const allTokens = await TokenModel.find({}).lean()

    // Filter tokens that were only claimed by target users and created after the target date
    const exclusiveTokens = allTokens.filter((token) => {
      if (token.claimedBy.length === 0) return false
      if (new Date(token.createdAt) <= targetDate) return false
      return token.claimedBy.every((claim) => targetUsers.includes(claim.id))
    })

    // Extract only the token codes
    const exclusiveTokenCodes = exclusiveTokens.map((token) => token.code)

    // Save the JSON stringified array of token codes to a file
    const filePath = path.join(__dirname, 'exclusive_tokens.json')
    await fs.writeFile(filePath, JSON.stringify(exclusiveTokenCodes, null, 2))

    console.log(`Exclusive tokens saved to ${filePath}`)

    // Delete tokens if the flag is set to true
    if (shouldDeleteTokens) {
      console.log('Deleting tokens...')
      await TokenModel.deleteMany({ code: { $in: exclusiveTokenCodes } })
      console.log(`${exclusiveTokenCodes.length} tokens have been deleted.`)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.connection.close()
  }
}

getExclusiveTokens()
