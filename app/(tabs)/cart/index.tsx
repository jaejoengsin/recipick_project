import useCartStore from '@/src/stores/cartStore';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';

// 목업 데이터 (10개)

export default function CartScreen() {

    const addItemToCart = useCartStore((state) => state.addItemToCart);
    const removeItemFromCart = useCartStore((state) => state.removeItemFromCart);
    const cartItems = useCartStore((state) => state.cartItems);
    const refreshCartItems = useCartStore((state) => state.refreshCartItems);
    const clearCart = useCartStore((state) => state.clearCart);

    const navigation = useNavigation() as any;


 
   useEffect(() => {
       refreshCartItems();
   }, []);
   

    const handleClearCart = () => {
        console.log('장바구니 초기화');
        clearCart();

    };

    const handleSearchRecipe = () => {
        // 레시피 탐색 화면으로 이동
        // expo-router에서 같은 Stack 내에서는 navigation.navigate 사용
        if (cartItems.length==0){
            Alert.alert("장바구니에 담긴 아이템이 없습니다");
            return;
        } 
        navigation.navigate('recipeSearch');
    };

    function closeItem(rowMap,rowKey) {
        if (rowMap[rowKey]) {
            console.log(rowKey);
            rowMap[rowKey].closeRow();
        }
    }


    function deleteIng(rowMap, rowItemId) {
        closeItem(rowMap, rowItemId);
        try {
            console.log("삭제 요청 ID:", rowItemId);
            // zustand store의 비동기 삭제 함수 실행
            // 이 함수가 실행되면 서버 DB에서 삭제되고, 성공 시 목록이 새로고침 됩니다.
            removeItemFromCart(rowItemId);
        } catch (error) {
            console.error("삭제 중 오류 발생:", error);
            // 필요 시 Alert.alert("오류", "삭제에 실패했습니다.");
        }
    };

    return (
       
            <View style={styles.container}>
                <View style={styles.SwipeListContainer}>
                 <SwipeListView 
                    keyExtractor={(item) => String(item.basketIngredientId)}
                    data={cartItems}
                    renderItem={(data,rowMap) => (                 
                        <View style={styles.itemContainer}>
                            <Text style={styles.itemName}>{data.item.name}</Text>
                            { data.item.inFridge ? (
                                <MaterialCommunityIcons
                                    name="fridge-outline"
                                    size={24}
                                    color="#6b7280"
                                />
                            ) : (
                                <Feather
                                    name="search"
                                    size={24}
                                    color="#6b7280"
                                />
                            )}
                        </View>       
                    )}
                    renderHiddenItem={(data, rowMap) => (
                        <View style = {styles.hiddenItemContainer}>
                            <TouchableOpacity style = {styles.deleteButton}
                                onPress={() => deleteIng(rowMap, data.item.basketIngredientId)}
                            >
                                <Text style={styles.deleteText}>삭제</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    disableRightSwipe={true}
                    rightOpenValue={-75}                  
                    friction={200}
                    tension={200}

                />             
                </View>
                {/* 하단 버튼 영역 */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.clearButton]}
                        onPress={handleClearCart}
                    >
                        <Text style={styles.clearButtonText}>장바구니 초기화</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.button, styles.searchButton]}
                        onPress={handleSearchRecipe}
                    >
                        <Text style={styles.searchButtonText}>레시피 탐색</Text>
                    </TouchableOpacity>
                </View>
            </View>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    SwipeListContainer: {
        paddingHorizontal: 20, // 전체 여백
        marginBottom: 20,
        width: "100%",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 100, // 하단 버튼 공간 확보
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    itemName: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#9ca3af', // 회색
    },
    searchButton: {
        backgroundColor: '#0095F6', // 인스타그램 파란색
    },
    clearButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    hiddenItemContainer: {
        alignItems: "center",
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 0,
        position: 'absolute',
        top: 0,
        width: 75,
        borderRadius: 12,

    },
    deleteText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
