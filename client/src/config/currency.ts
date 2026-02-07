export const CURRENCY_SYMBOL = "LKR";

export const formatCurrency = (
  amount: number,
  currency: string = CURRENCY_SYMBOL,
): string => {
  return `${currency} ${amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
