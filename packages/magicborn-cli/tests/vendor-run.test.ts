import { describe, expect, it } from 'vitest';
import { parseVendorForwardArgs, stripLeadingVendorId } from '../src/vendor-run.ts';

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

describe('stripLeadingVendorId', () => {
  const vendors = { grimetime: {} };

  it('consumes registered vendor id as first token', () => {
    expect(stripLeadingVendorId(vendors, ['grimetime', 'users', 'list'])).toEqual({
      explicitVendorId: 'grimetime',
      rest: ['users', 'list'],
    });
  });

  it('does not consume reserved vendor subcommands', () => {
    expect(stripLeadingVendorId(vendors, ['list'])).toEqual({ explicitVendorId: null, rest: ['list'] });
    expect(stripLeadingVendorId(vendors, ['use', 'grimetime'])).toEqual({
      explicitVendorId: null,
      rest: ['use', 'grimetime'],
    });
  });

  it('does not treat unknown first token as vendor id', () => {
    expect(stripLeadingVendorId(vendors, ['users', 'list'])).toEqual({
      explicitVendorId: null,
      rest: ['users', 'list'],
    });
  });
});
