import { Schema, model } from 'mongoose'
import { Token, UserClaim } from '../types'
import { validateTokenCode } from '../services/token'

const UserClaimSchema = new Schema<UserClaim>({
  tag: String,
  id: String,
  claimedAt: String
})

const TokenSchema = new Schema<Token>({
  code: {
    type: String,
    required: true,
    validate: {
      validator: code => validateTokenCode(code).valid,
      message: props => `${props.value} is not a valid token code`
    }
  },
  description: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  decreaseValue: {
    type: Number,
    required: true
  },
  minimumValue: {
    type: Number,
    required: true
  },
  totalClaims: {
    type: Number,
    required: true
  },
  remainingClaims: {
    type: Number,
    required: true
  },
  claimedBy: {
    type: [UserClaimSchema],
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    required: true
  },
  expireAt: {
    type: String
  }
})

const TokenModel = model<Token>('Token', TokenSchema)
export default TokenModel