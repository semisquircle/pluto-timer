import * as GLOBAL from "@/ref/global";
import { SlotBottomShadow } from "@/ref/slot-shadows";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Animated, { interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);
const AnimatedRadialGradient = Animated.createAnimatedComponent(RadialGradient);


//* Frequency of notifs
const freqOptionDimension = (GLOBAL.slot.width - (3 * GLOBAL.screen.borderWidth)) / 2;
const freqOptionSunPerc = 45;
const freqOptionsTextSize = 1.5 * GLOBAL.ui.bodyTextSize;
const freqOptionTextOffset = 1.5 * GLOBAL.screen.borderWidth;
const notifFreqOptions = [
	{
		text: "Before Sunrise",
		colors: ["#fdf1cd", "#f9dc90", "#f89e9d", "#d46f93", "#805690"],
	},
	{
		text: "After Sunset",
		colors: ["#ffefa0", "#f8b51b", "#e53e2c", "#a52a4e", "#4f1d6e"],
	},
];


//* Time format options
const timeFormatContainerWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.borderWidth);
const timeFormatContainerHeight = 110;
const timeFormatContainerBorderRadius = GLOBAL.screen.borderWidth;
const timeFormatOptions = [
	{ title: "12-Hour Clock", subtitle: "(Ex: 7:30 PM)" },
	{ title: "24-Hour Clock", subtitle: "(Ex: 19:30)" },
];


//* Credits
const credits = [
	{ name: "Semi", job: "Programming/development" },
	{ name: "NASA", job: "Astronomical data" },
	{ name: "davemcw", job: "Time algorithm" },
	{ name: "Deep-Fold", job: "Planet texture generator" },
]


//* Restore button
const restoreBtnWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.borderWidth);
const restoreBtnHeight = 0.2 * GLOBAL.slot.width;
const restoreBtnBorderRadius = GLOBAL.screen.borderWidth;


//* Stylesheet
const styles = StyleSheet.create({
	content: {
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
	},

	skewContainer: {
		width: "100%",
		height: "100%",
		padding: GLOBAL.screen.borderWidth,
		paddingTop: GLOBAL.screen.borderWidth,
		overflow: "visible",
	},

	title: {
		width: "100%",
		fontFamily: "Trickster-Reg",
		fontSize: 30,
		marginBottom: GLOBAL.screen.borderWidth,
		color: GLOBAL.ui.colors[0],
	},

	subtitle: {
		width: "100%",
		fontFamily: "Trickster-Reg",
		fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
		marginBottom: GLOBAL.screen.borderWidth,
	},

	freqOptionContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},

	freqOption: {
		alignItems: "center",
		width: freqOptionDimension,
		height: freqOptionDimension,
		borderWidth: GLOBAL.ui.inputBorderWidth,
		borderRadius: GLOBAL.screen.borderWidth,
		overflow: "hidden",
	},

	freqOptionSvg: {
		position: "absolute",
		left: 0,
		top: 0,
		width: "100%",
		height: "100%",
	},

	freqOptionArrowSvg: {
		position: "absolute",
		bottom: "-1%",
		width: `${freqOptionSunPerc}%`,
		height: `${freqOptionSunPerc}%`,
	},

	notifReminderContainer: {
		width: "100%",
		padding: 1.5 * GLOBAL.screen.borderWidth,
		borderWidth: GLOBAL.ui.inputBorderWidth,
		borderColor: GLOBAL.ui.colors[0],
		borderRadius: GLOBAL.screen.borderWidth,
		overflow: "hidden",
	},

	notifReminderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
	},

	notifReminderTitle: {
		fontFamily: "Trickster-Reg",
		fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.colors[0],
	},

	settingsScrollSpacer: {
		width: "100%",
		height: 2.2 * GLOBAL.slot.ellipseSemiMinor,
	},
});


export default function SettingsScreen() {
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


	//! Hacky fix
	const [renderKey, setRenderKey] = useState<string>("");
	useEffect(() => {
		const r = (Math.random() + 1).toString(36).substring(7);
		setRenderKey(r);
	}, [ActiveTab]);


	//* Notif styles
	const notifOffColor = ActiveBody?.colors[3];


	//* Notif reminders
	const notifReminderOptions = [
		{ title: `Exactly at ${ActiveBody?.name} Time` },
		{ title: "5 minutes before" },
		{ title: "10 minutes before" },
	];


	//* Time format options
	const [timeFormatPressed, setTimeFormatPressed] = useState<number | null>(null);
	const timeFormatProgress = useSharedValue((IsFormat24Hour) ? timeFormatContainerWidth / 2 : GLOBAL.ui.inputBorderWidth);
	useEffect(() => {
		timeFormatProgress.value = withTiming(
			(IsFormat24Hour) ? timeFormatContainerWidth / 2 : GLOBAL.ui.inputBorderWidth,
			{ duration: 1000 * GLOBAL.ui.animDuration }
		);
	}, [IsFormat24Hour]);

	const timeFormatAnimSvgProps = useAnimatedProps(() => {
		return { x: timeFormatProgress.value };
	});


	//* Components
	return (
		<View key={`render-${renderKey}`} style={styles.content}>
			<ScrollView
				style={[styles.skewContainer, GLOBAL.ui.skewStyle]}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>Settings</Text>

				<Text style={[styles.subtitle, { marginTop: GLOBAL.screen.borderWidth, color: ActiveBody?.colors[1] }]}>
					When do you want to be notified?
				</Text>
				<View style={styles.freqOptionContainer}>
					{notifFreqOptions.map((option, i) => {
						const notifFreqAnimProgress = useSharedValue(NotifFreqs[i] ? 1 : 0);
						useEffect(() => {
							notifFreqAnimProgress.value = withTiming(
								NotifFreqs[i] ? 1 : 0,
								{ duration: 1000 * GLOBAL.ui.animDuration }
							);
						}, [NotifFreqs[i]]);

						const containerAnimStyle = useAnimatedStyle(() => {
							return {
								borderColor: interpolateColor(
									notifFreqAnimProgress.value,
									[0, 1],
									[notifOffColor!, GLOBAL.ui.colors[0]]
								)
							}
						});

						const skyAnimProps = useAnimatedProps(() => {
							return { opacity: notifFreqAnimProgress.value };
						});

						const sunAnimProps = useAnimatedProps(() => {
							return {
								fill: interpolateColor(
									notifFreqAnimProgress.value,
									[0, 1],
									["transparent", option.colors[0]]
								),
								stroke: interpolateColor(
									notifFreqAnimProgress.value,
									[0, 1],
									[notifOffColor!, option.colors[0]]
								),
							};
						});

						const arrowAnimProps = useAnimatedProps(() => {
							return {
								fill: interpolateColor(
									notifFreqAnimProgress.value,
									[0, 1],
									[notifOffColor!, option.colors[2]]
								),
							};
						});

						const textAnimProps = useAnimatedProps(() => {
							return {
								fill: interpolateColor(
									notifFreqAnimProgress.value,
									[0, 1],
									[notifOffColor!, option.colors[0]]
								),
							};
						});

						return (
							<AnimatedPressable
								key={`freq-option-${i}`}
								style={[styles.freqOption, containerAnimStyle]}
								onPress={() => {
									ToggleNotifFreq(i);
								}}
							>
								<Svg
									style={styles.freqOptionSvg}
									viewBox={`0 0 ${freqOptionDimension} ${freqOptionDimension}`}
								>
									<Defs>
										<RadialGradient id="sky-gradient" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
											<Stop
												offset={freqOptionSunPerc + "%"}
												stopColor={option.colors[1]}
												stopOpacity="1"
											/>
											<Stop
												offset={freqOptionSunPerc + ((100 - freqOptionSunPerc) / (option.colors.length - 2)) + "%"}
												stopColor={option.colors[2]}
												stopOpacity="1"
											/>
											<Stop
												offset={freqOptionSunPerc + 2 * ((100 - freqOptionSunPerc) / (option.colors.length - 2)) + "%"}
												stopColor={option.colors[3]}
												stopOpacity="1"
											/>
											<Stop
												offset="100%"
												stopColor={option.colors[4]}
												stopOpacity="1"
											/>
										</RadialGradient>

										<Circle
											id="sun-text1"
											cx="50%"
											cy="100%"
											r={(freqOptionSunPerc / 100) * freqOptionDimension + freqOptionTextOffset}
											fill="transparent"
										/>

										<Circle
											id="sun-text2"
											cx="50%"
											cy="100%"
											r={(freqOptionSunPerc / 100) * freqOptionDimension + freqOptionTextOffset + freqOptionsTextSize - 3}
											fill="transparent"
										/>
									</Defs>

									<AnimatedRect
										animatedProps={skyAnimProps}
										fill="url(#sky-gradient)"
										x={-freqOptionDimension / 2}
										y="0"
										width={2 * freqOptionDimension}
										height={2 * freqOptionDimension}
									/>

									<AnimatedCircle
										animatedProps={sunAnimProps}
										cx="50%"
										cy="100%"
										r={freqOptionSunPerc + "%"}
										strokeWidth={GLOBAL.ui.inputBorderWidth}
									/>

									<AnimatedSvgText
										animatedProps={textAnimProps}
										fontFamily="Trickster-Reg"
										fontSize={freqOptionsTextSize}
										letterSpacing="0"
										textAnchor="middle"
									>
										<TextPath href="#sun-text2" startOffset="75%">
											<TSpan>{option.text.split(" ")[0]}</TSpan>
										</TextPath>
									</AnimatedSvgText>

									<AnimatedSvgText
										animatedProps={textAnimProps}
										fontFamily="Trickster-Reg"
										fontSize={freqOptionsTextSize}
										letterSpacing="0"
										textAnchor="middle"
									>
										<TextPath href="#sun-text1" startOffset="75%">
											<TSpan>{option.text.split(" ")[1]}</TSpan>
										</TextPath>
									</AnimatedSvgText>
								</Svg>

								<Svg
									style={[
										styles.freqOptionArrowSvg,
										{ transform: [{ rotate: i === 1 ? "180deg" : "0deg" }] },
									]}
									viewBox="0 0 100 100"
								>
									<AnimatedPath
										animatedProps={arrowAnimProps}
										d="M 49.998914,20 C 42.801816,30.336846 34.037386,39.0994 23.700394,46.296352 l 4.709794,4.711962 C 33.735076,43.360168 39.9215,36.576691 46.965304,30.649078 48.879531,47.100804 48.783272,63.547761 46.668232,80 h 6.661366 c -2.115042,-16.452239 -2.2113,-32.899196 -0.297074,-49.350922 7.04391,5.927628 13.230081,12.71088 18.555116,20.359236 l 4.711966,-4.711962 C 65.96261,39.099398 57.196012,30.336846 49.998914,20 Z"
									/>
								</Svg>
							</AnimatedPressable>
						);
					})}
				</View>

				<Text style={[styles.subtitle, { marginTop: 2.5 * GLOBAL.screen.borderWidth, color: ActiveBody?.colors[1] }]}>
					When do you want to be reminded?
				</Text>
				<View style={styles.notifReminderContainer}>
					{notifReminderOptions.map((option, i) => (
						<View
							key={`notif-reminder-${i}`}
							style={[
								styles.notifReminderRow,
								{ marginTop: i > 0 ? GLOBAL.screen.borderWidth : 0 },
							]}
						>
							<Text
								style={[
									styles.notifReminderTitle,
									{
										color: NotifReminders[i]
											? GLOBAL.ui.colors[0]
											: notifOffColor,
										textDecorationLine: NotifReminders[i]
											? "none"
											: "line-through",
									},
								]}
							>
								{option.title}
							</Text>

							<Switch
								trackColor={{ false: notifOffColor, true: ActiveBody?.colors[2] }}
								ios_backgroundColor={ActiveBody?.colors[4]}
								thumbColor={
									NotifReminders[i]
										? GLOBAL.ui.colors[0]
										: GLOBAL.ui.colors[1]
								}
								value={NotifReminders[i]}
								onValueChange={() => {
									ToggleNotifReminder(i);
								}}
							/>
						</View>
					))}
				</View>

				<Text style={[styles.subtitle, { marginTop: 2.5 * GLOBAL.screen.borderWidth, color: ActiveBody?.colors[1] }]}>
					How do you want your time displayed?
				</Text>
				<View
					style={{
						width: timeFormatContainerWidth,
						height: timeFormatContainerHeight,
						borderRadius: timeFormatContainerBorderRadius,
						overflow: "hidden",
					}}
				>
					<Svg
						style={{
							position: "absolute",
							left: 0,
							top: 0,
						}}
						width={timeFormatContainerWidth}
						height={timeFormatContainerHeight}
						viewBox={`0 0 ${timeFormatContainerWidth} ${timeFormatContainerHeight}`}
					>
						<Defs>
							<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</LinearGradient>

							<AnimatedRadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
								gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * ((timeFormatContainerWidth / 2) - GLOBAL.ui.inputBorderWidth)}, 0)`}
							>
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</AnimatedRadialGradient>

							<LinearGradient id="stroke" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="black" stopOpacity="0" />
								<Stop offset="100%" stopColor="black" stopOpacity="0.5" />
							</LinearGradient>
						</Defs>

						<Rect
							fill="transparent"
							stroke={ActiveBody?.colors[3]}
							strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
							x={0}
							y={0}
							width={timeFormatContainerWidth}
							height={timeFormatContainerHeight}
							rx={timeFormatContainerBorderRadius}
						/>

						<Rect
							fill="transparent"
							stroke="url(#stroke)"
							strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
							x={0}
							y={0}
							width={timeFormatContainerWidth}
							height={timeFormatContainerHeight}
							rx={timeFormatContainerBorderRadius}
						/>

						<AnimatedRect
							fill={ActiveBody?.colors[3]}
							animatedProps={timeFormatAnimSvgProps}
							y={GLOBAL.ui.inputBorderWidth}
							width={(timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2}
							height={timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth)}
							rx={timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth}
						/>

						<AnimatedRect
							fill="url(#bottom-blob)"
							animatedProps={timeFormatAnimSvgProps}
							y={GLOBAL.ui.inputBorderWidth}
							width={(timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2}
							height={timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth)}
							rx={timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth}
						/>

						<AnimatedRect
							fill="url(#top-blob)"
							animatedProps={timeFormatAnimSvgProps}
							y={GLOBAL.ui.inputBorderWidth}
							width={(timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2}
							height={2 * (timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth)}
							rx={timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth}
						/>
					</Svg>

					{timeFormatOptions.map((formatOption, f) => (
						<Pressable
							key={`time-format-option${f}`}
							style={{
								position: "absolute",
								top: GLOBAL.ui.inputBorderWidth,
								left: (f == 0) ? GLOBAL.ui.inputBorderWidth : timeFormatContainerWidth / 2,
								justifyContent: "center",
								alignItems: "center",
								width: (timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2,
								height: timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth),
								backgroundColor: (timeFormatPressed == f) ? GLOBAL.ui.colors[0] + "22" : "transparent",
								borderRadius: timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth,
							}}
							onPressIn={() => {
								if (f === (IsFormat24Hour ? 0 : 1)) setTimeFormatPressed(f);
							}}
							onPress={() => {
								SetIsFormat24Hour(f == 1);
							}}
							onPressOut={() => {
								setTimeFormatPressed(null);
							}}
						>
							<Text
								style={[
									{
										fontFamily: "Trickster-Reg",
										fontSize: GLOBAL.ui.bodyTextSize,
										color: GLOBAL.ui.colors[0],
									},
									GLOBAL.ui.btnShadowStyle
								]}
							>{formatOption.title}</Text>

							<Text
								style={[
									{
										fontFamily: "Trickster-Reg",
										fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
										color: ActiveBody?.colors[0],
									},
									GLOBAL.ui.btnShadowStyle
								]}
							>{formatOption.subtitle}</Text>
						</Pressable>
					))}
				</View>

				<Text style={[styles.subtitle, { marginTop: 2.5 * GLOBAL.screen.borderWidth, color: ActiveBody?.colors[1] }]}>
					This app was brought to you in part by:
				</Text>
				<View style={styles.notifReminderContainer}>
					{credits.map((credit, c) => (
						<View
							key={`credit${c}`}
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center",
								width: "100%"
							}}
						>
							<Text style={{
								fontFamily: "Trickster-Reg",
								fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
								color: GLOBAL.ui.colors[0],
							}}>{credit.name}</Text>

							<View style={{
								flex: 1,
								marginHorizontal: GLOBAL.ui.bodyTextSize / 2,
								borderTopWidth: GLOBAL.ui.inputBorderWidth,
								borderColor: GLOBAL.ui.colors[0],
								borderStyle: "dotted",
							}}></View>

							<Text style={{
								fontFamily: "Trickster-Reg",
								fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
								color: GLOBAL.ui.colors[0],
							}}>{credit.job}</Text>
						</View>
					))}
				</View>

				<Pressable
					style={{
						justifyContent: "center",
						alignItems: "center",
						width: restoreBtnWidth,
						height: restoreBtnHeight,
						marginTop: 5 * GLOBAL.screen.borderWidth,
						backgroundColor: ActiveBody?.colors[3],
						borderRadius: restoreBtnBorderRadius,
					}}
					onPress={() => {
					}}
				>
					<Svg
						style={{
							position: "absolute",
							left: 0,
						}}
						width="100%"
						height="100%"
						viewBox={`0 0 ${restoreBtnWidth} ${restoreBtnHeight}`}
					>
						<Defs>
							<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</LinearGradient>

							<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
								gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * (restoreBtnWidth - (2 * GLOBAL.ui.inputBorderWidth))}, 0)`}
							>
								<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
								<Stop offset="100%" stopColor="white" stopOpacity="0" />
							</RadialGradient>

							<LinearGradient id="stroke" x1="0%" x2="0" y1="0%" y2="100%">
								<Stop offset="0%" stopColor="black" stopOpacity="0" />
								<Stop offset="100%" stopColor="black" stopOpacity="0.5" />
							</LinearGradient>
						</Defs>

						<Rect
							fill="url(#bottom-blob)"
							stroke="url(#stroke)"
							strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
							x={0}
							y={0}
							width={restoreBtnWidth}
							height={restoreBtnHeight}
							rx={restoreBtnBorderRadius}
						/>

						<Rect
							fill="url(#top-blob)"
							x={GLOBAL.ui.inputBorderWidth}
							y={GLOBAL.ui.inputBorderWidth}
							width={restoreBtnWidth - (2 * GLOBAL.ui.inputBorderWidth)}
							height={2 * (restoreBtnBorderRadius - GLOBAL.ui.inputBorderWidth)}
							rx={restoreBtnBorderRadius - GLOBAL.ui.inputBorderWidth}
						/>
					</Svg>

					<View style={[
						{ position: "absolute", },
						GLOBAL.ui.btnShadowStyle
					]}>
						<Text style={{
							fontFamily: "Trickster-Reg",
							fontSize: GLOBAL.ui.bodyTextSize,
							color: GLOBAL.ui.colors[0],
						}}>Restore all settings to default</Text>
					</View>
				</Pressable>

				<View style={styles.settingsScrollSpacer}></View>
			</ScrollView>

			<SlotBottomShadow />
		</View>
	);
}
