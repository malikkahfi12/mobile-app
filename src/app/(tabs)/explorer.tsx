import { useCallback, useRef, useState, useEffect, useMemo, memo } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useExplorerStore } from "@/store/explorer.store";
import { useLocationStore } from "@/store/location.store";
import { usePlaceSearch } from "@/hooks/places/usePlaceSearch";
import { usePlacesExplore } from "@/hooks/places/usePlacesExplore";
import { useAllCategories } from "@/hooks/places/useAllCategories";
import { ExplorePlaceCard } from "@/components/places/ExplorePlaceCard";
import { CategoryChip } from "@/components/places/CategoryChip";
import { CategorySectionHeader } from "@/components/places/CategorySectionHeader";
import { PlaceDetailSheet } from "@/components/places/PlaceDetailSheet";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { colors } from "@/constants/colors";
import { TAB_BAR_HEIGHT } from "@/components/navigation/FloatingTabBar";
import type { ExplorePlaceItem, PlaceCategory } from "@/services/places/places.types";

const SEARCH_DEBOUNCE_MS = 350;
const SKELETON_COUNT = 5;

type FlatListItem =
  | {
      type: "section-header";
      categoryKey: PlaceCategory;
      count: number;
      key: string;
    }
  | (ExplorePlaceItem & { type: "place"; key: string });

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
      className="mx-4 mt-2 flex-row items-center rounded-xl bg-gray-100 px-3 py-2.5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
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
  const flatListRef = useRef<FlatList<FlatListItem>>(null);

  const searchQuery = useExplorerStore((s) => s.searchQuery);
  const selectedCategory = useExplorerStore((s) => s.selectedCategory);
  const selectedPlace = useExplorerStore((s) => s.selectedPlace);
  const setSearchQuery = useExplorerStore((s) => s.setSearchQuery);
  const setSelectedCategory = useExplorerStore((s) => s.setSelectedCategory);
  const setSelectedPlace = useExplorerStore((s) => s.setSelectedPlace);

  const currentLocation = useLocationStore((s) => s.currentLocation);
  const currentLocationRef = useRef(currentLocation);

  useEffect(() => {
    currentLocationRef.current = currentLocation;
  }, [currentLocation]);
  const isSearchMode = searchQuery.length >= 2;
  const isAllCategory = selectedCategory === "place";
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

  const [prevIsSearchMode, setPrevIsSearchMode] = useState(isSearchMode);
  if (isSearchMode !== prevIsSearchMode) {
    setPrevIsSearchMode(isSearchMode);
    if (isSearchMode) {
      setSelectedPlace(null);
    }
  }

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

  const {
    categories: allCategoriesData,
    isLoading: allLoading,
    isFetching: allFetching,
    isError: allError,
    refetch: retryAll,
  } = useAllCategories(
    currentLocation?.latitude,
    currentLocation?.longitude,
  );

  const prevCategoryRef = useRef(selectedCategory);

  useEffect(() => {
    if (prevCategoryRef.current === selectedCategory) return;
    prevCategoryRef.current = selectedCategory;

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

    if (isAllCategory) {
      retryAll();
    }
  }, [selectedCategory, isAllCategory, retryAll]);

  const handlePlacePress = useCallback(
    (place: ExplorePlaceItem) => {
      Keyboard.dismiss();
      setSelectedPlace(place);
    },
    [setSelectedPlace],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
  }, [setSearchQuery]);

  const handleSeeAll = useCallback(
    (categoryKey: PlaceCategory) => {
      setSelectedCategory(categoryKey);
    },
    [setSelectedCategory],
  );

  const effectiveFetching = !isSearchMode && isAllCategory ? allFetching : exploreFetching;
  const isRefreshing = isSearchMode ? searchFetching : effectiveFetching;

  const handleRefresh = useCallback(() => {
    if (isSearchMode) {
      retrySearch();
    } else if (isAllCategory) {
      retryAll();
    } else {
      retryExplore();
    }
  }, [isSearchMode, isAllCategory, retrySearch, retryAll, retryExplore]);

  const isFirstLoad = isSearchMode
    ? searchLoading
    : isAllCategory
      ? allLoading
      : exploreLoading;

  const isError = isSearchMode
    ? searchError
    : isAllCategory
      ? allError
      : exploreError;

  const handleRetry = useMemo(() => {
    if (isSearchMode) return () => retrySearch();
    if (isAllCategory) return () => retryAll();
    return () => retryExplore();
  }, [isSearchMode, isAllCategory, retrySearch, retryAll, retryExplore]);

  const flatItems = useMemo(() => {
    if (isSearchMode) {
      return (searchData?.data ?? []).map((p) => ({
        ...p,
        type: "place" as const,
        key: p.id,
      }));
    }

    if (!isAllCategory) {
      return (exploreData?.data ?? []).map((p) => ({
        ...p,
        type: "place" as const,
        key: p.id,
      }));
    }

    const items: FlatListItem[] = [];
    for (const [categoryKey, places] of Object.entries(allCategoriesData)) {
      if (!Array.isArray(places) || places.length === 0) continue;
      items.push({
        type: "section-header",
        categoryKey: categoryKey as PlaceCategory,
        count: places.length,
        key: `${categoryKey}-header`,
      });
      for (const place of places) {
        items.push({ ...place, type: "place" as const, key: place.id });
      }
    }
    return items;
  }, [isSearchMode, isAllCategory, searchData, exploreData, allCategoriesData]);

  const renderItem = useCallback(
    ({ item }: { item: FlatListItem }) => {
      if (item.type === "section-header") {
        return (
          <CategorySectionHeader
            categoryKey={item.categoryKey}
            count={item.count}
            onSeeAll={() => handleSeeAll(item.categoryKey)}
          />
        );
      }

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
    [handlePlacePress, handleSeeAll],
  );

  const keyExtractor = useCallback(
    (item: FlatListItem) => item.key,
    [],
  );

  const showHint = isSearchMode && debouncedQuery.length < 2;
  const showEmpty =
    isSearchMode &&
    debouncedQuery.length >= 2 &&
    !isFirstLoad &&
    flatItems.length === 0;
  const showLoading = isFirstLoad && flatItems.length === 0;

  const renderListHeader = useCallback(() => {
    if (isSearchMode && searchData?.meta && searchData.meta.count > 0) {
      return (
        <View className="mx-4 mb-1 flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t("explorer.searchResults")}
          </Text>
          <Text className="text-xs text-gray-300">
            {searchData.meta.count} {t("explorer.placesFound")}
          </Text>
        </View>
      );
    }

    if (!isSearchMode && !isAllCategory && exploreData?.meta && exploreData.meta.count > 0) {
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
  }, [isSearchMode, isAllCategory, exploreData, searchData, t]);

  const renderEmpty = useCallback(() => {
    if (showLoading) {
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
  }, [showLoading, isError, showHint, showEmpty, isSearchMode, isFirstLoad, flatItems.length, handleRetry, searchQuery, t]);

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <SearchBarInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
        placeholder={t("explorer.searchPlaceholder")}
        inputRef={searchInputRef}
      />

      {!isSearchMode && (
        <View
          className="bg-white pt-1 pb-1"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 3,
            elevation: 1,
          }}
        >
          <CategoryChip selected={selectedCategory} onSelect={setSelectedCategory} />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={flatItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 16 }}
        onScrollBeginDrag={Keyboard.dismiss}
        scrollEventThrottle={16}
        refreshControl={
          showLoading ? undefined : (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          )
        }
      />
      {selectedPlace && <PlaceDetailSheet />}
    </View>
  );
}
