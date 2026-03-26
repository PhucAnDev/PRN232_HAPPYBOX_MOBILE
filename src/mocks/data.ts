import {
  Address,
  AppNotification,
  ChatMessage,
  Category,
  GiftBox,
  Order,
  Product,
  UserProfile,
  Voucher,
} from "../types/domain";

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  banner: "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  giftBox: "https://images.unsplash.com/photo-1701685809832-f479a08970ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  giftBoxHero: "https://images.unsplash.com/photo-1701685809832-f479a08970ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  hamper: "https://images.unsplash.com/photo-1699670425934-b30d13e63fea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  ribbon: "https://images.unsplash.com/photo-1751603136938-b80e08ac47d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  hamperRibbon: "https://images.unsplash.com/photo-1751603136938-b80e08ac47d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  chocolate: "https://images.unsplash.com/photo-1765807368478-6ce775044e8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  wine: "https://images.unsplash.com/photo-1768224661768-7ba694d1422b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  tea: "https://images.unsplash.com/photo-1722504342402-bb9016c640e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  nuts: "https://images.unsplash.com/photo-1758982423518-d69cc83013c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  skincare: "https://images.unsplash.com/photo-1765887986673-953fccf56464?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  coffee: "https://images.unsplash.com/photo-1765533221476-21ba62961497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  basket: "https://images.unsplash.com/photo-1635364387109-241cb2352393?auto=format&fit=crop&w=1200&q=80",
};

export const categories: Category[] = [
  { id: "cat-1", name: "Hộp Quà", icon: "🎁", color: "#8B1A2B" },
  { id: "cat-2", name: "Thực Phẩm", icon: "🍫", color: "#C9A84C" },
  { id: "cat-3", name: "Đồ Uống", icon: "🍷", color: "#4A5D52" },
  { id: "cat-4", name: "Trà & Cà Phê", icon: "🍵", color: "#8B6914" },
  { id: "cat-5", name: "Chăm Sóc", icon: "✨", color: "#A0522D" },
  { id: "cat-6", name: "Giỏ Tết", icon: "🧺", color: "#8B1A2B" },
];

export const products: Product[] = [
  {
    id: "p-1",
    name: "Hộp Quà Socola Bỉ Cao Cấp",
    price: 850000,
    originalPrice: 1200000,
    image: IMAGES.chocolate,
    category: "Thực Phẩm",
    categoryId: "cat-2",
    rating: 4.9,
    reviewCount: 128,
    badge: "Bán Chạy",
    description:
      "Bộ sưu tập socola Bỉ thượng hạng, được tuyển chọn từ những hạt cacao tốt nhất. Phù hợp làm quà biếu cao cấp trong dịp Tết Nguyên Đán.",
    details: ["Xuất xứ: Bỉ", "Khối lượng: 500g", "Hạn dùng: 6 tháng", "Bảo quản: Dưới 20°C"],
    isBestSeller: true,
  },
  {
    id: "p-2",
    name: "Rượu Vang Đỏ Pháp Bordeaux",
    price: 1450000,
    originalPrice: 1800000,
    image: IMAGES.wine,
    category: "Đồ Uống",
    categoryId: "cat-3",
    rating: 4.8,
    reviewCount: 95,
    badge: "Giảm 19%",
    description:
      "Rượu vang đỏ Bordeaux danh tiếng, hương vị phong phú với notes trái cây chín và gỗ sồi. Lựa chọn hoàn hảo cho những buổi tiệc sang trọng.",
    details: ["Vùng sản xuất: Bordeaux, Pháp", "Dung tích: 750ml", "Nồng độ: 13.5%", "Năm sản xuất: 2020"],
  },
  {
    id: "p-3",
    name: "Giỏ Quà Tết Premium Collection",
    price: 2200000,
    image: IMAGES.hamper,
    category: "Giỏ Tết",
    categoryId: "cat-6",
    rating: 5,
    reviewCount: 67,
    badge: "Mới",
    description:
      "Giỏ quà Tết cao cấp tổng hợp những sản phẩm được tuyển chọn kỹ càng. Gồm socola, trà thảo mộc, mứt trái cây và hạt dinh dưỡng.",
    details: ["12 sản phẩm", "Hộp/Giỏ sang trọng", "Kèm thiệp chúc Tết", "Giao hàng tận nơi"],
    isNew: true,
  },
  {
    id: "p-4",
    name: "Trà Ô Long Đài Loan Thượng Hạng",
    price: 650000,
    originalPrice: 850000,
    image: IMAGES.tea,
    category: "Trà & Cà Phê",
    categoryId: "cat-4",
    rating: 4.7,
    reviewCount: 203,
    badge: "Yêu Thích",
    description:
      "Trà Ô Long từ vùng núi Alishan, Đài Loan. Hương thơm tự nhiên, vị ngọt hậu thanh thoát, mang đến trải nghiệm thưởng trà đẳng cấp.",
    details: ["Vùng sản xuất: Alishan, Đài Loan", "Khối lượng: 300g", "Loại: Ô Long cao cấp", "Hạn dùng: 24 tháng"],
    isBestSeller: true,
  },
  {
    id: "p-5",
    name: "Hộp Hạt Dinh Dưỡng Organic Mix",
    price: 480000,
    image: IMAGES.nuts,
    category: "Thực Phẩm",
    categoryId: "cat-2",
    rating: 4.6,
    reviewCount: 312,
    description:
      "Hỗn hợp hạt dinh dưỡng hữu cơ cao cấp: hạnh nhân, óc chó, điều, macadamia rang muối biển tinh tế.",
    details: ["Khối lượng: 500g", "Organic certified", "Không chất bảo quản", "Hạn dùng: 12 tháng"],
  },
  {
    id: "p-6",
    name: "Bộ Chăm Sóc Da Luxury Spa",
    price: 1890000,
    originalPrice: 2400000,
    image: IMAGES.skincare,
    category: "Chăm Sóc",
    categoryId: "cat-5",
    rating: 4.8,
    reviewCount: 89,
    badge: "Giảm 21%",
    description:
      "Bộ sản phẩm chăm sóc da cao cấp từ thiên nhiên: serum dưỡng ẩm, kem mắt, mặt nạ vàng và toner hoa hồng Bulgaria.",
    details: ["4 sản phẩm", "Thương hiệu: La Mer", "Vegan & Cruelty-free", "Hạn dùng: 36 tháng"],
  },
  {
    id: "p-7",
    name: "Cà Phê Specialty Single Origin",
    price: 390000,
    image: IMAGES.coffee,
    category: "Trà & Cà Phê",
    categoryId: "cat-4",
    rating: 4.9,
    reviewCount: 156,
    badge: "Mới",
    description:
      "Cà phê specialty từ vùng Cầu Đất, Đà Lạt. Rang light-medium, hương thơm trái cây nhiệt đới và caramel dịu ngọt.",
    details: ["Xuất xứ: Cầu Đất, Đà Lạt", "Khối lượng: 250g", "Rang: Light-Medium", "Hạn dùng: 12 tháng"],
    isNew: true,
  },
  {
    id: "p-8",
    name: "Giỏ Quà Kết Hợp Sang Trọng",
    price: 1650000,
    originalPrice: 2100000,
    image: IMAGES.basket,
    category: "Giỏ Tết",
    categoryId: "cat-6",
    rating: 4.7,
    reviewCount: 44,
    description:
      "Giỏ tre tự nhiên được bện thủ công, chứa đựng những sản phẩm thượng hạng: rượu, socola, mứt và hạt dinh dưỡng.",
    details: ["8 sản phẩm", "Giỏ tre tự nhiên", "Ribbon vàng cao cấp", "Kèm thiệp chúc mừng"],
  },
];

export const giftBoxes: GiftBox[] = [
  {
    id: "gb-1",
    name: "Hộp Quà Tết Vàng",
    price: 1800000,
    originalPrice: 2200000,
    image: IMAGES.giftBox,
    description:
      "Hộp quà Tết cao cấp với tone màu đỏ vàng sang trọng, gồm những sản phẩm tuyển chọn đặc biệt cho mùa Tết.",
    items: ["Rượu Vang Đỏ 750ml", "Socola Bỉ 300g", "Trà Ô Long 150g", "Hạt Điều Rang 200g", "Mứt Trái Cây 250g"],
    tag: "Bestseller",
  },
  {
    id: "gb-2",
    name: "Giỏ Quà Cao Cấp Đỏ",
    price: 2500000,
    image: IMAGES.ribbon,
    description:
      "Giỏ quà cao cấp với ribbon đỏ nổi bật, phù hợp biếu tặng sếp, đối tác và những người thân yêu nhất.",
    items: ["Rượu Whisky 700ml", "Socola Đen 500g", "Cà Phê Specialty 250g", "Hạt Mix Organic 400g", "Nước Hoa Mini Set"],
    tag: "Premium",
  },
  {
    id: "gb-3",
    name: "Hộp Quà Sức Khỏe Wellness",
    price: 1200000,
    originalPrice: 1500000,
    image: IMAGES.hamper,
    description:
      "Hộp quà tập trung vào sức khỏe và wellness, dành cho những ai quan tâm đến lối sống lành mạnh.",
    items: ["Trà Thảo Mộc", "Hạt Organic", "Mật Ong Rừng", "Tinh Dầu Thiên Nhiên", "Kẹo Gừng"],
    tag: "Wellness",
  },
];

export const vouchers: Voucher[] = [
  {
    id: "v-1",
    code: "TET15",
    title: "Ưu Đãi Tết Premium",
    description: "Giảm 15% cho đơn từ 500.000đ, tối đa 300.000đ.",
    discountType: "percent",
    discountValue: 15,
    minOrder: 500000,
    maxDiscount: 300000,
    expiry: "2026-04-30",
    isValid: true,
  },
  {
    id: "v-2",
    code: "GIFT100K",
    title: "Tiết Kiệm 100.000đ",
    description: "Áp dụng cho đơn từ 1.000.000đ.",
    discountType: "fixed",
    discountValue: 100000,
    minOrder: 1000000,
    expiry: "2026-06-30",
    isValid: true,
  },
  {
    id: "v-3",
    code: "NEWUSER",
    title: "Chào Mừng Thành Viên Mới",
    description: "Giảm 20% cho lần mua đầu, tối đa 200.000đ.",
    discountType: "percent",
    discountValue: 20,
    minOrder: 300000,
    maxDiscount: 200000,
    expiry: "2026-12-31",
    isValid: true,
  },
  {
    id: "v-4",
    code: "EXPIRED",
    title: "Mã Hè Hết Hạn",
    description: "Không còn hiệu lực.",
    discountType: "percent",
    discountValue: 20,
    minOrder: 500000,
    expiry: "2025-08-31",
    isValid: false,
  },
];

export const mockUser: UserProfile = {
  id: "user-1",
  fullName: "Nguyễn Thị Lan",
  email: "lan.nguyen@gmail.com",
  phone: "0901234567",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  joinDate: "Tháng 1, 2024",
};

export const mockAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Nhà riêng",
    fullName: "Nguyễn Thị Lan",
    phone: "0901234567",
    address: "123 Đường Lê Lợi, Phường Bến Nghé",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Văn phòng",
    fullName: "Nguyễn Thị Lan",
    phone: "0901234567",
    address: "456 Nguyễn Huệ, Phường Bến Nghé",
    ward: "Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: false,
  },
];

export const initialOrders: Order[] = [
  {
    id: "ORD-2026-001",
    status: "delivered",
    items: [
      {
        productId: "p-1",
        name: "Hộp Quà Socola Bỉ Cao Cấp",
        image: IMAGES.chocolate,
        price: 850000,
        quantity: 1,
      },
      {
        productId: "p-4",
        name: "Trà Ô Long Đài Loan",
        image: IMAGES.tea,
        price: 650000,
        quantity: 2,
      },
    ],
    subtotal: 2150000,
    discount: 215000,
    shipping: 0,
    total: 1935000,
    address: mockAddresses[0],
    paymentMethod: "bank",
    note: "Gói quà tặng kèm thiệp chúc mừng nhé!",
    createdAt: "2026-03-01T10:30:00.000Z",
    timeline: [
      { status: "Đặt hàng thành công", time: "01/03 10:30", done: true },
      { status: "Đã xác nhận", time: "01/03 11:00", done: true },
      { status: "Đang vận chuyển", time: "02/03 08:00", done: true },
      { status: "Giao hàng thành công", time: "03/03 14:30", done: true },
    ],
  },
  {
    id: "ORD-2026-002",
    status: "shipping",
    items: [
      {
        productId: "gb-1",
        name: "Hộp Quà Tết Vàng",
        image: IMAGES.giftBox,
        price: 1800000,
        quantity: 1,
      },
    ],
    subtotal: 1800000,
    discount: 100000,
    shipping: 30000,
    total: 1730000,
    address: mockAddresses[1],
    paymentMethod: "cod",
    createdAt: "2026-03-24T14:00:00.000Z",
    timeline: [
      { status: "Đặt hàng thành công", time: "24/03 14:00", done: true },
      { status: "Đã xác nhận", time: "24/03 15:30", done: true },
      { status: "Đang vận chuyển", time: "25/03 09:00", done: true },
      { status: "Giao hàng thành công", time: "--", done: false },
    ],
  },
];

export const notifications: AppNotification[] = [
  {
    id: "noti-1",
    title: "Voucher mới đã đến",
    body: "Bạn có thêm voucher NEWUSER để dùng trong đơn hàng tiếp theo.",
    kind: "voucher",
    createdAt: "2026-03-24T08:30:00.000Z",
    isRead: false,
  },
  {
    id: "noti-2",
    title: "Đơn hàng đang giao",
    body: "ORD-2026-002 đang trên đường giao đến văn phòng của bạn.",
    kind: "order",
    createdAt: "2026-03-25T09:00:00.000Z",
    isRead: false,
  },
  {
    id: "noti-3",
    title: "Bộ sưu tập Tết mới",
    body: "Bộ sưu tập Tet luxury 2026 đã mở bán với số lượng giới hạn.",
    kind: "promo",
    createdAt: "2026-03-21T12:00:00.000Z",
    isRead: true,
  },
];

export const botResponses: Record<string, string> = {
  default:
    "Xin chào! Tôi là trợ lý ảo của GiftBox. Tôi có thể giúp bạn tư vấn sản phẩm, hộp quà hoặc theo dõi đơn hàng.",
  gift:
    "Chúng tôi có nhiều lựa chọn hộp quà cao cấp phù hợp cho mọi dịp: Tết, sinh nhật, kỷ niệm và tri ân.",
  order:
    "Bạn có thể theo dõi đơn hàng trong mục 'Đơn Hàng' ở thanh điều hướng phía dưới.",
  shipping:
    "Chúng tôi giao hàng toàn quốc. Thông thường 2-3 ngày với TP.HCM và Hà Nội, 3-5 ngày với các tỉnh khác.",
  voucher:
    "Bạn có thể xem các voucher ưu đãi trong mục 'Voucher của tôi'. Hiện tại có nhiều mã giảm giá hấp dẫn cho mùa Tết!",
};

export const initialChat: ChatMessage[] = [
  {
    id: "chat-1",
    role: "bot",
    text: botResponses.default,
    time: "09:00",
  },
];
