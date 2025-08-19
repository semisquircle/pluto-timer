import { Dimensions } from "react-native";
import * as SUNCALC from "suncalc";
import { create } from "zustand";
import { Bodies, CelestialBody } from "./bodies";


//* UI
export const ui = {
	colors: ["#ffffff", "#000000"],
	get bodyTextSize() {
		return 0.055 * slot.width;
	}
}

export const screen = {
	borderRadius: { ios: 40 },
	borderWidth: 10,
	topOffset: 48,
	bottomOffset: 11,
	width: Dimensions.get("window").width,
	height: Dimensions.get("window").height,
};

export const nav = {
	ratio: 0.45,
	get height() {
		return this.ratio * slot.width;
	},
	get thickness() {
		return (20 / (this.ratio * 100)) * this.height;
	},
};

export const slot = {
	width: Dimensions.get("window").width - 2 * screen.borderWidth,
	get height() {
		return screen.height - screen.topOffset - screen.bottomOffset - nav.thickness - 3 * screen.borderWidth;
	},
	get ellipseSemiMajor() {
		return this.width / 2;
	},
	get ellipseSemiMinor() {
		return this.ellipseSemiMajor / 2 + screen.borderWidth;
	},
	skew: -10,
};


//* App storage
interface SavedLocation {
	name: string;
	lat: number;
	lon: number;
	isBodyTimeNow: boolean;
	nextBodyTime: string;
	nextBodyDateLong: string;
	nextBodyDateShort: string;
}

const initialLocations: SavedLocation[] = [
	{
		name: "Null",
		lat: 100,
		lon: -100,
		isBodyTimeNow: false,
		nextBodyTime: "00:00PM",
		nextBodyDateLong: "Thursday, January 1, 1970",
		nextBodyDateShort: "01/01/1970",
	},
	{
		name: "Orleans",
		lat: 41.7935216,
		lon: -69.9604816,
		isBodyTimeNow: false,
		nextBodyTime: "00:00PM",
		nextBodyDateLong: "Thursday, January 1, 1970",
		nextBodyDateShort: "01/01/1970",
	},
	{
		name: "Reykjavík",
		lat: 64.1217408,
		lon: -21.8214871,
		isBodyTimeNow: false,
		nextBodyTime: "00:00PM",
		nextBodyDateLong: "Thursday, January 1, 1970",
		nextBodyDateShort: "01/01/1970",
	},
	{
		name: "Chacharramendi",
		lat: -37.331313,
		lon: -65.65187,
		isBodyTimeNow: false,
		nextBodyTime: "00:00PM",
		nextBodyDateLong: "Thursday, January 1, 1970",
		nextBodyDateShort: "01/01/1970",
	},
];

interface AppState {
	activeTab: number;
	setActiveTab: (index: number) => void;

	activeBody: CelestialBody;
	setActiveBody: (bodyName: string) => void;

	savedLocations: SavedLocation[];
	editSavedLocation: (index: number, updates: Partial<SavedLocation>) => void;

	activeLocationIndex: number;
	setActiveLocationIndex: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
	activeTab: 2,
	setActiveTab: (index) => set({ activeTab: index }),

	activeBody: Bodies.find((b) => b.name === "Pluto")!,
	setActiveBody: (bodyName) => set({ activeBody: Bodies.find((b) => b.name === bodyName)! }),

	savedLocations: initialLocations,
	editSavedLocation: (index, edits) => set((state) => ({
		savedLocations: state.savedLocations.map((loc, i) =>
			i === index ? { ...loc, ...edits } : loc
		),
	})),

	activeLocationIndex: 0,
	setActiveLocationIndex: (index) => set({ activeLocationIndex: index }),
}));


//* Time calculations
export function solarElevationAt(date: Date, lat: number, lon: number) {
	const pos = SUNCALC.getPosition(date, lat, lon);
	return (pos.altitude * 180) / Math.PI;
}

export function findNextBodyTime(startDate: Date, lat: number, lon: number, body: CelestialBody) {
	const step = 60 * 1000; // 1 minute
	let date = new Date(startDate.getTime());
	let elevation = solarElevationAt(date, lat, lon);
	const isBefore = elevation <= body.targetElevation;

	while (true) {
		date = new Date(date.getTime() + step);
		elevation = solarElevationAt(date, lat, lon);

		if (
			(isBefore && elevation > body.targetElevation) ||
			(!isBefore && elevation <= body.targetElevation)
		) {
			return date;
		}
	}
}
