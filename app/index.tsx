import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Image, PanResponder, StyleSheet, Text, View } from "react-native";
import * as SUNCALC from "suncalc";
import * as GLOBAL from "../ref/global";

export default function HomeScreen() {
	//* Body-ody-ody
	const BODY = GLOBAL.useBodyStore((s: any) => s.body);


	//* Body animation/dragging
	const glowDiameter = 1.4 * GLOBAL.slotWidth;

	const bodyFrameWidth = 20;
	const bodyFrameHeight = 20;
	const totalFrames = bodyFrameWidth * bodyFrameHeight;

	const bodyAnimFPS = 30;
	const intervalRef = useRef<any>(null);
	const bodyFrameRef = useRef(0);
	const [, forceAnim] = useState(0);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const dragStartFrameRef = useRef(0);
	const dragStartXRef = useRef(0);

	// Ensures negative frame numbers get wrapped back around
	function modFrame(n: number) {
		let m = totalFrames - 1;
		return ((n % m) + m) % m;
	}

	useEffect(() => {
		if (!isDragging) {
		intervalRef.current = setInterval(() => {
			bodyFrameRef.current = modFrame(bodyFrameRef.current - 1);
			forceAnim((f) => f + 1);
		}, 1000 / bodyAnimFPS);
		} else clearInterval(intervalRef.current);

		return () => clearInterval(intervalRef.current);
	}, [isDragging]);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt) => {
				setIsDragging(true);
				dragStartFrameRef.current = bodyFrameRef.current;
				dragStartXRef.current = evt.nativeEvent.pageX;
			},
			onPanResponderMove: (evt) => {
				let dragCurrentX = evt.nativeEvent.pageX;
				let dragChangeX = dragStartXRef.current - dragCurrentX;
				let dragChangeXAdjusted = Math.round(dragChangeX / 2);
				bodyFrameRef.current = modFrame(dragStartFrameRef.current + dragChangeXAdjusted);
				forceAnim((f) => f + 1);
			},
			onPanResponderRelease: (evt) => {
				setIsDragging(false);
			},
		})
	).current;


	//* Time calculation
	function solarElevationAt(date: any, lat: number, lon: number) {
		const pos = SUNCALC.getPosition(date, lat, lon);
		return (pos.altitude * 180) / Math.PI;
	}

	function findNextBodyTime(startDate: any, lat: number, lon: number) {
		const step = 60 * 1000; // 1-minute steps
		let date = new Date(startDate.getTime());
		let ele = solarElevationAt(date, lat, lon);
		const isBefore = ele <= BODY?.targetElevation;

		while (true) {
			date = new Date(date.getTime() + step);
			ele = solarElevationAt(date, lat, lon);
			if ((isBefore && ele > BODY?.targetElevation) || (!isBefore && ele <= BODY?.targetElevation)) {
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
		if (!BODY) return; // Wait until body is loaded

		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
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

			if (dt <= threshold) setIsBodyTimeNow(true);
			else {
				setIsBodyTimeNow(false);

				let nextBodyTime = next
					.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true })
					.replace(/\s/g, "");
				setBodyTime(nextBodyTime);

				let nextBodyTimeDate = next.toLocaleDateString(undefined, {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
				});
				setBodyTimeDate(nextBodyTimeDate);
			}
		})();
	}, [BODY]);


	//* Text fitting
	let nextBodyTimeWidth = 0;
	const charWidths: any = {
		"A": 12,
		"M": 18.5,
		"N": 18.5,
		"O": 12,
		"P": 12,

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
	};
	const charHeight = 57.5;
	for (let i = 0; i < bodyTime.length; i++) {
		let char = bodyTime[i];
		nextBodyTimeWidth += charWidths[char];
		if (i != bodyTime.length - 1) nextBodyTimeWidth++;
	}

	const bodyTextSize = 22;


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			alignItems: "center",
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
			overflow: "hidden",
		},

		glow: {
			position: "absolute",
			top: -glowDiameter / 2,
			width: glowDiameter,
			height: glowDiameter,
		},

		spriteSheetContainer: {
			marginTop: -GLOBAL.slotWidth / 2,
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotWidth,
			transform: [{ rotate: `${BODY?.axialTilt}deg` }],
			overflow: "hidden",
			zIndex: 9999,
		},

		spriteSheetImg: {
			width: bodyFrameWidth * GLOBAL.slotWidth,
			height: bodyFrameHeight * GLOBAL.slotWidth,
			marginLeft: -(bodyFrameRef.current % bodyFrameWidth) * GLOBAL.slotWidth,
			marginTop: -Math.floor(bodyFrameRef.current / bodyFrameWidth) * GLOBAL.slotWidth,
		},

		timeContainer: {
			justifyContent: "center",
			width: "100%",
			margin: "auto",
		},

		nextText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "PlantasiaMyrtillo-Bold",
			fontSize: bodyTextSize,
			color: GLOBAL.uiColors[0],
		},

		nextBodyTime: {
			fontFamily: "RandomWikiSerexine-Regular",
			color: BODY?.colors[0],
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
			fontFamily: "PlantasiaMyrtillo-Bold",
			fontSize: bodyTextSize,
			paddingBottom: 0.3 * bodyTextSize,
			color: GLOBAL.uiColors[0],
		},

		actualDateText: {
			fontFamily: "RandomWikiSerexine-Regular",
			color: BODY?.colors[0],
		},

		cityTextContainer: {
			justifyContent: "center",
			width: "100%",
		},

		cityText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "RandomWikiSerexine-Regular",
			// fontSize: ((GLOBAL.slotWidth / 2) / cityText.length) * 2,
			fontSize: bodyTextSize,
			paddingBottom: 0.7 * bodyTextSize,
			marginBottom: "auto",
			color: GLOBAL.uiColors[0],
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Image style={styles.glow} source={require("../assets/images/glow.png")} />
			<View style={styles.spriteSheetContainer} {...panResponder.panHandlers}>
				<Image style={styles.spriteSheetImg} source={BODY?.spriteSheet} />
			</View>

			<View style={styles.timeContainer}>
				<Text style={styles.nextText}>
					Your next <Text style={styles.nextBodyTime}>{BODY?.name} Time</Text> will occur at
				</Text>

				<Text style={styles.timeText}>{bodyTime}</Text>

				<Text style={styles.dateText}>
					on <Text style={styles.actualDateText}>{bodyTimeDate}</Text>
				</Text>
			</View>

			<Text style={styles.cityText}>{cityText}</Text>
		</View>
	);
}
