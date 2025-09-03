import { Dimensions, Platform } from "react-native";
import * as SUNCALC from "suncalc";
import { create } from "zustand";
import { AllBodies, CelestialBody } from "./solar-system";


//* UI
export const ui = {
	colors: ["#ffffff", "#000000"],
	get bodyTextSize() {
		return 0.055 * slot.width;
	},
	skewStyle: Platform.select({
		ios: {
			transform: [{skewY: "-10deg"}]
		},
		android: {
			transform: [
				{perspective: 82100},
				{rotateX: "25deg"},
				{rotateY: "-25deg"},
				{scale: 1.1},
			],
		},
	}),
	get inputBorderWidth() {
		return 0.005 * slot.width;
	},
	btnShadowStyle: {
		shadowColor: "black",
		shadowOffset: {width: 0, height: 2},
		shadowRadius: 2,
		shadowOpacity: 0.6,
	},
	fps: 60,
}

export const screen = {
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
	get width() {
		return screen.width - 2 * screen.borderWidth;
	},
	get height() {
		return screen.height - screen.topOffset - screen.bottomOffset - nav.thickness - 2 * screen.borderWidth;
	},
	get ellipseSemiMajor() {
		return this.width / 2;
	},
	get ellipseSemiMinor() {
		return this.ellipseSemiMajor / 2;
	},
	borderRadius: 30,
};


//* App storage
export class City {
	name: string;
	lat: number;
	lon: number;
	nextBodyTime: Date;

	constructor(name: string, lat: number, lon: number) {
		this.name = name;
		this.lat = lat;
		this.lon = lon;
		this.nextBodyTime = new Date(0);
	}

	solarElevationAt(date: Date) {
		const pos = SUNCALC.getPosition(date, this.lat, this.lon);
		return (pos.altitude * 180) / Math.PI;
	}

	setNextBodyTime(body: CelestialBody) {
		const now = new Date();
		let date = new Date(now.getTime());
		let elevation = this.solarElevationAt(date);
		const isBefore = elevation <= body.targetElevation;
		const step = 60 * 1000; // 1 minute

		while (true) {
			date = new Date(date.getTime() + step);
			elevation = this.solarElevationAt(date);

			if (
				(isBefore && elevation > body.targetElevation) ||
				(!isBefore && elevation <= body.targetElevation)
			) {
				this.nextBodyTime = date;
				return;
			}
		}
	}

	getClockTime() {
		return this.nextBodyTime.toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
			hour12: true
		}).replace(/\s/g, "");
	}

	getDateLong() {
		return this.nextBodyTime.toLocaleDateString(undefined, {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	getDateShort() {
		return this.nextBodyTime.toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	isBodyTimeNow() {
		const now = new Date();
		const dt = this.nextBodyTime.getTime() - now.getTime();
		const threshold = 5 * 60 * 1000; // 5 minutes

		if (dt <= threshold) return true;
		return false;
	}
}


//* Initial values
const testSavedCities: City[] = [
	new City("Orleans", 41.7935216, -69.9604816),
	// new City("Chacharramendi", -37.331313, -65.65187),
	// new City("Longyearbyen", 78.216667, 15.633333),
	// new City("The Longest City Name You Can Think Of", -37.331313, -65.65187),
];


//* Zustrand
interface AppState {
	activeTab: number;
	setActiveTab: (index: number) => void;

	activeBody: CelestialBody;
	setActiveBody: (body: CelestialBody) => void;

	savedCities: City[];
	unshiftSavedCity: (loc: City) => void;
	pushSavedCity: (loc: City) => void;
	deleteSavedCity: (index: number) => void;

	activeCityIndex: number;
	setActiveCityIndex: (index: number) => void;

	notifFreqs: boolean[];
	setNotifFreq: (index: number) => void;

	notifReminders: boolean[];
	toggleNotifReminder: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
	activeTab: 2,
	setActiveTab: (index) => set({ activeTab: index }),

	activeBody: AllBodies.find(b => b.name === "Pluto")!,
	setActiveBody: (body) => set({ activeBody: body }),

	savedCities: testSavedCities,
	unshiftSavedCity: (loc) => set(state => ({
		savedCities: [loc, ...state.savedCities]
	})),
	pushSavedCity: (loc) => set(state => ({
		savedCities: [...state.savedCities, loc]
	})),
	deleteSavedCity: (index) => set(state => ({
		savedCities: [...state.savedCities.slice(0, index - 1), ...state.savedCities.slice(index)]
	})),

	activeCityIndex: 0,
	setActiveCityIndex: (index) => set({ activeCityIndex: index }),

	notifFreqs: [true, true],
	setNotifFreq: (index: number) => set(state => ({
		notifFreqs: state.notifFreqs.map((v, i) => i === index ? !v : v)
	})),

	notifReminders: [true, false, false],
	toggleNotifReminder: (index: number) => set(state => ({
		notifReminders: state.notifReminders.map((v, i) => i === index ? !v : v)
	})),
}));
