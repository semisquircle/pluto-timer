import * as GLOBAL from "@/ref/global";
import { SlotTopShadow } from "@/ref/slot-shadows";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, StyleSheet, Text, View } from "react-native";
import { Defs, Path, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";


//* Fonts
const bodyTimeFontPrefs: any[] = [
	{
		name: "Hades-TallFat",
		spacing: 1,
		glyphHeight: 57.5,
		glyphWidths: {
			"A": 12,
			"M": 18.5,
			"N": 18.5,
			"O": 12,
			"P": 12,
			"W": 18.5,

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
			"!": 5.5
		}
	},
	{
		name: "Hades-ShortFat",
		spacing: 1,
		glyphHeight: 44.5,
		glyphWidths: {
			"A": 12,
			"M": 18.5,
			"N": 18.5,
			"O": 12,
			"P": 12,
			"W": 18.5,

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
			"!": 5.5
		}
	},
	{
		name: "Hades-ShortSkinny",
		spacing: 1.5,
		glyphHeight: 51.5,
		glyphWidths: {
			"A": 12.5,
			"M": 19.5,
			"N": 19.5,
			"O": 12.5,
			"P": 12.5,
			"W": 19.5,

			"0": 12.5,
			"1": 5.5,
			"2": 12.5,
			"3": 12.5,
			"4": 12.5,
			"5": 12.5,
			"6": 12.5,
			"7": 12.5,
			"8": 12.5,
			"9": 12.5,

			":": 5.5,
			"!": 5.5
		}
	}
];


//* Body
const bodyFrameWidth = 20;
const bodyFrameHeight = 20;
const totalBodyFrames = bodyFrameWidth * bodyFrameHeight;
const bodyAnimFPS = 30;


export default function HomeScreen() {
	//* App storage
	const ActiveTab = GLOBAL.useSaveStore((state) => state.activeTab);
	const SetActiveTab = GLOBAL.useSaveStore((state) => state.setActiveTab);

	const ActiveBody = GLOBAL.useSaveStore((state) => state.activeBody);
	const SetActiveBody = GLOBAL.useSaveStore((state) => state.setActiveBody);

	const SavedCities = GLOBAL.useSaveStore((state) => state.savedCities);
	const PushSavedCity = GLOBAL.useSaveStore((state) => state.pushSavedCity);
	const UnshiftSavedCity = GLOBAL.useSaveStore((state) => state.unshiftSavedCity);

	const ActiveCityIndex = GLOBAL.useSaveStore((state) => state.activeCityIndex);
	const SetActiveCityIndex = GLOBAL.useSaveStore((state) => state.setActiveCityIndex);
	const ActiveCity = SavedCities[ActiveCityIndex];

	const NotifFreqs = GLOBAL.useSaveStore((state) => state.notifFreqs);
	const ToggleNotifFreq = GLOBAL.useSaveStore((state) => state.toggleNotifFreq);

	const NotifReminders = GLOBAL.useSaveStore((state) => state.notifReminders);
	const ToggleNotifReminder = GLOBAL.useSaveStore((state) => state.toggleNotifReminder);

	const IsFormat24Hour = GLOBAL.useSaveStore((state) => state.isFormat24Hour);
	const SetIsFormat24Hour = GLOBAL.useSaveStore((state) => state.setIsFormat24Hour);


	//* Colors
	const bodyTextColor = ActiveBody?.palette[0];
	const activeCityColor = ActiveBody?.palette[1];
	const youAreHereColor = ActiveBody?.palette[2];


	//* Body rotation animation/dragging
	const bodyMajorAxis = ActiveBody?.scale.x! * GLOBAL.slot.width;
	const bodyMinorAxis = ActiveBody?.scale.y! * GLOBAL.slot.width;

	const [isBodyPlaceholderImgDisplayed, setIsBodyPlaceholderImgDisplayed] = useState<boolean>(false);
	const [isBodySpriteSheetDisplayed, setIsBodySpriteSheetDisplayed] = useState<boolean>(false);
	const bodyIntervalRef = useRef<any>(null);
	const [bodyFrame, setBodyFrame] = useState<number>(0);
	const [isDraggingBody, setIsDraggingBody] = useState<boolean>(false);
	const dragStartFrameRef = useRef(0);
	const dragStartXRef = useRef(0);
	const dragStartYRef = useRef(0);

	// Ensures negative frame numbers get wrapped back around
	const modFrame = (n: number) => ((n % totalBodyFrames) + totalBodyFrames) % totalBodyFrames;

	useEffect(() => {
		if (isBodySpriteSheetDisplayed && !isDraggingBody) {
			bodyIntervalRef.current = setInterval(() => {
				setBodyFrame(prev => modFrame(prev - 1));
			}, 1000 / bodyAnimFPS);
		}
		else clearInterval(bodyIntervalRef.current);

		dragStartFrameRef.current = bodyFrame;

		return () => clearInterval(bodyIntervalRef.current);
	}, [isBodySpriteSheetDisplayed, isDraggingBody]);

	const bodyPanResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: (evt) => {
				const a = bodyMinorAxis / 2;
				const b = bodyMajorAxis / 2;
				const x = evt.nativeEvent.pageX - GLOBAL.screen.horizOffset - a;
				const y = evt.nativeEvent.pageY - GLOBAL.screen.topOffset - GLOBAL.screen.horizOffset;
				const theta = Math.atan2(x, y);
				const r = (a * b) / Math.sqrt(a**2 * Math.sin(theta)**2 + b**2 * Math.cos(theta)**2);
				return Math.sqrt(x**2 + y**2) <= r; //? Only accept touches inside ellipse
			},
			onPanResponderGrant: (evt) => {
				setIsDraggingBody(true);
				dragStartXRef.current = evt.nativeEvent.pageX;
				dragStartYRef.current = evt.nativeEvent.pageY;
			},
			onPanResponderMove: (evt) => {
				const dragCurrentX = evt.nativeEvent.pageX;
				const dragCurrentY = evt.nativeEvent.pageY;
				const dx = dragCurrentX - dragStartXRef.current;
				const dy = dragCurrentY - dragStartYRef.current;

				// Axial tilt in radians (negative because screen Y increases downward)
				const theta = (ActiveBody?.axialTilt ?? 0) * (Math.PI / 180);
				const dragAlongTilt = (dx * Math.cos(theta)) + (dy * Math.sin(theta));

				const dragChangeXAdjusted = Math.round(-dragAlongTilt / 2); // Negative to match original direction
				setBodyFrame(modFrame(dragStartFrameRef.current + dragChangeXAdjusted));
			},
			onPanResponderRelease: () => {
				setIsDraggingBody(false);
			},
		})
	).current;


	//* Finger animation
	const fingerTranslateDistance = 100;
	const fingerTheta = ActiveBody?.axialTilt! * (Math.PI / 180);
	const fingerDx = Math.cos(fingerTheta);
	const fingerDy = Math.sin(fingerTheta);

	// Timing (in seconds)
	const fingerFadeDuration = 0.5;
	const fingerTranslateDuration = 1;
	const fingerAnimInterval = 30;

	const fingerOpacity = useRef(new Animated.Value(0)).current;
	const fingerTranslate = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animateFinger = () => {
			fingerOpacity.setValue(0);
			fingerTranslate.setValue(0);

			Animated.sequence([
				Animated.timing(fingerOpacity, {
					toValue: 1,
					duration: fingerFadeDuration * 1000,
					useNativeDriver: true,
				}),
				Animated.timing(fingerTranslate, {
					toValue: 1,
					duration: fingerTranslateDuration * 1000,
					useNativeDriver: true,
				}),
				Animated.timing(fingerOpacity, {
					toValue: 0,
					duration: fingerFadeDuration * 1000,
					useNativeDriver: true,
				}),
			]).start(() => {
				setTimeout(animateFinger, fingerAnimInterval * 1000);
			});
		};

		// animateFinger();

		const initialTimeout = setTimeout(animateFinger, fingerAnimInterval * 1000);
		return () => clearTimeout(initialTimeout);
	}, []);


	//* Text fitting
	const nextBodyTime = ActiveCity.getClockTime();
	const nextBodyTimeText = ActiveCity.isBodyTimeNow() ? "NOW!" : nextBodyTime;
	const nextBodyDate = ActiveCity.getDateLong();
	const bodyTimeFontPref = bodyTimeFontPrefs[ActiveCity.isBodyTimeNow() ? 1 : 0];

	const nextBodyTimeWidth = useMemo(() => {
		return nextBodyTimeText.split("").reduce((w, char, i) =>
			w + bodyTimeFontPref.glyphWidths[char] +
			(i < nextBodyTimeText.length - 1 ? bodyTimeFontPref.spacing : 0)
		, 0);
	}, [nextBodyTimeText]);

	const locationNameTextOffset = GLOBAL.screen.horizOffset;
	const locationNameTextSize =
		(ActiveCity.name.length > 20) ? GLOBAL.ui.bodyTextSize :
		(ActiveCity.name.length > 10) ? 1.5 * GLOBAL.ui.bodyTextSize :
		2 * GLOBAL.ui.bodyTextSize;
	const youAreHereTextOffset = locationNameTextOffset + locationNameTextSize + 3;
	const youAreHereTextSize = 0.6 * GLOBAL.ui.bodyTextSize;


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			justifyContent: "center",
			alignItems: "center",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			overflow: "hidden",
		},

		bodySpriteSheetContainer: {
			position: "absolute",
			top: -bodyMinorAxis / 2,
			width: bodyMajorAxis,
			height: bodyMinorAxis,
			overflow: "hidden",
		},

		bodyPlaceholder: {
			position: "absolute",
			width: bodyMajorAxis,
			height: bodyMinorAxis,
			backgroundColor: ActiveBody?.palette[2],
			borderRadius: "50%",
		},

		bodyPlaceholderImg: {
			position: "absolute",
			width: bodyMajorAxis,
			height: bodyMinorAxis
		},

		bodySpriteSheetWrapper: {
			position: "absolute",
			left: -(bodyFrame % bodyFrameWidth) * bodyMajorAxis,
			top: -Math.floor(bodyFrame / bodyFrameWidth) * bodyMinorAxis,
			width: bodyFrameWidth * bodyMajorAxis,
			height: bodyFrameHeight * bodyMinorAxis,
		},

		bodySpriteSheetImg: {
			position: "absolute",
			width: "100%",
			height: "100%",
		},

		finger: {
			position: "absolute",
			top: 0.2 * GLOBAL.slot.width,
			width: 0.25 * GLOBAL.slot.width,
			height: 0.25 * GLOBAL.slot.width,
			opacity: fingerOpacity,
			transform: [
				{
					translateX: fingerTranslate.interpolate({
						inputRange: [0, 1],
						outputRange: [
							-(fingerTranslateDistance / 2) * fingerDx,
							(fingerTranslateDistance / 2) * fingerDx
						],
					}),
				},
				{
					translateY: fingerTranslate.interpolate({
						inputRange: [0, 1],
						outputRange: [
							-(fingerTranslateDistance / 2) * fingerDy,
							(fingerTranslateDistance / 2) * fingerDy
						],
					}),
				},
			],
			zIndex: 9999,
		},

		fingerImg: {
			width: "100%",
			height: "100%",
		},

		timeContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			top: bodyMinorAxis / 2,
			height: GLOBAL.slot.height - (bodyMinorAxis / 2) - (youAreHereTextOffset + youAreHereTextSize),
		},

		nextText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.palette[0],
		},

		bodyTimeText: {
			fontFamily: "Trickster-Reg",
			color: bodyTextColor,
		},

		nextBodyTime: {
			width: "100%",
			textAlign: "center",
			fontFamily: bodyTimeFontPref.name,
			fontSize: ((GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset)) / nextBodyTimeWidth) * bodyTimeFontPref.glyphHeight,
			marginVertical: GLOBAL.screen.horizOffset,
			color: GLOBAL.ui.palette[0],
		},

		dateText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			marginTop: -0.15 * GLOBAL.ui.bodyTextSize,
			paddingBottom: 0.3 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.palette[0],
		},

		nextBodyDate: {
			fontFamily: "Trickster-Reg",
			color: bodyTextColor,
		},

		cityTextContainer: {
			position: "absolute",
			width: "100%",
			height: "100%",
		},

		cityTextSvg: {
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<View style={styles.bodySpriteSheetContainer} {...bodyPanResponder.panHandlers}>
				{(!isBodyPlaceholderImgDisplayed) &&
					<View style={styles.bodyPlaceholder}></View>
				}

				{(!isBodySpriteSheetDisplayed) &&
					<ExpoImage
						style={styles.bodyPlaceholderImg}
						source={ActiveBody?.thumbnail}
						onDisplay={() => {
							setIsBodyPlaceholderImgDisplayed(true);
						}}
					/>
				}

				{(isBodyPlaceholderImgDisplayed) &&
					<Animated.View style={[styles.bodySpriteSheetWrapper]}>
						<ExpoImage
							style={styles.bodySpriteSheetImg}
							source={ActiveBody?.spriteSheet}
							onDisplay={() => {
								setIsBodySpriteSheetDisplayed(true);
							}}
						/>
					</Animated.View>
				}
			</View>

			<Animated.View style={styles.finger} pointerEvents="none">
				<ExpoImage style={styles.fingerImg} source={require("../assets/images/finger.png")} />
			</Animated.View>

			<View style={[styles.timeContainer, GLOBAL.ui.skewStyle]} pointerEvents="none">
				<Text style={styles.nextText}>
					{ActiveCity.isBodyTimeNow() ? "It's " : "Your next "}
					<Text style={styles.bodyTimeText}>{ActiveBody?.name} Time</Text>
					{ActiveCity.isBodyTimeNow() ? "" : " will occur at"}
				</Text>

				<Text style={styles.nextBodyTime} numberOfLines={1}>
					{ActiveCity.isBodyTimeNow() ? "NOW!" : nextBodyTime}
				</Text>

				{!ActiveCity.isBodyTimeNow() && (
					<Text style={styles.dateText}>
						on <Text style={styles.nextBodyDate}>{nextBodyDate}</Text>
					</Text>
				)}
			</View>

			{/* Curved city text */}
			<View style={styles.cityTextContainer} pointerEvents="none">
				<Svg style={styles.cityTextSvg} viewBox={`0 0 ${GLOBAL.slot.width} ${GLOBAL.slot.height}`}>
					<Defs>
						<Path id="semi-ellipse-cur-loc" fill="transparent" d={`
							M ${youAreHereTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
							A ${GLOBAL.slot.ellipseSemiMajor - youAreHereTextOffset} ${GLOBAL.slot.ellipseSemiMinor - youAreHereTextOffset}
								0 0 0 ${GLOBAL.slot.width - youAreHereTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
						`}/>

						<Path id="semi-ellipse-city" fill="transparent" d={`
							M ${locationNameTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
							A ${GLOBAL.slot.ellipseSemiMajor - locationNameTextOffset} ${GLOBAL.slot.ellipseSemiMinor - locationNameTextOffset}
								0 0 0 ${GLOBAL.slot.width - locationNameTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
						`}/>
					</Defs>

					{(ActiveCityIndex == 0) && 
						<SvgText
							key={`cur-loc-${youAreHereTextOffset}`} //? Forces text update on location change
							fill={youAreHereColor}
							fontFamily="Trickster-Reg-Arrow"
							fontSize={youAreHereTextSize}
							letterSpacing="0.5"
							textAnchor="middle"
						>
							<TextPath href="#semi-ellipse-cur-loc" startOffset="56%">
								<TSpan>¹ You are here!</TSpan>
							</TextPath>
						</SvgText>
					}

					<SvgText
						fill={activeCityColor}
						fontFamily="Trickster-Reg"
						fontSize={locationNameTextSize}
						letterSpacing="1"
						textAnchor="middle"
					>
						<TextPath href="#semi-ellipse-city" startOffset="56%">
							<TSpan>{ActiveCity.name}</TSpan>
						</TextPath>
					</SvgText>
				</Svg>
			</View>

			<SlotTopShadow />
		</View>
	);
}
