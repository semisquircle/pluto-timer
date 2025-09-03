import MaskedView from "@react-native-masked-view/masked-view";
import { useFonts } from "expo-font";
import { Image as ExpoImage } from "expo-image";
import * as ExpoLocation from "expo-location";
import { router, Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StatusBar, StyleSheet, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import * as GLOBAL from "../ref/global";


export default function Layout() {
	//* Global app storage
	const ActiveTab = GLOBAL.useAppStore((state) => state.activeTab);
	const SetActiveTab = GLOBAL.useAppStore((state) => state.setActiveTab);

	const ActiveBody = GLOBAL.useAppStore((state) => state.activeBody);
	const SetActiveBody = GLOBAL.useAppStore((state) => state.setActiveBody);

	const SavedCities = GLOBAL.useAppStore((state) => state.savedCities);
	const UnshiftSavedCity = GLOBAL.useAppStore((state) => state.unshiftSavedCity);

	const ActiveCityIndex = GLOBAL.useAppStore((state) => state.activeCityIndex);
	const SetActiveCityIndex = GLOBAL.useAppStore((state) => state.setActiveCityIndex);
	const ActiveCity = SavedCities[ActiveCityIndex];


	//* Fonts
	const [fontsLoaded] = useFonts({
		"Trickster-Reg": require("../assets/fonts/Trickster/Trickster-Reg.otf"),
		"Trickster-Reg-Feat": require("../assets/fonts/Trickster/Trickster-Reg-Feat.otf"),
		"Trickster-Reg-Arrow": require("../assets/fonts/Trickster/Trickster-Reg-Arrow.otf"),

		"Hades-Tall": require("../assets/fonts/Hades/Hades-Tall.ttf"),
		"Hades-Short": require("../assets/fonts/Hades/Hades-Short.ttf"),
	});


	//* Geolocation
	const [geolocation, setGeolocation] = useState<GLOBAL.City>();
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
				// const lat = 78.216667;
				// const lon = 15.633333;

				const results = await ExpoLocation.reverseGeocodeAsync({
					latitude: lat,
					longitude: lon,
				});
				if (!results || results.length === 0) {
					console.log("Failed to reverse geocode location");
					return; // bail early
				}

				const name = results[0]?.city ?? results[0]?.region ?? results[0]?.country ?? "";
				const loc = new GLOBAL.City(name, lat, lon);
				setGeolocation(loc);
				UnshiftSavedCity(loc);
			}
			catch (err) { console.error("Error fetching location:", err); }
		})();
	}, []);


	//* Calculate times
	useEffect(() => {
		SavedCities.forEach(loc => {
			loc.setNextBodyTime(ActiveBody);
		});
	}, [geolocation, SavedCities.length]);


	//* Tabs/navigation
	const tabIconDimension: number = 0.12 * GLOBAL.slot.width;
	const tabIcon1n5X: number = 0.82 * GLOBAL.slot.width;
	const tabIcon1n5Y: number = 0.045 * GLOBAL.slot.width;
	const tabIcon2n4X: number = 0.44 * GLOBAL.slot.width;
	const tabIcon2n4Y: number = 0.21 * GLOBAL.slot.width;
	const tabIcon3X: number = 0.255 * GLOBAL.slot.width;

	const tabArray: {
		key: string;
		href: any,
		handlePath: string,
		unpressedSrc: any,
		pressedSrc: any,
		iconPath: string,
		iconStyle: any
	}[] = [
		{
			key: "notifications",
			href: "/notifications",
			handlePath: "m 1.0004883,12.098734 v 16.153219 a 6.0071659,6.0071659 60.329276 0 0 3.0105786,5.284378 c 0.8922538,0.498181 1.714742,0.927561 2.5063509,1.318251 a 4.9285363,4.9285363 169.86934 0 0 5.6532572,-1.01012 l 9.055623,-9.055623 A 2.179765,2.179765 76.710805 0 0 20.38069,21.208648 C 15.31118,19.37285 8.5901422,16.220218 4.005286,11.129024 a 1.6910397,1.6910397 162.11404 0 0 -3.0047977,0.96971 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/1.png"),
			pressedSrc: require("../assets/images/tabs/pressed/1.png"),
			iconPath: "m 50,13.839502 c -2.208946,5.39e-4 -3.999294,1.791542 -3.999024,4.000488 h 0.01611 c -9.027678,0.970853 -17.147434,5.272602 -18.124512,12.909668 2.238802,4.186515 2.238802,8.375984 0,12.5625 2.238802,13.69919 -5.729002,24.374996 -15.392578,22.875 v 4.5 c 0.0034,-4.65e-4 0.0068,-9.65e-4 0.01025,-0.0015 L 12.5,70.690088 c 7.396845,2.761693 16.00859,4.575361 25.000488,5.441894 2.197797,13.371356 22.802692,13.371356 25.000488,0 h -0.01318 C 71.484472,75.26536 80.099525,73.450179 87.5,70.687158 v -4.5 c -9.663584,1.499998 -17.629913,-9.175809 -15.391114,-22.875 -2.238799,-4.186516 -2.238799,-8.375984 0,-12.5625 C 71.131809,23.112572 63.01089,18.810833 53.98291,17.83999 h 0.01758 C 54.000758,15.630472 52.209518,13.839233 50,13.839502 Z m 0,4.911621 c 8.255578,0 16.511979,3.99904 15.392578,11.998535 2.238802,4.186515 2.238802,8.375984 0,12.5625 1.702065,10.684418 7.212012,20.074665 14.608887,24.624023 -16.024127,9.149828 -43.979246,9.151552 -60.00293,0.0015 7.398985,-4.548714 12.908072,-13.939728 14.610351,-24.625488 -2.2388,-4.186514 -2.2388,-8.375985 0,-12.5625 C 33.489487,22.750161 41.744419,18.751123 50,18.751123 Z m -5.985352,57.834961 c 3.97999,0.18002 7.99218,0.180319 11.972168,0 1.651377,10.566908 -13.623545,10.566908 -11.972168,0 z",
			iconStyle: {
				marginRight: tabIcon1n5X,
				marginTop: tabIcon1n5Y,
			},
		},
		{
			key: "cities",
			href: "/cities",
			handlePath: "m 22.323466,25.10671 -9.168416,9.168416 a 2.2822899,2.2822899 78.296106 0 0 0.779417,3.762375 c 5.817424,2.157486 12.052701,3.721123 18.624054,4.703819 a 3.9491895,3.9491895 146.28535 0 0 4.375098,-2.919445 l 2.912547,-10.8708 a 3.0305496,3.0305496 55.662287 0 0 -2.572732,-3.766156 c -3.158829,-0.40929 -6.198951,-0.967805 -9.09097,-1.661138 a 6.2121721,6.2121721 164.88132 0 0 -5.858998,1.582929 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/2.png"),
			pressedSrc: require("../assets/images/tabs/pressed/2.png"),
			iconPath: "m 49.999512,11.67627 c -19.860104,0 -39.719498,12.776241 -40.8383792,38.324707 2.2377592,51.096923 79.4404652,51.096923 81.6782222,0 C 89.720477,24.452511 69.859603,11.67627 49.999512,11.67627 Z m 0,1.67871 c 17.622345,0 35.245344,12.21641 34.126465,36.645997 2.237759,48.859166 -70.489224,48.859166 -68.251465,0 C 14.755633,25.57139 32.377167,13.35498 49.999512,13.35498 Z m -0.169922,6.424805 c -14.408295,2.13889 -23.644395,18.133925 -18.292969,31.681641 6.048792,8.003106 11.474766,16.367692 16.286133,25.085449 0.01568,0.02836 0.02986,0.0566 0.04541,0.08496 0.644337,1.168762 1.27633,2.344312 1.898438,3.525879 0.01141,0.02096 0.02271,0.04203 0.03369,0.06299 0.614548,-1.189254 1.243032,-2.371908 1.87793,-3.550781 0.01141,-0.02139 0.02214,-0.04455 0.03369,-0.06592 5.251311,-9.743403 11.19661,-19.134631 17.874026,-28.224608 2.52323,-13.192627 -6.76844,-26.46072 -19.756348,-28.59961 z m 2.443359,6.161133 c 0.264368,-0.007 0.527331,-0.0066 0.786621,0 10.02599,0.251071 16.099246,10.51282 10.681641,19.731445 -4.023368,9.509963 -8.69816,18.74956 -13.990723,27.679688 C 44.98676,65.299788 40.765663,56.934541 37.092773,48.253418 28.654189,37.914041 36.657851,24.056906 49.82959,26.195801 c 0.835083,-0.150392 1.650241,-0.233862 2.443359,-0.254883 z m -2.271972,5.938477 c -4.651678,0 -9.303109,2.654705 -10.372559,7.964355 2.1389,10.623458 18.604753,10.623458 20.743652,0 -1.06945,-5.30965 -5.719415,-7.964355 -10.371093,-7.964355 z m 0,1.604003 c 2.512779,0 5.023063,2.120151 3.953613,6.360352 2.1389,8.484562 -10.049041,8.484562 -7.910156,0 -1.069437,-4.2402 1.443764,-6.360351 3.956543,-6.360352 z",
			iconStyle: {
				marginRight: tabIcon2n4X,
				marginTop: tabIcon2n4Y,
			},
		},
		{
			key: "index",
			href: "/",
			handlePath: "m 40.858308,29.041877 -2.918276,10.891344 a 2.9327514,2.9327514 55.137579 0 0 2.579207,3.702379 c 6.084891,0.470527 12.521238,0.49886 18.962036,2.51e-4 a 2.9329809,2.9329809 124.86034 0 0 2.579182,-3.70263 L 59.14218,29.041877 a 4.314332,4.314332 35.653711 0 0 -4.398404,-3.155188 c -3.174426,0.150101 -6.331367,0.14921 -9.487061,-8e-6 a 4.3143353,4.3143353 144.34624 0 0 -4.398407,3.155196 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/3.png"),
			pressedSrc: require("../assets/images/tabs/pressed/3.png"),
			iconPath: ActiveBody?.icon,
			iconStyle: {
				marginTop: tabIcon3X,
			},
		},
		{
			key: "bodies",
			href: "/bodies",
			handlePath: "m 71.818012,23.523754 c -2.892006,0.693305 -5.932217,1.251834 -9.090967,1.661137 a 3.0305717,3.0305717 124.33743 0 0 -2.572723,3.766184 l 2.912547,10.8708 a 3.9491648,3.9491648 33.714398 0 0 4.375095,2.919414 c 6.571341,-0.982724 12.806678,-2.546247 18.624073,-4.703754 a 2.2823115,2.2823115 101.70358 0 0 0.779402,-3.762409 L 77.677022,25.10671 a 6.2122359,6.2122359 15.118901 0 0 -5.85901,-1.582956 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/4.png"),
			pressedSrc: require("../assets/images/tabs/pressed/4.png"),
			iconPath: "m 49.999242,15.505317 c -18.031159,0 -36.062393,11.499142 -37.31452,34.497222 0.117634,2.160616 0.385118,4.21988 0.785029,6.177512 -8.0325761,7.839822 -12.55329609,15.41103 -10.4597071,20.94876 3.936966,4.811671 13.4598611,4.434432 25.0084071,0.946435 21.340424,14.198475 57.503101,4.845145 59.295311,-28.072707 -0.11783,-2.164295 -0.38398,-4.226676 -0.78503,-6.187294 8.02447,-7.838347 12.55516,-15.410119 10.46215,-20.946315 -1.92233,-2.349426 -5.17636,-3.462505 -9.34697,-3.580316 -4.36699,-0.12336 -9.748902,0.860441 -15.654097,2.646108 C 65.557403,17.6526 57.779725,15.505317 49.999242,15.505317 Z m 0,1.878198 c 14.585765,0 29.171565,9.597138 29.848193,28.786815 C 73.384297,51.526014 65.007437,56.994079 56.780809,61.743725 47.646729,67.017287 37.65461,72.004498 29.202107,74.829973 23.309964,69.396317 19.557165,61.123609 20.197516,50.002539 18.945387,28.256588 34.472343,17.383515 49.999242,17.383515 Z m 32.39892,5.42183 c 3.82604,-0.02192 6.56847,1.180326 7.63507,4.081659 2.97393,3.567478 0.76577,8.490285 -4.28219,13.84193 -2.07064,-7.05936 -5.983288,-12.640326 -10.975721,-16.735042 2.825042,-0.741209 5.410116,-1.175869 7.622841,-1.188547 z m -2.589857,26.986874 c -0.0037,0.07104 -0.0032,0.139054 -0.0073,0.21032 1.777267,30.866134 -30.244853,39.819542 -48.094598,26.874378 8.46776,-2.922889 17.76183,-7.291612 26.642049,-12.418609 7.771641,-4.486959 15.187278,-9.538819 21.459885,-14.666089 z m -65.558418,9.488816 c 2.072153,7.062273 5.986934,12.645122 10.983059,16.739931 -7.717224,2.022702 -13.582539,1.676121 -15.2676981,-2.907783 -2.97205,-3.565233 -0.758322,-8.48462 4.2846391,-13.832148 z",
			iconStyle: {
				marginLeft: tabIcon2n4X,
				marginTop: tabIcon2n4Y,
			},
		},
		{
			key: "credits",
			href: "/credits",
			handlePath: "M 95.995067,11.129071 C 91.40297,16.228157 84.670971,19.379744 79.619696,21.20879 a 2.179651,2.179651 103.28815 0 0 -0.845506,3.580049 l 9.055624,9.055623 a 4.9298663,4.9298663 10.117874 0 0 5.652632,1.008707 c 0.8304,-0.409213 1.649531,-0.837726 2.506922,-1.316046 A 6.0060753,6.0060753 119.66747 0 0 99,28.251953 V 12.098734 a 1.6911056,1.6911056 17.884402 0 0 -3.004933,-0.969663 z",
			unpressedSrc: require("../assets/images/tabs/unpressed/5.png"),
			pressedSrc: require("../assets/images/tabs/pressed/5.png"),
			iconPath: "m 50.000001,9.9999985 c -8.724026,0 -17.448069,5.3439665 -18.581031,16.0318645 1.003178,9.463585 7.959465,14.735366 15.59594,15.819434 0.771845,2.961506 1.19502,5.922956 1.270157,8.884461 -6.981435,-0.07926 -13.962884,-0.636737 -20.94432,-1.683953 v 6.797775 c 6.958565,-1.043783 13.917158,-1.599583 20.875723,-1.681741 -0.191344,2.920976 -0.721903,5.841784 -1.591017,8.762758 -3.140874,8.828347 -7.902204,16.720825 -14.297015,23.670514 l 5.886094,3.39889 c 2.572827,-8.219437 6.504214,-15.654849 11.783255,-22.311846 5.279476,6.657277 9.210288,14.091965 11.783254,22.311846 l 5.888308,-3.39889 C 61.270141,79.646646 56.50428,71.748609 53.363483,62.912896 52.497562,59.997955 51.970054,57.08278 51.779106,54.167839 c 6.960038,0.08197 13.920111,0.637736 20.880147,1.681741 v -6.797775 c -6.982908,1.047437 -13.965836,1.604885 -20.948745,1.683953 0.07514,-2.961505 0.49831,-5.922955 1.270156,-8.884461 C 60.61941,40.76907 67.577597,35.497835 68.58103,26.031863 67.448068,15.343965 58.724024,9.9999985 50.000001,9.9999985 Z m 0,1.6994445 c 6.458099,0 12.916214,4.777483 11.783253,14.33242 2.265923,19.109875 -25.832431,19.109875 -23.566508,0 -1.132961,-9.554938 5.325153,-14.33242 11.783255,-14.33242 z",
			iconStyle: {
				marginLeft: tabIcon1n5X,
				marginTop: tabIcon1n5Y,
			},
		},
	];

	const tabPressHandle = (i: number) => {
		if (ActiveTab !== i) {
			SetActiveTab(i);
			router.replace(tabArray[i].href);
		}
	}


	//* Stylesheet
	const styles = StyleSheet.create({
		screen: {
			flex: 1,
			alignItems: "center",
			paddingTop: GLOBAL.screen.topOffset + GLOBAL.screen.borderWidth,
			backgroundColor: ActiveBody?.colors[2],
		},

		slotMask: {
			flex: 1,
			width: GLOBAL.slot.width,
			maxHeight: GLOBAL.slot.height,
			overflow: "hidden",
		},

		slotBG: {
			position: "absolute",
			width: "100%",
			height: "100%",
			backgroundColor: GLOBAL.ui.colors[1]
		},

		slot: {
			position: "absolute",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			zIndex: 9990,
		},

		starField: {
			position: "absolute",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			opacity: 0.3,
		},

		star: { position: "absolute" },

		tabContainer: {
			position: "absolute",
			justifyContent: "center",
			alignItems: "center",
			bottom: GLOBAL.screen.bottomOffset + GLOBAL.screen.borderWidth,
			width: GLOBAL.slot.width,
			height: GLOBAL.nav.height,
		},

		tabImg: {
			position: "absolute",
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
		<View style={styles.screen}>			
			<StatusBar />

			{/* Tab background */}
			<Svg
				style={styles.tabContainer}
				width={GLOBAL.slot.width}
				height={GLOBAL.nav.height + 1}
				viewBox={`0 0 100 ${GLOBAL.nav.ratio * 100}`}
			>
				<Path
					fill={GLOBAL.ui.colors[0]}
					d="m 0,0 v 28.332059 c -0.03778138,2.489454 1.2801493,4.802796 3.4408467,6.039661 14.4624933,7.992589 30.9060863,10.183637 42.5586873,10.56318 2.665254,0.0868 5.332628,0.0868 7.997882,0 11.6087,-0.378079 28.073027,-2.557113 42.560152,-10.56318 2.16071,-1.236854 3.478652,-3.550203 3.440849,-6.039661 V 0 Z"
				/>

				{tabArray.map((tab, i) => (
					<Path
						key={`tab-path${tab.key}`}
						fill={(i == ActiveTab) ? ActiveBody?.colors[2] : ActiveBody?.colors[3]}
						d={tab.handlePath}
					/>
				))}
			</Svg>

			{/* Pressable tab handles (tabs 2-4) */}
			<Svg
				style={styles.tabContainer}
				width={GLOBAL.slot.width}
				height={GLOBAL.nav.height + 1}
				viewBox={`0 0 100 ${GLOBAL.nav.ratio * 100}`}
			>
				{tabArray.map((tab, i) => {
					if ([1, 2, 3].includes(i)) return (
						<Path
							key={`tab-path${tab.key}`}
							fill="transparent"
							d={tab.handlePath}
							onPress={() => tabPressHandle(i)}
						/>
					);
				})}
			</Svg>

			<MaskedView
				style={styles.slotMask}
				maskElement={
					<Svg width={GLOBAL.slot.width} height={GLOBAL.slot.height} pointerEvents="none">
						<Path d={`
							M 0,${GLOBAL.slot.borderRadius}
							v ${GLOBAL.slot.height - GLOBAL.slot.borderRadius - GLOBAL.slot.ellipseSemiMinor}
							A ${GLOBAL.slot.ellipseSemiMajor} ${GLOBAL.slot.ellipseSemiMinor}
								0 0 0 ${GLOBAL.slot.width},${GLOBAL.slot.height - GLOBAL.slot.ellipseSemiMinor}
							v ${-(GLOBAL.slot.height - GLOBAL.slot.borderRadius - GLOBAL.slot.ellipseSemiMinor)}
							q 0,${-GLOBAL.slot.borderRadius} ${-GLOBAL.slot.borderRadius},${-GLOBAL.slot.borderRadius}
							h ${-(GLOBAL.slot.width - 2 * GLOBAL.slot.borderRadius)}
							q ${-GLOBAL.slot.borderRadius},0 ${-GLOBAL.slot.borderRadius},${GLOBAL.slot.borderRadius}
							z
						`}/>
					</Svg>
				}
				pointerEvents="box-none"
			>
				<View style={styles.slotBG} pointerEvents="none"></View>

				{/* <StarField numStars={50} starAngle={10} /> */}

				<Slot />
			</MaskedView>

			<View style={styles.tabContainer}>
				{tabArray.map((tab, i) => {
					if ([0, 4].includes(i)) return (
						<Pressable
							key={`tab-handle${i}`}
							style={{
								position: "absolute",
								top: "28%",
								left: (i == 0) ? "-2%" : "auto",
								right: (i == 4) ? "-2%" : "auto",
								width: 0.19 * GLOBAL.slot.width,
								height: "52%",
								// opacity: 0.5,
								// backgroundColor: "limegreen",
								borderTopLeftRadius: "60%",
								// borderTopRightRadius: "80%",
								borderBottomLeftRadius: "40%",
								// borderBottomRightRadius: "50%",
								transform: [{ scaleX: (i == 4) ? -1 : 1 }, { rotate: "-55deg" }],
							}}
							onPress={() => tabPressHandle(i)}
						></Pressable>
					);
				})}
			</View>

			{/* Unpressed/pressed tab PNGs */}
			<View style={styles.tabContainer} pointerEvents="none">
				{tabArray.map((tab, i) => (
					<ExpoImage
						key={`unpressed-img${tab.key}`}
						style={[styles.tabImg, { opacity: i === ActiveTab ? 0 : 1 }]}
						source={tab.unpressedSrc}
						contentFit="fill"
					/>
				))}
				{tabArray.map((tab, i) => (
					<ExpoImage
						key={`pressed-img${tab.key}`}
						style={[styles.tabImg, { opacity: i === ActiveTab ? 1 : 0 }]}
						source={tab.pressedSrc}
						contentFit="fill"
					/>
				))}
			</View>

			{/* Tab icons */}
			<View style={styles.tabContainer} pointerEvents="none">
				{tabArray.map((tab, i) => (
					<Svg
						key={`tab-icon${tab.key}`}
						style={[styles.tabIcon, tab.iconStyle, (i !== ActiveTab) && GLOBAL.ui.btnShadowStyle]}
						viewBox="0 0 100 100"
					>
						<Path
							fill={(i === ActiveTab) ? GLOBAL.ui.colors[1] : GLOBAL.ui.colors[0]}
							stroke={(i === ActiveTab) ? GLOBAL.ui.colors[1] : GLOBAL.ui.colors[0]}
							strokeWidth={2}
							d={tab.iconPath}
						/>
					</Svg>
				))}
			</View>
		</View>
	);
}
