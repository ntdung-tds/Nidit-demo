import type { AlbumItemJson } from "@workspace/db";
import type { UserKey } from "./core";
import { img } from "./helpers";

type AlbumSeed = {
  slug: string;
  title: string;
  type: "photo" | "video";
  description: string;
  coverImage: string;
  daysAgo: number;
  items: AlbumItemJson[];
};

const photo = (name: string, caption: string): AlbumItemJson => ({ type: "photo", url: img(name), thumbnailUrl: null, caption });

export const ALBUMS: AlbumSeed[] = [
  {
    slug: "hoi-thao-du-lieu-mo-phuc-vu-ai",
    title: "Hội thảo khoa học “Dữ liệu mở phục vụ phát triển AI”",
    type: "photo",
    description: "Một số hình ảnh tại Hội thảo khoa học “Dữ liệu mở phục vụ phát triển AI” do Viện tổ chức. Ảnh minh họa.",
    coverImage: img("news-hoi-thao"),
    daysAgo: 19,
    items: [
      photo("news-hoi-thao", "Quang cảnh phiên toàn thể"),
      photo("news-phong-lab-ai", "Đại biểu tham quan khu trình diễn công nghệ"),
      photo("du-lieu-gan-nhan", "Giới thiệu quy trình gán nhãn dữ liệu"),
      photo("field-du-lieu", "Trình bày tham luận về chuẩn siêu dữ liệu"),
      photo("nghien-cuu-tieng-viet", "Trao đổi bên lề hội thảo"),
    ],
  },
  {
    slug: "le-ky-ket-hop-tac-cac-truong-dai-hoc",
    title: "Lễ ký kết thỏa thuận hợp tác với các trường đại học kỹ thuật",
    type: "photo",
    description: "Lễ ký kết thỏa thuận hợp tác nghiên cứu, đào tạo về công nghệ số giai đoạn 2026–2030. Ảnh minh họa.",
    coverImage: img("news-ky-ket"),
    daysAgo: 3,
    items: [
      photo("news-ky-ket", "Đại diện các bên ký kết thỏa thuận"),
      photo("news-hop-tac-quoc-te", "Các đại biểu trao đổi về nội dung hợp tác"),
      photo("gioi-thieu-tru-so", "Trụ sở Viện"),
    ],
  },
  {
    slug: "tap-huan-ky-nang-so-2026",
    title: "Tập huấn kỹ năng số và an toàn thông tin năm 2026",
    type: "photo",
    description: "Khóa tập huấn kỹ năng số, an toàn thông tin cho cán bộ, công chức. Ảnh minh họa.",
    coverImage: img("news-tap-huan"),
    daysAgo: 9,
    items: [
      photo("news-tap-huan", "Học viên thực hành trên môi trường mô phỏng"),
      photo("news-an-toan-thong-tin", "Chuyên đề nhận diện lừa đảo trực tuyến"),
      photo("field-chuyen-doi-so", "Chuyên đề khai thác nền tảng số dùng chung"),
      photo("news-dich-vu-cong", "Thực hành dịch vụ công trực tuyến"),
    ],
  },
  {
    slug: "ha-tang-nghien-cuu-cua-vien",
    title: "Hạ tầng nghiên cứu, thử nghiệm của Viện",
    type: "photo",
    description: "Phòng thí nghiệm Trí tuệ nhân tạo, hạ tầng dữ liệu và khu thử nghiệm IoT của Viện. Ảnh minh họa.",
    coverImage: img("news-phong-lab-ai"),
    daysAgo: 40,
    items: [
      photo("news-phong-lab-ai", "Phòng thí nghiệm Trí tuệ nhân tạo"),
      photo("news-trung-tam-du-lieu", "Hạ tầng lưu trữ, tính toán"),
      photo("ha-tang-iot", "Khu thử nghiệm thiết bị IoT"),
      photo("field-danh-gia-kiem-dinh", "Phòng thử nghiệm, kiểm định"),
      photo("y-te-so", "Thử nghiệm ứng dụng AI trong y tế"),
      photo("news-thanh-pho-thong-minh", "Mô hình giám sát hạ tầng đô thị"),
    ],
  },
  {
    slug: "video-hoat-dong-tieu-bieu",
    title: "Video: Hoạt động tiêu biểu của Viện",
    type: "video",
    description: "Video giới thiệu hoạt động hội thảo và Phòng thí nghiệm Trí tuệ nhân tạo. Video minh họa dựng từ ảnh mẫu.",
    coverImage: img("news-phong-lab-ai"),
    daysAgo: 5,
    items: [
      { type: "video", url: "/videos/toan-canh-hoi-thao.mp4", thumbnailUrl: img("news-hoi-thao"), caption: "Toàn cảnh Hội thảo “Dữ liệu mở phục vụ phát triển AI”" },
      { type: "video", url: "/videos/phong-thi-nghiem-ai.mp4", thumbnailUrl: img("news-phong-lab-ai"), caption: "Giới thiệu Phòng thí nghiệm Trí tuệ nhân tạo" },
    ],
  },
];

/** Tiêu đề hiển thị trong thư viện tư liệu của trang quản trị */
export const IMAGE_TITLES: Record<string, string> = {
  "du-lieu-gan-nhan": "Gán nhãn dữ liệu",
  "field-chuyen-doi-so": "Lĩnh vực chuyển đổi số",
  "field-cong-nghe-so": "Lĩnh vực công nghệ số",
  "field-danh-gia-kiem-dinh": "Lĩnh vực đánh giá – kiểm định",
  "field-du-lieu": "Lĩnh vực dữ liệu",
  "field-tri-tue-nhan-tao": "Lĩnh vực trí tuệ nhân tạo",
  "gioi-thieu-tru-so": "Trụ sở Viện",
  "ha-tang-iot": "Hạ tầng IoT",
  "news-an-toan-thong-tin": "An toàn thông tin",
  "news-dich-vu-cong": "Dịch vụ công trực tuyến",
  "news-doan-cong-tac": "Đoàn công tác",
  "news-hoi-thao": "Hội thảo khoa học",
  "news-hop-tac-quoc-te": "Hợp tác quốc tế",
  "news-ky-ket": "Lễ ký kết hợp tác",
  "news-phong-lab-ai": "Phòng thí nghiệm AI",
  "news-tap-huan": "Lớp tập huấn",
  "news-thanh-pho-thong-minh": "Đô thị thông minh",
  "news-trung-tam-du-lieu": "Trung tâm dữ liệu",
  "nghien-cuu-tieng-viet": "Nghiên cứu ngôn ngữ tiếng Việt",
  "y-te-so": "Y tế số",
};

export const CRAWL_SOURCES = [
  {
    name: "Báo Nhân Dân – Khoa học Công nghệ",
    url: "https://nhandan.vn/rss/khoahoc-congnghe.rss",
    category: "tin-chuyen-nganh",
    intervalMinutes: 120,
    keywords: ["chuyển đổi số", "trí tuệ nhân tạo", "dữ liệu", "công nghệ số"],
    startInMinutes: 1,
  },
  {
    name: "VnExpress – Khoa học Công nghệ",
    url: "https://vnexpress.net/rss/khoa-hoc-cong-nghe.rss",
    category: "tri-tue-nhan-tao",
    intervalMinutes: 60,
    keywords: ["AI", "trí tuệ nhân tạo", "dữ liệu"],
    startInMinutes: 2,
  },
  {
    name: "Tuổi Trẻ – Nhịp sống số",
    url: "https://tuoitre.vn/rss/nhip-song-so.rss",
    category: "chuyen-doi-so",
    intervalMinutes: 180,
    keywords: ["chuyển đổi số", "an ninh mạng", "dịch vụ công"],
    startInMinutes: 3,
  },
  {
    name: "Thanh Niên – Công nghệ",
    url: "https://thanhnien.vn/rss/cong-nghe.rss",
    category: "tin-chuyen-nganh",
    intervalMinutes: 240,
    keywords: [],
    startInMinutes: 4,
  },
];

type InquirySeed = {
  code: string;
  type: "contact" | "dataset_access" | "evaluation_request";
  fullName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  subject: string;
  message: string;
  dataset?: string;
  service?: string;
  status: "new" | "processing" | "resolved" | "rejected";
  adminNote?: string;
  handledBy?: UserKey;
  daysAgo: number;
  hour: number;
};

export const INQUIRIES: InquirySeed[] = [
  {
    code: "LH",
    type: "contact",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@example.com",
    phone: "0912 000 111",
    organization: "Công ty Cổ phần Giải pháp số An Phát (mẫu)",
    subject: "Đề nghị trao đổi hợp tác triển khai trợ lý ảo dịch vụ công",
    message: "Công ty chúng tôi mong muốn được trao đổi với Viện về khả năng hợp tác đánh giá và triển khai trợ lý ảo hỗ trợ người dân tra cứu thủ tục hành chính. Kính mong Viện bố trí buổi làm việc trong tháng 10.",
    status: "new",
    daysAgo: 0,
    hour: 9,
  },
  {
    code: "DL",
    type: "dataset_access",
    fullName: "Trần Thị Bích Ngọc",
    email: "ngoc.ttb@example.edu.vn",
    phone: null,
    organization: "Nhóm nghiên cứu Xử lý ngôn ngữ tự nhiên, Trường Đại học (mẫu)",
    subject: "Đăng ký khai thác: Kho ngữ liệu văn bản hành chính tiếng Việt",
    message: "Nhóm nghiên cứu đề nghị được khai thác kho ngữ liệu phục vụ đề tài luận án về tóm tắt văn bản hành chính. Chúng tôi cam kết sử dụng đúng mục đích nghiên cứu và trích dẫn nguồn khi công bố.",
    dataset: "kho-ngu-lieu-van-ban-hanh-chinh",
    status: "processing",
    adminNote: "Đã gửi mẫu phiếu cam kết, chờ nhóm nghiên cứu ký và gửi lại.",
    handledBy: "minh",
    daysAgo: 2,
    hour: 14,
  },
  {
    code: "DL",
    type: "dataset_access",
    fullName: "Lê Minh Khang",
    email: "khang.le@example.org",
    phone: "0988 000 222",
    organization: "Bệnh viện (mẫu) – Khoa Chẩn đoán hình ảnh",
    subject: "Đăng ký khai thác: Bộ dữ liệu ảnh X-quang ngực ẩn danh",
    message: "Khoa đề nghị được tiếp cận bộ dữ liệu để đánh giá lại mô hình sàng lọc trên dữ liệu của địa phương. Đề cương nghiên cứu đã được Hội đồng đạo đức của đơn vị thông qua.",
    dataset: "anh-y-te-an-danh",
    status: "new",
    daysAgo: 1,
    hour: 10,
  },
  {
    code: "DG",
    type: "evaluation_request",
    fullName: "Phạm Quốc Bảo",
    email: "bao.pq@example.gov.vn",
    phone: "0903 000 333",
    organization: "Ban Quản lý dự án Công nghệ thông tin (mẫu)",
    subject: "Đề nghị kiểm thử cổng dịch vụ công trước nghiệm thu",
    message: "Ban Quản lý dự án đề nghị Viện thực hiện kiểm thử chức năng, hiệu năng và khả năng tiếp cận đối với cổng dịch vụ công trước khi tổ chức nghiệm thu, dự kiến trong tháng 11.",
    service: "thu-nghiem-chat-luong-phan-mem",
    status: "processing",
    adminNote: "Đã khảo sát sơ bộ; đang lập kế hoạch kiểm thử và dự toán.",
    handledBy: "nam",
    daysAgo: 5,
    hour: 15,
  },
  {
    code: "DG",
    type: "evaluation_request",
    fullName: "Hoàng Thu Trang",
    email: "trang.ht@example.com",
    phone: null,
    organization: "Công ty TNHH Công nghệ Trí Việt (mẫu)",
    subject: "Đánh giá mô hình chatbot chăm sóc khách hàng",
    message: "Công ty đề nghị đánh giá độ chính xác, thiên lệch và khả năng rò rỉ dữ liệu của mô hình chatbot trước khi cung cấp cho khách hàng là cơ quan nhà nước.",
    service: "danh-gia-mo-hinh-tri-tue-nhan-tao",
    status: "resolved",
    adminNote: "Đã ký hợp đồng dịch vụ và bàn giao báo cáo đánh giá.",
    handledBy: "nam",
    daysAgo: 24,
    hour: 9,
  },
  {
    code: "LH",
    type: "contact",
    fullName: "Đặng Văn Hùng",
    email: "hung.dv@example.com",
    phone: null,
    organization: null,
    subject: "Góp ý về Trang thông tin điện tử",
    message: "Đề nghị Viện bổ sung chức năng đăng ký nhận bản tin qua email và cung cấp thêm tài liệu tiếng Anh.",
    status: "resolved",
    adminNote: "Đã tiếp thu, đưa vào kế hoạch nâng cấp Trang.",
    handledBy: "huong",
    daysAgo: 11,
    hour: 20,
  },
  {
    code: "DL",
    type: "dataset_access",
    fullName: "Ngô Thanh Tùng",
    email: "tung.nt@example.com",
    phone: null,
    organization: "Công ty Phân tích dữ liệu (mẫu)",
    subject: "Đăng ký khai thác: Bộ dữ liệu nhật ký sự cố an toàn thông tin",
    message: "Công ty đề nghị được sử dụng bộ dữ liệu để huấn luyện sản phẩm thương mại phát hiện xâm nhập.",
    dataset: "nhat-ky-su-co-an-toan-thong-tin",
    status: "rejected",
    adminNote: "Mục đích thương mại không phù hợp điều kiện sử dụng dữ liệu hạn chế. Đã phản hồi, đề nghị tham khảo các bộ dữ liệu mở.",
    handledBy: "minh",
    daysAgo: 16,
    hour: 11,
  },
];
