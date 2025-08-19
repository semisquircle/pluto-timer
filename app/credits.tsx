import { StyleSheet, Text, View } from "react-native";
import * as GLOBAL from "../ref/global";


export default function CreditsScreen() {
	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			alignItems: "center",
			width: GLOBAL.slot.width,
			height: GLOBAL.slot.height,
			overflow: "hidden",
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Text>Credits screen</Text>
		</View>
	);
}
