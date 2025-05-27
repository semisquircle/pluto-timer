import { useFonts } from "expo-font";
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { Renderer, TextureLoader } from "expo-three";
import React, { useEffect, useRef, useState } from "react";
import { GestureResponderEvent, Image, PanResponder, PanResponderGestureState, Text, View } from "react-native";
import * as THREE from "three";

import styles from "./styles";

type DragOffset = { x: number; y: number };
type Gesture = { x: number; y: number };

export default function Index() {
	const [loaded, error] = useFonts({
		"Velvelyne-Light": require("../assets/fonts/Velvelyne/Velvelyne-Light.otf"),
		"Velvelyne-Book": require("../assets/fonts/Velvelyne/Velvelyne-Book.otf"),
		"Velvelyne-Regular": require("../assets/fonts/Velvelyne/Velvelyne-Regular.otf"),
		"Velvelyne-Bold": require("../assets/fonts/Velvelyne/Velvelyne-Bold.otf"),
	});

	const [currentTime, setCurrentTime] = useState<Date>(new Date());
	const [currentHour, setCurrentHour] = useState<number>(12);
	const [currentMinute, setCurrentMinute] = useState<string>("00");
	const [currentMeridiem, setCurrentMeridiem] = useState<"AM" | "PM">("AM");
	const animationFrameId = useRef<number | null>(null);

	const plutoTiltDeg: number = -120;
	const plutoRotateSpeed: number = 0.003;
	const dragSpeed: number = 0.005;
	const settleSpeed: number = 0.08;

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
				dragOffset.current.x += dx * dragSpeed;
				dragOffset.current.y += dy * dragSpeed;
				lastGesture.current = { x: gestureState.moveX, y: gestureState.moveY };
			},
			onPanResponderRelease: () => {
				isDragging.current = false;
			},
		})
	).current;

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			setCurrentTime(now);
			const hour = now.getHours() % 12 === 0 ? 12 : now.getHours() % 12;
			setCurrentHour(hour);
			const minute = now.getMinutes().toString().padStart(2, "0");
			setCurrentMinute(minute);
			const meridiem = now.getHours() < 12 ? "AM" : "PM";
			setCurrentMeridiem(meridiem);
		};
		updateTime();
		const interval = setInterval(updateTime, 1000);

		return () => {
			clearInterval(interval);
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
		camera.position.z = 2;
		const renderer = new Renderer({ gl });
		renderer.setSize(width, height);

		// Lighting
		const light = new THREE.DirectionalLight(0xffffff, 2);
		light.position.set(0, 1, 0.25);
		scene.add(light);

		// Texture
		const plutoTexture = new TextureLoader().load(require("../assets/images/textures/pluto.jpg"));
		plutoTexture.minFilter = THREE.LinearFilter;
		plutoTexture.magFilter = THREE.LinearFilter;

		// Pluto
		const plutoGeometry = new THREE.SphereGeometry(1, 64, 64);
		const plutoMaterial = new THREE.MeshStandardMaterial({ map: plutoTexture });
		const plutoSphere = new THREE.Mesh(plutoGeometry, plutoMaterial);

		// Tilt group
		const tiltGroup = new THREE.Group();
		tiltGroup.add(plutoSphere);
		tiltGroup.rotation.z = plutoTiltDeg * (Math.PI / 180);

		// Outer/drag group
		const outerGroup = new THREE.Group();
		outerGroup.add(tiltGroup);
		scene.add(outerGroup);

		// Animate
		const render = () => {
			animationFrameId.current = requestAnimationFrame(render);

			plutoSphere.rotation.y += plutoRotateSpeed;

			if (isDragging.current) {
				outerGroup.rotation.x = dragOffset.current.y;
				outerGroup.rotation.y = dragOffset.current.x;
			} else {
				outerGroup.rotation.x += (0 - outerGroup.rotation.x) * settleSpeed;
				outerGroup.rotation.y += (0 - outerGroup.rotation.y) * settleSpeed;
				dragOffset.current.x += (0 - dragOffset.current.x) * settleSpeed;
				dragOffset.current.y += (0 - dragOffset.current.y) * settleSpeed;
			}

			renderer.render(scene, camera);
			gl.endFrameEXP();
		};
		render();
	};

	return (
		<View style={styles.screen}>
			<Image style={styles.glow} source={require("../assets/images/glow.png")} />
			<View
				style={styles.gl}
				{...panResponder.panHandlers}
				pointerEvents="box-none"
			>
				<GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
			</View>

			<Text style={styles.next}>The next Pluto time will occur at</Text>
			<Text style={styles.time}>{currentHour}:{currentMinute} {currentMeridiem}</Text>
		</View>
	);
}
