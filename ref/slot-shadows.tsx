import { StyleSheet, View } from "react-native";
import { Path, Svg } from "react-native-svg";
import * as GLOBAL from "../ref/global";


const shadowWallOffset = 300;
const shadowExtension = GLOBAL.slot.borderRadius + GLOBAL.slot.shadowRadius;

const styles = StyleSheet.create({
	slotShadowContainer: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},

	slotShadowSvg: {
		shadowColor: GLOBAL.ui.palette[1],
		shadowRadius: GLOBAL.slot.shadowRadius,
		shadowOpacity: 1,
		shadowOffset: { width: 0, height: 0 },
	},
});


interface SlotTopShadowInterface { style?: any }
export function SlotTopShadow({ style }: SlotTopShadowInterface) {
	return (
		<View style={[styles.slotShadowContainer, style]} pointerEvents="none">
			{Array.from({ length: 4 }).map((_, i) => (
				<Svg
					key={`shadow-top-${i}`}
					style={[styles.slotShadowSvg, {
						position: "absolute",
						left: -shadowWallOffset,
						top: -shadowWallOffset,
						width: GLOBAL.slot.width + 2 * shadowWallOffset,
						height: GLOBAL.slot.width + 2 * shadowWallOffset,
					}]}
					viewBox={`0 0 ${GLOBAL.slot.width + 2 * shadowWallOffset} ${GLOBAL.slot.width + 2 * shadowWallOffset}`}
				>
					<Path
						fill={GLOBAL.ui.palette[1]}
						d={`
							M 0,0
							h ${GLOBAL.slot.width + (2 * shadowWallOffset)}
							v ${(shadowExtension) + shadowWallOffset}
							h ${-shadowWallOffset}
							v ${-shadowExtension + GLOBAL.slot.borderRadius}
							q 0,${-GLOBAL.slot.borderRadius} ${-GLOBAL.slot.borderRadius},${-GLOBAL.slot.borderRadius}
							h ${-GLOBAL.slot.width + (2 * GLOBAL.slot.borderRadius)}
							q ${-GLOBAL.slot.borderRadius},0 ${-GLOBAL.slot.borderRadius},${GLOBAL.slot.borderRadius}
							v ${shadowExtension - GLOBAL.slot.borderRadius}
							h ${-shadowWallOffset}
							z
						`}
					/>
				</Svg>
			))}
		</View>
	);
}


interface SlotBottomShadowInterface { style?: any }
export function SlotBottomShadow({ style }: SlotBottomShadowInterface) {
	return (
		<View style={[styles.slotShadowContainer, style]} pointerEvents="none">
			{Array.from({ length: 4 }).map((_, i) => (
				<Svg
					key={`shadow-bottom-${i}`}
					style={[styles.slotShadowSvg, {
						position: "absolute",
						left: -shadowWallOffset,
						bottom: -shadowWallOffset,
						width: GLOBAL.slot.width + 2 * shadowWallOffset,
						height: GLOBAL.slot.ellipseSemiMinor + shadowWallOffset,
					}]}
					viewBox={`0 0 ${GLOBAL.slot.width + 2 * shadowWallOffset} ${GLOBAL.slot.ellipseSemiMinor + shadowWallOffset}`}
				>
					<Path
						fill={GLOBAL.ui.palette[1]}
						d={`
							M 0,0
							h ${shadowWallOffset}
							a ${GLOBAL.slot.ellipseSemiMajor} ${GLOBAL.slot.ellipseSemiMinor}
								0 0 0 ${GLOBAL.slot.width},0
							h ${shadowWallOffset}
							v ${GLOBAL.slot.ellipseSemiMinor + shadowWallOffset}
							h ${-(GLOBAL.slot.width + 2 * shadowWallOffset)}
							z
						`}
					/>
				</Svg>
			))}
		</View>
	);
}
