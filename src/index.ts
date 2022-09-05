import { extraFunction } from "./extra";
const compile = (str: string) => {
  const map = new Map();
  map.set("des", str);
  return map.get("des");
};
document.querySelector("h4").textContent = compile(extraFunction()) || "";
