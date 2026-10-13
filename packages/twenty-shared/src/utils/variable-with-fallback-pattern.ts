export const VARIABLE_WITH_FALLBACK_PATTERN =
  /\{\{(?:\s*([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*)\s*(?:\|\s*default\s*:\s*"((?:[^"\\]|\\.)*)"\s*)?|[^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\}/g;
