import * as GLOBAL from "@/ref/global";
import { RectBtn } from "@/ref/rect-btn";
import { SlotBottomShadow, SlotTopShadow } from "@/ref/slot-shadows";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Reanimated, { interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";


//* Reanimated
const ReanimatedPressable = Reanimated.createAnimatedComponent(Pressable);
const ReanimatedSvg = Reanimated.createAnimatedComponent(Svg);
const ReanimatedRect = Reanimated.createAnimatedComponent(Rect);
const ReanimatedCircle = Reanimated.createAnimatedComponent(Circle);
const ReanimatedPath = Reanimated.createAnimatedComponent(Path);
const ReanimatedSvgText = Reanimated.createAnimatedComponent(SvgText);


//* Frequency of notifs
const freqOptionDimension = (GLOBAL.slot.width - (3 * GLOBAL.screen.horizOffset)) / 2;
const freqOptionSunPerc = 45;
const freqOptionsTextSize = 1.5 * GLOBAL.ui.bodyTextSize;
const freqOptionTextOffset = 0.4 * freqOptionsTextSize;
const notifFreqOptions = [
	{
		text: "Before Midday",
		palette: ["#fdf1cd", "#f9dc90", "#f89e9d", "#d46f93", "#805690"],
	},
	{
		text: "After Midday",
		palette: ["#ffefa0", "#f8b51b", "#e53e2c", "#a52a4e", "#4f1d6e"],
	},
];


//* Time format options
const timeFormatContainerWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset);
const timeFormatContainerHeight = 110;
const timeFormatContainerBorderRadius = GLOBAL.screen.horizOffset;
const timeFormatOptions = [
	{ title: "12-Hour Clock", subtitle: "(Ex: 7:30 PM)" },
	{ title: "24-Hour Clock", subtitle: "(Ex: 19:30)" },
];


//* Credits
const credits = [
	{ name: "Semi Squircle", jobs: ["Programming", "Development"] },
	{ name: "NASA", jobs: ["New Horizons data", "Jet Propulsion Laboratory", "Planetary Spectrum Generator"] },
	{ name: "@DaveMcW", jobs: ["Comuputation archive"] },
	{ name: "@Deep-Fold", jobs: ["Planet textures"] },
	{ name: "Denis Moskowitz", jobs: ["Astronomical symbols"] },
];


//* Restore button
const restoreBtnWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset);
const restoreBtnHeight = 0.2 * GLOBAL.slot.width;
const restoreBtnBorderRadius = GLOBAL.screen.horizOffset;


//* Kilroy
const kilroyWidth = GLOBAL.slot.width / 3;
const kilroyHeight = kilroyWidth / 2;


//* Stylesheet
const styles = StyleSheet.create({
	content: {
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
		overflow: "hidden",
	},

	settingsScrollContainer: {
		width: "100%",
		height: "100%",
		paddingHorizontal: GLOBAL.screen.horizOffset,
		paddingTop: GLOBAL.screen.horizOffset,
		overflow: "visible",
	},

	skewContainer: {
		width: "100%",
	},

	title: {
		width: "100%",
		fontFamily: "Trickster-Reg-Semi",
		fontSize: 30,
		marginBottom: GLOBAL.screen.horizOffset,
		color: GLOBAL.ui.palette[0],
	},

	subtitle: {
		width: "100%",
		fontFamily: "Trickster-Reg-Semi",
		fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
		marginBottom: GLOBAL.screen.horizOffset,
		marginTop: 2.5 * GLOBAL.screen.horizOffset
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
		borderRadius: GLOBAL.screen.horizOffset,
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
		padding: 1.5 * GLOBAL.screen.horizOffset,
		borderWidth: GLOBAL.ui.inputBorderWidth,
		borderColor: GLOBAL.ui.palette[0],
		borderRadius: GLOBAL.screen.horizOffset,
		overflow: "hidden",
	},

	notifReminderRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
	},

	notifReminderTitle: {
		fontFamily: "Trickster-Reg-Semi",
		fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	creditContainer: {
		width: "100%",
		padding: 1.5 * GLOBAL.screen.horizOffset,
		borderWidth: GLOBAL.ui.inputBorderWidth,
		borderRadius: GLOBAL.screen.horizOffset,
		overflow: "hidden",
	},

	creditsBracket: {
		fontFamily: "Trickster-Reg-Semi",
		fontSize: 2.5 * GLOBAL.ui.bodyTextSize,
	},

	settingsScrollSpacer: {
		width: "100%",
		height: GLOBAL.slot.ellipseSemiMinor + GLOBAL.slot.shadowRadius + ((restoreBtnWidth * Math.abs(Math.tan(GLOBAL.ui.skewAngle * (Math.PI / 180)))) / 2),
	},

	kilroy: {
		position: "absolute",
		left: (GLOBAL.slot.width - kilroyWidth) / 2,
		bottom: -kilroyHeight,
	},
});


//* Curly brackets
type CurlyBracketTypes = {
	width: number;
	height: number;
	strokeColor: any;
	direction: string;
}
const CurlyBracket = (props: CurlyBracketTypes) => {
	return (
		<Svg
			style={{ transform: [{ rotate: (props.direction == "left") ? "180deg" : "0deg" }] }}
			width={props.width}
			height={props.height}
			viewBox={`0 0 ${props.width} ${props.height}`}
		>
			<Path
				fill="transparent"
				stroke={props.strokeColor}
				strokeWidth={GLOBAL.ui.inputBorderWidth / 2}
				strokeLinecap="round"
				d={`
					M ${props.width},0
					C ${props.width},0 0,0 ${props.width / 2},${props.height / 4} ${props.width},${props.height / 2} 0,${props.height / 2} 0,${props.height / 2}
					c 0,0 ${props.width},0 ${props.width / 2},${props.height / 4} -${props.width / 2},${props.height / 4} ${props.width / 2},${props.height / 4} ${props.width / 2},${props.height / 4}
				`}
			/>
		</Svg>
	);
}

export default function SettingsScreen() {
	//* App storage
	const WriteDefaultSaveToFile = GLOBAL.useSaveStore(state => state.writeDefaultSaveToFile);
	const LoadSave = GLOBAL.useSaveStore(state => state.loadSave);
	const WriteNewSaveToFile = GLOBAL.useSaveStore(state => state.writeNewSaveToFile);

	const SetPromptCompleted = GLOBAL.useSaveStore(state => state.setPromptCompleted);
	const ScheduleNotifs = GLOBAL.useSaveStore(state => state.scheduleNotifs);
	const SetNeedsToGeolocate = GLOBAL.useSaveStore(state => state.setNeedToGeolocate);

	const ActiveBody = GLOBAL.useSaveStore(state => state.activeBody);
	const NotifFreqs = GLOBAL.useSaveStore(state => state.notifFreqs);
	const ToggleNotifFreq = GLOBAL.useSaveStore(state => state.toggleNotifFreq);
	const NotifReminders = GLOBAL.useSaveStore(state => state.notifReminders);
	const ToggleNotifReminder = GLOBAL.useSaveStore(state => state.toggleNotifReminder);
	const IsFormat24Hour = GLOBAL.useSaveStore(state => state.isFormat24Hour);
	const SetIsFormat24Hour = GLOBAL.useSaveStore(state => state.setIsFormat24Hour);


	//* Colors
	const subTitleColor = ActiveBody?.palette[0];
	const inputOffColor = ActiveBody?.palette[2];
	const btnBgColor = ActiveBody?.palette[2];


	//* Scrolling
	const [scrollPosition, setScrollPosition] = useState(0);


	//* Notif reminders
	const notifReminderOptions = [
		{ title: `Exactly at ${ActiveBody?.name} Time` },
		{ title: "5 minutes before" },
		{ title: "10 minutes before" },
	];


	//* Time format options
	const [timeFormatPressed, setTimeFormatPressed] = useState<number | null>(null);
	const timeFormatProgress = useSharedValue((IsFormat24Hour) ? 1 : 0);
	useEffect(() => {
		timeFormatProgress.value = withTiming(
			(IsFormat24Hour) ? 1 : 0,
			{ duration: 1000 * GLOBAL.ui.animDuration }
		);
	}, [IsFormat24Hour]);

	const timeFormatAnimSvgStyle = useAnimatedStyle(() => {
		return {
			left: GLOBAL.ui.inputBorderWidth
				+ (timeFormatProgress.value * ((timeFormatContainerWidth / 2) - GLOBAL.ui.inputBorderWidth))
		};
	});


	//* Restore button
	const [isRestoreBtnPressed, setIsRestoreBtnPressed] = useState(false);
	const [isRestoreBtnActive, setIsRestoreBtnActive] = useState(false);


	//! Permissions testing
	const [isPermBtnPressed, setIsPermBtnPressed] = useState(false);
	const [isPermBtnActive, setIsPermBtnActive] = useState(false);


	//* Components
	return (
		<View style={styles.content}>
			<ScrollView
				style={[styles.settingsScrollContainer]}
				showsVerticalScrollIndicator={false}
				onScroll={(evt) => {
					setScrollPosition(evt.nativeEvent.contentOffset.y);
				}}
			>
				<View style={[styles.skewContainer, GLOBAL.ui.skewStyle]}>
					<Text style={styles.title}>Settings</Text>

					<Text style={[styles.subtitle, { color: subTitleColor, marginTop: 0 }]}>
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
										[inputOffColor!, GLOBAL.ui.palette[0]]
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
										["transparent", option.palette[0]]
									),
									stroke: interpolateColor(
										notifFreqAnimProgress.value,
										[0, 1],
										[inputOffColor!, option.palette[0]]
									),
								};
							});

							const arrowAnimProps = useAnimatedProps(() => {
								return {
									fill: interpolateColor(
										notifFreqAnimProgress.value,
										[0, 1],
										[inputOffColor!, option.palette[2]]
									),
								};
							});

							const textAnimProps = useAnimatedProps(() => {
								return {
									fill: interpolateColor(
										notifFreqAnimProgress.value,
										[0, 1],
										[inputOffColor!, option.palette[0]]
									),
								};
							});

							return (
								<ReanimatedPressable
									key={`freq-option-${i}`}
									style={[styles.freqOption, containerAnimStyle]}
									onPress={() => {
										ToggleNotifFreq(i);
										WriteNewSaveToFile(); //^ Save write
										ScheduleNotifs();
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
													stopColor={option.palette[1]}
													stopOpacity="1"
												/>
												<Stop
													offset={freqOptionSunPerc + ((100 - freqOptionSunPerc) / (option.palette.length - 2)) + "%"}
													stopColor={option.palette[2]}
													stopOpacity="1"
												/>
												<Stop
													offset={freqOptionSunPerc + 2 * ((100 - freqOptionSunPerc) / (option.palette.length - 2)) + "%"}
													stopColor={option.palette[3]}
													stopOpacity="1"
												/>
												<Stop
													offset="100%"
													stopColor={option.palette[4]}
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
												r={(freqOptionSunPerc / 100) * freqOptionDimension + 1.4 * freqOptionTextOffset + freqOptionsTextSize - 3}
												fill="transparent"
											/>
										</Defs>

										<ReanimatedRect
											animatedProps={skyAnimProps}
											fill="url(#sky-gradient)"
											x={-freqOptionDimension / 2}
											y="0"
											width={2 * freqOptionDimension}
											height={2 * freqOptionDimension}
										/>

										<ReanimatedCircle
											animatedProps={sunAnimProps}
											cx="50%"
											cy="100%"
											r={freqOptionSunPerc + "%"}
											strokeWidth={GLOBAL.ui.inputBorderWidth}
										/>

										<ReanimatedSvgText
											animatedProps={textAnimProps}
											fontFamily="Trickster-Reg-Semi"
											fontSize={freqOptionsTextSize}
											letterSpacing="0"
											textAnchor="middle"
										>
											<TextPath href="#sun-text2" startOffset="75%">
												<TSpan>{option.text.split(" ")[0]}</TSpan>
											</TextPath>
										</ReanimatedSvgText>

										<ReanimatedSvgText
											animatedProps={textAnimProps}
											fontFamily="Trickster-Reg-Semi"
											fontSize={freqOptionsTextSize}
											letterSpacing="0"
											textAnchor="middle"
										>
											<TextPath href="#sun-text1" startOffset="75%">
												<TSpan>{option.text.split(" ")[1]}</TSpan>
											</TextPath>
										</ReanimatedSvgText>
									</Svg>

									<Svg
										style={[
											styles.freqOptionArrowSvg,
											{ transform: [{ rotate: i === 1 ? "180deg" : "0deg" }] },
										]}
										viewBox="0 0 100 100"
									>
										<ReanimatedPath
											animatedProps={arrowAnimProps}
											d="M 49.998914,20 C 42.801816,30.336846 34.037386,39.0994 23.700394,46.296352 l 4.709794,4.711962 C 33.735076,43.360168 39.9215,36.576691 46.965304,30.649078 48.879531,47.100804 48.783272,63.547761 46.668232,80 h 6.661366 c -2.115042,-16.452239 -2.2113,-32.899196 -0.297074,-49.350922 7.04391,5.927628 13.230081,12.71088 18.555116,20.359236 l 4.711966,-4.711962 C 65.96261,39.099398 57.196012,30.336846 49.998914,20 Z"
										/>
									</Svg>
								</ReanimatedPressable>
							);
						})}
					</View>

					<Text style={[styles.subtitle, { color: subTitleColor }]}>
						When do you want to be reminded?
					</Text>
					<View style={styles.notifReminderContainer}>
						{notifReminderOptions.map((option, o) => (
							<View
								key={`notif-reminder-${o}`}
								style={[
									styles.notifReminderRow,
									{ marginTop: o > 0 ? GLOBAL.screen.horizOffset : 0 },
								]}
							>
								<Text
									style={[
										styles.notifReminderTitle,
										{
											color: NotifReminders[o]
												? GLOBAL.ui.palette[0]
												: inputOffColor,
											textDecorationLine: NotifReminders[o]
												? "none"
												: "line-through",
										},
									]}
								>
									{option.title}
								</Text>

								<Switch
									thumbColor={GLOBAL.ui.palette[0]}
									trackColor={{ false: ActiveBody?.palette[3], true: ActiveBody?.palette[1] }}
									ios_backgroundColor={GLOBAL.ui.palette[1]}
									value={NotifReminders[o]}
									onValueChange={() => {
										ToggleNotifReminder(o);
										WriteNewSaveToFile(); //^ Save write
										ScheduleNotifs();
									}}
								/>
							</View>
						))}
					</View>

					<Text style={[styles.subtitle, { color: subTitleColor }]}>
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
						{timeFormatOptions.map((formatOption, f) => (
							<Pressable
								key={`time-format-option-handle${f}`}
								style={{
									position: "absolute",
									top: GLOBAL.ui.inputBorderWidth,
									left: (f == 0) ? GLOBAL.ui.inputBorderWidth : timeFormatContainerWidth / 2,
									justifyContent: "center",
									alignItems: "center",
									width: (timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2,
									height: timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth),
									backgroundColor: (timeFormatPressed == f) ? ActiveBody!.palette[0] + "22" : "transparent",
									borderRadius: timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth,
								}}
								onPressIn={() => {
									if (f === (IsFormat24Hour ? 0 : 1)) setTimeFormatPressed(f);
								}}
								onPress={() => {
									SetIsFormat24Hour(f == 1);
									WriteNewSaveToFile(); //^ Save write
								}}
								onPressOut={() => {
									setTimeFormatPressed(null);
								}}
							></Pressable>
						))}

						<View
							style={{
								position: "absolute",
								width: "100%",
								height: "100%",
								borderWidth: GLOBAL.ui.inputBorderWidth,
								borderColor: GLOBAL.ui.palette[0],
								borderRadius: timeFormatContainerBorderRadius,
							}}
							pointerEvents="none"
						></View>

						<ReanimatedSvg
							style={[
								{
									position: "absolute",
									top: GLOBAL.ui.inputBorderWidth,
								},
								timeFormatAnimSvgStyle
							]}
							width={(timeFormatContainerWidth / 2) - GLOBAL.ui.inputBorderWidth}
							height={timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth)}
							viewBox={`0 0
								${(timeFormatContainerWidth / 2) - GLOBAL.ui.inputBorderWidth}
								${timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth)}
							`}
						>
							<Defs>
								<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
									<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
									<Stop offset="100%" stopColor="white" stopOpacity="0" />
								</LinearGradient>

								<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
									gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * ((timeFormatContainerWidth / 2) - GLOBAL.ui.inputBorderWidth)}, 0)`}
								>
									<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
									<Stop offset="100%" stopColor="white" stopOpacity="0" />
								</RadialGradient>
							</Defs>

							<Rect
								fill={btnBgColor}
								x={0}
								y={0}
								width={(timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2}
								height="100%"
								rx={timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth}
							/>

							<Rect
								fill="url(#bottom-blob)"
								x={0}
								y={0}
								width={(timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2}
								height="100%"
								rx={timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth}
							/>

							<Rect
								fill="url(#top-blob)"
								x={0}
								y={0}
								width={(timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2}
								height={2 * (timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth)}
								rx={timeFormatContainerBorderRadius - GLOBAL.ui.inputBorderWidth}
							/>
						</ReanimatedSvg>

						{timeFormatOptions.map((formatOption, f) => {
							const timeFormatTextAnimStyle = useAnimatedStyle(() => {
								return {
									color: interpolateColor(
										f ? timeFormatProgress.value : 1 - timeFormatProgress.value,
										[0, 1],
										[inputOffColor!, GLOBAL.ui.palette[0]]
									)
								}
							});

							return (
								<View
									key={`time-format-option-text${f}`}
									style={{
										position: "absolute",
										top: GLOBAL.ui.inputBorderWidth,
										left: (f == 0) ? GLOBAL.ui.inputBorderWidth : timeFormatContainerWidth / 2,
										justifyContent: "center",
										alignItems: "center",
										width: (timeFormatContainerWidth - (2 * GLOBAL.ui.inputBorderWidth)) / 2,
										height: timeFormatContainerHeight - (2 * GLOBAL.ui.inputBorderWidth),
									}}
									pointerEvents="none"
								>
									<Reanimated.Text
										style={[
											{
												fontFamily: "Trickster-Reg-Semi",
												fontSize: GLOBAL.ui.bodyTextSize,
											},
											GLOBAL.ui.btnShadowStyle(),
											timeFormatTextAnimStyle
										]}
									>{formatOption.title}</Reanimated.Text>

									<Reanimated.Text
										style={[
											{
												fontFamily: "Trickster-Reg-Semi",
												fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
											},
											GLOBAL.ui.btnShadowStyle(),
											timeFormatTextAnimStyle
										]}
									>{formatOption.subtitle}</Reanimated.Text>
								</View>
							);
						})}
					</View>

					<Text style={[styles.subtitle, { color: subTitleColor }]}>
						This app was brought to you in part by:
					</Text>
					<View style={[styles.creditContainer, { borderColor: inputOffColor }]}>
						{credits.map((credit, c) => (
							<View
								key={`credit${c}`}
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									width: "100%",
									marginTop: c > 0 ? GLOBAL.screen.horizOffset : 0,
								}}
							>
								<Text style={{
									fontFamily: "Trickster-Reg-Semi",
									fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
									color: inputOffColor,
								}}>{credit.name}</Text>

								<View style={{
									flex: 1,
									height: GLOBAL.ui.inputBorderWidth / 2,
									marginLeft: GLOBAL.screen.horizOffset,
									marginRight: -1,
									backgroundColor: inputOffColor,
									borderTopLeftRadius: 999,
									borderBottomLeftRadius: 999,
								}}></View>

								<View style={{
									flexDirection: "row",
									alignItems: "center"
								}}>
									<CurlyBracket
										width={GLOBAL.ui.bodyTextSize / 2}
										height={credit.jobs.length * GLOBAL.ui.bodyTextSize}
										strokeColor={inputOffColor}
										direction="right"
									/>

									<View style={{
										alignItems: "center",
										marginHorizontal: GLOBAL.screen.horizOffset / 2,
									}}>
										{credit.jobs.map((job, j) => (
											<Text
												key={`credit${c}-job${j}`}
												style={{
													fontFamily: "Trickster-Reg-Semi",
													fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
													color: inputOffColor,
												}}
											>{job}</Text>
										))}
									</View>

									<CurlyBracket
										width={GLOBAL.ui.bodyTextSize / 2}
										height={credit.jobs.length * GLOBAL.ui.bodyTextSize}
										strokeColor={inputOffColor}
										direction="left"
									/>
								</View>
							</View>
						))}
					</View>

					{/* <Text style={[styles.subtitle, { color: subTitleColor }]}>
						This app was NOT brought to you by:
					</Text>
					<View style={[styles.creditContainer, { borderColor: inputOffColor }]}>
						<Text style={{
							fontFamily: "Trickster-Reg-Semi",
							fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
							color: inputOffColor,
						}}>Artificial Intelligence</Text>
					</View> */}

					<RectBtn
						style={{ marginTop: (2.5 * GLOBAL.screen.horizOffset) + (0.6 * GLOBAL.ui.bodyTextSize) }}
						text="Restore all settings to default"
						width={restoreBtnWidth}
						height={restoreBtnHeight}
						borderRadius={restoreBtnBorderRadius}
						isPressed={isRestoreBtnPressed}
						isActive={isRestoreBtnActive}
						color={btnBgColor}
						pressedColor={ActiveBody?.palette[3]}
						onPressIn={() => {
							setIsRestoreBtnPressed(true);
						}}
						onPress={() => {
							setIsRestoreBtnActive(true);
							Alert.alert(
								"Do you want to restore all settings to default?",
								"This includes saved locations and your current planet/moon of choice.",
								[
									{
										text: GLOBAL.ui.alertNo,
										style: "cancel",
										onPress: () => {
											setIsRestoreBtnActive(false);
										}
									},
									{
										text: GLOBAL.ui.alertYes,
										style: "destructive",
										onPress: () => {
											WriteDefaultSaveToFile(); //^ Save write
											LoadSave();
											SetNeedsToGeolocate(true);
											setIsRestoreBtnActive(false);
										}
									},
								]
							);
						}}
						onPressOut={() => {
							setIsRestoreBtnPressed(false);
						}}
					/>

					{/* <RectBtn
						style={{ marginTop: 2 * GLOBAL.ui.inputBorderWidth }}
						text="Reset permissions"
						width={restoreBtnWidth}
						height={restoreBtnHeight}
						borderRadius={restoreBtnBorderRadius}
						isPressed={isPermBtnPressed}
						isActive={isPermBtnActive}
						color={btnBgColor}
						pressedColor={ActiveBody?.palette[3]}
						onPressIn={() => {
							setIsPermBtnPressed(true);
						}}
						onPress={() => {
							SetPromptCompleted(0, false);
							SetPromptCompleted(1, false);
						}}
						onPressOut={() => {
							setIsPermBtnPressed(false);
						}}
					/> */}

					<View style={styles.settingsScrollSpacer}></View>
				</View>

				<Svg
					style={styles.kilroy}
					width={kilroyWidth}
					height={kilroyHeight}
					viewBox="0 0 100 50"
				>
					<Path
						fill={inputOffColor}
						d="M 48.572512,2.9189013 C 39.362595,2.9339673 34.22749,8.3718661 31.548098,13.700152 28.917168,18.932063 28.51657,24.076556 28.502688,24.26314 H 24.327883 C 23.901017,23.13364 22.890774,22.266928 21.677981,21.676226 20.146149,20.930135 18.218196,20.537903 16.260988,20.46773 14.303781,20.39756 12.319666,20.650795 10.677004,21.292437 9.1608352,21.88467 7.8802722,22.852718 7.3825705,24.26314 H 0.749758 a 0.75,0.75 0 0 0 -0.75,0.75 0.75,0.75 0 0 0 0.75,0.75 h 6.3208008 c -0.148944,1.256678 -0.040717,2.434517 0.1933594,3.394043 0.1518914,0.622626 0.3527919,1.152763 0.5976562,1.577637 0.2448645,0.424875 0.4817272,0.838723 1.1147461,0.943359 0.38642,0.06387 0.778995,-0.04172 1.0737305,-0.222656 0.294736,-0.180939 0.514691,-0.420797 0.703125,-0.682617 0.217783,-0.302599 0.338415,-0.677206 0.492187,-1.029785 0.166546,0.758466 0.370884,1.529774 0.685547,2.181152 0.335826,0.695187 0.8263,1.39103 1.69043,1.480957 0.432692,0.04503 0.869003,-0.08096 1.195313,-0.309082 0.32631,-0.228122 0.55467,-0.532912 0.733886,-0.858398 0.170705,-0.310027 0.21309,-0.687548 0.316407,-1.03711 0.157696,0.461163 0.282953,0.946263 0.509765,1.343262 0.382122,0.668842 0.956268,1.325574 1.828125,1.328613 0.444023,0.0015 0.86274,-0.18982 1.161621,-0.454101 0.298883,-0.264282 0.506557,-0.588873 0.672364,-0.938965 0.231332,-0.488444 0.324343,-1.067042 0.437988,-1.630371 0.03516,0.07212 0.05027,0.155903 0.08789,0.225586 0.287367,0.532292 0.639564,1.062231 1.31836,1.250976 0.338767,0.0942 0.719645,0.07475 1.037109,-0.06299 0.317464,-0.137738 0.556688,-0.367911 0.738281,-0.619629 0.363188,-0.503433 0.55014,-1.120131 0.688477,-1.816406 0.243069,-1.223401 0.289423,-2.705782 0.224121,-4.063477 h 19.508789 c -0.0418,1.970642 -0.140635,4.169886 -0.361816,6.089356 -0.42973,3.729299 -0.08583,7.505304 1.136718,10.40625 0.611274,1.450472 1.450435,2.688938 2.559083,3.558105 1.108648,0.869168 2.495742,1.341603 4.056152,1.253906 1.85223,-0.104097 3.300629,-0.638951 4.328613,-1.577636 1.027984,-0.938685 1.591463,-2.23488 1.835449,-3.703125 0.487973,-2.936493 -0.198661,-6.662837 -1.125,-10.746094 -0.450766,-1.986953 -0.823906,-3.713638 -1.157226,-5.280762 h 19.662597 c 0.06366,1.285252 0.354864,2.63843 0.792481,3.780762 0.28738,0.750162 0.62942,1.407981 1.086914,1.908691 0.457495,0.500711 1.167277,0.88405 1.896973,0.681153 0.731588,-0.203425 1.039715,-0.827134 1.252441,-1.413574 0.01711,-0.04717 0.01632,-0.104218 0.03223,-0.152344 0.186771,0.555148 0.349961,1.130538 0.626953,1.601074 0.415838,0.706398 1.03346,1.381554 1.939453,1.378418 0.447953,-0.0016 0.86149,-0.220872 1.139648,-0.498047 0.278159,-0.277174 0.462785,-0.606626 0.615235,-0.963867 0.236878,-0.555084 0.345844,-1.215064 0.457031,-1.863281 0.168105,0.413894 0.312097,0.85255 0.528809,1.201172 0.18235,0.293345 0.382167,0.558532 0.65625,0.774902 0.274083,0.216369 0.676678,0.387174 1.100097,0.322266 0.844294,-0.129427 1.370404,-0.830408 1.637695,-1.524903 0.214885,-0.55833 0.275416,-1.186423 0.33252,-1.803222 0.152853,0.228352 0.264399,0.483619 0.451172,0.681152 0.429369,0.454106 1.050123,0.85986 1.785644,0.738281 0.482637,-0.07978 0.80636,-0.385796 1.057618,-0.751465 0.251257,-0.365667 0.437146,-0.827376 0.55664,-1.387207 0.156226,-0.731913 0.192583,-1.638452 0.04687,-2.709961 h 6.243164 a 0.75,0.75 0 0 0 0.749996,-0.75 0.75,0.75 0 0 0 -0.749996,-0.75 h -6.500976 a 0.75,0.75 0 0 0 -0.04541,0.0059 c -0.0303,-0.115349 -0.05661,-0.227376 -0.09082,-0.345703 -0.459875,-1.590527 -1.870084,-2.643054 -3.549316,-3.273926 -1.679231,-0.630873 -3.69422,-0.879636 -5.677735,-0.807129 -1.983515,0.07251 -3.929907,0.46477 -5.475585,1.209961 -1.441174,0.694809 -2.603355,1.768287 -2.847657,3.210937 H 70.660891 C 70.484038,23.151232 69.649256,18.62301 66.929934,13.864215 63.822815,8.426774 58.180735,2.9031836 48.572512,2.9189013 Z m 0.0015,1.5 c 9.040009,-0.014788 14.109989,5.0405224 17.052246,10.1894537 2.396092,4.193146 3.262029,8.238459 3.512695,9.654785 H 55.24927 a 0.74999499,0.74999499 0 0 0 -0.205078,0.04102 c -0.548925,-2.63017 -0.886231,-4.365234 -0.886231,-4.365234 a 0.75,0.75 0 0 0 -0.877441,-0.596192 0.75,0.75 0 0 0 -0.594727,0.877442 c 0,0 0.899244,4.711453 2.361328,11.15625 0.916539,4.040057 1.521484,7.675765 1.107422,10.16748 -0.207031,1.245858 -0.642929,2.179563 -1.368164,2.841797 -0.725234,0.662234 -1.786063,1.098753 -3.399902,1.189453 -1.221722,0.06866 -2.19887,-0.271525 -3.04834,-0.9375 -0.849471,-0.665975 -1.561712,-1.684702 -2.100586,-2.963379 -1.077747,-2.557353 -1.433939,-6.130335 -1.02832,-9.650391 0.580522,-5.037914 0.363281,-11.762695 0.363281,-11.762695 a 0.75,0.75 0 0 0 -0.773438,-0.726562 0.75,0.75 0 0 0 -0.726562,0.773437 c 0,0 0.05082,1.674983 0.03223,3.955078 H 30.011477 c 0.03945,-0.466098 0.477976,-5.118515 2.876953,-9.88916 2.524991,-5.0212409 7.055274,-9.9409606 15.685547,-9.9550787 z m -4.208496,9.2944347 a 1.05,1.05 0 0 0 -1.050293,1.048828 1.05,1.05 0 0 0 1.050293,1.050293 1.05,1.05 0 0 0 1.050293,-1.050293 1.05,1.05 0 0 0 -1.050293,-1.048828 z m 9.172851,0 a 1.05,1.05 0 0 0 -1.050293,1.048828 1.05,1.05 0 0 0 1.050293,1.050293 1.05,1.05 0 0 0 1.048828,-1.050293 1.05,1.05 0 0 0 -1.048828,-1.048828 z m 30.584473,7.617187 c 1.591395,0.0095 3.166369,0.255068 4.413574,0.723633 1.425378,0.535501 2.356784,1.323506 2.635254,2.286621 0.496972,1.718825 0.49589,3.006882 0.322266,3.820313 -0.08681,0.406715 -0.219995,0.694372 -0.326661,0.849609 -0.04911,0.07147 -0.08814,0.104611 -0.108398,0.120117 -0.07226,-0.008 -0.197125,-0.06482 -0.408691,-0.288574 -0.256977,-0.271781 -0.545137,-0.728944 -0.785157,-1.208496 -0.480039,-0.959106 -0.786621,-1.979004 -0.786621,-1.979004 a 0.750075,0.750075 0 0 0 -1.463379,0.303223 c 0,0 0.156189,1.355066 0.07764,2.708496 -0.03928,0.676714 -0.146193,1.349244 -0.316406,1.791504 -0.157152,0.408324 -0.287715,0.498528 -0.429199,0.534667 -0.06554,-0.05705 -0.17136,-0.171789 -0.288575,-0.360351 -0.252046,-0.405465 -0.524352,-1.051116 -0.74707,-1.710938 -0.445435,-1.319641 -0.726562,-2.693847 -0.726562,-2.693847 a 0.750075,0.750075 0 0 0 -1.483887,0.156738 c 0,0 0.01009,1.566128 -0.200684,3.099609 -0.105402,0.766741 -0.274449,1.523061 -0.483398,2.012696 -0.104474,0.244817 -0.219434,0.415988 -0.294434,0.490722 -0.075,0.07473 -0.06973,0.06 -0.08643,0.06006 -0.105207,3.64e-4 -0.342393,-0.132883 -0.640136,-0.638672 -0.297745,-0.505787 -0.576282,-1.268026 -0.789551,-2.041992 -0.426537,-1.547934 -0.616699,-3.127442 -0.616699,-3.127441 a 0.750075,0.750075 0 0 0 -1.494141,0.09814 c 0,0 0.0093,1.141839 -0.133301,2.304199 -0.07132,0.581181 -0.184196,1.165099 -0.329589,1.565918 -0.127219,0.350718 -0.278338,0.472967 -0.262208,0.483399 -0.0618,0.0137 -0.137745,0.0028 -0.36914,-0.250489 -0.252431,-0.276275 -0.549789,-0.796748 -0.793945,-1.434082 -0.488313,-1.274667 -0.78178,-3.019653 -0.688477,-4.315429 0.06474,-0.899078 0.762096,-1.671032 2.041992,-2.288086 1.279896,-0.617055 3.064022,-0.995597 4.88086,-1.062012 0.227104,-0.0083 0.45381,-0.01161 0.681152,-0.01025 z m -68.586949,0.628418 c 0.223431,-0.0017 0.447496,7.79e-4 0.670898,0.0088 1.787216,0.06408 3.549742,0.439926 4.814942,1.056152 1.2652,0.616226 1.956536,1.389035 2.021484,2.291016 0.100351,1.393663 0.06459,3.056087 -0.166992,4.22168 -0.115791,0.582797 -0.296377,1.035305 -0.435059,1.227539 -0.06934,0.09612 -0.113203,0.121318 -0.117187,0.123047 -0.004,0.0017 0.0179,0.0091 -0.04102,-0.0073 0.02457,0.0068 -0.195527,-0.139771 -0.398437,-0.515625 -0.202911,-0.375854 -0.397608,-0.909673 -0.552246,-1.439942 -0.309277,-1.060535 -0.46875,-2.097656 -0.46875,-2.097656 a 0.750075,0.750075 0 0 0 -1.491211,0.127441 c 0,0 0.02385,1.503781 -0.19043,2.970703 -0.107139,0.733462 -0.284003,1.453494 -0.500977,1.911621 -0.108488,0.229063 -0.223828,0.387168 -0.306152,0.459961 -0.08232,0.07279 -0.102485,0.07639 -0.164062,0.07617 -0.05745,-2e-4 -0.265428,-0.104055 -0.533204,-0.572754 -0.26777,-0.46873 -0.518681,-1.181365 -0.710445,-1.904329 -0.383527,-1.445928 -0.550781,-2.922363 -0.550781,-2.922364 a 0.750075,0.750075 0 0 0 -1.494141,0.102539 c 0,0 0.02531,1.407393 -0.190429,2.745117 -0.107874,0.668863 -0.286526,1.314524 -0.495118,1.69336 -0.104295,0.189418 -0.210693,0.30326 -0.279785,0.351562 -0.06909,0.0483 -0.08857,0.05657 -0.18164,0.04687 -0.02337,-0.0024 -0.2509,-0.137619 -0.493653,-0.640136 -0.242752,-0.502519 -0.456848,-1.242247 -0.613769,-1.984864 -0.313844,-1.485234 -0.42041,-2.976562 -0.42041,-2.976562 a 0.750075,0.750075 0 0 0 -1.488282,-0.07178 c 0,0 -0.198516,1.166872 -0.574218,2.267578 -0.1878521,0.550352 -0.4248215,1.079324 -0.6474613,1.388672 -0.097703,0.135754 -0.1865738,0.216811 -0.2446289,0.259277 -0.037896,-0.03626 -0.082778,-0.08441 -0.1303711,-0.166992 C 9.0151207,29.732278 8.8446181,29.312158 8.7199728,28.801218 8.4706824,27.77934 8.3870113,26.385222 8.7302268,24.980906 8.9681455,24.007426 9.8421425,23.22885 11.221926,22.68989 c 1.207311,-0.471589 2.74995,-0.71909 4.313965,-0.730957 z m -6.3149416,8.239746 c 0.00475,7.85e-4 0.00432,7.09e-4 0.00879,0.0015 -0.00417,0.0018 -0.00268,-4.56e-4 -0.00879,-0.0015 z"
					/>
				</Svg>
			</ScrollView>

			<SlotTopShadow style={{ opacity: Math.min(Math.max(scrollPosition / 100, 0), 1) }} />
			<SlotBottomShadow />
		</View>
	);
}
