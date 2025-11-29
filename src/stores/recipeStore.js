import { create } from 'zustand';
import {
    addRecipeToHistory,
    deleteRecipeFromHistory,
    getRecipeDetail,
    getRecipeHistory,
    getRecipes
} from '../api/recipe'; // API 파일 경로 확인 필요

const useRecipeStore = create((set, get) => ({
    // =================================================
    // [State] 저장소 상태 데이터
    // =================================================

    // 1. 검색 결과 목록 (순서 및 ID 정보 저장)
    // - content 내부: { recipeId, recipeName, ingredientsNames }
    resultContent: [],

    // 2. 히스토리 목록
    historyContent: [],

    // 3. 레시피 상세 정보 (프론트 노출용 메인 데이터)
    // - 구조: { [recipeId]: { title, ingredients, steps, imageUrl }, ... }
    recipeDetails: {},
S
    // 검색 조건 저장 (더보기/새로고침 시 사용)

    isLoading: false,
    error: null,

    // 공통 페이지네이션 정보 (검색용)
    pageable: {
        page: 0,
        size: 10, // 요구사항: page size 10
        sort: [],
    },

    // 히스토리용 페이지네이션 정보 (독립적 관리 권장)
    historyPageable: {
        page: 0,
        size: 10,
        sort: [],
    },

    paginationInfo: {
        totalElements: 0,
        totalPages: 0,
        last: true,
        empty: true,
    },

    // =================================================
    // [Actions] 1. 레시피 검색 및 상세정보 일괄 로드
    // =================================================

    /**
     * 레시피 목록 조회 + 상세 정보 연쇄 호출
    
     */
    fetchRecipes: async () => {
        const state = get();

        // 검색어가 새로 들어오면 state 업데이트, 아니면 기존 것 사용
       
        
     
        const { pageable, resultContent, recipeDetails } = state;

        set({ isLoading: true, error: null });

        try {
            // 1. 목록 조회 API 호출
            const listResponse = await getRecipes(pageable);
            const newRecipes = listResponse.content;

            // 2. [핵심 요구사항] 받아온 목록의 모든 ID에 대해 상세 정보 API 병렬 호출
            // - Promise.all을 사용하여 동시에 요청을 보냄 (속도 최적화)
            const detailPromises = newRecipes.map(recipe =>
                
                getRecipeDetail(recipe.recipeId)
                    .then(detailData => ({
                        id: recipe.recipeId,
                        data: detailData
                    }))
                    .catch(err => {
                        console.error(`레시피 상세 조회 실패 (ID: ${recipe.recipeId})`, err);
                        return null;
                    })
            );

            const detailsResults = await Promise.all(detailPromises);

            // 3. 받아온 상세 정보를 recipeDetails 객체에 병합
            const newDetailsMap = { ...recipeDetails };
            detailsResults.forEach(result => {
                if (result) {
                    newDetailsMap[result.id] = result.data;
                }
            });

            // 4. 상태 업데이트
            // - 페이지가 0이면 덮어쓰기, 아니면 이어붙이기
            const updatedResultContent = pageable.page === 0
                ? newRecipes
                : [...resultContent, ...newRecipes];

            set({
                resultContent: updatedResultContent,
                recipeDetails: newDetailsMap, // 상세 정보 저장소 업데이트
                paginationInfo: {
                    totalElements: listResponse.totalElements,
                    totalPages: listResponse.totalPages,
                    last: listResponse.last,
                    empty: listResponse.empty,
                },
                isLoading: false
            });

        } catch (error) {
            console.error("Recipe Fetch Error:", error);
            set({ error, isLoading: false });
        }
    },

    /**
     * 레시피 검색 새로고침 (페이지 0부터 다시)
     */
    refreshRecipes: async () => {
        set((state) => ({
            pageable: { ...state.pageable, page: 0 }
        }));
        await get().fetchRecipes();
    },

    /**
     * 레시피 검색 더보기 (다음 페이지)
     */
    loadMoreRecipes: async () => {
        const { pageable, paginationInfo, isLoading } = get();
        if (isLoading || paginationInfo.last) return;

        set((state) => ({
            pageable: { ...state.pageable, page: pageable.page + 1 }
        }));
        await get().fetchRecipes();
    },

    // =================================================
    // [Actions] 2. 히스토리 관리
    // =================================================

    /**
     * 히스토리 목록 조회
     */
    fetchHistory: async () => {
        const { historyPageable, historyContent } = get();
        set({ isLoading: true, error: null });

        try {
            const response = await getRecipeHistory(historyPageable);

            const newHistory = historyPageable.page === 0
                ? response.content
                : [...historyContent, ...response.content];

            set({
                historyContent: newHistory,
                // 히스토리용 페이지네이션 정보가 별도로 필요하다면 상태 추가 필요
                isLoading: false
            });
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    /**
     * 히스토리 새로고침
     */
    refreshHistory: async () => {
        set((state) => ({
            historyPageable: { ...state.historyPageable, page: 0 }
        }));
        await get().fetchHistory();
    },

    /**
     * 히스토리 추가
     */
    addToHistory: async (recipeId) => {
        try {
            await addRecipeToHistory(recipeId);
            // 추가 후 히스토리 목록 갱신
            await get().refreshHistory();
        } catch (error) {
            console.error("Add History Error:", error);
        }
    },

    /**
     * 히스토리 삭제
     */
    deleteFromHistory: async (historyRecipeId) => {
        // 낙관적 업데이트: 화면에서 먼저 제거
        set((state) => ({
            historyContent: state.historyContent.filter(
                item => item.historyRecipeId !== historyRecipeId // ID 필드명 확인 필요 (응답 구조에 따라 다를 수 있음)
            )
        }));

        try {
            const { historyPageable } = get();
            await deleteRecipeFromHistory(historyRecipeId, historyPageable);
            // 정합성을 위해 새로고침
            await get().refreshHistory();
        } catch (error) {
            console.error("Delete History Error:", error);
            await get().refreshHistory(); // 실패 시 복구
        }
    },

    // =================================================
    // [Actions] 3. 개별 상세 조회 (필요 시 사용)
    // =================================================

    /**
     * 특정 레시피 상세 정보만 단건 조회 (예: 히스토리 아이템 클릭 시)
     */
    fetchSingleRecipeDetail: async (recipeId) => {
        set({ isLoading: true });
        try {
            const detailData = await getRecipeDetail(recipeId);

            // 기존 recipeDetails에 병합
            set((state) => ({
                recipeDetails: {
                    ...state.recipeDetails,
                    [recipeId]: detailData
                },
                isLoading: false
            }));
        } catch (error) {
            set({ error, isLoading: false });
        }
    },

    // 페이지네이션 설정 변경
    setPageable: (newPageable) => {
        set((state) => ({
            pageable: { ...state.pageable, ...newPageable }
        }));
    },
}));

export default useRecipeStore;