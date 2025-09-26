import * as GLOBAL from "@/ref/global";
import { SlotBottomShadow, SlotTopShadow } from "@/ref/slot-shadows";
import { AllBodies, CelestialBody, SolarSystem } from "@/ref/solar-system";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { withPause } from "react-native-redash";
import { Circle, ClipPath, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";


//* Reanimated
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);


//* BOI popup
const boiPopupOffset = GLOBAL.screen.horizOffset;
const boiPopupWidth = GLOBAL.slot.width - 2 * boiPopupOffset;
const boiPopupHeight = 0.6 * GLOBAL.slot.width;
const boiPopupBorderRadius = GLOBAL.slot.borderRadius;
const boiPopupPadding = 3 * GLOBAL.ui.inputBorderWidth;

const boiPopupUseBtnBorderRadius = GLOBAL.screen.horizOffset;
const boiPopupUseBtnWidth = boiPopupWidth - (2 * boiPopupPadding);
const boiPopupUseBtnHeight = boiPopupUseBtnBorderRadius + (GLOBAL.slot.ellipseSemiMinor - boiPopupOffset - boiPopupPadding);

const boiPopupCloseBtnDimension = (2 * boiPopupBorderRadius) - (5 * GLOBAL.ui.inputBorderWidth) - (2 * boiPopupPadding);


//* Sol
const solDiameter = GLOBAL.slot.width;
const solFrameDimension = 1.3 * solDiameter;
const solFrameWidth = 20;
const solFrameHeight = 20;
const totalSolFrames = solFrameWidth * solFrameHeight;
const solAnimFPS = 30;
const solSeed = 2855613398;
const solPalette = ["#ffe066", "#ffe066", "#feb631", "#e3681e", "#992d0b", "#000000", "#000000"];


//* Systems
const centerBodyDiameter = 0.3 * GLOBAL.slot.width;

const systemNameTextOffset = GLOBAL.screen.horizOffset;
const systemNameTextSize = 0.8 * GLOBAL.ui.bodyTextSize;
const systemNameTextDescent = 0.15 * systemNameTextSize;

const systemSpacing = 0.2 * GLOBAL.slot.width;
const moonDiameter = 0.16 * GLOBAL.slot.width;
const moonOffset = (GLOBAL.slot.width - centerBodyDiameter - (2 * moonDiameter)) / 4;
const systemDiameter = centerBodyDiameter + (2 * moonOffset) + (2 * moonDiameter);

const notToScaleTextOffset = GLOBAL.screen.horizOffset;
const notToScaleTextSize = GLOBAL.ui.bodyTextSize;


//* Body button
interface bodyBtnInterface {
	body: any,
	diameter: number,
	isInterested: boolean,
	onPress: () => void,
	onDisplay: () => void,
}
function BodyBtn({ body, diameter, isInterested, onPress, onDisplay }: bodyBtnInterface) {
	const [isImgDisplayed, setIsImgDisplayed] = useState<boolean>(false);
	const newDiameter = (body.hasRings) ? 3 * diameter : diameter;

	const bodyInterestProgress = useSharedValue(0);
	useEffect(() => {
		bodyInterestProgress.value = withTiming(
			(isInterested) ? 1 : 0,
			{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.inOut(Easing.cubic) }
		);
	}, [isInterested]);

	const bodyAnimProps = useAnimatedProps(() => {
		return { strokeWidth: bodyInterestProgress.value * (2 * GLOBAL.ui.inputBorderWidth) }
	});

	return (
		<View style={{
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			width: diameter + (2 * GLOBAL.ui.inputBorderWidth),
			height: diameter + (2 * GLOBAL.ui.inputBorderWidth),
		}}>
			<AnimatedPressable
				style={{
					position: "absolute",
					justifyContent: "center",
					alignItems: "center",
					width: (body.scale.x * diameter) + (2 * GLOBAL.ui.inputBorderWidth),
					height: (body.scale.y * diameter) + (2 * GLOBAL.ui.inputBorderWidth),
				}}
				onPress={onPress}
			>
				<Svg
					style={GLOBAL.ui.btnShadowStyle()}
					width="100%"
					height="100%"
					viewBox={`0 0
						${(body.scale.x * diameter) + (2 * GLOBAL.ui.inputBorderWidth)}
						${(body.scale.y * diameter) + (2 * GLOBAL.ui.inputBorderWidth)}
					`}
				>
					<AnimatedEllipse
						fill={body.palette[2]}
						stroke={GLOBAL.ui.palette[0]}
						animatedProps={bodyAnimProps}
						cx={(body.scale.x * diameter) / 2 + GLOBAL.ui.inputBorderWidth}
						cy={(body.scale.y * diameter) / 2 + GLOBAL.ui.inputBorderWidth}
						rx={(body.scale.x * diameter) / 2}
						ry={(body.scale.y * diameter) / 2}
					/>
				</Svg>
			</AnimatedPressable>

			<ExpoImage
				style={{
					position: "absolute",
					width: body.scale.x * newDiameter,
					height: body.scale.y * newDiameter,
					marginBottom: 0.4,
				}}
				source={body.thumbnail}
				contentFit="fill"
				onDisplay={() => {
					setIsImgDisplayed(true);
					onDisplay();
				}}
				pointerEvents="none"
			/>
		</View>
	);
}


//* Stylesheet
const styles = StyleSheet.create({
	content: {
		alignItems: "center",
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
		overflow: "hidden",
	},

	bodyScrollContainer: {
		width: "100%",
		height: "100%",
	},

	solSpacer: {
		justifyContent: "center",
		alignItems: "center",
		width: solDiameter,
		height: solDiameter / 2,
	},

	solContainer: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		width: solFrameDimension,
		height: solFrameDimension,
		marginTop: -solFrameDimension / 2,
		overflow: "hidden",
	},

	solSpriteSheet: {
		position: "absolute",
		width: solFrameWidth * solFrameDimension,
		height: solFrameHeight * solFrameDimension,
	},

	solPlaceholder: {
		position: "absolute",
		width: solDiameter,
		height: solDiameter,
		backgroundColor: "#FFB732",
		borderRadius: "50%",
	},

	solPlaceholderImg: {
		position: "absolute",
		width: solFrameDimension,
		height: solFrameDimension,
	},

	solSpriteSheetImg: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},

	system: {
		justifyContent: "center",
		alignItems: "center",
		width: systemDiameter,
		height: systemDiameter,
		overflow: "visible",
	},

	bodyScrollSpacer: {
		width: "100%",
		height: boiPopupHeight + (2 * boiPopupOffset) + GLOBAL.ui.inputBorderWidth,
	},

	boiPopup: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		width: boiPopupWidth,
		height: boiPopupHeight,
	},

	boiPopupSvg: {
		position: "absolute",
	},

	boiPopupCloseBtnContainer: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		top: boiPopupPadding,
		right: boiPopupPadding,
		width: boiPopupCloseBtnDimension,
		height: boiPopupCloseBtnDimension,
		borderRadius: "50%",
	},

	boiPopupCloseBtnSvg: {
		position: "absolute",
	},

	boiPopupUseBtnContainer: {
		position: "absolute",
		bottom: boiPopupPadding,
		justifyContent: "center",
		alignItems: "center",
		width: boiPopupUseBtnWidth,
		height: boiPopupUseBtnHeight,
	},

	boiPopupUseBtnSvg: {
		position: "absolute",
		width: boiPopupUseBtnWidth,
		height: boiPopupUseBtnHeight,
	},

	boiPopupUseBtnTextContainer: {
		position: "absolute",
	},

	boiPopupUseBtnText: {
		fontFamily: "Trickster-Reg",
		fontSize: GLOBAL.ui.bodyTextSize,
		marginBottom: 0.5 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},
});


export default function BodiesScreen() {
	//* App storage
	const WriteNewSaveToFile = GLOBAL.useSaveStore((state) => state.writeNewSaveToFile);
	const ActiveBody = GLOBAL.useSaveStore((state) => state.activeBody);
	const SetActiveBody = GLOBAL.useSaveStore((state) => state.setActiveBody);


	//* Colors
	const btnBgColor = ActiveBody?.palette[2];
	const btnPressedBgColor = ActiveBody?.palette[3];


	//* BOI popup animation
	const [boi, setBoi] = useState<CelestialBody | null>(null);
	const [isBodyInterested, setIsBodyInterested] = useState<boolean>(false);
	const isAnimPaused = useSharedValue(false);
	const boiPopupAnimSV = useSharedValue(-boiPopupHeight);
	useEffect(() => {
		boiPopupAnimSV.value = withTiming(
			(isBodyInterested) ? boiPopupOffset : -boiPopupHeight,
			{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.inOut(Easing.cubic) }
		);
	}, [isBodyInterested]);

	const boiPopupAnimStyle = useAnimatedStyle(() => {
		return { bottom: boiPopupAnimSV.value };
	});

	const [isBoiPopupCloseBtnPressed, setIsBoiPopupCloseBtnPressed] = useState<boolean>(false);
	const [isBoiPopupUseBtnPressed, setIsBoiPopupUseBtnPressed] = useState<boolean>(false);


	//* Sol animation
	const [isSolPlaceholderImgDisplayed, setIsSolPlaceholderImgDisplayed] = useState<boolean>(false);
	const [isSolSpriteSheetDisplayed, setIsSolSpriteSheetDisplayed] = useState<boolean>(false);
	const solFrameSV = useSharedValue(0);
	useEffect(() => {
		if (isSolSpriteSheetDisplayed) {
			solFrameSV.value = withPause(
				withRepeat(withTiming(
					totalSolFrames - 1,
					{ duration: 1000 / solAnimFPS * totalSolFrames, easing: Easing.linear }),
					-1,
					false
				),
				isAnimPaused
			);
		}
	}, [isSolSpriteSheetDisplayed, isAnimPaused]);

	const solAnimStyle = useAnimatedStyle(() => {
		const solFrameInt = Math.round(solFrameSV.value);
		return {
			left: -(solFrameInt % solFrameWidth) * solFrameDimension,
			top: -Math.floor(solFrameInt / solFrameWidth) * solFrameDimension,
		};
	});


	//* Systems
	const [numBodyImgsLoaded, setNumBodyImgsLoaded] = useState<number>(0);
	const [areAllBodyImgsLoaded, setAreAllBodyImgsLoaded] = useState<boolean>(false);
	useEffect(() => {
		if (numBodyImgsLoaded == AllBodies.length) setAreAllBodyImgsLoaded(true);
	}, [numBodyImgsLoaded]);


	//* Orbit animation
	const orbitRot = useSharedValue(0);
	const orbitDuration = 15; // Seconds
	useEffect(() => {
		orbitRot.value = withPause(
			withRepeat(withTiming(
				360,
				{ duration: 1000 * orbitDuration, easing: Easing.linear }),
				-1,
				false
			),
			isAnimPaused
		);
	}, [isAnimPaused]);


	//* Components
	return (
		<View style={styles.content}>
			<ScrollView
				style={styles.bodyScrollContainer}
				contentContainerStyle={{ alignItems: "center" }}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.solSpacer}></View>
				<View style={styles.solContainer}>
					{(!isSolPlaceholderImgDisplayed) &&
						<View style={styles.solPlaceholder}></View>
					}

					{(!isSolSpriteSheetDisplayed) &&
						<ExpoImage
							style={styles.solPlaceholderImg}
							source={require("../assets/images/bodies/thumbnails/Sol.png")}
							contentFit="fill"
							onDisplay={() => {
								setIsSolPlaceholderImgDisplayed(true);
							}}
						/>
					}

					{(areAllBodyImgsLoaded) &&
						<Animated.View style={[styles.solSpriteSheet, solAnimStyle]}>
							<ExpoImage
								style={styles.solSpriteSheetImg}
								source={require("../assets/images/bodies/sprite-sheets/Sol.png")}
								onDisplay={() => {
									setIsSolSpriteSheetDisplayed(true);
								}}
							/>
						</Animated.View>
					}
				</View>

				{SolarSystem.map((system, systemIndex) => {
					const numSatellites = system.moons.length;
					const systemHeight = (numSatellites == 0) ? centerBodyDiameter : systemDiameter;
					const systemMargin = (systemIndex == 0) ? systemSpacing + systemNameTextOffset + systemNameTextSize : systemSpacing;
					const systemNameTextMajorAxis = (system.parent.scale.x * centerBodyDiameter) + (2 * systemNameTextOffset) + (2 * systemNameTextSize);
					const systemNameTextMinorAxis = (system.parent.scale.y * centerBodyDiameter) + (2 * systemNameTextOffset) + (2 * systemNameTextSize);

					return (
						<View
							key={`system-${systemIndex}`}
							style={[styles.system, {
								height: systemHeight,
								marginTop: systemMargin,
							}]}
						>
							<Svg
								style={{ position: "absolute" }}
								width={systemNameTextMajorAxis}
								height={systemNameTextMinorAxis}
								viewBox={`0 0 ${systemNameTextMajorAxis} ${systemNameTextMinorAxis}`}
							>
								<Defs>
									<Ellipse
										id="system-name-path"
										rx={((system.parent.scale.x * centerBodyDiameter) / 2) + systemNameTextOffset}
										ry={((system.parent.scale.y * centerBodyDiameter) / 2) + systemNameTextOffset}
										cx={systemNameTextMajorAxis / 2}
										cy={systemNameTextMinorAxis / 2}
									/>

									<Path
										id="system-system-path"
										d={`
											M ${systemNameTextDescent},${(systemNameTextMinorAxis / 2) - systemNameTextDescent}
											A ${(systemNameTextMajorAxis / 2) - systemNameTextDescent} ${(systemNameTextMinorAxis / 2) - systemNameTextDescent}
												0 0 0 ${systemNameTextMajorAxis - systemNameTextDescent},${(systemNameTextMinorAxis / 2) - systemNameTextDescent}
										`}
									/>
								</Defs>

								<SvgText
									fill={GLOBAL.ui.palette[0]}
									fontFamily="Trickster-Reg"
									fontSize={systemNameTextSize}
									letterSpacing="0"
									textAnchor="middle"
								>
									<TextPath href="#system-name-path" startOffset="71%">
										<TSpan>{system.name}</TSpan>
									</TextPath>
								</SvgText>

								{(numSatellites > 0) &&
									<SvgText
										fill={GLOBAL.ui.palette[0]}
										fontFamily="Trickster-Reg"
										fontSize={systemNameTextSize}
										letterSpacing="1"
										textAnchor="middle"
									>
										<TextPath href="#system-system-path" startOffset="54%">
											<TSpan>System</TSpan>
										</TextPath>
									</SvgText>
								}
							</Svg>

							<BodyBtn
								body={system.parent}
								diameter={centerBodyDiameter}
								isInterested={boi?.name == system.parent.name && isBodyInterested}
								onPress={() => {
									setBoi(system.parent);
									setIsBodyInterested(true);
									isAnimPaused.value = true;
								}}
								onDisplay={() => {
									setNumBodyImgsLoaded(prev => prev + 1);
								}}
							/>

							{system.moons.map((moon, moonIndex) => {
								const theta = (moonIndex * 2 * Math.PI) / numSatellites - (2 * Math.PI / 3);
								const moonAnimStyle = useAnimatedStyle(() => {
									const angle = (orbitRot.value * (Math.PI / 180)) + theta;
									const x = (systemDiameter - moonDiameter) * Math.cos(angle) / 2;
									const y = (systemDiameter - moonDiameter) * Math.sin(angle) / 2;
									return { transform: [{ translateX: x }, { translateY: y }] };
								});

								return (
									<Animated.View
										key={`moon-${moonIndex}`}
										style={[
											{
												position: "absolute",
												justifyContent: "center",
												alignItems: "center",
												width: (moon.scale.x * moonDiameter) + (2 * GLOBAL.ui.inputBorderWidth),
												height: (moon.scale.y * moonDiameter) + (2 * GLOBAL.ui.inputBorderWidth),
											},
											moonAnimStyle
										]}
									>
										<BodyBtn
											body={moon}
											diameter={moonDiameter}
											isInterested={boi?.name == moon.name && isBodyInterested}
											onPress={() => {
												setBoi(moon);
												setIsBodyInterested(true);
												isAnimPaused.value = true;
											}}
											onDisplay={() => {
												setNumBodyImgsLoaded(prev => prev + 1);
											}}
										/>
									</Animated.View>
								);
							})}
						</View>
					);
				})}

				<View style={styles.bodyScrollSpacer} pointerEvents="none">
					<Svg
						style={{
							position: "absolute",
							bottom: -(notToScaleTextOffset + notToScaleTextSize),
						}}
						width={GLOBAL.slot.width}
						height={GLOBAL.slot.height}
						viewBox={`0 0 ${GLOBAL.slot.width} ${GLOBAL.slot.height}`}
					>
						<Defs>
							<Path
								id="not-to-scale-path"
								d={`
									M ${notToScaleTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
									A ${GLOBAL.slot.ellipseSemiMajor - notToScaleTextOffset} ${GLOBAL.slot.ellipseSemiMinor - notToScaleTextOffset}
										0 0 0 ${GLOBAL.slot.width - notToScaleTextOffset},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
								`}
							/>
						</Defs>

						<SvgText
							fill={ActiveBody?.palette[0]}
							fontFamily="Trickster-Reg"
							fontSize={notToScaleTextSize}
							letterSpacing="1"
							textAnchor="middle"
						>
							<TextPath href="#not-to-scale-path" startOffset="56%">
								<TSpan>* Bodies are not to scale</TSpan>
							</TextPath>
						</SvgText>
					</Svg>
				</View>
			</ScrollView>

			<SlotTopShadow />
			<SlotBottomShadow />

			<Animated.View style={[styles.boiPopup, GLOBAL.ui.btnShadowStyle("up"), boiPopupAnimStyle]}>
				<Svg
					style={styles.boiPopupSvg}
					width="100%"
					height="100%"
					viewBox={`0 0 ${boiPopupWidth} ${boiPopupHeight}`}
				>
					<Path
						fill={GLOBAL.ui.palette[0]}
						d={`
							M 0,${boiPopupBorderRadius}
							v ${boiPopupHeight - boiPopupBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset}
							A ${boiPopupWidth / 2} ${GLOBAL.slot.ellipseSemiMinor - boiPopupOffset}
								0 0 0 ${boiPopupWidth},${boiPopupHeight - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset}
							v ${-(boiPopupHeight - boiPopupBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset)}
							q 0,${-boiPopupBorderRadius} ${-boiPopupBorderRadius},${-boiPopupBorderRadius}
							h ${-(boiPopupWidth - 2 * boiPopupBorderRadius)}
							q ${-boiPopupBorderRadius},0 ${-boiPopupBorderRadius},${boiPopupBorderRadius}
							z
						`}
					/>
				</Svg>

				<Pressable
					style={[
						styles.boiPopupCloseBtnContainer,
						{ backgroundColor: (isBoiPopupCloseBtnPressed) ? btnPressedBgColor : btnBgColor },
						(!isBoiPopupCloseBtnPressed) && GLOBAL.ui.btnShadowStyle(),
					]}
					onPressIn={() => {
						setIsBoiPopupCloseBtnPressed(true);
					}}
					onPress={() => {
						setIsBodyInterested(false);
						isAnimPaused.value = false;
					}}
					onPressOut={() => {
						setIsBoiPopupCloseBtnPressed(false);
					}}
				>
					<Svg
						style={styles.boiPopupCloseBtnSvg}
						width="100%"
						height="100%"
						viewBox={`0 0 ${boiPopupCloseBtnDimension} ${boiPopupCloseBtnDimension}`}
					>
						<Defs>
							<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</LinearGradient>

							<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</RadialGradient>

							<LinearGradient id="stroke" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="black" stopOpacity="0" />
								<Stop offset="100%" stopColor="black" stopOpacity="0.5" />
							</LinearGradient>

							<ClipPath id="top-blob-clip">
								<Circle
									r={(boiPopupCloseBtnDimension / 2) - GLOBAL.ui.inputBorderWidth}
									cx={boiPopupCloseBtnDimension / 2}
									cy={boiPopupCloseBtnDimension / 2}
								/>
							</ClipPath>
						</Defs>

						<Circle
							r={boiPopupCloseBtnDimension / 2}
							cx={boiPopupCloseBtnDimension / 2}
							cy={boiPopupCloseBtnDimension / 2}
							fill="url(#bottom-blob)"
							stroke="url(#stroke)"
							strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
							clipPath="url(#top-blob-clip)"
						/>

						<Ellipse
							rx={0.8 * ((boiPopupCloseBtnDimension / 2) - GLOBAL.ui.inputBorderWidth)}
							ry={((boiPopupCloseBtnDimension / 2) - GLOBAL.ui.inputBorderWidth) / 2}
							cx={boiPopupCloseBtnDimension / 2}
							cy={GLOBAL.ui.inputBorderWidth + ((boiPopupCloseBtnDimension / 2) - GLOBAL.ui.inputBorderWidth) / 2}
							fill="url(#top-blob)"
							clipPath="url(#top-blob-clip)"
						/>
					</Svg>

					<Svg
						style={[styles.boiPopupCloseBtnSvg, GLOBAL.ui.btnShadowStyle()]}
						viewBox="0 0 100 100"
					>
						<Path
							fill={GLOBAL.ui.palette[0]}
							stroke={GLOBAL.ui.palette[0]}
							strokeWidth={3}
							d="M 33.287299,30 30,33.287299 C 36.366047,38.606816 42.479657,44.179517 48.346514,49.999245 42.479574,55.819068 36.366145,61.393102 30,66.7127 L 33.287299,70 C 38.606901,63.633854 44.179419,57.518915 49.999245,51.651973 55.819167,57.518997 61.39302,63.633756 66.7127,70 L 70,66.7127 C 63.633757,61.39302 57.518997,55.819167 51.651973,49.999245 57.518915,44.179419 63.633853,38.606899 70,33.287299 L 66.7127,30 C 61.393101,36.366145 55.819068,42.479574 49.999245,48.346514 44.179517,42.479657 38.606816,36.366047 33.287299,30 Z"
						/>
					</Svg>
				</Pressable>

				<View style={styles.boiPopupUseBtnContainer}>
					<Svg
						style={[
							styles.boiPopupUseBtnSvg,
							(!isBoiPopupUseBtnPressed) && GLOBAL.ui.btnShadowStyle(),
						]}
						width="100%"
						height="100%"
						viewBox={`0 0 ${boiPopupUseBtnWidth} ${boiPopupUseBtnHeight}`}
					>
						<Defs>
							<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</LinearGradient>

							<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
								gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * (boiPopupUseBtnWidth - (2 * GLOBAL.ui.inputBorderWidth))}, 0)`}
							>
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</RadialGradient>

							<LinearGradient id="stroke" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="black" stopOpacity="0" />
								<Stop offset="100%" stopColor="black" stopOpacity="0.5" />
							</LinearGradient>

							<ClipPath id="btn-outline">
								<Path
									fill="transparent"
									d={`
										M 0,${boiPopupUseBtnBorderRadius}
										v ${boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
										A ${boiPopupUseBtnWidth / 2} ${GLOBAL.slot.ellipseSemiMinor - boiPopupOffset - boiPopupPadding}
											0 0 0 ${boiPopupUseBtnWidth},${boiPopupUseBtnHeight - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
										v ${-(boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding)}
										q 0,${-boiPopupUseBtnBorderRadius} ${-boiPopupUseBtnBorderRadius},${-boiPopupUseBtnBorderRadius}
										h ${-(boiPopupUseBtnWidth - (2 * boiPopupUseBtnBorderRadius))}
										q ${-boiPopupUseBtnBorderRadius},0 ${-boiPopupUseBtnBorderRadius},${boiPopupUseBtnBorderRadius}
										z
									`}
								/>
							</ClipPath>
						</Defs>


						<Path
							fill={
								(boi?.canUse)
								? (isBoiPopupUseBtnPressed) ? btnPressedBgColor : btnBgColor
								: "#777"
							}
							d={`
								M 0,${boiPopupUseBtnBorderRadius}
								v ${boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
								A ${boiPopupUseBtnWidth / 2} ${GLOBAL.slot.ellipseSemiMinor - boiPopupOffset - boiPopupPadding}
									0 0 0 ${boiPopupUseBtnWidth},${boiPopupUseBtnHeight - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
								v ${-(boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding)}
								q 0,${-boiPopupUseBtnBorderRadius} ${-boiPopupUseBtnBorderRadius},${-boiPopupUseBtnBorderRadius}
								h ${-(boiPopupUseBtnWidth - (2 * boiPopupUseBtnBorderRadius))}
								q ${-boiPopupUseBtnBorderRadius},0 ${-boiPopupUseBtnBorderRadius},${boiPopupUseBtnBorderRadius}
								z
							`}
						/>

						<Path
							fill="url(#bottom-blob)"
							stroke="url(#stroke)"
							strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
							d={`
								M 0,${boiPopupUseBtnBorderRadius}
								v ${boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
								A ${boiPopupUseBtnWidth / 2} ${GLOBAL.slot.ellipseSemiMinor - boiPopupOffset - boiPopupPadding}
									0 0 0 ${boiPopupUseBtnWidth},${boiPopupUseBtnHeight - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
								v ${-(boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding)}
								q 0,${-boiPopupUseBtnBorderRadius} ${-boiPopupUseBtnBorderRadius},${-boiPopupUseBtnBorderRadius}
								h ${-(boiPopupUseBtnWidth - (2 * boiPopupUseBtnBorderRadius))}
								q ${-boiPopupUseBtnBorderRadius},0 ${-boiPopupUseBtnBorderRadius},${boiPopupUseBtnBorderRadius}
								z
							`}
							clipPath="url(#btn-outline)"
						/>

						<Rect
							fill="url(#top-blob)"
							x={GLOBAL.ui.inputBorderWidth}
							y={GLOBAL.ui.inputBorderWidth}
							width={boiPopupUseBtnWidth - (2 * GLOBAL.ui.inputBorderWidth)}
							height={2 * (boiPopupUseBtnBorderRadius - 2 * GLOBAL.ui.inputBorderWidth)}
							rx={boiPopupUseBtnBorderRadius - 2 * GLOBAL.ui.inputBorderWidth}
						/>

						<Path
							fill="transparent"
							d={`
								M 0,${boiPopupUseBtnBorderRadius}
								v ${boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
								A ${boiPopupUseBtnWidth / 2} ${GLOBAL.slot.ellipseSemiMinor - boiPopupOffset - boiPopupPadding}
									0 0 0 ${boiPopupUseBtnWidth},${boiPopupUseBtnHeight - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding}
								v ${-(boiPopupUseBtnHeight - boiPopupUseBtnBorderRadius - GLOBAL.slot.ellipseSemiMinor + boiPopupOffset + boiPopupPadding)}
								q 0,${-boiPopupUseBtnBorderRadius} ${-boiPopupUseBtnBorderRadius},${-boiPopupUseBtnBorderRadius}
								h ${-(boiPopupUseBtnWidth - (2 * boiPopupUseBtnBorderRadius))}
								q ${-boiPopupUseBtnBorderRadius},0 ${-boiPopupUseBtnBorderRadius},${boiPopupUseBtnBorderRadius}
								z
							`}
							onPressIn={() => {
								if (boi?.canUse) setIsBoiPopupUseBtnPressed(true);
							}}
							onPress={() => {
								if (boi?.canUse) {
									SetActiveBody(boi?.name);
									setIsBodyInterested(false);
									isAnimPaused.value = false;
									// SavedCities.map(city => city.setNextBodyTime(boi));
									WriteNewSaveToFile();
								}
							}}
							onPressOut={() => {
								if (boi?.canUse) setIsBoiPopupUseBtnPressed(false);
							}}
						/>
					</Svg>

					<View style={styles.boiPopupUseBtnTextContainer} pointerEvents="none">
						<Text style={[styles.boiPopupUseBtnText, GLOBAL.ui.btnShadowStyle()]}>
							{(boi?.canUse) ? `Use ${boi?.name} Time` : `${boi?.name} Time Unavailable`}
						</Text>
					</View>
				</View>

				<View style={{
					position: "absolute",
					top: 2 * boiPopupPadding,
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
					width: "100%",
				}}>
					<Svg
						width={2 * GLOBAL.ui.bodyTextSize}
						height={2 * GLOBAL.ui.bodyTextSize}
						viewBox="0 0 100 100"
					>
						<Path
							fill={GLOBAL.ui.palette[1]}
							stroke={GLOBAL.ui.palette[1]}
							strokeWidth={2}
							d={boi?.icon}
						/>
					</Svg>

					<Text style={{
						fontFamily: "Trickster-Reg",
						fontSize: 1.5 * GLOBAL.ui.bodyTextSize,
						marginLeft: GLOBAL.screen.horizOffset / 2,
						marginBottom: 0.1 * GLOBAL.ui.bodyTextSize,
						color: GLOBAL.ui.palette[1],
					}}>{boi?.name}</Text>
				</View>

				<Text style={{
					position: "absolute",
					textAlign: "center",
					width: "80%",
					fontFamily: "Trickster-Reg",
					fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
					marginBottom: boiPopupUseBtnHeight / 2,
					color: GLOBAL.ui.palette[1],
				}}>{boi?.desc}</Text>
			</Animated.View>
		</View>
	);
}
