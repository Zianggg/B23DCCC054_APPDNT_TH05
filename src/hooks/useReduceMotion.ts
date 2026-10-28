import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

// Đường cong giảm tốc dùng chung cho mọi chuyển động "đến nơi"
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// Theo cài đặt "Xóa hiệu ứng động" của hệ thống
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);

  return reduce;
}
