import SolarSystemJson from "./solar-system.json" with { type: "json" };


export interface CelestialBody {
	name: string,

	canUse: boolean,
	hasRings: boolean,

	jplId: string,
	meanRadius: number, // km
	solarDist: number, // au
	transmittance: number,
	targetAltitude: number, // deg
	axialTilt: number, // deg

	colors: string[],
	seed: string,
	scale: {x: number, y: number},
	spriteSheet?: any,
	thumbnail?: any,

	palette: string[],
	icon: string,
	desc: string,
}

export interface CelestialSystem {
	name: string,
	type: string,
	parent: CelestialBody,
	moons: CelestialBody[],
}

interface SolarSystemImg {
	spriteSheet: any,
	thumbnail: any,
}

const solarSystemImgs: Record<string, SolarSystemImg> = {
	"Sol": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Sol.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Sol.png"),
	},
	"Mercury": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Mercury.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Mercury.png"),
	},
	"Venus": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Venus.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Venus.png"),
	},
	"Terra": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Terra.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Terra.png"),
	},
	"Luna": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Luna.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Luna.png"),
	},
	"Mars": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Mars.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Mars.png"),
	},
	"Phobos": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Phobos.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Phobos.png"),
	},
	"Deimos": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Deimos.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Deimos.png"),
	},
	"Ceres": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Ceres.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Ceres.png"),
	},
	"Jupiter": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Jupiter.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Jupiter.png"),
	},
	"Io": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Io.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Io.png"),
	},
	"Europa": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Europa.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Europa.png"),
	},
	"Ganymede": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Ganymede.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Ganymede.png"),
	},
	"Callisto": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Callisto.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Callisto.png"),
	},
	"Saturn": { // 3.7 and 0.3
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Saturn.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Saturn.png"),
	},
	"Titan": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Titan.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Titan.png"),
	},
	"Rhea": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Rhea.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Rhea.png"),
	},
	"Iapetus": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Iapetus.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Iapetus.png"),
	},
	"Dione": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Dione.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Dione.png"),
	},
	"Tethys": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Tethys.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Tethys.png"),
	},
	"Enceladus": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Enceladus.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Enceladus.png"),
	},
	"Mimas": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Mimas.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Mimas.png"),
	},
	"Uranus": { // 2.7 and 0.25
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Uranus.png"), // Rings: 1123178002
		thumbnail: require("@/assets/images/bodies/thumbnails/Uranus.png"),
	},
	"Titania": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Titania.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Titania.png"),
	},
	"Oberon": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Oberon.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Oberon.png"),
	},
	"Umbriel": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Umbriel.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Umbriel.png"),
	},
	"Ariel": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Ariel.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Ariel.png"),
	},
	"Miranda": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Miranda.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Miranda.png"),
	},
	"Neptune": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Neptune.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Neptune.png"),
	},
	"Triton": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Triton.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Triton.png"),
	},
	"Proteus": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Proteus.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Proteus.png"),
	},
	"Nereid": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Nereid.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Nereid.png"),
	},
	"Pluto": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Pluto.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Pluto.png"),
	},
	"Charon": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Charon.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Charon.png"),
	},
	"Nix": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Nix.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Nix.png"),
	},
	"Hydra": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Hydra.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Hydra.png"),
	},
	"Kerberos": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Kerberos.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Kerberos.png"),
	},
	"Styx": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Styx.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Styx.png"),
	},
	"Haumea": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Haumea.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Haumea.png"),
	},
	"Namaka": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Namaka.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Namaka.png"),
	},
	"Hi'iaka": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Hi'iaka.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Hi'iaka.png"),
	},
	"Makemake": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Makemake.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Makemake.png"),
	},
	"Eris": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Eris.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Eris.png"),
	},
	"Dysnomia": {
		spriteSheet: require("@/assets/images/bodies/sprite-sheets/Dysnomia.png"),
		thumbnail: require("@/assets/images/bodies/thumbnails/Dysnomia.png"),
	},
};

export const SolarSystem: CelestialSystem[] = SolarSystemJson.map(system => ({
	...system,
	parent: {
		...system.parent,
		...solarSystemImgs[system.parent.name],
	},
	moons: system.moons.map(moon => ({
		...moon,
		...solarSystemImgs[moon.name],
	})),
}));

export const AllBodies: CelestialBody[] = SolarSystem.flatMap((system) => [system.parent, ...system.moons]);
