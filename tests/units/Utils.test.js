import { expect, test } from 'vitest'
import { Utils } from '../../src/core/Utils'

const utils = new Utils();

test('Encode Hello world!', () => {
    const encoded = utils.utoa("Hello world!");
    expect(encoded).toBe('SGVsbG8gd29ybGQh');
});

test('Decode SGVsbG8gd29ybGQh', () => {
    const decoded = utils.atou("SGVsbG8gd29ybGQh");
    expect(decoded).toBe('Hello world!');
});
