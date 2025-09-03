import { Canvas, Circle } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import * as GLOBAL from "../ref/global";


type Star = {
	layer: number;
	x: number;
	y: number;
	speed: number;
	size: number;
};

function createStars(
	numStars: number,
	numStarLayers: number,
	starDimensions: number[],
	starDurations: number[]
) {
	const stars: Star[] = [];
	for (let i = 0; i < numStars; i++) {
		const layer = Math.floor(Math.random() * numStarLayers);
		const size = starDimensions[layer];
		const speed = GLOBAL.slot.width / (starDurations[layer] * 1000);
		stars.push({
			layer,
			x: Math.random() * GLOBAL.slot.width,
			y: Math.random() * GLOBAL.slot.height,
			speed,
			size,
		});
	}
	return stars;
}


type StarFieldProps = {
	numStars: number;
	starAngle: number;
};

export default function StarField({ numStars, starAngle }: StarFieldProps) {
	const numStarLayers = 3;
	const starDimensions = [7, 4.5, 2];
	const starDurations = [20, 30, 40]; // Seconds
	const starAngleTan = Math.tan((starAngle * Math.PI) / 180);

	const stars = useRef(createStars(numStars, numStarLayers, starDimensions, starDurations)).current;
	const [, forceTick] = useState(0);
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withRepeat(withTiming(1, { duration: 1000 / GLOBAL.ui.fps }), -1, false);
		const starInterval = setInterval(() => {
			for (let star of stars) {
				const delta = 1000 / GLOBAL.ui.fps;
				star.x += star.speed * delta;
				star.y += star.speed * delta * starAngleTan;

				if (star.x > GLOBAL.slot.width + star.size) {
					star.x = -star.size;
					star.y = Math.random() * GLOBAL.slot.height;
				}
				if (star.y > GLOBAL.slot.height + star.size) {
					star.y = Math.random() * GLOBAL.slot.height;
				}
			}
			forceTick(t => t + 1);
		}, 1000 / GLOBAL.ui.fps);
		return () => clearInterval(starInterval);
	}, [progress, starAngleTan, stars]);

	return (
		<Canvas style={styles.starField}>
			{stars.map((star, i) => (
				<Circle
					key={`star-${i}`}
					cx={star.x}
					cy={star.y}
					r={star.size / 2}
					color="white"
				/>

				// <Image
				// 	key={`star-${i}`}
				// 	image={useImage(require("../assets/images/star.png"))}
				// 	x={star.x}
				// 	y={star.y}
				// 	width={star.size}
				// 	height={star.size}
				// />
			))}
		</Canvas>
	);
}

const styles = StyleSheet.create({
	starField: {
		position: "absolute",
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
		opacity: 0.3,
	},
});
