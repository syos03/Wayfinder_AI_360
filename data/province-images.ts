export interface ProvinceImage {
  src: string
  alt: string
  caption?: string
}

const provinceImagesMap: Record<string, ProvinceImage[]> = {
  "ha-noi": [
    { src: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", alt: "Hồ Hoàn Kiếm", caption: "Hồ Hoàn Kiếm về đêm" },
    { src: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=800", alt: "Phố cổ Hà Nội", caption: "Phố cổ Hà Nội" },
    { src: "https://images.unsplash.com/photo-1509030450996-dd1a26613e2c?w=800", alt: "Văn Miếu", caption: "Văn Miếu - Quốc Tử Giám" },
  ],
  "ho-chi-minh": [
    { src: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", alt: "Nhà thờ Đức Bà", caption: "Nhà thờ Đức Bà Sài Gòn" },
    { src: "https://images.unsplash.com/photo-1555921015-5532091f6026?w=800", alt: "Chợ Bến Thành", caption: "Chợ Bến Thành" },
  ],
  "da-nang": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Cầu Rồng", caption: "Cầu Rồng phun lửa" },
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Cầu Vàng", caption: "Cầu Vàng Bà Nà Hills" },
  ],
  "hoi-an": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Phố cổ Hội An", caption: "Phố cổ Hội An về đêm" },
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Đèn lồng", caption: "Đèn lồng Hội An" },
  ],
  "ha-long": [
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Vịnh Hạ Long", caption: "Vịnh Hạ Long" },
  ],
  "sa-pa": [
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Ruộng bậc thang", caption: "Ruộng bậc thang Sa Pa" },
  ],
  "nha-trang": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Vịnh Nha Trang", caption: "Vịnh Nha Trang" },
  ],
  "hue": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Đại Nội Huế", caption: "Đại Nội Huế" },
  ],
  "phu-quoc": [
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Bãi Sao", caption: "Bãi Sao Phú Quốc" },
  ],
  "da-lat": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Hồ Xuân Hương", caption: "Hồ Xuân Hương Đà Lạt" },
  ],
  "ninh-binh": [
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Tràng An", caption: "Tràng An Ninh Bình" },
  ],
  "quang-binh": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Động Phong Nha", caption: "Động Phong Nha" },
  ],
  "can-tho": [
    { src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", alt: "Chợ nổi Cái Răng", caption: "Chợ nổi Cái Răng" },
  ],
  "quy-nhon": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Eo Gió", caption: "Eo Gió Quy Nhơn" },
  ],
  "mui-ne": [
    { src: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", alt: "Đồi cát", caption: "Đồi cát Mũi Né" },
  ],
}

export function getProvinceImages(provinceId: string): ProvinceImage[] {
  return provinceImagesMap[provinceId] || []
}
