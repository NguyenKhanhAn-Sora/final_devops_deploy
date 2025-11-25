import request from "supertest";
import app from "../../app";
import mongoose from "mongoose";
import { User } from "../../models/User";
import { Image } from "../../models/Image";
import dotenv from "dotenv";
dotenv.config();

jest.setTimeout(30000);

describe("Image API", () => {
  const testUser = {
    name: "Test User",
    email: "testimage@example.com",
    password: "123456",
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!, {});
    }
  });

  beforeEach(async () => {
    await User.deleteMany({ email: testUser.email });
    await Image.deleteMany({});

    await request(app).post("/api/auth/register").send(testUser);
    const user = await User.findOne({ email: testUser.email });

    const image1 = new Image({
      user: user?._id,
      imageUrl: "https://res.cloudinary.com/dsjpjawiz/image/upload/v1764077281/myImages/acpao1ou9cqkzdvnqcpx.jpg",
      publicId: "myImages/acpao1ou9cqkzdvnqcpx",
      description: "This is my car of Khanh An",
      visibility: "public",
      status: "approved",
    });
    await Promise.all([
      image1.save()
    ]);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should get only public approved images", async () => {
    const res = await request(app).get("/api/images/public");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("image");
    expect(Array.isArray(res.body.images)).toBe(true);
    expect(res.body.images.length).toBe(1);

    res.body.images.forEach((img: any) => {
      expect(img.visibility).toBe("public");
      expect(img.status).toBe("approved");
    });
  });
});
