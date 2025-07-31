import { StyleSheet, Text, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import * as GLOBAL from "../global";


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
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: GLOBAL.uiColors[1],
			overflow: "hidden",
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Text>Saved Locations</Text>

			<View>
				<Svg viewBox="0 0 100 100">
					<Path fill="black" d="" />
				</Svg>
			</View>

			<View>
				{savedLocations.map((loc, i) => (
					<View key={`location${i + 1}`}>
						<Text></Text>
					</View>
				))}
			</View>
		</View>
	);
}
