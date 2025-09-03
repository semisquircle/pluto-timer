import { SlotBottomShadow } from "@/ref/slot-shadows";
import allCities from "cities.json" with { type: "json" };
import allCitiesAdmin1 from "cities.json/admin1.json" with { type: "json" };
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Svg } from "react-native-svg";
import * as GLOBAL from "../ref/global";


export default function CitiesScreen() {
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


	//! Hacky fix
	const [renderKey, setRenderKey] = useState<string>("");
	useEffect(() => {
		const r = (Math.random() + 1).toString(36).substring(7);
		setRenderKey(r);
	}, [ActiveTab]);


	//* City search
	const cityInputHeight = 45;
	const citySearchSvgDimension = 0.6 * cityInputHeight;
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


	//* Text fitting
	const locationHeight = 110;
	const locationPadding = GLOBAL.screen.borderWidth;
	const locationDateTextSize = GLOBAL.ui.bodyTextSize;
	const locationTimeTextSize = locationHeight - locationDateTextSize - GLOBAL.ui.inputBorderWidth;

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
			padding: GLOBAL.screen.borderWidth,
			paddingTop: GLOBAL.screen.borderWidth,
		},

		focusDarken: {
			position: "absolute",
			top: 0,
			left: 0,
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			opacity: (isCityInputFocused) ? 1 : 0,
			backgroundColor: GLOBAL.ui.colors[1],
			zIndex: 9990,
		},

		title: {
			width: "100%",
			fontFamily: "Trickster-Reg",
			fontSize: 30,
			marginBottom: GLOBAL.screen.borderWidth,
			color: GLOBAL.ui.colors[0],
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
			paddingHorizontal: locationPadding,
			borderColor: GLOBAL.ui.colors[0],
			borderWidth: GLOBAL.ui.inputBorderWidth,
			borderRadius: GLOBAL.screen.borderWidth,
			backgroundColor: GLOBAL.ui.colors[1],
			color: GLOBAL.ui.colors[1],
			zIndex: 9999,
		},

		citySearchSvg: {
			width: citySearchSvgDimension,
			height: citySearchSvgDimension,
			marginRight: (cityInputHeight - (2 * GLOBAL.ui.inputBorderWidth) - citySearchSvgDimension) / 2,
		},

		cityInput: {
			flex: 1,
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			marginBottom: 0.1 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		cityResultContainer: {
			position: "absolute",
			top: cityInputHeight - GLOBAL.screen.borderWidth,
			display: (isCityInputFocused) ? "flex" : "none",
			width: "100%",
			paddingTop: 3 * GLOBAL.screen.borderWidth,
			borderBottomLeftRadius: GLOBAL.screen.borderWidth,
			borderBottomRightRadius: GLOBAL.screen.borderWidth,
			zIndex: 9998,
		},

		cityResult: {
			justifyContent: "center",
			width: "100%",
			// height: cityInputHeight,
			paddingLeft: GLOBAL.screen.borderWidth,
		},

		cityResultText: {
			fontFamily: "Trickster-Reg",
			fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		cityScrollContainer: {
			width: "100%",
			minHeight: GLOBAL.slot.height,
			paddingTop: 2 * GLOBAL.screen.borderWidth,
			marginTop: -GLOBAL.screen.borderWidth,
			overflow: "hidden",
		},

		city: {
			height: locationHeight,
			borderRadius: GLOBAL.screen.borderWidth,
			overflow: "hidden",
		},

		cityWrapper: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			width: "100%",
			height: "100%",
			padding: locationPadding,
			paddingLeft: 1.2 * locationPadding,
		},

		citySvg: {
			position: "absolute",
			left: 0,
			top: 0,
			width: "100%",
			height: "100%",
		},

		cityNameContainer: {
			flex: 1,
			height: "100%",
		},

		cityName: {
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: ActiveBody?.colors[0],
		},

		youAreHere: {
			fontFamily: "Trickster-Reg-Arrow",
			fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
			color: ActiveBody?.colors[1],
		},

		cityLat: {
			fontFamily: "Trickster-Reg",
			fontSize: 0.5 * GLOBAL.ui.bodyTextSize,
			marginTop: "auto",
			color: GLOBAL.ui.colors[0],
		},

		cityLon: {
			fontFamily: "Trickster-Reg",
			fontSize: 0.5 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		cityTimeContainer: {
			justifyContent: "space-between",
			height: "100%",
		},

		cityBodyTime: {
			textAlign: "right",
			fontFamily: "Hades-Short",
			fontSize: locationTimeTextSize - GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		cityBodyDate: {
			textAlign: "right",
			fontFamily: "Trickster-Reg",
			fontSize: locationDateTextSize,
			lineHeight: locationDateTextSize,
			color: ActiveBody?.colors[0],
		},

		cityScrollSpacer: {
			width: "100%",
			height: 2.2 * GLOBAL.slot.ellipseSemiMinor,
		},
	});


	//* Components
	return (
		<View key={`render-${renderKey}`} style={styles.content}>
			<View style={[styles.skewContainer, GLOBAL.ui.skewStyle]}>
				<Text style={styles.title}>Saved Locations</Text>

				<View style={styles.focusDarken} pointerEvents="none"></View>

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
								fill={ActiveBody?.colors[1]}
								stroke={ActiveBody?.colors[1]}
								strokeWidth={4}
								d="m 42.906738,10.415039 c -16.316584,0 -32.633047,10.406062 -33.766113,31.217285 1.641645,30.149185 35.152068,38.450985 54.360352,24.918457 8.95463,6.24131 16.471896,13.916224 22.551269,23.033203 l 4.806152,-4.806152 C 81.872109,78.782839 74.283505,71.386463 68.085938,62.598633 72.928502,57.506614 76.188788,50.522275 76.672852,41.632324 75.539786,20.821101 59.223323,10.415039 42.906738,10.415039 Z m 0,1.700684 c 14.050455,0 28.10084,9.838441 26.967774,29.516601 2.266131,39.351897 -56.201678,39.351897 -53.935547,0 -1.133066,-19.67816 12.917318,-29.516601 26.967773,-29.516601 z"
							/>
						</Svg>

						<TextInput
							style={styles.cityInput}
							placeholder="Search for a city"
							placeholderTextColor={ActiveBody?.colors[1]}
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

					<View style={styles.cityResultContainer}>
						{cityObjResults.map((city, i) => (
							<Pressable
								key={`city-suggestion${i}`}
								style={[styles.cityResult, { marginTop: (i > 0) ? 1.5 * GLOBAL.screen.borderWidth : 0 }]}
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
				</View>

				<ScrollView
					ref={scrollRef}
					style={styles.cityScrollContainer}
					contentContainerStyle={{ alignItems: "center" }}
					showsVerticalScrollIndicator={false}
				>
					{SavedCities.map((loc, i) => {
						const locationWidth =
							(i == ActiveCityIndex)
							? GLOBAL.slot.width - (2 * GLOBAL.screen.borderWidth)
							: GLOBAL.slot.width - (2 * GLOBAL.screen.borderWidth) - (2 * GLOBAL.screen.borderWidth);
						const cityBackgroundColor = (i == ActiveCityIndex) ? ActiveBody?.colors[3] : ActiveBody?.colors[4];

						return (
							<Pressable
								key={`city-${i}`}
								style={[
									styles.city,
									{
										width: locationWidth,
										marginTop: (i > 0) ? 2 * GLOBAL.ui.inputBorderWidth : 0,
										backgroundColor: cityBackgroundColor,
									}
								]}
								onPress={() => {
									SetActiveCityIndex(i);
									SetActiveTab(2);
									router.replace("/");
								}}
							>
								<Svg style={styles.citySvg} viewBox={`0 0 ${locationWidth} ${locationHeight}`}>
									<Defs>
										<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
											<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
											<Stop offset="100%" stopColor="white" stopOpacity="0" />
										</LinearGradient>

										<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
											gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * (GLOBAL.slot.width - (2 * GLOBAL.screen.borderWidth) - (2 * GLOBAL.ui.inputBorderWidth))}, 0)`}
										>
											<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
											<Stop offset="100%" stopColor="white" stopOpacity="0" />
										</RadialGradient>

										<LinearGradient id="stroke" x1="0%" x2="0" y1="0%" y2="100%">
											<Stop offset="0%" stopColor="black" stopOpacity="0" />
											<Stop offset="100%" stopColor="black" stopOpacity="0.4" />
										</LinearGradient>
									</Defs>

									<Rect
										fill="transparent"
										stroke="url(#stroke)"
										strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
										x={GLOBAL.ui.inputBorderWidth}
										y={GLOBAL.ui.inputBorderWidth}
										width={locationWidth - (2 * GLOBAL.ui.inputBorderWidth)}
										height={locationHeight - (2 * GLOBAL.ui.inputBorderWidth)}
										rx={GLOBAL.screen.borderWidth - GLOBAL.ui.inputBorderWidth}
									/>

									<Rect
										fill={cityBackgroundColor}
										x={GLOBAL.ui.inputBorderWidth}
										y={GLOBAL.ui.inputBorderWidth}
										width={locationWidth - (2 * GLOBAL.ui.inputBorderWidth)}
										height={locationHeight - (2 * GLOBAL.ui.inputBorderWidth)}
										rx={GLOBAL.screen.borderWidth - GLOBAL.ui.inputBorderWidth}
									/>

									<Rect
										fill="url(#bottom-blob)"
										x={GLOBAL.ui.inputBorderWidth}
										y={GLOBAL.ui.inputBorderWidth}
										width={locationWidth - (2 * GLOBAL.ui.inputBorderWidth)}
										height={locationHeight - (2 * GLOBAL.ui.inputBorderWidth)}
										rx={GLOBAL.screen.borderWidth - GLOBAL.ui.inputBorderWidth}
									/>

									<Rect
										fill="url(#top-blob)"
										x={GLOBAL.ui.inputBorderWidth}
										y={GLOBAL.ui.inputBorderWidth}
										width={locationWidth - (2 * GLOBAL.ui.inputBorderWidth)}
										height={2 * (GLOBAL.screen.borderWidth - GLOBAL.ui.inputBorderWidth)}
										rx={GLOBAL.screen.borderWidth - GLOBAL.ui.inputBorderWidth}
									/>
								</Svg>

								<View style={[styles.cityWrapper, GLOBAL.ui.btnShadowStyle]}>
									<View style={styles.cityNameContainer}>
										<Text style={styles.cityName} numberOfLines={1}>{loc.name}</Text>
										{(i == 0) && <Text style={styles.youAreHere} numberOfLines={1}>¹ You are here!</Text>}
										<Text style={styles.cityLat}>{toDMS(loc.lat, true)}</Text>
										<Text style={styles.cityLon}>{toDMS(loc.lon, false)}</Text>
									</View>

									<View style={styles.cityTimeContainer}>
										<Text style={styles.cityBodyTime}>{loc.getClockTime()}</Text>
										<Text style={styles.cityBodyDate}>{loc.getDateShort()}</Text>
									</View>
								</View>
							</Pressable>
						);
					})}

					<View style={styles.cityScrollSpacer}></View>
				</ScrollView>
			</View>

			<SlotBottomShadow />
		</View>
	);
}
