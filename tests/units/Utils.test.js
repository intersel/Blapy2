import { expect, test } from 'vitest'
import { Utils } from '../../src'

let utils = new Utils();

test('Encode Hello world!', () => {

    const encoded = utils.utoa("Hello world!");
    console.log(encoded);

})

     /* const encoded = utils.utoa("Hello world!");
     * console.log(encoded); // "SGVsbG8gd29ybGQh"*/