import { html, img } from "./helpers";

export const SETTINGS = {
  id: 1,
  siteName: "Viện Công nghệ số và Chuyển đổi số quốc gia",
  siteNameEn: "National Institute of Digital Technology and Digital Transformation",
  shortName: "NIDIT",
  parentOrg: "Bộ Khoa học và Công nghệ",
  parentOrgEn: "Ministry of Science and Technology",
  parentPortalUrl: "https://mst.gov.vn",
  address: "Số 113 Trần Duy Hưng, phường Yên Hòa, thành phố Hà Nội",
  addressEn: "113 Tran Duy Hung Street, Yen Hoa Ward, Hanoi, Viet Nam",
  phone: "(024) 3943 6688",
  email: "vanphong@nidit.gov.vn",
  responsiblePerson: "Bà Nguyễn Thị Ngọc Trang",
  responsibleTitle: "Quyền Viện trưởng",
  copyrightNote: "© 2026 Viện Công nghệ số và Chuyển đổi số quốc gia. Ghi rõ nguồn khi phát hành lại thông tin từ Trang này.",
  workingHours: "Thứ Hai – Thứ Sáu: 8h00 – 17h00",
  mapEmbedUrl: null,
  facebookUrl: null,
  youtubeUrl: null,
  seoTitle: "Viện Công nghệ số và Chuyển đổi số quốc gia – NIDIT",
  seoDescription:
    "Trang thông tin điện tử của Viện Công nghệ số và Chuyển đổi số quốc gia (Bộ Khoa học và Công nghệ): tin tức, nghiên cứu, công bố khoa học, dữ liệu phục vụ AI, đánh giá – thử nghiệm – kiểm định, văn bản và thư viện.",
  seoKeywords: ["Viện Công nghệ số", "chuyển đổi số quốc gia", "trí tuệ nhân tạo", "dữ liệu phục vụ AI", "kiểm định", "NIDIT"],
  demoNotice:
    "Bản demo phục vụ trình bày báo giá. Logo, nội dung và thông tin liên hệ là dữ liệu mẫu, sẽ được thay bằng thông tin chính thức của Viện.",
};

/** Tài khoản mẫu (key dùng để tham chiếu trong dữ liệu khởi tạo) */
export const USERS = [
  { key: "nam", fullName: "Lê Hoàng Nam", email: "quantri@nidit.gov.vn", role: "admin", title: "Chuyên viên quản trị hệ thống", unit: "Văn phòng Viện", isActive: true },
  { key: "huong", fullName: "Nguyễn Thanh Hương", email: "duyetbai@nidit.gov.vn", role: "reviewer", title: "Chánh Văn phòng, Thư ký Hội đồng biên tập", unit: "Văn phòng Viện", isActive: true },
  { key: "ha", fullName: "Phạm Thu Hà", email: "bientap@nidit.gov.vn", role: "editor", title: "Biên tập viên", unit: "Văn phòng Viện", isActive: true },
  { key: "minh", fullName: "Đỗ Quang Minh", email: "minh.dq@nidit.gov.vn", role: "editor", title: "Nghiên cứu viên, cộng tác biên tập", unit: "Trung tâm Dữ liệu và Trí tuệ nhân tạo", isActive: true },
  { key: "duc", fullName: "Vũ Đức Anh", email: "anh.vd@nidit.gov.vn", role: "editor", title: "Cộng tác viên (đã tạm khóa)", unit: "Trung tâm Tư vấn và Đào tạo chuyển đổi số", isActive: false },
] as const;
export type UserKey = (typeof USERS)[number]["key"];

/** Chuyên mục tin bài 2 cấp */
export const CATEGORIES: { slug: string; name: string; nameEn: string; parent?: string; description: string; sortOrder: number }[] = [
  { slug: "tin-hoat-dong", name: "Tin hoạt động", nameEn: "Institute news", description: "Hoạt động nghiên cứu, hợp tác, đào tạo của Viện.", sortOrder: 1 },
  { slug: "hoat-dong-nghien-cuu", name: "Hoạt động nghiên cứu", nameEn: "Research activities", parent: "tin-hoat-dong", description: "Kết quả, tiến độ các nhiệm vụ khoa học và công nghệ.", sortOrder: 1 },
  { slug: "hop-tac", name: "Hợp tác trong nước và quốc tế", nameEn: "Cooperation", parent: "tin-hoat-dong", description: "Ký kết, làm việc với đối tác trong nước và quốc tế.", sortOrder: 2 },
  { slug: "dao-tao-tap-huan", name: "Đào tạo, tập huấn", nameEn: "Training", parent: "tin-hoat-dong", description: "Bồi dưỡng kỹ năng số, chuyên gia chuyển đổi số.", sortOrder: 3 },
  { slug: "tin-chuyen-nganh", name: "Tin chuyên ngành", nameEn: "Sector news", description: "Thông tin, phân tích về công nghệ số và chuyển đổi số.", sortOrder: 2 },
  { slug: "chuyen-doi-so", name: "Chuyển đổi số", nameEn: "Digital transformation", parent: "tin-chuyen-nganh", description: "Chính phủ số, kinh tế số, xã hội số.", sortOrder: 1 },
  { slug: "tri-tue-nhan-tao", name: "Trí tuệ nhân tạo", nameEn: "Artificial intelligence", parent: "tin-chuyen-nganh", description: "Nghiên cứu, ứng dụng và quản trị AI.", sortOrder: 2 },
  { slug: "du-lieu-so", name: "Dữ liệu số", nameEn: "Digital data", parent: "tin-chuyen-nganh", description: "Quản trị, chia sẻ và khai thác dữ liệu.", sortOrder: 3 },
  { slug: "su-kien-hoi-thao", name: "Sự kiện – Hội thảo", nameEn: "Events & conferences", description: "Hội thảo, diễn đàn, tọa đàm do Viện tổ chức hoặc tham gia.", sortOrder: 3 },
  { slug: "thong-bao", name: "Thông báo", nameEn: "Announcements", description: "Thông báo chính thức của Viện.", sortOrder: 4 },
];

type MenuSeed = { label: string; labelEn: string; url: string; newTab?: boolean; children?: MenuSeed[] };

export const MAIN_MENU: MenuSeed[] = [
  { label: "Trang chủ", labelEn: "Home", url: "/" },
  {
    label: "Giới thiệu",
    labelEn: "About",
    url: "/gioi-thieu",
    children: [
      { label: "Giới thiệu chung", labelEn: "Overview", url: "/gioi-thieu" },
      { label: "Chức năng, nhiệm vụ", labelEn: "Mandate", url: "/gioi-thieu/chuc-nang-nhiem-vu" },
      { label: "Cơ cấu tổ chức", labelEn: "Organisation", url: "/gioi-thieu/co-cau-to-chuc" },
      { label: "Lãnh đạo Viện", labelEn: "Leadership", url: "/gioi-thieu/lanh-dao" },
      { label: "Thông tin liên hệ, đầu mối", labelEn: "Contact points", url: "/lien-he" },
    ],
  },
  {
    label: "Tin tức",
    labelEn: "News",
    url: "/tin-tuc",
    children: [
      { label: "Tin hoạt động", labelEn: "Institute news", url: "/tin-tuc/chuyen-muc/tin-hoat-dong" },
      { label: "Tin chuyên ngành", labelEn: "Sector news", url: "/tin-tuc/chuyen-muc/tin-chuyen-nganh" },
      { label: "Sự kiện – Hội thảo", labelEn: "Events", url: "/tin-tuc/chuyen-muc/su-kien-hoi-thao" },
      { label: "Thông báo", labelEn: "Announcements", url: "/tin-tuc/chuyen-muc/thong-bao" },
    ],
  },
  {
    label: "Lĩnh vực",
    labelEn: "Fields",
    url: "/linh-vuc",
    children: [
      { label: "Công nghệ số", labelEn: "Digital technology", url: "/linh-vuc/cong-nghe-so" },
      { label: "Chuyển đổi số", labelEn: "Digital transformation", url: "/linh-vuc/chuyen-doi-so" },
      { label: "Dữ liệu", labelEn: "Data", url: "/linh-vuc/du-lieu" },
      { label: "Trí tuệ nhân tạo", labelEn: "Artificial intelligence", url: "/linh-vuc/tri-tue-nhan-tao" },
      { label: "Đánh giá – Thử nghiệm – Kiểm định", labelEn: "Evaluation & testing", url: "/linh-vuc/danh-gia-kiem-dinh" },
    ],
  },
  { label: "Nghiên cứu", labelEn: "Research", url: "/nghien-cuu" },
  { label: "Công bố", labelEn: "Publications", url: "/cong-bo-khoa-hoc" },
  { label: "Dữ liệu AI", labelEn: "AI data", url: "/du-lieu-ai" },
  { label: "Kiểm định", labelEn: "Testing", url: "/danh-gia-kiem-dinh" },
  { label: "Văn bản", labelEn: "Documents", url: "/van-ban" },
  { label: "Thư viện", labelEn: "Library", url: "/thu-vien" },
  { label: "Liên hệ", labelEn: "Contact", url: "/lien-he" },
];

export const FOOTER_MENU: MenuSeed[] = [
  { label: "Giới thiệu", labelEn: "About", url: "/gioi-thieu" },
  { label: "Điều khoản sử dụng", labelEn: "Terms of use", url: "/trang/dieu-khoan-su-dung" },
  { label: "Chính sách bảo vệ dữ liệu cá nhân", labelEn: "Privacy policy", url: "/trang/chinh-sach-bao-ve-du-lieu-ca-nhan" },
  { label: "Hướng dẫn khai thác dữ liệu", labelEn: "Data access guide", url: "/trang/huong-dan-khai-thac-du-lieu" },
  { label: "Liên hệ", labelEn: "Contact", url: "/lien-he" },
];

export const LINK_MENU: MenuSeed[] = [
  { label: "Bộ Khoa học và Công nghệ", labelEn: "Ministry of Science and Technology", url: "https://mst.gov.vn", newTab: true },
  { label: "Cổng Thông tin điện tử Chính phủ", labelEn: "Government portal", url: "https://chinhphu.vn", newTab: true },
  { label: "Cổng Dịch vụ công quốc gia", labelEn: "National public service portal", url: "https://dichvucong.gov.vn", newTab: true },
  { label: "Cơ sở dữ liệu quốc gia về văn bản pháp luật", labelEn: "National legal database", url: "https://vbpl.vn", newTab: true },
  { label: "Thông tấn xã Việt Nam", labelEn: "Vietnam News Agency", url: "https://vnanet.vn", newTab: true },
];

export const PAGES = [
  {
    slug: "gioi-thieu",
    title: "Giới thiệu chung",
    titleEn: "Overview",
    summary: "Viện Công nghệ số và Chuyển đổi số quốc gia – đơn vị nghiên cứu khoa học và công nghệ trực thuộc Bộ Khoa học và Công nghệ.",
    content: html([
      "<strong>Viện Công nghệ số và Chuyển đổi số quốc gia</strong> (tên tiếng Anh: National Institute of Digital Technology and Digital Transformation – NIDIT) là đơn vị sự nghiệp công lập trực thuộc Bộ Khoa học và Công nghệ, thực hiện nghiên cứu, phát triển và ứng dụng công nghệ số; tư vấn, hỗ trợ triển khai chuyển đổi số; phát triển dữ liệu, trí tuệ nhân tạo và cung cấp các dịch vụ đánh giá, thử nghiệm, kiểm định trong lĩnh vực công nghệ số.",
      { img: img("gioi-thieu-tru-so"), caption: "Trụ sở làm việc của Viện (ảnh minh họa)" },
      { h: "Tầm nhìn" },
      "Trở thành tổ chức nghiên cứu hàng đầu về công nghệ số và chuyển đổi số của Việt Nam; là đầu mối tin cậy cung cấp tri thức, dữ liệu, công cụ và giải pháp cho Chính phủ, các bộ, ngành, địa phương, doanh nghiệp và cộng đồng nghiên cứu.",
      { h: "Sứ mệnh" },
      {
        ul: [
          "Nghiên cứu, làm chủ và chuyển giao công nghệ số trọng điểm phục vụ phát triển kinh tế – xã hội.",
          "Cung cấp luận cứ khoa học, mô hình và bộ chỉ số phục vụ hoạch định, đánh giá chính sách chuyển đổi số.",
          "Xây dựng, chia sẻ dữ liệu và hạ tầng nghiên cứu phục vụ phát triển trí tuệ nhân tạo.",
          "Đánh giá, thử nghiệm, kiểm định độc lập, khách quan đối với sản phẩm, nền tảng và hệ thống số.",
        ],
      },
      { h: "Giá trị cốt lõi" },
      "<strong>Khoa học</strong> – lấy bằng chứng và phương pháp làm nền tảng; <strong>Tin cậy</strong> – độc lập, khách quan trong đánh giá; <strong>Mở</strong> – chia sẻ tri thức và dữ liệu theo quy định; <strong>Phụng sự</strong> – đặt lợi ích của người dân, doanh nghiệp và cơ quan nhà nước làm trung tâm.",
    ]),
    contentEn: html([
      "The <strong>National Institute of Digital Technology and Digital Transformation (NIDIT)</strong> is a public research institute under the Ministry of Science and Technology of Viet Nam. The Institute conducts research, development and application of digital technologies; advises on and supports digital transformation; develops data and artificial intelligence resources; and provides evaluation, testing and certification services in the digital technology field.",
      { img: img("gioi-thieu-tru-so"), caption: "The Institute's office building (illustrative photo)" },
      { h: "Vision" },
      "To become Viet Nam's leading research organisation in digital technology and digital transformation, and a trusted source of knowledge, data, tools and solutions for government, ministries, localities, businesses and the research community.",
      { h: "Mission" },
      {
        ul: [
          "Research, master and transfer key digital technologies for socio-economic development.",
          "Provide scientific evidence, models and indices for digital transformation policy making and evaluation.",
          "Build and share data and research infrastructure for artificial intelligence.",
          "Deliver independent, objective evaluation, testing and certification of digital products, platforms and systems.",
        ],
      },
    ]),
  },
  {
    slug: "chuc-nang-nhiem-vu",
    title: "Chức năng, nhiệm vụ",
    titleEn: "Functions and mandate",
    summary: "Chức năng, nhiệm vụ và quyền hạn của Viện Công nghệ số và Chuyển đổi số quốc gia.",
    content: html([
      { h: "Chức năng" },
      "Viện có chức năng nghiên cứu khoa học, phát triển công nghệ, tư vấn, đào tạo và cung cấp dịch vụ khoa học – công nghệ về công nghệ số, chuyển đổi số, dữ liệu số và trí tuệ nhân tạo; thực hiện đánh giá, thử nghiệm, kiểm định phục vụ quản lý nhà nước của Bộ Khoa học và Công nghệ.",
      { h: "Nhiệm vụ chủ yếu" },
      {
        ul: [
          "Nghiên cứu cơ bản định hướng ứng dụng và nghiên cứu ứng dụng về công nghệ số, nền tảng số, hạ tầng số.",
          "Nghiên cứu, đề xuất cơ chế, chính sách, mô hình, kiến trúc và bộ chỉ số đánh giá chuyển đổi số quốc gia.",
          "Xây dựng, quản lý và chia sẻ các bộ dữ liệu, hạ tầng tính toán phục vụ nghiên cứu, phát triển trí tuệ nhân tạo.",
          "Đánh giá, thử nghiệm, kiểm định chất lượng phần mềm, nền tảng số, mô hình trí tuệ nhân tạo và an toàn thông tin theo quy định.",
          "Tư vấn, hỗ trợ các bộ, ngành, địa phương và doanh nghiệp triển khai chuyển đổi số.",
          "Đào tạo, bồi dưỡng nguồn nhân lực số; tổ chức hội thảo, diễn đàn khoa học chuyên ngành.",
          "Hợp tác trong nước và quốc tế về nghiên cứu, chuyển giao công nghệ và phát triển nguồn nhân lực.",
          "Thực hiện các nhiệm vụ khác do Bộ trưởng Bộ Khoa học và Công nghệ giao.",
        ],
      },
      { h: "Quyền hạn" },
      "Viện có tư cách pháp nhân, con dấu và tài khoản riêng; được chủ trì, tham gia các nhiệm vụ khoa học và công nghệ các cấp; ký kết hợp đồng nghiên cứu, tư vấn, dịch vụ khoa học – công nghệ theo quy định của pháp luật.",
    ]),
    contentEn: html([
      { h: "Functions" },
      "The Institute conducts scientific research, technology development, consulting, training and science-technology services on digital technology, digital transformation, digital data and artificial intelligence, and carries out evaluation, testing and certification in support of the Ministry's state management functions.",
      { h: "Key tasks" },
      {
        ul: [
          "Application-oriented and applied research on digital technologies, platforms and infrastructure.",
          "Proposing policies, models, architectures and indices for national digital transformation.",
          "Building, managing and sharing datasets and compute infrastructure for AI research.",
          "Evaluating and testing software, digital platforms, AI models and information security.",
          "Advising ministries, localities and businesses on digital transformation.",
          "Training digital talent and organising scientific conferences.",
        ],
      },
    ]),
  },
  {
    slug: "huong-dan-khai-thac-du-lieu",
    title: "Hướng dẫn khai thác Danh mục dữ liệu phục vụ AI",
    titleEn: "Guide to accessing AI datasets",
    summary: "Quy trình tra cứu, đăng ký và sử dụng các bộ dữ liệu do Viện công bố.",
    content: html([
      "Danh mục dữ liệu phục vụ AI giới thiệu các bộ dữ liệu do Viện xây dựng hoặc được ủy quyền công bố. Mỗi bộ dữ liệu có thông tin mô tả (metadata) thống nhất: phạm vi, cấu trúc trường, định dạng, giấy phép, tần suất cập nhật và điều kiện khai thác.",
      { h: "1. Ba mức truy cập" },
      {
        ul: [
          "<strong>Mở</strong>: tải trực tiếp hoặc gọi API, không cần đăng ký; ghi nguồn khi sử dụng.",
          "<strong>Cần đăng ký</strong>: gửi phiếu đăng ký trực tuyến; Viện cấp thông tin truy cập qua email trong 03 ngày làm việc.",
          "<strong>Hạn chế</strong>: chỉ cung cấp cho mục đích nghiên cứu được phê duyệt, kèm cam kết bảo mật và thỏa thuận sử dụng dữ liệu.",
        ],
      },
      { h: "2. Phương thức kết nối" },
      "Tùy từng bộ dữ liệu, Viện cung cấp đường dẫn tải tệp, giao diện lập trình ứng dụng (API) hoặc vùng lưu trữ đối tượng (Object Storage) tương thích S3. Thông tin kết nối được hiển thị tại trang chi tiết của từng bộ dữ liệu.",
      { h: "3. Trách nhiệm của người sử dụng" },
      {
        ul: [
          "Sử dụng đúng mục đích đã đăng ký, tuân thủ giấy phép và quy định về bảo vệ dữ liệu cá nhân.",
          "Không tìm cách tái định danh dữ liệu đã được ẩn danh.",
          "Trích dẫn nguồn dữ liệu trong các công bố khoa học, sản phẩm có sử dụng dữ liệu.",
        ],
      },
      "Mọi vướng mắc xin liên hệ Trung tâm Dữ liệu và Trí tuệ nhân tạo qua email <a href=\"mailto:dulieu@nidit.gov.vn\">dulieu@nidit.gov.vn</a>.",
    ]),
    contentEn: null,
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản sử dụng",
    titleEn: "Terms of use",
    summary: "Quy định về việc sử dụng thông tin trên Trang thông tin điện tử của Viện.",
    content: html([
      "Trang thông tin điện tử của Viện Công nghệ số và Chuyển đổi số quốc gia cung cấp thông tin chính thức về tổ chức, hoạt động, kết quả nghiên cứu và dịch vụ của Viện.",
      { h: "Sử dụng thông tin" },
      "Tổ chức, cá nhân được trích dẫn, sử dụng lại thông tin trên Trang với điều kiện ghi rõ nguồn “Viện Công nghệ số và Chuyển đổi số quốc gia” và đường dẫn đến bài viết gốc. Các bộ dữ liệu, tài liệu có giấy phép riêng thực hiện theo giấy phép đó.",
      { h: "Liên kết ngoài" },
      "Trang có thể chứa liên kết đến website của cơ quan, tổ chức khác. Viện không chịu trách nhiệm về nội dung của các website này.",
      { h: "Góp ý, phản ánh" },
      "Mọi góp ý về nội dung Trang xin gửi qua mục <a href=\"/lien-he\">Liên hệ</a>.",
    ]),
    contentEn: null,
  },
  {
    slug: "chinh-sach-bao-ve-du-lieu-ca-nhan",
    title: "Chính sách bảo vệ dữ liệu cá nhân",
    titleEn: "Privacy policy",
    summary: "Cách Viện thu thập, sử dụng và bảo vệ dữ liệu cá nhân khi người dùng gửi liên hệ, đăng ký khai thác dữ liệu hoặc yêu cầu dịch vụ.",
    content: html([
      "Viện tôn trọng và bảo vệ dữ liệu cá nhân của người sử dụng theo quy định của pháp luật về bảo vệ dữ liệu cá nhân.",
      { h: "Dữ liệu được thu thập" },
      "Họ tên, email, số điện thoại, cơ quan/đơn vị và nội dung yêu cầu do người dùng tự nguyện cung cấp qua các biểu mẫu liên hệ, đăng ký khai thác dữ liệu, đăng ký đánh giá – kiểm định. Trang chỉ ghi nhận số liệu truy cập ở dạng thống kê, không lưu địa chỉ IP gốc.",
      { h: "Mục đích sử dụng" },
      "Dữ liệu chỉ được dùng để tiếp nhận, xử lý và phản hồi yêu cầu của người dùng; không cung cấp cho bên thứ ba khi chưa có sự đồng ý, trừ trường hợp pháp luật có quy định khác.",
      { h: "Quyền của chủ thể dữ liệu" },
      "Người dùng có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu cá nhân của mình bằng cách gửi email đến <a href=\"mailto:vanphong@nidit.gov.vn\">vanphong@nidit.gov.vn</a>.",
    ]),
    contentEn: null,
  },
  {
    slug: "quy-che-hoat-dong-trang-thong-tin",
    title: "Quy chế hoạt động Trang thông tin điện tử (dự thảo)",
    titleEn: null,
    summary: "Dự thảo quy chế quản lý, vận hành, cung cấp thông tin trên Trang.",
    content: html([
      "Dự thảo đang được Văn phòng Viện hoàn thiện, chưa công khai.",
      { h: "Phạm vi điều chỉnh" },
      "Quy chế quy định việc tổ chức quản lý, biên tập, phê duyệt, cung cấp thông tin và bảo đảm an toàn thông tin cho Trang thông tin điện tử của Viện.",
    ]),
    contentEn: null,
    status: "draft",
  },
];

export const ORG_UNITS = [
  { name: "Hội đồng Khoa học và Đào tạo", nameEn: "Scientific and Training Council", type: "council", headName: null, headTitle: "Chủ tịch Hội đồng: Viện trưởng", description: "Tư vấn cho Viện trưởng về định hướng, kế hoạch nghiên cứu khoa học, đào tạo và đánh giá kết quả nhiệm vụ khoa học và công nghệ.", tasks: ["Tư vấn chiến lược, kế hoạch khoa học và công nghệ", "Xét chọn, đánh giá nghiệm thu nhiệm vụ cấp cơ sở", "Tư vấn hợp tác và đào tạo"], email: null, phone: null, sortOrder: 1 },
  { name: "Văn phòng", nameEn: "Office", type: "office", headName: "Nguyễn Thanh Hương", headTitle: "Chánh Văn phòng", description: "Tham mưu tổng hợp, tổ chức – hành chính, truyền thông và quản trị Trang thông tin điện tử của Viện.", tasks: ["Tổng hợp, điều phối chương trình công tác", "Tổ chức cán bộ, hành chính, văn thư – lưu trữ", "Truyền thông, quản trị Trang thông tin điện tử"], email: "vanphong@nidit.gov.vn", phone: "(024) 3943 6688", sortOrder: 1 },
  { name: "Phòng Kế hoạch – Tài chính", nameEn: "Planning and Finance Division", type: "office", headName: null, headTitle: null, description: "Xây dựng kế hoạch, quản lý tài chính, tài sản và hợp đồng của Viện.", tasks: ["Lập và theo dõi kế hoạch năm", "Quản lý tài chính, kế toán, tài sản", "Quản lý hợp đồng dịch vụ khoa học – công nghệ"], email: "kehoach@nidit.gov.vn", phone: null, sortOrder: 2 },
  { name: "Phòng Quản lý khoa học và Hợp tác quốc tế", nameEn: "Science Management and International Cooperation Division", type: "office", headName: null, headTitle: null, description: "Quản lý nhiệm vụ khoa học và công nghệ, sở hữu trí tuệ, công bố khoa học và hợp tác quốc tế.", tasks: ["Quản lý đề tài, dự án các cấp", "Quản lý công bố, sở hữu trí tuệ", "Hợp tác trong nước và quốc tế"], email: "khoahoc@nidit.gov.vn", phone: null, sortOrder: 3 },
  { name: "Phòng Nghiên cứu Công nghệ số", nameEn: "Digital Technology Research Division", type: "department", headName: null, headTitle: null, description: "Nghiên cứu nền tảng số, kiến trúc hệ thống, điện toán đám mây, IoT và hạ tầng số.", tasks: ["Nghiên cứu kiến trúc, nền tảng số dùng chung", "Nghiên cứu IoT, điện toán biên, đám mây", "Chuẩn kết nối, liên thông hệ thống"], email: "congnghe@nidit.gov.vn", phone: null, sortOrder: 1 },
  { name: "Phòng Chiến lược và Chính sách chuyển đổi số", nameEn: "Digital Transformation Strategy and Policy Division", type: "department", headName: null, headTitle: null, description: "Nghiên cứu chiến lược, chính sách, mô hình và bộ chỉ số đánh giá chuyển đổi số.", tasks: ["Nghiên cứu chính sách chuyển đổi số", "Xây dựng bộ chỉ số, phương pháp đánh giá", "Theo dõi, phân tích xu hướng quốc tế"], email: "chinhsach@nidit.gov.vn", phone: null, sortOrder: 2 },
  { name: "Trung tâm Dữ liệu và Trí tuệ nhân tạo", nameEn: "Data and Artificial Intelligence Centre", type: "center", headName: null, headTitle: null, description: "Xây dựng, quản lý các bộ dữ liệu, hạ tầng tính toán; nghiên cứu, phát triển mô hình trí tuệ nhân tạo.", tasks: ["Quản lý Danh mục dữ liệu phục vụ AI", "Nghiên cứu xử lý ngôn ngữ tự nhiên tiếng Việt, thị giác máy tính", "Vận hành phòng thí nghiệm AI"], email: "dulieu@nidit.gov.vn", phone: null, sortOrder: 1 },
  { name: "Trung tâm Đánh giá, Thử nghiệm và Kiểm định", nameEn: "Evaluation, Testing and Certification Centre", type: "center", headName: null, headTitle: null, description: "Đánh giá, thử nghiệm, kiểm định phần mềm, nền tảng số, mô hình AI và an toàn thông tin.", tasks: ["Thử nghiệm chất lượng phần mềm, nền tảng số", "Đánh giá mô hình trí tuệ nhân tạo", "Đánh giá an toàn thông tin, chất lượng dữ liệu"], email: "kiemdinh@nidit.gov.vn", phone: null, sortOrder: 2 },
  { name: "Trung tâm Tư vấn và Đào tạo chuyển đổi số", nameEn: "Digital Transformation Consulting and Training Centre", type: "center", headName: null, headTitle: null, description: "Tư vấn triển khai chuyển đổi số; đào tạo, bồi dưỡng kỹ năng số và chuyên gia chuyển đổi số.", tasks: ["Tư vấn kiến trúc, lộ trình chuyển đổi số", "Bồi dưỡng kỹ năng số cho cán bộ, công chức", "Đào tạo chuyên gia chuyển đổi số"], email: "daotao@nidit.gov.vn", phone: null, sortOrder: 3 },
];

export const LEADERS = [
  {
    fullName: "Nguyễn Thị Ngọc Trang",
    position: "Quyền Viện trưởng",
    responsibilities: [
      "Phụ trách chung, chịu trách nhiệm trước Bộ trưởng về toàn bộ hoạt động của Viện",
      "Trực tiếp phụ trách công tác tổ chức cán bộ, kế hoạch – tài chính, thi đua – khen thưởng",
      "Người chịu trách nhiệm quản lý nội dung Trang thông tin điện tử",
    ],
    email: null,
    phone: null,
    bio: null,
    photoUrl: null,
    sortOrder: 1,
  },
  {
    fullName: "Trần Quốc Hưng",
    position: "Phó Viện trưởng",
    responsibilities: ["Phụ trách nghiên cứu công nghệ số, dữ liệu và trí tuệ nhân tạo", "Phụ trách Trung tâm Dữ liệu và Trí tuệ nhân tạo, Phòng Nghiên cứu Công nghệ số"],
    email: null,
    phone: null,
    bio: "Thông tin mẫu phục vụ trình diễn.",
    photoUrl: null,
    sortOrder: 2,
  },
  {
    fullName: "Lê Thị Minh Phương",
    position: "Phó Viện trưởng",
    responsibilities: ["Phụ trách đánh giá, thử nghiệm, kiểm định và hợp tác quốc tế", "Phụ trách Trung tâm Đánh giá, Thử nghiệm và Kiểm định, Phòng Quản lý khoa học và Hợp tác quốc tế"],
    email: null,
    phone: null,
    bio: "Thông tin mẫu phục vụ trình diễn.",
    photoUrl: null,
    sortOrder: 3,
  },
];
