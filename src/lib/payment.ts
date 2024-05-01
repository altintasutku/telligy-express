import Iyzipay from 'iyzipay'
import { env } from '../../env.mjs'

export const iyzipay = new Iyzipay({
    apiKey: env.IYZICO_API_KEY,
    secretKey: env.IYZICO_SECRET_KEY,
    uri: env.IYZICO_URL
})