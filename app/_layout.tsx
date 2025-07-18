import MaskedView from "@react-native-masked-view/masked-view";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";
import { Ellipse, Path, Rect, Svg } from "react-native-svg";
import * as GLOBAL from "../global";
import HomeScreen from "./";
import BodiesScreen from "./bodies";
import CreditsScreen from "./credits";
import LocationScreen from "./location";
import NotificationsScreen from "./notifications";


export default function Layout() {
	//* Body-ody-ody
	const body = GLOBAL.useBodyStore((s: any) => s.body);


	//* Tabs/navigation
	// Tab 3 (index 2) is pressed by default
	const [activeTab, setActiveTab] = useState(2);

	const tabArray: {
		key: string;
		d: string,
		unpressedSrc: any,
		pressedSrc: any,
		iconPath: string,
		iconStyle: any
	}[] = [
		{
			key: "notifications",
			d: "M 0,8.6997083 V 28.832031 a 6.0341302,6.0341302 60.471038 0 0 3.0016755,5.299192 c 0.7340472,0.413334 1.4556421,0.799895 2.1772528,1.169136 A 4.8517531,4.8517531 170.32776 0 0 10.808253,34.340928 L 21.399266,23.748916 A 2.1837593,2.1837593 76.751917 0 0 20.555188,20.163708 C 12.215703,17.126433 6.043082,12.90318 2.7372649,8.1176594 A 1.4656771,1.4656771 167.99549 0 0 0,8.6997083 Z",
			unpressedSrc: require("../assets/images/tabs/unpressed/1.png"),
			pressedSrc: require("../assets/images/tabs/pressed/1.png"),
			iconPath: "m 50.000001,12.68165 c -11.428813,0 -22.856793,4.763497 -24.075867,14.292055 2.438147,4.559288 2.438147,9.121779 0,13.681066 2.438147,14.918982 -6.239102,26.545348 -16.7631342,24.91179 v 4.900681 c 0.00368,-5.06e-4 0.00745,-0.0011 0.01116,-0.0016 l -0.01116,0.0048 c 8.0554682,3.007598 17.4339852,4.982751 27.2265312,5.926442 2.393491,14.561955 24.833044,14.561955 27.226533,0 h -0.01435 C 73.397467,75.453055 82.779579,73.476293 90.839,70.46725 V 65.566568 C 80.31496,67.200126 71.639315,55.57376 74.077461,40.654778 71.639315,36.095491 71.639315,31.533 74.077461,26.973712 72.85839,17.445147 61.428813,12.68165 50.000001,12.68165 Z m 0,1.22517 c 8.990665,0 17.982207,4.355106 16.763133,13.066885 2.438148,4.559288 2.438148,9.121779 0,13.681066 1.853619,11.635772 7.854162,21.862108 15.909663,26.816547 -17.450933,9.964537 -47.895142,9.966454 -65.345593,0.0016 8.057799,-4.953736 14.057405,-15.18091 15.911258,-26.818142 -2.438147,-4.559286 -2.438147,-9.121778 0,-13.681065 -1.219073,-8.71178 7.770872,-13.066885 16.761539,-13.066885 z m -6.518288,62.984588 c 4.334372,0.196051 8.7038,0.196375 13.038171,0 1.798418,11.507799 -14.836589,11.507799 -13.038171,0 z",
			iconStyle: {
				marginRight: 0.835 * GLOBAL.slotWidth,
				marginTop: 0.03 * GLOBAL.slotWidth,
			},
		},
		{
			key: "location",
			d: "M 24.155871,24.527982 13.273816,35.40903 a 2.2669981,2.2669981 78.116782 0 0 0.787363,3.741733 c 5.509412,2.006864 11.376399,3.491002 17.535694,4.46161 a 3.9185186,3.9185186 146.50772 0 0 4.371435,-2.892543 l 3.447173,-12.865929 a 3.0496522,3.0496522 55.836965 0 0 -2.570295,-3.787328 c -2.325211,-0.316134 -4.601607,-0.71589 -6.811367,-1.196117 a 6.3730887,6.3730887 164.25205 0 0 -5.877948,1.657526 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/2.png"),
			pressedSrc: require("../assets/images/tabs/pressed/2.png"),
			iconPath: "m 49.999512,11.67627 c -19.860104,0 -39.719498,12.776241 -40.8383792,38.324707 2.2377592,51.096923 79.4404652,51.096923 81.6782222,0 C 89.720477,24.452511 69.859603,11.67627 49.999512,11.67627 Z m 0,1.67871 c 17.622345,0 35.245344,12.21641 34.126465,36.645997 2.237759,48.859166 -70.489224,48.859166 -68.251465,0 C 14.755633,25.57139 32.377167,13.35498 49.999512,13.35498 Z m -0.169922,6.424805 c -14.408295,2.13889 -23.644395,18.133925 -18.292969,31.681641 6.048792,8.003106 11.474766,16.367692 16.286133,25.085449 0.01568,0.02836 0.02986,0.0566 0.04541,0.08496 0.644337,1.168762 1.27633,2.344312 1.898438,3.525879 0.01141,0.02096 0.02271,0.04203 0.03369,0.06299 0.614548,-1.189254 1.243032,-2.371908 1.87793,-3.550781 0.01141,-0.02139 0.02214,-0.04455 0.03369,-0.06592 5.251311,-9.743403 11.19661,-19.134631 17.874026,-28.224608 2.52323,-13.192627 -6.76844,-26.46072 -19.756348,-28.59961 z m 2.443359,6.161133 c 0.264368,-0.007 0.527331,-0.0066 0.786621,0 10.02599,0.251071 16.099246,10.51282 10.681641,19.731445 -4.023368,9.509963 -8.69816,18.74956 -13.990723,27.679688 C 44.98676,65.299788 40.765663,56.934541 37.092773,48.253418 28.654189,37.914041 36.657851,24.056906 49.82959,26.195801 c 0.835083,-0.150392 1.650241,-0.233862 2.443359,-0.254883 z m -2.271972,5.938477 c -4.651678,0 -9.303109,2.654705 -10.372559,7.964355 2.1389,10.623458 18.604753,10.623458 20.743652,0 -1.06945,-5.30965 -5.719415,-7.964355 -10.371093,-7.964355 z m 0,1.604003 c 2.512779,0 5.023063,2.120151 3.953613,6.360352 2.1389,8.484562 -10.049041,8.484562 -7.910156,0 -1.069437,-4.2402 1.443764,-6.360351 3.956543,-6.360352 z",
			iconStyle: {
				marginRight: 0.44 * GLOBAL.slotWidth,
				marginTop: 0.21 * GLOBAL.slotWidth,
			},
		},
		{
			key: "home",
			d: "m 41.937855,28.104366 -3.455788,12.896737 a 2.9156414,2.9156414 54.971313 0 0 2.580977,3.682091 c 5.686593,0.406876 11.777156,0.437362 17.874451,3.51e-4 a 2.9160217,2.9160217 125.02623 0 0 2.581001,-3.682462 L 58.066953,28.119034 A 4.3577235,4.3577235 35.920694 0 0 53.666646,24.93132 c -2.467069,0.09201 -4.900438,0.08811 -7.328812,-0.0074 a 4.3485908,4.3485908 144.13918 0 0 -4.399979,3.180472 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/3.png"),
			pressedSrc: require("../assets/images/tabs/pressed/3.png"),
			iconPath: body?.icon,
			iconStyle: {
				marginTop: 0.26 * GLOBAL.slotWidth,
			},
		},
		{
			key: "bodies",
			d: "m 70.002521,22.908515 c -2.217179,0.483746 -4.501751,0.886424 -6.835687,1.204835 a 3.0508776,3.0508776 124.14844 0 0 -2.56991,3.788837 l 3.435058,12.817696 a 3.9187166,3.9187166 33.490492 0 0 4.371631,2.892476 c 6.158925,-0.970623 12.025173,-2.454901 17.534217,-4.461634 a 2.2670922,2.2670922 101.88487 0 0 0.787491,-3.74181 L 75.879659,24.563253 a 6.366427,6.366427 15.724837 0 0 -5.877138,-1.654738 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/4.png"),
			pressedSrc: require("../assets/images/tabs/pressed/4.png"),
			iconPath: "m 50.000001,11.677794 c -19.860121,0 -39.720281,12.773189 -40.8391605,38.321678 2.2377615,51.096978 79.4405585,51.096978 81.6783185,0 C 89.720279,24.450986 69.860122,11.677794 50.000001,11.677794 Z m -3.273602,1.818182 c 1.012146,11.604823 1.539761,23.210652 1.58654,34.816433 C 37.489512,48.268847 26.666174,47.805778 15.843532,46.922549 16.254985,26.000202 31.019654,14.851551 46.726399,13.495976 Z m 6.547204,0 c 15.706745,1.355575 30.471414,12.504227 30.882867,33.426572 -10.822642,0.883229 -21.64598,1.346238 -32.469407,1.38986 0.04678,-11.605781 0.574394,-23.211607 1.58654,-34.816432 z m -4.960664,38.190558 c -0.04678,11.605781 -0.574394,23.211614 -1.58654,34.816434 -15.707293,-1.355624 -30.472405,-12.50281 -30.882867,-33.426574 10.822642,-0.883229 21.64598,-1.346237 32.469407,-1.38986 z m 3.374124,0 c 10.823427,0.04356 21.646765,0.506631 32.469407,1.38986 C 83.746008,74.000159 68.980896,85.147345 53.273603,86.502968 52.261457,74.898148 51.733842,63.292315 51.687063,51.686534 Z",
			iconStyle: {
				marginLeft: 0.44 * GLOBAL.slotWidth,
				marginTop: 0.21 * GLOBAL.slotWidth,
			},
		},
		{
			key: "credits",
			d: "M 97.283541,8.1239976 C 93.986412,12.916374 87.815388,17.147086 79.471214,20.190175 a 2.1845561,2.1845561 103.23366 0 0 -0.843391,3.58634 l 10.565643,10.564646 a 4.8518307,4.8518307 9.6607333 0 0 5.629007,0.958214 c 0.761292,-0.389487 1.481612,-0.776859 2.176421,-1.167815 a 6.0327796,6.0327796 119.52675 0 0 3.001596,-5.299529 V 8.6997083 A 1.4541498,1.4541498 11.963783 0 0 97.283541,8.1239976 Z",
			unpressedSrc: require("../assets/images/tabs/unpressed/5.png"),
			pressedSrc: require("../assets/images/tabs/pressed/5.png"),
			iconPath: "m 50,10 c -15.074298,2.237759 -24.737761,18.972915 -19.138999,33.146853 1.378208,1.823499 2.726027,3.665452 4.042846,5.524476 -4.338573,-0.278188 -8.677162,-0.670774 -13.015735,-1.188812 v 6.713287 c 5.29647,-0.632415 10.59294,-1.079935 15.88941,-1.354896 3.622981,5.373092 6.998139,10.888521 10.122383,16.549388 -3.620998,5.892997 -7.499323,11.652953 -11.636796,17.266173 l 5.830414,3.326051 C 44.516095,84.288625 47.142885,78.710484 49.97158,73.23645 52.842973,78.694787 55.492692,84.281002 57.910833,90 l 5.817301,-3.356643 C 59.522305,81.078637 55.6054,75.3467 51.971155,69.451486 c 3.047415,-5.65406 6.318844,-11.195813 9.820793,-16.632431 5.43997,0.272464 10.87997,0.7272 16.31994,1.376749 v -6.713287 c -4.540375,0.542134 -9.080705,0.950879 -13.62108,1.230333 1.98964,-2.960484 4.047381,-5.891256 6.177895,-8.791522 C 73.308561,26.118892 63.588259,12.237759 50,10 Z m 3.378484,6.446678 C 63.86792,16.709353 70.22221,27.44442 64.554197,37.089161 62.857734,41.099053 61.045042,45.06153 59.130234,48.977273 53.023008,49.21411 46.915782,49.213512 40.808556,48.975073 39.364155,45.951729 37.985469,42.890074 36.673947,39.790196 27.845274,28.97295 36.219413,14.475564 50,16.713325 c 1.164904,-0.209791 2.293378,-0.293783 3.378484,-0.266609 z M 50,52.517483 c 2.435163,0 4.870325,0.04026 7.305503,0.115826 -2.316487,4.540127 -4.778562,9.013201 -7.386361,13.413462 C 47.326844,61.664876 44.886146,57.195569 42.602704,52.635495 45.068449,52.558025 47.53424,52.51749 50,52.51749 Z",
			iconStyle: {
				marginLeft: 0.835 * GLOBAL.slotWidth,
				marginTop: 0.03 * GLOBAL.slotWidth,
			},
		},
	];

	// Preload tab images on mount
	useEffect(() => {
		const images = tabArray.flatMap(tab => [tab.unpressedSrc, tab.pressedSrc]);
		images.forEach(img => Asset.fromModule(img).downloadAsync());
	}, []);


	//* Fonts
	const [loaded, error] = useFonts({
		"Redaction-Bold": require("../assets/fonts/Redaction/Redaction-Bold.otf"),
		"Redaction-Italic": require("../assets/fonts/Redaction/Redaction-Italic.otf"),
		"Redaction-Regular": require("../assets/fonts/Redaction/Redaction-Regular.otf"),

		"Redaction10-Bold": require("../assets/fonts/Redaction/Redaction10-Bold.otf"),
		"Redaction10-Italic": require("../assets/fonts/Redaction/Redaction10-Italic.otf"),
		"Redaction10-Regular": require("../assets/fonts/Redaction/Redaction10-Regular.otf"),

		"Redaction20-Bold": require("../assets/fonts/Redaction/Redaction20-Bold.otf"),
		"Redaction20-Italic": require("../assets/fonts/Redaction/Redaction20-Italic.otf"),
		"Redaction20-Regular": require("../assets/fonts/Redaction/Redaction20-Regular.otf"),

		"Redaction35-Bold": require("../assets/fonts/Redaction/Redaction35-Bold.otf"),
		"Redaction35-Italic": require("../assets/fonts/Redaction/Redaction35-Italic.otf"),
		"Redaction35-Regular": require("../assets/fonts/Redaction/Redaction35-Regular.otf"),

		"Redaction50-Bold": require("../assets/fonts/Redaction/Redaction50-Bold.otf"),
		"Redaction50-Italic": require("../assets/fonts/Redaction/Redaction50-Italic.otf"),
		"Redaction50-Regular": require("../assets/fonts/Redaction/Redaction50-Regular.otf"),

		"Redaction70-Bold": require("../assets/fonts/Redaction/Redaction70-Bold.otf"),
		"Redaction70-Italic": require("../assets/fonts/Redaction/Redaction70-Italic.otf"),
		"Redaction70-Regular": require("../assets/fonts/Redaction/Redaction70-Regular.otf"),

		"Redaction100-Bold": require("../assets/fonts/Redaction/Redaction100-Bold.otf"),
		"Redaction100-Italic": require("../assets/fonts/Redaction/Redaction100-Italic.otf"),
		"Redaction100-Regular": require("../assets/fonts/Redaction/Redaction100-Regular.otf"),

		"outward-block": require("../assets/fonts/Outward/outward-block.ttf"),
		"outward-semi": require("../assets/fonts/Outward/outward-semi.ttf"),
	});


	//* Stylesheet
	const styles = StyleSheet.create({
		screen: {
			flex: 1,
			alignItems: "center",
			paddingTop: GLOBAL.screenTopOffset + GLOBAL.screenBorderWidth,
		},

		slotView: {
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
		},

		slotMask: {
			flex: 1,
			borderRadius: GLOBAL.screenBorderRadius.ios - GLOBAL.screenBorderWidth,
			borderBottomLeftRadius: 0,
			borderBottomRightRadius: 0,
			overflow: "hidden",
		},

		slotCarousel: {
			flex: 1,
			flexDirection: "row",
			width: 5 * GLOBAL.slotWidth,
			marginLeft: -activeTab * GLOBAL.slotWidth,
		},

		shadow: {
			shadowColor: "black",
			shadowOpacity: 0.9,
			shadowRadius: 4,
			shadowOffset: {width: 0, height: 0},
		},

		tabContainer: {
			position: "absolute",
			bottom: GLOBAL.screenBottomOffset + GLOBAL.screenBorderWidth,
			justifyContent: "center",
			alignItems: "center",
			width: GLOBAL.slotWidth,
			height: GLOBAL.navHeight,
		},

		tabBtnSvg: {
			position: "absolute",
			width: "100%",
			height: "100%",
			pointerEvents: "none",
		},

		tabBtnImage: {
			position: "absolute",
			width: "100%",
			height: "100%",
			pointerEvents: "none",
		},

		tabIconContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			width: "100%",
			height: "100%",
		},

		tabIcon: {
			position: "absolute",
			width: 0.13 * GLOBAL.slotWidth,
			height: 0.13 * GLOBAL.slotWidth,
		},
	});


	//* Components
	return (
		<LinearGradient style={styles.screen} colors={[body?.colors[0], body?.colors[1]]}>			
			<StatusBar />

			<View style={[styles.slotView, styles.shadow]}>
				<MaskedView
					style={styles.slotMask}
					maskElement={
						<Svg width={GLOBAL.slotWidth} height={GLOBAL.slotHeight}>
							<Rect
								x="0"
								y="0"
								width="100%"
								height={GLOBAL.slotHeight - GLOBAL.slotEllipseSemiMinorAxis}
							/>
							<Ellipse
								cx="50%"
								cy={GLOBAL.slotHeight - GLOBAL.slotEllipseSemiMinorAxis}
								rx={GLOBAL.slotEllipseSemiMajorAxis}
								ry={GLOBAL.slotEllipseSemiMinorAxis}
							/>
						</Svg>
					}
				>
					<View style={[styles.slotCarousel]}>
						<NotificationsScreen />
						<LocationScreen />
						<HomeScreen />
						<BodiesScreen />
						<CreditsScreen />
					</View>
				</MaskedView>
			</View>

			<View style={styles.tabContainer}>
				{/* SVGs with drop shadows */}
				{tabArray.map((tab, i) => (
					<Svg
						key={`${tab.key}-shadow`}
						style={i !== activeTab ? [styles.shadow, styles.tabBtnSvg] : styles.tabBtnSvg}
						viewBox={`0 0 100 ${GLOBAL.navRatio * 100}`}
					>
						<Path fill="green" d={tab.d} />
					</Svg>
				))}

				{/* Pressable SVG path tabs */}
				<Svg style={styles.tabBtnSvg} viewBox={`0 0 100 ${GLOBAL.navRatio * 100}`}>
					{tabArray.map((tab, i) => (
						<Path
							key={`${tab.key}-path`}
							fill={body?.colors[0]}
							onPress={() => { setActiveTab(i) }}
							d={tab.d}
						/>
					))}
				</Svg>

				{/* Unpressed/pressed tab PNGs */}
				{tabArray.map((tab, i) => (
					<Image
						key={`${tab.key}-unpressed`}
						style={[styles.tabBtnImage, { opacity: i === activeTab ? 0 : 1 }]}
						source={tab.unpressedSrc}
					/>
				))}
				{tabArray.map((tab, i) => (
					<Image
						key={`${tab.key}-pressed`}
						style={[styles.tabBtnImage, { opacity: i === activeTab ? 1 : 0 }]}
						source={tab.pressedSrc}
					/>
				))}

				{/* SVG tab icons */}
				<View style={styles.tabIconContainer} pointerEvents="none">
					{tabArray.map((tab, i) => (
						<Svg
							key={`${tab.key}-icon`}
							style={[
								styles.tabIcon,
								tab.iconStyle,
								i === activeTab ? {
									shadowColor: GLOBAL.uiColors[0],
									shadowOpacity: 0.5,
									shadowRadius: 4,
									shadowOffset: {width: 0, height: 0},
								} : {
									opacity: 0.5,
								}
							]}
							viewBox="0 0 100 100"
						>
							<Path
								fill={i === activeTab ? GLOBAL.uiColors[0] : GLOBAL.uiColors[1]}
								stroke={i === activeTab ? GLOBAL.uiColors[0] : GLOBAL.uiColors[1]}
								strokeWidth={2}
								d={tab.iconPath}
							/>
						</Svg>
					))}
				</View>
			</View>
		</LinearGradient>
	);
}
