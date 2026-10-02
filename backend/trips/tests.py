from django.test import TestCase, Client
from django.urls import reverse
from .hos_engine import HOSPlannerEngine, haversine_miles, geocode_location

class HOSTripEngineTests(TestCase):
    def test_haversine(self):
        dist = haversine_miles(41.8781, -87.6298, 32.7767, -96.7970)
        # Chicago to Dallas is ~800 miles as the crow flies
        self.assertTrue(700 < dist < 900)

    def test_geocoding(self):
        chicago = geocode_location("Chicago, IL")
        self.assertAlmostEqual(chicago["lat"], 41.8781, places=2)
        self.assertAlmostEqual(chicago["lon"], -87.6298, places=2)

    def test_hos_rules_engine_medium_trip(self):
        engine = HOSPlannerEngine(
            current_location="Chicago, IL",
            pickup_location="St. Louis, MO",
            dropoff_location="Dallas, TX",
            current_cycle_used=14.5
        )
        plan = engine.plan_trip()
        self.assertIn("summary", plan)
        self.assertIn("daily_logs", plan)
        self.assertIn("route", plan)

        # Total miles should be > 800 miles
        self.assertGreater(plan["summary"]["total_miles"], 700)
        # Multi-day trip
        self.assertGreaterEqual(len(plan["daily_logs"]), 2)

        # Every day must have exact 24.0 hours sum
        for log in plan["daily_logs"]:
            totals = log["status_totals"]
            line_sum = (
                totals["line_1_off_duty"] +
                totals["line_2_sleeper_berth"] +
                totals["line_3_driving"] +
                totals["line_4_on_duty_nd"]
            )
            self.assertAlmostEqual(line_sum, 24.0, places=1)
            self.assertAlmostEqual(totals["total_hours"], 24.0, places=1)
            # Driving should not exceed 11 hours per day
            self.assertLessEqual(totals["line_3_driving"], 11.01)

    def test_fuel_stop_rule_long_haul(self):
        # LA to Miami is ~2,700 miles, should require multiple fuel stops (every <= 1,000 miles)
        engine = HOSPlannerEngine(
            current_location="Los Angeles, CA",
            pickup_location="Phoenix, AZ",
            dropoff_location="Miami, FL",
            current_cycle_used=5.0
        )
        plan = engine.plan_trip()
        self.assertGreaterEqual(plan["summary"]["fuel_stops_count"], 2)
        self.assertGreaterEqual(len(plan["daily_logs"]), 4)

class APIEndpointsTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check(self):
        resp = self.client.get('/api/health/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("status"), "healthy")

    def test_presets(self):
        resp = self.client.get('/api/trips/presets/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_plan_trip_api(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "St. Louis, MO",
            "dropoff_location": "Dallas, TX",
            "current_cycle_used": 10.0
        }
        resp = self.client.post(
            '/api/trips/plan/',
            data=payload,
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("daily_logs", data)
        self.assertIn("summary", data)
        self.assertIn("route", data)
        self.assertEqual(data["summary"]["hos_compliant"], True)

    def test_plan_trip_missing_fields(self):
        resp = self.client.post(
            '/api/trips/plan/',
            data={"current_location": "Chicago, IL"},
            content_type='application/json'
        )
        self.assertEqual(resp.status_code, 400)
