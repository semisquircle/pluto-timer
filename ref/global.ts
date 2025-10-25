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
	fps: 16,
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
const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
export const bodyTimeLength = 0.5 * 60 * 1000;

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

	getNextSolarNoons(start: Date): Date[] {
		const results = [];
		for (let i = 0; results.length < this.nextBodyTimes.length; i++) {
			const date = new Date(start.getTime() + i * ONE_DAY);
			const { solarNoon } = SUNCALC.getTimes(date, this.lat, this.lng);
			solarNoon.setSeconds(0, 0);
			if (solarNoon.getTime() > start.getTime()) results.push(solarNoon);
		}
		return results;
	}

	getNextBodyTimes(start: Date, body: CelestialBody): Date[] {
		SUNCALC.addTime(body.targetAltitude, "bodyTimeMorning", "bodyTimeEvening");
		const results = [];
		for (let i = 0; results.length < this.nextBodyTimes.length; i++) {
			const date = new Date(start.getTime() + i * ONE_DAY);
			const times = SUNCALC.getTimes(date, this.lat, this.lng);
			const morning = times["bodyTimeMorning"];
			const evening = times["bodyTimeEvening"];
			morning.setSeconds(0, 0);
			evening.setSeconds(0, 0);
			if (morning.getTime() > start.getTime()) results.push(morning);
			if (evening.getTime() > start.getTime()) results.push(evening);
		}
		return results.slice(0, this.nextBodyTimes.length);
	}

	// getNextTestTimes(start: Date): Date[] {
	// 	const dt = 5;
	// 	const results = [];
	// 	const next = new Date(start);
	// 	next.setSeconds(0, 0);
	// 	const nextMinute = Math.ceil((start.getMinutes() + 1) / dt) * dt;
	// 	if (nextMinute >= 60) {
	// 		next.setHours(next.getHours() + 1);
	// 		next.setMinutes(0);
	// 	}
	// 	else next.setMinutes(nextMinute);
	// 	for (let i = 0; i < this.nextBodyTimes.length; i++) {
	// 		results.push(new Date(next.getTime() + i * dt * ONE_MINUTE));
	// 	}
	// 	return results;
	// }

	setNextBodyTimes(body: CelestialBody) {
		const now = new Date();
		const start = new Date(now.getTime() - bodyTimeLength);

		if (body.name == "Terra") this.nextBodyTimes = this.getNextSolarNoons(start);
		else this.nextBodyTimes = this.getNextBodyTimes(start, body);
		// else this.nextBodyTimes = this.getNextTestTimes(start);

		// console.log(this.name);
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
	setIsSaveLoaded: (bool: boolean) => void,
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
		saveData.promptsCompleted = [true, true];
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
	setIsSaveLoaded: (bool) => set({ isSaveLoaded: bool }),
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
		get().setIsSaveLoaded(true);
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
			const scheduleLocalNotif = (title: string, boddy: string, date: Date) => {
				Notifications.scheduleNotificationAsync({
					content: {
						title: title,
						body: boddy,
						interruptionLevel: "critical",
					},
					trigger: {
						type: Notifications.SchedulableTriggerInputTypes.DATE,
						date: date,
					},
				});
			}
			
			const activeBody = get().activeBody;
			const activeCityIndex = get().activeCityIndex;
			const activeCity = get().savedCities[activeCityIndex];
			const timeName = (activeBody?.name == "Terra") ? "Solar Noon" : `${activeBody?.name} Time`;
			const freqs = get().notifFreqs;
			const reminders = get().notifReminders;

			const youAreHere = (activeCityIndex == 0);
			const isTerra = (activeBody?.name == "Terra");
			const cityText = (youAreHere) ?  "" : ` in ${activeCity.name}`;

			const titleTexts = [
				`It's ${timeName}${cityText}!`,
				`Almost ${timeName}${cityText}...`,
				`Almost ${timeName}${cityText}...`,
			];

			const currentBoddyText = (isTerra)
				? `${(youAreHere) ? "it's" : "It's"} the brightest moment of the day${cityText}.`
				: `${(youAreHere) ? "the" : "The"} sunlight${cityText} ${(youAreHere) ? "around you " : ""}now matches high noon on ${activeBody?.name}.`;

			const futureBoddyText = (isTerra)
				? `it will be the brightest moment of the day${cityText}.`
				: `the sunlight${cityText} will match high noon on ${activeBody?.name}.`;

			const boddyTexts = [
				`${(youAreHere) ? "Step outside – " : ""}${currentBoddyText}`,
				`In just five minutes, ${futureBoddyText}`,
				`In ten minutes, ${futureBoddyText}`,
			];

			Notifications.cancelAllScheduledNotificationsAsync();
			activeCity.nextBodyTimes.map((nextBodyTime) => {
				if (nextBodyTime.getTime() > Date.now()) {
					const isBeforeNoon = (nextBodyTime.getHours() < 12);
					const fiveMinBefore = new Date(nextBodyTime.getTime() - (5 * ONE_MINUTE));
					const tenMinBefore = new Date(nextBodyTime.getTime() - (10 * ONE_MINUTE));

					if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[0])
						scheduleLocalNotif(titleTexts[0], boddyTexts[0], nextBodyTime);
					if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[1])
						scheduleLocalNotif(titleTexts[1], boddyTexts[1], fiveMinBefore);
					if (((isBeforeNoon == freqs[0]) || (!isBeforeNoon == freqs[1])) && reminders[2])
						scheduleLocalNotif(titleTexts[2], boddyTexts[2], tenMinBefore);
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

	savedCities: [
		new City("Reykjavík", 64.13548, -21.89541),
		// new City("Manchester", 42.15032, -84.03772),
	],
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
