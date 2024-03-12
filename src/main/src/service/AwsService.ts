import { app } from 'electron'
import { promises } from 'fs'
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
        if (!latestToken) return
        this.expiration = new Date(latestToken.expiresAt)

        return this.expiration
    }

    async readSsoLoginToken() {
        const tokens: AwsCachedToken[] = []

        try {
            await promises.readdir(this.awsDirectory + '/sso/cache').then(async (filenames) => {
                for (const file of filenames) {
                    await promises
                        .readFile(this.awsDirectory + '/sso/cache/' + file)
                        .then((t) => tokens.push(JSON.parse(t.toString())))
                }
            })
        } catch (error) {
            console.log('[WARNING]: Could not read tokens from directory')
        }

        return tokens
    }

    isTokenValid(token: AwsCachedToken) {
        if (!token.expiresAt) return false
        const expires = new Date(token.expiresAt)
        return new Date() < expires
    }

    getLatestToken(tokens: AwsCachedToken[]) {
        if (tokens.length === 0) return
        return tokens.reduce((a, b) => {
            return new Date(a.expiresAt) > new Date(b.expiresAt) ? a : b
        })
    }
}
