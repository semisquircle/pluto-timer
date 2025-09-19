import math
import pandas as pd
import numpy as np
from scipy.integrate import simpson
from scipy.interpolate import interp1d
from termcolor import colored

BODY_NAME = "Dysnomia"
SEMI_MAJOR_AU = 38.7145856606
TRANSMISSION = 1

SOLAR_CONSTANT_WM2 = 1361.0
VISIBLE_FRACTION = 0.433
WAVELENGTH_MIN, WAVELENGTH_MAX = 280, 840
VISIBLE_RANGE = (400, 800)

CSV_PATH = "DRL_spectra.csv"

def pluto_visible_irradiance():
	total_irr = SOLAR_CONSTANT_WM2 / (SEMI_MAJOR_AU**2)
	return total_irr * VISIBLE_FRACTION * TRANSMISSION

def process_city_spectra_vectorized(csv_path):
	df = pd.read_csv(csv_path, header=None, low_memory=False)

	solar_elevs = df.iloc[2, 1:].astype(float).values
	n_wavelengths = WAVELENGTH_MAX - WAVELENGTH_MIN + 1
	wavelengths = np.arange(WAVELENGTH_MIN, WAVELENGTH_MAX + 1)

	spectra = df.iloc[5:5 + n_wavelengths, 1:].astype(float).values

	# Mask visible range
	mask = (wavelengths >= VISIBLE_RANGE[0]) & (wavelengths <= VISIBLE_RANGE[1])
	wavelengths_visible = wavelengths[mask]
	spectra_visible = spectra[mask, :]

	# Full Simpson integral (vectorized)
	I1 = simpson(spectra_visible, x=wavelengths_visible, axis=0)

	# Coarse Simpson integral using every other wavelength for error estimate
	I2 = simpson(spectra_visible[::2, :], x=wavelengths_visible[::2], axis=0)

	# Richardson error estimate
	error = np.abs(I1 - I2) / 15

	return solar_elevs, I1, error

def earth_solar_elevation_for_pluto(target_irr, solar_elevs, visible_irr):
	mask = (~np.isnan(solar_elevs)) & (~np.isnan(visible_irr)) & (visible_irr > 0)
	elev = solar_elevs[mask]
	irr = visible_irr[mask]

	f = interp1d(np.log10(irr), elev, kind="linear", fill_value="extrapolate")
	return float(f(math.log10(target_irr)))

if __name__ == "__main__":
	pluto_irr = pluto_visible_irradiance()
	solar_elevs, visible_irr, visible_err = process_city_spectra_vectorized(CSV_PATH)
	matched_elev = earth_solar_elevation_for_pluto(pluto_irr, solar_elevs, visible_irr)

	print()
	print("{}'s visible irradiance at noon: {:.10f} W/m²".format(BODY_NAME, pluto_irr))
	print("Integration error estimate: {:.10f} W/m²".format(visible_err[0]))
	print()
	print(colored("targetAltitude: {:.10f},".format(matched_elev), "green"))
	print()
