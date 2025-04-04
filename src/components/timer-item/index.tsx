import React from "react";
import { View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

interface TimerItemProps {
  item: number;
  ITEM_SIZE: number;
  index: number;
  scrollX: Animated.SharedValue<number>;
}

export const TimerItem: React.FC<TimerItemProps> = ({ item, ITEM_SIZE, index, scrollX }) => {
  const inputRange = [
    (index - 1) * ITEM_SIZE,
    index * ITEM_SIZE,
    (index + 1) * ITEM_SIZE,
  ];

  const itemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0.4, 1, 0.4]),
    transform: [
      { scale: interpolate(scrollX.value, inputRange, [0.7, 1, 0.7]) },
    ],
  }));

  return (
    <View style={{ width: ITEM_SIZE }} className="justify-center items-center">
      <Animated.Text
        className="text-text font-semibold"
        style={[{ fontSize: ITEM_SIZE * 0.8, fontFamily: 'Menlo' }, itemStyle]}
      >
        {item.toString()}
      </Animated.Text>
    </View>
  );
};
