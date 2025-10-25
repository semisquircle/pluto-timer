import * as GLOBAL from "@/ref/global";
import { SlotTopShadow } from "@/ref/slot-shadows";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import Reanimated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { withPause } from "react-native-redash";
import { Defs, Ellipse, Path, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";


const ReaniamtedExpoImage = Reanimated.createAnimatedComponent(ExpoImage);

//* Body
const bodyFrameWidth = 20;
const bodyFrameHeight = 20;
const totalBodyFrames = bodyFrameWidth * bodyFrameHeight;


export default function HomeScreen() {
	//* App storage
	const ActiveBody = GLOBAL.useSaveStore((state) => state.activeBody);
	const SavedCities = GLOBAL.useSaveStore((state) => state.savedCities);
	const ActiveCityIndex = GLOBAL.useSaveStore((state) => state.activeCityIndex);
	const ActiveCity = SavedCities[ActiveCityIndex];
	const IsFormat24Hour = GLOBAL.useSaveStore((state) => state.isFormat24Hour);


	//* Colors
	const bodyTextColor = ActiveBody?.palette[0];
	const activeCityColor = ActiveBody?.palette[1];
	const youAreHereColor = ActiveBody?.palette[2];


	//* Body rotation animation/dragging
	const ringScaleDown = 0.5;
	const ringScaleUp = 1.75;
	const baseMajorAxis = ActiveBody?.scale.x! * GLOBAL.slot.width;
	const baseMinorAxis = ActiveBody?.scale.y! * GLOBAL.slot.width;
	const bodyMajorAxis = ((ActiveBody?.hasRings) ? ringScaleDown * ringScaleUp : 1) * baseMajorAxis;
	const bodyMinorAxis = ((ActiveBody?.hasRings) ? ringScaleDown * ringScaleUp : 1) * baseMinorAxis;
	const ringMajorAxis = ((ActiveBody?.hasRings) ? ringScaleUp : 1) * baseMajorAxis;
	const ringMinorAxis = ((ActiveBody?.hasRings) ? ringScaleUp : 1) * baseMinorAxis;

	const [isStarsImgDisplayed, setIsStarsImgDisplayed] = useState<boolean>(false);
	const [isBodyPlaceholderImgDisplayed, setIsBodyPlaceholderImgDisplayed] = useState<boolean>(false);
	const [isBodySpriteSheetDisplayed, setIsBodySpriteSheetDisplayed] = useState<boolean>(false);

	const bodyFrame = useSharedValue(0);
	const bodyFrameOffset = useSharedValue(0);
	const lastBodyFrameOffset = useSharedValue(0);
	const lastBodyFrameInt = useSharedValue(0);
	const dragStartX = useSharedValue(0);
	const dragStartY = useSharedValue(0);
	const isDraggingBody = useSharedValue(false);

	useEffect(() => {
		if (isBodySpriteSheetDisplayed) {
			bodyFrame.value = withPause(
				withRepeat(
					withTiming(
						totalBodyFrames - 1,
						{ duration: (1000 / GLOBAL.ui.fps) * totalBodyFrames, easing: Easing.linear }
					),
					-1,
					false
				),
				isDraggingBody
			);
		}
	}, [isBodySpriteSheetDisplayed, isDraggingBody]);
	
	const bodySpriteSheetAnimStyle = useAnimatedStyle(() => {
		const modFrame = (f: number) => ((f % totalBodyFrames) + totalBodyFrames) % totalBodyFrames;
		const frameInt = modFrame(Math.round(bodyFrame.value + bodyFrameOffset.value));
		return {
			left: -(frameInt % bodyFrameWidth) * ringMajorAxis,
			top: -Math.floor(frameInt / bodyFrameWidth) * ringMinorAxis,
		};
	});

	const bodyPanResponder = useMemo(() => {
		return PanResponder.create({
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
				isDraggingBody.value = true;
				dragStartX.value = evt.nativeEvent.pageX;
				dragStartY.value = evt.nativeEvent.pageY;
			},
			onPanResponderMove: (evt) => {
				const dx = evt.nativeEvent.pageX - dragStartX.value;
				const dy = evt.nativeEvent.pageY - dragStartY.value;
				const theta = (ActiveBody?.axialTilt ?? 0) * (Math.PI / 180);
				const offsetAlongTilt = dx * Math.cos(theta) + dy * Math.sin(theta);
				bodyFrameOffset.value = (lastBodyFrameOffset.value + (offsetAlongTilt / 2)) % totalBodyFrames;

				const modFrame = (f: number) => ((f % totalBodyFrames) + totalBodyFrames) % totalBodyFrames;
				const bodyFrameInt = modFrame(Math.round(bodyFrame.value + bodyFrameOffset.value));
				if (Math.abs(bodyFrameInt - lastBodyFrameInt.value) > 0) {
					lastBodyFrameInt.value = bodyFrameInt;
					Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
				}
			},
			onPanResponderRelease: () => {
				lastBodyFrameOffset.value = bodyFrameOffset.value;
				isDraggingBody.value = false;
			},
		});
	}, [ActiveBody]);


	//* Finger animation
	const fingerTranslateDistance = 100;
	const fingerTheta = ActiveBody?.axialTilt! * (Math.PI / 180);
	const fingerDx = Math.cos(fingerTheta);
	const fingerDy = Math.sin(fingerTheta);

	// Timing (in seconds)
	const fingerFadeDuration = 0.5;
	const fingerTranslateDuration = 1;
	const fingerAnimInterval = 30;

	const fingerOpacity = useSharedValue(0);
	const fingerTranslateProgress = useSharedValue(0);

	useEffect(() => {
		fingerOpacity.value = withRepeat(
			withSequence(
				withDelay(1000 * fingerAnimInterval, withTiming(0)),
				withTiming(1, { duration: 1000 * fingerFadeDuration }),
				withTiming(1, { duration: 1000 * fingerTranslateDuration }),
				withTiming(0, { duration: 1000 * fingerFadeDuration }),
			),
			-1,
			false
		);

		fingerTranslateProgress.value = withRepeat(
			withSequence(
				withDelay(1000 * fingerAnimInterval, withTiming(0)),
				withTiming(0, { duration: 1000 * fingerFadeDuration }),
				withTiming(1, { duration: 1000 * fingerTranslateDuration }),
				withTiming(1, { duration: 1000 * fingerFadeDuration }),
			),
			-1,
			false
		);
	}, []);

	const fingerAnimStyle = useAnimatedStyle(() => {
		return {
			opacity: fingerOpacity.value,
			transform: [
				{ translateX: ((fingerTranslateProgress.value * fingerTranslateDistance) - (fingerTranslateDistance / 2)) * fingerDx },
				{ translateY: ((fingerTranslateProgress.value * fingerTranslateDistance) - (fingerTranslateDistance / 2)) * fingerDy },
			],
		};
	});


	//* Text fitting
	const getFontWidth = (text: string, font: GLOBAL.TimeFont) => {
		return text.split("").reduce((w, char, i) => {
			const glyph = font.glyph_widths.find(g => g.char === char);
			return w + glyph!.width + ((i < text.length - 1) ? font.spacing : 0);
		}, 0);
	}

	const getFontSize = (font: GLOBAL.TimeFont, width: number, padding: number) => {
		return ((GLOBAL.slot.width - (2 * padding)) / width) * font.glyph_height;
	}

	const nextBodyTime = (IsFormat24Hour) ? ActiveCity.get24HourClockTime() : ActiveCity.get12HourClockTime();
	// const nextBodyTime = "1:11PM";
	const nextBodyDate = ActiveCity.getDateLong();
	let nextBodyTimeFont = GLOBAL.ui.timeFonts[(IsFormat24Hour) ? 2 : 0];
	let nextBodyTimeFontWidth = getFontWidth(nextBodyTime, nextBodyTimeFont);
	if (nextBodyTimeFontWidth < 1.2 * nextBodyTimeFont.glyph_height) {
		nextBodyTimeFont = GLOBAL.ui.timeFonts[1];
		nextBodyTimeFontWidth = getFontWidth(nextBodyTime, nextBodyTimeFont);
	}
	const nextBodyTimeFontSize = getFontSize(nextBodyTimeFont, nextBodyTimeFontWidth, GLOBAL.screen.horizOffset);

	const nowFont = GLOBAL.ui.timeFonts[1];
	const nowFontWidth = getFontWidth("NOW!", nowFont);
	const nowFontSize = getFontSize(nowFont, nowFontWidth, 2 * GLOBAL.screen.horizOffset);

	const locationNameTextOffset = GLOBAL.screen.horizOffset;
	const locationNameTextSize =
		(ActiveCity.name.length > 20) ? GLOBAL.ui.bodyTextSize
		: (ActiveCity.name.length > 10) ? 1.5 * GLOBAL.ui.bodyTextSize
		: 2 * GLOBAL.ui.bodyTextSize;
	const youAreHereTextOffset = locationNameTextOffset + locationNameTextSize + 3;
	const youAreHereTextSize = 0.6 * GLOBAL.ui.bodyTextSize;


	//* Is body time now?
	const [isBodyTimeNow, setIsBodyTimeNow] = useState(ActiveCity.isBodyTimeNow());
	useEffect(() => {
		const untilBodyTime = ActiveCity.nextBodyTimes[0].getTime() - Date.now();
		
		const scheduleBodyTime = setTimeout(() => {
			setIsBodyTimeNow(true);
		}, untilBodyTime);

		const transpireBodyTime = setTimeout(() => {
			ActiveCity.setNextBodyTimes(ActiveBody!);
			setIsBodyTimeNow(false);
		}, untilBodyTime + GLOBAL.bodyTimeLength);

		return () => {
			if (!isBodyTimeNow) {
				clearTimeout(scheduleBodyTime);
				clearTimeout(transpireBodyTime);
			}
		}
	}, [ActiveCity.nextBodyTimes, isBodyTimeNow]);

	const nextBodyTimeProgress = useSharedValue((isBodyTimeNow) ? 0 : 1);
	const nowProgress = useSharedValue((isBodyTimeNow) ? 1 : 0);
	const bodyTimeAnimDuration = 2 * 1000 * GLOBAL.ui.animDuration;
	useEffect(() => {
		nextBodyTimeProgress.value = withDelay(
			(isBodyTimeNow) ? 0 : bodyTimeAnimDuration,
			withTiming(
				(isBodyTimeNow) ? 0 : 1,
				{ duration: bodyTimeAnimDuration, easing: Easing.linear }
			)
		);

		nowProgress.value = withDelay(
			(isBodyTimeNow) ? bodyTimeAnimDuration : 0,
			withTiming(
				(isBodyTimeNow) ? 1 : 0,
				{ duration: bodyTimeAnimDuration, easing: Easing.linear }
			)
		);
	}, [isBodyTimeNow]);

	const starsAnimStyle = useAnimatedStyle(() => {
		return { opacity: interpolate(nowProgress.value, [0, 1], [0, 0.5]) }
	});

	const nextBodyTimeAnimStyle = useAnimatedStyle(() => {
		return { opacity: nextBodyTimeProgress.value }
	});

	const nowAnimStyle = useAnimatedStyle(() => {
		return { opacity: nowProgress.value }
	});


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			justifyContent: "center",
			alignItems: "center",
			height: GLOBAL.slot.height,
			overflow: "hidden",
		},

		stars: {
			position: "absolute",
			top: 0,
			width: 0.7 * GLOBAL.slot.height,
			height: GLOBAL.slot.height,
		},

		bodySpriteSheetContainer: {
			position: "absolute",
			top: -ringMinorAxis / 2,
			justifyContent: "center",
			alignItems: "center",
			width: ringMajorAxis,
			height: ringMinorAxis,
			overflow: "hidden",
		},

		bodyPlaceholderImg: {
			position: "absolute",
			width: ringMajorAxis,
			height: ringMinorAxis
		},

		bodySpriteSheetWrapper: {
			position: "absolute",
			width: bodyFrameWidth * ringMajorAxis,
			height: bodyFrameHeight * ringMinorAxis,
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
			zIndex: 9999,
		},

		fingerImg: {
			width: "100%",
			height: "100%",
		},

		nextBodyTimeContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			top: bodyMinorAxis / 2,
			width: "100%",
			height: GLOBAL.slot.height - (bodyMinorAxis / 2) - (youAreHereTextOffset + youAreHereTextSize),
		},

		nextText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Trickster-Reg-Semi",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.palette[0],
		},

		bodyTimeName: {
			fontFamily: "Trickster-Reg-Semi",
			color: bodyTextColor,
		},

		nextBodyTime: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Hades " + nextBodyTimeFont.name,
			fontSize: nextBodyTimeFontSize,
			marginVertical: GLOBAL.screen.horizOffset,
			color: GLOBAL.ui.palette[0],
		},

		nowContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			top: bodyMinorAxis / 2,
			width: "100%",
			height: GLOBAL.slot.height - (bodyMinorAxis / 2) - (youAreHereTextOffset + youAreHereTextSize),
		},

		now: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Hades " + nowFont.name,
			fontSize: nowFontSize,
			marginVertical: GLOBAL.screen.horizOffset,
			color: GLOBAL.ui.palette[0],
		},

		dateText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Trickster-Reg-Semi",
			fontSize: GLOBAL.ui.bodyTextSize,
			marginTop: -0.15 * GLOBAL.ui.bodyTextSize,
			paddingBottom: 0.3 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.palette[0],
		},

		nextBodyDate: {
			fontFamily: "Trickster-Reg-Semi",
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
			<ReaniamtedExpoImage
				style={[styles.stars, starsAnimStyle]}
				source={require("../assets/images/stars/stars-combined-compressed.png")}
				onDisplay={() => {
					setIsStarsImgDisplayed(true);
				}}
			/>

			<View style={styles.bodySpriteSheetContainer} {...bodyPanResponder.panHandlers}>
				{(!isBodyPlaceholderImgDisplayed) &&
					<Svg
						style={[{ position: "absolute" }, GLOBAL.ui.btnShadowStyle()]}
						width={bodyMajorAxis}
						height={bodyMinorAxis}
						viewBox={`0 0 ${bodyMajorAxis} ${bodyMinorAxis}`}
					>
						<Ellipse
							fill={ActiveBody?.colors[2]}
							cx={bodyMajorAxis / 2}
							cy={bodyMinorAxis / 2}
							rx={bodyMajorAxis / 2}
							ry={bodyMinorAxis / 2}
						/>
					</Svg>
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

				{(isStarsImgDisplayed && isBodyPlaceholderImgDisplayed) &&
					<Reanimated.View style={[styles.bodySpriteSheetWrapper, bodySpriteSheetAnimStyle]}>
						<ExpoImage
							style={styles.bodySpriteSheetImg}
							source={ActiveBody?.spriteSheet}
							cachePolicy="none"
							onDisplay={() => {
								setIsBodySpriteSheetDisplayed(true);
							}}
						/>
					</Reanimated.View>
				}
			</View>

			<Reanimated.View style={[styles.finger, fingerAnimStyle]} pointerEvents="none">
				<ExpoImage style={styles.fingerImg} source={require("../assets/images/finger.png")} />
			</Reanimated.View>

			<Reanimated.View
				style={[styles.nextBodyTimeContainer, GLOBAL.ui.skewStyle, nextBodyTimeAnimStyle]}
				pointerEvents="none"
			>
				<Text style={styles.nextText}>
					{"Your next "}
					<Text style={styles.bodyTimeName}>
						{(ActiveBody?.name == "Terra") ? "Solar Noon" : `${ActiveBody?.name} Time`}
					</Text>
					{" will occur at"}
				</Text>
				<Text style={styles.nextBodyTime} numberOfLines={1}>{nextBodyTime}</Text>
				<Text style={styles.dateText}>
					on <Text style={styles.nextBodyDate}>{nextBodyDate}</Text>
				</Text>
			</Reanimated.View>

			<Reanimated.View
				style={[styles.nowContainer, GLOBAL.ui.skewStyle, GLOBAL.ui.btnShadowStyle(), nowAnimStyle]}
				pointerEvents="none"
			>
				<Text style={[styles.nextText, { fontSize: 1.5 * GLOBAL.ui.bodyTextSize }]}>
					{"It's "}
					<Text style={styles.bodyTimeName}>
						{(ActiveBody?.name == "Terra") ? "Solar Noon" : `${ActiveBody?.name} Time`}
					</Text>
				</Text>
				<Text style={styles.now} numberOfLines={1}>NOW!</Text>
			</Reanimated.View>

			{/* Curved city text */}
			<View style={[styles.cityTextContainer, GLOBAL.ui.btnShadowStyle()]} pointerEvents="none">
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
							fontFamily="Trickster-Reg-Semi"
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
						fontFamily="Trickster-Reg-Semi"
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
