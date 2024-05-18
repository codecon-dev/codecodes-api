import parseCsv from 'csv-parser'
import fs from 'fs'
import { Token } from '../types'

export async function readAndMapCsvTokens (csvFilePath): Promise<Token[]> {
  return new Promise((resolve, reject) => {
    const tokens = []
    fs.createReadStream(csvFilePath)
      .pipe(parseCsv())
      .on('data', (data) => {
        const mmddyyDate = data['Data de expiração'].replace(/(.*?)\/(.*?)\//, '$2/$1/')
        const utcDate = new Date(mmddyyDate)
        const expireDate = utcDate.toISOString()

        const totalClaims = Number(data['Número máximo de resgates'])
        const now = new Date(Date.now())
        const createdAt = now.toISOString()

        return tokens.push({
          code: data.Token,
          description: data['Descrição'],
          value: Number(data.Pontos),
          decreaseValue: Number(data['Quanto pontos diminui por resgate']),
          minimumValue: Number(data['Pontos mínimos de resgate']),
          totalClaims: totalClaims,
          remainingClaims: totalClaims,
          expireAt: expireDate,
          createdAt
        })
      })
      .on('end', async () => {
        console.log('File read with success')
        resolve(tokens)
      })
  })
}