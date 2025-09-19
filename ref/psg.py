import requests
import numpy as np
from termcolor import colored

url = "https://psg.gsfc.nasa.gov/api.php"
config = """\
<OBJECT>Moon
<OBJECT-NAME>Dysnomia
<OBJECT-DATE>2025/01/01 12:00
<GENERATOR-RANGE1>400
<GENERATOR-RANGE2>850
<GENERATOR-RANGEUNIT>nm
<GENERATOR-RESOLUTION>50
<GENERATOR-RESOLUTIONUNIT>nm
"""
data = {
	"type": "trn",
	"watm": "y",
	"whdr": "n",
	"file": config,
}

response = requests.post(url, data=data)
response_text = response.text.strip()
print()
print(response_text)

trans_table = [list(map(float, line.split())) for line in response_text.splitlines()]
trans_totals = [row[1] for row in trans_table]
mean_trans = np.mean(trans_totals)

print()
print(colored('transmittance: {:.10f},'.format(mean_trans), "green"))
print()
