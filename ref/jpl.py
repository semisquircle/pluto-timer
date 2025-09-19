from astroquery.jplhorizons import Horizons
import numpy as np
import ephem
from datetime import datetime
import requests
import re
from termcolor import colored

body_name = "Deimos"
body_id = "401"

# Averaging over 25 years
start_year = 2000
end_year = 2025
epochs = []
for year in range(start_year, end_year + 1):
	d = datetime(year, 1, 1, 12, 0, 0)
	ephem_date = ephem.Date(d)
	jd = ephem.julian_date(ephem_date)
	epochs.append(jd)

# NASA JPL Horizons
hznObj = Horizons(id=body_id, location='@sun', epochs=epochs)
hznElem = hznObj.elements()
hznEphem = hznObj.ephemerides_async().text

# Solar System OpenData
ssodHeaders = {
	'Authorization': 'Bearer 3bb6c0dc-4860-4b06-add4-b9be7e62f115',
	'Content-Type': 'application/json'
}
ssodRespose = requests.get('https://api.le-systeme-solaire.net/rest/bodies/' + body_name, headers=ssodHeaders)
ssodResposeJSON = ssodRespose.json()

body_name = hznElem['targetname'][0]
mean_radius_km = float(ssodResposeJSON['meanRadius'])
mean_radius_au = mean_radius_km / 149597870.7
perihelion_values = hznElem['q']
mean_perihelion = np.mean(perihelion_values)
solar_dist = mean_perihelion - mean_radius_au
axial_tilt = ssodResposeJSON['axialTilt']

print()
print(colored(body_name, "light_green", attrs=['bold']))
print(colored(f'jplId: "{body_id}",', 'green'))
print(colored(f'meanRadius: {mean_radius_km},', 'green'))
print(colored('solarDist: {:.10f},'.format(solar_dist), 'green'))
print(colored(f'axialTilt: {axial_tilt},', 'green'))
print()
