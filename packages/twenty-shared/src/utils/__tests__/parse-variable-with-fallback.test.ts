import { parseVariableWithFallback } from '../parse-variable-with-fallback';

describe('parseVariableWithFallback', () => {
  it('should read a variable without a fallback', () => {
    expect(parseVariableWithFallback('{{ name.firstName }}')).toEqual({
      name: 'name.firstName',
    });
  });

  it('should read a Liquid default filter as the fallback', () => {
    expect(
      parseVariableWithFallback('{{jobTitle | default: "there"}}'),
    ).toEqual({
      name: 'jobTitle',
      fallback: 'there',
    });
    expect(
      parseVariableWithFallback('{{ name.firstName|default:"Mr. X }}" }}'),
    ).toEqual({ name: 'name.firstName', fallback: 'Mr. X }}' });
  });

  it('should unescape quotes and backslashes in the fallback', () => {
    expect(
      parseVariableWithFallback(
        '{{jobTitle | default: "the \\"boss\\" \\\\o/"}}',
      ),
    ).toEqual({ name: 'jobTitle', fallback: 'the "boss" \\o/' });
  });

  it('should reject near-miss fallback syntax', () => {
    expect(parseVariableWithFallback('{{jobTitle | there}}')).toBeUndefined();
    expect(parseVariableWithFallback('{{jobTitle | "there"}}')).toBeUndefined();
    expect(
      parseVariableWithFallback('{{jobTitle | default: there}}'),
    ).toBeUndefined();
    expect(
      parseVariableWithFallback("{{jobTitle | default: 'there'}}"),
    ).toBeUndefined();
    expect(
      parseVariableWithFallback('{{jobTitle | default: “there”}}'),
    ).toBeUndefined();
  });

  it('should reject anything that is not exactly one variable', () => {
    expect(parseVariableWithFallback('Hi {{jobTitle}}')).toBeUndefined();
    expect(parseVariableWithFallback('{{job-title}}')).toBeUndefined();
  });
});
