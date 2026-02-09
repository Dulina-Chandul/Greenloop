import bcrypt from "bcrypt";

//* Hash the value
export const hashValue = async (
  value: string,
  saltRounds?: number,
): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds || 10);
  return await bcrypt.hash(value, salt);
};

//* Compare the value
export const compareValue = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => {
  return await bcrypt.compare(value, hashedValue).catch((err) => {
    console.log(err);
    return false;
  });
};
