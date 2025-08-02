import { StyleSheet, Text, View } from "react-native";
import * as GLOBAL from "../ref/global";


export default function LocationScreen() {
	const savedLocations = [
		{
			name: "Orleans",
			latitude: 41.7935216,
			longitude: -69.9604816,
		},
		{
			name: "Reykjavík",
			latitude: 64.1217408,
			longitude: -21.8214871,
		},
		{
			name: "Chacharramendi",
			latitude: -37.331313,
			longitude: -65.651870,
		},
	];


	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			alignItems: "center",
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
			padding: GLOBAL.screenBorderWidth,
			paddingTop: 2 * GLOBAL.screenBorderWidth,
			overflow: "hidden",
		},

		savedLocationsText: {
			width: "100%",
			textAlign: "right",
			fontFamily: "RandomWikiSerexine-Regular",
			fontSize: 30,
			marginBottom: GLOBAL.screenBorderWidth,
			color: GLOBAL.uiColors[0],
		},

		searchBar: {
			width: "100%",
			height: 40,
			marginBottom: GLOBAL.screenBorderWidth,
			borderRadius: GLOBAL.screenBorderWidth,
			backgroundColor: "white",
		},

		locationContainer: {
			width: "100%",
		},

		location: {
			width: "100%",
			height: 100,
			borderRadius: GLOBAL.screenBorderWidth,
			backgroundColor: "white",
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Text style={styles.savedLocationsText}>Saved Locations</Text>

			<View style={styles.searchBar}>
				{/* <Svg viewBox="0 0 100 100">
					<Path fill="black" d="" />
				</Svg> */}
			</View>

			<View style={styles.locationContainer}>
				{savedLocations.map((loc, i) => (
					<View
						key={`location${i + 1}`}
						style={[
							styles.location,
							(i > 0) ? {marginTop: GLOBAL.screenBorderWidth} : {}
						]}
					>
						<Text></Text>
					</View>
				))}
			</View>
		</View>
	);
}
