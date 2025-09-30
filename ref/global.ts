import { File, Paths } from "expo-file-system";
import { Dimensions, Platform } from "react-native";
import * as SUNCALC from "suncalc";
import { create } from "zustand";
import { AllBodies, CelestialBody } from "./solar-system";


//* UI
export const ui = {
	palette: ["#ffffff", "#000000"],
	get bodyTextSize() {
		return 0.055 * slot.width;
	},
	skewAngle: -10,
	get skewStyle() {
		return Platform.select({
			ios: {
				transform: [{skewY: `${this.skewAngle}deg`}]
			},
			android: {
				transform: [
					{perspective: 82100},
					{rotateX: "25deg"},
					{rotateY: "-25deg"},
					{scale: 1.1},
				],
			},
		});
	},
	get inputBorderWidth() {
		return 0.005 * slot.width;
	},
	btnShadowStyle(direction="down", color="black") {
		let offset = 0;
		switch (direction) {
			case "up": offset = -1; break;
			case "middle": offset = 0; break;
			case "down": offset = 1; break;
		}

		return {
			shadowColor: color,
			shadowOffset: {
				width: 0,
				height: offset * this.inputBorderWidth
			},
			shadowRadius: this.inputBorderWidth,
			shadowOpacity: 0.7,
		}
	},
	animDuration: 0.2,
	fps: 60,
}

export const screen = {
	topOffset: 59,
	bottomOffset: 20,
	horizOffset: 10,
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
		return screen.width - 2 * screen.horizOffset;
	},
	get height() {
		return screen.height - screen.topOffset - screen.bottomOffset - nav.thickness;
	},
	get ellipseSemiMajor() {
		return this.width / 2;
	},
	get ellipseSemiMinor() {
		return this.ellipseSemiMajor / 2;
	},
	borderRadius: 30,
	shadowRadius: 35,
};


//* City class
export class City {
	name: string;
	lat: number;
	lng: number;
	nextBodyTime: Date;

	constructor(name: string, lat: number, lon: number) {
		this.name = name;
		this.lat = lat;
		this.lng = lon;
		this.nextBodyTime = new Date(0);
	}

	solarElevationAt(date: Date) {
		const pos = SUNCALC.getPosition(date, this.lat, this.lng);
		return (pos.altitude * 180) / Math.PI;
	}

	setNextBodyTime(body: CelestialBody) {
		const now = new Date();
		let date = new Date(now.getTime());
		let elevation = this.solarElevationAt(date);
		const isBefore = elevation <= body.targetAltitude;
		const step = 60 * 1000; // 1 minute

		while (true) {
			date = new Date(date.getTime() + step);
			elevation = this.solarElevationAt(date);

			if (
				(isBefore && elevation > body.targetAltitude) ||
				(!isBefore && elevation <= body.targetAltitude)
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


//* Zustand saving
const saveFile = new File(Paths.document, "save.json");

type saveStoreTypes = {
	// Save
	defaultSaveData: any, //! Not save worthy
	initDefaultSaveData: () => void, //! Not save worthy
	writeDefaultSaveToFile: () => void, //! Not save worthy

	isSaveLoaded: boolean, //! Not save worthy
	loadSave: () => void, //! Not save worthy
	writeNewSaveToFile: () => void, //! Not save worthy

	// Storage
	activeTab?: number,
	setActiveTab: (index: number) => void, //! Not save worthy

	activeBodyName: string,
	activeBody?: CelestialBody, //! Not save worthy
	setActiveBody: (bodyName: string) => void, //! Not save worthy

	savedCities: City[],
	setSavedCities: (cities: City[]) => void, //! Not save worthy
	unshiftSavedCity: (city: City) => void, //! Not save worthy
	pushSavedCity: (city: City) => void, //! Not save worthy
	deleteSavedCity: (index: number) => void, //! Not save worthy

	activeCityIndex: number,
	setActiveCityIndex: (index: number) => void, //! Not save worthy

	notifFreqs: boolean[],
	toggleNotifFreq: (index: number) => void, //! Not save worthy

	notifReminders: boolean[],
	toggleNotifReminder: (index: number) => void, //! Not save worthy

	isFormat24Hour: boolean,
	setIsFormat24Hour: (bool: boolean) => void, //! Not save worthy
}

export const useSaveStore = create<saveStoreTypes>((set, get) => ({
	defaultSaveData: null,
	initDefaultSaveData: async () => {
		const saveData = {...get()};
		delete saveData.defaultSaveData;
		delete saveData.activeTab;
		delete saveData.activeBody;
		set({ defaultSaveData: saveData });
	},
	writeDefaultSaveToFile: async () => {
		const dataToSaveJSON = JSON.stringify(get().defaultSaveData);
		saveFile.write(dataToSaveJSON);
		console.log("Wrote default data to save file.");
	},

	isSaveLoaded: false,
	loadSave: async () => {
		if (!saveFile.exists) {
			get().writeDefaultSaveToFile();
			console.log("Loaded preexisting data from save file.");
		} else {
			const dataFromSaveJSON = saveFile.textSync();
			const saveData = JSON.parse(dataFromSaveJSON);
			get().setActiveBody(saveData.activeBodyName);
			set({ savedCities: saveData.savedCities.map((city: any) => new City(city.name, city.lat, city.lng)) });
			get().setActiveCityIndex(saveData.activeCityIndex);
			set({ notifFreqs: saveData.notifFreqs });
			set({ notifReminders: saveData.notifReminders });
			set({ notifReminders: saveData.notifReminders });
			get().setIsFormat24Hour(saveData.isFormat24Hour);
			console.log("Loaded preexisting data from save file.");
		}
	},
	writeNewSaveToFile: async () => {
		const dataToSave = {...get()};
		delete dataToSave.defaultSaveData;
		delete dataToSave.activeTab;
		delete dataToSave.activeBody;
		const dataToSaveJSON = JSON.stringify(dataToSave);
		if (!saveFile.exists) saveFile.create();
		saveFile.write(dataToSaveJSON);
		console.log("Wrote new data to save file.");
	},

	activeTab: 2,
	setActiveTab: (index) => set({ activeTab: index }),

	activeBodyName: "Pluto",
	activeBody: AllBodies.find(b => b.name === "Pluto"),
	setActiveBody: (bodyName) => {
		set({ activeBodyName: bodyName });
		const body = AllBodies.find(b => b.name === bodyName);
		set({ activeBody: body });
	},

	savedCities: [
		// new City("Nowhere", 40, 74),
		new City("Orleans", 41.7935216, -69.9604816),
		new City("Chacharramendi", -37.331313, -65.65187),
		new City("The Longest City Name You Can Think Of", 78.216667, 15.633333),
	],
	setSavedCities: (cities) => {
		set({ savedCities: cities });
	},
	unshiftSavedCity: (city) => {
		set(state => ({ savedCities: [city, ...state.savedCities] }));
	},
	pushSavedCity: (city) => {
		set(state => ({ savedCities: [...state.savedCities, city] }));
	},
	deleteSavedCity: (index) => {
		set(state => ({ savedCities: [...state.savedCities.slice(0, index), ...state.savedCities.slice(index + 1)] }));
	},

	activeCityIndex: 0,
	setActiveCityIndex: (index) => {
		set({ activeCityIndex: index });
	},

	notifFreqs: [true, true],
	toggleNotifFreq: (index) => {
		set(state => ({ notifFreqs: state.notifFreqs.map((b, i) => i === index ? !b : b) }));
	},

	notifReminders: [true, false, false],
	toggleNotifReminder: (index) => {
		set(state => ({ notifReminders: state.notifReminders.map((b, i) => i === index ? !b : b) }));
	},

	isFormat24Hour: false,
	setIsFormat24Hour: (bool) => {
		set({ isFormat24Hour: bool });
	}
}));
