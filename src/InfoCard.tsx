import { View, Text } from "react-native";
import * as Icons from "@expo/vector-icons";
type IconFamily = keyof typeof Icons;

export const InfoCard = ({
  label,
  icon,
  family,
  value,
}: {
  label: string;
  icon: string;
  family: IconFamily;
  value: string;
}) => {
  const IconComponent = Icons[family] as React.ComponentType<{
    name: string;
    size: number;
    color: string;
  }>;

  return (
    <View className="flex-row gap-4 items-center  bg-[#323233] rounded-2xl px-5 py-3 w-[46%]">
      <IconComponent name={icon} size={28} color="#ffebd3" />
      <View className="flex flex-col gap-1">
        <Text className="text-white text-lg font-medium">{label}</Text>
        <Text className="text-white text-md font-normal">{value}</Text>
      </View>
    </View>
  );
};
