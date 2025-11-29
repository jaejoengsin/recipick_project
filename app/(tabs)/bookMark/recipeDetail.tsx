import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useLayoutEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
// 수정: Default export로 변경하여 가져오기 방식을 통일
import useRecipeStore from '@/src/stores/recipeStore';

export default function RecipeDetailScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  // recipeId가 없을 경우를 대비해 기본값(예제 데이터 ID) 설정
  const id = recipeId;
  const recipeDetails = useRecipeStore(state => state.recipeDetails);
  const recipeDetail = recipeDetails[id];
  const navigation = useNavigation();



  useLayoutEffect(() => {
    if (recipeDetail) {
      navigation.setOptions({
        headerTitle: recipeDetail.title || recipeDetail.recipeName || "레시피 상세",
      });
    }
  }, [recipeDetail?.title, recipeDetail?.recipeName, navigation]);

  if (!recipeDetail) {
    return (
      <View style={styles.centerContainer}>
        <Text>레시피 정보를 찾을 수 없습니다. (ID: {id})</Text>
      </View>
    );
  }

  // 1. 이미지 처리
  const imageUrl = recipeDetail.imageUrl || "https://via.placeholder.com/300x200.png?text=No+Image";

  // 2. 재료(Ingredients) 파싱 처리
  let ingredients: string[] = [];
  if (typeof recipeDetail.ingredients === 'string') {
    ingredients = recipeDetail.ingredients.split(',').map((item: string) => item.trim());
  } else if (Array.isArray(recipeDetail.ingredientsNames)) {
    ingredients = recipeDetail.ingredientsNames;
  }

  // 3. 조리 순서(Steps) 텍스트 정리
  const rawSteps = recipeDetail.steps || [];
  const steps = rawSteps.map((step: string) => {
    return step.replace(/^\d+\.\s*/, '');
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. 이미지 영역 */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
      </View>

      {/* 2. 재료 제목 */}
      <Text style={styles.sectionTitle}>재료</Text>

      {/* 3. 재료 나열 영역 */}
      <View style={styles.ingredientsContainer}>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientChip}>
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />

      {/* 조리 순서 제목 */}
      <Text style={styles.sectionTitle}>조리 순서</Text>

      {/* 4. 조리 순서(Steps) 리스트 */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItemWrapper}>
            <View style={styles.stepContent}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>

            {/* 구분선 */}
            {index < steps.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  recipeImage: {
    width: '85%',
    height: 220,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginTop: 30,
    marginBottom: 20,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  ingredientChip: {
    backgroundColor: '#FFECB3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  ingredientText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4037',
  },
  spacer: {
    height: 20,
  },
  stepsContainer: {
    paddingHorizontal: 20,
  },
  stepItemWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  stepContent: {
    width: '100%',
    paddingVertical: 25,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  stepIndex: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginRight: 10,
    marginTop: 2,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    textAlign: 'left',
    flex: 1,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});