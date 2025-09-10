import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function ThunderSvg(props: SvgProps) {
  return (
    <Svg
      fill="#FFD700"
      height="172px"
      width="172px"
      viewBox="0 0 27.79 27.79"
      stroke="#FFD700"
      strokeWidth={0.00027793}
      {...props}
    >
      <Path d="M20.972 0L5.076 15.803 10.972 15.803 6.44 27.793 22.716 11.989 16.819 11.989z" />
    </Svg>
  );
}

export default ThunderSvg;
