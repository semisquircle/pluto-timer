import * as Application from "expo-application";
import { File, Paths } from "expo-file-system";
import * as Notifications from "expo-notifications";
import { Dimensions, Platform } from "react-native";
import * as SUNCALC from "suncalc";
import { create } from "zustand";
import { AllBodies, CelestialBody } from "./solar-system";


//* UI
export const ui = {
	palette: ["#ffffff", "#000000"],
	timeFonts: [
		{
			name: "Hades-TallFat",
			spacing: 1,
			glyphHeight: 57.5,
			glyphWidths: {
				"A": 12,
				"M": 18.5,
				"N": 18.5,
				"O": 12,
				"P": 12,
				"W": 18.5,
	
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
				"!": 5.5
			}
		},
		{
			name: "Hades-ShortFat",
			spacing: 1,
			glyphHeight: 44.5,
			glyphWidths: {
				"A": 12,
				"M": 18.5,
				"N": 18.5,
				"O": 12,
				"P": 12,
				"W": 18.5,
	
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
				"!": 5.5
			}
		},
		{
			name: "Hades-ShortSkinny",
			spacing: 1.5,
			glyphHeight: 51.5,
			glyphWidths: {
				"A": 12.5,
				"M": 19.5,
				"N": 19.5,
				"O": 12.5,
				"P": 12.5,
				"W": 19.5,
	
				"0": 12.5,
				"1": 5.5,
				"2": 12.5,
				"3": 12.5,
				"4": 12.5,
				"5": 12.5,
				"6": 12.5,
				"7": 12.5,
				"8": 12.5,
				"9": 12.5,
	
				":": 5.5,
				"!": 5.5
			}
		}
	],
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

	solarAltitudeAt(date: Date) {
		const pos = SUNCALC.getPosition(date, this.lat, this.lng);
		return pos.altitude * (180 / Math.PI);
	}

	setNextBodyTime(body: CelestialBody) {
		const now = new Date();

		if (body.name == "Terra") {
			const times = SUNCALC.getTimes(now, this.lat, this.lng);
			this.nextBodyTime = times.solarNoon;
		} else {
			let date = new Date(now.getTime());
			let altitude = this.solarAltitudeAt(date);
			//? Is the current altitude before the next target altitude for today?
			const isBefore = (altitude <= body.targetAltitude);
			const step = 60 * 1000; // 1 minute

			while (true) {
				date = new Date(date.getTime() + step);
				altitude = this.solarAltitudeAt(date);

				if (
					(isBefore && altitude > body.targetAltitude) ||
					(!isBefore && altitude <= body.targetAltitude)
				) {
					this.nextBodyTime = date;
					return;
				}
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
		const dt = Math.abs(this.nextBodyTime.getTime() - now.getTime());
		const threshold = 2.5 * 60 * 1000; // lasts for 5 minutes
		if (dt <= threshold) return true;
		return false;
	}
}


//* Zustand saving
const appVersion = Application.nativeApplicationVersion;
const saveFile = new File(Paths.document, `save-${appVersion}.json`);

type saveStoreTypes = {
	// Save
	defaultSaveData?: any, //^ Not save worthy
	initDefaultSaveData: () => void,
	writeDefaultSaveToFile: () => void,

	isSaveLoaded?: boolean, //^ Not save worthy
	loadSave: () => void,
	writeNewSaveToFile: () => void,

	// Storage
	needToGeolocate?: boolean, //^ Not save worthy
	setNeedToGeolocate: (bool: boolean) => void,

	activeTab?: number, //^ Not save worthy
	setActiveTab: (index: number) => void,

	activeBodyName: string,
	activeBody?: CelestialBody, //^ Not save worthy
	setActiveBody: (bodyName: string) => void,

	savedCities: City[],
	setSavedCities: (cities: City[]) => void,
	setHereCity: (city: City) => void,
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

	schedulePushNotifs: () => void,
}

export const useSaveStore = create<saveStoreTypes>((set, get) => ({
	// Save
	defaultSaveData: null,
	initDefaultSaveData: () => {
		const saveData = {...get()};
		delete saveData.defaultSaveData;
		delete saveData.isSaveLoaded;
		delete saveData.needToGeolocate;
		delete saveData.activeTab;
		delete saveData.activeBody;
		set({ defaultSaveData: saveData });
	},
	writeDefaultSaveToFile: () => {
		const dataToSaveJSON = JSON.stringify(get().defaultSaveData);
		if (!saveFile.exists) saveFile.create();
		saveFile.write(dataToSaveJSON);
		console.log("Wrote default data to save file.");
	},

	isSaveLoaded: false,
	loadSave: () => {
		if (saveFile.exists) {
			const dataFromSaveJSON = saveFile.textSync();
			const saveData = JSON.parse(dataFromSaveJSON);
			get().setActiveBody(saveData.activeBodyName);
			set({ savedCities: saveData.savedCities.map((city: any) => new City(city.name, city.lat, city.lng)) });
			get().setActiveCityIndex(saveData.activeCityIndex);
			set({ notifFreqs: saveData.notifFreqs });
			set({ notifReminders: saveData.notifReminders });
			get().setIsFormat24Hour(saveData.isFormat24Hour);
			console.log("Loaded preexisting data from save file.");
		}
		else console.log("No save file found, using default save data.");
		set({ isSaveLoaded: true });
	},
	writeNewSaveToFile: () => {
		const dataToSave = {...get()};
		delete dataToSave.defaultSaveData;
		delete dataToSave.isSaveLoaded;
		delete dataToSave.needToGeolocate;
		delete dataToSave.activeTab;
		delete dataToSave.activeBody;
		const dataToSaveJSON = JSON.stringify(dataToSave);
		if (!saveFile.exists) saveFile.create();
		saveFile.write(dataToSaveJSON);
		console.log("Wrote new data to save file.");
	},

	// Storage
	needToGeolocate: true,
	setNeedToGeolocate: (bool) => set({ needToGeolocate: bool }),

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
		new City("Nowhere", 40, 74),
		// new City("Orleans", 41.7935216, -69.9604816),
		// new City("Chacharramendi", -37.331313, -65.65187),
		// new City("The Longest City Name You Can Think Of", 78.216667, 15.633333),
	],
	setSavedCities: (cities) => {
		set({ savedCities: cities });
	},
	setHereCity: (city) => {
		set(state => ({ savedCities: [city, ...state.savedCities.slice(1)] }));
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
	},

	schedulePushNotifs: () => {
		const sendNotif = (title: string, content: string, date: Date) => {
			Notifications.scheduleNotificationAsync({
				content: {
					title: title,
					body: content,
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: date,
				},
			});
		}
		
		const activeBody = get().activeBody;
		const activeCity = get().savedCities[get().activeCityIndex];
		const freqs = get().notifFreqs;
		const reminders = get().notifReminders;

		const isBeforeNoon = (activeCity.nextBodyTime.getHours() < 12);
		const fiveMinBefore = new Date(activeCity.nextBodyTime.getTime() - (5 * 60 * 1000));
		const tenMinBefore = new Date(activeCity.nextBodyTime.getTime() - (10 * 60 * 1000));
		// const now = new Date();
		// const time = new Date(now.getTime() + (30 * 1000));
		// const fiveMinBefore = new Date(time.getTime() - (10 * 1000));
		// const tenMinBefore = new Date(time.getTime() - (20 * 1000));

		Notifications.cancelAllScheduledNotificationsAsync();
		if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[0])
			sendNotif(`It's ${activeBody?.name} Time!`, `Step outside — the light around you now matches high noon on ${activeBody?.name}.`, activeCity.nextBodyTime);
		if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[1])
			sendNotif(`Almost ${activeBody?.name} Time...`, `In five minutes, the sunlight around you will match high noon on ${activeBody?.name}.`, fiveMinBefore);
		if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[2])
			sendNotif(`Almost ${activeBody?.name} Time...`, `In ten minutes, the sunlight around you will match high noon on ${activeBody?.name}.`, tenMinBefore);
	},
}));
