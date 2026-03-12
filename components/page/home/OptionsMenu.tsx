import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface OptionsMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  direction: 'down' | 'up';
  onClose: () => void;
}

export default function OptionsMenu({ visible, position, direction, onClose }: OptionsMenuProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1"
        onPress={onClose}
      >
        <View 
          className="absolute bg-white rounded-xl shadow-sm py-2 w-40"
          style={{ 
            left: position.x, 
            top: direction === 'down' ? position.y : position.y 
          }}
        >
          <TouchableOpacity 
            className="px-4 py-3"
            onPress={onClose}
          >
            <Text className="text-base text-gray-800">对此推荐不感兴趣</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="px-4 py-3"
            onPress={onClose}
          >
            <Text className="text-base text-gray-800">推荐内容</Text>
          </TouchableOpacity>
          <View className="border-t border-gray-100" />
          <TouchableOpacity 
            className="px-4 py-3"
            onPress={onClose}
          >
            <Text className="text-base text-red-500">举报内容</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
