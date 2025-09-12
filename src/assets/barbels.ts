import { namazu } from "@/const";
import { SvgAsset } from "../entities/svgAsset";

const barbels = new SvgAsset(
  `M10.4.5C10.4.5 11.5-16 29-14.7 46.5-13.3 44.5-7 61.4 2.5 68.5 6.5 76.6 7.8 76.6 7.8
M7.8-5.9C7.8-5.9 9.3-17.5 16.1-20.9
M-6.1-5.8C-6.1-5.8-6-16.2-17-17.9
M-6.1.3C-6.1.3-10.4-13.2-26.7-12-42.2-11-43.3-5.1-55.1 6.4-62.6 13.7-66.1 13-66.1 13
`,
  [namazu.palette.fins],
  [],
);

export default barbels;
