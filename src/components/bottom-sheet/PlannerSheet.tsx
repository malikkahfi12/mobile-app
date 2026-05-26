import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useUnifiedSearch } from "@/hooks/search/useUnifiedSearch";
import { useSearchCenter } from "@/hooks/search/useSearchCenter";
import { resolveToStop } from "@/hooks/search/resolveToStop";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { PlaceResultCard } from "@/components/search/PlaceResultCard";
import { useLocationStore } from "@/store/location.store";
import { useUIStore } from "@/store/ui.store";
import { colors } from "@/constants/colors";
import type { SearchStopResult, SearchPlaceResult } from "@/services/search/search.types";
import type { TripLocation } from "@/store/location.store";

type SearchMode = "origin" | "destination" | null;

type FlatListItem =
  | { type: "section-header"; title: string; key: string }
  | (SearchStopResult & { type: "stop" })
  | (SearchPlaceResult & { type: "place" });

const SNAP_POINTS = ["70%", "92%"];
const DEBOUNCE_MS = 300;

export const PlannerSheet = memo(function PlannerSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const origin = useLocationStore((s) => s.origin);
  const destination = useLocationStore((s) => s.destination);
  const setOrigin = useLocationStore((s) => s.setOrigin);
  const setDestination = useLocationStore((s) => s.setDestination);
  const swapOriginDestination = useLocationStore((s) => s.swapOriginDestination);
  const setBottomSheet = useUIStore((s) => s.setBottomSheet);
  const closeBottomSheet = useUIStore((s) => s.closeBottomSheet);

  const [activeSearch, setActiveSearch] = useState<SearchMode>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [resolvingOrigin, setResolvingOrigin] = useState(false);
  const [originResolveError, setOriginResolveError] = useState<string | null>(null);
  const [resolvingDestination, setResolvingDestination] = useState(false);
  const [destinationResolveError, setDestinationResolveError] = useState<string | null>(null);

  const searchCenter = useSearchCenter();

  const hasAutoSetOrigin = useRef(false);

  useEffect(() => {
    if (hasAutoSetOrigin.current) return;
    if (origin !== null) return;
    hasAutoSetOrigin.current = true;

    const loc = useLocationStore.getState().currentLocation;
    if (!loc) return;

    const tripLoc: TripLocation = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      name: "Current Location",
      type: "currentLocation",
    };
    setOrigin(tripLoc);
    setResolvingOrigin(true);

    resolveToStop(loc.latitude, loc.longitude).then((nearest) => {
      const current = useLocationStore.getState().origin;
      if (current?.name !== "Current Location") return;

      setResolvingOrigin(false);
      if (nearest) {
        setOrigin({
          ...tripLoc,
          stopId: nearest.id,
          resolvedStopName: nearest.name,
        });
      } else {
        setOriginResolveError(
          "No nearby transit stop found near your current location.",
        );
      }
    });
  }, [origin, setOrigin]);

  useEffect(() => {
    if (searchText.length === 0) {
      setDebouncedQuery("");
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchText.trim());
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isError: searchError,
    refetch: retrySearch,
  } = useUnifiedSearch(debouncedQuery, searchCenter?.lat, searchCenter?.lng);

  const canSwap = origin !== null || destination !== null;
  const canFindRoute =
    origin !== null &&
    destination !== null &&
    !!origin.stopId &&
    !!destination.stopId &&
    !originResolveError &&
    !destinationResolveError;

  const handleFindRoute = useCallback(() => {
    Keyboard.dismiss();
    setBottomSheet(0, "routingResult");
  }, [setBottomSheet]);

  const openSearch = useCallback((mode: "origin" | "destination") => {
    setSearchText("");
    setDebouncedQuery("");
    setActiveSearch(mode);
  }, []);

  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    setActiveSearch(null);
    setSearchText("");
    setDebouncedQuery("");
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setDebouncedQuery("");
  }, []);

  const handleSelectStop = useCallback(
    (stop: SearchStopResult) => {
      const loc: TripLocation = {
        latitude: stop.latitude,
        longitude: stop.longitude,
        name: stop.name,
        stopId: stop.id,
        type: "stop",
      };

      if (activeSearch === "origin") {
        setOrigin(loc);
        setResolvingOrigin(false);
        setOriginResolveError(null);
      } else if (activeSearch === "destination") {
        setDestination(loc);
        setResolvingDestination(false);
        setDestinationResolveError(null);
      }
      closeSearch();
    },
    [activeSearch, setOrigin, setDestination, closeSearch],
  );

  const handleSelectPlace = useCallback(
    async (place: SearchPlaceResult) => {
      const loc: TripLocation = {
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        address: place.address,
        type: "place",
      };

      if (activeSearch === "origin") {
        setOrigin(loc);
        setResolvingOrigin(true);
        setOriginResolveError(null);
        closeSearch();

        const nearest = await resolveToStop(place.latitude, place.longitude);
        const currentOrigin = useLocationStore.getState().origin;
        if (currentOrigin?.name !== place.name) return;

        setResolvingOrigin(false);
        if (nearest) {
          setOrigin({ ...loc, stopId: nearest.id, resolvedStopName: nearest.name });
        } else {
          setOriginResolveError("No nearby transit stop found for this location.");
        }
      } else if (activeSearch === "destination") {
        setDestination(loc);
        setResolvingDestination(true);
        setDestinationResolveError(null);
        closeSearch();

        const nearest = await resolveToStop(place.latitude, place.longitude);
        const currentDestination = useLocationStore.getState().destination;
        if (currentDestination?.name !== place.name) return;

        setResolvingDestination(false);
        if (nearest) {
          setDestination({ ...loc, stopId: nearest.id, resolvedStopName: nearest.name });
        } else {
          setDestinationResolveError("No nearby transit stop found for this location.");
        }
      }
    },
    [activeSearch, setOrigin, setDestination, closeSearch],
  );

  const handleClearOrigin = useCallback(() => {
    setOrigin(null);
    setResolvingOrigin(false);
    setOriginResolveError(null);
  }, [setOrigin]);

  const handleClearDestination = useCallback(() => {
    setDestination(null);
    setResolvingDestination(false);
    setDestinationResolveError(null);
  }, [setDestination]);

  const handleRetryOriginResolve = useCallback(async () => {
    const current = useLocationStore.getState().origin;
    if (!current || (current.type !== "place" && current.type !== "currentLocation")) return;

    setResolvingOrigin(true);
    setOriginResolveError(null);

    const nearest = await resolveToStop(current.latitude, current.longitude);
    const currentOrigin = useLocationStore.getState().origin;
    if (currentOrigin?.name !== current.name) return;

    setResolvingOrigin(false);
    if (nearest) {
      setOrigin({ ...current, stopId: nearest.id, resolvedStopName: nearest.name });
    } else {
      setOriginResolveError(
        current.type === "currentLocation"
          ? "No nearby transit stop found near your current location."
          : "No nearby transit stop found for this location.",
      );
    }
  }, [setOrigin]);

  const handleRetryDestinationResolve = useCallback(async () => {
    const current = useLocationStore.getState().destination;
    if (!current || current.type !== "place") return;

    setResolvingDestination(true);
    setDestinationResolveError(null);

    const nearest = await resolveToStop(current.latitude, current.longitude);
    const currentDestination = useLocationStore.getState().destination;
    if (currentDestination?.name !== current.name) return;

    setResolvingDestination(false);
    if (nearest) {
      setDestination({ ...current, stopId: nearest.id, resolvedStopName: nearest.name });
    } else {
      setDestinationResolveError("No nearby transit stop found for this location.");
    }
  }, [setDestination]);

  const listData = useMemo(() => {
    if (!searchData) return [];
    const items: FlatListItem[] = [];

    if (searchData.stops.length > 0) {
      items.push({ type: "section-header", title: "Stops", key: "section-stops" });
      for (const stop of searchData.stops) {
        items.push({ ...stop, type: "stop" as const });
      }
    }

    if (searchData.places.length > 0) {
      items.push({ type: "section-header", title: "Places", key: "section-places" });
      for (const place of searchData.places) {
        items.push({ ...place, type: "place" as const });
      }
    }

    return items;
  }, [searchData]);

  const showResults = debouncedQuery.length >= 2;
  const showEmpty =
    showResults &&
    !searchLoading &&
    !searchFetching &&
    listData.length === 0;
  const showLoading = searchLoading || (searchFetching && debouncedQuery.length >= 2);
  const showHint = debouncedQuery.length < 2;
  const isSearchMode = activeSearch !== null;

  const renderSearchItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "section-header") {
        return (
          <View className="px-4 py-2.5 bg-gray-50">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {item.title}
            </Text>
          </View>
        );
      }

      if (item.type === "stop") {
        return (
          <SearchResultCard
            stop={item}
            onPress={() => handleSelectStop(item as SearchStopResult)}
          />
        );
      }

      return (
        <PlaceResultCard
          place={item as SearchPlaceResult}
          onPress={() => handleSelectPlace(item as SearchPlaceResult)}
        />
      );
    },
    [handleSelectStop, handleSelectPlace],
  );

  const keyExtractor = useCallback(
    (item: FlatListItem) => {
      if (item.type === "section-header") return item.key;
      return item.id;
    },
    [],
  );

  const getItemLayout = useCallback(
    (_data: ArrayLike<FlatListItem> | null | undefined, index: number) => {
      const baseHeight = 56;
      return {
        length: baseHeight,
        offset: baseHeight * index,
        index,
      };
    },
    [],
  );

  const renderTripRowSubtext = (loc: TripLocation | null, slot: "origin" | "destination") => {
    const isOrigin = slot === "origin";
    const resolving = isOrigin ? resolvingOrigin : resolvingDestination;
    const resolveError = isOrigin ? originResolveError : destinationResolveError;
    const resolvedStopName = loc?.resolvedStopName;

    if (!loc || (loc.type !== "place" && loc.type !== "currentLocation")) return null;

    if (resolving) {
      return (
        <View className="mt-0.5 flex-row items-center">
          <ActivityIndicator size={10} color={colors.textTertiary} />
          <Text className="ml-1.5 text-xs text-gray-400">Finding nearest stop...</Text>
        </View>
      );
    }

    if (resolveError) {
      return (
        <TouchableOpacity
          onPress={isOrigin ? handleRetryOriginResolve : handleRetryDestinationResolve}
        >
          <Text className="mt-0.5 text-xs text-red-500">{resolveError} Tap to retry.</Text>
        </TouchableOpacity>
      );
    }

    if (resolvedStopName) {
      if (loc.type === "currentLocation") {
        return (
          <View className="mt-0.5">
            <Text className="text-xs text-gray-400" numberOfLines={1}>
              Using your current location
            </Text>
            <Text className="text-xs text-gray-400" numberOfLines={1}>
              Nearest stop: {resolvedStopName}
            </Text>
          </View>
        );
      }
      return (
        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
          Nearest stop: {resolvedStopName}
        </Text>
      );
    }

    if (loc.type === "currentLocation") {
      return (
        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
          Using your current location
        </Text>
      );
    }

    return null;
  };

  const renderDefaultRow = (
    loc: TripLocation | null,
    slot: "origin" | "destination",
    icon: "ellipse-outline" | "location-outline",
    placeholder: string,
  ) => (
    <TouchableOpacity
      onPress={() => openSearch(slot)}
      className={`flex-row items-center rounded-xl px-4 py-4 ${
        loc ? "bg-primary/10 border border-primary/30" : "bg-gray-50"
      }`}
      activeOpacity={0.7}
    >
      <View className="h-4 w-4 items-center justify-center">
        <Ionicons
          name={icon}
          size={loc ? 14 : 16}
          color={colors.primary}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text
          className={`text-base ${loc ? "text-gray-900" : "text-gray-400"}`}
          numberOfLines={1}
        >
          {loc ? loc.name : placeholder}
        </Text>
        {renderTripRowSubtext(loc, slot)}
      </View>
      {loc ? (
        <TouchableOpacity
          onPress={slot === "origin" ? handleClearOrigin : handleClearDestination}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      index={isSearchMode ? 1 : 1}
      enableDynamicSizing={false}
      enablePanDownToClose={!isSearchMode}
      handleIndicatorStyle={{
        backgroundColor: colors.textTertiary,
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: colors.white }}
    >
      {isSearchMode ? (
        <View className="flex-1 px-4 pt-2">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={closeSearch}
              className="h-10 w-10 items-center justify-center"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text className="ml-1 text-lg font-semibold text-gray-900">
              {activeSearch === "origin" ? "Select Origin" : "Select Destination"}
            </Text>
          </View>

          <View className="flex-row items-center rounded-xl bg-gray-100 px-3 mb-3">
            <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              className="ml-2 flex-1 h-12 text-base text-gray-900"
              placeholder="Search stops and places..."
              placeholderTextColor={colors.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={handleClearSearch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-1">
            {showHint && (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="search-outline" size={44} color={colors.textTertiary} />
                <Text className="mt-3 text-sm text-gray-400 text-center px-4">
                  Type at least 2 characters to search for stops and places
                </Text>
              </View>
            )}

            {showLoading && (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="mt-3 text-sm text-gray-400">Searching...</Text>
              </View>
            )}

            {searchError && !searchLoading && !searchFetching && (
              <View className="flex-1 items-center justify-center px-4">
                <Ionicons
                  name="alert-circle-outline"
                  size={44}
                  color={colors.error}
                />
                <Text className="mt-3 text-sm text-gray-500 text-center">
                  Failed to search. Check your connection and try again.
                </Text>
                <TouchableOpacity
                  onPress={() => retrySearch()}
                  className="mt-4 rounded-full bg-primary px-6 py-2"
                >
                  <Text className="text-sm font-semibold text-white">Tap to Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {showEmpty && (
              <View className="flex-1 items-center justify-center px-4">
                <Ionicons name="search-outline" size={44} color={colors.textTertiary} />
                <Text className="mt-3 text-sm text-gray-400 text-center">
                  No results found for &apos;{debouncedQuery}&apos;
                </Text>
              </View>
            )}

            {showResults && listData.length > 0 && !searchLoading && (
              <FlatList
                data={listData}
                renderItem={renderSearchItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                className="flex-1"
                keyboardShouldPersistTaps="handled"
              />
            )}
          </View>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-2">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xl font-bold text-gray-900">Plan Route</Text>
              <Text className="mt-0.5 text-sm text-gray-400">
                Where do you want to go?
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                closeBottomSheet();
              }}
              className="h-8 w-8 items-center justify-center rounded-full bg-gray-100"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {renderDefaultRow(origin, "origin", "ellipse-outline", "Tap to select origin stop")}

          <View className="flex-row justify-center my-3">
            <TouchableOpacity
              onPress={swapOriginDestination}
              disabled={!canSwap}
              className={`h-10 w-10 items-center justify-center rounded-full ${
                canSwap ? "bg-primary/10" : "bg-gray-100"
              }`}
            >
              <Ionicons
                name="swap-vertical"
                size={20}
                color={canSwap ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {renderDefaultRow(destination, "destination", "location-outline", "Tap to select destination stop")}

          <View className="mt-6">
            <TouchableOpacity
              onPress={handleFindRoute}
              className={`rounded-xl py-3.5 items-center ${
                canFindRoute ? "bg-primary" : "bg-gray-200"
              }`}
              disabled={!canFindRoute}
              activeOpacity={0.8}
            >
              <Text
                className={`text-base font-semibold ${
                  canFindRoute ? "text-white" : "text-gray-400"
                }`}
              >
                Find Route
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </BottomSheet>
  );
});
