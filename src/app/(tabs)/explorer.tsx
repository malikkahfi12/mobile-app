import { TAB_BAR_HEIGHT } from "@/components/navigation/FloatingTabBar";
import { CategoryTabs } from "@/components/places/CategoryTabs";
import { ExplorePlaceCard } from "@/components/places/ExplorePlaceCard";
import { PlaceDetailSheet } from "@/components/places/PlaceDetailSheet";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { colors } from "@/constants/colors";
import { usePlaceSearch } from "@/hooks/places/usePlaceSearch";
import { usePlacesExplore } from "@/hooks/places/usePlacesExplore";
import type { ExplorePlaceItem } from "@/services/places/places.types";
import { useExplorerStore } from "@/store/explorer.store";
import { useLocationStore } from "@/store/location.store";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SEARCH_DEBOUNCE_MS = 350;
const SKELETON_COUNT = 5;

const SearchBarInput = memo(function SearchBarInput({
  value,
  onChangeText,
  onClear,
  placeholder,
  inputRef,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onClear: () => void;
  placeholder: string;
  inputRef: React.RefObject<TextInput | null>;
}) {
  return (
    <View
      className="mx-4 mt-3 flex-row items-center rounded-xl bg-white/90 px-4 py-3 shadow-sm"
    >
      <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
      <TextInput
        ref={inputRef}
        className="ml-2 flex-1 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function SkeletonCard() {
  return (
    <View className="flex-row items-center px-4 py-3.5 border-b border-gray-50">
      <SkeletonBlock
        width={44}
        height={44}
        borderRadius={12}
        className="bg-gray-200"
      />
      <View className="ml-3 flex-1">
        <SkeletonBlock height={14} flex={1} className="mb-2 bg-gray-200" />
        <SkeletonBlock height={10} flex={0.6} className="bg-gray-100" />
      </View>
      <SkeletonBlock width={56} height={20} borderRadius={10} className="ml-2 bg-gray-200" />
    </View>
  );
}

const SkeletonList = memo(function SkeletonList() {
  return (
    <>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
});

export default function ExplorerScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList<ExplorePlaceItem>>(null);

  const searchQuery = useExplorerStore((s) => s.searchQuery);
  const selectedCategory = useExplorerStore((s) => s.selectedCategory);
  const setSearchQuery = useExplorerStore((s) => s.setSearchQuery);
  const setSelectedCategory = useExplorerStore((s) => s.setSelectedCategory);
  const setSelectedPlace = useExplorerStore((s) => s.setSelectedPlace);

  const currentLocation = useLocationStore((s) => s.currentLocation);
  const currentLocationRef = useRef(currentLocation);

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);
  const isSearchMode = searchQuery.length >= 2;
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchMode) {
      setSelectedPlace(null);
    }
  }, [isSearchMode, setSelectedPlace]);

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isError: searchError,
    refetch: retrySearch,
  } = usePlaceSearch(
    isSearchMode ? debouncedQuery : "",
    currentLocation?.latitude,
    currentLocation?.longitude,
  );

  const {
    data: exploreData,
    isLoading: exploreLoading,
    isFetching: exploreFetching,
    isError: exploreError,
    refetch: retryExplore,
  } = usePlacesExplore(
    currentLocation?.latitude,
    currentLocation?.longitude,
    selectedCategory,
  );

  const handlePlacePress = useCallback(
    (place: ExplorePlaceItem) => {
      Keyboard.dismiss();
      setSelectedPlace(place);
    },
    [setSelectedPlace],
  );

  const handleClearSearch = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchQuery("");
    setDebouncedQuery("");
  }, [setSearchQuery]);

  const handleSearchChange = useCallback((value: string) => {
    if ((value.length >= 2) !== (searchQuery.length >= 2)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSearchQuery(value);
  }, [searchQuery.length, setSearchQuery]);

  const isRefreshing = isSearchMode ? searchFetching : exploreFetching;

  const handleRefresh = useCallback(() => {
    if (isSearchMode) retrySearch();
    else retryExplore();
  }, [isSearchMode, retrySearch, retryExplore]);

  const isFirstLoad = isSearchMode ? searchLoading : exploreLoading;

  const [showSkeleton, setShowSkeleton] = useState(false);
  useEffect(() => {
    if (!isFirstLoad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- timer-driven state sync is legitimate external system use
      setShowSkeleton(false);
      return;
    }
    const id = setTimeout(() => setShowSkeleton(true), 300);
    return () => clearTimeout(id);
  }, [isFirstLoad]);

  const isError = isSearchMode ? searchError : exploreError;

  const handleRetry = useCallback(() => {
    if (isSearchMode) retrySearch();
    else retryExplore();
  }, [isSearchMode, retrySearch, retryExplore]);

  const flatItems = useMemo(() => {
    if (isSearchMode) {
      return (searchData?.data ?? []).map((p) => ({
        ...p,
        key: p.id,
      }));
    }

    return (exploreData?.data ?? []).map((p) => ({
      ...p,
      key: p.id,
    }));
  }, [isSearchMode, searchData, exploreData]);

  const renderItem = useCallback(
    ({ item }: { item: ExplorePlaceItem }) => {
      const loc = currentLocationRef.current;
      const distance =
        loc
          ? getDistanceMeters(
              loc.latitude,
              loc.longitude,
              item.lat,
              item.lng,
            )
          : undefined;

      return (
        <ExplorePlaceCard
          place={item}
          distanceMeters={distance}
          onPress={() => handlePlacePress(item)}
        />
      );
    },
    [handlePlacePress],
  );

  const ITEM_HEIGHT = 56;

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback(
    (item: ExplorePlaceItem) => item.id,
    [],
  );

  const showHint = isSearchMode && debouncedQuery.length < 2;
  const showEmpty =
    isSearchMode &&
    debouncedQuery.length >= 2 &&
    !isFirstLoad &&
    flatItems.length === 0;

  const renderListHeader = useCallback(() => {
    if (isSearchMode && searchData?.meta && searchData.meta.count > 0) {
      return (
        <View className="mx-4 mb-1 flex-row items-center justify-between p-4">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t("explorer.searchResults")}
          </Text>
          <Text className="text-xs text-gray-300">
            {searchData.meta.count} {t("explorer.placesFound")}
          </Text>
        </View>
      );
    }

    if (!isSearchMode && exploreData?.meta && exploreData.meta.count > 0) {
      return (
        <View className="mx-4 mb-1 flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t("explorer.categoryResults")}
          </Text>
          <Text className="text-xs text-gray-300">
            {exploreData.meta.count} {t("explorer.placesFound")}
          </Text>
        </View>
      );
    }

    return null;
  }, [isSearchMode, exploreData, searchData, t]);

  const renderEmpty = useCallback(() => {
    if (showSkeleton) {
      return <SkeletonList />;
    }

    if (isError) {
      return (
        <View className="items-center px-4 py-20">
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={colors.error}
          />
          <Text className="mt-3 text-sm text-gray-500 text-center">
            {t("explorer.loadFailed")}
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="mt-4 rounded-full bg-primary px-6 py-2"
          >
            <Text className="text-sm font-semibold text-white">
              {t("common.retryTap")}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (showHint) {
      return (
        <View className="items-center py-20 px-8">
          <Ionicons
            name="search-outline"
            size={48}
            color={colors.textTertiary}
          />
          <Text className="mt-4 text-sm text-gray-400 text-center">
            {t("explorer.searchHint")}
          </Text>
        </View>
      );
    }

    if (showEmpty) {
      return (
        <View className="items-center py-20 px-8">
          <Ionicons
            name="compass-outline"
            size={48}
            color={colors.textTertiary}
          />
          <Text className="mt-4 text-sm text-gray-400 text-center">
            {t("explorer.noResults", { query: searchQuery })}
          </Text>
        </View>
      );
    }

    if (!isSearchMode && !isFirstLoad && flatItems.length === 0 && !isError) {
      return (
        <View className="items-center py-20 px-8">
          <Ionicons
            name="compass-outline"
            size={48}
            color={colors.textTertiary}
          />
          <Text className="mt-4 text-sm text-gray-400 text-center">
            {t("explorer.noPlacesNearby")}
          </Text>
        </View>
      );
    }

    return null;
  }, [showSkeleton, isError, showHint, showEmpty, isSearchMode, isFirstLoad, flatItems.length, handleRetry, searchQuery, t]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <SearchBarInput
        value={searchQuery}
        onChangeText={handleSearchChange}
        onClear={handleClearSearch}
        placeholder={t("explorer.searchPlaceholder")}
        inputRef={searchInputRef}
      />

      {!isSearchMode && (
        <CategoryTabs selected={selectedCategory} onSelect={setSelectedCategory} />
      )}

      <FlatList
        key={isSearchMode ? "search" : selectedCategory}
        ref={flatListRef}
        data={flatItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        windowSize={5}
        maxToRenderPerBatch={10}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={15}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 16 }}
        onScrollBeginDrag={Keyboard.dismiss}
        scrollEventThrottle={16}
        refreshControl={
          showSkeleton ? undefined : (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          )
        }
      />
      <PlaceDetailSheet />
    </View>
  );
}
