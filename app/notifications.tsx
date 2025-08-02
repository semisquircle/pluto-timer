import { StyleSheet, Text, View } from "react-native";
import * as GLOBAL from "../ref/global";


export default function NotificationsScreen() {
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
			<Text></Text>
		</View>
	);
}
