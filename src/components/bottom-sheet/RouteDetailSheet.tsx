import { useCallback, useRef, memo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouteDetail } from "@/hooks/routes/useRouteDetail";
import { useRouteStore } from "@/store/route.store";
import { useUIStore } from "@/store/ui.store";
import { colors } from "@/constants/colors";
import type { RouteStop } from "@/services/routes/routes.types";

const SNAP_POINTS = ["50%", "85%"];

export const RouteDetailSheet = memo(function RouteDetailSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const routeId = useRouteStore((s) => s.selectedRouteId);
  const setRouteId = useRouteStore((s) => s.setSelectedRouteId);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);
  const insets = useSafeAreaInsets();

  const {
    route: routeData,
    stops,
    isLoading,
    isError,
    refetch,
  } = useRouteDetail(routeId ?? "");

  const displayName =
    routeData?.longName || routeData?.shortName || "Route";
  const displayHeadsign = routeData?.shortName;

  const handleBack = useCallback(() => {
    setBottomSheet(0, "stopDetail");
  }, [setBottomSheet]);

  const handleClose = useCallback(() => {
    setRouteId(null);
    closeBottomSheet();
  }, [setRouteId, closeBottomSheet]);

  const renderItem = useCallback(
    ({ item }: { item: RouteStop }) => (
      <View className="flex-row items-center px-4 py-3 border-b border-gray-50">
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            item.isStation ? "bg-primary/20" : "bg-primary/10"
          }`}
        >
          <Ionicons
            name={item.isStation ? "train-outline" : "bus-outline"}
            size={14}
            color={colors.primary}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-base font-medium text-gray-900"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.code ? (
            <Text className="text-xs text-gray-400" numberOfLines={1}>
              {item.code}
            </Text>
          ) : null}
        </View>
        <View className="flex-row items-center">
          {item.sequence != null && (
            <Text className="mr-2 text-xs text-gray-400">
              #{item.sequence}
            </Text>
          )}
        </View>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: RouteStop, index: number) => `${item.id}-${index}`,
    [],
  );

  if (isLoading && !routeData) {
    return (
      <BottomSheet
        ref={sheetRef}
        snapPoints={SNAP_POINTS}
        index={1}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        handleIndicatorStyle={{
          backgroundColor: colors.textTertiary,
          width: 40,
        }}
        backgroundStyle={{ backgroundColor: colors.white }}
      >
        <View className="flex-1 items-center justify-center px-4">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-sm text-gray-400">Loading...</Text>
        </View>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      index={1}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <View className="flex-1">
        <View className="flex-row items-center justify-between px-4 pt-2 pb-3 border-b border-gray-100">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-row items-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            <Text className="ml-1 text-base font-semibold text-gray-900">
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClose}
            className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={stops ?? []}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              <View className="px-4 pt-2 pb-4 border-b border-gray-100">
                <View className="flex-row items-start">
                  {routeData?.color ? (
                    <View
                      className="h-5 w-5 rounded-full mt-1 mr-3"
                      style={{ backgroundColor: `#${routeData.color}` }}
                    />
                  ) : null}
                  <View className="flex-1">
                    <Text
                      className="text-2xl font-bold text-gray-900"
                      numberOfLines={2}
                    >
                      {routeData?.shortName || "Route"}
                    </Text>
                    <Text
                      className="text-base text-gray-500 mt-0.5"
                      numberOfLines={2}
                    >
                      {displayName}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row flex-wrap items-center gap-2">
                  {displayHeadsign ? (
                    <Text
                      className="text-sm text-gray-500"
                      numberOfLines={1}
                    >
                      → {displayHeadsign}
                    </Text>
                  ) : null}
                  {routeData?.isActive !== undefined && (
                    <View
                      className={`rounded-full px-2 py-1 ${
                        routeData.isActive ? "bg-green-100" : "bg-red-50"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-semibold ${
                          routeData.isActive
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {routeData.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="px-4 pt-4 pb-2">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Stops on this Route
                </Text>
              </View>
            </View>
          }
          ListHeaderComponentStyle={null}
          ListEmptyComponent={
            isError && !isLoading ? (
              <View className="items-center px-4 py-12">
                <Ionicons
                  name="alert-circle-outline"
                  size={40}
                  color={colors.error}
                />
                <Text className="mt-3 text-sm text-gray-500 text-center">
                  Failed to load route details.
                </Text>
                <TouchableOpacity
                  onPress={() => refetch()}
                  className="mt-4 rounded-full bg-primary px-6 py-2"
                >
                  <Text className="text-sm font-semibold text-white">
                    Tap to Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : stops && stops.length === 0 ? (
              <View className="items-center px-4 py-12">
                <Ionicons
                  name="flag-outline"
                  size={40}
                  color={colors.textTertiary}
                />
                <Text className="mt-3 text-sm text-gray-400 text-center">
                  Stops list not available for this route.
                </Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        />
      </View>
    </BottomSheet>
  );
});
