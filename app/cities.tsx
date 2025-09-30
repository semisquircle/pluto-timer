import * as GLOBAL from "@/ref/global";
import { SlotBottomShadow } from "@/ref/slot-shadows";
import allCities from "cities.json" with { type: "json" };
import allCitiesAdmin1 from "cities.json/admin1.json" with { type: "json" };
import { router } from "expo-router";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
const cityOptionHeight = 110;
const cityOptionDeleteBtnWidth = svgIconDimension + (3 * GLOBAL.ui.inputBorderWidth);
const cityOptionDragBtnWidth = svgIconDimension + GLOBAL.ui.inputBorderWidth;
const cityOptionMiddleBtnBaseWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset);
const cityOptionPadding = GLOBAL.screen.horizOffset;
const cityOptionGap = 2 * GLOBAL.ui.inputBorderWidth;
const cityOptionDateTextSize = GLOBAL.ui.bodyTextSize;
const cityOptionTimeTextSize = cityOptionHeight - cityOptionDateTextSize - GLOBAL.ui.inputBorderWidth;

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

type CityOptionRowTypes = {
	key: string,
	city: GLOBAL.City,
	index: number,
	palette: string[],
	isEditingCities: boolean,
	activeCityIndex: number,
	onDeletePress: () => void,
	onMiddlePress: () => void,
	onHandlePress: () => void,
}

const CityOptionRow = forwardRef<View, CityOptionRowTypes>((props, ref) => {
	const middleBtnWidth = useSharedValue(cityOptionMiddleBtnBaseWidth);
	const middleBtnWidthProgress = useSharedValue(0);
	useEffect(() => {
		middleBtnWidth.value = withTiming(
			(props.index > 0 && props.isEditingCities)
				? cityOptionMiddleBtnBaseWidth - cityOptionDeleteBtnWidth - cityOptionDragBtnWidth
				: cityOptionMiddleBtnBaseWidth,
			{ duration: 1000 * GLOBAL.ui.animDuration }
		);
		middleBtnWidthProgress.value = withTiming(
			(props.index > 0 && props.isEditingCities) ? 1 : 0,
			{ duration: 1000 * GLOBAL.ui.animDuration }
		)
	}, [props.isEditingCities]);

	const cityOptionColorProgress = useSharedValue((props.index == props.activeCityIndex) ? 1 : 0);
	useEffect(() => {
		cityOptionColorProgress.value = withTiming(
			(props.index == props.activeCityIndex) ? 1 : 0,
			{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.out(Easing.cubic) }
		);
	}, [props.activeCityIndex]);

	const middleBtnAnimStyle = useAnimatedStyle(() => {
		return {
			width: middleBtnWidth.value,
			marginLeft: middleBtnWidthProgress.value * cityOptionDeleteBtnWidth,
			backgroundColor: interpolateColor(
				cityOptionColorProgress.value,
				[0, 1],
				[props.palette[2], props.palette[3]]
			),
		};
	});

	const svgAnimProps = useAnimatedProps(() => {
		return { width: middleBtnWidth.value };
	});

	const bottomBlobAnimProps = useAnimatedProps(() => {
		return { width: middleBtnWidth.value };
	});

	const topBlobAnimProps = useAnimatedProps(() => {
		return { width: middleBtnWidth.value - (2 * GLOBAL.ui.inputBorderWidth) };
	});

	return (
		<View ref={ref} style={[
			styles.cityOptionRow,
			{ height: (props.index > 0) ? cityOptionHeight + cityOptionGap : cityOptionHeight }
		]}>
			<Pressable
				style={[
					styles.cityOptionFuncBtn,
					{ left: 0, width: cityOptionDeleteBtnWidth }
				]}
				onPress={props.onDeletePress}
			>
				<Svg
					width={svgIconDimension}
					height={svgIconDimension}
					viewBox="0 0 100 100"
				>
					<Path
						fill="#ff453a"
						stroke="#ff453a"
						strokeWidth={2}
						d="M 49.999512 12.46582 C 30.547566 12.46582 11.096372 24.976111 10.000488 49.999512 C 12.192257 100.04632 87.808231 100.04632 90 49.999512 C 88.904117 24.976111 69.451455 12.46582 49.999512 12.46582 z M 49.999512 14.10791 C 67.259685 14.10791 84.520194 26.071994 83.424316 49.999512 C 85.61608 97.854545 14.384403 97.854545 16.576172 49.999512 C 15.480286 26.071994 32.739336 14.10791 49.999512 14.10791 z M 29.0625 46.999512 L 29.0625 52.999512 C 43.020827 50.999516 56.97966 50.999516 70.937988 52.999512 L 70.937988 46.999512 C 56.97966 48.999514 43.020827 48.999514 29.0625 46.999512 z "
					/>
				</Svg>
			</Pressable>

			<AnimatedPressable
				style={[styles.cityOptionMiddleBtn, middleBtnAnimStyle]}
				onPress={props.onMiddlePress}
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
						height={cityOptionHeight}
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

				<View style={[styles.cityOptionWrapper, GLOBAL.ui.btnShadowStyle()]}>
					<View style={styles.cityNameContainer}>
						<Text
							style={[styles.cityName, { color: props.palette[0] }]}
							numberOfLines={1}
						>{props.city.name}</Text>

						{(props.index == 0) &&
							<Text
								style={[styles.youAreHere, { color: GLOBAL.ui.palette[0] }]}
								numberOfLines={1}
							>¹ You are here!</Text>
						}

						<Text style={styles.cityLat}>{toDMS(props.city.lat, true)}</Text>
						<Text style={styles.cityLon}>{toDMS(props.city.lng, false)}</Text>
					</View>

					<View style={styles.cityTimeContainer}>
						<Text style={styles.cityBodyTime}>{props.city.getClockTime()}</Text>
						<Text style={[styles.cityBodyDate, { color: props.palette[0] }]}>{props.city.getDateShort()}</Text>
					</View>
				</View>
			</AnimatedPressable>

			<Pressable
				style={[
					styles.cityOptionFuncBtn,
					{ right: 0, alignItems: "flex-end", width: cityOptionDragBtnWidth }
				]}
				onPressIn={props.onHandlePress}
			>
				<Svg
					width={svgIconDimension}
					height={svgIconDimension}
					viewBox="0 0 100 100"
				>
					<Path
						fill={props.palette[2]}
						stroke={props.palette[2]}
						strokeWidth={2}
						d="m 34.001406,10.000001 -8.00164,7.931327 8.00164,8.069612 7.999297,-8.069612 z m 31.999531,0 -7.999297,7.931327 7.999297,8.069612 7.999297,-8.069612 z m -31.999531,31.999532 -8.00164,7.931327 8.00164,8.069609 7.999297,-8.069609 z m 31.999531,0 -7.999297,7.931327 7.999297,8.069609 7.999297,-8.069609 z m -31.999531,32.001875 -8.00164,7.928983 8.00164,8.069607 7.999297,-8.069607 z m 31.999531,0 -7.999297,7.928983 7.999297,8.069607 7.999297,-8.069607 z"
					/>
				</Svg>
			</Pressable>
		</View>
	);
});


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
		paddingHorizontal: cityOptionPadding,
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

	cityOptionScrollView: {
		width: "100%",
		paddingTop: 2 * GLOBAL.screen.horizOffset,
		marginTop: -GLOBAL.screen.horizOffset,
		overflow: "hidden",
	},

	cityOptionFlatList: {
		// marginTop: cityOptionGap,
		overflow: "visible",
		zIndex: 999,
	},

	cityOptionRow: {
		flexDirection: "row",
		width: "100%",
	},

	cityOptionFuncBtn: {
		position: "absolute",
		bottom: 0,
		justifyContent: "center",
		height: cityOptionHeight,
		zIndex: 999,
	},

	cityOptionMiddleBtn: {
		position: "absolute",
		bottom: 0,
		height: cityOptionHeight,
		borderRadius: GLOBAL.screen.horizOffset,
		overflow: "hidden",
		zIndex: 1000,
	},

	cityOptionWrapper: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		height: "100%",
		padding: cityOptionPadding,
		paddingLeft: 1.2 * cityOptionPadding,
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
		fontSize: cityOptionTimeTextSize - GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	cityBodyDate: {
		textAlign: "right",
		fontFamily: "Trickster-Reg",
		fontSize: cityOptionDateTextSize,
		lineHeight: cityOptionDateTextSize,
	},

	cityScrollSpacer: {
		position: "relative",
		width: "100%",
		height: GLOBAL.slot.ellipseSemiMinor + GLOBAL.slot.shadowRadius,
	},

	cityOptionEditBtn: {
		position: "absolute",
		right: 0,
		top: GLOBAL.screen.horizOffset,
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 2 * GLOBAL.ui.inputBorderWidth,
		paddingHorizontal: 5 * GLOBAL.ui.inputBorderWidth,
		borderWidth: GLOBAL.ui.inputBorderWidth / 2,
		borderRadius: 3 * GLOBAL.ui.inputBorderWidth,
	}
});


export default function CitiesScreen() {
	//* App storage
	const SetActiveTab = GLOBAL.useSaveStore((state) => state.setActiveTab);
	const ActiveBody = GLOBAL.useSaveStore((state) => state.activeBody);
	const SavedCities = GLOBAL.useSaveStore((state) => state.savedCities);
	const PushSavedCity = GLOBAL.useSaveStore((state) => state.pushSavedCity);
	const SetSavedCities = GLOBAL.useSaveStore((state) => state.setSavedCities);
	const DeleteSavedCity = GLOBAL.useSaveStore((state) => state.deleteSavedCity);
	const ActiveCityIndex = GLOBAL.useSaveStore((state) => state.activeCityIndex);
	const SetActiveCityIndex = GLOBAL.useSaveStore((state) => state.setActiveCityIndex);


	//* Colors
	const bodyTextColor = ActiveBody?.palette[0];
	const activeCityColor = ActiveBody?.palette[3];
	const inactiveCityColor = ActiveBody?.palette[2];
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


	//* City options
	const [isEditingCities, setIsEditingCities] = useState<boolean>(false);
	const [isEditCitiesBtnPressed, setIsEditCitiesBtnPressed] = useState<boolean>(false);

	const initialCityOptionData: CityOptionRowTypes[] = SavedCities.slice(1).map((city, c) => {
		const newIndex = c + 1;
		return {
			key: `city-option-row${newIndex}`,
			city: city,
			index: newIndex,
			palette: ActiveBody!.palette,
			isEditingCities: isEditingCities,
			activeCityIndex: ActiveCityIndex,
			onDeletePress: () => {
				DeleteSavedCity(newIndex);
				if (newIndex == ActiveCityIndex) SetActiveCityIndex(0);
			},
			onMiddlePress: () => {
				SetActiveCityIndex(newIndex);
				setTimeout(() => {
					SetActiveTab(2);
					router.replace("/");
				}, 1000 * GLOBAL.ui.animDuration);
			},
			onHandlePress: () => {},
		};
	});

	const [cityOptionData, setCityOptionData] = useState<CityOptionRowTypes[]>(initialCityOptionData);
	useEffect(() => {
		const updatedData: CityOptionRowTypes[] = SavedCities.slice(1).map((city, c) => {
			const newIndex = c + 1;
			return {
				key: `city-option-row${newIndex}`,
				city: city,
				index: newIndex,
				palette: ActiveBody!.palette,
				isEditingCities: isEditingCities,
				activeCityIndex: ActiveCityIndex,
				onDeletePress: () => {
					DeleteSavedCity(newIndex);
					if (newIndex == ActiveCityIndex) SetActiveCityIndex(0);
				},
				onMiddlePress: () => {
					SetActiveCityIndex(newIndex);
					setTimeout(() => {
						SetActiveTab(2);
						router.replace("/");
					}, 1000 * GLOBAL.ui.animDuration);
				},
				onHandlePress: () => {},
			};
		});

		setCityOptionData(updatedData);
	}, [SavedCities]);

	const CityOptionRowItem = ({ item, drag }: RenderItemParams<CityOptionRowTypes>) => {
		return (
			<CityOptionRow
				key={item.key}
				city={item.city}
				index={item.index}
				palette={item.palette}
				isEditingCities={isEditingCities}
				activeCityIndex={ActiveCityIndex}
				onDeletePress={item.onDeletePress}
				onMiddlePress={item.onMiddlePress}
				onHandlePress={drag}
			/>
		)
	};


	//* Components
	return (
		<GestureHandlerRootView style={styles.content}>
			<View style={[styles.skewContainer, GLOBAL.ui.skewStyle]}>
				<Text style={styles.title}>Saved Locations</Text>

				{(isCityInputFocused) && <View style={styles.focusDarken} pointerEvents="none"></View>}

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
										// setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 0);
									}}
								>
									<Text style={styles.cityResultText}>{cityNameResults[i]}</Text>
								</Pressable>
							))}
						</View>
					}
				</View>

				<NestableScrollContainer
					style={styles.cityOptionScrollView}
					showsVerticalScrollIndicator={false}
				>
					<CityOptionRow
						key="city-option-row0"
						city={SavedCities[0]}
						index={0}
						palette={ActiveBody!.palette}
						isEditingCities={isEditingCities}
						activeCityIndex={ActiveCityIndex}
						onDeletePress={() => {}}
						onMiddlePress={() => {
							SetActiveCityIndex(0);
							setTimeout(() => {
								SetActiveTab(2);
								router.replace("/");
							}, 1000 * GLOBAL.ui.animDuration);
						}}
						onHandlePress={() => {}}
					/>

					<NestableDraggableFlatList
						style={styles.cityOptionFlatList}
						scrollEnabled={false}
						dragItemOverflow={true}
						data={cityOptionData}
						keyExtractor={(item) => item.key}
						onDragEnd={({ data }) => {
							setCityOptionData(data);
							const reorderedCities = data.map(item => item.city);
							SetSavedCities([SavedCities[0], ...reorderedCities]);
						}}
						renderItem={CityOptionRowItem}
					>
					</NestableDraggableFlatList>

					<View style={styles.cityScrollSpacer}>
						{(SavedCities.length > 1) && (
							<Pressable
								style={[
									styles.cityOptionEditBtn,
									{ opacity: (isEditCitiesBtnPressed) ? 0.5 : 1, borderColor: bodyTextColor }
								]}
								onPressIn={() => {
									setIsEditCitiesBtnPressed(true);
								}}
								onPress={() => {
									setIsEditingCities(!isEditingCities);
								}}
								onPressOut={() => {
									setIsEditCitiesBtnPressed(false);
								}}
							>
								{(!isEditingCities) && (
									<Text style={{
										fontFamily: "Trickster-Reg",
										fontSize: GLOBAL.ui.bodyTextSize,
										color: bodyTextColor
									}}>Edit</Text>
								)}

								{(!isEditingCities) && (
									<Svg
										style={{ marginLeft: GLOBAL.ui.inputBorderWidth }}
										width={GLOBAL.ui.bodyTextSize}
										height={GLOBAL.ui.bodyTextSize}
										viewBox="0 0 100 100"
									>
										<Path
											fill={bodyTextColor}
											stroke={bodyTextColor}
											strokeWidth={2}
											d="M 84.477757,15.523031 C 79.75692,10.802194 73.763482,7.3535015 67.385434,12.724436 c -1.200672,3.16624 -3.188035,5.548363 -5.936551,7.167996 0.360348,0.514964 0.726956,1.023823 1.098549,1.527727 0.371595,0.503903 0.748176,1.002853 1.13025,1.496025 1.618219,-3.014566 4.09507,-5.17272 7.453302,-6.446198 4.86738,-5.87449 8.406841,-2.710324 11.758491,0.641328 3.351654,3.35165 6.515814,6.891114 0.641328,11.75849 -1.273478,3.358233 -3.431633,5.835083 -6.446198,7.453304 0.493263,0.382161 0.99217,0.758695 1.496024,1.130248 0.50385,0.371559 1.012661,0.738124 1.527726,1.098548 1.619635,-2.748511 4.001758,-4.735876 7.167992,-5.936549 5.370889,-6.378106 1.92224,-12.371489 -2.79859,-17.092324 z m -4.369402,23.028873 c -0.515061,-0.360429 -1.023871,-0.726995 -1.527726,-1.098548 -0.503859,-0.371548 -1.002758,-0.74809 -1.496024,-1.130248 -5.036466,-3.901992 -9.505001,-8.370385 -13.406923,-13.406924 -0.382072,-0.493172 -0.758655,-0.992122 -1.13025,-1.496025 -0.371593,-0.503903 -0.738199,-1.012765 -1.098549,-1.527727 -0.743153,0.437925 -1.531198,0.831213 -2.3873,1.155854 -0.560922,0.671275 -1.137488,1.327073 -1.703297,1.993482 0.690827,0.474596 1.368771,0.962323 2.037374,1.459448 0.668601,0.497123 1.327866,1.003646 1.980069,1.516752 4.704329,3.701014 8.906029,7.902818 12.607092,12.607092 0.5132,0.652301 1.019671,1.31152 1.516753,1.980069 0.49708,0.668549 0.984774,1.346434 1.459448,2.037375 0.666406,-0.56581 1.322205,-1.142376 1.99348,-1.703299 0.324642,-0.856098 0.717929,-1.644146 1.155853,-2.387301 z m -3.149333,4.0906 C 76.484348,41.951563 75.996654,41.273678 75.499574,40.605129 75.002492,39.93658 74.496018,39.277363 73.982821,38.62506 61.816183,53.019009 48.523568,66.290969 34.091254,78.419093 28.264646,81.047745 22.229475,82.909214 15.99142,84.006937 17.089699,77.769127 18.953812,71.734655 21.582918,65.908318 33.710752,51.476491 46.982209,38.184245 61.375729,26.017968 60.723523,25.504863 60.064261,24.998339 59.39566,24.501216 58.727057,24.004091 58.049113,23.516364 57.358286,23.041768 45.121128,37.454645 31.754426,50.742114 17.236275,62.873594 16.509666,72.364504 14.094942,81.40988 9.9999998,89.998348 l 0.0013,8.89e-4 c 8.588797,-4.095387 17.633329,-6.509652 27.124725,-7.236308 l 0.0013,0.0013 C 49.258617,68.246302 62.546143,54.879658 76.959022,42.642504 Z M 63.442365,23.368527 c -0.07695,0.152088 -0.152486,0.306156 -0.225562,0.462098 -0.07308,0.155943 -0.143732,0.312486 -0.212149,0.473071 -0.06842,0.160589 -0.134561,0.324114 -0.19752,0.49014 -0.241073,0.201452 -0.478071,0.405857 -0.715704,0.610844 0.237625,-0.204995 0.474623,-0.409401 0.715704,-0.610844 0.06296,-0.166024 0.129101,-0.329553 0.19752,-0.49014 0.06842,-0.160588 0.139072,-0.317131 0.212149,-0.473071 0.07308,-0.155942 0.148619,-0.31001 0.225562,-0.462098 z m 13.189897,13.189896 c -0.152088,0.07695 -0.306155,0.152488 -0.462099,0.225562 -0.155942,0.07308 -0.312485,0.143733 -0.473071,0.21215 -0.160589,0.06842 -0.324112,0.134562 -0.490141,0.197519 -0.201449,0.241087 -0.405851,0.478084 -0.610844,0.715704 0.204993,-0.23762 0.409395,-0.474617 0.610844,-0.715704 0.166024,-0.06296 0.329556,-0.1291 0.490141,-0.197519 0.160589,-0.06842 0.31713,-0.139072 0.473071,-0.21215 0.155944,-0.07308 0.310011,-0.148617 0.462099,-0.225562 z"
										/>
									</Svg>
								)}

								{(isEditingCities) && (
									<Text style={{
										fontFamily: "Trickster-Reg",
										fontSize: GLOBAL.ui.bodyTextSize,
										color: bodyTextColor
									}}>Done</Text>
								)}
							</Pressable>
						)}
					</View>
				</NestableScrollContainer>
			</View>

			<SlotBottomShadow />
		</GestureHandlerRootView>
	);
}
