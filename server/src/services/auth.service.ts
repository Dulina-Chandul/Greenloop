import User from "../models/user/user.model";

export type createAccountParams = {
  email: string;
  password: string;
  userAgent?: string;
};

export const createAccount = async (data: createAccountParams) => {
  const existingUser = await User.exists({ email: data.email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = await User.create(data);

  return user;
};
