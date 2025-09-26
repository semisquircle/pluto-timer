import * as GLOBAL from "@/ref/global";
import { SlotBottomShadow } from "@/ref/slot-shadows";
import allCities from "cities.json" with { type: "json" };
import allCitiesAdmin1 from "cities.json/admin1.json" with { type: "json" };
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Svg } from "react-native-svg";


//* Reanimated
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedRect = Animated.createAnimatedComponent(Rect);


//* City input
const cityInputHeight = 45;
const svgIconDimension = 0.6 * cityInputHeight;


//* City options
const cityHeight = 110;
const cityWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset);
const cityWidthDiff = 2 * GLOBAL.screen.horizOffset;
const cityPadding = GLOBAL.screen.horizOffset;
const cityDateTextSize = GLOBAL.ui.bodyTextSize;
const cityTimeTextSize = cityHeight - cityDateTextSize - GLOBAL.ui.inputBorderWidth;

function toDMS(coord: number, isLat: boolean) {
	const deg = Math.floor(Math.abs(coord));
	const minFloat = (Math.abs(coord) - deg) * 60;
	const min = Math.floor(minFloat);
	const sec = ((minFloat - min) * 60).toFixed(2);

	let dir;
	if (isLat) dir = (coord >= 0) ? "N" : "S";
	else dir = (coord >= 0) ? "E" : "W";

	return `${deg}° ${min}' ${sec}" ${dir}`;
}


//* Stylesheet
const styles = StyleSheet.create({
	content: {
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
		overflow: "hidden",
	},

	skewContainer: {
		width: "100%",
		height: "100%",
		padding: GLOBAL.screen.horizOffset,
		paddingTop: GLOBAL.screen.horizOffset,
	},

	focusDarken: {
		position: "absolute",
		top: 0,
		left: 0,
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
		backgroundColor: GLOBAL.ui.palette[1],
		zIndex: 9990,
	},

	title: {
		width: "100%",
		fontFamily: "Trickster-Reg",
		fontSize: 30,
		marginBottom: GLOBAL.screen.horizOffset,
		color: GLOBAL.ui.palette[0],
		zIndex: 9997,
	},

	citySearchContainer: {
		position: "relative",
		zIndex: 9997,
	},

	cityInputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		height: cityInputHeight,
		paddingHorizontal: cityPadding,
		borderColor: GLOBAL.ui.palette[0],
		borderWidth: GLOBAL.ui.inputBorderWidth,
		borderRadius: GLOBAL.screen.horizOffset,
		backgroundColor: GLOBAL.ui.palette[1],
		color: GLOBAL.ui.palette[1],
		zIndex: 9999,
	},

	citySearchSvg: {
		width: svgIconDimension,
		height: svgIconDimension,
		marginRight: (cityInputHeight - (2 * GLOBAL.ui.inputBorderWidth) - svgIconDimension) / 2,
	},

	cityInput: {
		flex: 1,
		fontFamily: "Trickster-Reg",
		fontSize: GLOBAL.ui.bodyTextSize,
		marginBottom: 0.1 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	cityResultContainer: {
		position: "absolute",
		top: cityInputHeight - GLOBAL.screen.horizOffset,
		width: "100%",
		paddingTop: 3 * GLOBAL.screen.horizOffset,
		borderBottomLeftRadius: GLOBAL.screen.horizOffset,
		borderBottomRightRadius: GLOBAL.screen.horizOffset,
		zIndex: 9998,
	},

	cityResult: {
		justifyContent: "center",
		width: "100%",
		// height: cityInputHeight,
		paddingLeft: GLOBAL.screen.horizOffset,
	},

	cityResultText: {
		fontFamily: "Trickster-Reg",
		fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	cityScrollContainer: {
		width: "100%",
		minHeight: GLOBAL.slot.height,
		paddingTop: 2 * GLOBAL.screen.horizOffset,
		marginTop: -GLOBAL.screen.horizOffset,
		overflow: "hidden",
	},

	city: {
		height: cityHeight,
		borderRadius: GLOBAL.screen.horizOffset,
		overflow: "hidden",
	},

	cityWrapper: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		height: "100%",
		padding: cityPadding,
		paddingLeft: 1.2 * cityPadding,
	},

	citySvg: {
		position: "absolute",
		left: 0,
	},

	cityNameContainer: {
		flex: 1,
		height: "100%",
	},

	cityName: {
		fontFamily: "Trickster-Reg",
		fontSize: GLOBAL.ui.bodyTextSize,
	},

	youAreHere: {
		fontFamily: "Trickster-Reg-Arrow",
		fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
	},

	cityLat: {
		fontFamily: "Trickster-Reg",
		fontSize: 0.5 * GLOBAL.ui.bodyTextSize,
		marginTop: "auto",
		color: GLOBAL.ui.palette[0],
	},

	cityLon: {
		fontFamily: "Trickster-Reg",
		fontSize: 0.5 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	cityTimeContainer: {
		justifyContent: "space-between",
		height: "100%",
	},

	cityBodyTime: {
		textAlign: "right",
		fontFamily: "Hades-ShortSkinny",
		fontSize: cityTimeTextSize - GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	cityBodyDate: {
		textAlign: "right",
		fontFamily: "Trickster-Reg",
		fontSize: cityDateTextSize,
		lineHeight: cityDateTextSize,
	},

	cityScrollSpacer: {
		position: "relative",
		width: "100%",
		height: GLOBAL.slot.ellipseSemiMinor + GLOBAL.slot.shadowRadius,
	},
});


export default function CitiesScreen() {
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
	const activeCityColor = ActiveBody?.palette[2];
	const inactiveCityColor = ActiveBody?.palette[3];
	const youAreHereColor = GLOBAL.ui.palette[0];


	//* City input
	const cityInputRef = useRef<TextInput>(null);
	const [cityInputValue, setCityInputValue] = useState<string>("");
	const [isCityInputFocused, setIsCityInputFocused] = useState<boolean>(false);
	const [cityObjResults, setCityObjResults] = useState<any[]>([]);
	const [cityNameResults, setCityNameResults] = useState<string[]>([]);
	const handleCitySearch = (text: string) => {
		if (text.trim().length < 2) {
			setCityObjResults([]);
			setCityNameResults([]);
			return;
		}

		const filteredCityObjs = allCities.filter((city: any) =>
			city.name.toLowerCase().startsWith(text.toLowerCase())
		).slice(0, 10);
		setCityObjResults(filteredCityObjs);

		const filteredCityNames = filteredCityObjs.map((city: any) => {
			const admin = allCitiesAdmin1.find(admin => admin.code === `${city.country}.${city.admin1}`);
			return `${city.name}, ${admin?.name ?? ""}, ${city.country}`;
		});
		setCityNameResults(filteredCityNames);
	};


	//* City scrolling
	const scrollRef = useRef<ScrollView>(null);


	//* Components
	return (
		<View style={styles.content}>
			<View style={[styles.skewContainer, GLOBAL.ui.skewStyle]}>
				<Text style={styles.title}>Saved Locations</Text>

				{(isCityInputFocused) &&
					<View style={styles.focusDarken} pointerEvents="none"></View>
				}

				<View style={styles.citySearchContainer}>
					<Pressable
						style={styles.cityInputWrapper}
						onPress={() => {
							cityInputRef.current?.focus();
							setIsCityInputFocused(true);
						}}
					>
						<Svg style={styles.citySearchSvg} viewBox="0 0 100 100">
							<Path
								fill={bodyTextColor}
								stroke={bodyTextColor}
								strokeWidth={3}
								d="M 43.056322,11.247625 C 27.082725,11.247625 11.109248,21.434942 10,41.808696 11.607136,71.32412 44.413143,79.45141 63.217652,66.203347 71.984049,72.313459 79.343296,79.82704 85.294874,88.752375 L 90,84.047247 C 81.202609,78.178277 73.773523,70.937379 67.706234,62.334276 72.447003,57.349296 75.638755,50.511773 76.112644,41.808696 75.003396,21.434942 59.029919,11.247625 43.056322,11.247625 Z m 0,1.664934 c 13.755103,0 27.510137,9.631628 26.400889,28.896137 2.218495,38.524688 -55.020272,38.524688 -52.801777,0 C 15.546186,22.544187 29.30122,12.912559 43.056322,12.912559 Z"
							/>
						</Svg>

						<TextInput
							style={styles.cityInput}
							placeholder="Search for a city"
							placeholderTextColor={bodyTextColor}
							ref={cityInputRef}
							value={cityInputValue}
							onPress={() => {
								setIsCityInputFocused(true);
							}}
							onBlur={() => {
								setIsCityInputFocused(false);
							}}
							onChangeText={(newValue) => {
								setCityInputValue(newValue);
								handleCitySearch(newValue);
							}}
						>
						</TextInput>
					</Pressable>

					{(isCityInputFocused) &&
						<View style={styles.cityResultContainer}>
							{cityObjResults.map((city, i) => (
								<Pressable
									key={`city-suggestion${i}`}
									style={[styles.cityResult, { marginTop: (i > 0) ? 1.5 * GLOBAL.screen.horizOffset : 0 }]}
									onPress={() => {
										cityInputRef.current?.blur();
										setIsCityInputFocused(false);
										PushSavedCity(new GLOBAL.City(city.name, city.lat, city.lng));
										setCityInputValue("");
										setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
									}}
								>
									<Text style={styles.cityResultText}>{cityNameResults[i]}</Text>
								</Pressable>
							))}
						</View>
					}
				</View>

				<ScrollView
					ref={scrollRef}
					style={styles.cityScrollContainer}
					contentContainerStyle={{ alignItems: "center" }}
					showsVerticalScrollIndicator={false}
				>
					{SavedCities.map((city: GLOBAL.City, i: number) => {
						const cityPressProgress = useSharedValue((i == ActiveCityIndex) ? 1 : 0);
						useEffect(() => {
							cityPressProgress.value = withTiming(
								(i == ActiveCityIndex) ? 1 : 0,
								{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.out(Easing.cubic) }
							);
						}, [ActiveCityIndex]);
					
						const bodyAnimStyle = useAnimatedStyle(() => {
							return {
								width: cityWidth - ((1 - cityPressProgress.value) * cityWidthDiff),
								backgroundColor: interpolateColor(
									cityPressProgress.value,
									[0, 1],
									[inactiveCityColor!, activeCityColor!]
								),
							};
						});

						const svgAnimProps = useAnimatedProps(() => {
							return {
								width: cityWidth - ((1 - cityPressProgress.value) * cityWidthDiff),
							};
						});

						const bottomBlobAnimProps = useAnimatedProps(() => {
							return {
								width: cityWidth - ((1 - cityPressProgress.value) * cityWidthDiff),
							};
						});

						const topBlobAnimProps = useAnimatedProps(() => {
							return {
								width: cityWidth - ((1 - cityPressProgress.value) * cityWidthDiff) - (2 * GLOBAL.ui.inputBorderWidth),
							};
						});

						return (
							<AnimatedPressable
								key={`city-${i}`}
								style={[
									styles.city,
									bodyAnimStyle,
									{ marginTop: (i > 0) ? 2 * GLOBAL.ui.inputBorderWidth : 0 },
								]}
								onPress={() => {
									SetActiveCityIndex(i);
									setTimeout(() => {
										SetActiveTab(2);
										router.replace("/");
									}, 300);
								}}
							>
								<AnimatedSvg
									style={styles.citySvg}
									height="100%"
									animatedProps={svgAnimProps}
								>
									<Defs>
										<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
											<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
											<Stop offset="100%" stopColor="white" stopOpacity="0" />
										</LinearGradient>

										<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
											gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * (GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset) - (2 * GLOBAL.ui.inputBorderWidth))}, 0)`}
										>
											<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
											<Stop offset="100%" stopColor="white" stopOpacity="0" />
										</RadialGradient>

										<LinearGradient id="stroke" x1="0%" x2="0" y1="0%" y2="100%">
											<Stop offset="0%" stopColor="black" stopOpacity="0" />
											<Stop offset="100%" stopColor="black" stopOpacity="0.5" />
										</LinearGradient>
									</Defs>

									<AnimatedRect
										fill="url(#bottom-blob)"
										stroke="url(#stroke)"
										strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
										x={0}
										y={0}
										animatedProps={bottomBlobAnimProps}
										height={cityHeight}
										rx={GLOBAL.screen.horizOffset}
									/>

									<AnimatedRect
										fill="url(#top-blob)"
										x={GLOBAL.ui.inputBorderWidth}
										y={GLOBAL.ui.inputBorderWidth}
										animatedProps={topBlobAnimProps}
										height={2 * (GLOBAL.screen.horizOffset - GLOBAL.ui.inputBorderWidth)}
										rx={GLOBAL.screen.horizOffset - GLOBAL.ui.inputBorderWidth}
									/>
								</AnimatedSvg>

								<View style={[styles.cityWrapper, GLOBAL.ui.btnShadowStyle()]}>
									<View style={styles.cityNameContainer}>
										<Text
											style={[
												styles.cityName,
												{ color: bodyTextColor }
											]}
											numberOfLines={1}
										>{city.name}</Text>

										{(i == 0) &&
											<Text
												style={[
													styles.youAreHere,
													{ color: youAreHereColor }
												]}
												numberOfLines={1}
											>¹ You are here!</Text>
										}

										<Text style={styles.cityLat}>{toDMS(city.lat, true)}</Text>
										<Text style={styles.cityLon}>{toDMS(city.lng, false)}</Text>
									</View>

									<View style={styles.cityTimeContainer}>
										<Text style={styles.cityBodyTime}>{city.getClockTime()}</Text>

										<Text
											style={[
												styles.cityBodyDate,
												{ color: bodyTextColor }
											]}
										>{city.getDateShort()}</Text>
									</View>
								</View>
							</AnimatedPressable>
						);
					})}

					<View style={styles.cityScrollSpacer}>
						<Pressable
							style={{
								position: "absolute",
								right: 0,
								top: GLOBAL.screen.horizOffset,
								width: svgIconDimension,
								height: svgIconDimension,
							}}
						>
							<Svg
								width={svgIconDimension}
								height={svgIconDimension}
								viewBox="0 0 100 100"
							>
								<Path
									fill={bodyTextColor}
									stroke={bodyTextColor}
									strokeWidth={3}
									d="m 49.999512,12.46582 c -19.451965,0 -38.903139,12.510266 -39.999024,37.533692 2.191771,50.046858 77.807741,50.046858 79.999512,0 C 88.904116,24.976086 69.451475,12.46582 49.999512,12.46582 Z m 0,1.64209 c 17.260191,0 34.520683,11.96406 33.424804,35.891602 2.191766,47.855081 -69.039915,47.855081 -66.848144,0 C 15.480285,26.07197 32.739319,14.10791 49.999512,14.10791 Z m -17.692383,30.086426 -5.806641,5.755371 5.806641,5.856445 5.805176,-5.856445 z m 17.692383,0 -5.805176,5.755371 5.805176,5.856445 5.80664,-5.856445 z m 17.693847,0 -5.80664,5.755371 5.80664,5.856445 L 73.5,49.949707 Z"
								/>
							</Svg>
						</Pressable>
					</View>
				</ScrollView>
			</View>

			<SlotBottomShadow />
		</View>
	);
}
