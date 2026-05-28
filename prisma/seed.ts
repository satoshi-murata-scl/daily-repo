import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/db";

async function main() {
  await prisma.reminderLog.deleteMany();
  await prisma.guidelineDailyCheck.deleteMany();
  await prisma.levelHistory.deleteMany();
  await prisma.dailyRecord.deleteMany();
  await prisma.businessTask.deleteMany();
  await prisma.actionGuideline.deleteMany();
  await prisma.standardCheck.deleteMany();
  await prisma.roleGuideline.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      storeCode: "STORE001",
      name: "サンプル株式会社 本社",
      mission:
        "お客様とチームの双方に誠実であり続け、小さな約束を積み重ねて信頼を育てる。",
      vision: "地域で最も信頼されるサロン・チームになる。",
      values: "誠実 · 感謝 · 成長 · チームワーク",
      pdfUrl: "https://example.com/branding.pdf",
      reminderEnabled: false,
      reminderTime: "21:00",
      appBaseUrl: "http://localhost:3000",
      maxStaff: 10,
    },
  });

  const passwordHash = await bcrypt.hash("demo1234", 10);

  await prisma.staff.create({
    data: {
      email: "owner@demo.local",
      passwordHash,
      name: "山田 オーナー",
      role: "OWNER",
      storeId: store.id,
    },
  });

  const companyGuidelines = [
    "関わる人が主役になる言動・行動を意識する",
    "報連相は結論ファーストで行う",
    "チームの成功を自分の成功と捉える",
  ];
  for (let i = 0; i < companyGuidelines.length; i++) {
    await prisma.standardCheck.create({
      data: {
        storeId: store.id,
        checkName: companyGuidelines[i]!,
        displayOrder: i + 1,
      },
    });
  }

  const stylistGuidelines = [
    "施術前にカウンセリング内容を声に出して確認する",
    "後輩のシャンプー技術を週1回見てフィードバックする",
  ];
  for (let i = 0; i < stylistGuidelines.length; i++) {
    await prisma.roleGuideline.create({
      data: {
        storeId: store.id,
        jobTitle: "STYLIST",
        title: stylistGuidelines[i]!,
        displayOrder: i + 1,
      },
    });
  }

  const staff = await prisma.staff.create({
    data: {
      email: "staff@demo.local",
      passwordHash,
      name: "佐藤 花子",
      role: "STAFF",
      jobTitle: "STYLIST",
      storeId: store.id,
      personalMission: "丁寧なコミュニケーションで、チームと顧客の信頼を高める",
      vision30Days: "報連相を迷わず行い、周囲から頼られる存在になっている",
      personalValues: "誠実・スピード・学び続ける",
      goal1Title: "3ヶ月後に報連相のロールモデルになる",
      goal1Desc: "迷わず共有し、周囲から頼られる状態",
      goal2Title: "デイレポを毎日記録し続ける",
      goal2Desc: "1日1回、行動指針と一言を残す",
    },
  });

  const guidelineTitles = [
    "出勤後15分以内に当日の優先タスクを3つ書き出す",
    "報告は結論ファーストで行う",
    "依頼には24時間以内に返信する",
  ];

  for (let i = 0; i < guidelineTitles.length; i++) {
    await prisma.actionGuideline.create({
      data: {
        staffId: staff.id,
        title: guidelineTitles[i]!,
        displayOrder: i + 1,
        totalChecks: i === 0 ? 10 : i === 1 ? 5 : 0,
        level: i === 0 ? 2 : 1,
      },
    });
  }

  await prisma.businessTask.create({
    data: {
      staffId: staff.id,
      title: "週次レポートのドラフト作成",
      isDaily: false,
      targetDate: new Date(),
    },
  });

  console.log("Seed completed.");
  console.log("Owner: owner@demo.local / demo1234");
  console.log("Staff: staff@demo.local / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
