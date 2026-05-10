import type { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendError, sendSuccess } from "@/utils/apiresponse.js";

type TaskPriority = "low" | "medium" | "high";

interface GenerateTasksBody {
  prompt?: string;
  startDate?: string;
  targetDate?: string;
  dailyMinutes?: number;
}

interface GeneratedTaskDraft {
  title: string;
  description: string;
  priority: TaskPriority;
  status: "pending";
  dueDate: string;
}

const allowedPriorities = new Set<TaskPriority>(["low", "medium", "high"]);

const parseDateInput = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const toDateOnly = (date: Date) => date.toISOString().slice(0, 10);

const getTodayDate = () => {
  return new Date(`${toDateOnly(new Date())}T00:00:00.000Z`);
};

const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("AI response did not contain JSON");
    }

    return JSON.parse(match[0]);
  }
};

const readString = (value: unknown) => {
  return typeof value === "string" ? value.trim() : "";
};

const clampDate = (date: Date, startDate: Date, targetDate?: Date) => {
  if (date < startDate) {
    return startDate;
  }

  if (targetDate && date > targetDate) {
    return targetDate;
  }

  return date;
};

const normalizeTasks = (
  value: unknown,
  startDate: Date,
  targetDate?: Date
): GeneratedTaskDraft[] => {
  if (!value || typeof value !== "object" || !("tasks" in value)) {
    throw new Error("AI response is missing tasks");
  }

  const rawTasks = (value as { tasks: unknown }).tasks;
  if (!Array.isArray(rawTasks)) {
    throw new Error("AI response tasks must be an array");
  }

  const tasks = rawTasks.slice(0, 12).map((rawTask) => {
    if (!rawTask || typeof rawTask !== "object") {
      throw new Error("AI task item is invalid");
    }

    const task = rawTask as Record<string, unknown>;
    const title = readString(task.title);
    const description = readString(task.description);
    const rawPriority = readString(task.priority).toLowerCase();
    const priority = allowedPriorities.has(rawPriority as TaskPriority)
      ? (rawPriority as TaskPriority)
      : "medium";
    const dueDate = parseDateInput(readString(task.dueDate));

    if (!title || !dueDate) {
      throw new Error("AI task item is missing required fields");
    }

    return {
      title,
      description,
      priority,
      status: "pending" as const,
      dueDate: toDateOnly(clampDate(dueDate, startDate, targetDate)),
    };
  });

  if (tasks.length === 0) {
    throw new Error("AI response did not generate any tasks");
  }

  return tasks;
};

const buildPlannerPrompt = ({
  prompt,
  startDate,
  targetDate,
  dailyMinutes,
}: {
  prompt: string;
  startDate: Date;
  targetDate?: Date | undefined;
  dailyMinutes?: number | undefined;
}) => {
  const targetDateText = targetDate ? toDateOnly(targetDate) : "the next 7 days";
  const dailyMinutesText = dailyMinutes
    ? `${dailyMinutes} minutes per day`
    : "a realistic daily study load";

  return `
You are an AI study planner for a task management app.
Create a practical study plan from the learner's goal.

Learner goal:
${prompt}

Constraints:
- Start date: ${toDateOnly(startDate)}
- Target date: ${targetDateText}
- Available time: ${dailyMinutesText}
- Generate 4 to 8 tasks.
- Use the same language as the learner's goal.
- Each task must be concrete and actionable.
- Every task must use status "pending".
- priority must be exactly one of: "low", "medium", "high".
- dueDate must be formatted as YYYY-MM-DD.
- dueDate must not be before the start date.
- If a target date is provided, dueDate must not be after the target date.

Return JSON only in this exact shape:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low | medium | high",
      "status": "pending",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}
`.trim();
};

const genTasks = async (
  req: Request<{}, {}, GenerateTasksBody>,
  res: Response
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendError(res, "GEMINI_API_KEY is not configured", 500);
  }

  const prompt = req.body.prompt?.trim();
  if (!prompt) {
    return sendError(res, "Prompt is required", 400);
  }

  const startDate = parseDateInput(req.body.startDate) ?? getTodayDate();
  const targetDate = parseDateInput(req.body.targetDate);

  if (req.body.startDate && !parseDateInput(req.body.startDate)) {
    return sendError(res, "Invalid startDate", 400);
  }

  if (req.body.targetDate && !targetDate) {
    return sendError(res, "Invalid targetDate", 400);
  }

  if (targetDate && targetDate < startDate) {
    return sendError(res, "targetDate must be after startDate", 400);
  }

  const dailyMinutes =
    typeof req.body.dailyMinutes === "number" && req.body.dailyMinutes > 0
      ? req.body.dailyMinutes
      : undefined;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const result = await model.generateContent(
      buildPlannerPrompt({ prompt, startDate, targetDate, dailyMinutes })
    );
    const text = result.response.text();
    const parsed = extractJson(text);
    const tasks = normalizeTasks(parsed, startDate, targetDate);

    return sendSuccess(res, { tasks });
  } catch (error) {
    console.error("Error generating tasks:", error);
    return sendError(res, "AI generated malformed task data", 502);
  }
};

export default genTasks;
