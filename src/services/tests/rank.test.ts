import { getRankService } from '@services/rank'

const usersWithSameScoreButDifferentTokensQuantity = [
  {
    userId: 'user1@email.com',
    tag: 'user1',
    score: 100,
    tokens: [
      {
        code: 'CODE100',
        value: 100,
        claimedAt: '2021-03-14T21:45:59.143Z'
      }
    ]
  },
  {
    userId: 'user2@email.com',
    tag: 'user2',
    score: 100,
    tokens: [
      {
        code: 'CODE50',
        value: 50,
        claimedAt: '2021-03-14T21:45:59.143Z'
      },
      {
        code: 'CODE50TWO',
        value: 50,
        claimedAt: '2021-03-14T21:00:00.00Z'
      }
    ]
  }
]

const usersWithSameScoreAndTokensButDifferentLastClaimDates = [
  {
    userId: 'user1@email.com',
    tag: 'user1',
    score: 100,
    tokens: [
      {
        code: 'CODE50',
        value: 50,
        claimedAt: '2021-03-14T19:00:00.00Z'
      },
      {
        code: 'CODE50TWO',
        value: 50,
        claimedAt: '2021-03-14T22:00:00.00Z'
      }
    ]
  },
  {
    userId: 'user2@email.com',
    tag: 'user2',
    score: 100,
    tokens: [
      {
        code: 'CODE25',
        value: 50,
        claimedAt: '2021-03-14T18:00:00.00Z'
      },
      {
        code: 'CODE75',
        value: 50,
        claimedAt: '2021-03-14T21:00:00.00Z'
      }
    ]
  }
]

describe('Rank Service', () => {
  it('unties users based on their claims number', async () => {
    const rank = await getRankService(
      usersWithSameScoreButDifferentTokensQuantity
    )
    expect(rank.data[0]).toMatchObject({
      tag: 'user2'
    })
  })

  it('unties users based on their last claimed token timestamp', async () => {
    const rank = await getRankService(
      usersWithSameScoreAndTokensButDifferentLastClaimDates
    )
    expect(rank.data[0]).toMatchObject({
      tag: 'user2'
    })
  })
})
