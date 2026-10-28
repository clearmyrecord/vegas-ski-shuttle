"""Fetch resort-published snow figures. Missing or ambiguous values stay null."""
import datetime,json,pathlib,re,requests
from bs4 import BeautifulSoup
SOURCES={
 "brian": "https://www.brianhead.com/weather-conditions-webcams/",
 "snowbowl":"https://www.snowbowl.ski/the-mountain/weather-conditions-webcams/"
}
def parse(key,url):
 out={"source":url,"checked_at":datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),"verified":False,"snowfall_24h_inches":None,"snowfall_48h_inches":None,"snowfall_72h_inches":None,"snowfall_7day_inches":None,"base_depth_inches":None,"season_total_inches":None,"lifts_open":None,"lifts_total":None}
 try:
  r=requests.get(url,timeout=30,headers={"User-Agent":"Mozilla/5.0 (compatible; VegasSkiShuttle/1.0)"})
  r.raise_for_status()
  soup=BeautifulSoup(r.text,"html.parser")
  # Extract only snow report segment, not marketing text, forecast or archive.
  node=soup.find(string=re.compile(r"Snow Report",re.I))
  if not node: raise ValueError("Snow Report heading missing")
  text=soup.get_text(" ",strip=True)
  m=re.search(r"Snow Report\s+(.{0,900}?)\s+(?:Today.s Snow|Important Information|Current Conditions|Forecast|Trails Open)",text,re.I)
  if not m: raise ValueError("Snow report section not found")
  segment=m.group(1)
  def value(label):
   # Resort cards use value before label, e.g. 0″ 24 Hr.
   p=re.search(r"(\d+(?:\.\d+)?)\s*[\"″”]?\s*"+label+r"\b",segment,re.I)
   return float(p.group(1)) if p else None
  out["snowfall_24h_inches"]=value(r"24\s*Hr")
  out["snowfall_48h_inches"]=value(r"48\s*Hr")
  out["snowfall_72h_inches"]=value(r"72\s*Hr")
  out["snowfall_7day_inches"]=value(r"7\s*Day")
  out["base_depth_inches"]=value(r"Base\s*Depth")
  out["season_total_inches"]=value(r"Season\s*Total")
  lift=re.search(r"(\d+)\s*/\s*(\d+)\s*Lifts\s*Open",segment,re.I)
  if lift:out["lifts_open"],out["lifts_total"]=map(int,lift.groups())
  out["verified"]=any(out[k] is not None for k in ("snowfall_24h_inches","base_depth_inches","season_total_inches"))
 except Exception as e: print(key, "not updated:",str(e)[:200])
 return out
path=pathlib.Path("data/resort-snow.json")
new={key:parse(key,url) for key,url in SOURCES.items()}
# Never overwrite a verified report with a failed scrape; stale reports are hidden in UI.
if path.exists():
 old=json.loads(path.read_text())
 for key,v in new.items():
  if not v["verified"] and old.get(key,{}).get("verified"):new[key]=old[key]
path.parent.mkdir(parents=True,exist_ok=True)
path.write_text(json.dumps(new,indent=2)+"\n")
