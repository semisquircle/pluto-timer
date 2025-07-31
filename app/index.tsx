import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import * as SUNCALC from "suncalc";
import * as GLOBAL from "../global";


const bodyDiameter = 1.01 * GLOBAL.slotWidth;
const glowDiameter = 1.5 * bodyDiameter;


export default function HomeScreen() {
	//* Body-ody-ody
	const body = GLOBAL.useBodyStore((s: any) => s.body);


	//* Top of screen body animation
	const glowDiameter = 1.5 * GLOBAL.slotWidth;
	const bodyFrameWidth = 20;
	const bodyFrameHeight = 20;
	const [bodyFrame, setBodyFrame] = useState<number>(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setBodyFrame(prev => (prev < (bodyFrameWidth * bodyFrameHeight - 1) ? prev + 1 : 0));
		}, 50);

		return () => clearInterval(interval);
	}, []);


	//* Time calculation
	function solarElevationAt(date: any, lat: number, lon: number) {
		const pos = SUNCALC.getPosition(date, lat, lon);
		return pos.altitude * 180 / Math.PI;
	}

	function findNextBodyTime(startDate: any, lat: number, lon: number) {
		const step = 60 * 1000; // 1-minute steps
		let date = new Date(startDate.getTime());
		let ele = solarElevationAt(date, lat, lon);
		const isBefore = (ele <= body.targetElevation);

		while (true) {
			date = new Date(date.getTime() + step);
			ele = solarElevationAt(date, lat, lon);
			if ((isBefore && ele > body.targetElevation) || (!isBefore && ele <= body.targetElevation)) {
				break;
			}
		}

		return date;
	}

	const [errorMsg, setErrorMsg] = useState<any>(null);
	const [cityText, setCityText] = useState<string>("");
	const [isBodyTimeNow, setIsBodyTimeNow] = useState<boolean>(false);
	const [bodyTime, setBodyTime] = useState<any>("");
	const [bodyTimeDate, setBodyTimeDate] = useState<any>("");
	useEffect(() => {
		if (!body) return; // Wait until body is loaded

		(async () => {
			let {status} = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				return;
			}

			let position = await Location.getCurrentPositionAsync({});
			let lat = position.coords.latitude;
			let lon = position.coords.longitude;
			// let lat = -37.331313;
			// let lon = -65.651870;

			let [location] = await Location.reverseGeocodeAsync({
				latitude: lat,
				longitude: lon,
			});

			setCityText(location?.city ?? location?.region ?? location?.country ?? "");

			let now = new Date();
			let next = findNextBodyTime(now, lat, lon);
			let dt = next.getTime() - now.getTime();
			let threshold = 5 * 60 * 1000; // 5 minutes

			if (dt <= threshold) {
				setIsBodyTimeNow(true);
			} else {
				setIsBodyTimeNow(false);

				let nextBodyTime = next.toLocaleTimeString(undefined, {hour: "numeric", minute: "2-digit", hour12: true});
				nextBodyTime = nextBodyTime.replace(/\s/g, "");
				setBodyTime(nextBodyTime);

				let nextBodyTimeDate = next.toLocaleDateString(undefined, {weekday: "long", year: "numeric", month: "long", day: "numeric"});
				setBodyTimeDate(nextBodyTimeDate);
			}
		})();
	}, [body]);


	//* Time size fitting
	let nextBodyTimeWidth = 0;
	const charWidths: any = {
		"A": 12,
		"P": 12,
		"M": 18.5,
		"0": 12,
		"1": 5.5,
		"2": 12,
		"3": 12,
		"4": 12,
		"5": 12,
		"6": 12,
		"7": 12,
		"8": 12,
		"9": 12,
		":": 5.5,
	}
	const charHeight = 57.5;
	for (let i = 0; i < bodyTime.length; i++) {
		let char = bodyTime[i];
		nextBodyTimeWidth += charWidths[char];
		if (i != bodyTime.length - 1) nextBodyTimeWidth++;
	}


	//* Orbit animation (soon to be altered)
	const orbitSemiMajorAxis = 0.1 * GLOBAL.slotWidth;
	const orbitSemiMinorAxis = orbitSemiMajorAxis * Math.sqrt(1 - Math.pow(body?.ecc, 2));

	const spinAnim = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		Animated.loop(
			Animated.timing(
				spinAnim,
				{
					toValue: 1,
					duration: 5000,
					easing: Easing.linear,
					useNativeDriver: true
				}
			)
		).start();
	}, [spinAnim]);

	const spinCW = spinAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: GLOBAL.uiColors[1],
			overflow: "hidden",
		},

		glow: {
			position: "absolute",
			top: -glowDiameter / 2,
			width: glowDiameter,
			height: glowDiameter,
		},

		spritesheetContainer: {
			marginTop: -GLOBAL.slotWidth / 2,
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotWidth,
			transform: [{rotate: `${body?.axialTilt}deg`}],
			overflow: "hidden",
		},

		spritesheetImg: {
			width: bodyFrameWidth * GLOBAL.slotWidth,
			height: bodyFrameHeight * GLOBAL.slotWidth,
			marginLeft: -(bodyFrame % bodyFrameWidth) * GLOBAL.slotWidth,
			marginTop: -(Math.floor(bodyFrame / bodyFrameWidth)) * GLOBAL.slotWidth,
		},

		timeContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			width: "100%",
		},
		
		nextText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Redaction-Regular",
			fontSize: 20,
			color: GLOBAL.uiColors[0],
		},

		nextBodyTime: {
			fontFamily: "Redaction-Bold",
			color: body?.colors[0],
		},

		timeText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "outward-semi",
			fontSize: ((GLOBAL.slotWidth - 2 * GLOBAL.screenBorderWidth) / nextBodyTimeWidth) * charHeight,
			color: GLOBAL.uiColors[0],
			marginTop: 7,
			overflow: "hidden",
		},

		dateText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Redaction-Bold",
			fontSize: 20,
			marginTop: 7,
			color: body?.colors[0],
		},

		dateOnText: {
			fontFamily: "Redaction-Regular",
			color: GLOBAL.uiColors[0],
		},

		cityTextContainer: {
			justifyContent: "center",
			alignItems: "center",
			width: "100%",
			height: 60,
			marginTop: 20,
		},

		orbitSpinner: {
			position: "absolute",
			opacity: 0.2,
			width: GLOBAL.slotWidth / 6,
			height: GLOBAL.slotWidth / 6,
			transform: [{ rotate: spinCW }],
		},

		orbitSpinnerSvg: {
			width: "100%",
			height: "100%",
		},

		cityText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Redaction-Italic",
			fontSize: ((GLOBAL.slotWidth / 2) / cityText.length) * 2,
			color: GLOBAL.uiColors[0],
			overflow: "visible",
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Image style={styles.glow} source={require("../assets/images/glow.png")} />
			<View style={styles.spritesheetContainer} >
				<Image style={styles.spritesheetImg} source={require("../assets/images/spritesheets/pluto.png")} />
			</View>

			<View style={styles.timeContainer}>
				<Text style={styles.nextText}>
					Your next <Text style={styles.nextBodyTime}>{body?.name} Time</Text> will occur at
				</Text>

				<Text style={styles.timeText}>{bodyTime}</Text>

				<Text style={styles.dateText}>
					<Text style={styles.dateOnText}>on </Text>
					{bodyTimeDate}
				</Text>

				<View style={styles.cityTextContainer}>
					<Animated.View style={styles.orbitSpinner}>
						<Svg style={styles.orbitSpinnerSvg} viewBox="0 0 100 100">
							<Path fill="transparent" stroke="white" strokeWidth="2" d="M 49.99934,5 C 46.019117,5 43.222377,9.9429036 41.41159,17.951499 35.840177,11.92064 30.947305,9.0389415 27.500329,11.028828 24.053353,13.019164 24.102067,18.698054 26.53925,26.53925 18.698054,24.102067 13.019164,24.053353 11.028828,27.500329 c -1.9898865,3.446976 0.89268,8.340717 6.92399,13.912578 C 9.9433217,43.222795 5,46.019117 5,49.99934 c 0,3.980222 4.9433217,6.777863 12.952818,8.587751 -6.03131,5.571863 -8.9138765,10.465602 -6.92399,13.912578 1.989886,3.446976 7.668776,3.398262 15.510422,0.961079 -2.437183,7.841196 -2.485897,13.520086 0.961079,15.510423 3.446976,1.989886 8.341167,-0.891811 13.912578,-6.922672 C 43.223245,90.057095 46.019117,95 49.99934,95 c 3.980222,0 6.777863,-4.943322 8.587751,-12.952819 5.571863,6.03131 10.465602,8.913876 13.912578,6.92399 3.446976,-1.990337 3.398262,-7.669227 0.961079,-15.510423 7.841196,2.437183 13.520086,2.485897 15.510423,-0.961079 C 90.961057,69.052693 88.07981,64.158954 82.048499,58.587091 90.057095,56.777203 95,53.979562 95,49.99934 95,46.019117 90.057095,43.223245 82.048499,41.412907 88.07981,35.841046 90.961057,30.947305 88.971171,27.500329 86.980834,24.053353 81.301944,24.102067 73.460748,26.53925 75.897931,18.698054 75.946645,13.019164 72.499669,11.028828 69.052693,9.0389415 64.158954,11.921058 58.587091,17.952818 56.777203,9.9433217 53.979562,5 49.99934,5 Z" />
						</Svg>
					</Animated.View>

					<Text style={styles.cityText}>{cityText}</Text>
				</View>
			</View>
		</View>
	);
}
