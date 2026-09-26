# Backend Pre-flight Codebase Audit

## 1. Pytest and Application Boot
- **Result:** **Pass**
- Ran python -m pytest successfully (1 passed, 19 warnings).
- The FastAPI application boots without any ModuleNotFoundError or internal crashes during initialization.

## 2. Model Properties for Latitude & Longitude
- **Result:** **Pass (with minor code smell)**
- The @property methods for latitude and longitude utilizing geoalchemy2.shape.to_shape successfully check if self.location is None: across all relevant models (donors, organizations, hospitals, lood_requests).
- **Issue:** The properties are duplicated verbatim in *all four* model files. While Python quietly overwrites the first definition with the second, this is a glaring copy-paste artifact that should be cleaned up before release.

## 3. Donors Controller location=None Handling
- **Result:** **Pass**
- In src/donors/controller.py during signup, the codebase explicitly protects against None values: location=make_point(data.latitude, data.longitude) if data.latitude is not None and data.longitude is not None else None.

## 4. Race Conditions and SQL Exceptions
- **Result:** **Fail (Critical Bug Found)**
- **Race conditions:** Handled properly. src/blood_requests/controller.py implements tomic_reserve_units, running an atomic database-level UPDATE with conditions to prevent race conditions during request matching.
- **SQL / Internal Exceptions:** 
  - **CRITICAL:** In src/organizations/controller.py, the update_fulfillment function incorrectly calls lood_requests_controller.mark_fulfilled_if_complete(match.blood_request_id, db). 
  - mark_fulfilled_if_complete expects a full BloodRequest model instance, but it is being passed a UUID string. 
  - This will cause a 500 Internal Server Error (AttributeError) when an organization completes a match. The UUID must be resolved to a BloodRequest instance before being passed.

## Conclusion
The backend is **not ready for release**. The critical bug in organizations/controller.py must be resolved, and the duplicated properties in the models should be cleaned up.
