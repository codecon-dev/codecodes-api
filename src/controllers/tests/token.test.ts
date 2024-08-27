import { TokenController } from '@controllers/token'
import { createDatabaseToken } from '@services/token'

jest.mock('@services/token', () => ({
  createDatabaseToken: jest.fn().mockResolvedValueOnce({})
}))

describe('Token Controller', () => {
  describe('createByPartner', () => {
    it('should call create token with correct params', async () => {
      const controller = new TokenController()
      const requestResult = await controller.createByPartner()
      expect(createDatabaseToken).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          value: 0,
          description: 'Código aleatório gerado para parceiro',
          expireAt: '2024-09-07T18:00:00.00Z',
          totalClaims: 1
        })
      )
      expect(createDatabaseToken).toHaveBeenCalledTimes(1)
      expect(requestResult).toEqual({})
    })
  })
})
