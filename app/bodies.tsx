import { SlotBottomShadow, SlotTopShadow } from "@/ref/slot-shadows";
import { Image as ExpoImage } from "expo-image";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Circle, ClipPath, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";
import * as GLOBAL from "../ref/global";
import { AllBodies, CelestialBody, SolarSystem } from "../ref/solar-system";


interface bodyBtnInterface {
	body: any,
	diameter: number,
	isInterested: boolean,
	onPress: () => void,
	onDisplay: () => void,
};
function BodyBtn({ body, diameter, isInterested, onPress, onDisplay }: bodyBtnInterface) {
	const [isImgDisplayed, setIsImgDisplayed] = useState<boolean>(false);
	const newDiameter = (body.hasRings) ? 3 * diameter : diameter;

	return (
		<View style={{
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			width: diameter + (2 * GLOBAL.ui.inputBorderWidth),
			height: diameter + (2 * GLOBAL.ui.inputBorderWidth),
		}}>
			<Pressable
				style={[
					{
						position: "absolute",
						justifyContent: "center",
						alignItems: "center",
						width: diameter + (2 * GLOBAL.ui.inputBorderWidth),
						height: diameter + (2 * GLOBAL.ui.inputBorderWidth),
						backgroundColor: (isInterested) ? GLOBAL.ui.colors[0] : "transparent",
						borderRadius: "50%",
					},
				]}
				onPress={onPress}
			>
			</Pressable>

			{(!isImgDisplayed) &&
				<View
					style={{
						position: "absolute",
						width: diameter,
						height: diameter,
						backgroundColor: body.colors[2],
						borderRadius: "50%",
					}}
					pointerEvents="none"
				></View>
			}

			<ExpoImage
				style={{
					position: "absolute",
					width: newDiameter,
					height: newDiameter,
					marginBottom: (body.hasRings) ? 1 : 0,
				}}
				source={body.thumbnail}
				onDisplay={() => {
					setIsImgDisplayed(true);
					onDisplay();
				}}
				pointerEvents="none"
			/>
		</View>
	);
}


export default function BodiesScreen() {
	//* Global app storage
	const ActiveTab = GLOBAL.useAppStore((state) => state.activeTab);
	const SetActiveTab = GLOBAL.useAppStore((state) => state.setActiveTab);

	const ActiveBody = GLOBAL.useAppStore((state) => state.activeBody);
	const SetActiveBody = GLOBAL.useAppStore((state) => state.setActiveBody);

	const SavedCities = GLOBAL.useAppStore((state) => state.savedCities);
	const PushSavedCity = GLOBAL.useAppStore((state) => state.pushSavedCity);
	const UnshiftSavedCity = GLOBAL.useAppStore((state) => state.unshiftSavedCity);

	const ActiveCityIndex = GLOBAL.useAppStore((state) => state.activeCityIndex);
	const SetActiveCityIndex = GLOBAL.useAppStore((state) => state.setActiveCityIndex);
	const ActiveCity = SavedCities[ActiveCityIndex];


	//* Sol animation
	const solDiameter = 2 * GLOBAL.slot.width;
	const solFrameWidth = 20;
	const solFrameHeight = 20;
	const totalSolFrames = solFrameWidth * solFrameHeight;
	const solSeed = 2855613398;

	const [isSolPlaceholderImgDisplayed, setIsSolPlaceholderImgDisplayed] = useState<boolean>(false);
	const [isSolSpriteSheetDisplayed, setIsSolSpriteSheetDisplayed] = useState<boolean>(false);
	const solFrameSV = useSharedValue(0);
	const solAnimDuration = 20; // Seconds
	useEffect(() => {
		if (isSolSpriteSheetDisplayed) {
			solFrameSV.value = withRepeat(
				withTiming(totalSolFrames - 1, { duration: 1000 * solAnimDuration, easing: Easing.linear }), -1, false
			);
		}
	}, [isSolSpriteSheetDisplayed]);

	const solAnimStyle = useAnimatedStyle(() => {
		const solFrameInt = Math.round(solFrameSV.value);
		return {
			left: -(solFrameInt % solFrameWidth) * solDiameter,
			top: -Math.floor(solFrameInt / solFrameWidth) * solDiameter,
		};
	});


	//* Systems
	const systemNameTextOffset = GLOBAL.screen.borderWidth;
	const systemNameTextSize = 0.8 * GLOBAL.ui.bodyTextSize;

	const centerBodyDiameter = 0.3 * GLOBAL.slot.width;
	const satelliteOffset = (2 * systemNameTextOffset) + systemNameTextSize;
	const satelliteDiameter = 0.18 * GLOBAL.slot.width;
	const systemDiameter = centerBodyDiameter + (2 * satelliteOffset) + (2 * satelliteDiameter);
	const systemSpacing = 0.2 * GLOBAL.slot.width;

	const systemNameTextDiameter = centerBodyDiameter + (2 * systemNameTextOffset) + (2 * systemNameTextSize);

	const [numBodyImgsLoaded, setNumBodyImgsLoaded] = useState<number>(0);
	const [areAllBodyImgsLoaded, setAreAllBodyImgsLoaded] = useState<boolean>(false);
	useEffect(() => {
		if (numBodyImgsLoaded == AllBodies.length) setAreAllBodyImgsLoaded(true);
	}, [numBodyImgsLoaded]);

	const notToScaleTextOffset = GLOBAL.screen.borderWidth;
	const notToScaleTextSize = GLOBAL.ui.bodyTextSize;


	//* Orbit animation
	const orbitRot = useSharedValue(0);
	const orbitDuration = 15; // Seconds
	useEffect(() => {
		orbitRot.value = withRepeat(
			withTiming(360, { duration: 1000 * orbitDuration, easing: Easing.linear }), -1, false
		);
	}, []);


	//* Body of interest popup
	const boiPopupOffset = GLOBAL.screen.borderWidth;
	const boiPopupWidth = GLOBAL.slot.width - 2 * boiPopupOffset;
	const boiPopupHeight = 0.6 * GLOBAL.slot.width;
	const boiPopupBorderRadius = GLOBAL.slot.borderRadius;
	const boiPopupPadding = GLOBAL.screen.borderWidth / 2;

	const [boi, setBoi] = useState<CelestialBody | null>(null);
	const [isBodyInterested, setIsBodyInterested] = useState<boolean>(false);
	const boiPopupAnimDuration = 0.3; // Seconds
	const boiPopupAnimSV = useSharedValue(-boiPopupHeight);
	useEffect(() => {
		boiPopupAnimSV.value = withTiming(
			(isBodyInterested) ? boiPopupOffset : -boiPopupHeight,
			{ duration: 1000 * boiPopupAnimDuration, easing: Easing.out(Easing.cubic) }
		);
	}, [isBodyInterested]);

	const boiPopupAnimStyle = useAnimatedStyle(() => {
		return { bottom: boiPopupAnimSV.value };
	});

	const [boiPopupCloseBtnColor, setBoiPopupCloseBtnColor] = useState<any>(ActiveBody?.colors[3]);
	const boiPopupCloseBtnDimension = 2 * (boiPopupBorderRadius - 2 * boiPopupPadding);

	const [boiPopupUseBtnColor, setBoiPopupUseBtnColor] = useState<any>(ActiveBody?.colors[3]);
	const boiPopupUseBtnBorderRadius = GLOBAL.screen.borderWidth;
	const boiPopupUseBtnWidth = boiPopupWidth - (2 * boiPopupPadding);
	const boiPopupUseBtnHeight = boiPopupUseBtnBorderRadius + (GLOBAL.slot.ellipseSemiMinor - boiPopupOffset - boiPopupPadding);


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			alignItems: "center",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
		},

		bodyScrollContainer: {
			width: "100%",
			height: "100%",
		},

		solSpriteSheetContainerWrapper: {
			justifyContent: "center",
			alignItems: "center",
			width: solDiameter,
			height: solDiameter / 2,
			marginTop: -solDiameter / 4,
		},

		solSpriteSheetContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			width: solDiameter,
			height: solDiameter,
			overflow: "hidden",
		},

		solSpriteSheetWrapper: {
			position: "absolute",
			width: solFrameWidth * solDiameter,
			height: solFrameHeight * solDiameter,
		},

		solPlaceholder: {
			position: "absolute",
			width: solDiameter / 2,
			height: solDiameter / 2,
			backgroundColor: "#FFB732",
			borderRadius: "50%",
		},

		solPlaceholderImg: {
			position: "absolute",
			width: solDiameter,
			height: solDiameter,
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
			alignItems: "center",
			width: boiPopupWidth,
			height: boiPopupHeight,
		},

		boiPopupSvg: {
			position: "absolute",
			width: "100%",
			height: "100%",
		},

		boiPopupName: {
			position: "absolute",
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[1],
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
			overflow: "hidden",
		},

		boiPopupCloseBtnSvg: {
			position: "absolute",
			width: "100%",
			height: "100%"
		},

		boiPopupBtnContainer: {
			position: "absolute",
			bottom: boiPopupPadding,
			justifyContent: "center",
			alignItems: "center",
			width: boiPopupUseBtnWidth,
			height: boiPopupUseBtnHeight,
		},

		boiPopupBtnSvg: {
			position: "absolute",
			width: boiPopupUseBtnWidth,
			height: boiPopupUseBtnHeight,
		},

		boiPopupBtnTextContainer: {
			position: "absolute",
		},

		boiPopupBtnText: {
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			marginBottom: 0.5 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<ScrollView
				style={styles.bodyScrollContainer}
				contentContainerStyle={{ alignItems: "center" }}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.solSpriteSheetContainerWrapper}>
					<View style={styles.solSpriteSheetContainer}>
						{(!isSolPlaceholderImgDisplayed) &&
							<View style={styles.solPlaceholder}></View>
						}

						{(!isSolSpriteSheetDisplayed) &&
							<ExpoImage
								style={styles.solPlaceholderImg}
								source={require("../assets/images/bodies/thumbnails/Sol.png")}
								onDisplay={() => {
									setIsSolPlaceholderImgDisplayed(true);
								}}
							/>
						}

						{(areAllBodyImgsLoaded) &&
							<Animated.View style={[styles.solSpriteSheetWrapper, solAnimStyle]}>
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
				</View>

				{SolarSystem.map((system, systemIndex) => {
					const numSatellites = system.satellites.length;
					const systemHeight = (numSatellites == 0) ? centerBodyDiameter : systemDiameter;
					const systemMargin = (systemIndex == 0) ? systemSpacing + systemNameTextOffset + systemNameTextSize : systemSpacing;

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
								width={systemNameTextDiameter}
								height={systemNameTextDiameter}
								viewBox={`0 0 ${systemNameTextDiameter} ${systemNameTextDiameter}`}
							>
								<Defs>
									<Circle
										id="system-name-path"
										r={(centerBodyDiameter / 2) + systemNameTextOffset}
										cx={systemNameTextDiameter / 2}
										cy={systemNameTextDiameter / 2}
									/>

									<Path
										id="system-system-path"
										d={`
											M ${0.3 * systemNameTextSize},${systemNameTextDiameter / 2}
											A ${(systemNameTextDiameter / 2) - (0.3 * systemNameTextSize)} ${(systemNameTextDiameter / 2) - (0.3 * systemNameTextSize)}
												0 0 0 ${systemNameTextDiameter - (0.3 * systemNameTextSize)} ${systemNameTextDiameter / 2}
										`}
									/>
								</Defs>

								<SvgText
									fill={GLOBAL.ui.colors[0]}
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
										fill={GLOBAL.ui.colors[0]}
										fontFamily="Trickster-Reg"
										fontSize={systemNameTextSize}
										letterSpacing="1"
										textAnchor="middle"
									>
										<TextPath href="#system-system-path" startOffset="56%">
											<TSpan>System</TSpan>
										</TextPath>
									</SvgText>
								}
							</Svg>

							<BodyBtn
								body={system.center}
								diameter={centerBodyDiameter}
								isInterested={boi?.name == system.center.name && isBodyInterested}
								onPress={() => {
									setBoi(system.center);
									setIsBodyInterested(true);
								}}
								onDisplay={() => {
									setNumBodyImgsLoaded(prev => prev + 1);
								}}
							/>

							{system.satellites.map((satellite, satelliteIndex) => {
								const theta = (satelliteIndex * 2 * Math.PI) / numSatellites - (2 * Math.PI / 3);
								const satelliteAnimStyle = useAnimatedStyle(() => {
									const angle = (orbitRot.value * Math.PI) / 180 + theta;
									const x = (systemDiameter - satelliteDiameter) * Math.cos(angle) / 2;
									const y = (systemDiameter - satelliteDiameter) * Math.sin(angle) / 2;
									return { transform: [{ translateX: x }, { translateY: y }] };
								});

								return (
									<Animated.View
										key={`satellite-${satelliteIndex}`}
										style={[
											{
												position: "absolute",
												justifyContent: "center",
												alignItems: "center",
												width: satelliteDiameter + (2 * GLOBAL.ui.inputBorderWidth),
												height: satelliteDiameter + (2 * GLOBAL.ui.inputBorderWidth),
											},
											satelliteAnimStyle
										]}
									>
										<BodyBtn
											body={satellite}
											diameter={satelliteDiameter}
											isInterested={boi?.name == satellite.name && isBodyInterested}
											onPress={() => {
												setBoi(satellite);
												setIsBodyInterested(true);
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
							fill={GLOBAL.ui.colors[0]}
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

			<Animated.View style={[styles.boiPopup, boiPopupAnimStyle]}>
				<Svg style={styles.boiPopupSvg} viewBox={`0 0 ${boiPopupWidth} ${boiPopupHeight}`}>
					<Path
						fill={GLOBAL.ui.colors[0]}
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

				<Text style={styles.boiPopupName}>{boi?.name}</Text>

				<Pressable
					style={[styles.boiPopupCloseBtnContainer, { backgroundColor: boiPopupCloseBtnColor }]}
					onPressIn={() => {
						setBoiPopupCloseBtnColor(ActiveBody?.colors[4]);
					}}
					onPress={() => {
						setIsBodyInterested(false);
					}}
					onPressOut={() => {
						setBoiPopupCloseBtnColor(ActiveBody?.colors[3]);
					}}
				>
					<Svg
						style={styles.boiPopupCloseBtnSvg}
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
								<Stop offset="100%" stopColor="black" stopOpacity="0.4" />
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
						style={[styles.boiPopupCloseBtnSvg, GLOBAL.ui.btnShadowStyle]}
						viewBox="0 0 100 100"
					>
						<Path
							fill={GLOBAL.ui.colors[0]}
							stroke={GLOBAL.ui.colors[0]}
							strokeWidth={3}
							d="M 33.287299,30 30,33.287299 C 36.366047,38.606816 42.479657,44.179517 48.346514,49.999245 42.479574,55.819068 36.366145,61.393102 30,66.7127 L 33.287299,70 C 38.606901,63.633854 44.179419,57.518915 49.999245,51.651973 55.819167,57.518997 61.39302,63.633756 66.7127,70 L 70,66.7127 C 63.633757,61.39302 57.518997,55.819167 51.651973,49.999245 57.518915,44.179419 63.633853,38.606899 70,33.287299 L 66.7127,30 C 61.393101,36.366145 55.819068,42.479574 49.999245,48.346514 44.179517,42.479657 38.606816,36.366047 33.287299,30 Z"
						/>
					</Svg>
				</Pressable>

				<View style={styles.boiPopupBtnContainer}>
					<Svg style={styles.boiPopupBtnSvg} viewBox={`0 0 ${boiPopupUseBtnWidth} ${boiPopupUseBtnHeight}`}>
						<Path
							fill={(boi?.canUse) ? boiPopupUseBtnColor : "#777"}
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
								if (boi?.canUse) {
									setBoiPopupUseBtnColor(ActiveBody?.colors[4]);
								}
							}}
							onPress={() => {
								if (boi?.canUse) {
									SetActiveBody(boi!);
									setIsBodyInterested(false);
									SavedCities.forEach(loc => {
										loc.setNextBodyTime(ActiveBody);
									});
								}
							}}
							onPressOut={() => {
								if (boi?.canUse) {
									setBoiPopupUseBtnColor(ActiveBody?.colors[3]);
								}
							}}
						/>
					</Svg>

					<View style={styles.boiPopupBtnSvg} pointerEvents="none">
						<Svg style={styles.boiPopupBtnSvg} viewBox={`0 0 ${boiPopupUseBtnWidth} ${boiPopupUseBtnHeight}`}>
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
									<Stop offset="100%" stopColor="black" stopOpacity="0.4" />
								</LinearGradient>

								<ClipPath id="btn-outline">
									<Path
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

							<Rect
								fill="url(#top-blob)"
								x={GLOBAL.ui.inputBorderWidth}
								y={GLOBAL.ui.inputBorderWidth}
								width={boiPopupUseBtnWidth - (2 * GLOBAL.ui.inputBorderWidth)}
								height={2 * (boiPopupUseBtnBorderRadius - 2 * GLOBAL.ui.inputBorderWidth)}
								rx={boiPopupUseBtnBorderRadius - 2 * GLOBAL.ui.inputBorderWidth}
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
						</Svg>
					</View>

					<View style={styles.boiPopupBtnTextContainer} pointerEvents="none">
						<Text style={[styles.boiPopupBtnText, GLOBAL.ui.btnShadowStyle]}>
							{(boi?.canUse) ? `Use ${boi?.name} Time` : `${boi?.name} Time Unavailable`}
						</Text>
					</View>
				</View>
			</Animated.View>
		</View>
	);
}
