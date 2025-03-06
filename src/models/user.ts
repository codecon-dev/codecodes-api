import { Schema, model } from 'mongoose'
import { User } from '../types'

const UserSchema = new Schema<User>({
  userId: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  score: {
    type: Number,
    required: true
  },
  tokens: {
    type: Array,
    required: true
  },
  softDeleted: {
    type: Boolean,
    default: false
  }
})

const UserModel = model<User>('User', UserSchema)
export default UserModel
