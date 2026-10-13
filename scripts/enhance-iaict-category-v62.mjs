import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = "artifacts/nidit-portal/dist/public/iaict-portal";
const marker = "iaict-category-v62";

const pages = {
  "giai-phap-dich-vu": {
    signals: [
      ["START", "Bài toán & dữ liệu", "Khảo sát hiện trạng, quy trình, dữ liệu sẵn có và tiêu chí thành công."],
      ["DESIGN", "Kiến trúc phù hợp", "So sánh phương án, chọn mô hình tích hợp và mức đầu tư phù hợp điều kiện vận hành."],
      ["PROVE", "PoC / thử nghiệm", "Kiểm chứng nhanh trong phạm vi nhỏ, đo bằng tiêu chí đã thống nhất trước triển khai rộng."],
      ["RUN", "Tích hợp & vận hành", "Bàn giao, giám sát, hỗ trợ và mở rộng sau khi giải pháp đi vào sử dụng."],
    ],
    cards: [
      ["Tư vấn chuyển đổi số","DISCOVERY","Đánh giá hiện trạng, mục tiêu và lộ trình thực hiện.","Không bắt đầu bằng danh sách công nghệ. Trọng tâm là nhận diện điểm nghẽn trong quy trình, dữ liệu và cách phối hợp để xác định phần việc cần ưu tiên trước.",["Rà soát quy trình, hệ thống và nguồn dữ liệu hiện có","Xác định mục tiêu, mức ưu tiên và tiêu chí đo kết quả","Xây dựng lộ trình theo giai đoạn, nguồn lực và khả năng tiếp nhận"],"Báo cáo hiện trạng · danh mục ưu tiên · lộ trình triển khai","Tổ chức cần xác định hướng đi trước khi đầu tư hệ thống",["Roadmap","Assessment","Governance"]],
      ["Tư vấn giải pháp công nghệ","ARCHITECTURE","Lựa chọn kiến trúc và phương án phù hợp bài toán.","IAICT đặt các phương án công nghệ vào cùng một bài toán vận hành để so sánh về độ phù hợp, chi phí tích hợp, khả năng mở rộng và mức độ đơn vị có thể làm chủ.",["Làm rõ yêu cầu chức năng, dữ liệu và hạ tầng","So sánh phương án kiến trúc và mức độ tích hợp","Đề xuất cấu hình phù hợp với điều kiện triển khai thực tế"],"Phương án kiến trúc · phạm vi kỹ thuật · khuyến nghị triển khai","Bài toán đã rõ nhưng cần lựa chọn cách triển khai phù hợp",["Architecture","Fit-for-purpose","Integration"]],
      ["Thiết kế hệ thống","SYSTEM DESIGN","Thiết kế kiến trúc, dữ liệu, tích hợp và vận hành.","Thiết kế đồng thời lớp ứng dụng, dữ liệu, tích hợp và vận hành để hệ thống không chỉ chạy được ở giai đoạn đầu mà còn có thể bảo trì và mở rộng về sau.",["Thiết kế kiến trúc ứng dụng, dữ liệu và API","Xác định phân quyền, luồng xử lý và điểm tích hợp","Chuẩn hóa yêu cầu vận hành, giám sát và sao lưu"],"Sơ đồ kiến trúc · mô hình dữ liệu · đặc tả tích hợp","Dự án cần nền móng kỹ thuật rõ trước khi phát triển",["Data","API","Operations"]],
      ["AI & Dữ liệu","INTELLIGENCE","Thiết kế luồng dữ liệu và ứng dụng AI có kiểm soát.","AI chỉ tạo giá trị khi dữ liệu và quy trình sử dụng được tổ chức đúng. IAICT ưu tiên chuẩn hóa nguồn dữ liệu trước, sau đó mới chọn cách phân tích hoặc ứng dụng mô hình phù hợp.",["Tổ chức nguồn dữ liệu và luồng xử lý có kiểm soát","Thiết kế bài toán AI bám sát nghiệp vụ và người dùng","Đặt tiêu chí kiểm tra, phản hồi và giám sát đầu ra"],"Luồng dữ liệu · nguyên mẫu AI · tiêu chí đánh giá","Khai thác dữ liệu để hỗ trợ công việc và ra quyết định",["AI","Data","Responsible use"]],
      ["IoT & Tự động hóa","FIELD SYSTEMS","Kết nối thiết bị, dữ liệu hiện trường và quy trình.","Từ thiết bị hiện trường đến cơ sở dữ liệu phải là một chuỗi liên tục. Thiết kế tập trung vào khả năng thu dữ liệu ổn định, truyền dẫn phù hợp và vận hành trong điều kiện thực tế.",["Lựa chọn cảm biến, gateway, nguồn và kết nối","Thiết kế luồng dữ liệu từ hiện trường về server","Tích hợp cảnh báo, giám sát và quy trình phản hồi"],"Kiến trúc IoT · cấu hình kết nối · luồng dữ liệu hiện trường","Quan trắc, giám sát và thu thập dữ liệu tự động",["IoT","Sensor","Automation"]],
      ["Phần mềm theo yêu cầu","APPLICATION","Phát triển ứng dụng phục vụ quy trình nghiệp vụ cụ thể.","Phần mềm được thiết kế từ quy trình nghiệp vụ và vai trò người dùng thay vì ép đơn vị thay đổi cách làm chỉ để phù hợp với một sản phẩm đóng gói sẵn.",["Phân tích luồng công việc và nhóm người dùng","Thiết kế chức năng, dữ liệu và trải nghiệm sử dụng","Chuẩn bị khả năng tích hợp với hệ thống hiện có"],"Ứng dụng web/mobile · quy trình số · tài liệu sử dụng","Quy trình nghiệp vụ đặc thù cần số hóa hoặc tối ưu",["Web/App","Workflow","UX"]],
      ["Tích hợp & Vận hành","OPERATIONS","Kết nối hệ thống, chuyển giao và hỗ trợ vận hành.","Một hệ thống chỉ hoàn thành khi dữ liệu đi đúng luồng, các nền tảng trao đổi được với nhau và đơn vị tiếp nhận có đủ công cụ để theo dõi, xử lý sự cố và vận hành thường xuyên.",["Kết nối API, dữ liệu và các hệ thống liên quan","Thiết lập giám sát, sao lưu và cơ chế cảnh báo","Bàn giao cấu hình, tài liệu và hỗ trợ sau triển khai"],"Kết nối tích hợp · bộ tài liệu vận hành · cơ chế hỗ trợ","Đưa hệ thống vào sử dụng ổn định và có thể làm chủ",["Integration","Monitoring","Operations"]],
    ],
  },
  "san-pham-nen-tang": {
    signals: [
      ["FIELD","IoT & thiết bị","Cảm biến, gateway, nguồn điện và kết nối dữ liệu từ hiện trường."],
      ["CORE","Dữ liệu & dịch vụ","CSDL, API, phân quyền, lưu trữ và đồng bộ dữ liệu giữa các lớp hệ thống."],
      ["INTELLIGENCE","AI & phân tích","Phân tích, cảnh báo và AI theo bài toán nghiệp vụ, có kiểm soát dữ liệu đầu vào."],
      ["APPS","Ứng dụng nghiệp vụ","Dashboard, truy xuất, quản lý vòng đời và các quy trình số phục vụ người dùng cuối."],
    ],
    cards: [
      ["Nông – Lâm nghiệp thông minh","SMART SECTOR","Nền tảng số cho quản lý, giám sát và khai thác dữ liệu ngành.","Kết hợp dữ liệu hiện trường, thông tin đối tượng quản lý và các lớp ứng dụng để hình thành một không gian dữ liệu dùng chung cho giám sát, phân tích và tác nghiệp ngành.",["Theo dõi hiện trạng, vị trí và biến động đối tượng","Kết nối dữ liệu cảm biến, hồ sơ và hoạt động tác nghiệp","Tổng hợp dashboard và báo cáo phục vụ quản lý"],"Nền tảng quản lý · dữ liệu hiện trường · dashboard chuyên ngành","Nông nghiệp, lâm nghiệp và các mô hình quản lý theo địa bàn",["AgriTech","Forestry","Data"]],
      ["IoT & Quan trắc","FIELD DATA","Kết nối thiết bị, cảm biến và dữ liệu quan trắc.","Lớp IoT được thiết kế như hạ tầng tạo dữ liệu: cảm biến đo, gateway thu nhận, kết nối truyền về server và cơ chế theo dõi trạng thái thiết bị trong suốt quá trình vận hành.",["Kết nối cảm biến và thiết bị hiện trường","Truyền dữ liệu qua 4G/LAN hoặc kết nối phù hợp","Lưu trữ, giám sát và khai thác dữ liệu theo thời gian"],"Dữ liệu quan trắc · trạng thái thiết bị · API phục vụ ứng dụng","Môi trường, sản xuất, hạ tầng và các điểm cần giám sát từ xa",["Sensor","Gateway","IoT"]],
      ["Truy xuất nguồn gốc","TRACEABILITY","Quản lý thông tin nguồn gốc và chuỗi dữ liệu liên quan.","Mỗi đối tượng được gắn với một chuỗi thông tin có cấu trúc để người dùng có thể tra cứu nguồn gốc, quá trình hình thành và các mốc dữ liệu liên quan theo quyền được phép.",["Xác định dữ liệu cần ghi nhận theo từng công đoạn","Liên kết mã định danh với hồ sơ và lịch sử liên quan","Cung cấp giao diện tra cứu và cơ chế xác thực dữ liệu"],"Mã truy xuất · hồ sơ số · lịch sử chuỗi dữ liệu","Sản phẩm, vật tư, tài sản hoặc đối tượng cần chứng minh nguồn gốc",["Trace","QR/Data","History"]],
      ["Quản lý vòng đời","LIFECYCLE","Theo dõi đối tượng, tài sản hoặc sản phẩm theo vòng đời.","Theo dõi đối tượng từ khi khởi tạo đến khi thay đổi trạng thái, bảo trì, chuyển giao hoặc kết thúc sử dụng, giúp dữ liệu không bị đứt đoạn giữa các giai đoạn quản lý.",["Thiết lập trạng thái và mốc sự kiện theo vòng đời","Lưu lịch sử thay đổi, người thực hiện và tài liệu liên quan","Tổng hợp dữ liệu phục vụ kiểm tra và phân tích"],"Hồ sơ vòng đời · lịch sử sự kiện · báo cáo trạng thái","Tài sản, sản phẩm, thiết bị và đối tượng quản lý dài hạn",["Lifecycle","Asset","Audit trail"]],
      ["AI & Dữ liệu","INTELLIGENCE","Khai thác dữ liệu và ứng dụng AI theo bài toán cụ thể.","Dữ liệu được chuẩn hóa và tổ chức thành các lớp có thể tìm kiếm, phân tích và kết nối với công cụ AI để hỗ trợ tổng hợp, cảnh báo, tra cứu hoặc ra quyết định theo ngữ cảnh.",["Chuẩn hóa và tổ chức dữ liệu từ nhiều nguồn","Xây dựng lớp phân tích, tìm kiếm và khai thác","Tích hợp AI theo kịch bản sử dụng cụ thể"],"Kho dữ liệu · dashboard phân tích · chức năng AI hỗ trợ","Đơn vị có dữ liệu nhưng chưa khai thác thành năng lực sử dụng",["AI","Analytics","Knowledge"]],
      ["Nền tảng/ứng dụng khác","EXTENSIBLE","Giải pháp có thể tùy biến và tích hợp theo yêu cầu.","Các module có thể được ghép thêm theo nhu cầu mới mà không phải thay toàn bộ nền tảng, ưu tiên API mở, cấu trúc dữ liệu rõ và khả năng tích hợp với hệ thống hiện hữu.",["Bổ sung module theo bài toán và nhóm người dùng","Kết nối API hoặc dữ liệu từ nền tảng bên ngoài","Tái sử dụng các lớp dữ liệu, xác thực và vận hành chung"],"Module mở rộng · API tích hợp · cấu hình dùng chung","Bài toán phát sinh cần mở rộng trên hạ tầng hiện có",["API","Modular","Extensible"]],
    ],
  },
  "chuyen-giao-cong-nghe": {
    signals: [
      ["01","Khảo sát","Xác định hiện trạng, điều kiện áp dụng và tiêu chí tiếp nhận."],
      ["02","Thử nghiệm","PoC hoặc mô hình kiểm chứng với phạm vi và chỉ số đánh giá rõ ràng."],
      ["03","Hoàn thiện","Điều chỉnh cấu hình, quy trình và tài liệu dựa trên kết quả thử nghiệm."],
      ["04–05","Chuyển giao & đồng hành","Đào tạo, bàn giao vận hành, hỗ trợ sau tiếp nhận và mở rộng khi cần."],
    ],
    cards: [
      ["Khảo sát","DISCOVER","Làm rõ bài toán, hiện trạng và điều kiện ứng dụng.","Làm rõ điều kiện thực tế trước khi thử nghiệm để tránh mang một mô hình tốt trên giấy nhưng không phù hợp môi trường tiếp nhận.",["Hiện trạng kỹ thuật và quy trình","Nguồn lực và điều kiện vận hành","Mục tiêu và tiêu chí tiếp nhận"],"Baseline · phạm vi · tiêu chí đánh giá","Bước 01 / xác định đúng điểm xuất phát",["Scope","Baseline"]],
      ["Thử nghiệm","PROVE","Xây dựng mô hình thử nghiệm và tiêu chí đánh giá.","Thu hẹp phạm vi để kiểm chứng chức năng cốt lõi, chất lượng dữ liệu và khả năng vận hành trước khi đầu tư rộng hơn.",["PoC hoặc mô hình kiểm chứng","Kịch bản thử nghiệm thực tế","Ghi nhận kết quả và sai lệch"],"PoC · bằng chứng thử nghiệm · kết quả đánh giá","Bước 02 / chứng minh giải pháp hoạt động",["PoC","Evidence"]],
      ["Hoàn thiện","REFINE","Điều chỉnh giải pháp dựa trên bằng chứng thử nghiệm.","Dùng dữ liệu từ thử nghiệm để điều chỉnh cấu hình, quy trình và tài liệu nhằm đưa giải pháp từ trạng thái kiểm chứng sang trạng thái có thể sử dụng ổn định.",["Chốt cấu hình và luồng vận hành","Khắc phục vấn đề phát hiện khi thử nghiệm","Chuẩn hóa tài liệu và hướng dẫn"],"Phiên bản hoàn thiện · cấu hình chuẩn · tài liệu","Bước 03 / chuyển từ PoC sang vận hành",["Refine","Standardize"]],
      ["Chuyển giao","ENABLE","Bàn giao công nghệ, tài liệu và hướng dẫn vận hành.","Bàn giao không chỉ là source code hoặc thiết bị; đơn vị tiếp nhận cần hiểu cách vận hành, xử lý tình huống và duy trì hệ thống sau khi đội triển khai rút đi.",["Bàn giao cấu hình và tài liệu","Đào tạo nhóm tiếp nhận","Xác nhận khả năng vận hành độc lập"],"Bộ bàn giao · hướng dẫn · nội dung đào tạo","Bước 04 / tạo năng lực làm chủ",["Docs","Training"]],
      ["Đồng hành","SCALE","Hỗ trợ mở rộng, tích hợp và nâng cao năng lực sử dụng.","Sau bàn giao, IAICT có thể tiếp tục hỗ trợ khi đơn vị mở rộng phạm vi, tích hợp thêm hệ thống hoặc cần điều chỉnh theo điều kiện vận hành mới.",["Hỗ trợ sau tiếp nhận","Tối ưu dựa trên dữ liệu vận hành","Mở rộng module và điểm tích hợp"],"Hỗ trợ kỹ thuật · kế hoạch mở rộng · cập nhật cấu hình","Bước 05 / duy trì và mở rộng năng lực",["Support","Scale"]],
    ],
  },
  "dao-tao-tap-huan": {
    signals: [
      ["AUDIENCE","Theo đối tượng","Tách nhóm lãnh đạo, quản lý, chuyên viên và nhóm nghiệp vụ để chọn độ sâu phù hợp."],
      ["OUTCOME","Theo mục tiêu","Xác định năng lực đầu ra và tình huống cần áp dụng sau khóa học."],
      ["MODULE","Theo chuyên đề","Ghép module theo lĩnh vực, thời lượng và trình độ người học thay vì dùng một giáo án cố định."],
      ["FORMAT","Trực tiếp / trực tuyến","Tổ chức linh hoạt, kết hợp thực hành, tình huống và đánh giá đầu ra."],
    ],
    cards: [
      ["Theo đối tượng","AUDIENCE","Phân nhóm lãnh đạo, quản lý, chuyên viên và các nhóm nghiệp vụ để xác định đúng mức độ và tình huống học tập.","Cùng một chủ đề nhưng lãnh đạo, quản lý và chuyên viên cần mức độ khác nhau. Nội dung được phân tầng để mỗi nhóm học đúng phần gắn với vai trò của mình.",["Lãnh đạo và cán bộ quản lý","Chuyên viên, cán bộ nghiệp vụ","Nhóm chuyên môn theo lĩnh vực"],"Nhóm học viên · mức độ nội dung · tình huống phù hợp","Thiết kế chương trình theo vai trò và vị trí việc làm",["Role-based","Public sector","Professional"]],
      ["Theo mục tiêu","OUTCOME","Gắn mục tiêu học tập với năng lực cần áp dụng vào công việc thay vì chỉ truyền đạt kiến thức lý thuyết.","Mỗi chương trình xác định rõ học viên cần làm được gì sau khóa học, từ nhận biết, sử dụng công cụ đến áp dụng vào quy trình và tạo đầu ra cụ thể.",["Xác định năng lực đầu ra","Gắn bài học với tình huống công việc","Thiết kế bài thực hành hoặc sản phẩm cuối khóa"],"Chuẩn đầu ra · bài thực hành · tiêu chí đánh giá","Đào tạo để áp dụng, không chỉ truyền đạt kiến thức",["Outcome","Practice","Assessment"]],
      ["Theo module","CURRICULUM","Cấu trúc nội dung thành các module có thể kết hợp linh hoạt theo thời lượng, lĩnh vực và trình độ người học.","Nội dung được chia thành các module độc lập để có thể ghép theo thời lượng, lĩnh vực và trình độ thay vì buộc mọi đơn vị đi theo một chương trình cố định.",["Module nền tảng và module chuyên sâu","Điều chỉnh theo lĩnh vực và cấp quản lý","Kết hợp lý thuyết, tình huống và thực hành"],"Khung chương trình · module nội dung · tài liệu học","Chương trình linh hoạt nhưng vẫn có cấu trúc nhất quán",["Module","Flexible","Curriculum"]],
      ["Theo hình thức","DELIVERY","Tổ chức trực tiếp, trực tuyến hoặc kết hợp; có thể tích hợp thực hành, tình huống và đánh giá đầu ra.","Hình thức tổ chức được chọn theo quy mô, địa bàn, thời gian và mức độ cần thực hành để bảo đảm người học có thể tham gia và tiếp thu hiệu quả.",["Trực tiếp, trực tuyến hoặc kết hợp","Workshop, tình huống và thực hành hướng dẫn","Đánh giá đầu ra hoặc hỗ trợ sau khóa học"],"Kế hoạch tổ chức · học liệu · phương án đánh giá","Phù hợp điều kiện triển khai của từng đơn vị",["Hybrid","Workshop","Assessment"]],
    ],
  },
};

const css = `<style id="${marker}">
.v6-signals div{min-height:154px!important;padding:22px 22px 20px!important}.v6-signals div p{margin:9px 0 0;color:#758990;font-size:10px;line-height:1.55}.v6-card{display:flex!important;min-height:520px!important;flex-direction:column;padding:27px 27px 25px!important}.v6-card h3{margin:30px 0 10px!important;font-size:23px!important}.v6-card>p.v62-summary{min-height:0!important;margin:0;color:#647b83;font-size:12px;line-height:1.72}.v62-narrative{margin:11px 0 0;color:#405f69;font-size:11px;line-height:1.65}.v62-content{margin-top:18px;padding-top:16px;border-top:1px solid #dde8e5}.v62-block-label{display:block;margin-bottom:10px;color:#8a9ca1;font-size:7px;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.v62-points{display:grid;gap:7px;margin:0;padding:0;list-style:none}.v62-points li{position:relative;padding-left:15px;color:#405e68;font-size:10px;line-height:1.55}.v62-points li:before{content:"";position:absolute;left:0;top:.61em;width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 9%,transparent)}.v62-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}.v62-meta div{min-height:72px;padding:11px 12px;border:1px solid #dde8e5;border-radius:12px;background:rgba(255,255,255,.76)}.v62-meta small{display:block;color:#8a9da2;font-size:7px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.v62-meta strong{display:block;margin-top:6px;color:#31525d;font-size:9px;line-height:1.45}.v62-footer{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:auto;padding-top:18px}.v62-tags{display:flex;flex-wrap:wrap;gap:6px}.v62-tags span{padding:5px 8px;border-radius:999px;background:#fff;color:#70868d;box-shadow:inset 0 0 0 1px #dde8e5;font-size:8px;font-weight:800;letter-spacing:.035em}.v62-glyph{position:absolute;right:-10px;bottom:-28px;color:color-mix(in srgb,var(--accent) 5.5%,transparent);font-size:104px;font-weight:900;line-height:1;letter-spacing:-.08em;pointer-events:none}.v6-grid[data-sequential="true"] .v6-card{min-height:550px!important;padding:23px 20px!important}.v6-grid[data-sequential="true"] .v6-card h3{margin-top:34px!important;font-size:18px!important}.v6-grid[data-sequential="true"] .v62-summary{font-size:10.5px!important}.v6-grid[data-sequential="true"] .v62-narrative{font-size:9.5px}.v6-grid[data-sequential="true"] .v62-points li{font-size:9px}.v6-grid[data-sequential="true"] .v62-meta{grid-template-columns:1fr}.v6-grid[data-sequential="true"] .v62-meta div:nth-child(2){display:none}.v6-grid[data-sequential="true"] .v62-footer{display:block}.v6-grid[data-sequential="true"] .v62-tags{margin-bottom:10px}@media(max-width:1080px){.v6-grid[data-sequential="true"] .v6-card{min-height:500px!important}.v6-grid[data-sequential="true"] .v62-meta{grid-template-columns:1fr 1fr}.v6-grid[data-sequential="true"] .v62-meta div:nth-child(2){display:block}}@media(max-width:760px){.v6-signals div{min-height:0!important}.v6-card,.v6-grid[data-sequential="true"] .v6-card{min-height:0!important}.v62-meta,.v6-grid[data-sequential="true"] .v62-meta{grid-template-columns:1fr 1fr}}@media(max-width:520px){.v62-meta,.v6-grid[data-sequential="true"] .v62-meta{grid-template-columns:1fr}}
</style>`;

for (const [route, page] of Object.entries(pages)) {
  const path = join(root, route, "index.html");
  let html = await readFile(path, "utf8");
  if (!html.includes("iaict-category-v61")) throw new Error(`${route}: V6.1 marker not found`);
  if (html.includes(marker)) throw new Error(`${route}: V6.2 already applied`);
  html = html.replace("</head>", `${css}</head>`);

  let signalIndex = 0;
  html = html.replace(/<div><small>([^<]+)<\/small><strong>([^<]+)<\/strong><\/div>/g, (match) => {
    const detail = page.signals[signalIndex++];
    if (!detail) return match;
    return `<div><small>${detail[0]}</small><strong>${detail[1]}</strong><p>${detail[2]}</p></div>`;
  });

  let cardIndex = 0;
  html = html.replace(/<article class="v6-card">[\s\S]*?<\/article>/g, (match) => {
    const detail = page.cards[cardIndex];
    const current = cardIndex++;
    if (!detail) return match;
    const [title,label,summary,narrative,points,output,focus,tags] = detail;
    return `<article class="v6-card"><div class="v6-card-top"><span class="v6-index">${String(current + 1).padStart(2,"0")}</span><span class="v61-label">${label}</span><i class="v6-dot"></i></div><h3>${title}</h3><p class="v62-summary">${summary}</p><p class="v62-narrative">${narrative}</p><div class="v62-content"><span class="v62-block-label">Nội dung chính</span><ul class="v62-points">${points.map((point)=>`<li>${point}</li>`).join("")}</ul></div><div class="v62-meta"><div><small>Đầu ra</small><strong>${output}</strong></div><div><small>Trọng tâm</small><strong>${focus}</strong></div></div><div class="v62-footer"><div class="v62-tags">${tags.map((tag)=>`<span>${tag}</span>`).join("")}</div></div><span class="v62-glyph" aria-hidden="true">${String(current + 1).padStart(2,"0")}</span></article>`;
  });

  if (signalIndex !== page.signals.length) throw new Error(`${route}: expected ${page.signals.length} signals, found ${signalIndex}`);
  if (cardIndex !== page.cards.length) throw new Error(`${route}: expected ${page.cards.length} cards, found ${cardIndex}`);
  await writeFile(path, html, "utf8");
  console.log(`Enhanced ${route} with category content V6.2`);
}
