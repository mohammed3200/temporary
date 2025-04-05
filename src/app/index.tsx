import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  StatusBar,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Vibration,
  StyleSheet,
} from "react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";

import { TimerItem } from "@/components/timer-item";
import { formatTime } from "@/lib/util";

const { width, height } = Dimensions.get("window");

const colors = {
  background: "#2A333DFF",
  primary: "#F76A6A",
  text: "#FFFFFF",
};

const timers = [...Array(13).keys()].map((i) => (i === 0 ? 1 : i * 5));
const ITEM_SIZE = width * 0.38;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;

export default function Page() {
  const [duration, setDuration] = useState(timers[0] * 60);
  const [displayValue, setDisplayValue] = useState(() => formatTime(timers[0] * 60));
  
  // Reanimated values
  const scrollX = useSharedValue(0);
  const timerProgress = useSharedValue(height);
  const buttonOpacity = useSharedValue(1);
  const buttonTranslateY = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const animationRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setDisplayValue(formatTime(duration));
  }, [duration]);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const animation = useCallback(() => {

    if (animationRef.current) clearInterval(animationRef.current);

    buttonOpacity.value = withTiming(0, { duration: 300 });
    buttonTranslateY.value = withTiming(200, { duration: 300 });
    textOpacity.value = withTiming(1);

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    // In the animation function, no need to multiply by 60000 anymore
    timerProgress.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(
        height,
        {
          duration: duration * 1000, // Changed from duration * 60000
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) {
            runOnJS(Vibration.vibrate)();
            buttonOpacity.value = withTiming(1, { duration: 300 });
            buttonTranslateY.value = withTiming(0, { duration: 300 });
            textOpacity.value = withTiming(0);
            runOnJS(setDisplayValue)(duration.toString());
          }
        }
      )
    );

    // More accurate countdown using elapsed time
    // More precise countdown
    animationRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      // Only update if value changed
      if (remaining !== parseInt(displayValue)) {
        runOnJS(setDisplayValue)(formatTime(remaining));
      }
      
      if (now >= endTime) {
        clearInterval(animationRef.current);
      }
    }, 50); // More frequent checks for better accuracy

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [duration]);

  // Animated styles
  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: timerProgress.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const textInputStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / ITEM_SIZE);
      runOnJS(setDuration)(timers[index] * 60);
    },
  });

  return (
    <View className="flex-1 bg-background">
      <StatusBar hidden />

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: colors.primary },
          timerStyle,
        ]}
      />

      <Animated.View
        className="justify-end items-center pb-24"
        style={[StyleSheet.absoluteFillObject, buttonStyle]}
      >
        <TouchableOpacity onPress={animation}>
          <View className="size-20 rounded-full bg-primary" />
        </TouchableOpacity>
      </Animated.View>

      <View className="absolute left-0 right-0 flex-1" style={{ top: height / 3 }}>
        <Animated.View
          style={[
            {
              width: ITEM_SIZE * 1.5,
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
            },
            textInputStyle,
          ]}
        >
          <TextInput
            className="text-text font-semibold"
            style={{ fontSize: ITEM_SIZE * .6, fontFamily: 'Menlo' }}
            value={displayValue}  // Changed from defaultValue to value
            editable={false}       
          />
        </Animated.View>

        <Animated.FlatList
          data={timers}
          keyExtractor={(item) => item.toString()}
          horizontal
          bounces={false}
          onScroll={scrollHandler}
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: ITEM_SPACING }}
          className="flex-grow-0"
          style={buttonStyle}
          renderItem={({ item, index }) => (
            <TimerItem
              item={item}
              index={index}
              scrollX={scrollX}
              ITEM_SIZE={ITEM_SIZE}
            />
          )}
        />
      </View>
    </View>
  );
}
