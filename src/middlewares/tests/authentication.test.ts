import { Request, Response } from 'express'
import { authentication } from "@middlewares/authentication"

describe('Authentication Middleware', () => {
  beforeEach(() => jest.clearAllMocks())
  process.env.APIKEY = 'fake-api-key'
  process.env.PARTNER_APIKEY = 'fake-partner-api-key'
  const nextMock = jest.fn()
  const jsonMock = jest.fn()
  const responseMock = {
    json: jsonMock,
    locals: []
  } as unknown as Response

  it('should return error when not send a key', () => {
    authentication({
      headers: []
    } as unknown as Request, responseMock, nextMock)
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Wrong or missing apikey' }))
    expect(nextMock).not.toHaveBeenCalled()
  })

  it('should return error when send a invalid key', () => {
    authentication({
      headers: {
        'x-apikey': 'invalid-key'
      }
    } as unknown as Request, responseMock, nextMock)
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Wrong or missing apikey' }))
    expect(nextMock).not.toHaveBeenCalled()
  })

  it('should call next function when send valid key', () => {
    authentication({
      headers: {
        'x-apikey': 'fake-api-key'
      }
    } as unknown as Request, responseMock, nextMock)
    expect(jsonMock).not.toHaveBeenCalled()
    expect(nextMock).toHaveBeenCalled()
  })

  describe('when has partner authentication', () => {
    beforeEach(() => responseMock.locals['has-partner-auth'] = true)
    it('should return error when send a invalid key', () => {
      authentication({
        headers: {
          'x-partnerapikey': 'invalid-key'
        }
      } as unknown as Request, responseMock, nextMock)
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ message: 'Wrong or missing partner apikey' }))
      expect(nextMock).not.toHaveBeenCalled()
    })

    it('should call next function when send valid key', () => {
      authentication({
        headers: {
          'x-partnerapikey': 'fake-partner-api-key'
        }
      } as unknown as Request, responseMock, nextMock)
      expect(jsonMock).not.toHaveBeenCalled()
      expect(nextMock).toHaveBeenCalled()
    })
  })
})