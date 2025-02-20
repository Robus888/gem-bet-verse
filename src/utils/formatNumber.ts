
export const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toString();
};

export const parseInputValue = (input: string): number => {
  const value = input.trim().toUpperCase();
  const number = parseFloat(value);
  
  if (value.endsWith('T')) {
    return number * 1_000_000_000_000;
  } else if (value.endsWith('B')) {
    return number * 1_000_000_000;
  } else if (value.endsWith('M')) {
    return number * 1_000_000;
  } else if (value.endsWith('K')) {
    return number * 1_000;
  }
  
  return number;
};
