-- Extension hỗ trợ UUID (nếu cần tạo id = gen_random_uuid()::text trong DB)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
