import BookmarkCard from "@/components/BookmarkCard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import useRecipeStore from '@/src/stores/recipeStore';


// 목업 레시피 데이터 (장바구니 재료로 만들 수 있는 레시피)
const MOCK_RECIPES = [
  {
    id: 1,
    name: "사과 당근 샐러드",
    img: "https://picsum.photos/300/200?random=1",
    ingredients: ["사과", "당근", "양파"],
  },
  {
    id: 2,
    name: "닭가슴살 볶음",
    img: "https://picsum.photos/300/200?random=2",
    ingredients: ["닭가슴살", "양파", "마늘"],
  },
  {
    id: 3,
    name: "계란 치즈 오믈렛",
    img: "https://picsum.photos/300/200?random=3",
    ingredients: ["계란", "치즈", "버터"],
  },
  {
    id: 4,
    name: "양배추 마늘 볶음",
    img: "https://picsum.photos/300/200?random=4",
    ingredients: ["양배추", "마늘", "양파"],
  },
  {
    id: 5,
    name: "두부 버터 볶음",
    img: "https://picsum.photos/300/200?random=5",
    ingredients: ["두부", "버터", "양파"],
  },
];

export default function RecipeSearchScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState(MOCK_RECIPES);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

  const refreshRecipes = useRecipeStore(state => state.refreshRecipes);
  const resultContent = useRecipeStore(state => state.resultContent);
  const recipeDetails = useRecipeStore(state => state.recipeDetails);

  useEffect(() => {
    refreshRecipes();
  }, []);
  console.log(resultContent);
  console.log(recipeDetails);
  const handleBack = () => {
    router.back();
  };

  // 북마크 추가 로직
  const handleBookmarkToggle = (id: number) => {
    setBookmarkedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        console.log(`레시피 ${id} 북마크 해제`);
      } else {
        newSet.add(id);
        console.log(`레시피 ${id} 북마크 추가`);
      }
      return newSet;
    });
  };

  const renderItem = ({ item }) => {
    const detail = recipeDetails[item.recipeId];

    return (

      <BookmarkCard
        id={item.recipeId}
        foodName={detail.title}
        imageUrl={detail.imageUrl}
        ingredients={null}
        isBookmarked={bookmarkedIds.has(item.recipeId)}
        onBookmarkToggle={handleBookmarkToggle}
      />

    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 뒤로 가기 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* 레시피 목록 */}
      <FlatList
        data={resultContent}
        renderItem={renderItem}
        keyExtractor={(item) => String(resultContent.recipeId)}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>만들 수 있는 레시피가 없습니다.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  listContent: {
    paddingTop: 60, // 헤더 공간 확보
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});

