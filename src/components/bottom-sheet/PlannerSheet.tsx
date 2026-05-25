import { useCallback, useEffect, useRef, useState, memo } from "react";
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
import { useSearchStops } from "@/hooks/stops/useSearchStops";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import { useLocationStore } from "@/store/location.store";
import { useUIStore } from "@/store/ui.store";
import { colors } from "@/constants/colors";
import type { Stop } from "@/services/stops/stops.types";

type SearchMode = "origin" | "destination" | null;

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
    isFetching: searchFetching,
    isError: searchError,
    refetch: retrySearch,
  } = useSearchStops(debouncedQuery);

  const canSwap = origin !== null || destination !== null;
  const canFindRoute = origin !== null && destination !== null;

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

  const handleSelectStop = useCallback(
    (stop: Stop) => {
      if (activeSearch === "origin") {
        setOrigin({
          latitude: stop.latitude,
          longitude: stop.longitude,
          name: stop.name,
          stopId: stop.id,
        });
      } else if (activeSearch === "destination") {
        setDestination({
          latitude: stop.latitude,
          longitude: stop.longitude,
          name: stop.name,
          stopId: stop.id,
        });
      }
      closeSearch();
    },
    [activeSearch, setOrigin, setDestination, closeSearch],
  );

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setDebouncedQuery("");
  }, []);

  const showResults = debouncedQuery.length >= 2;
  const showEmpty =
    showResults &&
    !searchLoading &&
    !searchFetching &&
    searchResults?.length === 0;
  const showLoading = searchLoading || (searchFetching && debouncedQuery.length >= 2);
  const showHint = debouncedQuery.length < 2;
  const isSearchMode = activeSearch !== null;

  const renderSearchItem = useCallback(
    ({ item }: { item: Stop }) => (
      <SearchResultCard
        stop={item}
        onPress={() => handleSelectStop(item)}
      />
    ),
    [handleSelectStop],
  );

  const keyExtractor = useCallback((item: Stop) => item.id, []);

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
              <Ionicons
                name="arrow-back"
                size={22}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <Text className="ml-1 text-lg font-semibold text-gray-900">
              {activeSearch === "origin" ? "Select Origin" : "Select Destination"}
            </Text>
          </View>

          <View className="flex-row items-center rounded-xl bg-gray-100 px-3 mb-3">
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textTertiary}
            />
            <TextInput
              className="ml-2 flex-1 h-12 text-base text-gray-900"
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
              <TouchableOpacity
                onPress={handleClearSearch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-1">
            {showHint && (
              <View className="flex-1 items-center justify-center">
                <Ionicons
                  name="search-outline"
                  size={44}
                  color={colors.textTertiary}
                />
                <Text className="mt-3 text-sm text-gray-400 text-center px-4">
                  Type at least 2 characters to search for stops and stations
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
                  <Text className="text-sm font-semibold text-white">
                    Tap to Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {showEmpty && (
              <View className="flex-1 items-center justify-center px-4">
                <Ionicons
                  name="search-outline"
                  size={44}
                  color={colors.textTertiary}
                />
                <Text className="mt-3 text-sm text-gray-400 text-center">
                  No stops found for &apos;{debouncedQuery}&apos;
                </Text>
              </View>
            )}

            {showResults &&
              searchResults &&
              searchResults.length > 0 &&
              !searchLoading &&
              !searchFetching && (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchItem}
                  keyExtractor={keyExtractor}
                  className="flex-1"
                  keyboardShouldPersistTaps="handled"
                  ListHeaderComponent={
                    <View className="px-4 py-2">
                      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Results
                      </Text>
                    </View>
                  }
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

          <TouchableOpacity
            onPress={() => openSearch("origin")}
            className={`flex-row items-center rounded-xl px-4 py-4 ${
              origin
                ? "bg-primary/10 border border-primary/30"
                : "bg-gray-50"
            }`}
            activeOpacity={0.7}
          >
            <View className="h-4 w-4 rounded-full border-2 border-primary" />
            <Text
              className={`ml-3 flex-1 text-base ${
                origin ? "text-gray-900" : "text-gray-400"
              }`}
              numberOfLines={1}
            >
              {origin ? origin.name : "Tap to select origin stop"}
            </Text>
            {origin ? (
              <TouchableOpacity
                onPress={() => setOrigin(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            )}
          </TouchableOpacity>

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

          <TouchableOpacity
            onPress={() => openSearch("destination")}
            className={`flex-row items-center rounded-xl px-4 py-4 ${
              destination
                ? "bg-primary/10 border border-primary/30"
                : "bg-gray-50"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.primary}
            />
            <Text
              className={`ml-3 flex-1 text-base ${
                destination ? "text-gray-900" : "text-gray-400"
              }`}
              numberOfLines={1}
            >
              {destination
                ? destination.name
                : "Tap to select destination stop"}
            </Text>
            {destination ? (
              <TouchableOpacity
                onPress={() => setDestination(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            ) : (
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textTertiary}
              />
            )}
          </TouchableOpacity>

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
