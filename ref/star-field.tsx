import { Image as ExpoImage } from "expo-image";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import * as GLOBAL from "./global";


const starFieldHeight = GLOBAL.slot.height;
const starLayerDurations = [40, 30, 20];
const starLayerSources = [
	require("../assets/images/stars/stars1.png"),
	require("../assets/images/stars/stars2.png"),
	require("../assets/images/stars/stars3.png"),
];

const styles = StyleSheet.create({
	starField: {
		position: "absolute",
		opacity: 0.3,
		width: GLOBAL.slot.width,
		height: starFieldHeight,
		transform: [
			{ scale: 1 + (-GLOBAL.ui.skewAngle / 100) },
			{ rotate: `${-GLOBAL.ui.skewAngle}deg` },
		],
	},
	
	starLayer: {
		position: "absolute",
		right: 0,
		width: 2 * starFieldHeight,
		height: starFieldHeight,
	}
});

export default function StarField() {
	const starLayerOffsets = starLayerDurations.map(() => useSharedValue(0));
	useEffect(() => {
		starLayerOffsets.forEach((starLayerOffset, s) => {
			starLayerOffset.value = withRepeat(
				withTiming(
					starFieldHeight,
					{ duration: 1000 * starLayerDurations[s], easing: Easing.linear }
				), -1, false
			);
		});
	}, []);

	const starLayerAnimStyles = starLayerOffsets.map((starLayerOffset) =>
		useAnimatedStyle(() => {
			return { right: -starLayerOffset.value };
		})
	);

	return (
		<View style={styles.starField}>
			{starLayerSources.map((source, s) => (
				<Animated.View key={`stars${s}`} style={[styles.starLayer, starLayerAnimStyles[s]]}>
					<ExpoImage style={{ width: "100%", height: "100%" }} source={source} contentFit="fill" />
				</Animated.View>
			))}
		</View>
	);
}
