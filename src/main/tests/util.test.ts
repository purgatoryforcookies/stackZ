import { Environment } from '../../types'
import { mapEnvs } from '../src/util/util'

describe('Utilities tests', () => {
    // it('Parses variables from string', () => {
    //   const cases = [
    //     { cmd: 'echo hello from', params: [] },
    //     { cmd: 'echo {variable1} and {variable2}', params: ['variable1', 'variable2'] },
    //     { cmd: "echo 'variable1' from single quotes", params: ['variable1'] },
    //     { cmd: 'echo ${variable1} bash type', params: ['variable1'] },
    //     { cmd: "echo '${variable1}' quoted bash type", params: ['variable1'] }
    //   ]

    //   cases.forEach((value) => {
    //     const test = value.params.join('')
    //     expect(parseVariables(value.cmd).join('')).toBe(test)
    //   })
    // })

    it.only('Removes the disabled envs from the sets', () => {
        // There is a list of envs objects. Each object
        // has a K,V pairs of envs, and a list of disabled
        // keys. Remove the keys from a the pairs without
        // affecting others. Also return a union K,V set from all

        const testEnvs: Environment[] = [
            {
                pairs: {
                    key1: 'value1.1',
                    key2: 'value2.1',
                    key3: 'value3.1'
                },
                title: 'Test set 1',
                order: 1,
                disabled: []
            },
            {
                pairs: {
                    key1: 'value1.2',
                    key2: 'value2.2',
                    key3: 'value3.2'
                },
                title: 'Test set 2',
                order: 2,
                disabled: ['key1']
            }
        ]

        const parsed = mapEnvs(testEnvs)

        expect(Object.keys(parsed)).toContain('key1')
        expect(Object.keys(parsed)).toContain('key2')
        expect(Object.keys(parsed)).toContain('key3')
        expect(Object.values(parsed)).toContain('value1.1')
        // disabled on the second set, therefore will not be overwritten
        // if it would be on the first set, it would remain and not get overwritten
        expect(Object.values(parsed)).not.toContain('value1.2')
        expect(Object.values(parsed)).not.toContain('value2.1') // overwritten
        expect(Object.values(parsed)).not.toContain('value3.1') // overwritten
        expect(Object.values(parsed)).toContain('value2.2')
        expect(Object.values(parsed)).toContain('value3.2')
    })
})
