import { StyleSheet } from "react-native";

const plutoDim: number = 1.5 * window.innerWidth;

const styles = StyleSheet.create({
	screen: {
		position: "relative",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "black",
	},
	
	next: {
		fontFamily: "Velvelyne-Regular",
		color: "white",
	},

	time: {
		width: window.innerWidth,
		textAlign: "center",
		fontFamily: "Velvelyne-Regular",
		fontSize: 70,
		letterSpacing: -7,
		color: "white",
		transform: [
			{ scaleX: 2 },
			{ skewX: "-10deg" },
		],
	},

	glow: {
		position: "absolute",
		bottom: -plutoDim / 2,
		width: plutoDim,
		height: plutoDim,
	},

	gl: {
		position: "absolute",
		bottom: -plutoDim / 2,
		width: plutoDim,
		height: plutoDim,
	},
});

export default styles;
