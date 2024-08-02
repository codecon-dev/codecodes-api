import claimService from '@services/claim'
import { getDatabaseTokenByCode, updateDatabaseToken } from '@services/token'
import { getDatabaseUserById, updateDatabaseUser } from '@services/user'

jest.mock('@services/token', () => ({
  getDatabaseTokenByCode: jest.fn(),
  updateDatabaseToken: jest.fn()
}))

jest.mock('@services/user', () => ({
  getDatabaseUserById: jest.fn(),
  updateDatabaseUser: jest.fn()
}))

const mockedToken = {
  code: 'CODECON21',
  description: 'Primeiro código da CodeCon 2021!',
  value: 20,
  decreaseValue: 2,
  minimumValue: 10,
  totalClaims: 21,
  remainingClaims: 20,
  createdBy: 'markkop',
  claimedBy: [
    {
      tag: 'gabrielnunes',
      id: '588160538110984193',
      claimedAt: '2021-03-14T21:45:59.143Z'
    }
  ],
  createdAt: '2021-03-13T21:45:59.143Z',
  expireAt: new Date()
}

describe('Claim Service', () => {
  it('successfully claims a token', async () => {
    const claimPayload = {
      code: 'CODE',
      userId: 'mark@email.com',
      tag: 'Mark Kop'
    }
    ;(getDatabaseTokenByCode as jest.Mock).mockResolvedValueOnce(mockedToken)
    ;(updateDatabaseToken as jest.Mock).mockResolvedValueOnce(true)
    ;(getDatabaseUserById as jest.Mock).mockResolvedValueOnce(null)
    ;(updateDatabaseUser as jest.Mock).mockResolvedValueOnce({ score: 18 })
    const claimResult = await claimService(
      claimPayload.code,
      claimPayload.userId,
      claimPayload.tag
    )
    const expectedResult = {
      message: 'Boa! Você ganhou 18 pontos e agora está com 18 pontos!',
      status: 'success',
      statusCode: 200,
      data: {
        scoreAcquired: 18,
        totalScore: 18
      }
    }
    expect(claimResult).toEqual(expectedResult)
  })
})
