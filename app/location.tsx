import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ShadowView } from "react-native-inner-shadow";
import { Path, Svg } from "react-native-svg";
import * as GLOBAL from "../ref/global";


export default function LocationScreen() {
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


	//* Text fitting
	const locationHeight = 110;
	const locationPadding = GLOBAL.screen.borderWidth;
	const locationTextSize = 0.98 * locationHeight - (2 * locationPadding);

	function toDMS(coord: number, isLat: boolean) {
		const deg = Math.floor(Math.abs(coord));
		const minFloat = (Math.abs(coord) - deg) * 60;
		const min = Math.floor(minFloat);
		const sec = ((minFloat - min) * 60).toFixed(2);

		let dir;
		if (isLat) dir = coord >= 0 ? "N" : "S";
		else dir = coord >= 0 ? "E" : "W";

		return `${deg}° ${min}' ${sec}" ${dir}`;
	}


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			alignItems: "center",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			padding: GLOBAL.screen.borderWidth,
			paddingTop: GLOBAL.screen.borderWidth,
			transform: [{skewY: GLOBAL.slot.skew + "deg"}],
			overflow: "hidden",
		},

		savedLocationsText: {
			width: "100%",
			fontFamily: "Trickster-Reg",
			fontSize: 30,
			marginBottom: GLOBAL.screen.borderWidth,
			color: GLOBAL.ui.colors[0],
		},

		searchBar: {
			flexDirection: "row",
			alignItems: "center",
			width: "100%",
			height: 40,
			paddingLeft: locationPadding,
			marginBottom: GLOBAL.screen.borderWidth,
			borderRadius: GLOBAL.screen.borderWidth,
			backgroundColor: "white",
		},

		searchSvg: {
			width: 30,
			height: 30,
			marginRight: 0.5 * GLOBAL.screen.borderWidth,
		},

		searchText: {
			fontFamily: "Trickster-Reg",
			fontSize: 0.055 * GLOBAL.slot.width,
		},

		locationContainer: {
			width: "100%",
		},

		location: {
			width: "100%",
			height: locationHeight,
			borderRadius: GLOBAL.screen.borderWidth,
			overflow: "hidden",
		},

		locationWrapper: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			width: "100%",
			height: "100%",
			padding: locationPadding,
			paddingLeft: 1.2 * locationPadding,
		},

		locationName: {
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: ActiveBody?.colors[0],
		},

		locationNameContainer: {
			height: "100%",
		},

		youAreHere: {
			fontFamily: "Trickster-Reg-Arrow",
			fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		locationLat: {
			fontFamily: "Trickster-Reg",
			fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
			marginTop: "auto",
			color: GLOBAL.ui.colors[0],
		},

		locationLon: {
			fontFamily: "Trickster-Reg",
			fontSize: 0.6 * GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		locationTimeContainer: {
			marginVertical: "auto",
		},

		locationBodyTime: {
			textAlign: "right",
			fontFamily: "Hades-Short",
			fontSize: locationTextSize - GLOBAL.ui.bodyTextSize,
			color: GLOBAL.ui.colors[0],
		},

		locationBodyDate: {
			textAlign: "right",
			fontFamily: "Trickster-Reg",
			fontSize: GLOBAL.ui.bodyTextSize,
			color: ActiveBody?.colors[0],
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Text style={styles.savedLocationsText}>Saved Locations</Text>

			<View style={styles.searchBar}>
				<Svg style={styles.searchSvg} viewBox="0 0 100 100">
					<Path fill={GLOBAL.ui.colors[1]} stroke={GLOBAL.ui.colors[1]} strokeWidth="2" d="m 42.906738,10.415039 c -16.316584,0 -32.633047,10.406062 -33.766113,31.217285 1.641645,30.149185 35.152068,38.450985 54.360352,24.918457 8.95463,6.24131 16.471896,13.916224 22.551269,23.033203 l 4.806152,-4.806152 C 81.872109,78.782839 74.283505,71.386463 68.085938,62.598633 72.928502,57.506614 76.188788,50.522275 76.672852,41.632324 75.539786,20.821101 59.223323,10.415039 42.906738,10.415039 Z m 0,1.700684 c 14.050455,0 28.10084,9.838441 26.967774,29.516601 2.266131,39.351897 -56.201678,39.351897 -53.935547,0 -1.133066,-19.67816 12.917318,-29.516601 26.967773,-29.516601 z" />
				</Svg>
				<Text style={styles.searchText}>Search for a city</Text>
			</View>

			<ScrollView style={styles.locationContainer}>
				{SavedLocations.map((loc, i) => (
					<ShadowView
						key={`location${i + 1}`}
						inset
						backgroundColor={GLOBAL.ui.colors[1]}
						shadowColor="#aaa"
						shadowOffset={{ width: 0, height: 0 }}
						shadowBlur={10}
						style={{
							...styles.location,
							...(i > 0 && { marginTop: GLOBAL.screen.borderWidth })
						}}
					>
						<Pressable
							style={styles.locationWrapper}
							onPress={() => {
								SetActiveLocationIndex(i);
								SetActiveTab(2);
							}}
						>
							<View style={styles.locationNameContainer}>
								<Text style={styles.locationName}>{loc.name}</Text>
								{(i == 0) && <Text style={styles.youAreHere}>¹ You are here!</Text>}
								<Text style={styles.locationLat}>{toDMS(loc.lat, true)}</Text>
								<Text style={styles.locationLon}>{toDMS(loc.lon, false)}</Text>
							</View>

							<View style={styles.locationTimeContainer}>
								<Text style={styles.locationBodyTime}>{loc.nextBodyTime}</Text>
								<Text style={styles.locationBodyDate}>{loc.nextBodyDateShort}</Text>
							</View>
						</Pressable>
					</ShadowView>
				))}
			</ScrollView>
		</View>
	);
}
