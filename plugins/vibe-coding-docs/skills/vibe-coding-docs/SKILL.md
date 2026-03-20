---
name: vibe-coding-docs
description: "Viết, tổ chức và refactor documentation cho dự án vibe coding sao cho cả người và AI agent (Cursor, Claude Code, v.v.) đều đọc và làm việc hiệu quả. Dùng skill này BẤT CỨ KHI NÀO người dùng muốn: tạo docs cho project mới, refactor docs cũ, hỏi \"AI không hiểu codebase của mình\", hỏi về cách viết context cho AI, hoặc nhắc đến \"documentation\", \"context cho AI\", \"vibe coding docs\", \"structured docs\", \"docs cho Cursor/Claude Code\". Trigger ngay cả khi người dùng chỉ nói \"giúp tao viết docs\", \"AI cứ trả lời sai\", hoặc \"cần document codebase\"."
---

# Vibe Coding Docs Skill

Skill này giúp tạo documentation có cấu trúc cho dự án vibe coding, được tối ưu để cả người lẫn AI agent (Cursor, Claude Code, Windsurf, v.v.) đều có thể navigate và extract thông tin chính xác.

## Core Philosophy

Documentation tốt cho AI không phải là viết nhiều — mà là viết có **structure dự đoán được**. LLM xử lý tokens thông qua attention weights: headings, tables, code blocks nhận attention cao hơn văn xuôi thông thường. Thông tin chôn trong paragraphs dài dễ bị AI bỏ sót hoặc trích xuất sai.

**Công thức phân domain:**
```
Domain = Responsibility × Change-frequency × Dependency-level
```

- **Responsibility**: Mỗi doc chỉ làm MỘT việc. Test: mô tả doc trong 1 câu không có chữ "và".
- **Change-frequency**: Những thứ thay đổi cùng nhau → ở cùng doc.
- **Dependency-level**: Số thứ tự thể hiện độ phụ thuộc. Số nhỏ = foundation, số lớn = surface.

---

## Workflow

### Bước 1: Inventory & Cluster

Trước tiên, hỏi người dùng (hoặc phân tích codebase nếu có) để lấy:
- Danh sách tất cả components/modules trong system
- Tech stack đang dùng
- Quy mô project (số files, số modules)

Sau đó cluster theo responsibility. Dùng 4 câu hỏi phân loại:

| Câu hỏi | Mục đích |
|---------|---------|
| **Change Q**: "Đổi X thì có phải đổi Y không?" | X và Y cùng doc nếu có |
| **Break Q**: "X hỏng thì gì hỏng theo?" | Xác định số thứ tự (càng nhiều → số nhỏ) |
| **Explain Q**: "Giải thích concept này trong 3 phút được không?" | Nếu không → chia nhỏ |
| **Find Q**: "Người cần tìm info này sẽ tìm ở đâu?" | Doc phải match mental model |

### Bước 2: Tạo cấu trúc file

Đặt tên file theo pattern: `NN-domain-name.md`

Ví dụ cấu trúc điển hình:
```
docs/
├── 00-architecture-overview.md   # Foundation, mọi thứ phụ thuộc vào đây
├── 01-[core-flow].md
├── 02-[main-worker].md
├── 03-[interface-layer].md
├── 04-[external-services].md
├── 05-[data-layer].md
├── 06-[storage].md
├── 07-[frontend].md
├── 08-[deployment].md
└── SITE.md                        # Index, liệt kê tất cả docs
```

Số thứ tự thể hiện dependency: 00 là foundation (phụ thuộc bởi nhiều thứ nhất), số lớn là surface.

### Bước 3: Viết từng doc theo skeleton

Mỗi doc PHẢI theo skeleton này (xem `references/doc-skeleton.md`):

```markdown
# NN-domain-name

{2-3 câu overview: đây là gì, tại sao nó tồn tại}

## System Diagram
{Mermaid diagram}

## 1. First Section
{Bảng cho config/data, không dùng văn xuôi}

## 2. Second Section
{...}

## File Reference
| File | Purpose |
|------|---------|

## Cross-References
| Doc | Relation |
|-----|----------|
```

**Quy tắc quan trọng:**
- Config values, parameters, routes → **luôn dùng table**, không chôn trong văn xuôi
- Mỗi doc giữ ở **800–1500 tokens** để vừa 1 RAG chunk
- Luôn có **Cross-References** để AI navigate được giữa các docs

### Bước 4: Tạo SITE.md (index)

SITE.md là bản đồ để AI biết tìm gì ở đâu. Xem template ở `references/site-template.md`.

### Bước 5: Validate

Checklist trước khi xong:
- [ ] Mỗi doc có overview 2-3 câu?
- [ ] Mỗi doc có Mermaid diagram?
- [ ] Config/data trong tables, không trong văn xuôi?
- [ ] Tất cả có File Reference?
- [ ] Tất cả có Cross-References?
- [ ] SITE.md đã được cập nhật?
- [ ] Mỗi doc có mô tả được trong 1 câu không có chữ "và"?

---

## Anti-patterns cần tránh

| Anti-pattern | Vấn đề | Giải pháp |
|-------------|--------|-----------|
| Tổ chức theo file type (models.md, controllers.md) | Feature span nhiều file types, phải nhảy qua lại | Tổ chức theo domain/responsibility |
| Sắp xếp alphabet | Không có learning path | Sắp xếp theo dependency level |
| Một mega-doc (README.md chứa tất cả) | Không chunk được, không tìm được | Tách thành nhiều docs nhỏ |
| Quá nhiều văn xuôi | AI khó extract, tốn tokens | Dùng tables cho structured data |
| Không có Cross-References | Mỗi doc là hòn đảo | Luôn link đến related docs |

---

## Khi nào đọc reference files

- Cần template đầy đủ cho một doc → đọc `references/doc-skeleton.md`
- Cần tạo SITE.md index → đọc `references/site-template.md`
- Cần ví dụ doc hoàn chỉnh → đọc `references/example-doc.md`
- Cần hiểu tại sao table tốt hơn văn xuôi (để giải thích cho user) → đọc `references/why-structure.md`
