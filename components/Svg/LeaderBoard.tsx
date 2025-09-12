import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

function LeaderBoard(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" {...props}>
      <Path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 21H9v-8.4a.6.6 0 01.6-.6h4.8a.6.6 0 01.6.6zm5.4 0H15v-2.9a.6.6 0 01.6-.6h4.8a.6.6 0 01.6.6v2.3a.6.6 0 01-.6.6M9 21v-4.9a.6.6 0 00-.6-.6H3.6a.6.6 0 00-.6.6v4.3a.6.6 0 00.6.6zm1.806-15.887l.909-1.927a.312.312 0 01.57 0l.91 1.927 2.032.311c.261.04.365.376.176.568l-1.47 1.5.347 2.118c.044.272-.228.48-.462.351l-1.818-1-1.818 1c-.233.128-.506-.079-.462-.351l.347-2.118-1.47-1.5c-.19-.192-.085-.528.175-.568z"
      />
    </Svg>
  );
}

export default LeaderBoard;
