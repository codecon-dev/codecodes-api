import { Schema, model } from 'mongoose'
import { Token } from '../types'
import { validateTokenCode } from '../services/token'

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
    type: Array,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  expireAt: {
    type: Date
  }
})

const TokenModel = model<Token>('Token', TokenSchema)
export default TokenModel