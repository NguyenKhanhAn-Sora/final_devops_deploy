"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
const Image_1 = require("../../models/Image");
const Like_1 = require("../../models/Like");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
jest.setTimeout(30000);
describe("Like API", () => {
    const testUser = {
        name: "Test User",
        email: "testlike@example.com",
        password: "123456",
    };
    let accessToken;
    let testImageId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState === 0) {
            yield mongoose_1.default.connect(process.env.MONGO_URI, {});
        }
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Like_1.Like.deleteMany({});
        yield Image_1.Image.deleteMany({});
        yield User_1.User.deleteMany({ email: testUser.email });
        yield (0, supertest_1.default)(app_1.default).post("/api/auth/register").send(testUser);
        const loginRes = yield (0, supertest_1.default)(app_1.default)
            .post("/api/auth/login")
            .send({ email: testUser.email, password: testUser.password });
        accessToken = loginRes.body.accessToken;
        const user = yield User_1.User.findOne({ email: testUser.email });
        const testImage = new Image_1.Image({
            user: user === null || user === void 0 ? void 0 : user._id,
            imageUrl: "http://example.com/test.jpg",
            publicId: "test123",
            description: "Test image",
            visibility: "public",
            status: "approved",
        });
        const savedImage = yield testImage.save();
        testImageId = savedImage._id.toString();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
    }));
    it("should like an image", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/likes/${testImageId}`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("liked", true);
    }));
    it("should unlike an image when liked again", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.default)
            .post(`/api/likes/${testImageId}`)
            .set("Authorization", `Bearer ${accessToken}`);
        const res = yield (0, supertest_1.default)(app_1.default)
            .post(`/api/likes/${testImageId}`)
            .set("Authorization", `Bearer ${accessToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("liked", false);
    }));
});
