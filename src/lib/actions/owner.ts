"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, requireOwner } from "@/lib/auth";
import { setStaffCreatedFlash } from "@/lib/staff-created-flash";
import { createStaffMember } from "@/lib/staff-provision";
import { MAX_ACTION_GUIDELINES } from "@/lib/guideline-limits";
import {
  levelFromTotalChecks,
  parseLevelThresholdsFromForm,
  validateLevelThresholds,
} from "@/lib/guideline-level";
import { parseJobTitleValue } from "@/lib/job-title";
import { parseMonthParam } from "@/lib/month";
import { startOfMonth } from "date-fns";

export async function updateStoreAction(formData: FormData) {
  const session = await requireOwner();

  await prisma.store.update({
    where: { id: session.storeId },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      statementTitle: String(formData.get("statementTitle") ?? "").trim(),
      statement: String(formData.get("statement") ?? "").trim(),
      pdfUrl: String(formData.get("pdfUrl") ?? "").trim() || null,
    },
  });

  revalidatePath("/owner");
  revalidatePath("/staff");
  redirect("/owner?saved=1");
}

export async function saveLevelThresholdsAction(formData: FormData) {
  const session = await requireOwner();
  const thresholds = parseLevelThresholdsFromForm(formData);
  const error = validateLevelThresholds(thresholds);
  if (error) {
    redirect(`/owner?levels_error=${encodeURIComponent(error)}`);
  }

  await prisma.store.update({
    where: { id: session.storeId },
    data: {
      level2MinChecks: thresholds.level2,
      level3MinChecks: thresholds.level3,
      level4MinChecks: thresholds.level4,
      level5MinChecks: thresholds.level5,
    },
  });

  const guidelines = await prisma.actionGuideline.findMany({
    where: { staff: { storeId: session.storeId }, isActive: true },
  });

  for (const g of guidelines) {
    const newLevel = levelFromTotalChecks(g.totalChecks, thresholds);
    if (newLevel !== g.level) {
      await prisma.actionGuideline.update({
        where: { id: g.id },
        data: { level: newLevel },
      });
    }
  }

  revalidatePath("/owner");
  revalidatePath("/staff");
  revalidatePath("/staff/settings");
  revalidatePath("/owner/staff");
  redirect("/owner?levels_saved=1");
}

export async function saveCheckAction(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");
  const checkName = String(formData.get("checkName") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 1);

  if (!checkName) {
    redirect("/owner/checks?error=name");
  }

  if (id) {
    await prisma.standardCheck.update({
      where: { id },
      data: { checkName, displayOrder },
    });
  } else {
    const count = await prisma.standardCheck.count({
      where: { storeId: session.storeId, isActive: true },
    });
    if (count >= 10) {
      redirect("/owner/checks?error=limit");
    }
    await prisma.standardCheck.create({
      data: {
        storeId: session.storeId,
        checkName,
        displayOrder,
        isActive: true,
      },
    });
  }

  revalidatePath("/owner/checks");
  revalidatePath("/staff");
}

export async function deleteCheckAction(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");

  const check = await prisma.standardCheck.findFirst({
    where: { id, storeId: session.storeId },
  });
  if (!check) return;

  await prisma.standardCheck.delete({ where: { id } });

  revalidatePath("/owner/checks");
  revalidatePath("/staff");
}

export async function saveRoleGuidelineAction(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const displayOrder = Number(formData.get("displayOrder") ?? 1);
  const jobTitle = parseJobTitleValue(String(formData.get("jobTitle") ?? ""));
  const tab = String(formData.get("tab") ?? "stylist");

  if (!title) {
    redirect(`/owner/checks?tab=${tab}&error=name`);
  }

  if (id) {
    await prisma.roleGuideline.update({
      where: { id },
      data: { title, displayOrder },
    });
  } else {
    const count = await prisma.roleGuideline.count({
      where: { storeId: session.storeId, jobTitle, isActive: true },
    });
    if (count >= 10) {
      redirect(`/owner/checks?tab=${tab}&error=limit`);
    }
    await prisma.roleGuideline.create({
      data: {
        storeId: session.storeId,
        jobTitle,
        title,
        displayOrder,
        isActive: true,
      },
    });
  }

  revalidatePath("/owner/checks");
  revalidatePath("/staff");
}

export async function deleteRoleGuidelineAction(formData: FormData) {
  const session = await requireOwner();
  const id = String(formData.get("id") ?? "");
  const tab = String(formData.get("tab") ?? "stylist");

  const item = await prisma.roleGuideline.findFirst({
    where: { id, storeId: session.storeId },
  });
  if (!item) return;

  await prisma.roleGuideline.delete({ where: { id } });

  revalidatePath("/owner/checks");
  revalidatePath("/staff");
  redirect(`/owner/checks?tab=${tab}`);
}

export async function updateStaffLevelAction(formData: FormData) {
  const session = await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");
  const goalNo = Number(formData.get("goalNo"));
  const newLevel = Number(formData.get("newLevel"));

  if (![1, 2, 3].includes(goalNo) || newLevel < 1 || newLevel > 5) return;

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) return;

  const levelField = `goal${goalNo}Level` as "goal1Level" | "goal2Level" | "goal3Level";
  const oldLevel = staff[levelField];

  if (oldLevel === newLevel) return;

  await prisma.$transaction([
    prisma.staff.update({
      where: { id: staffId },
      data: { [levelField]: newLevel },
    }),
    prisma.levelHistory.create({
      data: {
        staffId,
        goalNo,
        oldLevel,
        newLevel,
        changedBy: session.email,
      },
    }),
  ]);

  revalidatePath("/owner/staff");
  revalidatePath(`/owner/staff/${staffId}`);
}

export async function createStaffAction(formData: FormData) {
  const session = await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const jobTitle = parseJobTitleValue(String(formData.get("jobTitle") ?? ""));
  const result = await createStaffMember(session.storeId, {
    email,
    name,
    password,
    jobTitle,
  });
  if (!result.ok) {
    redirect(`/owner/staff?error=${result.reason}`);
  }

  await setStaffCreatedFlash({ email, password, name });

  revalidatePath("/owner/staff");
  redirect("/owner/staff?created=1");
}

export async function assignGuidelineToStaffAction(formData: FormData) {
  const session = await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const monthParam = String(formData.get("month") ?? "");

  if (!title) {
    redirect(`/owner/staff/${staffId}?month=${monthParam}&error=guideline_empty`);
  }

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) return;

  const count = await prisma.actionGuideline.count({
    where: { staffId, isActive: true },
  });
  if (count >= MAX_ACTION_GUIDELINES) {
    redirect(`/owner/staff/${staffId}?month=${monthParam}&error=guideline_limit`);
  }

  await prisma.actionGuideline.create({
    data: {
      staffId,
      title,
      displayOrder: count + 1,
    },
  });

  revalidatePath(`/owner/staff/${staffId}`);
  revalidatePath("/owner/staff");
  revalidatePath("/staff");
  revalidatePath("/staff/settings");
  redirect(`/owner/staff/${staffId}?month=${monthParam}&saved=1`);
}

export async function updateStaffEmailAction(formData: FormData) {
  const session = await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const monthParam = String(formData.get("month") ?? "");

  if (!staffId || !email) {
    redirect(`/owner/staff?month=${monthParam}&error=invalid`);
  }

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) {
    redirect(`/owner/staff?month=${monthParam}&error=staff`);
  }

  if (email !== staff.email) {
    const taken = await prisma.staff.findUnique({ where: { email } });
    if (taken) {
      redirect(`/owner/staff?month=${monthParam}&error=exists`);
    }
    await prisma.staff.update({
      where: { id: staffId },
      data: { email },
    });
  }

  revalidatePath("/owner/staff");
  redirect(`/owner/staff?month=${monthParam}&account_saved=1`);
}

export async function resetStaffPasswordByOwnerAction(formData: FormData) {
  const session = await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");
  const password = String(formData.get("password") ?? "");
  const monthParam = String(formData.get("month") ?? "");

  if (!staffId || password.length < 6) {
    redirect(`/owner/staff?month=${monthParam}&error=invalid`);
  }

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) {
    redirect(`/owner/staff?month=${monthParam}&error=staff`);
  }

  await prisma.staff.update({
    where: { id: staffId },
    data: { passwordHash: await hashPassword(password) },
  });

  await setStaffCreatedFlash({ email: staff.email, password, name: staff.name });

  revalidatePath("/owner/staff");
  redirect(`/owner/staff?month=${monthParam}&password_reset=1`);
}

export async function deleteStaffAction(formData: FormData) {
  const session = await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) return;

  await prisma.staff.delete({ where: { id: staffId } });

  revalidatePath("/owner/staff");
  redirect("/owner/staff?deleted=1");
}

export async function saveMeetingNoteAction(formData: FormData) {
  const session = await requireOwner();
  const staffId = String(formData.get("staffId") ?? "");
  const monthParam = String(formData.get("month") ?? "");
  const month = startOfMonth(parseMonthParam(monthParam));

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, storeId: session.storeId, role: "STAFF" },
  });
  if (!staff) return;

  await prisma.meetingNote.upsert({
    where: { staffId_month: { staffId, month } },
    create: {
      staffId,
      month,
      note: String(formData.get("note") ?? "").trim(),
      nextAction: String(formData.get("nextAction") ?? "").trim(),
    },
    update: {
      note: String(formData.get("note") ?? "").trim(),
      nextAction: String(formData.get("nextAction") ?? "").trim(),
    },
  });

  revalidatePath(`/owner/staff/${staffId}`);
  redirect(`/owner/staff/${staffId}?month=${monthParam}&saved=1`);
}

export async function updateGuidelineEvaluationAction(formData: FormData) {
  const session = await requireOwner();
  const guidelineId = String(formData.get("guidelineId") ?? "");
  const newLevel = Number(formData.get("evaluationLevel"));
  const monthParam = String(formData.get("month") ?? "");

  if (newLevel < 1 || newLevel > 5) return;

  const guideline = await prisma.actionGuideline.findFirst({
    where: { id: guidelineId, staff: { storeId: session.storeId } },
    include: { staff: true },
  });
  if (!guideline) return;

  const oldEval = guideline.ownerEvaluationLevel;

  if (oldEval !== null && newLevel < oldEval) {
    redirect(`/owner/staff/${guideline.staffId}?month=${monthParam}`);
    return;
  }

  if (oldEval === newLevel) {
    redirect(`/owner/staff/${guideline.staffId}?month=${monthParam}&saved=1`);
    return;
  }

  await prisma.$transaction([
    prisma.actionGuideline.update({
      where: { id: guidelineId },
      data: { ownerEvaluationLevel: newLevel },
    }),
    prisma.levelHistory.create({
      data: {
        staffId: guideline.staffId,
        goalNo: guideline.displayOrder,
        oldLevel: oldEval ?? guideline.level,
        newLevel,
        changedBy: `${session.email}（評価）`,
        guidelineId,
      },
    }),
  ]);

  revalidatePath(`/owner/staff/${guideline.staffId}`);
  redirect(`/owner/staff/${guideline.staffId}?month=${monthParam}&saved=1`);
}
