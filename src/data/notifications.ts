export type AppNotification = {
  id: string;
  icon: string;
  title: string;
  body: string;
  time: string;
};

export const notifications: AppNotification[] = [
  {
    id: '1',
    icon: 'hand-wave',
    title: 'Chào mừng bạn đến với Trò Chuyện',
    body: 'Mở Danh bạ để bắt đầu cuộc trò chuyện đầu tiên.',
    time: 'Vừa xong',
  },
  {
    id: '2',
    icon: 'shield-check',
    title: 'Bảo mật tài khoản',
    body: 'Tin nhắn chỉ hiển thị với hai người trong cuộc trò chuyện.',
    time: '5 phút trước',
  },
  {
    id: '3',
    icon: 'map-marker-radius',
    title: 'Tính năng mới: gửi vị trí',
    body: 'Nhấn nút 📍 trong khung chat để chia sẻ vị trí hiện tại.',
    time: '1 giờ trước',
  },
  {
    id: '4',
    icon: 'account-multiple-plus',
    title: 'Bạn bè đang hoạt động',
    body: 'Chấm xanh cạnh ảnh đại diện cho biết người đó đang online.',
    time: 'Hôm qua',
  },
  {
    id: '5',
    icon: 'bell-ring',
    title: 'Tin nhắn chưa đọc',
    body: 'Số tin chưa đọc hiển thị ngay trên màn hình Tin nhắn.',
    time: '2 ngày trước',
  },
  {
    id: '6',
    icon: 'update',
    title: 'Cập nhật ứng dụng',
    body: 'Phiên bản 1.0.0 đã sẵn sàng với giao diện mới.',
    time: '1 tuần trước',
  },
];
