import { app } from 'electron'
import { readFile, readdir } from 'fs'
import { join } from 'path'

type AwsCachedToken = {
    startUrl?: string
    region?: string
    accessToken?: string
    expiresAt: string
    clientId: string
    clientSecret: string
}

export class AwsService {
    awsDirectory: string
    expiration: Date

    constructor() {
        this.awsDirectory = join(app.getPath('home'), './.aws')
    }

    async ssoLoginExpiration() {
        if (this.expiration) {
            if (new Date() < this.expiration) {
                return this.expiration
            }
        }

        const tokens = await this.readSsoLoginToken()
        const latestToken = this.getLatestToken(tokens)
        this.expiration = new Date(latestToken.expiresAt)

        return this.expiration
    }

    async readSsoLoginToken() {
        const tokens: AwsCachedToken[] = []

        try {
            await new Promise<void>((res, rej) => {
                readdir(this.awsDirectory + '/sso/cache', async (err, filenames) => {
                    if (err) rej(err)

                    for (const file of filenames) {
                        await new Promise<void>((r) => {
                            readFile(this.awsDirectory + '/sso/cache/' + file, (err, data) => {
                                if (err) rej(err)
                                const tmp: AwsCachedToken = JSON.parse(data.toString())
                                if (!tmp.startUrl) r()
                                else tokens.push(tmp)
                                r()
                            })
                        })
                    }
                    res()
                })
            })
        } catch (error) {
            console.log(error)
        }

        return tokens
    }

    isTokenValid(token: AwsCachedToken) {
        if (!token.expiresAt) return false
        const expires = new Date(token.expiresAt)
        return new Date() < expires
    }

    getLatestToken(tokens: AwsCachedToken[]) {
        return tokens.reduce((a, b) => {
            return new Date(a.expiresAt) > new Date(b.expiresAt) ? a : b
        })
    }
}
