import { describe, expect, it } from 'vitest';
import { parseVendorForwardArgs } from '../src/vendor-run.ts';

describe('parseVendorForwardArgs', () => {
  it('parses --id and forwards the rest', () => {
    expect(parseVendorForwardArgs(['--id', 'grimetime', 'doctor'])).toEqual({
      vendorId: 'grimetime',
      forwarded: ['doctor'],
    });
  });

  it('parses --id=value', () => {
    expect(parseVendorForwardArgs(['--id=grimetime', 'seed', 'push'])).toEqual({
      vendorId: 'grimetime',
      forwarded: ['seed', 'push'],
    });
  });

  it('parses -i', () => {
    expect(parseVendorForwardArgs(['-i', 'grimetime', 'help'])).toEqual({
      vendorId: 'grimetime',
      forwarded: ['help'],
    });
  });

  it('leaves vendorId null when omitted', () => {
    expect(parseVendorForwardArgs(['users', 'list'])).toEqual({
      vendorId: null,
      forwarded: ['users', 'list'],
    });
  });
});
