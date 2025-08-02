import { StyleSheet, Text, View } from "react-native";
import * as GLOBAL from "../ref/global";


export default function BodiesScreen() {
	//* Stylesheet
	const styles = StyleSheet.create({
		content: {
			alignItems: "center",
			width: GLOBAL.slotWidth,
			height: GLOBAL.slotHeight,
			overflow: "hidden",
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Text>Bodies screen</Text>
		</View>
	);
}
