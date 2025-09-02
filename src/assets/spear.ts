import { SvgAsset } from "@/entities/svgAsset";

const spear = new SvgAsset(
  `M-.3-5.9-.4 11.4C-.4 11.4-.4 11.8 0 11.8.6 11.8.5 11.4.5 11.4L.4-5.9Z
  M.1-10.4-1.6-5.1C-1.6-5.1-.7-5.9 0-5.9.7-5.9 1.7-5.1 1.7-5.1Z
  M.1-10.1-.2-5.9.3-5.9Z
`,
  ["#2a1e16"],
  [
    [0.5, "#824f3d", 1, "#6b3a29"],
    [0, "#9f9e9b", 1, "#736f6b"],
  ],
);
console.info(spear);
export default spear;
