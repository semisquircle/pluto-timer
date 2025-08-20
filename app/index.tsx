import React, { useEffect, useRef, useState } from "react";
import { Image, PanResponder, StyleSheet, Text, View } from "react-native";
import { Path, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";
import * as GLOBAL from "../ref/global";

export default function HomeScreen() {
	//* Global app storage
	const ActiveTab = GLOBAL.useAppStore((state) => state.activeTab);
	const SetActiveTab = GLOBAL.useAppStore((state) => state.setActiveTab);

	const ActiveBody = GLOBAL.useAppStore((state) => state.activeBody);
	const SetActiveBody = GLOBAL.useAppStore((state) => state.setActiveBody);

	const SavedLocations = GLOBAL.useAppStore((state) => state.savedLocations);
	const EditSavedLocation = GLOBAL.useAppStore((state) => state.editSavedLocation);

	const ActiveLocationIndex = GLOBAL.useAppStore((state) => state.activeLocationIndex);
	const SetActiveLocationIndex = GLOBAL.useAppStore((state) => state.setActiveLocationIndex);
	const ActiveLocation = SavedLocations[ActiveLocationIndex];


	//* Body rotation animation/dragging
	// const bodyDiameter = GLOBAL.slot.width - 2 * (GLOBAL.screen.borderRadius.ios - GLOBAL.screen.borderWidth);
	const bodyDiameter = GLOBAL.slot.width;
	const glowDiameter = 1.4 * bodyDiameter;
	const bodyClip = 2;
	const shadowWallOffset = 50;

	const bodyFrameWidth = 20;
	const bodyFrameHeight = 20;
	const totalFrames = bodyFrameWidth * bodyFrameHeight;

	const bodyAnimFPS = 30;
	const intervalRef = useRef<any>(null);
	const bodyFrameRef = useRef(0);
	const [, forceBodyRotAnim] = useState(0);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const dragStartFrameRef = useRef(0);
	const dragStartXRef = useRef(0);
	const dragStartYRef = useRef(0);

	// Ensures negative frame numbers get wrapped back around
	function modFrame(n: number) {
		let m = totalFrames - 1;
		return ((n % m) + m) % m;
	}

	useEffect(() => {
		if (!isDragging) {
		intervalRef.current = setInterval(() => {
			bodyFrameRef.current = modFrame(bodyFrameRef.current - 1);
			forceBodyRotAnim((f) => f + 1);
		}, 1000 / bodyAnimFPS);
		} else clearInterval(intervalRef.current);

		return () => clearInterval(intervalRef.current);
	}, [isDragging]);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: (evt) => {
				const x = evt.nativeEvent.pageX - GLOBAL.screen.borderWidth;
				const y = evt.nativeEvent.pageY - GLOBAL.screen.topOffset - GLOBAL.screen.borderWidth;
				const r = (bodyDiameter - bodyClip) / 2;
				const dx = x - r;
				const dy = y;
				return Math.sqrt(dx * dx + dy * dy) <= r; //? Only accept touches inside circle
			},
			onPanResponderGrant: (evt) => {
				setIsDragging(true);
				dragStartFrameRef.current = bodyFrameRef.current;
				dragStartXRef.current = evt.nativeEvent.pageX;
				dragStartYRef.current = evt.nativeEvent.pageY;
			},
			onPanResponderMove: (evt) => {
				const dragCurrentX = evt.nativeEvent.pageX;
				const dragCurrentY = evt.nativeEvent.pageY;
				const dx = dragCurrentX - dragStartXRef.current;
				const dy = dragCurrentY - dragStartYRef.current;

				// Axial tilt in radians (negative because screen Y increases downward)
				const theta = (ActiveBody?.axialTilt ?? 0) * Math.PI / 180;
				const dragAlongTilt = dx * Math.cos(theta) + dy * Math.sin(theta);

				const dragChangeXAdjusted = Math.round(-dragAlongTilt / 2); // Negative to match original direction
				bodyFrameRef.current = modFrame(dragStartFrameRef.current + dragChangeXAdjusted);
				forceBodyRotAnim((f) => f + 1);
			},
			onPanResponderRelease: () => {
				setIsDragging(false);
			},
		})
	).current;


	//* Text fitting
	const bodyTimeFontPrefs: any[] = [
		{
			name: "Hades-Tall",
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
			name: "Hades-Short",
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

	const bodyTimeFontIndex = (ActiveLocation.isBodyTimeNow) ? 1 : 0;
	const bodyTimeFontPref = bodyTimeFontPrefs[bodyTimeFontIndex];

	let nextBodyTimeWidth = 0;
	for (let i = 0; i < ActiveLocation.nextBodyTime.length; i++) {
		const char = ActiveLocation.nextBodyTime[i];
		nextBodyTimeWidth += bodyTimeFontPref.glyphWidths[char];
		if (i != ActiveLocation.nextBodyTime.length - 1) nextBodyTimeWidth += bodyTimeFontPref.spacing;
	}

	const locationNameTextSize =
		(ActiveLocation.name.length > 20) ? GLOBAL.ui.bodyTextSize :
		(ActiveLocation.name.length > 10) ? 1.5 * GLOBAL.ui.bodyTextSize :
		2 * GLOBAL.ui.bodyTextSize;
	const locationNameTextOffset = GLOBAL.screen.borderWidth;
	const curLocTextOffset = locationNameTextOffset + locationNameTextSize + 3;


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			justifyContent: "center",
			alignItems: "center",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			overflow: "hidden",
		},

		spriteSheetContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			top: -(bodyDiameter - bodyClip) / 2,
			width: bodyDiameter - bodyClip,
			height: bodyDiameter - bodyClip,
			borderRadius: "50%",
			transform: [{rotate: `${ActiveBody?.axialTilt}deg`}],
			overflow: "hidden",
			zIndex: 9998,
		},

		spriteSheetWrapper: {
			position: "absolute",
			width: bodyDiameter,
			height: bodyDiameter,
			// transform: [{scaleX: -1}],
		},

		spriteSheetImg: {
			width: bodyFrameWidth * bodyDiameter,
			height: bodyFrameHeight * bodyDiameter,
			marginLeft: -(bodyFrameRef.current % bodyFrameWidth) * bodyDiameter,
			marginTop: -Math.floor(bodyFrameRef.current / bodyFrameWidth) * bodyDiameter,
		},

		bodyShadow: {
			position: "absolute",
			top: -shadowWallOffset,
			width: GLOBAL.slot.width + 2 * shadowWallOffset,
			height: GLOBAL.slot.width + 2 * shadowWallOffset,
			zIndex: 9999,
			pointerEvents: "none",
		},

		bodyShadowSvg: {
			width: "100%",
			height: "100%",
			shadowColor: GLOBAL.ui.colors[1],
			shadowRadius: 40,
			shadowOpacity: 1,
			shadowOffset: { width: 0, height: 0 },
		},

		timeContainer: {
			position: "absolute",
			justifyContent: "center",
			width: "100%",
			marginTop: bodyDiameter / 3,
			transform: [{skewY: GLOBAL.slot.skew + "deg"}],
		},

		nextText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		nextBodyTime: {
			fontFamily: "Trickster-Reg",
			color: ActiveBody?.colors[0],
		},

		timeText: {
			width: "100%",
			textAlign: "center",
			fontFamily: bodyTimeFontPref.name,
			fontSize: ((GLOBAL.slot.width - 2 * GLOBAL.screen.borderWidth) / nextBodyTimeWidth) * bodyTimeFontPref.glyphHeight,
			marginVertical: GLOBAL.screen.borderWidth,
			color: GLOBAL.ui.colors[0],
		},

		dateText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			marginTop: -5,
			paddingBottom: 0.3 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		actualDateText: {
			fontFamily: "Trickster-Reg",
			color: ActiveBody?.colors[0],
		},

		cityTextContainer: {
			justifyContent: "center",
			width: "100%",
		},

		cityTextSvg: {
			position: "absolute",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<View style={styles.spriteSheetContainer} {...panResponder.panHandlers}>
				<View style={styles.spriteSheetWrapper}>
					<Image style={styles.spriteSheetImg} source={ActiveBody?.spriteSheet} />
				</View>
			</View>

			{Array.from({ length: 3 }).map((_, i) => (
				<View key={`shadow-${i}`} style={styles.bodyShadow} pointerEvents="none">
					<Svg
						style={styles.bodyShadowSvg}
						viewBox={`0 0 ${GLOBAL.slot.width + 2 * shadowWallOffset} ${GLOBAL.slot.width + 2 * shadowWallOffset}`}
					>
						<Path
							fill={GLOBAL.ui.colors[1]}
							d={`
								M 0,0
								h ${GLOBAL.slot.width + 2 * shadowWallOffset}
								v ${GLOBAL.slot.width / 2 + shadowWallOffset}
								h ${-shadowWallOffset}
								v ${-GLOBAL.slot.width / 2 + GLOBAL.slot.borderRadius}
								q 0,${-GLOBAL.slot.borderRadius} ${-GLOBAL.slot.borderRadius},${-GLOBAL.slot.borderRadius}
								h ${-GLOBAL.slot.width + 2 * GLOBAL.slot.borderRadius}
								q ${-GLOBAL.slot.borderRadius},0 ${-GLOBAL.slot.borderRadius},${GLOBAL.slot.borderRadius}
								v ${GLOBAL.slot.width / 2 - GLOBAL.slot.borderRadius}
								h ${-shadowWallOffset}
								z
							`}
						/>
					</Svg>
				</View>
			))}

			<View style={styles.timeContainer}>
				<Text style={styles.nextText}>
					{ActiveLocation.isBodyTimeNow ? "It's " : "Your next "}
					<Text style={styles.nextBodyTime}>{ActiveBody?.name} Time</Text>
					{ActiveLocation.isBodyTimeNow ? "" : " will occur at"}
				</Text>

				<Text style={styles.timeText}>{ActiveLocation.nextBodyTime}</Text>

				{!ActiveLocation.isBodyTimeNow && (
					<Text style={styles.dateText}>
						on <Text style={styles.actualDateText}>{ActiveLocation.nextBodyDateLong}</Text>
					</Text>
				)}
			</View>

			{/* Curved city text */}
			<Svg style={styles.cityTextSvg} viewBox={`0 0 ${GLOBAL.slot.width} ${GLOBAL.slot.height}`}>
				<Path id="semi-ellipse-city" fill="transparent" d={`
					M ${locationNameTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
					A ${GLOBAL.slot.ellipseSemiMajor - locationNameTextOffset} ${GLOBAL.slot.ellipseSemiMinor - locationNameTextOffset}
					0 0 0
					${GLOBAL.slot.width - locationNameTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
				`}/>

				<SvgText
					fill={ActiveBody?.colors[0]}
					fontFamily="Trickster-Reg"
					fontSize={locationNameTextSize}
					letterSpacing="1"
					textAnchor="middle"
				>
					<TextPath href="#semi-ellipse-city" startOffset="58%">
						<TSpan>{ActiveLocation.name}</TSpan>
					</TextPath>
				</SvgText>

				{(ActiveLocationIndex == 0) && (
					<>
						<Path id="semi-ellipse-cur-loc" fill="transparent" d={`
							M ${curLocTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
							A ${GLOBAL.slot.ellipseSemiMajor - curLocTextOffset} ${GLOBAL.slot.ellipseSemiMinor - curLocTextOffset}
							0 0 0
							${GLOBAL.slot.width - curLocTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
						`}/>

						<SvgText
							key={`cur-loc-${curLocTextOffset}`} //? Forces text update on location change
							fill={GLOBAL.ui.colors[0]}
							fontFamily="Trickster-Reg-Arrow"
							fontSize={0.6 * GLOBAL.ui.bodyTextSize}
							letterSpacing="0.5"
							textAnchor="middle"
						>
							<TextPath href="#semi-ellipse-cur-loc" startOffset="58%">
								<TSpan>¹ You are here!</TSpan>
							</TextPath>
						</SvgText>
					</>
				)}
			</Svg>
		</View>
	);
}
