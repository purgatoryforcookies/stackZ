import { parseVariables } from "../src/service/util"


describe('Utilities tests', () => {


    it('Parses variables from string', () => {

        const cases = [
            { cmd: "echo hello from", params: [] },
            { cmd: "echo {variable1} and {variable2}", params: ["variable1", "variable2"] },
            { cmd: "echo 'variable1' from single quotes", params: ["variable1"] },
            { cmd: "echo ${variable1} bash type", params: ["variable1"] },
            { cmd: "echo '${variable1}' quoted bash type", params: ["variable1"] }
        ]

        cases.forEach(value => {
            const test = value.params.join('')
            expect(parseVariables(value.cmd).join('')).toBe(test)
        })

    })


})



