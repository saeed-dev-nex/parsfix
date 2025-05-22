import { generateToken } from "./jwtHelper.js";

export const tokenSender = async (data) => {
  const tokenPayload = {
    userId: data.id,
    role: data.role,
  };
  const token = await generateToken(tokenPayload);
  return token;
};
