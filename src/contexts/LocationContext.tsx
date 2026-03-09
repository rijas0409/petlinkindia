import { createContext, useContext, useState, ReactNode } from "react";

const CITIES = [
  { id: "greater-noida", name: "Greater Noida", state: "Uttar Pradesh" },
  { id: "noida", name: "Noida", state: "Uttar Pradesh" },
  { id: "delhi", name: "Delhi", state: "Delhi" },
  { id: "gurgaon", name: "Gurgaon", state: "Haryana" },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra" },
  { id: "bangalore", name: "Bangalore", state: "Karnataka" },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana" },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu" },
  { id: "pune", name: "Pune", state: "Maharashtra" },
  { id: "kolkata", name: "Kolkata", state: "West Bengal" },
];

interface LocationContextType {
  city: string;
  setCity: (city: string) => void;
  cities: typeof CITIES;
}

const LocationContext = createContext<LocationContextType>({
  city: "Gurgaon",
  setCity: () => {},
  cities: CITIES,
});

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState("Gurgaon");
  return (
    <LocationContext.Provider value={{ city, setCity, cities: CITIES }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
