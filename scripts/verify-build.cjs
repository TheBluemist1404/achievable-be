process.env.NODE_ENV ||= "test";
process.env.CLIENT_URL ||= "http://localhost:5173";
process.env.ACCESS_TOKEN_SECRET ||= "ci-only-access-token-secret-with-at-least-32-bytes";

require("../dist/app");

console.log("Compiled application loaded successfully");
