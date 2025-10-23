import { RectBtn } from "@/ref/btns";
import * as GLOBAL from "@/ref/global";
// import StarField from "@/ref/star-field";
import MaskedView from "@react-native-masked-view/masked-view";
import * as Application from "expo-application";
import { useFonts } from "expo-font";
import { Image as ExpoImage } from "expo-image";
import * as ExpoLocation from "expo-location";
import * as Notifications from "expo-notifications";
import { router, Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Reanimated, { Easing, interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";


const ReanimatedPath = Reanimated.createAnimatedComponent(Path);
const ReanimatedExpoImage = Reanimated.createAnimatedComponent(ExpoImage);

//* Tabs
const tabIconDimension: number = 0.11 * GLOBAL.slot.width;

const tabIcon1n4X: number = 0.815 * GLOBAL.slot.width;
const tabIcon1n4Y: number = 0.055 * GLOBAL.slot.width;

const tabIcon2X: number = 0.44 * GLOBAL.slot.width;
const tabIcon2Y: number = 0.2 * GLOBAL.slot.width;

const tabIcon3X: number = 0.225 * GLOBAL.slot.width;
const tabIcon3Y: number = 0.24 * GLOBAL.slot.width;

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
		key: "settings",
		href: "/settings",
		handlePath: "m 1.5,14.142578 v 13.817871 a 5.9903568,5.9903568 60.289899 0 0 3.0130244,5.280231 c 0.7502557,0.416114 1.5236431,0.821166 2.3796953,1.240603 A 4.9413759,4.9413759 169.8285 0 0 12.548604,33.466532 L 20.82786,25.187276 A 2.1874076,2.1874076 76.803154 0 0 19.985826,21.596355 C 14.343924,19.535488 9.0406648,16.712367 5.0301717,12.845957 A 2.0431349,2.0431349 159.83187 0 0 1.5,14.142578 Z",
		unpressedSrc: require("../assets/images/tabs/unpressed/1.png"),
		pressedSrc: require("../assets/images/tabs/pressed/1.png"),
		iconPath: "m 42.671386,10.000247 c 1.768098,9.96388 -9.903561,14.796885 -15.69873,6.500977 -2.239434,4.740177 -5.730524,8.232733 -10.470703,10.472168 8.295909,5.795167 3.462902,17.465366 -6.500976,15.697265 1.768294,4.935334 1.768294,9.874244 0,14.809571 9.963878,-1.768095 14.796884,9.903563 6.500976,15.69873 l 0.03662,0.03809 0.04248,-0.07617 c 4.622061,2.243128 8.039518,5.695548 10.242188,10.35791 5.795167,-8.295914 17.463898,-3.462909 15.695802,6.500971 4.935332,-1.768294 9.874239,-1.768294 14.80957,0 -1.768099,-9.96388 9.905027,-14.796885 15.700195,-6.500977 2.239434,-4.740179 5.730525,-8.232735 10.470703,-10.472168 -8.295908,-5.795167 -3.464368,-17.465364 6.499512,-15.697265 -1.768294,-4.935332 -1.768294,-9.874241 0,-14.80957 -9.96388,1.768095 -14.79542,-9.903564 -6.499512,-15.698731 l -0.03808,-0.03809 -0.04102,0.07617 c -4.622063,-2.243127 -8.039518,-5.695549 -10.242188,-10.35791 -5.795167,8.295908 -17.465362,3.462904 -15.697265,-6.500977 -4.935333,1.768294 -9.874238,1.768294 -14.809571,0 z m 7.404786,3.979981 c 1.158785,-3.47e-4 2.317371,0.09832 3.476074,0.292969 2.700745,5.387344 8.525312,8.741699 14.4375,8.797851 1.664796,0.01581 3.335521,-0.232876 4.945312,-0.769043 1.850113,1.317347 3.442808,2.892201 4.778321,4.724121 -2.459068,7.336365 1.095025,15.950642 8.0083,19.419434 0.390348,2.318083 0.393708,4.636954 0.0044,6.955078 -6.902442,3.46133 -10.46123,12.052972 -8.028809,19.381348 -1.361961,1.913702 -2.999442,3.552674 -4.911621,4.916015 -1.61114,-0.536714 -3.282327,-0.784867 -4.948242,-0.769043 -5.911705,0.05614 -11.736469,3.408363 -14.4375,8.794922 -2.31737,0.389851 -4.634742,0.390692 -6.952148,0.0015 -2.700745,-5.387345 -8.523847,-8.740236 -14.436036,-8.796387 -1.664796,-0.01581 -3.335521,0.232876 -4.945312,0.769043 -1.850114,-1.317346 -3.442807,-2.893665 -4.77832,-4.725586 2.459068,-7.336364 -1.09649,-15.949177 -8.009765,-19.417968 -0.390253,-2.317524 -0.391959,-4.63605 -0.0029,-6.953614 6.902627,-3.460953 10.457109,-12.052949 8.025878,-19.381347 1.36295,-1.914742 3.003621,-3.553677 4.917481,-4.917481 1.610374,0.536112 3.280272,0.784858 4.945312,0.769043 5.911704,-0.05615 11.735002,-3.408365 14.436035,-8.794922 1.158684,-0.194926 2.317288,-0.29555 3.476075,-0.295898 z M 50,31.999271 c -4.641674,0 -9.289148,1.490397 -12.855469,4.492676 -3.56632,3.002278 -6.032007,7.528039 -6.292969,13.486816 v 0.02051 0.02197 c 0.260962,5.958777 2.726646,10.484668 6.292969,13.486817 3.566324,3.00215 8.2138,4.491211 12.855469,4.491211 4.641667,0 9.289144,-1.489061 12.855468,-4.491211 3.566325,-3.002149 6.032008,-7.52804 6.292969,-13.486817 v -0.02197 -0.02051 C 68.887475,44.019986 66.42179,39.494225 62.855468,36.491947 59.289147,33.489668 54.641672,31.999271 50,31.999271 Z m 0,1.766601 c 3.908002,0 7.808717,1.358302 10.658203,4.048828 2.849486,2.690528 4.676555,6.707021 4.426758,12.161133 l -0.0029,0.02344 0.0029,0.02344 c 0.249798,5.454106 -1.577277,9.473658 -4.426758,12.164058 -2.84948,2.690398 -6.750186,4.047363 -10.658203,4.047363 -3.908017,0 -7.808723,-1.356965 -10.658203,-4.047363 -2.849482,-2.6904 -4.675093,-6.709947 -4.425293,-12.164063 l 0.0015,-0.02344 -0.0015,-0.02344 C 34.666705,44.521726 36.492309,40.505228 39.341797,37.8147 42.191283,35.124174 46.091997,33.765872 50,33.765872 Z",
		iconStyle: {
			marginRight: tabIcon1n4X,
			marginTop: tabIcon1n4Y,
		},
	},
	{
		key: "cities",
		href: "/cities",
		handlePath: "m 21.917704,25.511007 -8.384725,8.384724 a 2.2754069,2.2754069 78.21743 0 0 0.78294,3.753425 c 5.739473,2.109752 11.890603,3.64007 18.372674,4.605158 a 3.9519016,3.9519016 146.26795 0 0 4.375538,-2.921659 l 2.650058,-9.889431 a 3.0327267,3.0327267 55.685446 0 0 -2.572295,-3.768786 c -3.258144,-0.424537 -6.391612,-1.007496 -9.368651,-1.73334 a 6.1840424,6.1840424 164.99158 0 0 -5.855539,1.569909 z",
		unpressedSrc: require("../assets/images/tabs/unpressed/2.png"),
		pressedSrc: require("../assets/images/tabs/pressed/2.png"),
		iconPath: "M 38.082952,12.76415 C 30.137186,19.4677 21.278333,24.582436 11.5,28.111893 c 1.832565,15.347729 1.832565,39.014061 0,54.361791 l 2.74885,4.762166 C 21.442805,81.166575 29.387296,76.403961 38.082952,72.936821 46.778316,76.403936 54.723307,81.16675 61.917053,87.23585 69.86282,80.532296 78.721672,75.417564 88.5,71.888108 86.667441,56.540378 86.667441,32.874045 88.5,17.526317 L 85.751155,12.76415 C 78.557407,18.833249 70.612417,23.596063 61.917053,27.063178 53.22169,23.596063 45.276699,18.833251 38.082952,12.76415 Z M 35.566756,69.166101 C 29.764084,73.710917 23.497821,77.449663 16.763264,80.379832 15.273819,66.657668 15.2459,44.616911 16.686313,30.894746 c 5.844468,-4.588197 12.160835,-8.357162 18.952025,-11.305003 0,0 1.422685,35.823816 -0.07158,49.576358 z m 4.960811,-49.576358 c 6.730297,2.921411 12.994087,6.64905 18.794544,11.18152 1.547095,13.781827 1.61947,35.882222 0.211174,49.664048 C 52.749474,77.496791 46.439067,73.740037 40.599152,69.166101 39.104881,55.413559 39.078994,33.342285 40.527567,19.589743 Z m 42.709177,0.02864 c 1.489572,13.722162 1.517239,35.762919 0.07695,49.485084 C 77.451671,73.705492 71.115275,77.48352 64.300818,80.435313 62.892525,66.653487 62.9649,44.553093 64.511994,30.771266 70.292579,26.254322 76.532683,22.535277 83.236743,19.61838 Z",
		iconStyle: {
			marginRight: tabIcon2X,
			marginTop: tabIcon2Y,
		},
	},
	{
		key: "index",
		href: "/",
		handlePath: "m 72.227541,23.942251 c -9.795066,2.393542 -19.454976,2.798213 -27.102748,2.436009 a 4.3136751,4.3136751 144.35305 0 0 -4.398317,3.15434 l -2.656077,9.912827 a 2.9290328,2.9290328 55.103617 0 0 2.579585,3.698245 c 10.220417,0.776315 27.904847,0.799654 45.034648,-5.494758 a 2.2751737,2.2751737 101.78239 0 0 0.782877,-3.753183 l -8.384725,-8.384724 a 6.1806043,6.1806043 14.998611 0 0 -5.855243,-1.568756 z",
		unpressedSrc: require("../assets/images/tabs/unpressed/3.png"),
		pressedSrc: require("../assets/images/tabs/pressed/3.png"),
		iconPath: "",
		iconStyle: {
			marginLeft: tabIcon3X,
			marginTop: tabIcon3Y,
		},
	},
	{
		key: "bodies",
		href: "/bodies",
		handlePath: "m 94.970273,12.845934 c -4.005661,3.861782 -9.304264,6.686073 -14.955623,8.750404 a 2.1874171,2.1874171 103.1966 0 0 -0.842022,3.590938 l 8.277791,8.277791 a 4.9425678,4.9425678 10.167747 0 0 5.655195,1.014244 c 0.891311,-0.43612 1.668975,-0.843521 2.3824,-1.23781 a 5.9831759,5.9831759 119.70176 0 0 3.012474,-5.281052 V 14.142578 a 2.0431594,2.0431594 20.168234 0 0 -3.530215,-1.296644 z",
		unpressedSrc: require("../assets/images/tabs/unpressed/4.png"),
		pressedSrc: require("../assets/images/tabs/pressed/4.png"),
		iconPath: "m 49.999282,17.320825 c -17.082151,0 -34.164374,10.893925 -35.3506,32.68158 0.111443,2.0469 0.364849,3.997781 0.743712,5.85238 -7.6098088,7.4272 -11.8925964,14.599924 -9.9091962,19.846195 3.7297574,4.558425 12.7514472,4.201041 23.6921762,0.896622 20.217244,13.451188 54.476624,4.590138 56.174507,-26.595197 -0.111628,-2.050385 -0.36377,-4.004219 -0.743712,-5.861647 7.602129,-7.425803 11.894362,-14.599061 9.91151,-19.843878 -1.821154,-2.225772 -4.90392,-3.280268 -8.855024,-3.391879 -4.137149,-0.116867 -9.235802,0.815155 -14.830198,2.50684 -6.093864,-4.056748 -13.462191,-6.091016 -20.833175,-6.091016 z m 0,1.779346 c 13.818094,0 27.63622,9.092025 28.277236,27.27172 C 72.153545,51.445697 64.217572,56.62597 56.423925,61.125634 47.770585,66.121641 38.304367,70.846367 30.296732,73.523133 24.714702,68.375459 21.159418,60.538156 21.766067,50.002405 20.579839,29.400977 35.289587,19.100171 49.999282,19.100171 Z m 30.693715,5.13647 c 3.624669,-0.02077 6.222761,1.118204 7.233224,3.866835 2.817408,3.379717 0.725467,8.043429 -4.056811,13.113408 -1.961659,-6.687815 -5.668379,-11.975046 -10.398052,-15.854251 2.676355,-0.702198 5.125373,-1.113981 7.221639,-1.125992 z m -2.453549,25.566514 c -0.0035,0.0673 -0.003,0.131735 -0.0069,0.19925 C 79.916275,79.244007 49.579528,87.726183 32.669243,75.462343 40.691332,72.69329 49.49624,68.5545 57.90908,63.697345 65.271687,59.446541 72.297028,54.660569 78.239498,49.803155 Z M 16.13147,58.79256 c 1.963093,6.690574 5.671833,11.979589 10.405004,15.858882 C 19.22542,76.567686 13.668805,76.239346 12.072339,71.8967 9.2567123,68.519111 11.353928,63.858639 16.13147,58.79256 Z",
		iconStyle: {
			marginLeft: tabIcon1n4X,
			marginTop: tabIcon1n4Y,
		},
	},
];


//* Notifications
// Notifications.setNotificationHandler({
// 	handleNotification: async () => ({
// 		shouldPlaySound: true,
// 		shouldSetBadge: true,
// 		shouldShowBanner: true,
// 		shouldShowList: true,
// 	}),
// });


//* Prompts
const promptContentWidth = GLOBAL.slot.width - (2 * GLOBAL.screen.horizOffset);
const promptBtnHeight = 80;


//* Stylesheet
const styles = StyleSheet.create({
	screen: {
		width: GLOBAL.screen.width,
		height: GLOBAL.screen.height,
	},

	prompt: {
		position: "absolute",
		justifyContent: "space-between",
		alignItems: "center",
		width: GLOBAL.screen.width,
		height: GLOBAL.screen.height,
	},

	promptTopContainer: {
		justifyContent: "center",
		alignItems: "center",
		width: promptContentWidth,
		marginTop: GLOBAL.screen.topOffset + promptBtnHeight,
	},

	promptTitle: {
		textAlign: "center",
		width: GLOBAL.slot.width,
		fontFamily: "Trickster-Reg-Semi",
		fontSize: 1.9 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
	},

	promptImg: {
		width: promptContentWidth,
		height: 0.6 * promptContentWidth,
		borderWidth: GLOBAL.ui.inputBorderWidth,
		borderColor: GLOBAL.ui.palette[0],
		borderRadius: GLOBAL.screen.horizOffset,
		marginTop: GLOBAL.ui.bodyTextSize,
	},

	promptSubtitle: {
		width: "90%",
		textAlign: "center",
		fontFamily: "Trickster-Reg-Semi",
		fontSize: 0.8 * GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
		marginTop: GLOBAL.ui.bodyTextSize,
	},

	promptBottomContainer: {
		alignItems: "center",
		width: "100%",
		marginBottom: promptBtnHeight,
	},

	promptNotNowText: {
		fontFamily: "Trickster-Reg-Semi",
		fontSize: GLOBAL.ui.bodyTextSize,
		color: GLOBAL.ui.palette[0],
		textDecorationLine: "underline",
	},

	slotMask: {
		position: "absolute",
		top: GLOBAL.screen.topOffset,
		width: GLOBAL.slot.width,
		height: GLOBAL.slot.height,
	},

	slotBG: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: GLOBAL.ui.palette[1],
	},

	tabContainer: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
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


type PromptTypes = {
	animStyle: any;
	title: string;
	img: any;
	imgColor: any;
	subtitles: string[];
	btn: any;
	onNotNowPress: () => void;
}
const Prompt = (props: PromptTypes) => {
	return (
		<Reanimated.View style={[styles.prompt, props.animStyle]}>
			<View style={[styles.promptTopContainer, GLOBAL.ui.btnShadowStyle(), GLOBAL.ui.skewStyle]}>
				<Text style={styles.promptTitle}>{ props.title }</Text>

				<ExpoImage
					style={[styles.promptImg, { backgroundColor: props.imgColor }]}
					source={props.img}
					contentFit="cover"
				/>

				{props.subtitles.map((subtitle, s) => (
					<Text key={`prompt-subtitle${s}`} style={styles.promptSubtitle}>{subtitle}</Text>
				))}
			</View>

			<View style={[styles.promptBottomContainer, GLOBAL.ui.skewStyle]}>
				{props.btn}

				<TouchableOpacity
					style={[{ marginTop: GLOBAL.ui.bodyTextSize }, GLOBAL.ui.btnShadowStyle()]}
					hitSlop={GLOBAL.ui.bodyTextSize}
					onPress={props.onNotNowPress}
				>
					<Text style={styles.promptNotNowText}>Not now...</Text>
				</TouchableOpacity>
			</View>
		</Reanimated.View>
	);
}

export default function Layout() {
	//* App storage
	const InitDefaultSaveData = GLOBAL.useSaveStore(state => state.initDefaultSaveData);
	const WriteDefaultSaveToFile = GLOBAL.useSaveStore(state => state.writeDefaultSaveToFile);
	const LoadSave = GLOBAL.useSaveStore(state => state.loadSave);
	const IsSaveLoaded = GLOBAL.useSaveStore(state => state.isSaveLoaded);
	const SetIsSaveLoaded = GLOBAL.useSaveStore(state => state.setIsSaveLoaded);
	const WriteNewSaveToFile = GLOBAL.useSaveStore(state => state.writeNewSaveToFile);

	const PromptsCompleted = GLOBAL.useSaveStore(state => state.promptsCompleted);
	const SetPromptCompleted = GLOBAL.useSaveStore(state => state.setPromptCompleted);
	const NeedsToGeolocate = GLOBAL.useSaveStore(state => state.needToGeolocate);
	const SetNeedsToGeolocate = GLOBAL.useSaveStore(state => state.setNeedToGeolocate);
	const ScheduleNotifs = GLOBAL.useSaveStore(state => state.scheduleNotifs);

	const ActiveTab = GLOBAL.useSaveStore(state => state.activeTab);
	const SetActiveTab = GLOBAL.useSaveStore(state => state.setActiveTab);
	const ActiveBody = GLOBAL.useSaveStore(state => state.activeBody);
	const SavedCities = GLOBAL.useSaveStore(state => state.savedCities);
	const SetHereCity = GLOBAL.useSaveStore(state => state.setHereCity);


	//* Meat and potatoes
	const screenInsets = useSafeAreaInsets();

	useEffect(() => {
		GLOBAL.screen.topOffset = screenInsets.top;
		InitDefaultSaveData();

		// Development
		// WriteDefaultSaveToFile(); //^ Save write
		// SetIsSaveLoaded(true);

		// Production
		LoadSave();
	}, []);

	useEffect(() => {
		if (IsSaveLoaded) {
			SavedCities.map(city => city.setNextBodyTimes(ActiveBody!));
			ScheduleNotifs();
			SetNeedsToGeolocate(true);
		}
	}, [IsSaveLoaded]);


	//* Geolocation
	useEffect(() => {
		if (NeedsToGeolocate) {
			(async () => {
				const { granted: locGranted } = await ExpoLocation.getForegroundPermissionsAsync();
				if (locGranted) {
					const position = await ExpoLocation.getCurrentPositionAsync({});
					if (!position) {
						console.log("Failed to get current position");
						return; // bail early
					}
					const lat = position.coords.latitude;
					const lon = position.coords.longitude;

					const results = await ExpoLocation.reverseGeocodeAsync({
						latitude: lat,
						longitude: lon,
					});
					if (!results || results.length === 0) {
						console.log("Failed to reverse geocode location");
						return; // bail early
					}

					const name = results[0]?.city ?? results[0]?.region ?? results[0]?.country;
					const city = new GLOBAL.City(name!, lat, lon);
					city.setNextBodyTimes(ActiveBody!);
					SetHereCity(city);
					console.log("Geolocation was a success!");
					WriteNewSaveToFile(); //^ Save write
					ScheduleNotifs();
				}
				SetNeedsToGeolocate(false);
			})();
		}
	}, [NeedsToGeolocate]);


	//* Fonts
	const [fontsLoaded, fontsError] = useFonts({
		"Trickster": require("../assets/fonts/Trickster/Trickster-Reg-Semi.otf"),
		"Hades TallFat": require("../assets/fonts/Hades/Hades-TallFat.ttf"),
		"Hades ShortFat": require("../assets/fonts/Hades/Hades-ShortFat.ttf"),
		"Hades SuperShortFat": require("../assets/fonts/Hades/Hades-SuperShortFat.ttf"),
		"Hades ShortSkinny": require("../assets/fonts/Hades/Hades-ShortSkinny.ttf"),
	});


	//* Tabs
	const [tabBeingPressed, setTabBeingPressed] = useState<number | null>(null);
	const tabBgColor = ActiveBody?.palette[2];
	const tabPressedBgColor = ActiveBody?.palette[3];


	//* Prompts + animations
	// Location
	const [isLocationBtnPressed, setIsLocationBtnPressed] = useState(false);
	const [isLocationBtnActive, setIsLocationBtnActive] = useState(false);
	const locationPromptProgress = useSharedValue(0);
	const locationPromptAnimStyle = useAnimatedStyle(() => {
		return {
			display: (locationPromptProgress.value == 0) ? "none" : "flex",
			opacity: locationPromptProgress.value,
		}
	});

	// Notifications
	const [isNotifBtnPressed, setIsNotifBtnPressed] = useState(false);
	const [isNotifBtnActive, setIsNotifBtnActive] = useState(false);
	const notifPromptProgress = useSharedValue((PromptsCompleted[0] && !PromptsCompleted[1]) ? 1 : 0);
	const notifPromptAnimStyle = useAnimatedStyle(() => {
		return {
			display: (notifPromptProgress.value == 0) ? "none" : "flex",
			opacity: notifPromptProgress.value,
		}
	});

	// Body
	const bodyProgress = useSharedValue(0);
	const bodyAnimStyle = useAnimatedStyle(() => {
		return {
			display: (bodyProgress.value == 0) ? "none" : "flex",
			opacity: bodyProgress.value,
		}
	});

	useEffect(() => {
		if (IsSaveLoaded) {
			locationPromptProgress.value = withTiming(
				(PromptsCompleted[0]) ? 0 : 1,
				{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.linear }
			);

			if (PromptsCompleted[0] && !PromptsCompleted[1]) {
				notifPromptProgress.value = withDelay(
					1000 * GLOBAL.ui.animDuration,
					withTiming(
						1, { duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.linear }
					)
				);
			}
			else if (PromptsCompleted[0] && PromptsCompleted[1]) {
				notifPromptProgress.value = withTiming(
					0, { duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.linear }
				);
			}

			bodyProgress.value = withDelay(
				1000 * GLOBAL.ui.animDuration,
				withTiming(
					(PromptsCompleted[0] && PromptsCompleted[1]) ? 1 : 0,
					{ duration: 2 * 1000 * GLOBAL.ui.animDuration, easing: Easing.linear }
				)
			);
		}
	}, [IsSaveLoaded, PromptsCompleted]);


	//* Components
	return (
		<View style={[styles.screen, { backgroundColor: ActiveBody?.palette[1] }]}>
			<Reanimated.View style={[
				{
					position: "absolute",
					alignItems: "center",
					width: GLOBAL.screen.width,
					height: GLOBAL.screen.height,
				},
				bodyAnimStyle
			]}>
				<StatusBar />

				{/* Tab background */}
				<Svg
					style={[styles.tabContainer, { bottom: GLOBAL.screen.bottomOffset }]}
					width={GLOBAL.slot.width}
					height={GLOBAL.nav.height + 1}
					viewBox={`0 0 100 ${GLOBAL.nav.ratio * 100}`}
				>
					<Path
						fill={GLOBAL.ui.palette[0]}
						d="M 0,0 V 28.332031 C 0,30.54117 1.5075156,33.302376 3.4407579,34.370727 19.64974,43.328153 38.346903,45 50,45 61.582973,45 80.314327,43.348091 96.559726,34.370693 98.49297,33.30236 100,30.54117 100,28.332031 V 0 Z"
					/>
				</Svg>

				{/* Tab decorations */}
				{tabArray.map((tab, t) => {
					const tabFillProgress = useSharedValue(0);

					useEffect(() => {
						tabFillProgress.value = withTiming(
							(ActiveTab == t) ? 1 : 0,
							{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.out(Easing.cubic) }
						);
					}, [ActiveTab]);

					const tabFillAnimStyle = useAnimatedProps(() => {
						return {
							fill: interpolateColor(
								tabFillProgress.value,
								[0, 1],
								[tabBgColor!, tabPressedBgColor!]
							),
						}
					});

					const tabUnpressedImgAnimStyle = useAnimatedStyle(() => {
						return { opacity: 1 - tabFillProgress.value }
					});

					const tabPressedImgAnimStyle = useAnimatedStyle(() => {
						return { opacity: tabFillProgress.value }
					});

					const tabIconAnimStyle = useAnimatedProps(() => {
						return {
							fill: interpolateColor(
								tabFillProgress.value,
								[0, 1],
								[GLOBAL.ui.palette[0], ActiveBody!.palette[0]]
							),
							stroke: interpolateColor(
								tabFillProgress.value,
								[0, 1],
								[GLOBAL.ui.palette[0], ActiveBody!.palette[0]]
							),
						}
					});

					return (
						<View
							key={`tab${t}`}
							style={[styles.tabContainer, { bottom: GLOBAL.screen.bottomOffset }]}
							pointerEvents="none"
						>
							{/* Tab fills */}
							<Svg
								style={[
									{ width: "100%", height: "100%" },
									(t !== ActiveTab && t !== tabBeingPressed) && GLOBAL.ui.btnShadowStyle()
								]}
								width={GLOBAL.slot.width}
								height={GLOBAL.nav.height + 1}
								viewBox={`0 0 100 ${GLOBAL.nav.ratio * 100}`}
							>
								<ReanimatedPath
									key={`tab-path${tab.key}`}
									animatedProps={tabFillAnimStyle}
									d={tab.handlePath}
								/>
							</Svg>

							{/* Tab aero states */}
							<ReanimatedExpoImage
								style={[styles.tabImg, tabUnpressedImgAnimStyle]}
								source={tab.unpressedSrc}
								contentFit="fill"
							/>
							<ReanimatedExpoImage
								style={[styles.tabImg, tabPressedImgAnimStyle]}
								source={tab.pressedSrc}
								contentFit="fill"
							/>

							{/* Tab icons */}
							<Svg
								style={[
									styles.tabIcon,
									tab.iconStyle,
									GLOBAL.ui.btnShadowStyle(
										(t !== ActiveTab) ? "down" : "middle",
										(t !== ActiveTab) ? "black" : ActiveBody?.palette[1]
									)
								]}
								viewBox="0 0 100 100"
							>
								<ReanimatedPath
									animatedProps={tabIconAnimStyle}
									strokeWidth={2}
									d={(t == 2) ? ActiveBody?.icon : tab.iconPath}
								/>
							</Svg>
						</View>
					);
				})}

				{/* Slot mask */}
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

					{/* <StarField /> */}

					<Slot />
					{/* <Stack screenOptions={{
						headerShown: false,
						animation: "fade_from_bottom",
						animationDuration: 1000 * GLOBAL.ui.animDuration,
						contentStyle: { backgroundColor: "black" },
					}}/> */}
				</MaskedView>

				{/* Tab handles */}
				<View
					style={[styles.tabContainer, { bottom: GLOBAL.screen.bottomOffset }]}
					pointerEvents="box-none"
				>
					{[2,1,3,0,4].map((t, i) => (
						<Pressable
							key={`tab-handle${i}`}
							style={[
								{ position: "absolute" },
								(t == 0 || t == 3) && {
									top: "31%",
									left: (t == 0) ? "-1%" : "auto",
									right: (t == 3) ? "-1%" : "auto",
									width: 0.18 * GLOBAL.slot.width,
									height: "50%",
									// backgroundColor: "#f00a",
									borderTopLeftRadius: "60%",
									borderBottomLeftRadius: "40%",
									transform: [
										{ scaleX: (t == 3) ? -1 : 1 },
										{ rotate: "-60deg" },
									],
								},
								(t == 1) && {
									bottom: "10%",
									left: (t == 1) ? "13.5%" : "auto",
									width: 0.25 * GLOBAL.slot.width,
									height: "38%",
									// backgroundColor: "#0f0a",
									borderTopLeftRadius: "60%",
									borderTopRightRadius: "10%",
									borderBottomLeftRadius: "20%",
									borderBottomRightRadius: "20%",
									transform: [{ rotate: "14deg" }],
								},
								(t == 2) && {
									right: "13%",
									bottom: "6%",
									width: 0.5 * GLOBAL.slot.width,
									height: "39%",
									// backgroundColor: "#00fa",
									borderTopLeftRadius: "20%",
									borderTopRightRadius: "40%",
									borderBottomLeftRadius: "20%",
									borderBottomRightRadius: "20%",
									transform: [{ rotate: "-6deg" }],
								},
							]}
							pointerEvents="auto"
							onPressIn={() => {
								if (t !== ActiveTab) {
									setTabBeingPressed(t);
								}
							}}
							onPress={() => {
								if (t !== ActiveTab) {
									SetActiveTab(t);
									router.replace(tabArray[t].href);
								}
							}}
							onPressOut={() => {
								if (t !== ActiveTab) {
									setTabBeingPressed(null);
								}
							}}
						></Pressable>
					))}
				</View>
			</Reanimated.View>

			<Prompt
				animStyle={notifPromptAnimStyle}
				title="² Notifications"
				img={require("../assets/images/prompts/notifications-shear.png")}
				imgColor="#d4d5d0"
				subtitles={[
					`${Application.applicationName} can send notifications to remind you when your next Pluto Time occurs.`,
					"For the best experience, choose\n\"Allow\" when prompted."
				]}
				btn={
					<RectBtn
						text="Enable Notifications"
						width={promptContentWidth}
						height={promptBtnHeight}
						borderRadius={GLOBAL.screen.horizOffset}
						isPressed={isNotifBtnPressed}
						isActive={isNotifBtnActive}
						color={ActiveBody?.palette[2]}
						pressedColor={ActiveBody?.palette[3]}
						onPressIn={() => {
							setIsNotifBtnPressed(true);
						}}
						onPress={async () => {
							await Notifications.requestPermissionsAsync();
							SetPromptCompleted(1, true);
							WriteNewSaveToFile(); //^ Save write
						}}
						onPressOut={() => {
							setIsNotifBtnPressed(false);
						}}
					/>
				}
				onNotNowPress={() => {
					Alert.alert(
						"Leave notifications disabled?",
						"You'll need to open the app manually to know when your next Pluto Time occurs. Notifications can always be changed later in Settings.",
						[
							{
								text: GLOBAL.ui.alertNo,
								style: "cancel",
							},
							{
								text: GLOBAL.ui.alertYes,
								style: "destructive",
								onPress: () => {
									SetPromptCompleted(1, true);
									WriteNewSaveToFile(); //^ Save write
								}
							},
						]
					);
				}}
			/>

			<Prompt
				animStyle={locationPromptAnimStyle}
				title="¹ Location Access"
				img={require("../assets/images/prompts/location-shear.png")}
				imgColor="black"
				subtitles={[
					`${Application.applicationName} uses your latitude and longitude to determine your geolocation and timing information, kind of like a weather app.`,
					`For the best experience, choose\n"Allow While Using App" when prompted.`
				]}
				btn={
					<RectBtn
						text="Enable Location Access"
						width={promptContentWidth}
						height={promptBtnHeight}
						borderRadius={GLOBAL.screen.horizOffset}
						isPressed={isLocationBtnPressed}
						isActive={isLocationBtnActive}
						color={ActiveBody?.palette[2]}
						pressedColor={ActiveBody?.palette[3]}
						onPressIn={() => {
							setIsLocationBtnPressed(true);
						}}
						onPress={async () => {
							await ExpoLocation.requestForegroundPermissionsAsync();
							SetPromptCompleted(0, true);
							WriteNewSaveToFile(); //^ Save write
							SetNeedsToGeolocate(true);
						}}
						onPressOut={() => {
							setIsLocationBtnPressed(false);
						}}
					/>
				}
				onNotNowPress={() => {
					Alert.alert(
						"Leave location access disabled?",
						"You'll need to set your location manually. Location access can always be changed later in Settings.",
						[
							{
								text: GLOBAL.ui.alertNo,
								style: "cancel",
							},
							{
								text: GLOBAL.ui.alertYes,
								style: "destructive",
								onPress: () => {
									SetPromptCompleted(0, true);
									WriteNewSaveToFile(); //^ Save write
								}
							},
						]
					);
				}}
			/>
		</View>
	);
}
