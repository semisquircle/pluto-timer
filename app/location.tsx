import { StyleSheet, Text, View } from "react-native";
import * as GLOBAL from "../global";


export default function LocationScreen() {
	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
			justifyContent: "center",
			alignItems: "center",
			backgroundColor: GLOBAL.uiColors[0],
			overflow: "hidden",
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Text>Location screen</Text>
		</View>
	);
}
