export const validatePassword = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,18}$/;

  return regex.test(password);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};