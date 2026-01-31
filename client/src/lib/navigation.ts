let navigate = (...args: any) => {};

export { navigate };

export const setNavigate = (fn: any) => {
  navigate = fn;
};
