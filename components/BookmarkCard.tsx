import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router"; // 👈 상세 페이지 이동을 위해 추가
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BookmarkCardProps {
  id: number;
  foodName: string;
  imageUrl: string;
  // 식재료 정보가 필요하므로 props에 추가합니다.
  ingredients: string;
  onRemove?: (id: number) => void; // 북마크 화면에서 사용
  onBookmarkToggle?: (id: number) => void; // 레시피 탐색 화면에서 사용
  isBookmarked?: boolean; // 북마크 상태 (기본값: true)
}

export default function BookmarkCard({
  id,
  foodName,
  imageUrl,
  ingredients, // Prop 추가
  onRemove,
  onBookmarkToggle,
  isBookmarked = true, // 기본값은 북마크된 상태
}: BookmarkCardProps) {
  const navigation = useNavigation() as any; // 👈 내비게이션 훅 사용 (타입 에러 방지)

  // 1. 북마크 버튼 클릭 시
  const handleBookmarkToggle = () => {
    // 북마크 화면: 북마크 해제 시 목록에서 제거
    if (isBookmarked && onRemove) {
      onRemove(id);
      console.log(`${foodName} 북마크가 해제되고 목록에서 제거됩니다.`);
    }
    // 레시피 탐색 화면: 북마크 토글 (추가/해제)
    if (onBookmarkToggle) {
      onBookmarkToggle(id);
      console.log(`${foodName} 북마크 ${isBookmarked ? '해제' : '추가'}됩니다.`);
    }
  };

  // 2. 💡 카드 클릭 시: 상세 페이지로 이동합니다.
  const handleCardPress = () => {
    // 'recipeDetail' 라우트로 이동하며, ID와 이름을 파라미터로 전달합니다.
    navigation.navigate("recipeDetail", { recipeId: id });
    console.log(`${foodName} 상세 페이지로 이동 (${id})`);
  };

  return (
    <View style={styles.cardContainer}>
      {/* 💡 북마크 버튼을 제외한 부분만 클릭 가능 */}
      <TouchableOpacity onPress={handleCardPress} activeOpacity={0.9}>
        {/* 1. 상단 이미지 영역 */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>

        {/* 2. 정보 영역 (이미지 아래) */}
        <View style={styles.infoContainer}>
          <Text style={styles.foodName}>{foodName}</Text>
          <Text style={styles.description}>
            {/* 식재료 표시 */}
            주요 재료: {ingredients}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 3. 북마크 버튼 (오른쪽 상단에 절대 위치로 배치) */}
      <TouchableOpacity
        onPress={handleBookmarkToggle}
        style={styles.bookmarkButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={24}
          color={isBookmarked ? "#FFD700" : "#ffffff"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    // 💡 가로 정렬 제거, 기본 수직 정렬 (flexDirection: 'column')
    padding: 0, // 이미지와 정보 영역이 카드를 꽉 채우도록 패딩 제거
    marginVertical: 10,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4, // Android 그림자 강화
    shadowColor: "#000", // iOS 그림자
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden", // 이미지가 모서리를 넘어가지 않도록
  },
  imageContainer: {
    width: "100%",
    height: 150, // 이미지 높이 고정
    position: "relative", // 북마크 버튼 배치를 위한 기준점
  },
  image: {
    width: "100%",
    height: "100%",
    // borderTopLeftRadius: 8, borderTopRightRadius: 8, // 상단 모서리 둥글게
  },
  infoContainer: {
    padding: 12, // 정보 영역 내부 패딩
  },
  foodName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  bookmarkButton: {
    position: "absolute", // 이미지 위에 절대 위치
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // 반투명 배경
    borderRadius: 20,
    zIndex: 10, // 클릭 우선순위 높임
  },
});
