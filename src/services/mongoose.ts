import mongoose from 'mongoose'
import TokenModel from '../models/token'
import { Token, User } from '../types'
import UserModel from '../models/user'

export async function connectMongoose (): Promise<typeof mongoose> {
  try {
    if (mongoose.connection.readyState === 0) {
      const mongoAddress = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`
      return mongoose.connect(mongoAddress)
    }
  } catch (error) {
    console.log(error)
  }
}

export async function getTokenFromMongo (tokenCode: string): Promise<Token|null> {
  try {
    await connectMongoose()
    const [token] = await TokenModel.find({ code: tokenCode }).lean()
    if (!token) {
      return null
    }

    return token
  } catch (error) {
    console.log(error)
  }
}

export async function getTokensFromMongo (): Promise<Token[]> {
  try {
    await connectMongoose()
    const tokens = await TokenModel.find({})
    if (!tokens) {
      return []
    }

    return tokens
  } catch (error) {
    console.log(error)
  }
}


export async function createOrUpdateToken (tokenCode: string, tokenContent: Token): Promise<Token> {
  try {
    await connectMongoose()
    const token = await TokenModel.findOneAndUpdate({ code: tokenCode }, tokenContent, {
      new: true,
      upsert: true
    })
    await token.save()
    return token
  } catch (error) {
    console.log(error)
  }
}

export async function getUserFromMongo (userIdOrTag: string): Promise<User|null> {
  try {
    await connectMongoose()
    const [user] = await UserModel.find({ $or: [{ userId: userIdOrTag }, { tag: userIdOrTag }] }).lean()
    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.log(error)
  }
}

export async function getUsersFromMongo (): Promise<User[]> {
  try {
    await connectMongoose()
    const users = await UserModel.find({})
    if (!users) {
      return []
    }
    return users
  } catch (error) {
    console.log(error)
  }
}

export async function createOrUpdateUser (userId: string, userContent: User): Promise<User> {
  try {
    await connectMongoose()
    const user = await UserModel.findOneAndUpdate({ userId: userId }, userContent, {
      new: true,
      upsert: true
    })
    await user.save()
    return user
  } catch (error) {
    console.log(error)
  }
}