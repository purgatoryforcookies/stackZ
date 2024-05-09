import { Environment } from '../../types'
import { EnvironmentService } from '../src/service/EnvironmentService'
import { mapEnvs } from '../src/util/util'

describe('Utilities tests', () => {

    const envService = EnvironmentService.get()


    it('Registers a stack with OS envs omitted', () => {
        envService.register('stack1', undefined, true)

        expect(envService.store.get('stack1')).toBeDefined()
        expect(envService.store.get('stack1')?.length).toBe(0)


    })


    it.skip('Removes the disabled envs from the sets', () => {
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
