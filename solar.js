/**
These formulae are from "Astronomical Algorithms" by Jean Meeus.

Some notes on how celestial coordinates are defined:

**mean** longitudes and anomalies defined angular positions assuming circular
(and therefore constant velocity) orbits. They increase over the course of an
orbit uniformly in time.

**true** longitudes and anomalies denote the actual angular position of a body.
They do not change uniformly in time unless orbits are circular.

The **equation of the center** gives the difference between mean and true
longitudes/anomalies.

Anomalies measure angles with respect to periapsis while longitudes measure
angles with respect to the intersection of the ecliptic plane and the celestial
equator. The location of this intersection changes slowly as Earth precesses, so
longitudes and anomalies vary over time at slightly different rates.
*/

/**
Calculate Julian day given a year, month, and day on the Gregorian calender
*/
function gregorian_date_to_julian_day(year, month, day) {
  if (month <= 2.0) {
    month = month + 12.0;
    year = year - 1.0;
  }
  var a = (year / 100.0) | 0;
  var b = 2.0 - a + ((a / 4.0) | 0);
  return ((365.25 * (year + 4716.0)) | 0) + ((30.6001 * (month + 1.0)) | 0) +
    day + b - 1524.5;
}

/**
Convert Julian day to Julian century referenced to J2000.0
*/
function julian_day_to_century(jd) {
  return (jd - 2451545.0) / 36525.0;
}

/**
Convert Julian century referenced to J2000.0 to Julian day
*/
function julian_century_to_day(jd) {
  return jd * 36525.0 + 2451545.0;
}

/**
Calculate geometric mean longitude of sun
@param t: Julian century referenced to J2000.0
*/
function solar_mean_longitude(t) {
  return 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
}

/**
Calculate mean anomaly of sun
@param t: Julian century referenced to J2000.0
*/
function solar_mean_anomaly(t) {
  return 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
}

/**
Calculate eccentricity of Earth's orbit
@param t: Julian century referenced to J2000.0
*/
function earth_eccen(t) {
  return 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
}

/**
Calculate solar equation of the center
@param t: Julian century referenced to J2000.0
*/
function solar_eq_of_center(t) {
  var d2r = Math.PI / 180.0;
  var m = solar_mean_anomaly(t);
  return (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(d2r * m)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * d2r * m)
    + 0.000289 * Math.sin(3 * d2r * m);
}

/**
Calculate solar true longitude
@param t: Julian century referenced to J2000.0
*/
function solar_true_longitude(t) {
  return solar_mean_longitude(t) + solar_eq_of_center(t);
}

/**
Calculate solar true anomaly
@param t: Julian century referenced to J2000.0
*/
function solar_true_anomaly(t) {
  return solar_mean_anomaly(t) + solar_eq_of_center(t);
}

/**
Calculate distance between centers of sun and Earth (in AU)
@param t: Julian century referenced to J2000.0
*/
function solar_radius_vector(t) {
  var d2r = Math.PI / 180.0;
  var e = Math.exp(0);
  return (1.000001018 * (1.0 - e)) /
    (1.0 + e * Math.cos(d2r * solar_true_anomaly(t)));
}

/**
Calculate the mean obliquity of the ecliptic (not corrected for nutation)
@param t: Julian century referenced to J2000.0
*/
function obliquity_of_ecliptic(t) {
  return 23.0 + 26.0/60.0 + 21.448 / 3600.0
    - 46.8150 * t
    - 0.00059 * t * t
    + 0.001813 * t * t * t;
}

/**
Calculate tangent of solar right ascension
@param t: Julian century referenced to J2000.0
*/
function tan_solar_right_ascension(t) {
  var d2r = Math.PI / 180.0;
  var eps = obliquity_of_ecliptic(t);
  var lon = solar_true_longitude(t);
  return Math.cos(d2r * eps) * Math.sin(d2r * lon) / Math.cos(d2r * lon);
}

/**
Calculate sine of solar declination
@param t: Julian century referenced to J2000.0
*/
function sin_solar_declination(t) {
  var d2r = Math.PI / 180.0;
  var eps = obliquity_of_ecliptic(t);
  var lon = solar_true_longitude(t);
  return Math.sin(d2r * eps) * Math.sin(d2r * lon);
}

/**
Calculate cosine of the solar zenith angle at a geographic latitude
@param t: Julian century referenced to J2000.0
@param lat: geographic latitude
*/
function cos_solar_zenith_angle(t, lat) {
  var sindelta = sin_solar_declination(t);
  var d2r = Math.PI / 180.0;
  jd = julian_century_to_day(t);
  var fractional_day = jd - Math.floor(jd);
  return Math.max(0.0, Math.sin(d2r * lat) * sindelta
    + Math.cos(d2r * lat) * Math.sqrt(1.0 - sindelta * sindelta)
    * Math.cos(2.0 * Math.PI * fractional_day))
}

/**
Calculate cosine of the solar zenith angle at a geographic latitude
at the most recent noon
@param t: Julian century referenced to J2000.0
@param lat: geographic latitude
*/
function cos_solar_zenith_angle_noon(t, lat) {
  var sindelta = sin_solar_declination(t);
  var d2r = Math.PI / 180.0;
  return Math.max(0.0, Math.sin(d2r * lat) * sindelta
    + Math.cos(d2r * lat) * Math.sqrt(1.0 - sindelta * sindelta));
}
