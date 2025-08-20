import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import * as GLOBAL from "../ref/global";

export default function StarField() {
	const numStars = 200;
	const numStarLayers = 3;
	const starDimensions = [7, 4.5, 2];
	const starDurations = [20, 30, 40]; // Seconds
	const starAngle = 10;
	const starAngleTan = Math.tan((starAngle * Math.PI) / 180);

	const starsRef = useRef(
		Array(numStars)
			.fill(null)
			.map(() => ({
				layer: Math.floor(Math.random() * numStarLayers),
				animX: new Animated.Value(0),
				animY: new Animated.Value(Math.random() * GLOBAL.slot.height),
				isFirstRun: true,
			}))
	).current;

	useEffect(() => {
		function animateStar(index: number) {
			const star = starsRef[index];
			let startX: number;

			if (star.isFirstRun) {
				startX = Math.random() * GLOBAL.slot.width;
				star.isFirstRun = false;
			} else {
				startX = -starDimensions[star.layer];
			}

			const distance = GLOBAL.slot.width - startX;
			const duration =
				(distance / GLOBAL.slot.width) *
				(starDurations[star.layer] * 1000);

			star.animX.setValue(startX);

			Animated.timing(star.animX, {
				toValue: GLOBAL.slot.width,
				duration,
				easing: Easing.linear,
				useNativeDriver: true,
			}).start(() => {
				star.animY.setValue(Math.random() * GLOBAL.slot.height);
				animateStar(index);
			});
		}

		for (let i = 0; i < numStars; i++) animateStar(i);

		return () => {
			for (let i = 0; i < numStars; i++) {
				starsRef[i].animX.stopAnimation &&
					starsRef[i].animX.stopAnimation();
			}
		};
	}, [starsRef]);

	return (
		<View style={styles.starField}>
			{starsRef.map((star, i) => {
				const translateY = Animated.add(
					star.animY,
					Animated.multiply(star.animX, starAngleTan)
				);
				return (
					<Animated.Image
						key={`star-${i}`}
						style={[
							styles.star,
							{
								width: starDimensions[star.layer],
								height: starDimensions[star.layer],
								transform: [
									{ translateX: star.animX },
									{ translateY },
								],
							},
						]}
						source={require("../assets/images/star.png")}
					/>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	starField: {
		position: "absolute",
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
		opacity: 0.3,
	},
	
	star: {
		position: "absolute",
	},
});
