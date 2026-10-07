import type { DatasetAccessMethodJson, DatasetColumnJson, ProcessStepJson, ProjectMilestoneJson } from "@workspace/db";
import { html, img } from "./helpers";

export const FIELDS = [
  {
    slug: "cong-nghe-so",
    name: "Nghiên cứu, phát triển công nghệ số",
    nameEn: "Digital technology research and development",
    shortName: "Công nghệ số",
    summary: "Nghiên cứu kiến trúc, nền tảng số dùng chung, điện toán đám mây, IoT và hạ tầng số phục vụ cơ quan nhà nước và doanh nghiệp.",
    summaryEn: "Research on architectures, shared digital platforms, cloud computing, IoT and digital infrastructure.",
    description: html([
      "Lĩnh vực tập trung làm chủ các công nghệ nền tảng của chính phủ số và kinh tế số: kiến trúc hệ thống thông tin, nền tảng số dùng chung, điện toán đám mây, điện toán biên, Internet vạn vật (IoT) và các chuẩn kết nối, liên thông.",
      "Viện phối hợp với các bộ, ngành, địa phương thí điểm giải pháp, đánh giá hiệu quả và đề xuất nhân rộng các mô hình phù hợp với điều kiện Việt Nam.",
    ]),
    highlights: ["Kiến trúc, nền tảng số dùng chung", "Điện toán đám mây, điện toán biên và IoT", "Chuẩn kết nối, liên thông hệ thống thông tin"],
    icon: "cpu",
    coverImage: img("field-cong-nghe-so"),
  },
  {
    slug: "chuyen-doi-so",
    name: "Chuyển đổi số quốc gia",
    nameEn: "National digital transformation",
    shortName: "Chuyển đổi số",
    summary: "Nghiên cứu chiến lược, mô hình, bộ chỉ số đánh giá và tư vấn triển khai chuyển đổi số cho bộ, ngành, địa phương, doanh nghiệp.",
    summaryEn: "Strategy, models, assessment indices and advisory services for digital transformation.",
    description: html([
      "Viện cung cấp luận cứ khoa học cho việc hoạch định và đánh giá chính sách chuyển đổi số; xây dựng bộ chỉ số, phương pháp đo lường mức độ chuyển đổi số; tư vấn kiến trúc, lộ trình chuyển đổi số cho cơ quan nhà nước và doanh nghiệp.",
      "Song song, Viện tổ chức bồi dưỡng kỹ năng số cho cán bộ, công chức và đào tạo đội ngũ chuyên gia chuyển đổi số.",
    ]),
    highlights: ["Bộ chỉ số đánh giá mức độ chuyển đổi số", "Tư vấn kiến trúc, lộ trình chuyển đổi số", "Bồi dưỡng kỹ năng số, chuyên gia chuyển đổi số"],
    icon: "network",
    coverImage: img("field-chuyen-doi-so"),
  },
  {
    slug: "du-lieu",
    name: "Dữ liệu số và hạ tầng dữ liệu",
    nameEn: "Digital data and data infrastructure",
    shortName: "Dữ liệu",
    summary: "Quản trị dữ liệu, chuẩn hóa siêu dữ liệu, xây dựng và chia sẻ các bộ dữ liệu phục vụ nghiên cứu, phát triển trí tuệ nhân tạo.",
    summaryEn: "Data governance, metadata standards and shared datasets for AI research.",
    description: html([
      "Viện nghiên cứu khung quản trị dữ liệu, chuẩn siêu dữ liệu và kiến trúc dữ liệu mở; xây dựng, làm sạch, gán nhãn và công bố các bộ dữ liệu phục vụ nghiên cứu, huấn luyện mô hình trí tuệ nhân tạo.",
      "Danh mục dữ liệu phục vụ AI trên Trang này là đầu mối để cộng đồng nghiên cứu tra cứu, đăng ký và khai thác dữ liệu theo ba mức truy cập: mở, cần đăng ký và hạn chế.",
    ]),
    highlights: ["Danh mục dữ liệu phục vụ AI", "Chuẩn siêu dữ liệu, kiến trúc dữ liệu mở", "Làm sạch, gán nhãn và ẩn danh dữ liệu"],
    icon: "database",
    coverImage: img("field-du-lieu"),
  },
  {
    slug: "tri-tue-nhan-tao",
    name: "Trí tuệ nhân tạo và ứng dụng",
    nameEn: "Artificial intelligence and applications",
    shortName: "Trí tuệ nhân tạo",
    summary: "Nghiên cứu xử lý ngôn ngữ tự nhiên tiếng Việt, thị giác máy tính và ứng dụng trí tuệ nhân tạo trong hành chính công, y tế, giáo dục.",
    summaryEn: "Vietnamese NLP, computer vision and AI applications for public administration, health and education.",
    description: html([
      "Lĩnh vực tập trung vào xử lý ngôn ngữ tự nhiên tiếng Việt, mô hình ngôn ngữ lớn, nhận dạng tiếng nói, thị giác máy tính và các ứng dụng trí tuệ nhân tạo có trách nhiệm trong khu vực công.",
      "Phòng thí nghiệm Trí tuệ nhân tạo của Viện cung cấp hạ tầng tính toán cho các nhóm nghiên cứu và hỗ trợ thử nghiệm mô hình trước khi triển khai.",
    ]),
    highlights: ["Xử lý ngôn ngữ tự nhiên, mô hình ngôn ngữ tiếng Việt", "Thị giác máy tính, nhận dạng tiếng nói", "AI có trách nhiệm trong khu vực công"],
    icon: "brain",
    coverImage: img("field-tri-tue-nhan-tao"),
  },
  {
    slug: "danh-gia-kiem-dinh",
    name: "Đánh giá – Thử nghiệm – Kiểm định",
    nameEn: "Evaluation, testing and certification",
    shortName: "Kiểm định",
    summary: "Đánh giá, thử nghiệm, kiểm định độc lập đối với phần mềm, nền tảng số, mô hình trí tuệ nhân tạo, an toàn thông tin và chất lượng dữ liệu.",
    summaryEn: "Independent evaluation and testing of software, platforms, AI models, security and data quality.",
    description: html([
      "Trung tâm Đánh giá, Thử nghiệm và Kiểm định của Viện thực hiện các dịch vụ đánh giá độc lập theo tiêu chuẩn quốc gia, quốc tế, phục vụ quản lý nhà nước và nhu cầu của tổ chức, doanh nghiệp.",
      "Kết quả đánh giá được thể hiện bằng báo cáo kỹ thuật, kèm khuyến nghị khắc phục và có thể được sử dụng trong hồ sơ nghiệm thu, đưa vào vận hành hệ thống.",
    ]),
    highlights: ["Thử nghiệm chất lượng phần mềm, nền tảng số", "Đánh giá mô hình trí tuệ nhân tạo", "Đánh giá an toàn thông tin và chất lượng dữ liệu"],
    icon: "shield-check",
    coverImage: img("field-danh-gia-kiem-dinh"),
  },
];

type ProjectSeed = {
  slug: string;
  code: string;
  title: string;
  type: string;
  level: string;
  status: "proposed" | "ongoing" | "completed";
  field: string;
  leadName: string;
  leadUnit: string;
  startYear: number;
  endYear: number | null;
  budget: string | null;
  summary: string;
  objectives: string[];
  results: string | null;
  partners: string[];
  milestones: ProjectMilestoneJson[];
  keywords: string[];
  coverImage: string | null;
};

export const PROJECTS: ProjectSeed[] = [
  {
    slug: "kho-ngu-lieu-tieng-viet-hanh-chinh",
    code: "ĐTCB.2025.03",
    title: "Xây dựng kho ngữ liệu tiếng Việt hành chính phục vụ huấn luyện mô hình ngôn ngữ lớn",
    type: "Đề tài khoa học và công nghệ",
    level: "Cấp Bộ",
    status: "ongoing",
    field: "tri-tue-nhan-tao",
    leadName: "TS. Đỗ Quang Minh",
    leadUnit: "Trung tâm Dữ liệu và Trí tuệ nhân tạo",
    startYear: 2025,
    endYear: 2027,
    budget: "4,2 tỷ đồng",
    summary: "Thu thập, chuẩn hóa và gán nhãn kho ngữ liệu văn bản hành chính tiếng Việt có kiểm soát bản quyền, làm nền tảng huấn luyện và đánh giá các mô hình ngôn ngữ phục vụ cơ quan nhà nước.",
    objectives: [
      "Xây dựng kho ngữ liệu tối thiểu 1 triệu văn bản hành chính đã được chuẩn hóa, loại bỏ thông tin cá nhân.",
      "Xây dựng bộ đánh giá năng lực mô hình ngôn ngữ trên các tác vụ tóm tắt, hỏi – đáp, phân loại văn bản.",
      "Đề xuất quy trình quản trị, chia sẻ ngữ liệu tuân thủ quy định về dữ liệu và bảo vệ dữ liệu cá nhân.",
    ],
    results: null,
    partners: ["Một số trường đại học kỹ thuật trong nước", "Văn phòng các cơ quan nhà nước tham gia thí điểm"],
    milestones: [
      { title: "Phê duyệt thuyết minh, khởi động", date: "2025-03", done: true },
      { title: "Hoàn thành bộ ngữ liệu giai đoạn 1 (400.000 văn bản)", date: "2025-12", done: true },
      { title: "Công bố bộ đánh giá mô hình ngôn ngữ", date: "2026-09", done: true },
      { title: "Hoàn thành kho ngữ liệu đầy đủ", date: "2027-03", done: false },
      { title: "Nghiệm thu đề tài", date: "2027-09", done: false },
    ],
    keywords: ["trí tuệ nhân tạo", "mô hình ngôn ngữ lớn", "ngữ liệu tiếng Việt", "dữ liệu"],
    coverImage: img("nghien-cuu-tieng-viet"),
  },
  {
    slug: "bo-chi-so-danh-gia-chuyen-doi-so-2026-2030",
    code: "ĐTCB.2025.07",
    title: "Nghiên cứu bộ chỉ số đánh giá mức độ chuyển đổi số của bộ, ngành, địa phương giai đoạn 2026–2030",
    type: "Đề tài khoa học và công nghệ",
    level: "Cấp Bộ",
    status: "ongoing",
    field: "chuyen-doi-so",
    leadName: "ThS. Hoàng Minh Tuấn",
    leadUnit: "Phòng Chiến lược và Chính sách chuyển đổi số",
    startYear: 2025,
    endYear: 2026,
    budget: "2,8 tỷ đồng",
    summary: "Rà soát kinh nghiệm quốc tế, đề xuất bộ chỉ số và phương pháp đánh giá mức độ chuyển đổi số phù hợp với mô hình chính quyền địa phương hai cấp và yêu cầu quản trị dựa trên dữ liệu.",
    objectives: [
      "Đề xuất khung chỉ số gồm các trụ cột: thể chế, hạ tầng, dữ liệu, nền tảng, nhân lực và hiệu quả phục vụ.",
      "Xây dựng công cụ thu thập, tính toán chỉ số trực tuyến.",
      "Thử nghiệm đánh giá tại một số bộ, ngành, địa phương.",
    ],
    results: null,
    partners: ["Sở Khoa học và Công nghệ một số địa phương thí điểm"],
    milestones: [
      { title: "Tổng quan kinh nghiệm quốc tế", date: "2025-06", done: true },
      { title: "Dự thảo khung chỉ số, lấy ý kiến chuyên gia", date: "2025-11", done: true },
      { title: "Thử nghiệm đánh giá", date: "2026-08", done: true },
      { title: "Hoàn thiện, nghiệm thu", date: "2026-12", done: false },
    ],
    keywords: ["chuyển đổi số", "bộ chỉ số", "đánh giá", "chính quyền số"],
    coverImage: img("field-chuyen-doi-so"),
  },
  {
    slug: "khung-kien-truc-du-lieu-mo-phuc-vu-ai",
    code: "NVCS.2026.02",
    title: "Khung kiến trúc dữ liệu mở phục vụ nghiên cứu và phát triển trí tuệ nhân tạo",
    type: "Nhiệm vụ khoa học và công nghệ",
    level: "Cấp cơ sở",
    status: "ongoing",
    field: "du-lieu",
    leadName: "TS. Bùi Thị Lan Anh",
    leadUnit: "Trung tâm Dữ liệu và Trí tuệ nhân tạo",
    startYear: 2026,
    endYear: 2027,
    budget: "850 triệu đồng",
    summary: "Đề xuất kiến trúc tham chiếu, chuẩn siêu dữ liệu và quy trình công bố dữ liệu mở phục vụ cộng đồng nghiên cứu trí tuệ nhân tạo, làm cơ sở vận hành Danh mục dữ liệu phục vụ AI của Viện.",
    objectives: [
      "Đề xuất hồ sơ siêu dữ liệu thống nhất cho các bộ dữ liệu huấn luyện AI.",
      "Thiết kế các phương thức truy cập: tải tệp, API và lưu trữ đối tượng.",
      "Xây dựng quy trình phê duyệt, cấp quyền với dữ liệu hạn chế.",
    ],
    results: null,
    partners: [],
    milestones: [
      { title: "Khảo sát hiện trạng, nhu cầu", date: "2026-03", done: true },
      { title: "Công bố Danh mục dữ liệu phiên bản thử nghiệm", date: "2026-10", done: true },
      { title: "Hoàn thiện kiến trúc tham chiếu", date: "2027-06", done: false },
    ],
    keywords: ["dữ liệu mở", "siêu dữ liệu", "dữ liệu", "trí tuệ nhân tạo"],
    coverImage: img("du-lieu-gan-nhan"),
  },
  {
    slug: "cong-cu-danh-gia-do-tin-cay-mo-hinh-ai",
    code: "KC.4.0-2025.11",
    title: "Phát triển bộ công cụ đánh giá an toàn và độ tin cậy của mô hình trí tuệ nhân tạo",
    type: "Đề tài khoa học và công nghệ",
    level: "Cấp Quốc gia",
    status: "ongoing",
    field: "danh-gia-kiem-dinh",
    leadName: "TS. Lê Thị Minh Phương",
    leadUnit: "Trung tâm Đánh giá, Thử nghiệm và Kiểm định",
    startYear: 2025,
    endYear: 2028,
    budget: "9,5 tỷ đồng",
    summary: "Nghiên cứu phương pháp và phát triển bộ công cụ đánh giá độ chính xác, độ bền vững, tính công bằng, khả năng giải thích và an toàn của mô hình trí tuệ nhân tạo trước khi đưa vào sử dụng trong khu vực công.",
    objectives: [
      "Xây dựng bộ tiêu chí đánh giá mô hình AI theo mức độ rủi ro.",
      "Phát triển bộ công cụ kiểm thử tự động cho mô hình ngôn ngữ và mô hình thị giác.",
      "Thí điểm đánh giá một số hệ thống AI đang được sử dụng trong cơ quan nhà nước.",
    ],
    results: null,
    partners: ["Doanh nghiệp công nghệ trong nước", "Các nhóm nghiên cứu về an toàn AI tại trường đại học"],
    milestones: [
      { title: "Bộ tiêu chí đánh giá theo mức độ rủi ro", date: "2025-12", done: true },
      { title: "Phiên bản thử nghiệm bộ công cụ", date: "2026-09", done: true },
      { title: "Thí điểm đánh giá", date: "2027-06", done: false },
      { title: "Nghiệm thu", date: "2028-06", done: false },
    ],
    keywords: ["kiểm định", "đánh giá mô hình", "AI có trách nhiệm", "trí tuệ nhân tạo"],
    coverImage: img("field-danh-gia-kiem-dinh"),
  },
  {
    slug: "nen-tang-iot-giam-sat-ha-tang-do-thi",
    code: "ĐTCB.2023.05",
    title: "Nền tảng IoT giám sát hạ tầng đô thị thông minh quy mô thí điểm",
    type: "Dự án sản xuất thử nghiệm",
    level: "Cấp Bộ",
    status: "completed",
    field: "cong-nghe-so",
    leadName: "TS. Phan Văn Long",
    leadUnit: "Phòng Nghiên cứu Công nghệ số",
    startYear: 2023,
    endYear: 2025,
    budget: "5,6 tỷ đồng",
    summary: "Phát triển nền tảng thu thập, xử lý dữ liệu cảm biến IoT phục vụ giám sát chiếu sáng, môi trường và thoát nước đô thị; thí điểm tại một khu đô thị.",
    objectives: ["Làm chủ kiến trúc nền tảng IoT mở", "Kết nối tối thiểu 2.000 thiết bị cảm biến", "Xây dựng bảng điều khiển giám sát thời gian thực"],
    results: "Nền tảng đã kết nối hơn 2.300 thiết bị, vận hành ổn định 12 tháng; được đánh giá đạt yêu cầu và đề xuất nhân rộng. Kết quả đã được công bố tại 02 bài báo và 01 báo cáo kỹ thuật.",
    partners: ["Ban quản lý khu đô thị thí điểm"],
    milestones: [
      { title: "Thiết kế kiến trúc", date: "2023-06", done: true },
      { title: "Lắp đặt, kết nối thiết bị", date: "2024-05", done: true },
      { title: "Vận hành thử nghiệm", date: "2025-03", done: true },
      { title: "Nghiệm thu", date: "2025-09", done: true },
    ],
    keywords: ["IoT", "đô thị thông minh", "công nghệ số", "hạ tầng số"],
    coverImage: img("ha-tang-iot"),
  },
  {
    slug: "ai-ho-tro-sang-loc-hinh-anh-y-te",
    code: "ĐTCB.2023.09",
    title: "Ứng dụng trí tuệ nhân tạo hỗ trợ sàng lọc hình ảnh y tế tại tuyến cơ sở",
    type: "Đề tài khoa học và công nghệ",
    level: "Cấp Bộ",
    status: "completed",
    field: "tri-tue-nhan-tao",
    leadName: "TS. Nguyễn Hải Yến",
    leadUnit: "Trung tâm Dữ liệu và Trí tuệ nhân tạo",
    startYear: 2023,
    endYear: 2025,
    budget: "3,9 tỷ đồng",
    summary: "Nghiên cứu mô hình học sâu hỗ trợ bác sĩ tuyến cơ sở sàng lọc bất thường trên ảnh X-quang ngực; xây dựng quy trình đánh giá lâm sàng và cơ chế giám sát sau triển khai.",
    objectives: ["Xây dựng bộ dữ liệu ảnh y tế ẩn danh có gán nhãn chuyên gia", "Phát triển mô hình sàng lọc với độ nhạy tối thiểu 90%", "Thử nghiệm tại một số cơ sở y tế tuyến cơ sở"],
    results: "Mô hình đạt độ nhạy 92,4% trên tập kiểm tra độc lập; thời gian đọc phim trung bình giảm khoảng 30% trong giai đoạn thử nghiệm. Đề tài được nghiệm thu, xếp loại Đạt.",
    partners: ["Một số cơ sở y tế tuyến cơ sở tham gia thử nghiệm"],
    milestones: [
      { title: "Xây dựng bộ dữ liệu", date: "2023-12", done: true },
      { title: "Huấn luyện, đánh giá mô hình", date: "2024-09", done: true },
      { title: "Thử nghiệm tại cơ sở y tế", date: "2025-04", done: true },
      { title: "Nghiệm thu", date: "2025-09", done: true },
    ],
    keywords: ["trí tuệ nhân tạo", "y tế số", "thị giác máy tính", "học sâu"],
    coverImage: img("y-te-so"),
  },
  {
    slug: "mo-hinh-trung-tam-du-lieu-xanh-khu-vuc-cong",
    code: "ĐX.2027.01",
    title: "Đề xuất mô hình trung tâm dữ liệu xanh, tiết kiệm năng lượng cho khu vực công",
    type: "Đề xuất nhiệm vụ",
    level: "Cấp Bộ",
    status: "proposed",
    field: "cong-nghe-so",
    leadName: "ThS. Lý Thành Công",
    leadUnit: "Phòng Nghiên cứu Công nghệ số",
    startYear: 2027,
    endYear: 2028,
    budget: null,
    summary: "Nghiên cứu tiêu chí, mô hình thiết kế và vận hành trung tâm dữ liệu tiết kiệm năng lượng cho các cơ quan nhà nước, gắn với yêu cầu phát triển hạ tầng số bền vững.",
    objectives: ["Đề xuất bộ tiêu chí trung tâm dữ liệu xanh", "Xây dựng mô hình đánh giá hiệu quả sử dụng năng lượng (PUE)", "Đề xuất lộ trình áp dụng"],
    results: null,
    partners: [],
    milestones: [{ title: "Gửi đề xuất đặt hàng", date: "2026-09", done: true }, { title: "Dự kiến xét duyệt", date: "2026-12", done: false }],
    keywords: ["trung tâm dữ liệu", "hạ tầng số", "công nghệ số", "năng lượng"],
    coverImage: img("news-trung-tam-du-lieu"),
  },
  {
    slug: "chuan-trao-doi-du-lieu-y-te-so",
    code: "ĐX.2027.04",
    title: "Nghiên cứu chuẩn trao đổi dữ liệu y tế số phục vụ liên thông và phát triển AI",
    type: "Đề xuất nhiệm vụ hợp tác",
    level: "Cấp Bộ",
    status: "proposed",
    field: "du-lieu",
    leadName: "TS. Nguyễn Hải Yến",
    leadUnit: "Trung tâm Dữ liệu và Trí tuệ nhân tạo",
    startYear: 2027,
    endYear: 2029,
    budget: null,
    summary: "Đề xuất hồ sơ chuẩn trao đổi dữ liệu y tế dựa trên các tiêu chuẩn quốc tế phổ biến, bảo đảm liên thông giữa các hệ thống và hỗ trợ chia sẻ dữ liệu ẩn danh cho nghiên cứu.",
    objectives: ["Rà soát các chuẩn trao đổi dữ liệu y tế quốc tế", "Đề xuất hồ sơ chuẩn phù hợp với Việt Nam", "Xây dựng công cụ kiểm tra tuân thủ"],
    results: null,
    partners: ["Đối tác nghiên cứu quốc tế (đang trao đổi)"],
    milestones: [{ title: "Hoàn thiện thuyết minh đề xuất", date: "2026-10", done: false }],
    keywords: ["dữ liệu y tế", "liên thông", "dữ liệu", "chuẩn"],
    coverImage: img("news-hop-tac-quoc-te"),
  },
];

type PublicationSeed = {
  title: string;
  authors: string;
  venue: string;
  type: "journal" | "conference" | "book" | "report" | "patent";
  year: number;
  url?: string | null;
  abstract: string;
  keywords: string[];
  indexing: string | null;
  isInternational: boolean;
  citationCount: number;
  field: string;
  project?: string;
};

export const PUBLICATIONS: PublicationSeed[] = [
  {
    title: "Bộ đánh giá năng lực mô hình ngôn ngữ lớn trên văn bản hành chính tiếng Việt",
    authors: "Đỗ Quang Minh, Bùi Thị Lan Anh, Trần Quốc Hưng",
    venue: "Tạp chí Công nghệ số và Chuyển đổi số",
    type: "journal",
    year: 2026,
    abstract: "Bài báo giới thiệu bộ đánh giá gồm 12.000 mẫu thuộc 5 nhóm tác vụ (tóm tắt, hỏi – đáp, trích xuất thông tin, phân loại và soạn thảo văn bản hành chính) và kết quả đánh giá 9 mô hình ngôn ngữ mã nguồn mở. Kết quả cho thấy khoảng cách đáng kể giữa năng lực hiểu và năng lực soạn thảo đúng thể thức.",
    keywords: ["mô hình ngôn ngữ lớn", "tiếng Việt", "đánh giá", "văn bản hành chính"],
    indexing: "HĐGSNN",
    isInternational: false,
    citationCount: 4,
    field: "tri-tue-nhan-tao",
    project: "kho-ngu-lieu-tieng-viet-hanh-chinh",
  },
  {
    title: "A Risk-Tiered Evaluation Framework for AI Systems in the Public Sector",
    authors: "M. P. Le, Q. H. Tran, T. A. Nguyen",
    venue: "International Conference on Digital Government and Society",
    type: "conference",
    year: 2026,
    abstract: "We propose a risk-tiered framework for evaluating AI systems prior to deployment in public administration. The framework maps use cases to four risk tiers and prescribes evaluation depth across accuracy, robustness, fairness, transparency and security. A pilot on three government chatbots illustrates how the framework surfaces deployment blockers early.",
    keywords: ["AI evaluation", "risk management", "public sector", "trustworthy AI"],
    indexing: "Scopus",
    isInternational: true,
    citationCount: 7,
    field: "danh-gia-kiem-dinh",
    project: "cong-cu-danh-gia-do-tin-cay-mo-hinh-ai",
  },
  {
    title: "Phương pháp đo lường mức độ chuyển đổi số cấp xã trong mô hình chính quyền địa phương hai cấp",
    authors: "Hoàng Minh Tuấn, Phạm Thu Hà",
    venue: "Kỷ yếu Hội thảo quốc gia về Chuyển đổi số 2026",
    type: "conference",
    year: 2026,
    abstract: "Bài viết đề xuất 24 chỉ số thành phần đo lường mức độ chuyển đổi số cấp xã, tập trung vào khả năng cung cấp dịch vụ công trực tuyến, mức độ số hóa hồ sơ và năng lực số của cán bộ. Phương pháp được thử nghiệm với dữ liệu khảo sát của một số đơn vị hành chính.",
    keywords: ["chuyển đổi số", "chỉ số", "chính quyền địa phương", "cấp xã"],
    indexing: null,
    isInternational: false,
    citationCount: 2,
    field: "chuyen-doi-so",
    project: "bo-chi-so-danh-gia-chuyen-doi-so-2026-2030",
  },
  {
    title: "Deep Learning-Assisted Chest X-ray Triage in Primary Care: A Prospective Pilot Study",
    authors: "H. Y. Nguyen, Q. M. Do, V. L. Phan",
    venue: "Journal of Medical Imaging and Health Informatics",
    type: "journal",
    year: 2025,
    abstract: "This prospective pilot evaluates a deep learning model supporting chest X-ray triage at primary care facilities. On an independent test set the model achieved a sensitivity of 92.4%. Reading time decreased by approximately 30% while maintaining clinician oversight.",
    keywords: ["deep learning", "medical imaging", "primary care", "triage"],
    indexing: "SCIE",
    isInternational: true,
    citationCount: 18,
    field: "tri-tue-nhan-tao",
    project: "ai-ho-tro-sang-loc-hinh-anh-y-te",
  },
  {
    title: "Kiến trúc nền tảng IoT mở cho giám sát hạ tầng đô thị: thiết kế và kinh nghiệm triển khai",
    authors: "Phan Văn Long, Lý Thành Công, Đặng Thị Thu",
    venue: "Tạp chí Khoa học và Công nghệ Việt Nam",
    type: "journal",
    year: 2025,
    abstract: "Bài báo trình bày kiến trúc nền tảng IoT mở gồm bốn lớp (thiết bị, kết nối, nền tảng, ứng dụng), các quyết định thiết kế nhằm bảo đảm khả năng mở rộng và an toàn thông tin, cùng bài học kinh nghiệm sau 12 tháng vận hành với hơn 2.300 thiết bị.",
    keywords: ["IoT", "đô thị thông minh", "kiến trúc nền tảng"],
    indexing: "ACI",
    isInternational: false,
    citationCount: 9,
    field: "cong-nghe-so",
    project: "nen-tang-iot-giam-sat-ha-tang-do-thi",
  },
  {
    title: "Metadata Profile for Publishing AI Training Datasets in Government Open Data Catalogues",
    authors: "T. L. A. Bui, Q. M. Do",
    venue: "Asia-Pacific Conference on Open Data and AI",
    type: "conference",
    year: 2026,
    abstract: "We present a metadata profile extending common open data vocabularies with fields required for AI training data: provenance, labelling procedure, known biases, intended tasks and access conditions. The profile underpins the Institute's AI dataset catalogue.",
    keywords: ["metadata", "open data", "AI datasets", "data catalogue"],
    indexing: "Scopus",
    isInternational: true,
    citationCount: 3,
    field: "du-lieu",
    project: "khung-kien-truc-du-lieu-mo-phuc-vu-ai",
  },
  {
    title: "Báo cáo Chuyển đổi số khu vực công 2025: Hiện trạng và khuyến nghị",
    authors: "Viện Công nghệ số và Chuyển đổi số quốc gia",
    venue: "Báo cáo chuyên đề",
    type: "report",
    year: 2025,
    url: "/files/bao-cao-chuyen-doi-so-khu-vuc-cong-2025.pdf",
    abstract: "Báo cáo tổng hợp kết quả khảo sát, phân tích mức độ chuyển đổi số khu vực công, nhận diện các điểm nghẽn về dữ liệu, nhân lực và hạ tầng, đồng thời đưa ra 12 nhóm khuyến nghị cho giai đoạn tiếp theo.",
    keywords: ["chuyển đổi số", "khu vực công", "báo cáo"],
    indexing: null,
    isInternational: false,
    citationCount: 11,
    field: "chuyen-doi-so",
  },
  {
    title: "Báo cáo kỹ thuật: Đánh giá chất lượng dữ liệu trong các hệ thống thông tin dùng chung",
    authors: "Trung tâm Đánh giá, Thử nghiệm và Kiểm định",
    venue: "Báo cáo kỹ thuật NIDIT-TR-2026-02",
    type: "report",
    year: 2026,
    url: "/files/bao-cao-ky-thuat-chat-luong-du-lieu.pdf",
    abstract: "Báo cáo trình bày phương pháp đánh giá chất lượng dữ liệu theo các đặc tính đầy đủ, chính xác, nhất quán, kịp thời và kết quả áp dụng thử nghiệm trên một số cơ sở dữ liệu dùng chung.",
    keywords: ["chất lượng dữ liệu", "kiểm định", "ISO/IEC 25012"],
    indexing: null,
    isInternational: false,
    citationCount: 1,
    field: "danh-gia-kiem-dinh",
  },
  {
    title: "Trí tuệ nhân tạo trong quản trị công: Nguyên lý, ứng dụng và quản lý rủi ro",
    authors: "Trần Quốc Hưng (chủ biên), Lê Thị Minh Phương, Đỗ Quang Minh",
    venue: "Nhà xuất bản Khoa học và Kỹ thuật",
    type: "book",
    year: 2025,
    abstract: "Sách chuyên khảo giới thiệu nguyên lý cơ bản của trí tuệ nhân tạo, các nhóm ứng dụng trong quản trị công và khung quản lý rủi ro khi triển khai AI tại cơ quan nhà nước, kèm các tình huống điển hình.",
    keywords: ["trí tuệ nhân tạo", "quản trị công", "quản lý rủi ro"],
    indexing: null,
    isInternational: false,
    citationCount: 6,
    field: "tri-tue-nhan-tao",
  },
  {
    title: "Phương pháp và hệ thống ẩn danh hóa văn bản hành chính tiếng Việt",
    authors: "Đỗ Quang Minh, Bùi Thị Lan Anh",
    venue: "Đơn đăng ký sáng chế (đang thẩm định)",
    type: "patent",
    year: 2026,
    abstract: "Sáng chế đề xuất phương pháp kết hợp nhận dạng thực thể có tên và luật ngữ cảnh để phát hiện, thay thế thông tin định danh cá nhân trong văn bản hành chính tiếng Việt, bảo toàn cấu trúc và ngữ nghĩa văn bản phục vụ huấn luyện mô hình.",
    keywords: ["ẩn danh hóa", "bảo vệ dữ liệu cá nhân", "xử lý ngôn ngữ tự nhiên"],
    indexing: null,
    isInternational: false,
    citationCount: 0,
    field: "du-lieu",
    project: "kho-ngu-lieu-tieng-viet-hanh-chinh",
  },
  {
    title: "Sentiment Analysis of Citizen Feedback on Online Public Services in Vietnamese",
    authors: "T. H. Pham, Q. M. Do, M. T. Hoang",
    venue: "Conference on Computational Linguistics and Speech Processing",
    type: "conference",
    year: 2024,
    abstract: "We release a corpus of 120,000 citizen comments on online public services annotated with sentiment and service aspects, and benchmark transformer-based classifiers. The best model reaches a macro-F1 of 0.87.",
    keywords: ["sentiment analysis", "Vietnamese", "public services"],
    indexing: "Scopus",
    isInternational: true,
    citationCount: 21,
    field: "tri-tue-nhan-tao",
  },
  {
    title: "Đánh giá khả năng tiếp cận của các cổng dịch vụ công theo WCAG 2.1",
    authors: "Lê Thị Minh Phương, Vũ Hoài Nam",
    venue: "Tạp chí Công nghệ số và Chuyển đổi số",
    type: "journal",
    year: 2024,
    abstract: "Nghiên cứu khảo sát mức độ đáp ứng tiêu chuẩn tiếp cận nội dung web WCAG 2.1 của các cổng dịch vụ công, chỉ ra các lỗi phổ biến và đề xuất danh mục kiểm tra tối thiểu cho cơ quan nhà nước.",
    keywords: ["khả năng tiếp cận", "WCAG", "dịch vụ công", "kiểm định"],
    indexing: "HĐGSNN",
    isInternational: false,
    citationCount: 5,
    field: "danh-gia-kiem-dinh",
  },
];

type DatasetSeed = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  field: string;
  license: string;
  accessLevel: "open" | "registered" | "restricted";
  formats: string[];
  sizeLabel: string;
  recordCount: number;
  language: string;
  updateFrequency: string;
  version: string;
  keywords: string[];
  aiTasks: string[];
  conditions: string;
  columns: DatasetColumnJson[];
  coverImage: string | null;
  downloadCount: number;
  requestCount: number;
  issuedDaysAgo: number;
};

const OPEN_CONDITIONS = html([
  "Được sử dụng, sao chép, phân phối lại cho mọi mục đích, kể cả thương mại, với điều kiện <strong>ghi rõ nguồn</strong>: “Viện Công nghệ số và Chuyển đổi số quốc gia”.",
  "Không sử dụng dữ liệu để xác định danh tính cá nhân hoặc cho mục đích trái pháp luật.",
]);
const REGISTERED_CONDITIONS = html([
  "Chỉ sử dụng cho mục đích <strong>nghiên cứu, đào tạo và phát triển sản phẩm</strong> đã nêu trong phiếu đăng ký.",
  "Không phân phối lại bộ dữ liệu gốc cho bên thứ ba; được công bố mô hình, kết quả nghiên cứu có trích dẫn nguồn.",
  "Thông tin truy cập (khóa API, tài khoản lưu trữ) được gửi qua email trong 03 ngày làm việc kể từ khi đăng ký hợp lệ.",
]);
const RESTRICTED_CONDITIONS = html([
  "Bộ dữ liệu chứa thông tin nhạy cảm đã được ẩn danh; chỉ cung cấp cho <strong>đề tài nghiên cứu được Hội đồng dữ liệu của Viện phê duyệt</strong>.",
  "Đơn vị sử dụng ký thỏa thuận sử dụng dữ liệu (DUA), cam kết bảo mật và chỉ khai thác trong môi trường tính toán do Viện cấp.",
  "Nghiêm cấm mọi hành vi tái định danh, sao chép dữ liệu ra ngoài môi trường được cấp phép.",
]);

export function accessMethods(slug: string, level: DatasetSeed["accessLevel"]): DatasetAccessMethodJson[] {
  if (level === "restricted") {
    return [
      { type: "object_storage", label: "Môi trường lưu trữ, tính toán có kiểm soát", url: `s3://nidit-restricted/${slug}/`, note: "Chỉ cấp quyền sau khi yêu cầu được phê duyệt" },
    ];
  }
  const methods: DatasetAccessMethodJson[] = [
    { type: "link", label: "Tải tệp mẫu (CSV)", url: `/api/open-data/${slug}/sample.csv`, note: level === "open" ? "25 bản ghi mẫu; bộ đầy đủ phát hành theo đợt" : "25 bản ghi mẫu để đánh giá trước khi đăng ký" },
    { type: "api", label: "API dữ liệu (JSON)", url: `/api/open-data/${slug}/sample.json`, note: level === "open" ? "REST, không cần khóa truy cập" : "Bản đầy đủ cần khóa API do Viện cấp" },
  ];
  if (level === "registered") {
    methods.push({ type: "object_storage", label: "Lưu trữ đối tượng (tương thích S3)", url: `s3://nidit-open-data/${slug}/`, note: "Thông tin xác thực gửi qua email sau khi đăng ký" });
  }
  return methods;
}

export const DATASETS: DatasetSeed[] = [
  {
    slug: "kho-ngu-lieu-van-ban-hanh-chinh",
    title: "Kho ngữ liệu văn bản hành chính tiếng Việt (VN-AdminText)",
    summary: "Hơn 1,2 triệu văn bản hành chính đã chuẩn hóa thể thức, loại bỏ thông tin cá nhân, phục vụ huấn luyện và đánh giá mô hình ngôn ngữ.",
    description: html([
      "Kho ngữ liệu được xây dựng trong khuôn khổ đề tài cấp Bộ về ngữ liệu tiếng Việt hành chính. Văn bản được thu thập từ nguồn công khai và nguồn do cơ quan nhà nước cung cấp có thỏa thuận, sau đó chuẩn hóa thể thức, tách câu và ẩn danh hóa.",
      { h: "Thành phần" },
      { ul: ["Văn bản quy phạm pháp luật, văn bản hành chính thông thường", "Siêu dữ liệu: loại văn bản, lĩnh vực, năm ban hành, số từ", "Phiên bản 1.2 bổ sung 380.000 văn bản lĩnh vực đất đai, tư pháp"] },
    ]),
    field: "tri-tue-nhan-tao",
    license: "Giấy phép dữ liệu nghiên cứu NIDIT-R 1.0",
    accessLevel: "registered",
    formats: ["JSONL", "CSV", "Parquet"],
    sizeLabel: "18,6 GB",
    recordCount: 1_214_380,
    language: "Tiếng Việt",
    updateFrequency: "6 tháng/lần",
    version: "1.2",
    keywords: ["ngữ liệu", "văn bản hành chính", "mô hình ngôn ngữ lớn", "NLP"],
    aiTasks: ["Huấn luyện mô hình ngôn ngữ", "Tóm tắt văn bản", "Phân loại văn bản"],
    conditions: REGISTERED_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã văn bản" },
      { name: "loai_van_ban", type: "string", description: "Loại văn bản (Quyết định, Thông tư, Công văn…)" },
      { name: "linh_vuc", type: "string", description: "Lĩnh vực quản lý" },
      { name: "ngay_ban_hanh", type: "date", description: "Ngày ban hành" },
      { name: "noi_dung", type: "string", description: "Nội dung văn bản đã ẩn danh" },
      { name: "so_tu", type: "integer", description: "Số từ" },
    ],
    coverImage: img("nghien-cuu-tieng-viet"),
    downloadCount: 1_426,
    requestCount: 87,
    issuedDaysAgo: 210,
  },
  {
    slug: "hoi-dap-thu-tuc-hanh-chinh",
    title: "Bộ dữ liệu hỏi – đáp về thủ tục hành chính",
    summary: "48.500 cặp câu hỏi – câu trả lời về thủ tục hành chính phổ biến, phục vụ phát triển trợ lý ảo, chatbot dịch vụ công.",
    description: html([
      "Câu hỏi được tổng hợp từ các kênh hỏi đáp công khai và được chuyên gia biên soạn lại câu trả lời căn cứ quy định hiện hành tại thời điểm công bố. Mỗi cặp hỏi – đáp gắn với lĩnh vực và văn bản căn cứ.",
      "Bộ dữ liệu phù hợp để huấn luyện, đánh giá hệ thống hỏi – đáp, truy xuất thông tin và trợ lý ảo cho cổng dịch vụ công.",
    ]),
    field: "tri-tue-nhan-tao",
    license: "CC BY 4.0",
    accessLevel: "open",
    formats: ["CSV", "JSON"],
    sizeLabel: "64 MB",
    recordCount: 48_500,
    language: "Tiếng Việt",
    updateFrequency: "Hằng quý",
    version: "2.0",
    keywords: ["hỏi đáp", "thủ tục hành chính", "chatbot", "dịch vụ công"],
    aiTasks: ["Hỏi – đáp", "Truy xuất thông tin", "Trợ lý ảo"],
    conditions: OPEN_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã cặp hỏi – đáp" },
      { name: "linh_vuc", type: "string", description: "Lĩnh vực thủ tục" },
      { name: "cau_hoi", type: "string", description: "Câu hỏi của người dân" },
      { name: "tra_loi", type: "string", description: "Câu trả lời chuẩn" },
      { name: "ngay_cap_nhat", type: "date", description: "Ngày cập nhật" },
    ],
    coverImage: img("news-dich-vu-cong"),
    downloadCount: 3_982,
    requestCount: 0,
    issuedDaysAgo: 120,
  },
  {
    slug: "cam-xuc-binh-luan-dich-vu-cong",
    title: "Bộ dữ liệu cảm xúc bình luận về dịch vụ công trực tuyến",
    summary: "120.000 bình luận đã ẩn danh, gán nhãn cảm xúc (tích cực, trung tính, tiêu cực) và khía cạnh dịch vụ.",
    description: html([
      "Bình luận được thu thập từ các kênh góp ý công khai, ẩn danh hóa và gán nhãn bởi tối thiểu hai người gán nhãn độc lập; độ đồng thuận Cohen's kappa đạt 0,81.",
      "Bộ dữ liệu đi kèm bài báo khoa học công bố năm 2024 và mô hình cơ sở để so sánh.",
    ]),
    field: "tri-tue-nhan-tao",
    license: "CC BY 4.0",
    accessLevel: "open",
    formats: ["CSV"],
    sizeLabel: "41 MB",
    recordCount: 120_000,
    language: "Tiếng Việt",
    updateFrequency: "Hằng năm",
    version: "1.1",
    keywords: ["phân tích cảm xúc", "bình luận", "dịch vụ công"],
    aiTasks: ["Phân tích cảm xúc", "Phân loại khía cạnh"],
    conditions: OPEN_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã bình luận" },
      { name: "noi_dung", type: "string", description: "Nội dung bình luận đã ẩn danh" },
      { name: "nhan_cam_xuc", type: "string", description: "Nhãn cảm xúc" },
      { name: "ngay_dang", type: "date", description: "Ngày đăng" },
    ],
    coverImage: img("news-dich-vu-cong"),
    downloadCount: 5_217,
    requestCount: 0,
    issuedDaysAgo: 400,
  },
  {
    slug: "tieng-noi-tieng-viet-da-vung-mien",
    title: "Bộ dữ liệu tiếng nói tiếng Việt đa vùng miền",
    summary: "380 giờ ghi âm tiếng nói của 1.200 người nói thuộc ba vùng phương ngữ, kèm bản ghi văn bản đã hiệu đính.",
    description: html([
      "Dữ liệu được ghi âm trong môi trường văn phòng và môi trường có tạp âm, người nói ký cam kết đồng ý sử dụng cho mục đích nghiên cứu. Bản ghi văn bản được hiệu đính hai vòng.",
      "Phù hợp cho nhận dạng tiếng nói, tổng hợp tiếng nói và nhận dạng người nói.",
    ]),
    field: "tri-tue-nhan-tao",
    license: "Giấy phép dữ liệu nghiên cứu NIDIT-R 1.0",
    accessLevel: "registered",
    formats: ["WAV", "CSV"],
    sizeLabel: "52 GB",
    recordCount: 410_000,
    language: "Tiếng Việt",
    updateFrequency: "Hằng năm",
    version: "1.0",
    keywords: ["tiếng nói", "nhận dạng tiếng nói", "phương ngữ"],
    aiTasks: ["Nhận dạng tiếng nói", "Tổng hợp tiếng nói"],
    conditions: REGISTERED_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã đoạn ghi âm" },
      { name: "tep_am_thanh", type: "string", description: "Đường dẫn tệp âm thanh" },
      { name: "vung_mien", type: "string", description: "Vùng phương ngữ" },
      { name: "gioi_tinh", type: "string", description: "Giới tính người nói" },
      { name: "thoi_luong", type: "float", description: "Thời lượng (giây)" },
      { name: "noi_dung", type: "string", description: "Bản ghi văn bản" },
    ],
    coverImage: img("field-tri-tue-nhan-tao"),
    downloadCount: 612,
    requestCount: 54,
    issuedDaysAgo: 300,
  },
  {
    slug: "chi-so-chuyen-doi-so-dia-phuong",
    title: "Bộ dữ liệu chỉ số chuyển đổi số địa phương 2021–2025",
    summary: "Số liệu chỉ số thành phần về thể chế, hạ tầng, dữ liệu, nhân lực và dịch vụ số theo đơn vị hành chính cấp tỉnh.",
    description: html([
      "Bộ dữ liệu tổng hợp các chỉ số thành phần phục vụ phân tích, so sánh mức độ chuyển đổi số giữa các địa phương qua các năm. Số liệu được chuẩn hóa về thang điểm 0–1.",
      "Lưu ý: số liệu giai đoạn trước năm 2025 được tổ chức theo đơn vị hành chính tại thời điểm thu thập.",
    ]),
    field: "chuyen-doi-so",
    license: "CC BY 4.0",
    accessLevel: "open",
    formats: ["CSV", "XLSX", "JSON"],
    sizeLabel: "3,2 MB",
    recordCount: 1_890,
    language: "Tiếng Việt",
    updateFrequency: "Hằng năm",
    version: "2025.1",
    keywords: ["chỉ số", "chuyển đổi số", "địa phương", "thống kê"],
    aiTasks: ["Phân tích dữ liệu", "Dự báo"],
    conditions: OPEN_CONDITIONS,
    columns: [
      { name: "ma_tinh", type: "string", description: "Mã đơn vị" },
      { name: "tinh", type: "string", description: "Tên địa phương" },
      { name: "nam", type: "integer", description: "Năm số liệu" },
      { name: "chi_so_ha_tang", type: "float", description: "Chỉ số hạ tầng số" },
      { name: "chi_so_du_lieu", type: "float", description: "Chỉ số dữ liệu số" },
      { name: "chi_so_dich_vu", type: "float", description: "Chỉ số dịch vụ số" },
    ],
    coverImage: img("field-chuyen-doi-so"),
    downloadCount: 2_745,
    requestCount: 0,
    issuedDaysAgo: 75,
  },
  {
    slug: "anh-tai-lieu-hanh-chinh-ocr",
    title: "Bộ ảnh tài liệu, biểu mẫu hành chính đã gán nhãn (OCR)",
    summary: "65.000 ảnh chụp, ảnh quét tài liệu và biểu mẫu hành chính được gán nhãn vùng văn bản, trường thông tin.",
    description: html([
      "Ảnh được tạo từ biểu mẫu trắng và dữ liệu giả lập, không chứa thông tin cá nhân thật. Mỗi ảnh có nhãn hộp bao vùng văn bản, nội dung chữ và loại trường.",
      "Phục vụ huấn luyện mô hình nhận dạng ký tự quang học, trích xuất thông tin từ hồ sơ số hóa.",
    ]),
    field: "du-lieu",
    license: "Giấy phép dữ liệu nghiên cứu NIDIT-R 1.0",
    accessLevel: "registered",
    formats: ["JPG", "JSON"],
    sizeLabel: "27 GB",
    recordCount: 65_000,
    language: "Tiếng Việt",
    updateFrequency: "Không định kỳ",
    version: "1.0",
    keywords: ["OCR", "số hóa", "biểu mẫu", "thị giác máy tính"],
    aiTasks: ["Nhận dạng ký tự quang học", "Trích xuất thông tin"],
    conditions: REGISTERED_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã ảnh" },
      { name: "tep_anh", type: "string", description: "Đường dẫn tệp ảnh" },
      { name: "loai_van_ban", type: "string", description: "Loại tài liệu" },
      { name: "so_vung", type: "integer", description: "Số vùng văn bản được gán nhãn" },
      { name: "ngay_gan_nhan", type: "date", description: "Ngày gán nhãn" },
    ],
    coverImage: img("du-lieu-gan-nhan"),
    downloadCount: 734,
    requestCount: 39,
    issuedDaysAgo: 160,
  },
  {
    slug: "anh-y-te-an-danh",
    title: "Bộ dữ liệu ảnh X-quang ngực ẩn danh phục vụ nghiên cứu",
    summary: "24.000 ảnh X-quang ngực đã ẩn danh, có nhãn của bác sĩ chẩn đoán hình ảnh; chỉ cung cấp cho nghiên cứu được phê duyệt.",
    description: html([
      "Dữ liệu được xây dựng trong khuôn khổ đề tài ứng dụng AI hỗ trợ sàng lọc hình ảnh y tế tại tuyến cơ sở. Toàn bộ thông tin định danh trong tệp ảnh và siêu dữ liệu đã được loại bỏ.",
      "Do tính chất nhạy cảm, dữ liệu chỉ được khai thác trong môi trường tính toán có kiểm soát của Viện.",
    ]),
    field: "du-lieu",
    license: "Thỏa thuận sử dụng dữ liệu (DUA)",
    accessLevel: "restricted",
    formats: ["DICOM", "CSV"],
    sizeLabel: "210 GB",
    recordCount: 24_000,
    language: "Không áp dụng",
    updateFrequency: "Không định kỳ",
    version: "1.0",
    keywords: ["y tế", "X-quang", "ảnh y tế", "ẩn danh"],
    aiTasks: ["Phân loại ảnh", "Phát hiện bất thường"],
    conditions: RESTRICTED_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã ảnh" },
      { name: "nhan_chan_doan", type: "string", description: "Nhãn chẩn đoán" },
      { name: "nam_chup", type: "integer", description: "Năm chụp" },
    ],
    coverImage: img("y-te-so"),
    downloadCount: 0,
    requestCount: 23,
    issuedDaysAgo: 330,
  },
  {
    slug: "nhat-ky-su-co-an-toan-thong-tin",
    title: "Bộ dữ liệu nhật ký sự cố an toàn thông tin (ẩn danh)",
    summary: "Nhật ký sự cố, cảnh báo an toàn thông tin đã ẩn danh, phục vụ nghiên cứu phát hiện bất thường và phân loại sự cố.",
    description: html([
      "Dữ liệu tổng hợp từ các đợt diễn tập và hệ thống thử nghiệm của Viện, đã loại bỏ địa chỉ, định danh hệ thống thật.",
      "Phù hợp nghiên cứu phát hiện xâm nhập, phân loại mức độ nghiêm trọng và tự động hóa ứng cứu sự cố.",
    ]),
    field: "danh-gia-kiem-dinh",
    license: "Thỏa thuận sử dụng dữ liệu (DUA)",
    accessLevel: "restricted",
    formats: ["JSON", "CSV"],
    sizeLabel: "9,4 GB",
    recordCount: 2_600_000,
    language: "Tiếng Việt, Tiếng Anh",
    updateFrequency: "Hằng quý",
    version: "0.9",
    keywords: ["an toàn thông tin", "sự cố", "phát hiện bất thường"],
    aiTasks: ["Phát hiện bất thường", "Phân loại sự cố"],
    conditions: RESTRICTED_CONDITIONS,
    columns: [
      { name: "id", type: "string", description: "Mã sự kiện" },
      { name: "thoi_gian", type: "datetime", description: "Thời điểm ghi nhận" },
      { name: "loai_su_co", type: "string", description: "Loại sự cố" },
      { name: "muc_do", type: "string", description: "Mức độ nghiêm trọng" },
    ],
    coverImage: img("news-an-toan-thong-tin"),
    downloadCount: 0,
    requestCount: 12,
    issuedDaysAgo: 45,
  },
];

type ServiceSeed = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  field: string;
  standards: string[];
  process: ProcessStepJson[];
  deliverables: string[];
  targetAudience: string[];
  turnaround: string;
  feeNote: string;
  icon: string;
};

const STEPS = (specific: string): ProcessStepJson[] => [
  { title: "Tiếp nhận yêu cầu", description: "Đơn vị gửi phiếu đăng ký trực tuyến hoặc công văn đề nghị; Viện phản hồi trong 02 ngày làm việc." },
  { title: "Khảo sát, thống nhất phạm vi", description: "Hai bên thống nhất phạm vi, tiêu chí, kế hoạch và hồ sơ cần cung cấp." },
  { title: "Thực hiện đánh giá", description: specific },
  { title: "Báo cáo, khuyến nghị", description: "Viện bàn giao báo cáo kết quả, khuyến nghị khắc phục và hỗ trợ đánh giá lại khi có yêu cầu." },
];

export const SERVICES: ServiceSeed[] = [
  {
    slug: "danh-gia-muc-do-chuyen-doi-so",
    name: "Đánh giá mức độ chuyển đổi số của cơ quan, tổ chức",
    summary: "Đo lường mức độ trưởng thành chuyển đổi số theo bộ chỉ số, chỉ ra khoảng trống và đề xuất lộ trình ưu tiên.",
    description: html([
      "Dịch vụ giúp cơ quan, tổ chức xác định hiện trạng chuyển đổi số trên các trụ cột: thể chế, hạ tầng, dữ liệu, nền tảng, nhân lực và hiệu quả phục vụ; so sánh với mức chuẩn và đề xuất lộ trình cải thiện.",
    ]),
    field: "chuyen-doi-so",
    standards: ["Bộ chỉ số đánh giá chuyển đổi số do cơ quan có thẩm quyền ban hành", "Khung kiến trúc Chính phủ số Việt Nam"],
    process: STEPS("Thu thập số liệu, phỏng vấn, khảo sát người dùng; tính toán chỉ số và đối chiếu bằng chứng."),
    deliverables: ["Báo cáo đánh giá mức độ chuyển đổi số", "Bảng điểm chỉ số thành phần", "Đề xuất lộ trình ưu tiên 12–24 tháng"],
    targetAudience: ["Bộ, ngành, địa phương", "Đơn vị sự nghiệp công lập", "Doanh nghiệp nhà nước"],
    turnaround: "20–30 ngày làm việc",
    feeNote: "Theo dự toán được thống nhất, căn cứ quy mô đơn vị.",
    icon: "bar-chart-3",
  },
  {
    slug: "thu-nghiem-chat-luong-phan-mem",
    name: "Thử nghiệm chất lượng phần mềm, nền tảng số",
    summary: "Kiểm thử chức năng, hiệu năng, khả năng tiếp cận và tính tương thích của phần mềm, cổng thông tin, nền tảng số.",
    description: html([
      "Viện thực hiện kiểm thử độc lập theo các đặc tính chất lượng sản phẩm phần mềm, phục vụ nghiệm thu, đưa vào sử dụng hoặc nâng cấp hệ thống. Kết quả có thể dùng làm căn cứ trong hồ sơ nghiệm thu dự án.",
    ]),
    field: "danh-gia-kiem-dinh",
    standards: ["TCVN ISO/IEC 25010 – Mô hình chất lượng sản phẩm phần mềm", "ISO/IEC/IEEE 29119 – Kiểm thử phần mềm", "WCAG 2.1 – Khả năng tiếp cận nội dung web"],
    process: STEPS("Xây dựng kịch bản kiểm thử, thực hiện kiểm thử chức năng, hiệu năng, tải và khả năng tiếp cận trên môi trường thử nghiệm."),
    deliverables: ["Kế hoạch và kịch bản kiểm thử", "Báo cáo kết quả kiểm thử", "Danh sách lỗi và mức độ ưu tiên khắc phục"],
    targetAudience: ["Chủ đầu tư dự án công nghệ thông tin", "Doanh nghiệp phát triển phần mềm"],
    turnaround: "10–25 ngày làm việc",
    feeNote: "Theo khối lượng kiểm thử và đơn giá hiện hành.",
    icon: "layers",
  },
  {
    slug: "danh-gia-mo-hinh-tri-tue-nhan-tao",
    name: "Đánh giá, kiểm định mô hình trí tuệ nhân tạo",
    summary: "Đánh giá độ chính xác, độ bền vững, tính công bằng, khả năng giải thích và an toàn của mô hình AI trước khi triển khai.",
    description: html([
      "Dịch vụ áp dụng bộ công cụ đánh giá do Viện phát triển, kết hợp đánh giá tự động và đánh giá của chuyên gia, theo mức độ rủi ro của trường hợp sử dụng.",
      "Đặc biệt phù hợp với chatbot, trợ lý ảo, hệ thống hỗ trợ ra quyết định trong cơ quan nhà nước.",
    ]),
    field: "danh-gia-kiem-dinh",
    standards: ["ISO/IEC 42001:2023 – Hệ thống quản lý AI", "ISO/IEC 23894:2023 – Quản lý rủi ro AI", "NIST AI RMF 1.0"],
    process: STEPS("Phân loại rủi ro, chạy bộ kiểm thử tự động (độ chính xác, thiên lệch, tấn công đối kháng, rò rỉ dữ liệu) và đánh giá chuyên gia."),
    deliverables: ["Báo cáo đánh giá mô hình theo tiêu chí", "Hồ sơ rủi ro và biện pháp giảm thiểu", "Khuyến nghị giám sát sau triển khai"],
    targetAudience: ["Cơ quan nhà nước triển khai AI", "Doanh nghiệp cung cấp giải pháp AI"],
    turnaround: "15–30 ngày làm việc",
    feeNote: "Theo mức độ phức tạp của mô hình và phạm vi đánh giá.",
    icon: "brain",
  },
  {
    slug: "danh-gia-an-toan-thong-tin",
    name: "Đánh giá an toàn thông tin hệ thống",
    summary: "Kiểm tra, đánh giá lỗ hổng và mức độ tuân thủ yêu cầu bảo đảm an toàn hệ thống thông tin theo cấp độ.",
    description: html([
      "Viện thực hiện rà soát cấu hình, kiểm tra lỗ hổng, đánh giá mức độ tuân thủ yêu cầu an toàn theo cấp độ hệ thống và đề xuất biện pháp khắc phục.",
    ]),
    field: "danh-gia-kiem-dinh",
    standards: ["TCVN 11930 – Yêu cầu cơ bản về an toàn hệ thống thông tin theo cấp độ", "TCVN ISO/IEC 27001 – Hệ thống quản lý an toàn thông tin", "OWASP ASVS 4.0"],
    process: STEPS("Rà soát hồ sơ, cấu hình; kiểm tra lỗ hổng ứng dụng và hạ tầng trong phạm vi được cho phép."),
    deliverables: ["Báo cáo đánh giá an toàn thông tin", "Danh sách lỗ hổng theo mức độ nghiêm trọng", "Kế hoạch khắc phục đề xuất"],
    targetAudience: ["Đơn vị vận hành hệ thống thông tin", "Chủ đầu tư dự án"],
    turnaround: "10–20 ngày làm việc",
    feeNote: "Theo quy mô hệ thống và cấp độ an toàn.",
    icon: "lock",
  },
  {
    slug: "danh-gia-chat-luong-du-lieu",
    name: "Đánh giá chất lượng dữ liệu",
    summary: "Đánh giá tính đầy đủ, chính xác, nhất quán, kịp thời của cơ sở dữ liệu; đề xuất quy trình làm sạch, chuẩn hóa.",
    description: html([
      "Dịch vụ giúp chủ quản cơ sở dữ liệu nắm được chất lượng dữ liệu hiện tại, nguyên nhân sai lệch và giải pháp nâng cao chất lượng trước khi chia sẻ, kết nối hoặc dùng để huấn luyện mô hình AI.",
    ]),
    field: "du-lieu",
    standards: ["ISO/IEC 25012 – Mô hình chất lượng dữ liệu", "ISO 8000 – Chất lượng dữ liệu"],
    process: STEPS("Lập hồ sơ dữ liệu (data profiling), đo các chỉ số chất lượng theo tiêu chí đã thống nhất, phân tích nguyên nhân."),
    deliverables: ["Báo cáo chất lượng dữ liệu", "Bộ quy tắc kiểm tra dữ liệu", "Đề xuất quy trình làm sạch, chuẩn hóa"],
    targetAudience: ["Chủ quản cơ sở dữ liệu", "Đơn vị xây dựng dữ liệu huấn luyện AI"],
    turnaround: "15–25 ngày làm việc",
    feeNote: "Theo khối lượng dữ liệu và số tiêu chí đánh giá.",
    icon: "database",
  },
];
