/**
 * Mocking library for Axios, with lots of cool helpers for testing.
 * See for docs: https://github.com/knee-cola/jest-mock-axios
 */

import mockAxios from 'jest-mock-axios';

// This can be removed if https://github.com/knee-cola/jest-mock-axios/pull/12 is resolved and released
mockAxios.patch = jest.fn();

export default mockAxios;
