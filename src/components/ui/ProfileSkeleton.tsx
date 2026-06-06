import { View } from "react-native";
import { SkeletonBlock } from "./SkeletonBlock";

interface ProfileSkeletonProps {
  variant: "profile" | "edit";
}

export const ProfileSkeleton = ({ variant }: ProfileSkeletonProps) => {
  if (variant === "profile") {
    return (
      <View className="flex-1 bg-white">
        <View className="px-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <SkeletonBlock
                width={44}
                height={44}
                borderRadius={22}
                className="bg-gray-200"
              />
              <View className="ml-3 gap-1.5">
                <SkeletonBlock
                  width={120}
                  height={16}
                  borderRadius={6}
                  className="bg-gray-200"
                />
                <SkeletonBlock
                  width={80}
                  height={12}
                  borderRadius={4}
                  className="bg-gray-200"
                />
                <SkeletonBlock
                  width={100}
                  height={12}
                  borderRadius={4}
                  className="bg-gray-200"
                />
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <SkeletonBlock
                width={40}
                height={40}
                borderRadius={20}
                className="bg-gray-200"
              />
              <SkeletonBlock
                width={40}
                height={40}
                borderRadius={20}
                className="bg-gray-200"
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-2 pb-4">
        <SkeletonBlock
          width={40}
          height={40}
          borderRadius={20}
          className="bg-gray-200"
        />
        <View className="flex-1 items-center mr-10">
          <SkeletonBlock
            width={140}
            height={18}
            borderRadius={6}
            className="bg-gray-200"
          />
        </View>
      </View>

      <View className="items-center pb-8">
        <SkeletonBlock
          width={96}
          height={96}
          borderRadius={48}
          className="bg-gray-200"
        />
      </View>

      <View className="mx-4 overflow-hidden rounded-xl bg-white">
        <View className="px-4 pt-4 pb-4">
          <SkeletonBlock
            width={100}
            height={12}
            borderRadius={4}
            className="bg-gray-200"
          />
        </View>

        <View className="mx-4 mb-4 gap-2">
          <SkeletonBlock
            width={60}
            height={12}
            borderRadius={4}
            className="bg-gray-200"
          />
          <View className="h-12 rounded-xl bg-gray-200 overflow-hidden">
            <SkeletonBlock height={48} flex={1} borderRadius={12} className="bg-gray-200" />
          </View>
        </View>

        <View className="mx-4 mb-4 gap-2">
          <SkeletonBlock
            width={70}
            height={12}
            borderRadius={4}
            className="bg-gray-200"
          />
          <View className="h-12 rounded-xl bg-gray-200 overflow-hidden">
            <SkeletonBlock height={48} flex={1} borderRadius={12} className="bg-gray-200" />
          </View>
        </View>

        <View className="mx-4 mb-4 gap-2">
          <SkeletonBlock
            width={50}
            height={12}
            borderRadius={4}
            className="bg-gray-200"
          />
          <View className="h-12 rounded-xl bg-gray-200 overflow-hidden">
            <SkeletonBlock height={48} flex={1} borderRadius={12} className="bg-gray-200" />
          </View>
        </View>
      </View>

      <View className="mx-4 mt-8">
        <View className="h-12 rounded-xl bg-gray-200 overflow-hidden">
          <SkeletonBlock height={48} flex={1} borderRadius={12} className="bg-gray-200" />
        </View>
      </View>
    </View>
  );
};
