import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import * as Location from "expo-location";
import { Renderer, TextureLoader } from "expo-three";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, GestureResponderEvent, Image, PanResponder, PanResponderGestureState, StyleSheet, Text, View } from "react-native";
import * as SUNCALC from "suncalc";
import * as THREE from "three";
import * as GLOBAL from "../global";


const bodyDiameter = 1.1 * GLOBAL.slotWidth;
const glowDiameter = 1.5 * bodyDiameter;


export default function HomeScreen() {
	//* Body-ody-ody
	const body = GLOBAL.useBodyStore((s: any) => s.body);


	//* Top of screen body animation
	const animationFrameId = useRef<number | null>(null);

	const bodyRotateSpeed: number = 0.003;
	const bodyDragSpeed: number = 0.005;
	const bodySettleSpeed: number = 0.08;

	type DragOffset = { x: number; y: number };
	type Gesture = { x: number; y: number };

	const dragOffset = useRef<DragOffset>({ x: 0, y: 0 });
	const lastGesture = useRef<Gesture>({ x: 0, y: 0 });
	const isDragging = useRef<boolean>(false);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
				isDragging.current = true;
				lastGesture.current = { x: gestureState.x0, y: gestureState.y0 };
			},
			onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
				const dx = gestureState.moveX - lastGesture.current.x;
				const dy = gestureState.moveY - lastGesture.current.y;
				dragOffset.current.x += dx * bodyDragSpeed;
				dragOffset.current.y += dy * bodyDragSpeed;
				lastGesture.current = { x: gestureState.moveX, y: gestureState.moveY };
			},
			onPanResponderRelease: () => {
				isDragging.current = false;
			},
		})
	).current;

	useEffect(() => {
		return () => {
			if (animationFrameId.current !== null) {
				cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, []);

	const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
		//? pixelStorei fix
		const pixelStorei = gl.pixelStorei.bind(gl);
		gl.pixelStorei = function (...args) {
			const [parameter] = args;
			switch (parameter) {
				case gl.UNPACK_FLIP_Y_WEBGL:
					return pixelStorei(...args);
			}
		};

		// Three.js
		const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		camera.position.z = 1.645;
		const renderer = new Renderer({ gl });
		renderer.setSize(width, height);

		// Lighting
		const light = new THREE.DirectionalLight(0xffffff, 3);
		light.position.set(0, -1, 0.25);
		scene.add(light);

		// Texture
		const bodyTexture = new TextureLoader().load(require("../assets/images/textures/pluto.jpg"));
		bodyTexture.minFilter = THREE.LinearFilter;
		bodyTexture.magFilter = THREE.LinearFilter;

		// Body mesh
		const bodyGeometry = new THREE.SphereGeometry(1, 64, 64);
		const bodyMaterial = new THREE.MeshStandardMaterial({ map: bodyTexture });
		const bodySphere = new THREE.Mesh(bodyGeometry, bodyMaterial);

		// Tilt group
		const tiltGroup = new THREE.Group();
		tiltGroup.add(bodySphere);
		tiltGroup.rotation.z = -body?.axialTilt * (Math.PI / 180);

		// Outer/drag group
		const outerGroup = new THREE.Group();
		outerGroup.add(tiltGroup);
		scene.add(outerGroup);

		// Animate
		const render = () => {
			animationFrameId.current = requestAnimationFrame(render);

			bodySphere.rotation.y += bodyRotateSpeed;

			if (isDragging.current) {
				outerGroup.rotation.x = dragOffset.current.y;
				outerGroup.rotation.y = dragOffset.current.x;
			} else {
				outerGroup.rotation.x += (0 - outerGroup.rotation.x) * bodySettleSpeed;
				outerGroup.rotation.y += (0 - outerGroup.rotation.y) * bodySettleSpeed;
				dragOffset.current.x += (0 - dragOffset.current.x) * bodySettleSpeed;
				dragOffset.current.y += (0 - dragOffset.current.y) * bodySettleSpeed;
			}

			renderer.render(scene, camera);
			gl.endFrameEXP();
		};
		render();
	};


	//* Time calculation
	function solarElevationAt(date: any, lat: number, lon: number) {
		const pos = SUNCALC.getPosition(date, lat, lon);
		return pos.altitude * 180 / Math.PI;
	}

	function findNextBodyTime(startDate: any, lat: number, lon: number) {
		const step = 60 * 1000; // 1-minute steps
		let date = new Date(startDate.getTime());
		let ele = solarElevationAt(date, lat, lon);
		const isBefore = (ele <= body.targetElevation);

		while (true) {
			date = new Date(date.getTime() + step);
			ele = solarElevationAt(date, lat, lon);
			if ((isBefore && ele > body.targetElevation) || (!isBefore && ele <= body.targetElevation)) {
				break;
			}
		}

		return date;
	}

	const [errorMsg, setErrorMsg] = useState<any>(null);
	const [currentPosition, setCurrentPosition] = useState<any>(null);
	const [currentLocation, setCurrentLocation] = useState<any>(null);
	const [isBodyTimeNow, setIsBodyTimeNow] = useState<boolean>(false);
	const [bodyTime, setBodyTime] = useState<any>("");
	const [bodyTimeDate, setBodyTimeDate] = useState<any>("");
	useEffect(() => {
		if (!body) return; // Wait until body is loaded

		(async () => {
			let {status} = await Location.requestForegroundPermissionsAsync();
			if (status !== "granted") {
				setErrorMsg("Permission to access location was denied");
				return;
			}

			let position = await Location.getCurrentPositionAsync({});
			let lat = position.coords.latitude;
			let lon = position.coords.longitude;
			// let lat = 17.9307;
			// let lon = 19.1045;
			setCurrentPosition(position);

			let [location] = await Location.reverseGeocodeAsync({
				latitude: lat,
				longitude: lon,
			});
			setCurrentLocation(location);

			let now = new Date();
			let next = findNextBodyTime(now, lat, lon);
			let dt = next.getTime() - now.getTime();
			let threshold = 5 * 60 * 1000; // 5 minutes

			if (dt <= threshold) {
				setIsBodyTimeNow(true);
			} else {
				setIsBodyTimeNow(false);

				let nextBodyTime = next.toLocaleTimeString(undefined, {hour: "numeric", minute: "2-digit", hour12: true});
				nextBodyTime = nextBodyTime.replace(/\s/g, "");
				setBodyTime(nextBodyTime);

				let nextBodyTimeDate = next.toLocaleDateString(undefined, {weekday: "long", year: "numeric", month: "long", day: "numeric"});
				setBodyTimeDate(nextBodyTimeDate);
			}
		})();
	}, [body]);


	//* Time size fitting
	let nextBodyTimeWidth = 0;
	const charWidths: any = {
		"A": 12,
		"P": 12,
		"M": 18.5,
		"0": 12,
		"1": 5.5,
		"2": 12,
		"3": 12,
		"4": 12,
		"5": 12,
		"6": 12,
		"7": 12,
		"8": 12,
		"9": 12,
		":": 5.5,
	}
	const charHeight = 57.5;
	for (let i = 0; i < bodyTime.length; i++) {
		let char = bodyTime[i];
		nextBodyTimeWidth += charWidths[char];
		if (i != bodyTime.length - 1) nextBodyTimeWidth++;
	}


	//* Orbit animation (soon to be altered)
	const orbitSemiMajorAxis = 0.1 * GLOBAL.slotWidth;
	const orbitSemiMinorAxis = orbitSemiMajorAxis * Math.sqrt(1 - Math.pow(body?.ecc, 2));
	const spinAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.loop(
			Animated.timing(
				spinAnim,
				{
					toValue: 1,
					duration: 1500,
					easing: Easing.linear,
					useNativeDriver: true
				}
			)
		).start();
	}, [spinAnim]);

	const spinCW = spinAnim.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});


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

		glow: {
			position: "absolute",
			top: -glowDiameter / 2,
			width: glowDiameter,
			height: glowDiameter,
		},

		gl: {
			width: bodyDiameter,
			height: bodyDiameter,
			marginTop: -bodyDiameter / 2,
		},

		timeContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			width: "100%",
		},
		
		nextText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Redaction50-Regular",
			fontSize: 20,
			color: GLOBAL.uiColors[0],
		},

		nextBodyTime: {
			fontFamily: "Redaction50-Bold",
			color: body?.colors[0],
		},

		timeText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "outward-semi",
			fontSize: ((GLOBAL.slotWidth - 2 * GLOBAL.screenBorderWidth) / nextBodyTimeWidth) * charHeight,
			color: GLOBAL.uiColors[0],
			marginTop: 7,
			overflow: "hidden",
		},

		dateText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Redaction50-Regular",
			fontSize: 20,
			marginTop: 7,
			color: body?.colors[0],
		},

		cityTextContainer: {
			justifyContent: "center",
			alignItems: "center",
			width: "100%",
			height: 60,
			marginTop: 20,
		},

		orbitSpinner: {
			position: "absolute",
			opacity: 0.2,
			borderWidth: 1,
			borderColor: GLOBAL.uiColors[0],
			borderRadius: "50%",
		},

		cityText: {
			width: "100%",
			textAlign: "center",
			fontFamily: "Redaction50-Italic",
			fontSize: 25,
			color: GLOBAL.uiColors[0],
		},
	});


	//* Components
	return (
		<View style={styles.content}>
			<Image style={styles.glow} source={require("../assets/images/glow.png")} />

			<View
				style={styles.gl}
				{...panResponder.panHandlers}
				pointerEvents="box-none"
			>
				<GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
			</View>

			<View style={styles.timeContainer}>
				<Text style={styles.nextText}>
					Your next <Text style={styles.nextBodyTime}>{body?.name} Time</Text> will occur at
				</Text>

				<Text style={styles.timeText}>{bodyTime}</Text>

				<Text style={styles.dateText}>
					<Text style={{ color: GLOBAL.uiColors[0] }}>on </Text>
					{bodyTimeDate}
				</Text>

				<View style={styles.cityTextContainer}>
					<Animated.View style={[
						styles.orbitSpinner,
						{
							width: 2 * orbitSemiMajorAxis,
							height: 2 * orbitSemiMinorAxis,
							transform: [{ rotate: spinCW }]
						}
					]}/>

					<Text style={styles.cityText}>
						{currentLocation?.city ? currentLocation.city + ", " : ""}
						{currentLocation?.region}
					</Text>
				</View>
			</View>
		</View>
	);
}
