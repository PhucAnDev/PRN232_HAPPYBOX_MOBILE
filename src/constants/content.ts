import { BoxTypeOption, OnboardingSlide, PaymentMethodOption } from "../types/domain";

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "slide-1",
    title: "Quà Tặng Cao Cấp",
    subtitle: "Khám phá bộ sưu tập quà sang trọng",
    description:
      "Từ hộp quà Tết đến combo doanh nghiệp, mở app là thấy ngay những bộ sưu tập được tuyển chọn sẵn.",
    emoji: "🎁",
  },
  {
    id: "slide-2",
    title: "Tự Tay Tạo Hộp Quà",
    subtitle: "Cá nhân hóa theo từng chi tiết",
    description:
      "Chọn hộp, thêm sản phẩm, cân đối ngân sách và xem tổng tiền theo từng bước ngay trên mobile.",
    emoji: "🧺",
  },
  {
    id: "slide-3",
    title: "Mua Sắm An Tâm",
    subtitle: "Theo dõi đơn hàng dễ dàng",
    description:
      "Áp voucher, checkout nhanh, theo dõi đơn hàng và nhận thông báo trong cùng một trải nghiệm thống nhất.",
    emoji: "✨",
  },
];

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    subtitle: "An toàn, phù hợp đơn quà tặng",
    icon: "cash",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    subtitle: "VietQR, Internet Banking",
    icon: "account-balance",
  },
  {
    id: "momo",
    label: "Ví MoMo",
    subtitle: "Thanh toán tức thì",
    icon: "wallet",
  },
  {
    id: "vnpay",
    label: "VNPay",
    subtitle: "Thẻ nội địa và QR",
    icon: "qr-code-2",
  },
];

export const boxTypes: BoxTypeOption[] = [
  {
    id: "box-s",
    name: "Hộp Nhỏ",
    capacity: 3,
    price: 150000,
    emoji: "📦",
    description: "Tối đa 3 sản phẩm",
  },
  {
    id: "box-m",
    name: "Hộp Vừa",
    capacity: 5,
    price: 250000,
    emoji: "🎁",
    description: "Tối đa 5 sản phẩm",
  },
  {
    id: "box-l",
    name: "Hộp Lớn",
    capacity: 8,
    price: 400000,
    emoji: "🧧",
    description: "Tối đa 8 sản phẩm",
  },
  {
    id: "basket",
    name: "Giỏ Premium",
    capacity: 10,
    price: 500000,
    emoji: "🧺",
    description: "Tối đa 10 sản phẩm",
  },
];
