import { Dimensions } from "react-native";
import { create } from "zustand";
import { Bodies } from "./bodies";


export const uiColors: string[] = [
	"#ffffff",
	"#000000"
];

export const screenBorderRadius = { ios: 40 };

export const screenBorderWidth: number = 10;
export const screenTopOffset: number = 48;
export const screenBottomOffset: number = 11;

export const screenWidth: number = Dimensions.get("window").width;
export const screenHeight: number = Dimensions.get("window").height;

export const slotWidth: number = Dimensions.get("window").width - 2 * screenBorderWidth;

export const navRatio: number = 0.45;
export const navHeight: number = navRatio * slotWidth;
export const navThickness: number = (20 / (navRatio * 100)) * navHeight;

export const slotHeight: number = screenHeight - screenTopOffset - screenBottomOffset - navThickness - 3 * screenBorderWidth;

export const slotEllipseAxisRatio: number = 0.55; // Visual hack to account for tab spacing
export const slotEllipseSemiMajorAxis: number = slotWidth / 2;
export const slotEllipseSemiMinorAxis: number = slotEllipseAxisRatio * slotEllipseSemiMajorAxis;


interface BodyStore {
	body: any;
	setBody(bodyName: string): void;
}

export const useBodyStore = create<BodyStore>((set) => ({
    body: Bodies.find(b => b.name === "Pluto"),
    setBody: (bodyName: string) => set({ body: Bodies.find(b => b.name === bodyName) }),
}));
