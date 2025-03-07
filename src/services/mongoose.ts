import mongoose from 'mongoose'
import TokenModel from '../models/token'
import UserModel from '../models/user'
import { Token, User } from '../types'

export async function connectMongoose(): Promise<typeof mongoose> {
  try {
    if (mongoose.connection.readyState === 0) {
      const mongoAddress = `${process.env.MONGODB_URI}?retryWrites=true&w=majority`
      return mongoose.connect(mongoAddress, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
    }
  } catch (error) {
    console.log(`Error to connect to mongo: ${error}`)
  }
}

export async function getTokenFromMongo(
  tokenCode: string
): Promise<Token | null> {
  try {
    await connectMongoose()
    const [token] = await TokenModel.find({ code: tokenCode }).lean()
    if (!token) {
      return null
    }

    return token
  } catch (error) {
    console.log(`Error to get token from mongo: ${error}`)
  }
}

export async function getTokensFromMongo(
  onlyNames?: boolean
): Promise<Token[]> {
  try {
    await connectMongoose()
    const tokens = await TokenModel.find({})
    if (!tokens) {
      return []
    }

    if (onlyNames) {
      return tokens.map((token) => {
        const { code, description, value } = token
        return { code, description, value }
      })
    }

    return tokens
  } catch (error) {
    console.log(`Error to get tokens from mongo: ${error}`)
  }
}

export async function getLatestClaimedTokens(): Promise<Token[]> {
  const tokens = await TokenModel.aggregate([
    { $unwind: '$claimedBy' },
    { $sort: { 'claimedBy.claimedAt': -1 } },
    { $limit: 100 } // Limit the number of results
  ]).allowDiskUse(true)

  return tokens
}

export async function getClaimsPerHour(): Promise<
  { date: string; count: number }[]
> {
  const tokens = await TokenModel.aggregate([
    { $unwind: '$claimedBy' },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d-%H',
            date: { $toDate: '$claimedBy.claimedAt' },
            timezone: '-03:00'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } }
  ]).allowDiskUse(true)

  return tokens.map((token) => ({ date: token.date, count: token.count }))
}

export async function createToken(tokenContent: Token): Promise<Token> {
  try {
    await connectMongoose()
    const token = await TokenModel.create(tokenContent)
    return token
  } catch (error) {
    console.log(`Failed to create token on mongo: ${error}`)
    throw error
  }
}

export async function updateToken(
  tokenCode: string,
  tokenContent: Token
): Promise<Token> {
  try {
    await connectMongoose()
    const token = await TokenModel.findOneAndUpdate(
      { code: tokenCode },
      tokenContent,
      {
        new: true
      }
    )
    await token.save()
    return token
  } catch (error) {
    console.log(`Error to update token on mongo: ${error}`)
  }
}

export async function getUserFromMongo(
  userIdOrTag: string
): Promise<User | null> {
  try {
    await connectMongoose()
    const [user] = await UserModel.find({
      $or: [{ userId: userIdOrTag }, { tag: userIdOrTag }],
      softDeleted: { $ne: true }
    }).lean()
    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.log(`Failed to get user from mongo: ${error}`)
  }
}

export async function getUsersFromMongo(query = {}): Promise<User[]> {
  try {
    await connectMongoose()
    const users = await UserModel.find({ ...query, softDeleted: { $ne: true } })
    if (!users) {
      return []
    }
    return users
  } catch (error) {
    console.log(`Failed to get users from mongo: ${error}`)
  }
}

export async function createOrUpdateUser(
  userId: string,
  userContent: User
): Promise<User> {
  try {
    await connectMongoose()
    const user = await UserModel.findOneAndUpdate(
      { userId: userId },
      { ...userContent, softDeleted: userContent.softDeleted ?? false },
      {
        new: true,
        upsert: true
      }
    )
    await user.save()
    return user
  } catch (error) {
    console.log(`Failed to create or update user on mongo: ${error}`)
  }
}

export async function softDeleteUser(userId: string): Promise<User | null> {
  try {
    await connectMongoose()
    const user = await UserModel.findOneAndUpdate(
      { userId: userId },
      { softDeleted: true },
      { new: true }
    )
    return user
  } catch (error) {
    console.log(`Failed to soft delete user on mongo: ${error}`)
    return null
  }
}
