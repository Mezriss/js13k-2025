import { SvgAsset } from "@/entities/svgAsset";

const gradient = [
  0.2,
  "#9b775a",

  0.5,
  "#916447",
  0.6,
  "#916447",
  0.9,
  "#624131",
];

const gradientColumn = [
  "h",
  0.3,
  "#624131",
  0.55,
  "#916447",
  0.8,
  "#916447",
  0.9,
  "#9b775a",
];

const support = new SvgAsset(
  `M-2.7.1-2.7-7.1-3.4-7.1-3.7-7.6 3.7-7.6 3.6-7.1 2.7-7.1 2.7.1H2.1L2.2-7.1H-2.1L-2 .1Z
  M-2.1-6.6 2.1-6.5V-6.1L-2.1-6.1Z`,
  ["#2a1e16"],
  [gradient, gradientColumn],
);

export default support;
