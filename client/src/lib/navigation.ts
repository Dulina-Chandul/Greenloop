import type { NavigateFunction } from "react-router";

export let navigate: NavigateFunction = () => {};

export const setNavigate = (fn: any) => {
  navigate = fn;
};
