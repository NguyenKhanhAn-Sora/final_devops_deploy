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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
jest.setTimeout(30000);
describe("Image API", () => {
    const testUser = {
        name: "Test User",
        email: "testimage@example.com",
        password: "123456",
    };
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState === 0) {
            yield mongoose_1.default.connect(process.env.MONGO_URI, {});
        }
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.User.deleteMany({ email: testUser.email });
        yield Image_1.Image.deleteMany({});
        yield (0, supertest_1.default)(app_1.default).post("/api/auth/register").send(testUser);
        const user = yield User_1.User.findOne({ email: testUser.email });
        const image1 = new Image_1.Image({
            user: user === null || user === void 0 ? void 0 : user._id,
            imageUrl: "https://res.cloudinary.com/dsjpjawiz/image/upload/v1764077281/myImages/acpao1ou9cqkzdvnqcpx.jpg",
            publicId: "myImages/acpao1ou9cqkzdvnqcpx",
            description: "This is my car of Khanh An",
            visibility: "public",
            status: "approved",
        });
        yield Promise.all([
            image1.save()
        ]);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close();
    }));
    it("should get only public approved images", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/api/images/public");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("images");
        expect(Array.isArray(res.body.images)).toBe(true);
        expect(res.body.images.length).toBe(2);
        res.body.images.forEach((img) => {
            expect(img.visibility).toBe("public");
            expect(img.status).toBe("approved");
        });
    }));
});
