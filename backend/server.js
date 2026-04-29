import app from "./src/app.js";
import connectDB from "./src/configs/db.js";

connectDB();

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

export default app;
