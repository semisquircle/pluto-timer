import { File, Paths } from "expo-file-system";
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
	get btnShadowStyle() {
		return {
			shadowColor: "black",
			shadowOffset: {width: 0, height: this.inputBorderWidth},
			shadowRadius: this.inputBorderWidth,
			shadowOpacity: 0.7,
		}
	},
	animDuration: 0.2,
	fps: 60,
}

export const screen = {
	topOffset: 0,
	bottomOffset: 0,
	borderWidth: 10,
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
		return screen.height - screen.topOffset - screen.bottomOffset - nav.thickness;
	},
	get ellipseSemiMajor() {
		return this.width / 2;
	},
	get ellipseSemiMinor() {
		return this.ellipseSemiMajor / 2;
	},
	borderRadius: 30,
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
// const saveFile = FileSystem.documentDirectory + "save.json";
const saveFile = new File(Paths.document, "save.json");

type saveStoreTypes = {
	activeTab?: number,
	setActiveTab: (index: number) => void,

	isSaveLoaded: boolean,
	loadSave: () => void,
	writeSave: () => void,

	activeBodyName: string,
	activeBody?: CelestialBody,
	setActiveBody: (bodyName: string) => void,

	savedCities: City[],
	unshiftSavedCity: (city: City) => void,
	pushSavedCity: (city: City) => void,
	deleteSavedCity: (index: number) => void,

	activeCityIndex: number,
	setActiveCityIndex: (index: number) => void,

	notifFreqs: boolean[],
	toggleNotifFreq: (index: number) => void,

	notifReminders: boolean[],
	toggleNotifReminder: (index: number) => void,

	isFormat24Hour: boolean,
	setIsFormat24Hour: (bool: boolean) => void,
}

export const useSaveStore = create<saveStoreTypes>((set, get) => ({
	activeTab: 2,
	setActiveTab: (index) => set({ activeTab: index }),

	isSaveLoaded: false,
	loadSave: async () => {
		// const fileInfo = await FileSystem.getInfoAsync(saveFile);
		// if (!fileInfo.exists) {
			get().writeSave();
			console.log("Wrote default data to save file.");
		// } else {
		// 	const dataFromSaveJSON = await FileSystem.readAsStringAsync(saveFile);
		// 	const dataFromSave = JSON.parse(dataFromSaveJSON);
			
		// 	// Active body
		// 	get().setActiveBody(dataFromSave.activeBodyName);

		// 	// Saved cities
		// 	set({ savedCities: dataFromSave.savedCities.map((city: any) => new City(city.name, city.lat, city.lng)) });

		// 	// Active city index
		// 	get().setActiveCityIndex(dataFromSave.activeCityIndex);

		// 	// Notif freqs and reminders
		// 	set({ notifFreqs: dataFromSave.notifFreqs });
		// 	set({ notifReminders: dataFromSave.notifReminders });

		// 	console.log("Loaded data from save file.");
		// }

		set({ isSaveLoaded: true });
	},
	writeSave: async () => {
		const dataToSave = {...get()};
		delete dataToSave.activeTab;
		delete dataToSave.activeBody;
		const dataToSaveJSON = JSON.stringify(dataToSave);
		console.log(dataToSaveJSON);
		if (!saveFile.exists) saveFile.create();
		saveFile.write(dataToSaveJSON);
	},

	activeBodyName: "Pluto",
	activeBody: AllBodies.find(b => b.name === "Pluto"),
	setActiveBody: (bodyName) => {
		set({ activeBodyName: bodyName });
		const body = AllBodies.find(b => b.name === bodyName);
		set({ activeBody: body });
		// get().writeSave();
	},

	savedCities: [
		new City("Orleans", 41.7935216, -69.9604816),
		new City("Chacharramendi", -37.331313, -65.65187),
		new City("The Longest City Name You Can Think Of", 78.216667, 15.633333),
	],
	unshiftSavedCity: (city) => {
		set(state => ({ savedCities: [city, ...state.savedCities] }));
		// get().writeSave();
	},
	pushSavedCity: (city) => {
		set(state => ({ savedCities: [...state.savedCities, city] }));
		// get().writeSave();
	},
	deleteSavedCity: (index) => {
		set(state => ({ savedCities: [...state.savedCities.slice(0, index - 1), ...state.savedCities.slice(index)] }));
		// get().writeSave();
	},

	activeCityIndex: 0,
	setActiveCityIndex: (index) => {
		set({ activeCityIndex: index });
		// get().writeSave();
	},

	notifFreqs: [true, true],
	toggleNotifFreq: (index) => {
		set(state => ({ notifFreqs: state.notifFreqs.map((b, i) => i === index ? !b : b) }));
		// get().writeSave();
	},

	notifReminders: [true, false, false],
	toggleNotifReminder: (index) => {
		set(state => ({ notifReminders: state.notifReminders.map((b, i) => i === index ? !b : b) }));
		// get().writeSave();
	},

	isFormat24Hour: false,
	setIsFormat24Hour: (bool) => {
		set({ isFormat24Hour: bool });
	}
}));
