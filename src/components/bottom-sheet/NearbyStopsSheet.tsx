import { useCallback, useEffect, useMemo, useRef, memo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { StopCard } from "./StopCard";
import { useRouteStore } from "@/store/route.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { useQuickPlacesStore } from "@/store/quickPlaces.store";
import { QuickPlaceChip } from "@/components/quick-places/QuickPlaceChip";
import { useQuickRoute } from "@/hooks/useQuickRoute";
import { colors } from "@/constants/colors";
import type { NearbyStop } from "@/services/stops/stops.types";
import type { SavedStop } from "@/store/favorites.store";
import type { QuickPlace } from "@/types/quickPlaces.types";

interface NearbyStopsSheetProps {
  stops: NearbyStop[] | undefined;
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onViewDetails?: () => void;
  onAddPlace?: () => void;
  onEditPlace?: (place: QuickPlace) => void;
  onFocusCoordinate?: (lng: number, lat: number) => void;
  onDeletePlace?: (placeId: string) => void;
  onClearPlaces?: () => void;
}

const EMPTY_ARRAY: never[] = [];

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)}m`;
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const NearbyStopsSheet = memo(function NearbyStopsSheet({
  stops,
  isLoading,
  isError,
  onRetry,
  onViewDetails,
  onAddPlace,
  onEditPlace,
  onFocusCoordinate,
  onDeletePlace,
  onClearPlaces,
}: NearbyStopsSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const selectedStop = useRouteStore((s) => s.selectedStop);
  const setSelectedStop = useRouteStore((s) => s.setSelectedStop);
  const savedStops = useFavoritesStore((s) => s.stops);
  const places = useQuickPlacesStore((s) => s.places);
  const placesHydrated = useQuickPlacesStore((s) => s._hasHydrated);
  const stopsHydrated = useFavoritesStore((s) => s._hasHydrated);
  const isHydrated = placesHydrated && stopsHydrated;
  const insets = useSafeAreaInsets();
  const { routeToHere, routeFromHere, isRouting } = useQuickRoute(
    selectedStop,
    stops,
  );

  const showQuickAccess = places.length > 0 || savedStops.length > 0;
  const selectedPlaceId = useMemo(() => {
    if (!selectedStop) return null;
    const place = places.find(
      (p) => p.nearbyStopId === selectedStop.id,
    );
    return place?.id ?? null;
  }, [places, selectedStop]);

  const snapPoints = useMemo(() => ["8%", "45%"], []);

  useEffect(() => {
    if (selectedStop) {
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [selectedStop]);

  const handleStopPress = useCallback((stop: NearbyStop) => {
    const { selectedStop: curr, setSelectedStop: set } =
      useRouteStore.getState();
    set(curr?.id === stop.id ? null : stop);
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedStop(null);
  }, [setSelectedStop]);

  const handleSavedStopLongPress = useCallback(
    (saved: SavedStop) => {
      Alert.alert(
        "Remove saved stop?",
        `Remove "${saved.name}" from favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              useFavoritesStore.getState().removeStop(saved.id);
            },
          },
        ],
      );
    },
    [],
  );

  const handleViewDetails = useCallback(() => {
    if (selectedStop && onViewDetails) {
      onViewDetails();
    }
  }, [onViewDetails, selectedStop]);

  const handleSavedStopPress = useCallback(
    (saved: SavedStop) => {
      setSelectedStop({
        id: saved.id,
        name: saved.name,
        code: saved.code ?? "",
        latitude: saved.latitude,
        longitude: saved.longitude,
        isStation: saved.isStation,
        locationType: undefined,
        distance_meters: 0,
      });
    },
    [setSelectedStop],
  );

  const handleQuickPlacePress = useCallback(
    (place: QuickPlace) => {
      if (place.nearbyStopId) {
        setSelectedStop({
          id: place.nearbyStopId,
          name: place.nearbyStopName ?? place.name,
          code: "",
          latitude: place.latitude,
          longitude: place.longitude,
          isStation: false,
          locationType: undefined,
          distance_meters: 0,
        });
      } else if (onFocusCoordinate) {
        onFocusCoordinate(place.longitude, place.latitude);
      }
    },
    [setSelectedStop, onFocusCoordinate],
  );

  const handleQuickPlaceLongPress = useCallback(
    (place: QuickPlace) => {
      Alert.alert("Delete place?", `Remove "${place.name}" from Quick Access?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDeletePlace) onDeletePlace(place.id);
          },
        },
      ]);
    },
    [onDeletePlace],
  );

  const handleDeletePlacePress = useCallback(() => {
    if (!selectedPlaceId) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    Alert.alert("Delete place?", `Remove "${place?.name ?? "this place"}" from Quick Access?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (onDeletePlace) onDeletePlace(selectedPlaceId);
          setSelectedStop(null);
        },
      },
    ]);
  }, [selectedPlaceId, places, onDeletePlace, setSelectedStop]);

  const handleClearPlaces = useCallback(() => {
    Alert.alert("Clear all places?", "Remove all Quick Access places?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: () => {
          if (onClearPlaces) onClearPlaces();
        },
      },
    ]);
  }, [onClearPlaces]);

  const isEmpty = !isLoading && !isError && (!stops || stops.length === 0);
  const hasStaleData = stops && stops.length > 0;
  const showError = isError && !isLoading;

  const renderItem = useCallback(
    ({ item }: { item: NearbyStop }) => (
      <StopCard
        stop={item}
        isSelected={selectedStop?.id === item.id}
        onPress={handleStopPress}
      />
    ),
    [selectedStop, handleStopPress],
  );

  const keyExtractor = useCallback((item: NearbyStop) => item.id, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose={false}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      <BottomSheetFlatList
        data={stops ?? EMPTY_ARRAY}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          <>
            {selectedStop && (
              <View className="px-4 pt-2 pb-3 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Ionicons
                      name={selectedStop.isStation ? "train-outline" : "bus-outline"}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    className="ml-2 flex-1 text-base font-bold text-gray-900"
                    numberOfLines={1}
                  >
                    {selectedStop.name}
                  </Text>
                  {selectedPlaceId && onDeletePlace && (
                    <TouchableOpacity
                      onPress={handleDeletePlacePress}
                      className="h-6 w-6 items-center justify-center"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleClosePreview}
                    className="h-6 w-6 items-center justify-center"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>

                <View className="ml-10 mt-1 flex-row items-center">
                  <View
                    className={`rounded-full px-2 py-0.5 ${
                      selectedStop.isStation ? "bg-primary/15" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-semibold ${
                        selectedStop.isStation ? "text-primary" : "text-gray-500"
                      }`}
                    >
                      {selectedStop.isStation ? "Station" : "Stop"}
                    </Text>
                  </View>
                  <Text className="ml-2 text-xs text-gray-400">
                    · {formatDistance(selectedStop.distance_meters)}
                  </Text>
                </View>

                <View className="ml-10 mt-2.5 flex-row gap-2">
                  <TouchableOpacity
                    onPress={routeToHere}
                    disabled={isRouting}
                    activeOpacity={0.7}
                    className={`flex-1 flex-row items-center justify-center rounded-lg bg-primary/15 py-2 ${
                      isRouting ? "opacity-50" : ""
                    }`}
                  >
                    <Ionicons
                      name="navigate-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text className="ml-1 text-xs font-semibold text-primary">
                      Route Here
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={routeFromHere}
                    disabled={isRouting}
                    activeOpacity={0.7}
                    className={`flex-1 flex-row items-center justify-center rounded-lg border border-primary/30 py-2 ${
                      isRouting ? "opacity-50" : ""
                    }`}
                  >
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={colors.primary}
                    />
                    <Text className="ml-1 text-xs font-semibold text-primary">
                      From Here
                    </Text>
                  </TouchableOpacity>
                </View>

                {!selectedPlaceId && (
                <TouchableOpacity
                  className="mt-2.5 items-center border-t border-gray-100 pt-2"
                  activeOpacity={0.7}
                  onPress={handleViewDetails}
                >
                  <Text className="text-sm font-semibold text-primary">
                    View Details
                  </Text>
                </TouchableOpacity>
                )}
              </View>
            )}

            <View className="px-4 pt-3 pb-2 border-b border-gray-100">
              <Text className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Quick Access
              </Text>
              {!isHydrated ? (
                <View className="flex-row gap-2">
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className="h-9 w-20 rounded-xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </View>
              ) : showQuickAccess ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {places.map((place) => (
                    <QuickPlaceChip
                      key={place.id}
                      place={place}
                      isSelected={selectedPlaceId === place.id}
                      onPress={() => handleQuickPlacePress(place)}
                      onLongPress={() => handleQuickPlaceLongPress(place)}
                    />
                  ))}

                  {savedStops.map((saved) => {
                    const isSelected = selectedStop?.id === saved.id;
                    return (
                      <TouchableOpacity
                        key={saved.id}
                        onPress={() => handleSavedStopPress(saved)}
                        onLongPress={() => handleSavedStopLongPress(saved)}
                        activeOpacity={0.7}
                        className={`flex-row items-center rounded-xl px-3 py-2.5 ${
                          isSelected ? "bg-primary/15" : "bg-gray-50"
                        }`}
                      >
                        <Ionicons
                          name={saved.isStation ? "train-outline" : "bus-outline"}
                          size={14}
                          color={
                            isSelected ? colors.primary : colors.textSecondary
                          }
                        />
                        <Text
                          className={`ml-1.5 text-xs font-medium ${
                            isSelected ? "text-primary" : "text-gray-700"
                          }`}
                          numberOfLines={1}
                          style={{ maxWidth: 100 }}
                        >
                          {saved.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {places.length > 0 && (
                    <TouchableOpacity
                      onPress={handleClearPlaces}
                      activeOpacity={0.7}
                      className="flex-row items-center rounded-xl bg-red-50 px-3 py-2.5 border border-red-100"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={colors.error}
                      />
                      <Text className="ml-1 text-xs font-medium text-red-500">
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={onAddPlace}
                    activeOpacity={0.7}
                    className="flex-row items-center rounded-xl bg-gray-50 px-3 py-2.5 border border-dashed border-gray-300"
                  >
                    <Ionicons
                      name="add-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text className="ml-1 text-xs font-medium text-gray-500">
                      Add
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <TouchableOpacity
                  onPress={onAddPlace}
                  activeOpacity={0.7}
                  className="items-center rounded-xl bg-gray-50 px-4 py-3 border border-dashed border-gray-300"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="add-outline"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text className="ml-1.5 text-xs font-medium text-gray-500">
                      Add a place or saved stop
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View className="px-4 pb-2 pt-3">
              <Text className="text-base font-bold text-gray-900">
                Nearby Stops
              </Text>
              {isLoading && (
                <Text className="mt-1 text-xs text-gray-400">Loading...</Text>
              )}
            </View>
          </>
        }
        ListEmptyComponent={
          <>
            {showError && !hasStaleData && (
              <View className="items-center px-4 py-8">
                <Ionicons
                  name="cloud-offline-outline"
                  size={36}
                  color={colors.textTertiary}
                />
                <Text className="mt-2 text-sm text-gray-500 text-center">
                  Failed to load nearby stops
                </Text>
                {onRetry && (
                  <TouchableOpacity
                    onPress={onRetry}
                    className="mt-3 rounded-full bg-primary px-6 py-2"
                    activeOpacity={0.7}
                  >
                    <Text className="text-sm font-semibold text-white">
                      Tap to Retry
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {isEmpty && !showError && (
              <View className="items-center px-4 py-8">
                <Text className="text-sm text-gray-400">
                  No stops found nearby
                </Text>
              </View>
            )}
          </>
        }
      />
      {showError && hasStaleData && (
        <View
          className="absolute left-0 right-0 bg-amber-50 px-4 py-2 border-t border-amber-100"
          style={{ bottom: insets.bottom }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons
              name="time-outline"
              size={12}
              color="#B45309"
            />
            <Text className="ml-1.5 text-[11px] text-amber-700">
              Showing cached results — data may be outdated
            </Text>
            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                className="ml-3 rounded-full bg-amber-100 px-3 py-1"
                activeOpacity={0.7}
              >
                <Text className="text-[11px] font-semibold text-amber-800">
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </BottomSheet>
  );
});
