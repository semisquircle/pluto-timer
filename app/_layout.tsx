import MaskedView from "@react-native-masked-view/masked-view";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import * as ExpoLocation from "expo-location";
import React, { useEffect, useState } from "react";
import { Image, StatusBar, StyleSheet, View } from "react-native";
import { Ellipse, Path, Rect, Svg } from "react-native-svg";
import * as GLOBAL from "../ref/global";
// import StarField from "../ref/star-field";
import HomeScreen from "./";
import BodiesScreen from "./bodies";
import CreditsScreen from "./credits";
import LocationScreen from "./location";
import NotificationsScreen from "./notifications";


export default function Layout() {
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


	//* Fonts
	const [fontsLoaded] = useFonts({
		"Trickster-Reg": require("../assets/fonts/Trickster/Trickster-Reg.otf"),
		"Trickster-Reg-Feat": require("../assets/fonts/Trickster/Trickster-Reg-Feat.otf"),
		"Trickster-Reg-Arrow": require("../assets/fonts/Trickster/Trickster-Reg-Arrow.otf"),

		"Hades-Tall": require("../assets/fonts/Hades/Hades-Tall.ttf"),
		"Hades-Short": require("../assets/fonts/Hades/Hades-Short.ttf"),
	});


	//* Geolocation
	const [location, setLocation] = useState<ExpoLocation.LocationGeocodedAddress | null>(null);
	useEffect(() => {
		(async () => {
			try {
				const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
				if (status !== "granted") {
					console.log("Permission to access location was denied");
					return; // bail early
				}

				const position = await ExpoLocation.getCurrentPositionAsync({});
				if (!position) {
					console.log("Failed to get current position");
					return; // bail early
				}
				const lat = position.coords.latitude;
				const lon = position.coords.longitude;
				// const lat = 54.028333;
				// const lon = -93.533611;

				const results = await ExpoLocation.reverseGeocodeAsync({
					latitude: lat,
					longitude: lon,
				});
				if (!results || results.length === 0) {
					console.log("Failed to reverse geocode location");
					return; // bail early
				}

				const loc = results[0];
				EditSavedLocation(0, {
					name: loc?.city ?? loc?.region ?? loc?.country ?? "",
					lat: lat,
					lon: lon,
				});

				setLocation(loc);
			}
			catch (err) { console.error("Error fetching location:", err); }
		})();
	}, []);


	//* Master time calculation
	useEffect(() => {
		for (let l = 0; l < SavedLocations.length; l++) {
			const loc = SavedLocations[l];

			const now = new Date();
			const next = GLOBAL.findNextBodyTime(now, loc.lat, loc.lon, ActiveBody);
			const dt = next.getTime() - now.getTime();
			const threshold = 5 * 60 * 1000; // 5 minutes

			let isBodyTimeNow = false;
			let nextBodyTime = next.toLocaleTimeString(undefined, {
				hour: "numeric",
				minute: "2-digit",
				hour12: true
			}).replace(/\s/g, "");
			const nextBodyDateLong = next.toLocaleDateString(undefined, {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
			const day = String(next.getDate()).padStart(2, "0");
			const month = String(next.getMonth() + 1).padStart(2, "0");
			const year = next.getFullYear();
			const nextBodyDateShort = `${month}/${day}/${year}`;

			if (dt <= threshold) {
				isBodyTimeNow = true;
				nextBodyTime = "NOW!";
			}

			EditSavedLocation(l, {
				isBodyTimeNow: isBodyTimeNow,
				nextBodyTime: nextBodyTime,
				nextBodyDateLong: nextBodyDateLong,
				nextBodyDateShort: nextBodyDateShort,
			});
		}
	}, [location]);


	//* Tabs/navigation
	const tabIconDimension: number = 0.12 * GLOBAL.slot.width;
	const tabIcon1n5X: number = 0.83 * GLOBAL.slot.width;
	const tabIcon1n5Y: number = 0.03 * GLOBAL.slot.width;
	const tabIcon2n4X: number = 0.435 * GLOBAL.slot.width;
	const tabIcon2n4Y: number = 0.21 * GLOBAL.slot.width;
	const tabIcon3X: number = 0.26 * GLOBAL.slot.width;

	const tabArray: {
		key: string;
		handlePath: string,
		unpressedSrc: any,
		pressedSrc: any,
		iconPath: string,
		iconStyle: any
	}[] = [
		{
			key: "notifications",
			handlePath: "M 0,9.9985782 V 28.832031 a 6.0342995,6.0342995 60.472382 0 0 3.0015912,5.299333 c 0.7682147,0.432591 1.5213991,0.834992 2.274309,1.21844 A 4.8613529,4.8613529 170.27919 0 0 10.907979,34.384989 L 21.507548,23.785421 A 2.1794396,2.1794396 76.705028 0 0 20.661721,20.205916 C 12.880238,17.387532 6.973612,13.538395 3.5082564,9.1618115 A 1.9093867,1.9093867 166.58482 0 0 0,9.9985782 Z",
			unpressedSrc: require("../assets/images/tabs/unpressed/1.png"),
			pressedSrc: require("../assets/images/tabs/pressed/1.png"),
			iconPath: "m 50.000001,12.68165 c -11.428813,0 -22.856793,4.763497 -24.075867,14.292055 2.438147,4.559288 2.438147,9.121779 0,13.681066 2.438147,14.918982 -6.239102,26.545348 -16.7631342,24.91179 v 4.900681 c 0.00368,-5.06e-4 0.00745,-0.0011 0.01116,-0.0016 l -0.01116,0.0048 c 8.0554682,3.007598 17.4339852,4.982751 27.2265312,5.926442 2.393491,14.561955 24.833044,14.561955 27.226533,0 h -0.01435 C 73.397467,75.453055 82.779579,73.476293 90.839,70.46725 V 65.566568 C 80.31496,67.200126 71.639315,55.57376 74.077461,40.654778 71.639315,36.095491 71.639315,31.533 74.077461,26.973712 72.85839,17.445147 61.428813,12.68165 50.000001,12.68165 Z m 0,1.22517 c 8.990665,0 17.982207,4.355106 16.763133,13.066885 2.438148,4.559288 2.438148,9.121779 0,13.681066 1.853619,11.635772 7.854162,21.862108 15.909663,26.816547 -17.450933,9.964537 -47.895142,9.966454 -65.345593,0.0016 8.057799,-4.953736 14.057405,-15.18091 15.911258,-26.818142 -2.438147,-4.559286 -2.438147,-9.121778 0,-13.681065 -1.219073,-8.71178 7.770872,-13.066885 16.761539,-13.066885 z m -6.518288,62.984588 c 4.334372,0.196051 8.7038,0.196375 13.038171,0 1.798418,11.507799 -14.836589,11.507799 -13.038171,0 z",
			iconStyle: {
				marginRight: tabIcon1n5X,
				marginTop: tabIcon1n5Y,
			},
		},
		{
			key: "location",
			handlePath: "m 23.987528,24.487081 -10.86324,10.86324 a 2.2716582,2.2716582 78.169266 0 0 0.78509,3.74797 c 5.587933,2.046703 11.545995,3.552894 17.804125,4.531232 a 3.9230982,3.9230982 146.4744 0 0 4.371929,-2.896526 l 3.447301,-12.867361 a 3.0451344,3.0451344 55.794563 0 0 -2.57095,-3.782265 c -2.425387,-0.326074 -4.798115,-0.743048 -7.09801,-1.247351 a 6.3584352,6.3584352 164.30612 0 0 -5.876245,1.651061 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/2.png"),
			pressedSrc: require("../assets/images/tabs/pressed/2.png"),
			iconPath: "m 49.999512,11.67627 c -19.860104,0 -39.719498,12.776241 -40.8383792,38.324707 2.2377592,51.096923 79.4404652,51.096923 81.6782222,0 C 89.720477,24.452511 69.859603,11.67627 49.999512,11.67627 Z m 0,1.67871 c 17.622345,0 35.245344,12.21641 34.126465,36.645997 2.237759,48.859166 -70.489224,48.859166 -68.251465,0 C 14.755633,25.57139 32.377167,13.35498 49.999512,13.35498 Z m -0.169922,6.424805 c -14.408295,2.13889 -23.644395,18.133925 -18.292969,31.681641 6.048792,8.003106 11.474766,16.367692 16.286133,25.085449 0.01568,0.02836 0.02986,0.0566 0.04541,0.08496 0.644337,1.168762 1.27633,2.344312 1.898438,3.525879 0.01141,0.02096 0.02271,0.04203 0.03369,0.06299 0.614548,-1.189254 1.243032,-2.371908 1.87793,-3.550781 0.01141,-0.02139 0.02214,-0.04455 0.03369,-0.06592 5.251311,-9.743403 11.19661,-19.134631 17.874026,-28.224608 2.52323,-13.192627 -6.76844,-26.46072 -19.756348,-28.59961 z m 2.443359,6.161133 c 0.264368,-0.007 0.527331,-0.0066 0.786621,0 10.02599,0.251071 16.099246,10.51282 10.681641,19.731445 -4.023368,9.509963 -8.69816,18.74956 -13.990723,27.679688 C 44.98676,65.299788 40.765663,56.934541 37.092773,48.253418 28.654189,37.914041 36.657851,24.056906 49.82959,26.195801 c 0.835083,-0.150392 1.650241,-0.233862 2.443359,-0.254883 z m -2.271972,5.938477 c -4.651678,0 -9.303109,2.654705 -10.372559,7.964355 2.1389,10.623458 18.604753,10.623458 20.743652,0 -1.06945,-5.30965 -5.719415,-7.964355 -10.371093,-7.964355 z m 0,1.604003 c 2.512779,0 5.023063,2.120151 3.953613,6.360352 2.1389,8.484562 -10.049041,8.484562 -7.910156,0 -1.069437,-4.2402 1.443764,-6.360351 3.956543,-6.360352 z",
			iconStyle: {
				marginRight: tabIcon2n4X,
				marginTop: tabIcon2n4Y,
			},
		},
		{
			key: "home",
			handlePath: "m 40.927908,44.672795 c 5.780709,0.420713 11.959634,0.45119 18.144703,3.29e-4 a 2.9194361,2.9194361 124.99011 0 0 2.580462,-3.686635 l -3.451166,-12.87776 a 4.351552,4.351552 35.877834 0 0 -4.400215,-3.18263 c -2.563191,0.09924 -5.084073,0.09438 -7.598992,-0.0091 a 4.3406186,4.3406186 144.19158 0 0 -4.399673,3.174127 C 40.65114,32.3896 39.499252,36.688038 38.347364,40.986475 a 2.9191774,2.9191774 55.006726 0 0 2.580544,3.68632 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/3.png"),
			pressedSrc: require("../assets/images/tabs/pressed/3.png"),
			iconPath: ActiveBody?.icon,
			iconStyle: {
				marginTop: tabIcon3X,
			},
		},
		{
			key: "bodies",
			handlePath: "m 70.169838,22.871951 c -2.306349,0.508251 -4.686372,0.928604 -7.119688,1.257436 a 3.0470465,3.0470465 124.18454 0 0 -2.570477,3.784539 l 3.435185,12.819127 a 3.92334,3.92334 33.524006 0 0 4.37213,2.896485 C 74.545253,42.651195 80.503135,41.144992 86.091105,39.09828 A 2.2716503,2.2716503 101.83085 0 0 86.8762,35.350324 L 76.045187,24.519311 a 6.3504166,6.3504166 15.662704 0 0 -5.875349,-1.64736 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/4.png"),
			pressedSrc: require("../assets/images/tabs/pressed/4.png"),
			iconPath: "m 50.000001,11.677794 c -19.860121,0 -39.720281,12.773189 -40.8391605,38.321678 2.2377615,51.096978 79.4405585,51.096978 81.6783185,0 C 89.720279,24.450986 69.860122,11.677794 50.000001,11.677794 Z m -3.273602,1.818182 c 1.012146,11.604823 1.539761,23.210652 1.58654,34.816433 C 37.489512,48.268847 26.666174,47.805778 15.843532,46.922549 16.254985,26.000202 31.019654,14.851551 46.726399,13.495976 Z m 6.547204,0 c 15.706745,1.355575 30.471414,12.504227 30.882867,33.426572 -10.822642,0.883229 -21.64598,1.346238 -32.469407,1.38986 0.04678,-11.605781 0.574394,-23.211607 1.58654,-34.816432 z m -4.960664,38.190558 c -0.04678,11.605781 -0.574394,23.211614 -1.58654,34.816434 -15.707293,-1.355624 -30.472405,-12.50281 -30.882867,-33.426574 10.822642,-0.883229 21.64598,-1.346237 32.469407,-1.38986 z m 3.374124,0 c 10.823427,0.04356 21.646765,0.506631 32.469407,1.38986 C 83.746008,74.000159 68.980896,85.147345 53.273603,86.502968 52.261457,74.898148 51.733842,63.292315 51.687063,51.686534 Z",
			iconStyle: {
				marginLeft: tabIcon2n4X,
				marginTop: tabIcon2n4Y,
			},
		},
		{
			key: "credits",
			handlePath: "M 96.512347,9.1688113 C 93.053612,13.55107 87.148261,17.406275 79.363247,20.229533 a 2.180406,2.180406 103.28395 0 0 -0.845404,3.58079 l 10.574666,10.574666 a 4.861978,4.861978 9.7154854 0 0 5.631724,0.964215 c 0.801513,-0.407897 1.553302,-0.811263 2.274905,-1.21724 a 6.0327096,6.0327096 119.52287 0 0 3.001352,-5.299933 V 9.9985782 A 1.8976549,1.8976549 13.380942 0 0 96.512347,9.1688113 Z",
			unpressedSrc: require("../assets/images/tabs/unpressed/5.png"),
			pressedSrc: require("../assets/images/tabs/pressed/5.png"),
			iconPath: "m 50,10 c -15.074298,2.237759 -24.737761,18.972915 -19.138999,33.146853 1.378208,1.823499 2.726027,3.665452 4.042846,5.524476 -4.338573,-0.278188 -8.677162,-0.670774 -13.015735,-1.188812 v 6.713287 c 5.29647,-0.632415 10.59294,-1.079935 15.88941,-1.354896 3.622981,5.373092 6.998139,10.888521 10.122383,16.549388 -3.620998,5.892997 -7.499323,11.652953 -11.636796,17.266173 l 5.830414,3.326051 C 44.516095,84.288625 47.142885,78.710484 49.97158,73.23645 52.842973,78.694787 55.492692,84.281002 57.910833,90 l 5.817301,-3.356643 C 59.522305,81.078637 55.6054,75.3467 51.971155,69.451486 c 3.047415,-5.65406 6.318844,-11.195813 9.820793,-16.632431 5.43997,0.272464 10.87997,0.7272 16.31994,1.376749 v -6.713287 c -4.540375,0.542134 -9.080705,0.950879 -13.62108,1.230333 1.98964,-2.960484 4.047381,-5.891256 6.177895,-8.791522 C 73.308561,26.118892 63.588259,12.237759 50,10 Z m 3.378484,6.446678 C 63.86792,16.709353 70.22221,27.44442 64.554197,37.089161 62.857734,41.099053 61.045042,45.06153 59.130234,48.977273 53.023008,49.21411 46.915782,49.213512 40.808556,48.975073 39.364155,45.951729 37.985469,42.890074 36.673947,39.790196 27.845274,28.97295 36.219413,14.475564 50,16.713325 c 1.164904,-0.209791 2.293378,-0.293783 3.378484,-0.266609 z M 50,52.517483 c 2.435163,0 4.870325,0.04026 7.305503,0.115826 -2.316487,4.540127 -4.778562,9.013201 -7.386361,13.413462 C 47.326844,61.664876 44.886146,57.195569 42.602704,52.635495 45.068449,52.558025 47.53424,52.51749 50,52.51749 Z",
			iconStyle: {
				marginLeft: tabIcon1n5X,
				marginTop: tabIcon1n5Y,
			},
		},
	];

	// Preload tab images on mount
	useEffect(() => {
		const tabImgs = tabArray.flatMap(tab => [tab.unpressedSrc, tab.pressedSrc]);
		tabImgs.forEach(img => Asset.fromModule(img).downloadAsync());
	}, []);


	//* Stylesheet
	const styles = StyleSheet.create({
		screen: {
			flex: 1,
			alignItems: "center",
			paddingTop: GLOBAL.screen.topOffset + GLOBAL.screen.borderWidth,
		},

		slotView: {
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
		},

		slotMask: {
			flex: 1,
			borderRadius: GLOBAL.slot.borderRadius,
			borderBottomLeftRadius: 0,
			borderBottomRightRadius: 0,
			overflow: "hidden",
		},

		slotBG: {
			position: "absolute",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			backgroundColor: GLOBAL.ui.colors[1]
		},

		starField: {
			position: "absolute",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			opacity: 0.3,
		},

		star: { position: "absolute" },

		slotCarousel: {
			flex: 1,
			flexDirection: "row",
			width: 5 * GLOBAL.slot.width,
			marginLeft: -ActiveTab * GLOBAL.slot.width,
		},

		shadow: {
			shadowColor: "black",
			shadowOpacity: 0,
			shadowRadius: 4,
			shadowOffset: {width: 0, height: 0},
		},

		tabContainer: {
			position: "absolute",
			bottom: GLOBAL.screen.bottomOffset + GLOBAL.screen.borderWidth,
			justifyContent: "center",
			alignItems: "center",
			width: GLOBAL.slot.width,
			height: GLOBAL.nav.height,
		},

		tabHandle: {
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
			width: tabIconDimension,
			height: tabIconDimension,
		},
	});


	//* Components
	return (
		<LinearGradient style={styles.screen} colors={[ActiveBody?.colors[0], ActiveBody?.colors[1]]}>			
			<StatusBar />

			<View style={[styles.slotView, styles.shadow]}>
				<MaskedView
					style={styles.slotMask}
					maskElement={
						<Svg width={GLOBAL.slot.width} height={GLOBAL.slot.height}>
							<Rect
								x="0"
								y="0"
								width="100%"
								height={GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
							/>
							<Ellipse
								cx="50%"
								cy={GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
								rx={GLOBAL.slot.ellipseSemiMajor}
								ry={GLOBAL.slot.ellipseSemiMinor}
							/>
						</Svg>
					}
				>
					<View style={styles.slotBG}></View>

					{/* <StarField /> */}

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
				{/* Pressable SVG path tabs */}
				<Svg style={styles.tabHandle} viewBox={`0 0 100 ${GLOBAL.nav.ratio * 100}`}>
					{tabArray.map((tab, i) => (
						<Path
							key={`${tab.key}-path`}
							fill={ActiveBody?.colors[0]}
							onPress={() => {
								SetActiveTab(i);
							}}
							d={tab.handlePath}
						/>
					))}
				</Svg>

				{/* Unpressed/pressed tab PNGs */}
				{tabArray.map((tab, i) => (
					<Image
						key={`${tab.key}-unpressed`}
						style={[styles.tabBtnImage, { opacity: i === ActiveTab ? 0 : 1 }]}
						source={tab.unpressedSrc}
					/>
				))}
				{tabArray.map((tab, i) => (
					<Image
						key={`${tab.key}-pressed`}
						style={[styles.tabBtnImage, { opacity: i === ActiveTab ? 1 : 0 }]}
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
								i === ActiveTab ? {
									shadowColor: GLOBAL.ui.colors[0],
									shadowOpacity: 0.9,
									shadowRadius: 5,
									shadowOffset: {width: 0, height: 0},
								} : {
									opacity: 0.65,
								}
							]}
							viewBox="0 0 100 100"
						>
							<Path
								fill={i === ActiveTab ? GLOBAL.ui.colors[0] : GLOBAL.ui.colors[1]}
								stroke={i === ActiveTab ? GLOBAL.ui.colors[0] : GLOBAL.ui.colors[1]}
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
