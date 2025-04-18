import React, { useCallback, useEffect, useRef, useState } from "react";

import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  View,
  TextInput,
  Dimensions,
  Vibration,
  StyleSheet,
} from "react-native";

import {
  GestureHandlerRootView,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";

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

// Corrected timers array (1-10 minutes, then 15-60 in 5-minute increments)
const timers = [...Array(20).keys()].map((i) => (i < 10 ? i + 1 : (i - 7) * 5));
const ITEM_SIZE = width * 0.38;
const ITEM_SPACING = (width - ITEM_SIZE) / 2;

export default function Page() {
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState(timers[0] * 60);
  const [displayValue, setDisplayValue] = useState(() =>
    formatTime(timers[0] * 60)
  );
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const animationRef = useRef<NodeJS.Timeout>();
  const singleTapRef = useRef();
  const doubleTapRef = useRef();
  const endTimeRef = useRef(0);
  const remainingTimeRef = useRef(duration);

  // Reanimated values
  const scrollX = useSharedValue(0);
  const timerProgress = useSharedValue(height + insets.bottom);
  const buttonOpacity = useSharedValue(1);
  const buttonTranslateY = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    setDisplayValue(formatTime(duration));
  }, [duration]);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const finishAnimation = () => {
    Vibration.vibrate();
    buttonOpacity.value = withTiming(1, { duration: 300 });
    buttonTranslateY.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0);
    setDisplayValue(formatTime(duration));
    setIsPaused(false);
  };

  const resetTimer = () => {
    if (animationRef.current) clearInterval(animationRef.current);
    Vibration.vibrate();
    animationRef.current = undefined;
    timerProgress.value = withTiming(height + insets.bottom, { duration: 300 });
    buttonOpacity.value = withTiming(1, { duration: 300 });
    buttonTranslateY.value = withTiming(0, { duration: 300 });
    textOpacity.value = withTiming(0);
    setDisplayValue(formatTime(duration));
    remainingTimeRef.current = duration;
    setIsPaused(false);
  };

  const toggleTimer = useCallback(() => {
    if (isPaused) {
      // Resume timer from paused state
      const startTime = Date.now();
      const remainingTimeMs = remainingTimeRef.current; // Already in milliseconds
      endTimeRef.current = startTime + remainingTimeMs;

      // Calculate animation duration based on remaining distance
      const currentProgress = timerProgress.value;
      const progressRatio = currentProgress / height;
      const durationMs = remainingTimeRef.current * (1 - progressRatio);
      
      timerProgress.value = withTiming(
        height  + insets.bottom,
        {
          duration: durationMs,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) runOnJS(finishAnimation)();
        }
      );

      // Update display interval
      animationRef.current = setInterval(() => {
        const now = Date.now();
        const remainingSeconds = Math.max(
          0,
          Math.ceil((endTimeRef.current - now) / 1000)
        );

        if (remainingSeconds !== parseInt(displayValue.split(":").join(""))) {
          runOnJS(setDisplayValue)(formatTime(remainingSeconds));
        }

        if (now >= endTimeRef.current) {
          clearInterval(animationRef.current);
        }
      }, 50);

      setIsPaused(false);
    } else {
      // Pause the timer
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = undefined;
        const now = Date.now();
        remainingTimeRef.current = Math.max(0, endTimeRef.current - now); // Store in milliseconds

        // Freeze animation at current position
        timerProgress.value = withTiming(timerProgress.value , { duration: 0 });
        setIsPaused(true);
      }
    }
  }, [isPaused, height]);

  const startNewTimer = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);

    buttonOpacity.value = withTiming(0, { duration: 300 });
    buttonTranslateY.value = withTiming(200, { duration: 300 });
    textOpacity.value = withTiming(1);

    // Initialize with milliseconds
    remainingTimeRef.current = duration * 1000;
    const startTime = Date.now();
    endTimeRef.current = startTime + duration * 1000;

    timerProgress.value = withSequence(
      withTiming(0, { duration: 300 }),
      withTiming(
        height,
        {
          duration: duration * 1000,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished) runOnJS(finishAnimation)();
        }
      )
    );

    animationRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.ceil((endTimeRef.current - now) / 1000)
      );

      if (remaining !== parseInt(displayValue.split(":").join(""))) {
        runOnJS(setDisplayValue)(formatTime(remaining));
      }

      if (now >= endTimeRef.current) {
        clearInterval(animationRef.current);
      }
    }, 50);
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
      const newDuration = timers[index] * 60;
      runOnJS(setDuration)(newDuration);
      remainingTimeRef.current = newDuration * 1000; // Store as ms
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-background">
        <StatusBar hidden />

        <TapGestureHandler
          ref={doubleTapRef}
          numberOfTaps={2}
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) runOnJS(resetTimer)();
          }}
        >
          <TapGestureHandler
            ref={singleTapRef}
            numberOfTaps={1}
            waitFor={doubleTapRef} // Correct dependency
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.ACTIVE) runOnJS(toggleTimer)();
            }}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: colors.primary,
                },
                timerStyle,
              ]}
            />
          </TapGestureHandler>
        </TapGestureHandler>

        <Animated.View
          className="justify-end items-center pb-24"
          style={[StyleSheet.absoluteFillObject, buttonStyle]}
        >
          <TapGestureHandler
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.ACTIVE) runOnJS(startNewTimer)();
            }}
          >
            <Animated.View className="size-20 rounded-full bg-primary" />
          </TapGestureHandler>
        </Animated.View>

        <View
          className="absolute left-0 right-0 flex-1"
          style={{ top: height / 3 }}
        >
          <Animated.View
            className="absolute justify-center items-center self-center"
            style={[
              {
                width: ITEM_SIZE * 2,
              },
              textInputStyle,
            ]}
          >
            <TextInput
              className="text-text font-semibold"
              style={{ fontSize: ITEM_SIZE * 0.6, fontFamily: "Menlo" }}
              value={displayValue}
              editable={false}
            />
          </Animated.View>
          <Animated.FlatList
            data={timers}
            keyExtractor={(item, index) => `${item}-${index}`}
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
    </GestureHandlerRootView>
  );
}
