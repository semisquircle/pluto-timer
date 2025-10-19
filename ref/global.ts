import * as Application from "expo-application";
import { Directory, File, Paths } from "expo-file-system";
import * as Notifications from "expo-notifications";
import { Dimensions, Platform } from "react-native";
import * as SUNCALC from "suncalc";
import { create } from "zustand";
import FontPrefs from "./font-prefs.json" with { type: "json" };
import { AllBodies, CelestialBody } from "./solar-system";


export interface TimeFont {
	name: string,
	spacing: number,
	glyph_height: number,
	glyph_widths: { char: string, width: number }[],
}

//* UI
export const ui = {
	palette: ["#ffffff", "#000000", "#ff453a"],
	timeFonts: FontPrefs as TimeFont[],
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
			shadowOpacity: 0.5,
		}
	},
	animDuration: 0.2,
	fps: 20,
	alertYes: "Yerp!",
	alertNo: "Wait...",
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
const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_MINUTE = 60 * 1000;
export const bodyTimeLength = 5 * 60 * 1000;

export class City {
	name: string;
	lat: number;
	lng: number;
	nextBodyTimes = Array.from({ length: 10 }, () => new Date(Date.now() + 2 * ONE_DAY));

	constructor(name: string, lat: number, lon: number) {
		this.name = name;
		this.lat = lat;
		this.lng = lon;
	}

	solarAltitudeAt(date: Date): number {
		const pos = SUNCALC.getPosition(date, this.lat, this.lng);
		return pos.altitude * (180 / Math.PI);
	}

	findNextSolarNoon(start: Date): Date {
		let times = SUNCALC.getTimes(start, this.lat, this.lng);
		if (times.solarNoon.getTime() <= start.getTime()) {
			const tomorrow = new Date(start.getTime() + ONE_DAY);
			times = SUNCALC.getTimes(tomorrow, this.lat, this.lng);
		}
		return times.solarNoon;
	}

	findNextBodyTime(isBefore: boolean, targetAltitude: number, start: Date, end: Date): Date {
		let startT = start.getTime();
		let endT = end.getTime();
		while (endT - startT > ONE_MINUTE) {
			const midT = (startT + endT) / 2;
			const midDate = new Date(midT);
			const midAlt = this.solarAltitudeAt(midDate);
			if (
				(isBefore && midAlt > targetAltitude) ||
				(!isBefore && midAlt <= targetAltitude)
			) {
				endT = midT;
			} else {
				startT = midT;
			}
		}
		return new Date(endT);
		// let foo = new Date(start.getTime() + 2 * ONE_MINUTE);
		// return new Date(Math.round(foo.getTime() / ONE_MINUTE) * ONE_MINUTE);
	}

	setNextBodyTimes(body: CelestialBody) {
		let startTime = new Date();
		let targetTime = new Date(startTime.getTime() - ONE_MINUTE);
		for (let t = 0; t < this.nextBodyTimes.length; t++) {
			if (body.name == "Terra") targetTime = this.findNextSolarNoon(targetTime);
			else {
				const altitude = this.solarAltitudeAt(startTime);
				const isBefore = (altitude <= body.targetAltitude);
				const tomorrow = new Date(startTime.getTime());
				tomorrow.setHours(tomorrow.getHours() + 24);
				targetTime = this.findNextBodyTime(isBefore, body.targetAltitude, targetTime, tomorrow);
			}
			this.nextBodyTimes[t] = startTime = targetTime;
		}

		// this.nextBodyTimes.map((nextBodyTime) => {
		// 	console.log(`${nextBodyTime.toLocaleTimeString()} ${nextBodyTime.toLocaleDateString()}`);
		// });
	}

	get12HourClockTime() {
		return this.nextBodyTimes[0].toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
			hour12: true
		}).replace(/\s/g, "");
	}

	get24HourClockTime() {
		return this.nextBodyTimes[0].toLocaleTimeString(undefined, {
			hour: "numeric",
			minute: "2-digit",
			hour12: false
		});
	}

	getDateLong() {
		return this.nextBodyTimes[0].toLocaleDateString(undefined, {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	getDateShort() {
		return this.nextBodyTimes[0].toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	isBodyTimeNow() {
		const now = new Date();
		const dt = now.getTime() - this.nextBodyTimes[0].getTime();
		return (0 <= dt && dt <= bodyTimeLength) ? true : false;
	}
}


//* Zustand saving
const appVersion = Application.nativeApplicationVersion;
const saveDir = new Directory(Paths.document, "saves");
const saveFile = new File(saveDir, `save-${appVersion}.json`);

type saveStoreTypes = {
	// Saves
	defaultSaveData?: any, //^ Not save worthy
	initDefaultSaveData: () => void,
	writeDefaultSaveToFile: () => void,

	isSaveLoaded?: boolean, //^ Not save worthy
	loadSave: () => void,
	writeNewSaveToFile: () => void,

	// Permissions n' stuff
	promptsCompleted: boolean[],
	setPromptCompleted: (index: number, bool: boolean) => void,

	needToGeolocate?: boolean, //^ Not save worthy
	setNeedToGeolocate: (bool: boolean) => void,

	scheduleNotifs: () => void,

	// General storage
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
}

export const useSaveStore = create<saveStoreTypes>((set, get) => ({
	// Saves
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
	writeDefaultSaveToFile: async () => {
		const dataToSaveJSON = JSON.stringify(get().defaultSaveData);
		if (!saveDir.exists) saveDir.create();
		if (!saveFile.exists) saveFile.create();
		saveFile.write(dataToSaveJSON);
		console.log("Wrote default data to save file.");
	},

	isSaveLoaded: false,
	loadSave: async () => {
		if (saveFile.exists) {
			const dataFromSaveJSON = await saveFile.text();
			const saveData = JSON.parse(dataFromSaveJSON);
			set({ promptsCompleted: saveData.promptsCompleted });
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
	writeNewSaveToFile: async () => {
		const saveData = {...get()};
		delete saveData.defaultSaveData;
		delete saveData.isSaveLoaded;
		delete saveData.needToGeolocate;
		delete saveData.activeTab;
		delete saveData.activeBody;
		const saveDataJSON = JSON.stringify(saveData);
		if (!saveDir.exists) saveDir.create();
		if (!saveFile.exists) saveFile.create();
		saveFile.write(saveDataJSON);
		console.log("Wrote new data to save file.");
	},

	// Permissions n' stuff
	promptsCompleted: [false, false],
	setPromptCompleted: (index, bool) => {
		set(state => ({ promptsCompleted: state.promptsCompleted.map((p, i) => i === index ? bool : p) }));
	},

	needToGeolocate: false,
	setNeedToGeolocate: (bool) => set({ needToGeolocate: bool }),

	scheduleNotifs: async () => {
		const { granted: notifsGranted } = await Notifications.getPermissionsAsync();
		if (notifsGranted) {
			const scheduleLocalNotif = (title: string, content: string, date: Date) => {
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
			const timeName = (activeBody?.name == "Terra") ? "Solar Noon" : `${activeBody?.name} Time`;
			const contents = (activeBody?.name == "Terra") ? [
				`Step outside — it's the brightest moment of the day.`,
				`In just five minutes, it will be the brightest moment of the day.`,
				`In ten minutes, it will be the brightest moment of the day.`
			] : [
				`Step outside — the light around you now matches high noon on ${activeBody?.name}.`,
				`In just five minutes, the sunlight around you will match high noon on ${activeBody?.name}.`,
				`In ten minutes, the sunlight around you will match high noon on ${activeBody?.name}.`
			];
			const freqs = get().notifFreqs;
			const reminders = get().notifReminders;

			Notifications.cancelAllScheduledNotificationsAsync();
			activeCity.nextBodyTimes.map((nextBodyTime) => {
				if (nextBodyTime.getTime() > Date.now()) {
					const isBeforeNoon = (nextBodyTime.getHours() < 12);
					const fiveMinBefore = new Date(nextBodyTime.getTime() - (5 * ONE_MINUTE));
					const tenMinBefore = new Date(nextBodyTime.getTime() - (10 * ONE_MINUTE));

					if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[0])
						scheduleLocalNotif(`It's ${timeName}!`, contents[0], nextBodyTime);
					if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[1])
						scheduleLocalNotif(`Almost ${timeName}...`, contents[1], fiveMinBefore);
					if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[2])
						scheduleLocalNotif(`Almost ${timeName}...`, contents[2], tenMinBefore);
				}
			});
		}
	},

	// General storage
	activeTab: 2,
	setActiveTab: (index) => set({ activeTab: index }),

	activeBodyName: "Pluto",
	activeBody: AllBodies.find(b => b.name === "Pluto"),
	setActiveBody: (bodyName) => {
		set({ activeBodyName: bodyName });
		const body = AllBodies.find(b => b.name === bodyName);
		set({ activeBody: body });
	},

	savedCities: [new City("Nowhere", 40, 74)],
	setSavedCities: (cities) => set({ savedCities: cities }),
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
	setActiveCityIndex: (index) => set({ activeCityIndex: index }),

	notifFreqs: [true, true],
	toggleNotifFreq: (index) => {
		set(state => ({ notifFreqs: state.notifFreqs.map((b, i) => i === index ? !b : b) }));
	},

	notifReminders: [true, false, false],
	toggleNotifReminder: (index) => {
		set(state => ({ notifReminders: state.notifReminders.map((b, i) => i === index ? !b : b) }));
	},

	isFormat24Hour: false,
	setIsFormat24Hour: (bool) => set({ isFormat24Hour: bool }),
}));
