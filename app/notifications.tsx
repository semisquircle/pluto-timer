import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Circle, Defs, Path, RadialGradient, Rect, Stop, Svg, Text as SvgText, TextPath, TSpan } from "react-native-svg";
import * as GLOBAL from "../ref/global";


export default function NotificationsScreen() {
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

	const NotifFreqs = GLOBAL.useAppStore((state) => state.notifFreqs);
	const SetNotifFreq = GLOBAL.useAppStore((state) => state.setNotifFreq);

	const NotifReminders = GLOBAL.useAppStore((state) => state.notifReminders);
	const ToggleNotifReminder = GLOBAL.useAppStore((state) => state.toggleNotifReminder);


	//! Hacky fix
	const [renderKey, setRenderKey] = useState<string>("");
	useEffect(() => {
		const r = (Math.random() + 1).toString(36).substring(7);
		setRenderKey(r);
	}, [ActiveTab]);


	//* Notif styles
	const notifOffColor = ActiveBody?.colors[3];


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


	//* Notif reminders
	const notifReminderOptions = [
		{ title: `Exactly at ${ActiveBody?.name} Time` },
		{ title: "5 minutes before" },
		{ title: "10 minutes before" },
	];


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
			fontSize: GLOBAL.ui.bodyTextSize,
			marginBottom: GLOBAL.screen.borderWidth,
			color: ActiveBody?.colors[1],
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
	});


	//* Components
	return (
		<View key={`render-${renderKey}`} style={styles.content}>
			<View style={[styles.skewContainer, GLOBAL.ui.skewStyle]}>
				<Text style={styles.title}>Notifications</Text>

				<Text style={[styles.subtitle, {marginTop: GLOBAL.screen.borderWidth}]}>When do you want to be notified?</Text>
				<View style={styles.freqOptionContainer}>
					{notifFreqOptions.map((option, i) => (
						<Pressable
							key={`freq-option-${i}`}
							style={[
								styles.freqOption,
								{ borderColor: (NotifFreqs[i]) ? GLOBAL.ui.colors[0] : notifOffColor }
							]}
							onPress={() => {
								SetNotifFreq(i);
							}}
						>
							<Svg style={styles.freqOptionSvg} viewBox={`0 0 ${freqOptionDimension} ${freqOptionDimension}`}>
								<Defs>
									<RadialGradient id="sun-gradient" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
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
										r={freqOptionSunPerc / 100 * freqOptionDimension + freqOptionTextOffset}
										fill="transparent"
									/>
									<Circle
										id="sun-text2"
										cx="50%"
										cy="100%"
										r={freqOptionSunPerc / 100 * freqOptionDimension + freqOptionTextOffset + freqOptionsTextSize - 3}
										fill="transparent"
									/>
								</Defs>

								<Rect
									x={-freqOptionDimension / 2}
									y="0"
									width={2 * freqOptionDimension}
									height={2 * freqOptionDimension} fill={NotifFreqs[i] ? "url(#sun-gradient)" : "transparent"}
								/>

								<Circle
									cx="50%"
									cy="100%"
									r={freqOptionSunPerc + "%"}
									fill={NotifFreqs[i] ? option.colors[0] : "transparent"}
									strokeWidth={NotifFreqs[i] ? 0 : GLOBAL.ui.inputBorderWidth}
									stroke={NotifFreqs[i] ? GLOBAL.ui.colors[0] : notifOffColor}
								/>

								<SvgText
									fill={NotifFreqs[i] ? option.colors[0] : notifOffColor}
									fontFamily="Trickster-Reg"
									fontSize={freqOptionsTextSize}
									letterSpacing="0"
									textAnchor="middle"
								>
									<TextPath href="#sun-text2" startOffset="75%">
										<TSpan>{option.text.split(" ")[0]}</TSpan>
									</TextPath>
								</SvgText>

								<SvgText
									fill={NotifFreqs[i] ? option.colors[0] : notifOffColor}
									fontFamily="Trickster-Reg"
									fontSize={freqOptionsTextSize}
									letterSpacing="0"
									textAnchor="middle"
								>
									<TextPath href="#sun-text1" startOffset="75%">
										<TSpan>{option.text.split(" ")[1]}</TSpan>
									</TextPath>
								</SvgText>
							</Svg>

							<Svg
								style={[
									styles.freqOptionArrowSvg,
									{ transform: [{rotate: (i == 1) ? "180deg" : "0deg"}] }
								]}
								viewBox="0 0 100 100"
							>
								<Path
									fill={NotifFreqs[i] ? option.colors[2] : notifOffColor}
									d="M 49.998914,20 C 42.801816,30.336846 34.037386,39.0994 23.700394,46.296352 l 4.709794,4.711962 C 33.735076,43.360168 39.9215,36.576691 46.965304,30.649078 48.879531,47.100804 48.783272,63.547761 46.668232,80 h 6.661366 c -2.115042,-16.452239 -2.2113,-32.899196 -0.297074,-49.350922 7.04391,5.927628 13.230081,12.71088 18.555116,20.359236 l 4.711966,-4.711962 C 65.96261,39.099398 57.196012,30.336846 49.998914,20 Z"
								/>
							</Svg>
						</Pressable>
					))}
				</View>

				<Text style={[styles.subtitle, {marginTop: 2.5 * GLOBAL.screen.borderWidth}]}>When do you want to be reminded?</Text>
				<View style={styles.notifReminderContainer}>
					{notifReminderOptions.map((option, i) => (
						<View
							key={`notif-reminder-${i}`}
							style={[
								styles.notifReminderRow,
								{ marginTop: (i > 0) ? GLOBAL.screen.borderWidth : 0 }
							]}
						>
							<Text style={[
								styles.notifReminderTitle,
								{
									color: NotifReminders[i] ? GLOBAL.ui.colors[0] : notifOffColor,
									textDecorationLine: NotifReminders[i] ? "none" : "line-through",
								}
							]}>{option.title}</Text>

							<Switch
								trackColor={{false: notifOffColor, true: ActiveBody?.colors[2]}}
								ios_backgroundColor={ActiveBody?.colors[4]}
								thumbColor={NotifReminders[i] ? GLOBAL.ui.colors[0] : GLOBAL.ui.colors[1]}
								value={NotifReminders[i]}
								onValueChange={() => {
									ToggleNotifReminder(i);
								}}
							/>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}
