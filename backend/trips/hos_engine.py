import math
import requests
import datetime
from typing import List, Dict, Any, Tuple, Optional

# Pre-populated coordinates for major US cities to guarantee instantaneous and reliable resolution
# even if Nominatim has network/rate limit hiccups
US_CITY_CACHE = {
    "chicago, il": {"lat": 41.8781, "lon": -87.6298, "name": "Chicago, IL"},
    "chicago": {"lat": 41.8781, "lon": -87.6298, "name": "Chicago, IL"},
    "dallas, tx": {"lat": 32.7767, "lon": -96.7970, "name": "Dallas, TX"},
    "dallas": {"lat": 32.7767, "lon": -96.7970, "name": "Dallas, TX"},
    "atlanta, ga": {"lat": 33.7490, "lon": -84.3880, "name": "Atlanta, GA"},
    "atlanta": {"lat": 33.7490, "lon": -84.3880, "name": "Atlanta, GA"},
    "los angeles, ca": {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles, CA"},
    "los angeles": {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles, CA"},
    "new york, ny": {"lat": 40.7128, "lon": -74.0060, "name": "New York, NY"},
    "new york": {"lat": 40.7128, "lon": -74.0060, "name": "New York, NY"},
    "houston, tx": {"lat": 29.7604, "lon": -95.3698, "name": "Houston, TX"},
    "houston": {"lat": 29.7604, "lon": -95.3698, "name": "Houston, TX"},
    "phoenix, az": {"lat": 33.4484, "lon": -112.0740, "name": "Phoenix, AZ"},
    "phoenix": {"lat": 33.4484, "lon": -112.0740, "name": "Phoenix, AZ"},
    "philadelphia, pa": {"lat": 39.9526, "lon": -75.1652, "name": "Philadelphia, PA"},
    "philadelphia": {"lat": 39.9526, "lon": -75.1652, "name": "Philadelphia, PA"},
    "san antonio, tx": {"lat": 29.4241, "lon": -98.4936, "name": "San Antonio, TX"},
    "san antonio": {"lat": 29.4241, "lon": -98.4936, "name": "San Antonio, TX"},
    "san diego, ca": {"lat": 32.7157, "lon": -117.1611, "name": "San Diego, CA"},
    "san diego": {"lat": 32.7157, "lon": -117.1611, "name": "San Diego, CA"},
    "san jose, ca": {"lat": 37.3382, "lon": -121.8863, "name": "San Jose, CA"},
    "austin, tx": {"lat": 30.2672, "lon": -97.7431, "name": "Austin, TX"},
    "austin": {"lat": 30.2672, "lon": -97.7431, "name": "Austin, TX"},
    "jacksonville, fl": {"lat": 30.3322, "lon": -81.6557, "name": "Jacksonville, FL"},
    "jacksonville": {"lat": 30.3322, "lon": -81.6557, "name": "Jacksonville, FL"},
    "columbus, oh": {"lat": 39.9612, "lon": -82.9988, "name": "Columbus, OH"},
    "columbus": {"lat": 39.9612, "lon": -82.9988, "name": "Columbus, OH"},
    "indianapolis, in": {"lat": 39.7684, "lon": -86.1581, "name": "Indianapolis, IN"},
    "indianapolis": {"lat": 39.7684, "lon": -86.1581, "name": "Indianapolis, IN"},
    "san francisco, ca": {"lat": 37.7749, "lon": -122.4194, "name": "San Francisco, CA"},
    "san francisco": {"lat": 37.7749, "lon": -122.4194, "name": "San Francisco, CA"},
    "seattle, wa": {"lat": 47.6062, "lon": -122.3321, "name": "Seattle, WA"},
    "seattle": {"lat": 47.6062, "lon": -122.3321, "name": "Seattle, WA"},
    "denver, co": {"lat": 39.7392, "lon": -104.9903, "name": "Denver, CO"},
    "denver": {"lat": 39.7392, "lon": -104.9903, "name": "Denver, CO"},
    "washington, dc": {"lat": 38.9072, "lon": -77.0369, "name": "Washington, DC"},
    "washington": {"lat": 38.9072, "lon": -77.0369, "name": "Washington, DC"},
    "boston, ma": {"lat": 42.3601, "lon": -71.0589, "name": "Boston, MA"},
    "boston": {"lat": 42.3601, "lon": -71.0589, "name": "Boston, MA"},
    "el paso, tx": {"lat": 31.7619, "lon": -106.4850, "name": "El Paso, TX"},
    "nashville, tn": {"lat": 36.1627, "lon": -86.7816, "name": "Nashville, TN"},
    "nashville": {"lat": 36.1627, "lon": -86.7816, "name": "Nashville, TN"},
    "detroit, mi": {"lat": 42.3314, "lon": -83.0458, "name": "Detroit, MI"},
    "detroit": {"lat": 42.3314, "lon": -83.0458, "name": "Detroit, MI"},
    "oklahoma city, ok": {"lat": 35.4676, "lon": -97.5164, "name": "Oklahoma City, OK"},
    "oklahoma city": {"lat": 35.4676, "lon": -97.5164, "name": "Oklahoma City, OK"},
    "portland, or": {"lat": 45.5152, "lon": -122.6784, "name": "Portland, OR"},
    "portland": {"lat": 45.5152, "lon": -122.6784, "name": "Portland, OR"},
    "las vegas, nv": {"lat": 36.1699, "lon": -115.1398, "name": "Las Vegas, NV"},
    "las vegas": {"lat": 36.1699, "lon": -115.1398, "name": "Las Vegas, NV"},
    "memphis, tn": {"lat": 35.1495, "lon": -90.0490, "name": "Memphis, TN"},
    "memphis": {"lat": 35.1495, "lon": -90.0490, "name": "Memphis, TN"},
    "louisville, ky": {"lat": 38.2527, "lon": -85.7585, "name": "Louisville, KY"},
    "baltimore, md": {"lat": 39.2904, "lon": -76.6122, "name": "Baltimore, MD"},
    "milwaukee, wi": {"lat": 43.0389, "lon": -87.9065, "name": "Milwaukee, WI"},
    "albuquerque, nm": {"lat": 35.0844, "lon": -106.6504, "name": "Albuquerque, NM"},
    "kansas city, mo": {"lat": 39.0997, "lon": -94.5786, "name": "Kansas City, MO"},
    "kansas city": {"lat": 39.0997, "lon": -94.5786, "name": "Kansas City, MO"},
    "omaha, ne": {"lat": 41.2565, "lon": -95.9345, "name": "Omaha, NE"},
    "raleigh, nc": {"lat": 35.7796, "lon": -78.6382, "name": "Raleigh, NC"},
    "miami, fl": {"lat": 25.7617, "lon": -80.1918, "name": "Miami, FL"},
    "miami": {"lat": 25.7617, "lon": -80.1918, "name": "Miami, FL"},
    "st. louis, mo": {"lat": 38.6270, "lon": -90.1994, "name": "St. Louis, MO"},
    "st louis, mo": {"lat": 38.6270, "lon": -90.1994, "name": "St. Louis, MO"},
    "st louis": {"lat": 38.6270, "lon": -90.1994, "name": "St. Louis, MO"},
    "st. louis": {"lat": 38.6270, "lon": -90.1994, "name": "St. Louis, MO"},
    "cleveland, oh": {"lat": 41.4993, "lon": -81.6944, "name": "Cleveland, OH"},
    "pittsburgh, pa": {"lat": 40.4406, "lon": -79.9959, "name": "Pittsburgh, PA"},
    "minneapolis, mn": {"lat": 44.9778, "lon": -93.2650, "name": "Minneapolis, MN"},
    "salt lake city, ut": {"lat": 40.7608, "lon": -111.8910, "name": "Salt Lake City, UT"},
    "salt lake city": {"lat": 40.7608, "lon": -111.8910, "name": "Salt Lake City, UT"},
    "new orleans, la": {"lat": 29.9511, "lon": -90.0715, "name": "New Orleans, LA"},
    "cincinnati, oh": {"lat": 39.1031, "lon": -84.5120, "name": "Cincinnati, OH"},
    "tampa, fl": {"lat": 27.9506, "lon": -82.4572, "name": "Tampa, FL"},
    "orlando, fl": {"lat": 28.5383, "lon": -81.3792, "name": "Orlando, FL"},
    "charlotte, nc": {"lat": 35.2271, "lon": -80.8431, "name": "Charlotte, NC"},
    "richmond, va": {"lat": 37.5407, "lon": -77.4360, "name": "Richmond, VA"},
    "sacramento, ca": {"lat": 38.5816, "lon": -121.4944, "name": "Sacramento, CA"},
    "little rock, ar": {"lat": 34.7465, "lon": -92.2896, "name": "Little Rock, AR"},
    "des moines, ia": {"lat": 41.5868, "lon": -93.6250, "name": "Des Moines, IA"},
    "boise, id": {"lat": 43.6150, "lon": -116.2023, "name": "Boise, ID"},
    "birmingham, al": {"lat": 33.5186, "lon": -86.8104, "name": "Birmingham, AL"},
}

def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in miles."""
    R = 3958.8  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def geocode_location(query: str) -> Dict[str, Any]:
    """Geocode an address or city using cache or Nominatim OpenStreetMap API."""
    cleaned = query.strip().lower()
    if cleaned in US_CITY_CACHE:
        c = US_CITY_CACHE[cleaned]
        return {"name": c["name"], "lat": c["lat"], "lon": c["lon"]}
    
    # Try partial matching on city names
    for key, val in US_CITY_CACHE.items():
        if key in cleaned or cleaned in key:
            return {"name": val["name"], "lat": val["lat"], "lon": val["lon"]}

    # Call Nominatim OSM Geocoder
    try:
        url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "TruckELDPlanner/1.0 (logistics-support@truckeld.com)"}
        params = {"q": query, "format": "json", "limit": 1, "countrycodes": "us,ca,mx"}
        resp = requests.get(url, params=params, headers=headers, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                first = data[0]
                display_name = first.get("display_name", query)
                parts = display_name.split(",")
                short_name = ", ".join(parts[:2]) if len(parts) >= 2 else display_name
                return {
                    "name": short_name.strip(),
                    "lat": float(first["lat"]),
                    "lon": float(first["lon"])
                }
    except Exception as e:
        print(f"Nominatim error for {query}: {e}")

    # Fallback to Chicago coordinates if completely unknown
    return {"name": query, "lat": 41.8781, "lon": -87.6298}

def fetch_osrm_route(start_coords: Tuple[float, float], end_coords: Tuple[float, float]) -> Dict[str, Any]:
    """
    Fetch realistic driving route from public OSRM, or fallback to interpolated highway path.
    start_coords: (lat, lon)
    end_coords: (lat, lon)
    """
    lat1, lon1 = start_coords
    lat2, lon2 = end_coords

    # Attempt OSRM public route
    try:
        url = f"https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=false"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
                route = data["routes"][0]
                distance_meters = route["distance"]
                distance_miles = distance_meters * 0.000621371
                duration_seconds = route["duration"]
                duration_hours = duration_seconds / 3600.0

                geojson_coords = route["geometry"]["coordinates"] # [ [lon, lat], ... ]
                path_coords = [[pt[1], pt[0]] for pt in geojson_coords]
                return {
                    "distance_miles": round(distance_miles, 1),
                    "duration_hours": round(duration_hours, 2),
                    "coordinates": path_coords
                }
    except Exception as e:
        print(f"OSRM error: {e}")

    # Fallback: Great circle with 1.20 highway circuity factor and 60 mph average truck speed
    air_dist = haversine_miles(lat1, lon1, lat2, lon2)
    highway_dist = max(5.0, air_dist * 1.20)
    truck_speed = 60.0 # mph
    est_hours = highway_dist / truck_speed

    # Generate interpolated waypoints
    num_pts = max(10, int(highway_dist / 30))
    coords = []
    for i in range(num_pts + 1):
        frac = i / float(num_pts)
        clat = lat1 + (lat2 - lat1) * frac
        clon = lon1 + (lon2 - lon1) * frac
        curve = math.sin(frac * math.pi) * 0.25 * ((lat1 + lon2) % 2 - 1)
        coords.append([round(clat + curve, 5), round(clon, 5)])

    return {
        "distance_miles": round(highway_dist, 1),
        "duration_hours": round(est_hours, 2),
        "coordinates": coords
    }

def format_hour_to_time(hour_float: float) -> str:
    """Convert float hours (e.g. 14.5) to '14:30'."""
    h = int(hour_float) % 24
    m = int(round((hour_float - int(hour_float)) * 60))
    if m == 60:
        h = (h + 1) % 24
        m = 0
    return f"{h:02d}:{m:02d}"

class HOSPlannerEngine:
    """
    Plans truck trips following FMCSA 70hr/8day property-carrying regulations:
    - 11 hours maximum driving time within a 14-hour window
    - 14 hours consecutive duty window limit
    - 30-minute break required after cumulative 8 hours of driving
    - 10 consecutive hours off-duty/sleeper to reset 11hr/14hr clock
    - 70-hour / 8-day cumulative limit
    - Fueling stop every <= 1,000 miles (approx 30 mins On Duty Not Driving)
    - 1 hour for pickup (On Duty Not Driving)
    - 1 hour for drop-off (On Duty Not Driving)
    """

    def __init__(
        self,
        current_location: str,
        pickup_location: str,
        dropoff_location: str,
        current_cycle_used: float = 0.0,
        carrier_name: str = "Apex Freight Logistics Inc.",
        main_office_address: str = "100 Logistics Blvd, Dallas, TX 75201",
        home_terminal_address: str = "450 Transport Way, Chicago, IL 60601",
        truck_number: str = "TRK-8821",
        trailer_number: str = "TLR-9042",
        shipper_commodity: str = "General Freight / Commercial Electronics",
        manifest_number: str = "BOL-78912",
        start_date_str: Optional[str] = None,
        start_hour: float = 6.0  # 6:00 AM start
    ):
        self.current_location_query = current_location
        self.pickup_location_query = pickup_location
        self.dropoff_location_query = dropoff_location
        self.current_cycle_used = float(current_cycle_used)
        self.carrier_name = carrier_name
        self.main_office_address = main_office_address
        self.home_terminal_address = home_terminal_address
        self.truck_number = truck_number
        self.trailer_number = trailer_number
        self.shipper_commodity = shipper_commodity
        self.manifest_number = manifest_number

        if start_date_str:
            try:
                self.start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
            except Exception:
                self.start_date = datetime.date.today()
        else:
            self.start_date = datetime.date.today()

        self.start_hour = float(start_hour) # 0.0 to 24.0

    def plan_trip(self) -> Dict[str, Any]:
        # 1. Geocode locations
        current_geo = geocode_location(self.current_location_query)
        pickup_geo = geocode_location(self.pickup_location_query)
        dropoff_geo = geocode_location(self.dropoff_location_query)

        # 2. Compute driving routes
        # Leg 1: Current -> Pickup
        leg1 = fetch_osrm_route(
            (current_geo["lat"], current_geo["lon"]),
            (pickup_geo["lat"], pickup_geo["lon"])
        )
        # Leg 2: Pickup -> Dropoff
        leg2 = fetch_osrm_route(
            (pickup_geo["lat"], pickup_geo["lon"]),
            (dropoff_geo["lat"], dropoff_geo["lon"])
        )

        total_trip_miles = leg1["distance_miles"] + leg2["distance_miles"]
        full_route_coordinates = leg1["coordinates"] + leg2["coordinates"]

        # 3. Simulate Trip Timeline with HOS Rules
        events: List[Dict[str, Any]] = []
        stops_for_map: List[Dict[str, Any]] = []

        current_odometer = 0.0
        
        # Helper to interpolate location coordinates along route based on miles
        def get_coords_at_mileage(mileage: float) -> Tuple[float, float, str]:
            if mileage <= leg1["distance_miles"]:
                ratio = mileage / max(1.0, leg1["distance_miles"])
                coords_list = leg1["coordinates"]
                idx = int(ratio * (len(coords_list) - 1))
                idx = max(0, min(len(coords_list) - 1, idx))
                lat, lon = coords_list[idx]
                loc_name = f"En Route to {pickup_geo['name']} (Mile {int(mileage)})"
                return lat, lon, loc_name
            else:
                leg2_miles = mileage - leg1["distance_miles"]
                ratio = leg2_miles / max(1.0, leg2["distance_miles"])
                coords_list = leg2["coordinates"]
                idx = int(ratio * (len(coords_list) - 1))
                idx = max(0, min(len(coords_list) - 1, idx))
                lat, lon = coords_list[idx]
                loc_name = f"En Route to {dropoff_geo['name']} (Mile {int(mileage)})"
                return lat, lon, loc_name

        # Initial Stop for Map: Origin
        stops_for_map.append({
            "id": "origin",
            "type": "current",
            "title": "Trip Origin",
            "location_name": current_geo["name"],
            "lat": current_geo["lat"],
            "lon": current_geo["lon"],
            "duration_hours": 0.5,
            "miles_from_start": 0.0,
            "notes": "Pre-trip inspection & departure"
        })

        # Pre-trip inspection (30 min On Duty ND)
        events.append({
            "status": "ON_DUTY_ND",
            "duration": 0.5,
            "description": "Pre-Trip Vehicle Inspection",
            "location_name": current_geo["name"],
            "miles_driven": 0.0,
            "start_mileage": 0.0,
            "end_mileage": 0.0
        })

        # HOS Tracking Clocks
        shift_driving_hours = 0.0       # Max 11.0
        shift_duty_window_hours = 0.5   # Max 14.0 (pre-trip added 0.5)
        continuous_driving_hours = 0.0  # Max 8.0 before 30-min break
        miles_since_fuel = 0.0          # Max 1,000 miles
        cumulative_cycle_hours = self.current_cycle_used + 0.5 # Track 70-hr limit

        # Function to insert 10-hour rest break
        def insert_10hr_rest(loc_name: str, cur_miles: float):
            nonlocal shift_driving_hours, shift_duty_window_hours, continuous_driving_hours
            events.append({
                "status": "SLEEPER",
                "duration": 10.0,
                "description": "10-Hour Mandatory Sleeper Berth Rest Break (FMCSA Reset)",
                "location_name": loc_name,
                "miles_driven": 0.0,
                "start_mileage": cur_miles,
                "end_mileage": cur_miles
            })
            shift_driving_hours = 0.0
            shift_duty_window_hours = 0.0
            continuous_driving_hours = 0.0

            lat, lon, _ = get_coords_at_mileage(cur_miles)
            stops_for_map.append({
                "id": f"rest_10hr_{len(stops_for_map)}",
                "type": "night_rest",
                "title": "10-Hour Sleeper Berth Rest",
                "location_name": loc_name,
                "lat": lat,
                "lon": lon,
                "duration_hours": 10.0,
                "miles_from_start": round(cur_miles, 1),
                "notes": "Full 10-hour rest to reset 11hr driving and 14hr window"
            })

            # Add morning pre-trip inspection (0.25 hr On Duty ND)
            events.append({
                "status": "ON_DUTY_ND",
                "duration": 0.25,
                "description": "Daily Vehicle Pre-Trip Inspection",
                "location_name": loc_name,
                "miles_driven": 0.0,
                "start_mileage": cur_miles,
                "end_mileage": cur_miles
            })
            shift_duty_window_hours += 0.25

        # Function to insert 30-minute break
        def insert_30min_break(loc_name: str, cur_miles: float):
            nonlocal shift_duty_window_hours, continuous_driving_hours
            events.append({
                "status": "OFF_DUTY",
                "duration": 0.5,
                "description": "30-Minute DOT Mandatory Rest Break",
                "location_name": loc_name,
                "miles_driven": 0.0,
                "start_mileage": cur_miles,
                "end_mileage": cur_miles
            })
            shift_duty_window_hours += 0.5
            continuous_driving_hours = 0.0

            lat, lon, _ = get_coords_at_mileage(cur_miles)
            stops_for_map.append({
                "id": f"break_30m_{len(stops_for_map)}",
                "type": "rest_30min",
                "title": "30-Min Mandatory Break",
                "location_name": loc_name,
                "lat": lat,
                "lon": lon,
                "duration_hours": 0.5,
                "miles_from_start": round(cur_miles, 1),
                "notes": "Mandatory 30-minute break taken prior to 8 hrs driving"
            })

        # Function to insert fuel stop
        def insert_fuel_stop(loc_name: str, cur_miles: float):
            nonlocal shift_duty_window_hours, miles_since_fuel, cumulative_cycle_hours
            events.append({
                "status": "ON_DUTY_ND",
                "duration": 0.5,
                "description": "Truck Fueling & DEF Top-off",
                "location_name": loc_name,
                "miles_driven": 0.0,
                "start_mileage": cur_miles,
                "end_mileage": cur_miles
            })
            shift_duty_window_hours += 0.5
            cumulative_cycle_hours += 0.5
            miles_since_fuel = 0.0

            lat, lon, _ = get_coords_at_mileage(cur_miles)
            stops_for_map.append({
                "id": f"fuel_{len(stops_for_map)}",
                "type": "fuel",
                "title": "Fueling Stop",
                "location_name": loc_name,
                "lat": lat,
                "lon": lon,
                "duration_hours": 0.5,
                "miles_from_start": round(cur_miles, 1),
                "notes": "Fueling at commercial travel center (required <= 1,000 miles)"
            })

        # Driving Simulator for a single leg
        def drive_leg(miles_to_drive: float, leg_name: str, dest_name: str):
            nonlocal current_odometer, shift_driving_hours, shift_duty_window_hours
            nonlocal continuous_driving_hours, miles_since_fuel, cumulative_cycle_hours

            remaining_leg_miles = miles_to_drive
            avg_speed = 60.0 # mph

            while remaining_leg_miles > 0.01:
                # Fuel limit: at least once every 1,000 miles
                miles_until_fuel = max(10.0, 950.0 - miles_since_fuel)

                # 8-hour continuous driving break limit
                hours_until_30min_break = max(0.1, 7.5 - continuous_driving_hours)
                miles_until_30min_break = hours_until_30min_break * avg_speed

                # 11-hour driving limit
                hours_until_11hr_drive = max(0.1, 11.0 - shift_driving_hours)
                miles_until_11hr_drive = hours_until_11hr_drive * avg_speed

                # 14-hour duty window limit
                hours_until_14hr_window = max(0.1, 14.0 - shift_duty_window_hours)
                miles_until_14hr_window = hours_until_14hr_window * avg_speed

                # Find which constraint happens first
                next_chunk_miles = min(
                    remaining_leg_miles,
                    miles_until_fuel,
                    miles_until_30min_break,
                    miles_until_11hr_drive,
                    miles_until_14hr_window
                )

                chunk_drive_hours = round(next_chunk_miles / avg_speed, 2)
                start_m = current_odometer
                current_odometer += next_chunk_miles
                end_m = current_odometer

                shift_driving_hours += chunk_drive_hours
                shift_duty_window_hours += chunk_drive_hours
                continuous_driving_hours += chunk_drive_hours
                miles_since_fuel += next_chunk_miles
                cumulative_cycle_hours += chunk_drive_hours
                remaining_leg_miles -= next_chunk_miles

                _, _, cur_loc_label = get_coords_at_mileage(current_odometer)

                events.append({
                    "status": "DRIVING",
                    "duration": chunk_drive_hours,
                    "description": f"Driving: {leg_name} (Mile {int(start_m)} to {int(end_m)})",
                    "location_name": cur_loc_label,
                    "miles_driven": round(next_chunk_miles, 1),
                    "start_mileage": round(start_m, 1),
                    "end_mileage": round(end_m, 1)
                })

                if remaining_leg_miles <= 0.01:
                    break

                # 1. 11-hour driving or 14-hour window reached -> 10-hour rest required
                if shift_driving_hours >= 10.9 or shift_duty_window_hours >= 13.9:
                    insert_10hr_rest(cur_loc_label, current_odometer)
                    continue

                # 2. Fuel needed
                if miles_since_fuel >= 940.0:
                    insert_fuel_stop(cur_loc_label, current_odometer)
                    continue

                # 3. 30-min break needed
                if continuous_driving_hours >= 7.4:
                    insert_30min_break(cur_loc_label, current_odometer)
                    continue

        # Execute Leg 1: Current Location -> Pickup Location
        drive_leg(leg1["distance_miles"], f"Current to {pickup_geo['name']}", pickup_geo["name"])

        # Stop at Pickup: 1.0 hour (On Duty Not Driving)
        stops_for_map.append({
            "id": "pickup",
            "type": "pickup",
            "title": "Pickup Location",
            "location_name": pickup_geo["name"],
            "lat": pickup_geo["lat"],
            "lon": pickup_geo["lon"],
            "duration_hours": 1.0,
            "miles_from_start": round(current_odometer, 1),
            "notes": "1.0 hr On-Duty Not Driving: Live loading & cargo securing"
        })

        events.append({
            "status": "ON_DUTY_ND",
            "duration": 1.0,
            "description": f"Loading Freight at Shipper ({pickup_geo['name']})",
            "location_name": pickup_geo["name"],
            "miles_driven": 0.0,
            "start_mileage": round(current_odometer, 1),
            "end_mileage": round(current_odometer, 1)
        })
        shift_duty_window_hours += 1.0
        cumulative_cycle_hours += 1.0

        if shift_duty_window_hours >= 13.5:
            insert_10hr_rest(pickup_geo["name"], current_odometer)

        # Execute Leg 2: Pickup Location -> Dropoff Location
        drive_leg(leg2["distance_miles"], f"Pickup to {dropoff_geo['name']}", dropoff_geo["name"])

        # Stop at Dropoff: 1.0 hour (On Duty Not Driving)
        stops_for_map.append({
            "id": "dropoff",
            "type": "dropoff",
            "title": "Dropoff Destination",
            "location_name": dropoff_geo["name"],
            "lat": dropoff_geo["lat"],
            "lon": dropoff_geo["lon"],
            "duration_hours": 1.0,
            "miles_from_start": round(current_odometer, 1),
            "notes": "1.0 hr On-Duty Not Driving: Live unloading & signing Bill of Lading"
        })

        events.append({
            "status": "ON_DUTY_ND",
            "duration": 1.0,
            "description": f"Unloading Freight at Consignee ({dropoff_geo['name']})",
            "location_name": dropoff_geo["name"],
            "miles_driven": 0.0,
            "start_mileage": round(current_odometer, 1),
            "end_mileage": round(current_odometer, 1)
        })
        shift_duty_window_hours += 1.0
        cumulative_cycle_hours += 1.0

        # Final Post-Trip Inspection (0.5 hr On Duty ND)
        events.append({
            "status": "ON_DUTY_ND",
            "duration": 0.5,
            "description": "Post-Trip Inspection & Final Paperwork",
            "location_name": dropoff_geo["name"],
            "miles_driven": 0.0,
            "start_mileage": round(current_odometer, 1),
            "end_mileage": round(current_odometer, 1)
        })
        cumulative_cycle_hours += 0.5

        # 4. Partition continuous events across 24-Hour Calendar Days (00:00 - 24:00)
        daily_sheets = self._generate_daily_log_sheets(events, current_geo["name"], dropoff_geo["name"])

        # Update stops arrival and departure timestamps
        self._calculate_stop_times(stops_for_map, events)

        # Metrics summary
        total_driving_hours = sum(e["duration"] for e in events if e["status"] == "DRIVING")
        total_on_duty_nd = sum(e["duration"] for e in events if e["status"] == "ON_DUTY_ND")
        total_sleeper_hours = sum(e["duration"] for e in events if e["status"] == "SLEEPER")
        total_off_duty_hours = sum(e["duration"] for e in events if e["status"] == "OFF_DUTY")

        remaining_cycle = max(0.0, 70.0 - cumulative_cycle_hours)

        return {
            "inputs": {
                "current_location": current_geo["name"],
                "pickup_location": pickup_geo["name"],
                "dropoff_location": dropoff_geo["name"],
                "current_cycle_used": self.current_cycle_used,
                "carrier_name": self.carrier_name,
                "main_office_address": self.main_office_address,
                "home_terminal_address": self.home_terminal_address,
                "truck_number": self.truck_number,
                "trailer_number": self.trailer_number,
                "shipper_commodity": self.shipper_commodity,
                "manifest_number": self.manifest_number
            },
            "summary": {
                "total_miles": round(current_odometer, 1),
                "leg1_miles": leg1["distance_miles"],
                "leg2_miles": leg2["distance_miles"],
                "total_driving_hours": round(total_driving_hours, 2),
                "total_on_duty_hours": round(total_driving_hours + total_on_duty_nd, 2),
                "total_rest_hours": round(total_sleeper_hours + total_off_duty_hours, 2),
                "total_trip_days": len(daily_sheets),
                "cycle_used_at_start": self.current_cycle_used,
                "cycle_used_at_end": round(cumulative_cycle_hours, 2),
                "cycle_remaining": round(remaining_cycle, 2),
                "hos_compliant": cumulative_cycle_hours <= 70.0,
                "fuel_stops_count": len([s for s in stops_for_map if s["type"] == "fuel"]),
                "rest_stops_count": len([s for s in stops_for_map if s["type"] in ("rest_30min", "night_rest")])
            },
            "route": {
                "coordinates": full_route_coordinates,
                "stops": stops_for_map
            },
            "daily_logs": daily_sheets
        }

    def _calculate_stop_times(self, stops: List[Dict[str, Any]], events: List[Dict[str, Any]]):
        """Estimate arrival and departure time for each map stop."""
        start_dt = datetime.datetime.combine(self.start_date, datetime.time(int(self.start_hour), int((self.start_hour % 1) * 60)))

        for stop in stops:
            target_mile = stop["miles_from_start"]
            time_offset = 0.0
            for ev in events:
                if ev.get("start_mileage", 0.0) <= target_mile <= ev.get("end_mileage", 0.0):
                    break
                time_offset += ev["duration"]

            arr_dt = start_dt + datetime.timedelta(hours=time_offset)
            dep_dt = arr_dt + datetime.timedelta(hours=stop["duration_hours"])
            stop["arrival_time"] = arr_dt.strftime("%b %d, %I:%M %p")
            stop["departure_time"] = dep_dt.strftime("%b %d, %I:%M %p")

    def _generate_daily_log_sheets(self, events: List[Dict[str, Any]], origin_name: str, final_dest_name: str) -> List[Dict[str, Any]]:
        """
        Segment the trip events across 24-hour days (00:00 to 24:00).
        Ensures each day has exactly 24.0 hours across the 4 status lines:
        Line 1: Off Duty
        Line 2: Sleeper Berth
        Line 3: Driving
        Line 4: On Duty (Not Driving)
        """
        days = []
        current_day_index = 0
        current_time_in_day = self.start_hour

        day_segments = []
        if self.start_hour > 0:
            day_segments.append({
                "status": "OFF_DUTY",
                "start_hour": 0.0,
                "end_hour": self.start_hour,
                "duration": self.start_hour,
                "start_time": "00:00",
                "end_time": format_hour_to_time(self.start_hour),
                "remark": "Off Duty - Home Terminal Rest",
                "location": origin_name,
                "miles_driven": 0.0
            })

        event_queue = list(events)
        day_date = self.start_date
        running_cycle_7days = self.current_cycle_used

        while len(event_queue) > 0 or current_time_in_day < 24.0:
            if len(event_queue) == 0:
                if current_time_in_day < 24.0:
                    dur = round(24.0 - current_time_in_day, 2)
                    day_segments.append({
                        "status": "OFF_DUTY",
                        "start_hour": round(current_time_in_day, 2),
                        "end_hour": 24.0,
                        "duration": dur,
                        "start_time": format_hour_to_time(current_time_in_day),
                        "end_time": "24:00",
                        "remark": "Off Duty - End of Shift / Rest",
                        "location": final_dest_name,
                        "miles_driven": 0.0
                    })
                    current_time_in_day = 24.0

            if current_time_in_day >= 24.0 - 0.001:
                sheet = self._build_sheet_object(
                    day_index=current_day_index + 1,
                    sheet_date=day_date,
                    segments=day_segments,
                    origin_loc=origin_name,
                    dest_loc=final_dest_name,
                    running_cycle_hours=running_cycle_7days
                )
                days.append(sheet)

                running_cycle_7days += sheet["recap"]["on_duty_today"]
                current_day_index += 1
                day_date = day_date + datetime.timedelta(days=1)
                current_time_in_day = 0.0
                day_segments = []

                if len(event_queue) == 0:
                    break
                continue

            ev = event_queue.pop(0)
            ev_dur = ev["duration"]
            space_left_in_day = 24.0 - current_time_in_day

            if ev_dur <= space_left_in_day:
                start_h = current_time_in_day
                end_h = round(current_time_in_day + ev_dur, 2)
                day_segments.append({
                    "status": ev["status"],
                    "start_hour": round(start_h, 2),
                    "end_hour": end_h,
                    "duration": round(ev_dur, 2),
                    "start_time": format_hour_to_time(start_h),
                    "end_time": format_hour_to_time(end_h),
                    "remark": ev["description"],
                    "location": ev["location_name"],
                    "miles_driven": ev.get("miles_driven", 0.0)
                })
                current_time_in_day = end_h
            else:
                first_part_dur = round(space_left_in_day, 2)
                second_part_dur = round(ev_dur - space_left_in_day, 2)

                first_miles = 0.0
                if ev.get("miles_driven", 0.0) > 0 and ev_dur > 0:
                    first_miles = round(ev["miles_driven"] * (first_part_dur / ev_dur), 1)

                day_segments.append({
                    "status": ev["status"],
                    "start_hour": round(current_time_in_day, 2),
                    "end_hour": 24.0,
                    "duration": first_part_dur,
                    "start_time": format_hour_to_time(current_time_in_day),
                    "end_time": "24:00",
                    "remark": f"{ev['description']} (Part 1)",
                    "location": ev["location_name"],
                    "miles_driven": first_miles
                })
                current_time_in_day = 24.0

                second_miles = round(ev.get("miles_driven", 0.0) - first_miles, 1)
                event_queue.insert(0, {
                    "status": ev["status"],
                    "duration": second_part_dur,
                    "description": f"{ev['description']} (Cont.)",
                    "location_name": ev["location_name"],
                    "miles_driven": second_miles,
                    "start_mileage": ev.get("start_mileage", 0.0) + first_miles,
                    "end_mileage": ev.get("end_mileage", 0.0)
                })

        return days

    def _build_sheet_object(
        self,
        day_index: int,
        sheet_date: datetime.date,
        segments: List[Dict[str, Any]],
        origin_loc: str,
        dest_loc: str,
        running_cycle_hours: float
    ) -> Dict[str, Any]:
        """Calculates exact line totals, remarks, and 70-hr recap for a 24-hr log sheet."""
        totals = {
            "line_1_off_duty": 0.0,
            "line_2_sleeper_berth": 0.0,
            "line_3_driving": 0.0,
            "line_4_on_duty_nd": 0.0
        }

        miles_today = 0.0
        remarks_list = []

        for seg in segments:
            st = seg["status"]
            dur = seg["duration"]
            miles_today += seg.get("miles_driven", 0.0)

            if st == "OFF_DUTY":
                totals["line_1_off_duty"] += dur
            elif st == "SLEEPER":
                totals["line_2_sleeper_berth"] += dur
            elif st == "DRIVING":
                totals["line_3_driving"] += dur
            elif st == "ON_DUTY_ND":
                totals["line_4_on_duty_nd"] += dur

            remarks_list.append({
                "time": seg["start_time"],
                "status": st,
                "status_line": 1 if st == "OFF_DUTY" else (2 if st == "SLEEPER" else (3 if st == "DRIVING" else 4)),
                "location": seg["location"],
                "remark": seg["remark"],
                "duration": dur
            })

        sum_hours = (
            totals["line_1_off_duty"] +
            totals["line_2_sleeper_berth"] +
            totals["line_3_driving"] +
            totals["line_4_on_duty_nd"]
        )
        diff = round(24.0 - sum_hours, 2)
        if abs(diff) > 0.001:
            totals["line_1_off_duty"] = round(totals["line_1_off_duty"] + diff, 2)

        for k in totals:
            totals[k] = round(totals[k], 2)

        totals["total_hours"] = 24.0

        from_loc = segments[0]["location"] if segments else origin_loc
        to_loc = segments[-1]["location"] if segments else dest_loc

        on_duty_today = round(totals["line_3_driving"] + totals["line_4_on_duty_nd"], 2)
        hours_last_7_days = round(running_cycle_hours + on_duty_today, 2)
        hours_available_tomorrow = max(0.0, round(70.0 - hours_last_7_days, 2))

        return {
            "day_number": day_index,
            "date": sheet_date.strftime("%m/%d/%Y"),
            "date_iso": sheet_date.isoformat(),
            "from_location": from_loc,
            "to_location": to_loc,
            "total_miles_driving_today": round(miles_today, 1),
            "carrier_name": self.carrier_name,
            "main_office_address": self.main_office_address,
            "home_terminal_address": self.home_terminal_address,
            "truck_number": self.truck_number,
            "trailer_number": self.trailer_number,
            "shipping_documents": {
                "manifest_number": self.manifest_number,
                "shipper_commodity": self.shipper_commodity
            },
            "status_totals": totals,
            "duty_segments": segments,
            "remarks": remarks_list,
            "recap": {
                "on_duty_today": on_duty_today,
                "hours_on_duty_last_7_days": hours_last_7_days,
                "hours_available_tomorrow": hours_available_tomorrow,
                "hours_on_duty_last_8_days": hours_last_7_days,
                "cycle_limit": 70.0,
                "cycle_days": 8
            }
        }
