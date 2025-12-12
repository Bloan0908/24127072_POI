
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface WeatherInfo {
  temperature: number;
  description: string;
  icon: string;
}

export interface PointOfInterest {
  name: string;
  description: string;
  coordinates: Coordinates;
  weather?: WeatherInfo;
}
