import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconPicker } from "./IconPicker";
import { useSearchStops } from "@/hooks/stops/useSearchStops";
import { getCurrentPosition } from "@/services/location/location.service";
import { colors } from "@/constants/colors";
import type { QuickPlace, QuickPlaceIcon } from "@/types/quickPlaces.types";
import type { NearbyStop } from "@/services/stops/stops.types";

interface QuickPlaceSheetProps {
  visible: boolean;
  place?: QuickPlace;
  nearbyStops: NearbyStop[] | undefined;
  onSave: (place: QuickPlace | Omit<QuickPlace, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

type LocationMode = "none" | "gps" | "search";

const DEBOUNCE_MS = 300;

function findNearestStop(
  lat: number,
  lng: number,
  stops: NearbyStop[] | undefined,
  maxMeters = 300,
): { id: string; name: string } | undefined {
  if (!stops?.length) return undefined;
  let best: NearbyStop | undefined;
  let bestDist = Infinity;
  for (const s of stops) {
    const dLat = (s.latitude - lat) * 111320;
    const dLng = (s.longitude - lng) * (111320 * Math.cos((lat * Math.PI) / 180));
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  if (best && bestDist <= maxMeters) {
    return { id: best.id, name: best.name };
  }
  return undefined;
}

export function QuickPlaceSheet({
  visible,
  place,
  nearbyStops,
  onSave,
  onClose,
}: QuickPlaceSheetProps) {
  const insets = useSafeAreaInsets();
  const isEdit = place != null;

  const [name, setName] = useState(place?.name ?? "");
  const [icon, setIcon] = useState<QuickPlaceIcon>(place?.icon ?? "home");
  const [lat, setLat] = useState(place?.latitude ?? 0);
  const [lng, setLng] = useState(place?.longitude ?? 0);
  const [hasLocation, setHasLocation] = useState(place != null);
  const [nearbyStopId, setNearbyStopId] = useState(place?.nearbyStopId);
  const [nearbyStopName, setNearbyStopName] = useState(place?.nearbyStopName);
  const [locationLabel, setLocationLabel] = useState(
    place ? `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}` : "",
  );

  const [locationMode, setLocationMode] = useState<LocationMode>("none");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchText.trim());
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const {
    data: searchResults,
    isLoading: searchLoading,
  } = useSearchStops(debouncedQuery);

  const showSearchResults =
    locationMode === "search" && debouncedQuery.length >= 2 && !searchLoading;

  const canSave = name.trim().length > 0 && hasLocation && lat !== 0 && lng !== 0;

  const resetForm = useCallback(() => {
    setName(place?.name ?? "");
    setIcon(place?.icon ?? "home");
    setLat(place?.latitude ?? 0);
    setLng(place?.longitude ?? 0);
    setHasLocation(place != null);
    setNearbyStopId(place?.nearbyStopId);
    setNearbyStopName(place?.nearbyStopName);
    setLocationLabel(
      place ? `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}` : "",
    );
    setLocationMode("none");
    setSearchText("");
    setDebouncedQuery("");
  }, [place]);

  useEffect(() => {
    if (visible) resetForm();
  }, [visible, resetForm]);

  const handleUseGPS = useCallback(async () => {
    setGpsLoading(true);
    try {
      const loc = await getCurrentPosition();
      setLat(loc.latitude);
      setLng(loc.longitude);
      setHasLocation(true);
      setLocationLabel(`${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`);

      const nearest = findNearestStop(loc.latitude, loc.longitude, nearbyStops);
      if (nearest) {
        setNearbyStopId(nearest.id);
        setNearbyStopName(nearest.name);
        setLocationLabel(`${nearest.name} (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`);
      }

      setLocationMode("none");
    } catch {
      Alert.alert(
        "Location Error",
        "Could not get your location. Check your GPS settings and try again.",
      );
    } finally {
      setGpsLoading(false);
    }
  }, [nearbyStops]);

  const handlePickFromSearch = useCallback(() => {
    setLocationMode("search");
    setSearchText("");
    setDebouncedQuery("");
  }, []);

  const handleSelectStop = useCallback(
    (stop: { latitude: number; longitude: number; name: string; id: string }) => {
      setLat(stop.latitude);
      setLng(stop.longitude);
      setHasLocation(true);
      setNearbyStopId(stop.id);
      setNearbyStopName(stop.name);
      setLocationLabel(`${stop.name} (${stop.latitude.toFixed(4)}, ${stop.longitude.toFixed(4)})`);
      setLocationMode("none");
      setSearchText("");
      setDebouncedQuery("");
      Keyboard.dismiss();
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;

    const data = {
      name: name.trim(),
      icon,
      latitude: lat,
      longitude: lng,
      nearbyStopId,
      nearbyStopName,
    };

    if (isEdit) {
      onSave({ ...data, id: place!.id, createdAt: place!.createdAt, updatedAt: Date.now() });
    } else {
      onSave(data as Omit<QuickPlace, "id" | "createdAt" | "updatedAt">);
    }
  }, [canSave, name, icon, lat, lng, nearbyStopId, nearbyStopName, isEdit, place, onSave]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Place",
      `Remove "${place?.name}" from Quick Access?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (place) {
              onSave({ ...place, name: "", icon: "pin", latitude: 0, longitude: 0 });
            }
          },
        },
      ],
    );
  }, [place, onSave]);

  const handleSavePress = useCallback(() => {
    handleSave();
    onClose();
  }, [handleSave, onClose]);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);
  const renderSearchItem = useCallback(
    ({ item }: { item: { id: string; name: string; latitude: number; longitude: number; isStation: boolean } }) => (
      <TouchableOpacity
        onPress={() => handleSelectStop(item)}
        activeOpacity={0.7}
        className="flex-row items-center border-b border-gray-100 px-4 py-3"
      >
        <View
          className={`h-8 w-8 items-center justify-center rounded-full ${
            item.isStation ? "bg-primary/20" : "bg-primary/10"
          }`}
        >
          <Ionicons
            name={item.isStation ? "train-outline" : "bus-outline"}
            size={16}
            color={colors.primary}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
      </TouchableOpacity>
    ),
    [handleSelectStop],
  );

  const showSearchHint = locationMode === "search" && debouncedQuery.length < 2;
  const showSearchLoading = locationMode === "search" && searchLoading && debouncedQuery.length >= 2;
  const showSearchEmpty = showSearchResults && searchResults?.length === 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-white"
      >
        <View
          className="flex-row items-center justify-between px-4 pb-2 border-b border-gray-100"
          style={{ paddingTop: insets.top + 8 }}
        >
          <TouchableOpacity
            onPress={onClose}
            className="h-10 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-base text-gray-500">Cancel</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Place" : "Add Place"}
          </Text>
          <TouchableOpacity
            onPress={handleSavePress}
            disabled={!canSave}
            className="h-10 items-center justify-center"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              className={`text-base font-semibold ${
                canSave ? "text-primary" : "text-gray-300"
              }`}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {locationMode === "search" ? (
          <View className="flex-1 px-4 pt-4">
            <TouchableOpacity
              onPress={() => setLocationMode("none")}
              className="flex-row items-center mb-4"
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
              <Text className="ml-1 text-base font-semibold text-gray-900">
                Pick a Stop
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center rounded-xl bg-gray-100 px-3 mb-3">
              <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
              <TextInput
                className="ml-2 flex-1 h-11 text-base text-gray-900"
                placeholder="Search stops..."
                placeholderTextColor={colors.textTertiary}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {showSearchHint && (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
                <Text className="mt-3 text-sm text-gray-400 text-center px-4">
                  Type at least 2 characters to search
                </Text>
              </View>
            )}

            {showSearchLoading && (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {showSearchEmpty && (
              <View className="flex-1 items-center justify-center">
                <Text className="text-sm text-gray-400">
                  No stops found for &apos;{debouncedQuery}&apos;
                </Text>
              </View>
            )}

            {showSearchResults && searchResults && searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={keyExtractor}
                className="flex-1"
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        ) : (
          <View className="flex-1 px-4 pt-4">
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Name
              </Text>
              <TextInput
                className="rounded-xl bg-gray-100 px-4 h-12 text-base text-gray-900"
                placeholder="e.g. Home, Work, Campus"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus={!isEdit}
                maxLength={30}
              />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Icon
              </Text>
              <IconPicker selected={icon} onSelect={setIcon} />
            </View>

            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Location
              </Text>

              <View className="flex-row gap-2 mb-3">
                <TouchableOpacity
                  onPress={handleUseGPS}
                  disabled={gpsLoading}
                  className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                    gpsLoading ? "bg-gray-100" : "bg-gray-50"
                  }`}
                  activeOpacity={0.7}
                >
                  {gpsLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                  )}
                  <Text className="ml-1.5 text-xs font-semibold text-primary">
                    Use My Location
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePickFromSearch}
                  className="flex-1 flex-row items-center justify-center rounded-xl bg-gray-50 py-3"
                  activeOpacity={0.7}
                >
                  <Ionicons name="search-outline" size={16} color={colors.primary} />
                  <Text className="ml-1.5 text-xs font-semibold text-primary">
                    Pick a Stop
                  </Text>
                </TouchableOpacity>
              </View>

              {hasLocation ? (
                <View className="rounded-lg bg-primary/5 px-3 py-2.5 border border-primary/10">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary}
                    />
                    <Text className="ml-2 text-xs text-gray-700 flex-1" numberOfLines={2}>
                      {locationLabel}
                    </Text>
                  </View>
                  {nearbyStopId && (
                    <View className="flex-row items-center mt-1.5">
                      <Ionicons name="bus-outline" size={12} color={colors.textTertiary} />
                      <Text className="ml-1 text-[11px] text-gray-400">
                        Nearest stop: {nearbyStopName}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className="rounded-lg bg-gray-50 px-3 py-2.5">
                  <Text className="text-xs text-gray-400 text-center">
                    Select a location to continue
                  </Text>
                </View>
              )}
            </View>

            {isEdit && (
              <TouchableOpacity
                onPress={handleDelete}
                className="mt-auto mb-6 items-center justify-center rounded-xl bg-red-50 py-3"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-red-500">Delete Place</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
