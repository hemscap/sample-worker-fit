import express from "express";
import { db } from "../utils/db.helper";
import _ from "lodash";
const router = express.Router();

interface AngelData {
  id: string;
  from: number;
  to: number;
  angels: Record<string, number>;
  poseId?: string;
  poseName?: string;
  conditionPoses?: any[]
}


router.post("/webhook", (req, res) => {
  try {
    const exerciseKey = req?.body?.exerciseKey;
    const data = req?.body?.data;

    // -------------------------------
    // Validate input
    // -------------------------------
    if (!exerciseKey || !data) {
      return res.status(400).render("error", {
        message: "Invalid webhook payload",
        error: null
      });
    }

    // -------------------------------
    // Save (UPSERT)
    // -------------------------------
    db.query(`
      INSERT INTO results (exercise_key, result)
      VALUES (?, ?)
      ON CONFLICT(exercise_key)
      DO UPDATE SET result = excluded.result
    `).run(
      exerciseKey,
      JSON.stringify(data, null, 2)
    );

    return res.redirect("/portal/get-my-exercises");

  } catch (err: any) {
    console.error("Webhook error:", err);

    return res.status(500).render("error", {
      message: "Failed to process webhook",
      error: err.message
    });
  }
});
router.get("/chart", (req, res) => {
  try {
    const key = req.query.metadata as string;

    if (!key) {
      return res.status(400).render("chart", {
        data: null,
        cycles: [],
        error: "Invalid key"
      });
    }

    // -------------------------------
    // Init fresh data
    // -------------------------------
    const data: {
      angles: Record<string, { x: number; y: number }[]>;
      distances: Record<string, { x: number; y: number }[]>;
    } = {
      angles: {},
      distances: {}
    };

    // -------------------------------
    // Fetch from DB
    // -------------------------------
    const result = db.query(
      `SELECT * FROM results 
       WHERE exercise_key = ? 
       ORDER BY id DESC 
       LIMIT 1`
    ).get(key) as any;

    if (!result) {
      return res.render("chart", {
        data: null,
        cycles: [],
        error: "No data found for this exercise"
      });
    }

    // -------------------------------
    // Safe JSON parse
    // -------------------------------
    let resjson: any;
    try {
      resjson = JSON.parse(result.result);
      console.log("Raw DB result:", JSON.stringify(resjson, null, 2));
    } catch (parseErr: any) {
      console.error("JSON parse error:", parseErr);

      return res.render("chart", {
        data: null,
        cycles: [],
        error: "Corrupted data format"
      });
    }

    // -------------------------------
    // Process timelines
    // -------------------------------
    (resjson.timelines as any[] || []).forEach((item) => {
      const { angels, conditionPoses } = item;

      // -------------------------------
      // angles ()
      // -------------------------------
      if (angels) {
        Object.entries(angels).forEach(([key, value]) => {
          if (typeof value !== "number") return;

          (data.angles[key] ??= []).push({
            x: item.from,
            y: value
          });
        });
      }

      // -------------------------------
      // distances ( percent)
      // -------------------------------
if (Array.isArray(conditionPoses)) {
  conditionPoses.forEach((pose: any) => {
    const label = pose?.label;

    // percent-based
    let value = pose?.data?.percent;

    // boolean-based
    if (value == null && typeof pose?.result === "boolean") {
      value = pose.result ? 100 : 0;
    }

    if (!label || value == null) return;

    (data.distances[label] ??= []).push({
      x: item.from,
      y: value
    });
  });
}
    });

    // -------------------------------
    // Build cycles safely
    // -------------------------------
    const cycles = (resjson.cycles || []).map((item: any, index: number) => {
      const start = item?.from;
      const end =
        item?.to ||
        item?.poses?.[item.poses.length - 1]?.to ||
        start;

      return [
        {
          name: `cycle ${index + 1}`,
          xAxis: start
        },
        {
          xAxis: end
        }
      ];
    });

    // -------------------------------
    // Render success
    // -------------------------------
    return res.render("chart", {
      data,
      cycles,
      error: null
    });

  } catch (err: any) {
    console.error("Chart error:", err);

    return res.status(500).render("chart", {
      data: null,
      cycles: [],
      error: "Something went wrong on server"
    });
  }
});

export default router;