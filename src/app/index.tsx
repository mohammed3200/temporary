import React, { useCallback, useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Vibration,
  Easing,
  TextInput,
  Dimensions,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

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
  const inputRef = useRef<TextInput>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [duration, setDuration] = useState(timers[0]);
  const timerAnimation = useRef(new Animated.Value(height)).current;
  const textInputAnimation = useRef(new Animated.Value(timers[0])).current;
  const buttonAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const listener = textInputAnimation.addListener(({ value }) => {
      if (inputRef.current) {
        inputRef.current.setNativeProps({
          text: Math.ceil(value).toString(),
        });
      }
    });

    return () => {
      textInputAnimation.removeListener(listener);
      textInputAnimation.removeAllListeners();
    }
  });

  const animation = useCallback(() => {
    textInputAnimation.setValue(duration);
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(timerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(textInputAnimation, {
          toValue: 0,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(timerAnimation, {
          toValue: height,
          duration: duration * 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
    ]).start(() => {
      Vibration.cancel();
      Vibration.vibrate();
      textInputAnimation.setValue(duration);
      Animated.timing(buttonAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [duration]);

  const opacity = buttonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const translateY = buttonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  const textOpacity = buttonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View className="flex-1 bg-background">
      <StatusBar hidden />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            width,
            height: height,
            backgroundColor: colors.primary,
            transform: [
              {
                translateY: timerAnimation,
              },
            ],
          },
        ]}
      />
      <Animated.View
        className="justify-end items-center pb-24"
        style={[
          StyleSheet.absoluteFillObject,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        <TouchableOpacity onPress={animation}>
          <View className="size-20 rounded-full bg-primary" />
        </TouchableOpacity>
      </Animated.View>
      <View
        className="absolute left-0 right-0 flex-1"
        style={{ top: height / 3 }}
      >
        <Animated.View
          style={{ width: ITEM_SIZE, opacity: textOpacity }}
          className="absolute justify-center items-center self-center"
        >
          <TextInput
            ref={inputRef}
            className="text-text font-semibold"
            style={{ fontSize: ITEM_SIZE * 0.8, fontFamily: "Menlo" }}
            defaultValue={duration.toString()}
          />
        </Animated.View>
        <Animated.FlatList
          data={timers}
          keyExtractor={(item) => item.toString()}
          horizontal
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: true,
            }
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / ITEM_SIZE
            );
            setDuration(timers[index]);
          }}
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: ITEM_SPACING,
          }}
          className="flex-grow-0"
          style={{ opacity }}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 1) * ITEM_SIZE,
              index * ITEM_SIZE,
              (index + 1) * ITEM_SIZE,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.7, 1, 0.7],
            });
            return (
              <View
                style={{ width: ITEM_SIZE }}
                className="justify-center items-center"
              >
                <Animated.Text
                  className="text-text font-semibold"
                  style={[
                    { fontSize: ITEM_SIZE * 0.8, fontFamily: "Menlo" },
                    { opacity, transform: [{ scale }] },
                  ]}
                >
                  {item}
                </Animated.Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
