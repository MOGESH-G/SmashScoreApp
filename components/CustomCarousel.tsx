import * as React from "react";
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

interface CustomCarouselProps {
  children: React.ReactNode[];
  loop?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  style?: StyleProp<ViewStyle>;
}

const CustomCarousel: React.FC<CustomCarouselProps> = ({
  children,
  loop = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  style,
}) => {
  const scrollOffsetValue = useSharedValue(0);
  const [layout, setLayout] = React.useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  if (layout.width === 0 || layout.height === 0) {
    return <View style={[{ flex: 1 }, style]} onLayout={onLayout} />;
  }

  return (
    <View style={[{ flex: 1 }, style]} onLayout={onLayout}>
      <Carousel
        loop={loop}
        pagingEnabled
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        defaultScrollOffsetValue={scrollOffsetValue}
        data={children}
        width={layout.width}
        height={layout.height}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.95,
          parallaxScrollingOffset: 10,
        }}
        renderItem={({ index }) => <View style={{ flex: 1 }}>{children[index]}</View>}
        // onSnapToItem={(index) => console.log("current index:", index)}
      />
    </View>
  );
};

export default CustomCarousel;
