import * as GLOBAL from "@/ref/global";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Reanimated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Circle, ClipPath, Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop, Svg } from "react-native-svg";


const ReanimatedPressable = Reanimated.createAnimatedComponent(Pressable);


type ReactBtnTypes = {
	style?: any;
	text: string;
	width: number;
	height: number;
	borderRadius: number;
	isPressed: boolean;
	isActive: boolean;
	color: any;
	pressedColor: any;
	onPressIn: () => void;
	onPress: () => void;
	onPressOut: () => void;
}
export const RectBtn = (props: ReactBtnTypes) => {
	const pressProgress = useSharedValue(0);
	useEffect(() => {
		pressProgress.value = withTiming(
			(props.isPressed || props.isActive) ? 1 : 0,
			{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.linear }
		);
	}, [props.isPressed, props.isActive]);
	const animStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: interpolateColor(
				pressProgress.value,
				[0, 1],
				[props.color, props.pressedColor]
			)
		}
	});

	return (
		<ReanimatedPressable
			style={[
				{
					justifyContent: "center",
					alignItems: "center",
					width: props.width,
					height: props.height,
					borderRadius: props.borderRadius,
				},
				props.style,
				(!props.isPressed) && GLOBAL.ui.btnShadowStyle(),
				animStyle
			]}
			onPressIn={props.onPressIn}
			onPress={props.onPress}
			onPressOut={props.onPressOut}
		>
			<Svg
				style={{ position: "absolute", left: 0 }}
				width="100%"
				height="100%"
				viewBox={`0 0 ${props.width} ${props.height}`}
			>
				<Defs>
					<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
						<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
						<Stop offset="100%" stopColor="white" stopOpacity="0" />
					</LinearGradient>

					<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
						gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * (props.width - (2 * GLOBAL.ui.inputBorderWidth))}, 0)`}
					>
						<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
						<Stop offset="100%" stopColor="white" stopOpacity="0" />
					</RadialGradient>

					<ClipPath id="btn-clip">
						<Rect
							fill="transparent"
							x={0}
							y={0}
							width={props.width}
							height={props.height}
							rx={props.borderRadius}
						/>
					</ClipPath>
				</Defs>

				<Rect
					fill="url(#bottom-blob)"
					x={GLOBAL.ui.inputBorderWidth}
					y={GLOBAL.ui.inputBorderWidth}
					width={props.width - (2 * GLOBAL.ui.inputBorderWidth)}
					height={props.height - (2 * GLOBAL.ui.inputBorderWidth)}
					rx={props.borderRadius - GLOBAL.ui.inputBorderWidth}
				/>

				<Rect
					fill="url(#top-blob)"
					x={GLOBAL.ui.inputBorderWidth}
					y={GLOBAL.ui.inputBorderWidth}
					width={props.width - (2 * GLOBAL.ui.inputBorderWidth)}
					height={2 * (props.borderRadius - GLOBAL.ui.inputBorderWidth)}
					rx={props.borderRadius - GLOBAL.ui.inputBorderWidth}
				/>

				<Rect
					fill="transparent"
					stroke="black"
					strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
					opacity="0.25"
					x={0}
					y={0}
					width={props.width}
					height={props.height}
					rx={props.borderRadius}
					clipPath="url(#btn-clip)"
				/>
			</Svg>

			<View style={[{ position: "absolute", }, GLOBAL.ui.btnShadowStyle()]}>
				<Text style={{
					fontFamily: "Trickster-Reg-Semi",
					fontSize: GLOBAL.ui.bodyTextSize,
					color: GLOBAL.ui.palette[0],
				}}>
					{ props.text }
				</Text>
			</View>
		</ReanimatedPressable>
	);
}


type CircleBtnTypes = {
	style?: any;
	dimension: number;
	isPressed: boolean;
	color: any;
	pressedColor: any;
	onPressIn: () => void;
	onPress: () => void;
	onPressOut: () => void;
	children?: React.ReactNode;
}
export const CircleBtn = (props: CircleBtnTypes) => {
	const pressProgress = useSharedValue(0);
	useEffect(() => {
		pressProgress.value = withTiming(
			(props.isPressed) ? 1 : 0,
			{ duration: 1000 * GLOBAL.ui.animDuration, easing: Easing.linear }
		);
	}, [props.isPressed]);
	const animStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: interpolateColor(
				pressProgress.value,
				[0, 1],
				[props.color, props.pressedColor]
			)
		}
	});

	return (
		<ReanimatedPressable
			style={[
				{
					position: "relative",
					justifyContent: "center",
					alignItems: "center",
					width: props.dimension,
					height: props.dimension,
					borderRadius: "50%",
				},
				props.style,
				(!props.isPressed) && GLOBAL.ui.btnShadowStyle(),
				animStyle
			]}
			onPressIn={props.onPressIn}
			onPress={props.onPress}
			onPressOut={props.onPressOut}
		>
			<Svg
				style={{ position: "absolute" }}
				width="100%"
				height="100%"
				viewBox={`0 0 ${props.dimension} ${props.dimension}`}
			>
				<Defs>
					<LinearGradient id="top-blob" x1="0%" x2="0" y1="0%" y2="100%">
						<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
						<Stop offset="100%" stopColor="white" stopOpacity="0" />
					</LinearGradient>

					<RadialGradient id="bottom-blob" cx="50%" cy="100%" r="100%" fx="50%" fy="100%"
						gradientTransform={`matrix(0.5, 0, 0, 1, ${0.25 * props.dimension}, 0)`}
					>
						<Stop offset="0%" stopColor="white" stopOpacity="0.7" />
						<Stop offset="100%" stopColor="white" stopOpacity="0" />
					</RadialGradient>

					<ClipPath id="inner-clip">
						<Circle
							r={(props.dimension / 2) - GLOBAL.ui.inputBorderWidth}
							cx={props.dimension / 2}
							cy={props.dimension / 2}
						/>
					</ClipPath>

					<ClipPath id="outer-clip">
						<Circle
							r={props.dimension / 2}
							cx={props.dimension / 2}
							cy={props.dimension / 2}
						/>
					</ClipPath>
				</Defs>

				<Circle
					fill="url(#bottom-blob)"
					r={(props.dimension / 2) - GLOBAL.ui.inputBorderWidth}
					cx={props.dimension / 2}
					cy={props.dimension / 2}
					clipPath="url(#inner-clip)"
				/>

				<Ellipse
					fill="url(#top-blob)"
					rx={0.8 * ((props.dimension / 2) - GLOBAL.ui.inputBorderWidth)}
					ry={((props.dimension / 2) - GLOBAL.ui.inputBorderWidth) / 2}
					cx={props.dimension / 2}
					cy={GLOBAL.ui.inputBorderWidth + ((props.dimension / 2) - GLOBAL.ui.inputBorderWidth) / 2}
					clipPath="url(#inner-clip)"
				/>

				<Circle
					fill="transparent"
					stroke="black"
					strokeWidth={2 * GLOBAL.ui.inputBorderWidth}
					opacity="0.25"
					r={props.dimension / 2}
					cx={props.dimension / 2}
					cy={props.dimension / 2}
					clipPath="url(#outer-clip)"
				/>
			</Svg>

			{props.children}
		</ReanimatedPressable>
	);
}
