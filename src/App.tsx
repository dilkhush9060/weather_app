import { InfoCard } from "./InfoCard";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View, TouchableOpacity } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import axios from "axios";

import "./global.css";

type WeatherResponse = {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: { description: string; icon: string; main: string }[];
};

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocationAndWeather = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Fetch weather
      const { data } = await axios.get<WeatherResponse>(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
            appid: process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY,
            units: "metric",
          },
        }
      );

      setWeather(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  // Centered loader or error
  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-[#212121]">
        <ActivityIndicator size="large" color="white" />
      </View>
    );

  if (errorMsg)
    return (
      <View className="flex-1 justify-center items-center bg-[#212121] p-4">
        <Text className="text-white text-center mb-4">{errorMsg}</Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-xl"
          onPress={getLocationAndWeather}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );

  if (!weather)
    return (
      <View className="flex-1 justify-center items-center bg-[#212121]">
        <Text className="text-white text-center">
          Weather data not available
        </Text>
      </View>
    );

  // Convert sunrise/sunset UNIX timestamps to local time
  const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <StatusBar style="inverted" />
      <View className="flex-1 justify-center bg-[#212121] p-6 gap-5">
        {/* Main Text  */}
        <Text className="text-white text-center text-5xl font-bold">
          Daily Weather
        </Text>
        {/* Main card */}
        <View className="bg-[#323233] rounded-3xl p-8 items-center w-full flex-row justify-between h-72">
          <View className="flex-col items-start justify-between h-full">
            <Text className="text-white text-2xl font-semibold mb-4">
              {weather.name}, {weather.sys.country}
            </Text>
            <View className="flex-row gap-5 items-center">
              <Text className="text-white text-7xl font-semibold mb-4">
                {Math.round(weather.main.temp)}°C
              </Text>
              <TouchableOpacity>
                <AntDesign
                  name="reload"
                  size={20}
                  color="#ffebd3"
                  onPress={getLocationAndWeather}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-col items-center justify-center">
            <Ionicons
              name={
                weather.weather[0].main == "Clouds" ||
                weather.weather[0].main == "Haze" ||
                weather.weather[0].main == "Rainy"
                  ? "cloudy"
                  : "sunny"
              }
              size={64}
              color="#ffebd3"
            />
            <Text className="text-white text-xl font-semibold mb-4">
              {weather.weather[0].description}
            </Text>
          </View>
        </View>

        {/* More information */}
        <View>
          <Text className="text-white text-3xl font-semibold mt-8 mb-4">
            More Information
          </Text>
          <View className="flex-row gap-4 justify-center items-center flex-wrap">
            <InfoCard
              icon="sunrise"
              family="Feather"
              label="Sunrise"
              value={sunrise}
            />
            <InfoCard
              icon="sunset"
              family="Feather"
              label="Sunset"
              value={sunset}
            />
            <InfoCard
              icon="temperature-high"
              family="FontAwesome5"
              label="Max Temp"
              value={`${Math.round(weather.main.temp_max)}°C`}
            />
            <InfoCard
              icon="temperature-low"
              family="FontAwesome5"
              label="Min Temp"
              value={`${Math.round(weather.main.temp_min)}°C`}
            />
            <InfoCard
              icon="wind"
              family="Feather"
              label="Wind Speed"
              value={`${weather.wind.speed} m/s`}
            />
            <InfoCard
              icon="gauge"
              family="MaterialCommunityIcons"
              label="Pressure"
              value={`${weather.main.pressure} hPa`}
            />
            <InfoCard
              icon="water-percent"
              family="MaterialCommunityIcons"
              label="Humidity"
              value={`${weather.main.humidity}%`}
            />
          </View>
        </View>
      </View>
    </>
  );
}
