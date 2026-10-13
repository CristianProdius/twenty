import { formatVariableWithFallback } from '../format-variable-with-fallback';
import { parseVariableWithFallback } from '../parse-variable-with-fallback';

describe('formatVariableWithFallback', () => {
  it('should write a bare variable when the fallback is empty', () => {
    expect(formatVariableWithFallback({ name: 'jobTitle', fallback: '' })).toBe(
      '{{jobTitle}}',
    );
  });

  it('should write the fallback as a Liquid default filter', () => {
    expect(
      formatVariableWithFallback({ name: 'name.firstName', fallback: 'there' }),
    ).toBe('{{name.firstName | default: "there"}}');
  });

  it('should round-trip a fallback containing quotes, backslashes and braces', () => {
    const variableWithFallback = {
      name: 'jobTitle',
      fallback: 'the "boss" C:\\temp\\ }} <b>',
    };

    expect(
      parseVariableWithFallback(
        formatVariableWithFallback(variableWithFallback),
      ),
    ).toEqual(variableWithFallback);
  });
});
