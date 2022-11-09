import { Schema, model } from 'mongoose'
import { User, UserClaimedToken } from '../types'

const UserClaimedTokenSchema = new Schema<UserClaimedToken>({
  code: String,
  value: Number,
  claimedAt: String
})

const UserSchema = new Schema<User>({
  userId: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  tokens: {
    type: [UserClaimedTokenSchema],
    required: true
  }
})

const UserModel = model<User>('User', UserSchema)
export default UserModel