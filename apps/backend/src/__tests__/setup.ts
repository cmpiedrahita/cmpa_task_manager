process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://cmpa_user:cmpa_password@localhost:5432/cmpa_db";
process.env.JWT_SECRET = "test_jwt_secret_minimum_32_chars_long";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_minimum_32_chars_long";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.CORS_ORIGIN = "http://localhost:5173";
