import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .hos_engine import HOSPlannerEngine

class PlanTripView(APIView):
    """
    Accepts trip details:
    - current_location
    - pickup_location
    - dropoff_location
    - current_cycle_used
    And returns comprehensive FMCSA HOS route plan with 24-hr daily log sheets.
    """
    def post(self, request):
        data = request.data or {}

        current_location = data.get("current_location", "").strip()
        pickup_location = data.get("pickup_location", "").strip()
        dropoff_location = data.get("dropoff_location", "").strip()
        current_cycle_used = data.get("current_cycle_used", 0.0)

        if not current_location or not pickup_location or not dropoff_location:
            return Response(
                {"error": "current_location, pickup_location, and dropoff_location are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            current_cycle_used = float(current_cycle_used)
            if current_cycle_used < 0:
                current_cycle_used = 0.0
            if current_cycle_used > 70.0:
                current_cycle_used = 70.0
        except (ValueError, TypeError):
            current_cycle_used = 0.0

        carrier_name = data.get("carrier_name", "Apex Freight Logistics Inc.")
        main_office_address = data.get("main_office_address", "100 Logistics Blvd, Dallas, TX 75201")
        home_terminal_address = data.get("home_terminal_address", "450 Transport Way, Chicago, IL 60601")
        truck_number = data.get("truck_number", "TRK-8821")
        trailer_number = data.get("trailer_number", "TLR-9042")
        shipper_commodity = data.get("shipper_commodity", "Commercial Freight & General Electronics")
        manifest_number = data.get("manifest_number", "BOL-78912")
        start_date = data.get("start_date")
        start_hour = data.get("start_hour", 6.0)

        try:
            start_hour = float(start_hour)
        except (ValueError, TypeError):
            start_hour = 6.0

        try:
            engine = HOSPlannerEngine(
                current_location=current_location,
                pickup_location=pickup_location,
                dropoff_location=dropoff_location,
                current_cycle_used=current_cycle_used,
                carrier_name=carrier_name,
                main_office_address=main_office_address,
                home_terminal_address=home_terminal_address,
                truck_number=truck_number,
                trailer_number=trailer_number,
                shipper_commodity=shipper_commodity,
                manifest_number=manifest_number,
                start_date_str=start_date,
                start_hour=start_hour
            )

            result = engine.plan_trip()
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Failed to calculate route and logs: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PresetTripsView(APIView):
    """
    Returns curated demo trips for quick 1-click evaluation by clients and evaluators.
    """
    def get(self, request):
        presets = [
            {
                "id": "cross_country",
                "label": "Long Haul (Multi-Day): Chicago -> St. Louis -> Dallas",
                "current_location": "Chicago, IL",
                "pickup_location": "St. Louis, MO",
                "dropoff_location": "Dallas, TX",
                "current_cycle_used": 14.5,
                "notes": "Demonstrates multi-day log generation (3 sheets), fuel stop (< 1,000 miles), and 10-hr sleeper rest."
            },
            {
                "id": "transcontinental",
                "label": "Coast-to-Coast: Los Angeles -> Phoenix -> Miami",
                "current_location": "Los Angeles, CA",
                "pickup_location": "Phoenix, AZ",
                "dropoff_location": "Miami, FL",
                "current_cycle_used": 8.0,
                "notes": "2,700+ mile epic run with multiple 1,000-mile fuelings, 30-min breaks, and 4+ daily log sheets."
            },
            {
                "id": "regional",
                "label": "Regional Corridor: Atlanta -> Charlotte -> New York",
                "current_location": "Atlanta, GA",
                "pickup_location": "Charlotte, NC",
                "dropoff_location": "New York, NY",
                "current_cycle_used": 25.0,
                "notes": "East coast regional freight with dense interstate routing and HOS compliance."
            },
            {
                "id": "northwest",
                "label": "Northern Rockies: Seattle -> Boise -> Denver",
                "current_location": "Seattle, WA",
                "pickup_location": "Boise, ID",
                "dropoff_location": "Denver, CO",
                "current_cycle_used": 32.0,
                "notes": "Mountain highway route testing 8-hour continuous driving break and sleeper berth reset."
            }
        ]
        return Response(presets, status=status.HTTP_200_OK)


def health_check(request):
    return JsonResponse({"status": "healthy", "service": "Truck ELD API"})
