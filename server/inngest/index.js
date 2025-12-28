import cookieParser from "cookie-parser";
app.use(cookieParser());
app.use("/api/auth", authRoutes);
