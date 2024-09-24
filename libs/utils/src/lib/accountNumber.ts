export function generateUniqueAccountNumber(): string {
  const baseNumber = generateRandomNumber(9);
  const checkDigit = generateLuhnCheckDigit(baseNumber);
  return `${baseNumber}${checkDigit}`;
}

function generateRandomNumber(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

function generateLuhnCheckDigit(number: string): number {
  let sum = 0;
  let shouldDouble = true;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return (10 - (sum % 10)) % 10;
}
