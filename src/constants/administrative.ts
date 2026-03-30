export interface AdministrativeWard {
  id: string;
  name: string;
}

export interface AdministrativeDistrict {
  id: string;
  name: string;
  wards: AdministrativeWard[];
}

export interface AdministrativeProvince {
  id: string;
  name: string;
  districts: AdministrativeDistrict[];
}

export const vietnamAdministrativeUnits: AdministrativeProvince[] = [
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    districts: [
      {
        id: "hcm-q1",
        name: "Quận 1",
        wards: [
          { id: "hcm-q1-ben-nghe", name: "Phường Bến Nghé" },
          { id: "hcm-q1-ben-thanh", name: "Phường Bến Thành" },
          { id: "hcm-q1-da-kao", name: "Phường Đa Kao" },
        ],
      },
      {
        id: "hcm-q7",
        name: "Quận 7",
        wards: [
          { id: "hcm-q7-tan-phu", name: "Phường Tân Phú" },
          { id: "hcm-q7-tan-hung", name: "Phường Tân Hưng" },
          { id: "hcm-q7-tan-phong", name: "Phường Tân Phong" },
        ],
      },
      {
        id: "hcm-thu-duc",
        name: "TP Thủ Đức",
        wards: [
          { id: "hcm-thu-duc-thao-dien", name: "Phường Thảo Điền" },
          { id: "hcm-thu-duc-an-phu", name: "Phường An Phú" },
          { id: "hcm-thu-duc-linh-tay", name: "Phường Linh Tây" },
        ],
      },
    ],
  },
  {
    id: "hn",
    name: "Hà Nội",
    districts: [
      {
        id: "hn-ba-dinh",
        name: "Quận Ba Đình",
        wards: [
          { id: "hn-ba-dinh-lieu-giai", name: "Phường Liễu Giai" },
          { id: "hn-ba-dinh-ngoc-ha", name: "Phường Ngọc Hà" },
          { id: "hn-ba-dinh-doi-can", name: "Phường Đội Cấn" },
        ],
      },
      {
        id: "hn-cau-giay",
        name: "Quận Cầu Giấy",
        wards: [
          { id: "hn-cau-giay-dich-vong", name: "Phường Dịch Vọng" },
          { id: "hn-cau-giay-quan-hoa", name: "Phường Quan Hoa" },
          { id: "hn-cau-giay-nghia-do", name: "Phường Nghĩa Đô" },
        ],
      },
      {
        id: "hn-hoang-mai",
        name: "Quận Hoàng Mai",
        wards: [
          { id: "hn-hoang-mai-dinh-cong", name: "Phường Định Công" },
          { id: "hn-hoang-mai-hoang-liet", name: "Phường Hoàng Liệt" },
          { id: "hn-hoang-mai-mai-dong", name: "Phường Mai Động" },
        ],
      },
    ],
  },
  {
    id: "dn",
    name: "Đà Nẵng",
    districts: [
      {
        id: "dn-hai-chau",
        name: "Quận Hải Châu",
        wards: [
          { id: "dn-hai-chau-thach-thang", name: "Phường Thạch Thang" },
          { id: "dn-hai-chau-hai-chau-1", name: "Phường Hải Châu I" },
          { id: "dn-hai-chau-binh-thuan", name: "Phường Bình Thuận" },
        ],
      },
      {
        id: "dn-son-tra",
        name: "Quận Sơn Trà",
        wards: [
          { id: "dn-son-tra-an-hai-bac", name: "Phường An Hải Bắc" },
          { id: "dn-son-tra-man-thai", name: "Phường Mân Thái" },
          { id: "dn-son-tra-phuoc-my", name: "Phường Phước Mỹ" },
        ],
      },
      {
        id: "dn-ngu-hanh-son",
        name: "Quận Ngũ Hành Sơn",
        wards: [
          { id: "dn-ngu-hanh-son-khue-my", name: "Phường Khuê Mỹ" },
          { id: "dn-ngu-hanh-son-my-an", name: "Phường Mỹ An" },
          { id: "dn-ngu-hanh-son-hoa-hai", name: "Phường Hòa Hải" },
        ],
      },
    ],
  },
];
